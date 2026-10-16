"""
Dataset Validation & Integrity Checker Script.
Verifies structure, image formats, integrity, class alignment, and flags potential data leakage.
"""

import os
import json
import hashlib
from pathlib import Path
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MAPPING_FILE = PROJECT_ROOT / "models" / "class_mapping.json"
DATASET_DIR = PROJECT_ROOT / "dataset"
OOD_DATASET_DIR = PROJECT_ROOT / "dataset_ood"

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def load_authoritative_classes():
    if not MAPPING_FILE.exists():
        print("[Validator Error] class_mapping.json missing. Running extractor first...")
        from extract_class_mapping import extract_machine_classes
        mapping = extract_machine_classes()
    else:
        with open(MAPPING_FILE, "r", encoding="utf-8") as f:
            mapping = json.load(f)
    return set(mapping["classToIdx"].keys()), mapping


def compute_file_hash(filepath):
    hasher = hashlib.md5()
    with open(filepath, "rb") as f:
        buf = f.read(65536)
        while len(buf) > 0:
            hasher.update(buf)
            buf = f.read(65536)
    return hasher.hexdigest()


def validate_dataset():
    print("=== GYM SCAN AI: DATASET VALIDATION REPORT ===\n")
    expected_classes, mapping = load_authoritative_classes()
    print(f"Authoritative machine classes count: {len(expected_classes)}")

    splits = ["train", "validation", "test"]
    split_counts = {s: {c: 0 for c in expected_classes} for s in splits}
    corrupted_files = []
    unsupported_files = []
    hash_to_locations = {}

    for split in splits:
        split_dir = DATASET_DIR / split
        if not split_dir.exists():
            print(f"[Warning] Split directory missing: {split_dir} (Will be created during collection)")
            split_dir.mkdir(parents=True, exist_ok=True)
            continue

        found_folders = {d.name for d in split_dir.iterdir() if d.is_dir()}
        
        # Check missing or unexpected folders
        missing = expected_classes - found_folders
        unexpected = found_folders - expected_classes

        if missing:
            print(f"[{split.upper()}] Missing class folders ({len(missing)}): {sorted(list(missing))[:5]}...")
        if unexpected:
            print(f"[{split.upper()}] UNEXPECTED class folders ({len(unexpected)}): {sorted(list(unexpected))}")

        # Scan images
        for class_id in expected_classes:
            class_dir = split_dir / class_id
            if not class_dir.exists():
                class_dir.mkdir(parents=True, exist_ok=True)
                continue

            for img_path in class_dir.glob("*"):
                if img_path.is_dir():
                    continue

                ext = img_path.suffix.lower()
                if ext not in SUPPORTED_EXTENSIONS:
                    unsupported_files.append(str(img_path))
                    continue

                # Verify image readability
                try:
                    with Image.open(img_path) as img:
                        img.verify()
                    split_counts[split][class_id] += 1
                except Exception as e:
                    corrupted_files.append((str(img_path), str(e)))
                    continue

                # Hash check for exact duplicate / data leakage detection
                file_hash = compute_file_hash(img_path)
                if file_hash not in hash_to_locations:
                    hash_to_locations[file_hash] = []
                hash_to_locations[file_hash].append((split, class_id, img_path.name))

    # Data Leakage & Duplicate Analysis
    cross_split_leakage = []
    same_split_duplicates = []

    for f_hash, locs in hash_to_locations.items():
        if len(locs) > 1:
            splits_involved = {l[0] for l in locs}
            if len(splits_involved) > 1:
                cross_split_leakage.append(locs)
            else:
                same_split_duplicates.append(locs)

    print("\n--- VALIDATION SUMMARY ---")
    for split in splits:
        total_imgs = sum(split_counts[split].values())
        empty_classes = sum(1 for c, cnt in split_counts[split].items() if cnt == 0)
        print(f"Split [{split.upper()}]: Total Images = {total_imgs} | Empty Classes = {empty_classes}/{len(expected_classes)}")

    if corrupted_files:
        print(f"\n[ALERT] Found {len(corrupted_files)} corrupted image files!")
    else:
        print("\n[OK] Image Integrity Check: Zero corrupted image files found.")

    if cross_split_leakage:
        print(f"\n[WARNING] DATA LEAKAGE DETECTED across train/val/test splits! ({len(cross_split_leakage)} identical images)")
    else:
        print("[OK] Data Leakage Check: No identical images shared across splits.")

    print("\nDataset validation completed successfully.")


if __name__ == "__main__":
    validate_dataset()
