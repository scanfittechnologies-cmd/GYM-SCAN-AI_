/**
 * scripts/test_dinov2_leg_press.js
 *
 * Standalone experiment script to test DINOv2 (Xenova/dinov2-small) embedding matching
 * on test_images/new_leg_press.png against embeddings/dinov2_reference_embeddings.json.
 *
 * Usage:
 *   node scripts/test_dinov2_leg_press.js
 */

import fs from 'fs';
import path from 'path';
import { pipeline } from '@huggingface/transformers';

const PROJECT_ROOT       = process.cwd();
const DINOV2_EMB_PATH    = path.join(PROJECT_ROOT, 'embeddings', 'dinov2_reference_embeddings.json');
const TEST_IMAGE_PATH    = path.join(PROJECT_ROOT, 'test_images', 'new_leg_press.png');
const MODEL_ID           = 'Xenova/dinov2-small';
const EXPECTED_DIM       = 384;
const ACTUAL_TARGET      = 'leg-press-45';

function l2Normalize(arr) {
  let sumSq = 0;
  for (let i = 0; i < arr.length; i++) sumSq += arr[i] * arr[i];
  const norm = Math.sqrt(sumSq) || 1e-10;
  for (let i = 0; i < arr.length; i++) arr[i] /= norm;
  return arr;
}

function extractClsEmbedding(tensorOutput) {
  const rawData = tensorOutput.data;
  const clsVector = Array.from(rawData.slice(0, EXPECTED_DIM));
  return l2Normalize(clsVector);
}

function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
  }
  return dot;
}

async function main() {
  console.log('══════════════════════════════════════════════════════════════');
  console.log(' test_dinov2_leg_press.js');
  console.log(' Model         :', MODEL_ID);
  console.log(' DINOv2 Database:', DINOV2_EMB_PATH);
  console.log(' Test Image    :', TEST_IMAGE_PATH);
  console.log(' Actual Target :', ACTUAL_TARGET);
  console.log('══════════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(DINOV2_EMB_PATH)) {
    console.error(`[test-dinov2] ERROR: Reference embeddings not found at ${DINOV2_EMB_PATH}`);
    console.error('Please run `node scripts/build_dinov2_reference_embeddings.js` first.');
    process.exit(1);
  }

  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.error(`[test-dinov2] ERROR: Test image not found at ${TEST_IMAGE_PATH}`);
    process.exit(1);
  }

  const dbRaw = JSON.parse(fs.readFileSync(DINOV2_EMB_PATH, 'utf-8'));
  const referenceEntries = dbRaw.entries || [];
  console.log(`[test-dinov2] Loaded ${referenceEntries.length} reference embeddings.`);

  console.log('[test-dinov2] Initializing DINOv2 feature extractor...');
  let extractor;
  try {
    extractor = await pipeline('image-feature-extraction', MODEL_ID);
    console.log('[test-dinov2] Model loaded.');
  } catch (err) {
    console.error(`[test-dinov2] ERROR loading model: ${err.message}`);
    process.exit(1);
  }

  console.log(`[test-dinov2] Generating embedding for test image: ${TEST_IMAGE_PATH}`);
  const modelOutput = await extractor(TEST_IMAGE_PATH);
  const testEmbedding = extractClsEmbedding(modelOutput);

  // Group similarity scores by machineId (using Max Similarity aggregation)
  const machineScoresMap = new Map();

  referenceEntries.forEach(ref => {
    const sim = cosineSimilarity(testEmbedding, ref.embedding);
    const existing = machineScoresMap.get(ref.machineId);
    if (!existing || sim > existing.maxSim) {
      machineScoresMap.set(ref.machineId, {
        machineId: ref.machineId,
        machineName: ref.machineName,
        maxSim: sim,
        bestMatchFilename: ref.filename,
      });
    }
  });

  const rankedMachines = Array.from(machineScoresMap.values())
    .sort((a, b) => b.maxSim - a.maxSim);

  console.log('\n──────────────────────────────────────────────────────────────');
  console.log(' DINOv2 Similarity Results (Max Similarity per Machine)');
  console.log('──────────────────────────────────────────────────────────────');
  rankedMachines.forEach((item, index) => {
    const rankStr = `${index + 1}.`.padEnd(4);
    const idStr   = item.machineId.padEnd(24);
    const scoreStr = item.maxSim.toFixed(4);
    const isTarget = item.machineId === ACTUAL_TARGET ? ' <-- ACTUAL TARGET' : '';
    console.log(`${rankStr} ${idStr} ${scoreStr}${isTarget}`);
  });
  console.log('──────────────────────────────────────────────────────────────\n');

  const top1 = rankedMachines[0];
  const top2 = rankedMachines[1];
  const top3 = rankedMachines[2];
  const margin = top1 ? (top1.maxSim - (top2 ? top2.maxSim : 0)) : 0;
  const actualRankIndex = rankedMachines.findIndex(m => m.machineId === ACTUAL_TARGET);
  const actualRank = actualRankIndex !== -1 ? actualRankIndex + 1 : 'N/A';

  console.log('SUMMARY:');
  console.log(`  Top-1: ${top1 ? `${top1.machineId} (${top1.maxSim.toFixed(4)})` : 'N/A'}`);
  console.log(`  Top-2: ${top2 ? `${top2.machineId} (${top2.maxSim.toFixed(4)})` : 'N/A'}`);
  console.log(`  Top-3: ${top3 ? `${top3.machineId} (${top3.maxSim.toFixed(4)})` : 'N/A'}`);
  console.log(`  Actual leg-press-45 rank: ${actualRank}`);
  console.log(`  Top-1 vs Top-2 Margin   : ${margin.toFixed(4)}`);
  console.log(`  Embedding Dimension     : ${EXPECTED_DIM}`);
}

main().catch(err => {
  console.error('[test-dinov2] Unhandled Fatal Error:', err);
  process.exit(1);
});
