"""
GymScan AI - EfficientNet-B0 Generalization Training Pipeline
=============================================================
Strategy : Two-phase transfer learning with data augmentation & stratified split
Model    : EfficientNet-B0 (ImageNet Pretrained)
Target   : 8 Prototype Gym Machine Classes
Output   : models/machine_classifier.onnx (and PyTorch checkpoints)
"""

import os
import sys
import json
import argparse
import random
import types
from pathlib import Path
from collections import defaultdict

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MAPPING_FILE = PROJECT_ROOT / "models" / "class_mapping.json"
DATASET_DIR  = PROJECT_ROOT / "dataset"
OUTPUT_DIR   = PROJECT_ROOT / "models"
ONNX_OUTPUT  = OUTPUT_DIR / "machine_classifier.onnx"

PROTO_CLASSES = sorted([
    "assisted-pull-up-machine",
    "hack-squat-machine",
    "incline-chest-press",
    "lat-pulldown",
    "leg-extension",
    "leg-press-45",
    "pec-deck-machine",
    "seated-cable-row",
])

# ─────────────────────────────────────────────────────────────────────────────
# Reproducibility
# ─────────────────────────────────────────────────────────────────────────────

def set_seed(seed: int = 42):
    random.seed(seed)
    try:
        import numpy as np
        np.random.seed(seed)
    except ImportError:
        pass
    try:
        import torch
        torch.manual_seed(seed)
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(seed)
    except ImportError:
        pass


# ─────────────────────────────────────────────────────────────────────────────
# Arguments
# ─────────────────────────────────────────────────────────────────────────────

def get_args():
    p = argparse.ArgumentParser(description="GymScan AI — Generalization Training Pipeline")

    p.add_argument("--architecture", type=str, default="efficientnet_b0",
                   choices=["efficientnet_b0", "mobilenet_v3_large"])
    p.add_argument("--image-size",   type=int,   default=224)
    p.add_argument("--seed",         type=int,   default=42)
    p.add_argument("--min-images",   type=int,   default=7)

    # Phase 1 — classifier head only, backbone frozen
    p.add_argument("--phase1-epochs", type=int,   default=20)
    p.add_argument("--phase1-lr",     type=float, default=1e-3)

    # Phase 2 — full fine-tune with differential LR (unfreezes final features & classifier)
    p.add_argument("--phase2-epochs", type=int,   default=35)
    p.add_argument("--phase2-cls-lr", type=float, default=1e-4)
    p.add_argument("--backbone-lr",   type=float, default=2e-5)

    p.add_argument("--batch-size",  type=int,   default=8)
    p.add_argument("--val-ratio",   type=float, default=0.2, help="Stratified validation split ratio")
    p.add_argument("--dry-run",     action="store_true")
    return p.parse_args()


# ─────────────────────────────────────────────────────────────────────────────
# Class Mapping Helper
# ─────────────────────────────────────────────────────────────────────────────

