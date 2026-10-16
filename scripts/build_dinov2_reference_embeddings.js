/**
 * scripts/build_dinov2_reference_embeddings.js
 *
 * Standalone experiment script for generating DINOv2 (Xenova/dinov2-small) image embeddings
 * for all reference images listed in reference_images/reference_manifest.json.
 *
 * Saves output to: embeddings/dinov2_reference_embeddings.json
 *
 * Usage:
 *   node scripts/build_dinov2_reference_embeddings.js
 */

import fs from 'fs';
import path from 'path';
import { pipeline } from '@huggingface/transformers';

const PROJECT_ROOT       = process.cwd();
const MANIFEST_PATH      = path.join(PROJECT_ROOT, 'reference_images', 'reference_manifest.json');
const EMBEDDINGS_DIR     = path.join(PROJECT_ROOT, 'embeddings');
const OUTPUT_PATH        = path.join(EMBEDDINGS_DIR, 'dinov2_reference_embeddings.json');
const MODEL_ID           = 'Xenova/dinov2-small';
const EXPECTED_DIM       = 384;
const CLASS_MAPPING_PATH = path.join(PROJECT_ROOT, 'models', 'class_mapping.json');

const CLASS_ID_ALIAS = {
  'pec-deck-fly': 'pec-deck-machine',
};

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
    console.warn(`[build-dinov2] Warning reading class_mapping: ${err.message}`);
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

function extractClsEmbedding(tensorOutput) {
  // Shape: [1, 257, 384] -> 257 tokens (1 CLS + 256 patch tokens), 384 dim each.
  // CLS token is at index 0 (first 384 floats).
  const rawData = tensorOutput.data;
  const clsVector = Array.from(rawData.slice(0, EXPECTED_DIM));
  return l2Normalize(clsVector);
}

function validateEmbedding(arr) {
  if (!arr || arr.length !== EXPECTED_DIM) {
    return { valid: false, reason: `Expected ${EXPECTED_DIM} dims, got ${arr?.length}` };
  }
  for (let i = 0; i < arr.length; i++) {
    if (!Number.isFinite(arr[i])) {
      return { valid: false, reason: `Non-finite value at index ${i}: ${arr[i]}` };
    }
  }
  return { valid: true };
}

async function main() {
  const globalStart = Date.now();

  console.log('══════════════════════════════════════════════════════════════');
  console.log(' build_dinov2_reference_embeddings.js');
  console.log(' Model   :', MODEL_ID);
  console.log(' Manifest:', MANIFEST_PATH);
  console.log(' Output  :', OUTPUT_PATH);
  console.log(' Dim     :', EXPECTED_DIM);
  console.log(' Pooling :', 'CLS Token (index 0)');
  console.log('══════════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`[build-dinov2] ERROR: Manifest not found at ${MANIFEST_PATH}`);
    process.exit(1);
  }

  const manifestData = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const imagesList = manifestData.images || [];

  if (imagesList.length === 0) {
    console.error('[build-dinov2] ERROR: Manifest contains 0 images.');
    process.exit(1);
  }

  const metaMap = loadClassMetadata();
  console.log(`[build-dinov2] Found ${imagesList.length} images in manifest.`);
  console.log('[build-dinov2] Initializing DINOv2 feature extractor...');

  let extractor;
  try {
    extractor = await pipeline('image-feature-extraction', MODEL_ID);
    console.log('[build-dinov2] Model loaded successfully.\n');
  } catch (err) {
    console.error(`[build-dinov2] ERROR loading model: ${err.message}`);
    process.exit(1);
  }

  if (!fs.existsSync(EMBEDDINGS_DIR)) {
    fs.mkdirSync(EMBEDDINGS_DIR, { recursive: true });
  }

  const entries = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < imagesList.length; i++) {
    const item = imagesList[i];
    const rawClassId = item.class_id;
    const machineId  = CLASS_ID_ALIAS[rawClassId] || rawClassId;
    const meta       = metaMap.get(machineId) || { machineName: machineId, category: 'Gym Equipment' };
    const imgRelPath = item.relative_path;
    const imgAbsPath = path.join(PROJECT_ROOT, imgRelPath);

    const stepLabel = `[${i + 1}/${imagesList.length}] ${item.filename}`;

    if (!fs.existsSync(imgAbsPath)) {
      console.warn(`${stepLabel} -> FAILED: File missing at ${imgAbsPath}`);
      failCount++;
      continue;
    }

    try {
      const output = await extractor(imgAbsPath);
      const embedding = extractClsEmbedding(output);

      const check = validateEmbedding(embedding);
      if (!check.valid) {
        console.warn(`${stepLabel} -> INVALID EMBEDDING: ${check.reason}`);
        failCount++;
        continue;
      }

      entries.push({
        machineId,
        machineName: meta.machineName,
        category:    meta.category,
        filename:    item.filename,
        relative_path: imgRelPath,
        embedding,
      });

      successCount++;
      if ((i + 1) % 10 === 0 || i === imagesList.length - 1) {
        console.log(`Processed ${i + 1}/${imagesList.length} images...`);
      }
    } catch (err) {
      console.error(`${stepLabel} -> EXCEPTION: ${err.message}`);
      failCount++;
    }
  }

  const outputPayload = {
    model: MODEL_ID,
    embeddingDim: EXPECTED_DIM,
    poolingMethod: 'cls_token',
    generatedAt: new Date().toISOString(),
    totalImages: entries.length,
    totalFailures: failCount,
    entries,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(outputPayload, null, 2), 'utf-8');

  const elapsedSec = ((Date.now() - globalStart) / 1000).toFixed(2);
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(' DINOv2 Reference Embeddings Build Complete');
  console.log(` Output File    : ${OUTPUT_PATH}`);
  console.log(` Total Images   : ${imagesList.length}`);
  console.log(` Processed      : ${successCount}`);
  console.log(` Failures       : ${failCount}`);
  console.log(` Time Elapsed   : ${elapsedSec}s`);
  console.log('══════════════════════════════════════════════════════════════\n');

  if (failCount > 0) {
    console.warn(`WARNING: ${failCount} image(s) failed during embedding generation.`);
  }
}

main().catch(err => {
  console.error('[build-dinov2] Unhandled Fatal Error:', err);
  process.exit(1);
});
