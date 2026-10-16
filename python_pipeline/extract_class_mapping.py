"""
Single Source of Truth Class Mapping Generator.
Extracts exact 42 machine IDs and titles from src/data/machines.ts.
Saves mapping JSON artifact for training, validation, and ONNX runtime inference.
"""

import json
import re
import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MACHINES_FILE = PROJECT_ROOT / "src" / "data" / "machines.ts"
OUTPUT_MAPPING_FILE = PROJECT_ROOT / "models" / "class_mapping.json"


def extract_machine_classes():
    if not MACHINES_FILE.exists():
        raise FileNotFoundError(f"Authoritative machines file not found at: {MACHINES_FILE}")

    with open(MACHINES_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    # Extract all id, name, category entries from MACHINES_DATABASE array
    machine_entries = re.findall(
        r'{\s*"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)"[^{}]*?"category":\s*"([^"]+)"',
        content,
        re.DOTALL
    )

    if not machine_entries:
        # Fallback regex if formatting varies
        ids = re.findall(r'"id":\s*"([^"]+)"', content)
        names = re.findall(r'"name":\s*"([^"]+)"', content)
        categories = re.findall(r'"category":\s*"([^"]+)"', content)
        machine_entries = list(zip(ids, names, categories))

    seen_ids = set()
    classes = []

    for m_id, m_name, m_cat in machine_entries:
        if m_id in seen_ids:
            continue
        seen_ids.add(m_id)
        classes.append({
            "machineId": m_id,
            "machineName": m_name,
            "category": m_cat
        })

    # Sort deterministically by machineId
    classes.sort(key=lambda x: x["machineId"])

    mapping = {
        "totalClasses": len(classes),
        "source": "src/data/machines.ts",
        "indexToClass": {idx: item for idx, item in enumerate(classes)},
        "classToIdx": {item["machineId"]: idx for idx, item in enumerate(classes)}
    }

    OUTPUT_MAPPING_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_MAPPING_FILE, "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=2)

    print(f"[Class Mapping] Successfully generated {len(classes)} machine classes from {MACHINES_FILE.name}")
    print(f"[Class Mapping] Artifact saved to: {OUTPUT_MAPPING_FILE}")
    return mapping


if __name__ == "__main__":
    extract_machine_classes()