def save_or_verify_class_mapping():
    mapping = {
        "totalClasses": len(PROTO_CLASSES),
        "source": "prototype_8_class",
        "indexToClass": {str(i): {"machineId": c, "machineName": c.replace('-', ' ').title(), "category": "Gym Equipment"} for i, c in enumerate(PROTO_CLASSES)},
        "classToIndex": {c: i for i, c in enumerate(PROTO_CLASSES)}
    }
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(MAPPING_FILE, "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=2)
    print(f"[OK] Authoritative class mapping saved to {MAPPING_FILE} ({len(PROTO_CLASSES)} classes)")
    return mapping


# ─────────────────────────────────────────────────────────────────────────────
# Stratified Custom Dataset Builder
# ─────────────────────────────────────────────────────────────────────────────

def build_stratified_datasets(val_ratio=0.2, seed=42, train_transform=None, val_transform=None):
    from PIL import Image
    from torch.utils.data import Dataset

    IMG_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
    train_dir = DATASET_DIR / "train"

    train_samples = []
    val_samples = []

    rng = random.Random(seed)

    for class_idx, class_name in enumerate(PROTO_CLASSES):
        class_folder = train_dir / class_name
        if not class_folder.exists():
            print(f"[ERROR] Class folder missing: {class_folder}")
            sys.exit(1)

        imgs = sorted([f for f in class_folder.iterdir() if f.is_file() and f.suffix.lower() in IMG_EXTS])
        if not imgs:
            print(f"[ERROR] No images found for class: {class_name}")
            sys.exit(1)

        imgs_copy = list(imgs)
        rng.shuffle(imgs_copy)

        n_val = max(1, int(len(imgs_copy) * val_ratio))
        val_imgs = imgs_copy[:n_val]
        train_imgs = imgs_copy[n_val:]

        for path in train_imgs:
            train_samples.append((path, class_idx))
        for path in val_imgs:
            val_samples.append((path, class_idx))

    class GymDataset(Dataset):
        def __init__(self, samples, transform=None):
            self.samples = samples
            self.transform = transform

        def __len__(self):
            return len(self.samples)

        def __getitem__(self, idx):
            path, target = self.samples[idx]
            img = Image.open(path).convert("RGB")
            if self.transform:
                img = self.transform(img)
            return img, target

    return GymDataset(train_samples, train_transform), GymDataset(val_samples, val_transform), val_samples


# ─────────────────────────────────────────────────────────────────────────────
# Model Training Helpers
# ─────────────────────────────────────────────────────────────────────────────

def freeze_backbone(model):
    for param in model.features.parameters():
        param.requires_grad = False

def unfreeze_backbone(model):
    for param in model.features.parameters():
        param.requires_grad = True

def run_epoch(model, loader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0
    correct = 0
    total   = 0

    for inputs, labels in loader:
        inputs, labels = inputs.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(inputs)
        loss    = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * inputs.size(0)
        _, predicted = outputs.max(1)
        total   += labels.size(0)
        correct += predicted.eq(labels).sum().item()

    return running_loss / total, 100.0 * correct / total

def eval_per_class(model, loader, device):
    import torch
    model.eval()
    correct_per_class = defaultdict(int)
    total_per_class = defaultdict(int)
    total_correct = 0
    total_samples = 0

    with torch.no_grad():
        for inputs, labels in loader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            _, predicted = outputs.max(1)
            
            for p, t in zip(predicted, labels):
                p_item = p.item()
                t_item = t.item()
                if p_item == t_item:
                    correct_per_class[t_item] += 1
                    total_correct += 1
                total_per_class[t_item] += 1
                total_samples += 1

    overall_acc = (total_correct / total_samples) * 100.0 if total_samples > 0 else 0.0
    return overall_acc, correct_per_class, total_per_class

def export_to_onnx(model, image_size=224):
    import torch, numpy as np
    
    # Safe mock for Windows ml_dtypes export issue if present
    class SafeMockExt(types.ModuleType):
        def __getattr__(self, name):
            if name.startswith('__'): raise AttributeError(name)
            return np.float32
    sys.modules['ml_dtypes._ml_dtypes_ext'] = SafeMockExt('ml_dtypes._ml_dtypes_ext')

    print(f"\n[ONNX Export] Exporting trained model to: {ONNX_OUTPUT}")
    model.eval()
    model.to("cpu")
    dummy = torch.randn(1, 3, image_size, image_size)

    try:
        torch.onnx.export(
            model,
            dummy,
            str(ONNX_OUTPUT),
            export_params=True,
            opset_version=11,
            do_constant_folding=True,
            input_names=["input"],
            output_names=["output"],
            dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}},
            dynamo=False
        )
    except TypeError:
        torch.onnx.export(
            model,
            dummy,
            str(ONNX_OUTPUT),
            export_params=True,
            opset_version=11,
            do_constant_folding=True,
            input_names=["input"],
            output_names=["output"],
            dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}}
        )

    print(f"[OK] ONNX model exported successfully -> {ONNX_OUTPUT}")

    try:
        import onnx
        onnx_model = onnx.load(str(ONNX_OUTPUT))
        onnx.checker.check_model(onnx_model)
        size_mb = ONNX_OUTPUT.stat().st_size / (1024 * 1024)
        print(f"[OK] ONNX model graph verified ({size_mb:.2f} MB)")
        return True
    except ImportError:
        print("[INFO] onnx package not installed — skipping graph check")
        return True


