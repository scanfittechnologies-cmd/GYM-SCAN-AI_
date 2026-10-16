"""
GymScan AI - ONNX Export & Verification Script
===============================================
Reads:
  models/trained_model.pth       — state_dict only (weights_only=True safe)
  models/trained_model_meta.json — architecture metadata (plain JSON)

Writes:
  models/machine_classifier.onnx — matches recognitionConfig.js / server.js expectation

Output contract (DO NOT CHANGE):
  Input  : "input"   — float32 [1, 3, 224, 224]
  Output : "output"  — float32 [1, 50]   (raw logits, 50 classes)
  Opset  : 11
"""

import sys
import json
from pathlib import Path

try:
    import torch
    import torch.nn as nn
    from torchvision import models
except ImportError:
    torch = None
    nn = None
    models = None

PROJECT_ROOT    = Path(__file__).resolve().parent.parent
MAPPING_FILE    = PROJECT_ROOT / "models" / "class_mapping.json"
CHECKPOINT_PATH = PROJECT_ROOT / "models" / "trained_model.pth"       # state_dict only
META_PATH       = PROJECT_ROOT / "models" / "trained_model_meta.json" # plain JSON
ONNX_OUTPUT     = PROJECT_ROOT / "models" / "machine_classifier.onnx" # FIX 6: exact name


# ─────────────────────────────────────────────────────────────────────────────
# Main export
# ─────────────────────────────────────────────────────────────────────────────

