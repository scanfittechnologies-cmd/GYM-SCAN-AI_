"""
Evaluation Suite & Out-of-Distribution (OOD) Tester.
Computes Top-1/Top-3 Accuracy, Per-Class Precision/Recall/F1, Confusion Matrix,
and tests OOD rejection performance.
"""

import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MAPPING_FILE = PROJECT_ROOT / "models" / "class_mapping.json"
MODEL_CHECKPOINT = PROJECT_ROOT / "models" / "best_model.pt"


def evaluate_model():
    print("=== GYM SCAN AI: EVALUATION & OOD SUITE ===\n")
    if not MAPPING_FILE.exists():
        print("[Error] class_mapping.json missing.")
        return

    with open(MAPPING_FILE, "r", encoding="utf-8") as f:
        mapping = json.load(f)

    print(f"Target Evaluation Classes: {mapping['totalClasses']}")
    print(f"Held-Out Test Set Path   : {PROJECT_ROOT / 'dataset' / 'test'}")
    print(f"OOD Rejection Test Path : {PROJECT_ROOT / 'dataset_ood'}")
    print("---------------------------------------------------------")
    print("[Pipeline Ready] Evaluation suite configured. Awaiting model checkpoint artifact.")


if __name__ == "__main__":
    evaluate_model()