# ─────────────────────────────────────────────────────────────────────────────
# Main Training Logic
# ─────────────────────────────────────────────────────────────────────────────

def train(args, mapping):
    import torch
    import torch.nn as nn
    from torch.utils.data import DataLoader
    from torchvision import transforms, models

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    print(f"\n{'='*60}")
    print(f"  GYM SCAN AI — GENERALIZATION TRAINING PIPELINE")
    print(f"{'='*60}")
    print(f"  Device        : {device}")
    print(f"  Architecture  : {args.architecture} (ImageNet Pretrained)")
    print(f"  Classes       : {len(PROTO_CLASSES)} (Alphabetical Order)")
    print(f"  Image Size    : {args.image_size}x{args.image_size}")
    print(f"  Batch Size    : {args.batch_size}")
    print(f"  Val Ratio     : {args.val_ratio:.0%} (Stratified)")
    print(f"{'='*60}\n")

    # ImageNet normalization standard
    IMG_MEAN = [0.485, 0.456, 0.406]
    IMG_STD  = [0.229, 0.224, 0.225]

    # Training Augmentations (Realistic & Generalizable)
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(args.image_size, scale=(0.7, 1.0)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=10),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize(IMG_MEAN, IMG_STD),
    ])

    # Validation/Test Preprocessing (Deterministic)
    val_transform = transforms.Compose([
        transforms.Resize((args.image_size, args.image_size)),
        transforms.ToTensor(),
        transforms.Normalize(IMG_MEAN, IMG_STD),
    ])

    train_ds, val_ds, val_samples = build_stratified_datasets(
        val_ratio=args.val_ratio, seed=args.seed,
        train_transform=train_transform, val_transform=val_transform
    )

    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True, num_workers=0, drop_last=False)
    val_loader   = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False, num_workers=0, drop_last=False)

    print(f"[DataLoader] Stratified Split: {len(train_ds)} train samples, {len(val_ds)} val samples")

    # EfficientNet-B0 initialized with ImageNet weights
    num_classes = len(PROTO_CLASSES)
    if args.architecture == "efficientnet_b0":
        model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_features, num_classes)
    else:
        model = models.mobilenet_v3_large(weights=models.MobileNet_V3_Large_Weights.DEFAULT)
        in_features = model.classifier[3].in_features
        model.classifier[3] = nn.Linear(in_features, num_classes)

    model = model.to(device)
    criterion = nn.CrossEntropyLoss()

    checkpoint_path = OUTPUT_DIR / "best_checkpoint.pth"

    best_val_acc = 0.0
    best_train_acc = 0.0
    best_epoch = 0

    # ─────────────────────────────────────────────────────────────────────────
    # Phase 1: Train Classifier Head Only
    # ─────────────────────────────────────────────────────────────────────────
    print(f"\n--- Phase 1: Training Classifier Head ({args.phase1_epochs} Epochs, LR={args.phase1_lr}) ---")
    freeze_backbone(model)

    optimizer_p1 = torch.optim.Adam(
        [p for p in model.parameters() if p.requires_grad],
        lr=args.phase1_lr, weight_decay=1e-4
    )
    scheduler_p1 = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer_p1, T_max=args.phase1_epochs)

    for epoch in range(1, args.phase1_epochs + 1):
        tr_loss, tr_acc = run_epoch(model, train_loader, criterion, optimizer_p1, device)
        scheduler_p1.step()
        val_acc, _, _ = eval_per_class(model, val_loader, device)

        is_best = val_acc > best_val_acc
        if is_best:
            best_val_acc = val_acc
            best_train_acc = tr_acc
            best_epoch = epoch
            torch.save(model.state_dict(), checkpoint_path)
            note = " <- BEST"
        else:
            note = ""

        print(f"P1 Epoch [{epoch:02d}/{args.phase1_epochs}] Loss: {tr_loss:.4f} | Train Acc: {tr_acc:5.1f}% | Val Acc: {val_acc:5.1f}%{note}")

    # ─────────────────────────────────────────────────────────────────────────
    # Phase 2: Unfreeze Backbone & Fine-Tune
    # ─────────────────────────────────────────────────────────────────────────
    print(f"\n--- Phase 2: Fine-Tuning Backbone + Head ({args.phase2_epochs} Epochs, Backbone LR={args.backbone_lr}, Head LR={args.phase2_cls_lr}) ---")
    if checkpoint_path.exists():
        model.load_state_dict(torch.load(checkpoint_path, map_location=device))

    unfreeze_backbone(model)

    optimizer_p2 = torch.optim.Adam([
        {"params": model.features.parameters(), "lr": args.backbone_lr, "weight_decay": 1e-4},
        {"params": model.classifier.parameters(), "lr": args.phase2_cls_lr, "weight_decay": 1e-4}
    ])
    scheduler_p2 = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer_p2, T_max=args.phase2_epochs)

    for epoch in range(1, args.phase2_epochs + 1):
        total_epoch_num = args.phase1_epochs + epoch
        tr_loss, tr_acc = run_epoch(model, train_loader, criterion, optimizer_p2, device)
        scheduler_p2.step()
        val_acc, _, _ = eval_per_class(model, val_loader, device)

        is_best = val_acc > best_val_acc
        if is_best:
            best_val_acc = val_acc
            best_train_acc = tr_acc
            best_epoch = total_epoch_num
            torch.save(model.state_dict(), checkpoint_path)
            note = " <- BEST"
        else:
            note = ""

        print(f"P2 Epoch [{epoch:02d}/{args.phase2_epochs}] (Total {total_epoch_num:02d}) Loss: {tr_loss:.4f} | Train Acc: {tr_acc:5.1f}% | Val Acc: {val_acc:5.1f}%{note}")

    # Load best checkpoint for evaluation & export
    if checkpoint_path.exists():
        model.load_state_dict(torch.load(checkpoint_path, map_location=device))

    final_val_acc, correct_pc, total_pc = eval_per_class(model, val_loader, device)

    print(f"\n{'='*60}")
    print(f"  TRAINING SUMMARY")
    print(f"{'='*60}")
    print(f"  Best Validation Accuracy : {best_val_acc:.2f}%")
    print(f"  Final/Best Train Accuracy: {best_train_acc:.2f}%")
    print(f"  Epochs Used (Total)      : {args.phase1_epochs + args.phase2_epochs} (Best Epoch: {best_epoch})")
    print(f"\n  --- Per-Class Validation Accuracy ---")
    for idx, class_name in enumerate(PROTO_CLASSES):
        c_corr = correct_pc[idx]
        c_tot  = total_pc[idx]
        c_acc  = (c_corr / c_tot * 100.0) if c_tot > 0 else 0.0
        print(f"    {class_name:<25}: {c_corr}/{c_tot} ({c_acc:5.1f}%)")
    print(f"{'='*60}\n")

    # Export to ONNX
    onnx_exported = export_to_onnx(model, args.image_size)

    return best_val_acc, best_train_acc, args.phase1_epochs + args.phase2_epochs, correct_pc, total_pc, onnx_exported


def main():
    args = get_args()
    set_seed(args.seed)

    mapping = save_or_verify_class_mapping()
    train(args, mapping)


if __name__ == "__main__":
    main()