def export_to_onnx():
    print("=" * 60)
    print("  GYM SCAN AI — ONNX Export & Verification Suite")
    print("=" * 60)

    # ── Verify dependencies ───────────────────────────────────────────────
    if torch is None or nn is None or models is None:
        print("[ERROR] PyTorch / torchvision not installed.")
        print("        pip install torch torchvision")
        sys.exit(1)

    # ── Verify class mapping ──────────────────────────────────────────────
    if not MAPPING_FILE.exists():
        print(f"[ERROR] class_mapping.json not found at {MAPPING_FILE}")
        sys.exit(1)

    with open(MAPPING_FILE, "r", encoding="utf-8") as f:
        mapping = json.load(f)

    num_classes = mapping.get("totalClasses", 0)
    if num_classes != 50:
        print(f"[ERROR] Expected 50 classes in class_mapping.json, found {num_classes}.")
        sys.exit(1)
    print(f"[OK] class_mapping.json verified — {num_classes} classes")

    # ── Verify trained_model_meta.json ────────────────────────────────────
    if not META_PATH.exists():
        print(f"\n[ERROR] Architecture metadata not found at:")
        print(f"        {META_PATH}")
        print("\n  Run training first:")
        print("  python python_pipeline/train_model.py --min-images 10")
        sys.exit(1)

    with open(META_PATH, "r", encoding="utf-8") as f:
        meta = json.load(f)

    architecture = meta.get("architecture", "efficientnet_b0")
    image_size   = meta.get("image_size",   224)
    meta_classes = meta.get("num_classes",  0)

    if meta_classes != 50:
        print(f"[ERROR] Metadata reports {meta_classes} classes, expected 50.")
        sys.exit(1)

    print(f"[OK] Metadata loaded — architecture: {architecture}, "
          f"image_size: {image_size}, classes: {meta_classes}")

    # ── Verify state_dict checkpoint ──────────────────────────────────────
    if not CHECKPOINT_PATH.exists():
        print(f"\n[ERROR] Trained model not found at:")
        print(f"        {CHECKPOINT_PATH}")
        print("\n  Run training first:")
        print("  python python_pipeline/train_model.py --min-images 10")
        sys.exit(1)

    print(f"[OK] Checkpoint found: {CHECKPOINT_PATH}")

    # ── Rebuild model on CPU ──────────────────────────────────────────────
    # ONNX export must be performed on CPU for maximum compatibility
    device = torch.device("cpu")

    if architecture == "efficientnet_b0":
        model = models.efficientnet_b0(weights=None)
        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_features, num_classes)
    elif architecture == "mobilenet_v3_large":
        model = models.mobilenet_v3_large(weights=None)
        in_features = model.classifier[3].in_features
        model.classifier[3] = nn.Linear(in_features, num_classes)
    else:
        print(f"[ERROR] Unknown architecture in metadata: {architecture!r}")
        sys.exit(1)

    # ── FIX 1 — Safe checkpoint load (weights_only=True) ─────────────────
    # trained_model.pth contains ONLY the state_dict (tensor values).
    # weights_only=True is safe here — no arbitrary Python objects.
    state_dict = torch.load(
        CHECKPOINT_PATH,
        map_location=device,
        weights_only=True,   # FIX 1: safe on PyTorch 2.x
    )
    model.load_state_dict(state_dict)
    model.eval()

    # Verify model output dimension matches 50 classes
    with torch.no_grad():
        probe = model(torch.zeros(1, 3, image_size, image_size))
    if probe.shape != (1, 50):
        print(f"[ERROR] Model output shape is {probe.shape}, expected (1, 50).")
        sys.exit(1)

    print(f"[OK] Model weights loaded and verified — output shape: {probe.shape}")

    # ── FIX 6 — Export to ONNX (exact output contract) ───────────────────
    ONNX_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    dummy_input = torch.randn(1, 3, image_size, image_size)

    print(f"\n[Exporting] {architecture} → ONNX ...")
    print(f"  Output path  : {ONNX_OUTPUT}")
    print(f"  Input name   : input   shape: [1, 3, {image_size}, {image_size}]  dtype: float32")
    print(f"  Output name  : output  shape: [1, {num_classes}]                  dtype: float32 (raw logits)")
    print(f"  Opset        : 11")

    torch.onnx.export(
        model,
        dummy_input,
        str(ONNX_OUTPUT),
        export_params=True,
        opset_version=11,
        do_constant_folding=True,
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={
            "input":  {0: "batch_size"},
            "output": {0: "batch_size"},
        },
    )
    print("[OK] ONNX export complete.")

    # ── ONNX graph verification ───────────────────────────────────────────
    try:
        import onnx
        onnx_model = onnx.load(str(ONNX_OUTPUT))
        onnx.checker.check_model(onnx_model)
        file_mb = ONNX_OUTPUT.stat().st_size / (1024 * 1024)
        print(f"[OK] ONNX graph verified ({file_mb:.1f} MB)")
    except ImportError:
        print("[INFO] onnx package not installed — skipping graph verification.")
        print("       pip install onnx")

    # ── Parity check: PyTorch vs ONNX Runtime ────────────────────────────
    try:
        import onnxruntime as ort
        import numpy as np

        print("\n[Parity Check] PyTorch output vs ONNX Runtime output ...")
        test_np = np.random.randn(1, 3, image_size, image_size).astype(np.float32)
        test_pt = torch.from_numpy(test_np)

        with torch.no_grad():
            pt_out = model(test_pt).numpy()

        sess    = ort.InferenceSession(str(ONNX_OUTPUT))
        ort_out = sess.run(None, {"input": test_np})[0]

        max_diff = float(abs(pt_out - ort_out).max())
        print(f"  Max abs diff (PyTorch vs ONNX): {max_diff:.2e}")

        if max_diff < 1e-4:
            print("[OK] Parity check PASSED — outputs are numerically identical.")
        else:
            print(f"[WARNING] Diff {max_diff:.2e} exceeds 1e-4 — inspect before deploying.")

    except ImportError:
        print("[INFO] onnxruntime not installed — skipping parity check.")
        print("       pip install onnxruntime")

    # ── Final summary ─────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("  EXPORT SUMMARY")
    print("=" * 60)
    print(f"  ONNX file       : {ONNX_OUTPUT}")
    print(f"  Architecture    : {architecture}")
    print(f"  Classes         : {num_classes}  (matches class_mapping.json)")
    print(f"  Input name      : input")
    print(f"  Input shape     : [1, 3, {image_size}, {image_size}]  float32")
    print(f"  Output name     : output")
    print(f"  Output shape    : [1, {num_classes}]  float32  (raw logits)")
    print(f"  Opset           : 11")
    print("=" * 60)
    print("\n[DONE] Backend will auto-load this model on next server restart.")
    print("       Restart with: node server.js")


if __name__ == "__main__":
    export_to_onnx()
