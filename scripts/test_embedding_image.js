/**
 * test_embedding_image.js
 *
 * Tests the CLIP embedding database (embeddings/reference_embeddings.json)
 * against an unseen test image (test_images/new_leg_press.png).
 *
 * Usage:
 *   node scripts/test_embedding_image.js
 *
 * Does NOT modify any existing server, recognition, or embedding index files.
 */

import fs from 'fs';
import path from 'path';
import { pipeline, RawImage } from '@huggingface/transformers';

const PROJECT_ROOT    = process.cwd();
const MODEL_ID        = 'Xenova/clip-vit-base-patch32';
const EMBEDDINGS_PATH = path.join(PROJECT_ROOT, 'embeddings', 'reference_embeddings.json');
const TEST_IMAGE_PATH = path.join(PROJECT_ROOT, 'test_images', 'new_leg_press.png');
const EXPECTED_DIM    = 512;

// ── Math Helpers ─────────────────────────────────────────────────────────────

function dotProduct(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

function l2Normalize(arr) {
  let sumSq = 0;
  for (let i = 0; i < arr.length; i++) sumSq += arr[i] * arr[i];
  const norm = Math.sqrt(sumSq) || 1e-10;
  const out = new Float32Array(arr.length);
  for (let i = 0; i < arr.length; i++) out[i] = arr[i] / norm;
  return out;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();
  console.log('══════════════════════════════════════════════════════════════');
  console.log(' test_embedding_image.js');
  console.log(' Model      :', MODEL_ID);
  console.log(' Index      :', EMBEDDINGS_PATH);
  console.log(' Test Image :', TEST_IMAGE_PATH);
  console.log('══════════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(EMBEDDINGS_PATH)) {
    console.error(`[test] ERROR: Reference embeddings index not found: ${EMBEDDINGS_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.error(`[test] ERROR: Test image file not found: ${TEST_IMAGE_PATH}`);
    process.exit(1);
  }

  const dbData = JSON.parse(fs.readFileSync(EMBEDDINGS_PATH, 'utf-8'));
  const entries = dbData.entries || [];

  if (entries.length === 0) {
    console.error('[test] ERROR: No entries found in reference_embeddings.json');
    process.exit(1);
  }

  console.log(`[test] Loaded ${entries.length} reference embeddings from index.`);

  console.log(`[test] Loading CLIP model "${MODEL_ID}"...`);
  const extractor = await pipeline('image-feature-extraction', MODEL_ID);
  console.log('[test] Model loaded successfully.');

  console.log(`[test] Generating embedding for test image: ${path.basename(TEST_IMAGE_PATH)}...`);
  const rawImg = await RawImage.read(TEST_IMAGE_PATH);
  const rawTensor = await extractor(rawImg);
  const rawArr = Array.from(rawTensor.data);
  const queryEmbedding = Array.from(l2Normalize(rawArr));

  if (queryEmbedding.length !== EXPECTED_DIM) {
    console.error(`[test] ERROR: Generated embedding dim ${queryEmbedding.length} != ${EXPECTED_DIM}`);
    process.exit(1);
  }
  console.log(`[test] Generated valid ${EXPECTED_DIM}-d normalized embedding.\n`);

  // Aggregate similarities by machineId using Max Similarity per Machine
  const machineScoresMap = new Map();

  entries.forEach(ref => {
    const sim = dotProduct(queryEmbedding, ref.embedding);
    if (!machineScoresMap.has(ref.machineId)) {
      machineScoresMap.set(ref.machineId, {
        machineId: ref.machineId,
        machineName: ref.machineName || ref.machineId,
        category: ref.category || 'Gym Equipment',
        sims: [],
        bestImg: ref.relative_path,
        bestSim: -1,
      });
    }
    const record = machineScoresMap.get(ref.machineId);
    record.sims.push(sim);
    if (sim > record.bestSim) {
      record.bestSim = sim;
      record.bestImg = ref.relative_path;
    }
  });

  const rankedMachines = Array.from(machineScoresMap.values()).map(m => {
    const sortedSims = [...m.sims].sort((a, b) => b - a);
    const maxSim = sortedSims[0];
    const top3Sims = sortedSims.slice(0, 3);
    const top3Avg = top3Sims.reduce((a, b) => a + b, 0) / top3Sims.length;

    return {
      machineId: m.machineId,
      machineName: m.machineName,
      category: m.category,
      maxSimilarity: Number(maxSim.toFixed(4)),
      top3AvgSimilarity: Number(top3Avg.toFixed(4)),
      bestMatchingImage: m.bestImg,
    };
  });

  // Sort machines by maxSimilarity descending
  rankedMachines.sort((a, b) => b.maxSimilarity - a.maxSimilarity);

  const top1 = rankedMachines[0];
  const top2 = rankedMachines[1];
  const top3 = rankedMachines[2];
  const margin = Number((top1.maxSimilarity - top2.maxSimilarity).toFixed(4));
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('══════════════════════════════════════════════════════════════');
  console.log(' UNSEEN TEST IMAGE RETRIEVAL RESULTS');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(` Test Image : ${path.basename(TEST_IMAGE_PATH)}`);
  console.log(` Aggregation: Max Similarity per Machine`);
  console.log(` Execution  : ${durationSec}s\n`);

  console.log('── Full Ranked Results for ALL 8 Machines ────────────────────');
  rankedMachines.forEach((m, idx) => {
    const rankStr = `${idx + 1}.`.padEnd(4);
    const idStr = m.machineId.padEnd(26);
    const maxStr = `Max Sim: ${m.maxSimilarity.toFixed(4)}`;
    const avgStr = `Top-3 Avg: ${m.top3AvgSimilarity.toFixed(4)}`;
    const bestImgStr = `Best Match: ${m.bestMatchingImage}`;
    console.log(` ${rankStr} ${idStr} ${maxStr}  |  ${avgStr}  |  ${bestImgStr}`);
  });
  console.log();

  console.log('── Top Candidates Summary ────────────────────────────────────');
  console.log(` Top-1 Candidate : ${top1.machineId} (${top1.machineName}) - Similarity: ${top1.maxSimilarity}`);
  console.log(` Top-2 Candidate : ${top2.machineId} (${top2.machineName}) - Similarity: ${top2.maxSimilarity}`);
  console.log(` Top-3 Candidate : ${top3.machineId} (${top3.machineName}) - Similarity: ${top3.maxSimilarity}`);
  console.log(` Top-1 vs Top-2 Margin : ${margin}\n`);

  console.log('══════════════════════════════════════════════════════════════');
  console.log(` WINNER SELECTED BY CLIP: ${top1.machineId} (${top1.machineName})`);
  console.log('══════════════════════════════════════════════════════════════');
}

main().catch(err => {
  console.error('[test] Fatal error during test execution:', err);
  process.exit(1);
});
