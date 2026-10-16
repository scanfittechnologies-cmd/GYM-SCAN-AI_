/**
 * build_reference_embeddings.js
 *
 * Generates CLIP (Xenova/clip-vit-base-patch32) image embeddings for every
 * reference image listed in reference_images/reference_manifest.json.
 *
 * Output: embeddings/reference_embeddings.json
 *
 * Usage:
 *   node scripts/build_reference_embeddings.js
 *
 * Does NOT modify any existing project file.
 */

import fs from 'fs';
import path from 'path';
import { pipeline, RawImage } from '@huggingface/transformers';

// ── Constants ─────────────────────────────────────────────────────────────────

const PROJECT_ROOT       = process.cwd();
const MANIFEST_PATH      = path.join(PROJECT_ROOT, 'reference_images', 'reference_manifest.json');
const EMBEDDINGS_DIR     = path.join(PROJECT_ROOT, 'embeddings');
const OUTPUT_PATH        = path.join(EMBEDDINGS_DIR, 'reference_embeddings.json');
const MODEL_ID           = 'Xenova/clip-vit-base-patch32';
const EXPECTED_DIM       = 512;
const CLASS_MAPPING_PATH = path.join(PROJECT_ROOT, 'models', 'class_mapping.json');

const CLASS_ID_ALIAS = {
  'pec-deck-fly': 'pec-deck-machine',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadClassMetadata() {
  const meta = new Map();
  const defaults = {
    'assisted-pull-up-machine': { machineName: 'Assisted Pull-Up Machine', category: 'Back' },
    'hack-squat-machine':       { machineName: 'Hack Squat Machine',        category: 'Legs' },
    'incline-chest-press':      { machineName: 'Incline Chest Press',       category: 'Chest' },
    'lat-pulldown':             { machineName: 'Lat Pulldown',              category: 'Back' },
    'leg-extension':            { machineName: 'Leg Extension',             category: 'Legs' },
    'leg-press-45':             { machineName: 'Leg Press 45',              category: 'Legs' },
    'pec-deck-machine':         { machineName: 'Pec Deck Machine',          category: 'Chest' },
    'seated-cable-row':         { machineName: 'Seated Cable Row',          category: 'Back' },
  };
  Object.entries(defaults).forEach(([id, m]) => meta.set(id, m));

  try {
    if (fs.existsSync(CLASS_MAPPING_PATH)) {
      const raw = JSON.parse(fs.readFileSync(CLASS_MAPPING_PATH, 'utf-8'));
      if (raw.indexToClass) {
        Object.values(raw.indexToClass).forEach(cls => {
          if (cls?.machineId) {
            meta.set(cls.machineId, {
              machineName: cls.machineName || cls.machineId,
              category:    cls.category    || 'Gym Equipment',
            });
          }
        });
      }
    }
  } catch (err) {
    console.warn(`[build] Warning: could not read class_mapping.json: ${err.message}`);
  }

  return meta;
}

function l2Normalize(arr) {
  let sumSq = 0;
  for (let i = 0; i < arr.length; i++) sumSq += arr[i] * arr[i];
  const norm = Math.sqrt(sumSq) || 1e-10;
  for (let i = 0; i < arr.length; i++) arr[i] /= norm;
  return arr;
}

function validateEmbedding(arr) {
  if (arr.length !== EXPECTED_DIM) {
    return { valid: false, reason: `Expected ${EXPECTED_DIM} dims, got ${arr.length}` };
  }
  for (let i = 0; i < arr.length; i++) {
    if (!Number.isFinite(arr[i])) {
      return { valid: false, reason: `Non-finite value at index ${i}: ${arr[i]}` };
    }
  }
  return { valid: true };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const globalStart = Date.now();

  console.log('══════════════════════════════════════════════════════════════');
  console.log(' build_reference_embeddings.js');
  console.log(' Model  :', MODEL_ID);
  console.log(' Manifest:', MANIFEST_PATH);
  console.log(' Output :', OUTPUT_PATH);
  console.log('══════════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`[build] ERROR: Manifest not found at ${MANIFEST_PATH}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const images   = manifest.images || [];

  if (images.length === 0) {
    console.error('[build] ERROR: Manifest contains no images.');
    process.exit(1);
  }

  const uniqueClasses = new Set(images.map(i => i.class_id)).size;
  console.log(`[build] Manifest loaded — ${images.length} images across ${uniqueClasses} classes.\n`);

  const classMeta = loadClassMetadata();

  if (!fs.existsSync(EMBEDDINGS_DIR)) {
    fs.mkdirSync(EMBEDDINGS_DIR, { recursive: true });
    console.log(`[build] Created directory: ${EMBEDDINGS_DIR}`);
  }

  console.log(`[build] Loading model "${MODEL_ID}" (downloads on first run)...`);
  const modelLoadStart = Date.now();

  let extractor;
  try {
    extractor = await pipeline('image-feature-extraction', MODEL_ID);
  } catch (err) {
    console.error(`[build] FATAL: Failed to load model: ${err.message}`);
    process.exit(1);
  }

  console.log(`[build] Model ready in ${((Date.now() - modelLoadStart) / 1000).toFixed(1)}s.\n`);

  const entries  = [];
  const failures = [];
  const total    = images.length;

  for (let i = 0; i < total; i++) {
    const imgMeta  = images[i];
    const rawClassId = imgMeta.class_id;
    const machineId  = CLASS_ID_ALIAS[rawClassId] || rawClassId;
    const filename   = imgMeta.filename;
    const relPath    = imgMeta.relative_path;
    const absPath    = path.join(PROJECT_ROOT, relPath);

    const label = relPath.replace('reference_images/', '');
    process.stdout.write(`  ${String(i + 1).padStart(2)}/${total}  ${label} ... `);

    if (!fs.existsSync(absPath)) {
      const reason = `File not found: ${absPath}`;
      process.stdout.write(`FAIL — ${reason}\n`);
      failures.push({ filename, relPath, machineId, reason });
      continue;
    }

    const imgStart = Date.now();
    let rawTensor;

    try {
      const rawImage = await RawImage.read(absPath);
      rawTensor = await extractor(rawImage);
    } catch (err) {
      const reason = `Extractor error: ${err.message}`;
      process.stdout.write(`FAIL — ${reason}\n`);
      failures.push({ filename, relPath, machineId, reason });
      continue;
    }

    // Extract flat Float32Array from the Tensor
    let floatArr;
    try {
      if (rawTensor?.data instanceof Float32Array) {
        floatArr = new Float32Array(rawTensor.data);         // copy
      } else if (rawTensor?.data) {
        floatArr = new Float32Array(rawTensor.data);
      } else if (rawTensor instanceof Float32Array) {
        floatArr = rawTensor;
      } else {
        const nested = rawTensor?.tolist?.();
        if (nested != null) {
          const flat = Array.isArray(nested[0]) ? nested[0] : nested;
          floatArr   = new Float32Array(flat);
        } else {
          throw new Error(`Cannot extract data from tensor type: ${rawTensor?.constructor?.name}`);
        }
      }
    } catch (err) {
      const reason = `Tensor extraction error: ${err.message}`;
      process.stdout.write(`FAIL — ${reason}\n`);
      failures.push({ filename, relPath, machineId, reason });
      continue;
    }

    // Validate pre-normalization
    const preCheck = validateEmbedding(floatArr);
    if (!preCheck.valid) {
      const reason = `Invalid raw embedding: ${preCheck.reason}`;
      process.stdout.write(`FAIL — ${reason}\n`);
      failures.push({ filename, relPath, machineId, reason });
      continue;
    }

    // L2-normalize in-place
    l2Normalize(floatArr);

    // Validate post-normalization
    const postCheck = validateEmbedding(floatArr);
    if (!postCheck.valid) {
      const reason = `Invalid embedding after normalization: ${postCheck.reason}`;
      process.stdout.write(`FAIL — ${reason}\n`);
      failures.push({ filename, relPath, machineId, reason });
      continue;
    }

    const meta        = classMeta.get(machineId) || {};
    const machineName = imgMeta.machineName || meta.machineName || machineId;
    const category    = imgMeta.category    || meta.category    || 'Gym Equipment';

    const elapsed = Date.now() - imgStart;
    process.stdout.write(`OK  (${elapsed}ms)\n`);

    entries.push({
      machineId,
      machineName,
      category,
      filename,
      relative_path: relPath,
      embedding: Array.from(floatArr),
    });
  }

  // Write output
  const output = {
    model:         MODEL_ID,
    embeddingDim:  EXPECTED_DIM,
    generatedAt:   new Date().toISOString(),
    totalImages:   entries.length,
    totalFailures: failures.length,
    entries,
    ...(failures.length > 0 ? { failures } : {}),
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');

  // Summary
  const totalSec = ((Date.now() - globalStart) / 1000).toFixed(1);
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(' Build Complete');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(` Total images processed : ${entries.length} / ${total}`);
  console.log(` Total failures         : ${failures.length}`);
  console.log(` Embedding dimension    : ${EXPECTED_DIM}`);
  console.log(` Output path            : ${OUTPUT_PATH}`);
  console.log(` Total processing time  : ${totalSec}s`);

  if (failures.length > 0) {
    console.log('\n Failures:');
    failures.forEach((f, idx) => {
      console.log(`   ${idx + 1}. ${f.relPath} — ${f.reason}`);
    });
    console.log('══════════════════════════════════════════════════════════════\n');
    process.exit(1);
  }

  console.log('══════════════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('[build] Unhandled error:', err);
  process.exit(1);
});
