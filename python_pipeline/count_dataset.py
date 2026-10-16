"""
Read-Only Dataset Counter & Tracker Report Generator Script.
Reads 50 classes from models/class_mapping.json and reports actual filesystem image counts.
Updates dataset/DATASET_TRACKER.md.
"""

import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MAPPING_FILE = PROJECT_ROOT / "models" / "class_mapping.json"
DATASET_DIR = PROJECT_ROOT / "dataset"
TRACKER_FILE = PROJECT_ROOT / "dataset" / "DATASET_TRACKER.md"

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MIN_TARGET = 80
PREF_TARGET = 250


def count_dataset():
    print("=== GYM SCAN AI: DATASET COUNT & TRACKER SYSTEM ===\n")
    if not MAPPING_FILE.exists():
        print("[Error] class_mapping.json missing.")
        return

    with open(MAPPING_FILE, "r", encoding="utf-8") as f:
        mapping = json.load(f)

    index_to_class = mapping["indexToClass"]
    total_classes = len(index_to_class)

    splits = ["train", "validation", "test"]
    counts = {m_info["machineId"]: {"train": 0, "validation": 0, "test": 0, "total": 0, "info": m_info} for m_info in index_to_class.values()}

    for split in splits:
        split_dir = DATASET_DIR / split
        if not split_dir.exists():
            continue

        for m_id in counts.keys():
            class_dir = split_dir / m_id
            if not class_dir.exists():
                continue

            for file in class_dir.glob("*"):
                if file.is_file() and file.suffix.lower() in SUPPORTED_EXTENSIONS:
                    counts[m_id][split] += 1
                    counts[m_id]["total"] += 1

    total_train = sum(c["train"] for c in counts.values())
    total_val = sum(c["validation"] for c in counts.values())
    total_test = sum(c["test"] for c in counts.values())
    total_images = sum(c["total"] for c in counts.values())

    min_total_target = total_classes * MIN_TARGET
    pref_total_target = total_classes * PREF_TARGET

    not_started_count = sum(1 for c in counts.values() if c["total"] == 0)
    collecting_count = sum(1 for c in counts.values() if 1 <= c["total"] < MIN_TARGET)
    min_reached_count = sum(1 for c in counts.values() if MIN_TARGET <= c["total"] < PREF_TARGET)
    pref_reached_count = sum(1 for c in counts.values() if c["total"] >= PREF_TARGET)

    # Generate dataset/DATASET_TRACKER.md
    markdown_content = []
    markdown_content.append("# Gym Scan AI - Dataset Collection Progress Tracker\n")
    markdown_content.append(f"**Last Updated**: Automatic Count Script (`python_pipeline/count_dataset.py`)\n")
    markdown_content.append("## Dataset Target Summary\n")
    markdown_content.append(f"- **Total Classes**: {total_classes} (`models/class_mapping.json`)")
    markdown_content.append(f"- **Minimum Target**: {min_total_target:,} images total ({MIN_TARGET} / class)")
    markdown_content.append(f"- **Preferred Target**: {pref_total_target:,} images total ({PREF_TARGET} / class)\n")

    markdown_content.append("### Current Overall Progress\n")
    markdown_content.append(f"- **Current Total Images**: **{total_images:,}**")
    markdown_content.append(f"- **Minimum Progress**: {total_images:,} / {min_total_target:,} ({(total_images / min_total_target * 100):.1f}%)")
    markdown_content.append(f"- **Preferred Progress**: {total_images:,} / {pref_total_target:,} ({(total_images / pref_total_target * 100):.1f}%)\n")

    markdown_content.append("### Split Breakdown\n")
    markdown_content.append("| Split | Target Ratio | Current Images | Current % |")
    markdown_content.append("|---|---:|---:|---:|")
    train_pct = (total_train / total_images * 100) if total_images > 0 else 0
    val_pct = (total_val / total_images * 100) if total_images > 0 else 0
    test_pct = (total_test / total_images * 100) if total_images > 0 else 0
    markdown_content.append(f"| **Train** | 70% | {total_train:,} | {train_pct:.1f}% |")
    markdown_content.append(f"| **Validation** | 15% | {total_val:,} | {val_pct:.1f}% |")
    markdown_content.append(f"| **Test** | 15% | {total_test:,} | {test_pct:.1f}% |")
    markdown_content.append(f"| **Total** | 100% | {total_images:,} | 100.0% |\n")

    markdown_content.append("### Class Status Summary\n")
    markdown_content.append(f"- **NOT STARTED** (0 images): {not_started_count} / {total_classes}")
    markdown_content.append(f"- **COLLECTING** (1–79 images): {collecting_count} / {total_classes}")
    markdown_content.append(f"- **MINIMUM REACHED** (80–249 images): {min_reached_count} / {total_classes}")
    markdown_content.append(f"- **PREFERRED TARGET REACHED** (250+ images): {pref_reached_count} / {total_classes}\n")

    markdown_content.append("## 50-Class Detailed Collection Table\n")
    markdown_content.append("| # | Machine ID | Machine Name | Category | Min Target | Pref Target | Current | Remaining Min | Remaining Pref | Status |")
    markdown_content.append("|---|---|---|---|---:|---:|---:|---:|---:|---|")

    # Sort deterministically by Machine ID
    sorted_ids = sorted(counts.keys())

    for idx, m_id in enumerate(sorted_ids, 1):
        info = counts[m_id]["info"]
        total = counts[m_id]["total"]
        m_name = info["machineName"]
        m_cat = info["category"]

        rem_min = max(0, MIN_TARGET - total)
        rem_pref = max(0, PREF_TARGET - total)

        if total == 0:
            status = "NOT STARTED"
        elif total < MIN_TARGET:
            status = "COLLECTING"
        elif total < PREF_TARGET:
            status = "MINIMUM REACHED"
        else:
            status = "PREFERRED TARGET REACHED"

        markdown_content.append(
            f"| {idx:02d} | `{m_id}` | {m_name} | {m_cat} | {MIN_TARGET} | {PREF_TARGET} | {total} | {rem_min} | {rem_pref} | `{status}` |"
        )

    TRACKER_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(TRACKER_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(markdown_content) + "\n")

    print(f"[Count System] Successfully updated {TRACKER_FILE.name}")
    print(f"[Count System] Total Classes: {total_classes} | Total Images: {total_images}")
    print(f"[Count System] Classes below minimum (80 images): {not_started_count + collecting_count} / {total_classes}")


if __name__ == "__main__":
    count_dataset()
