/**
 * scripts/test_clip_candidate_analysis.js
 *
 * Standalone experiment script for Gym Scan AI.
 * Performs deep candidate-specific analysis for Top-3 CLIP candidates on test_images/new_leg_press.png:
 *   1. seated-cable-row
 *   2. hack-squat-machine
 *   3. leg-press-45
 *
 * Usage:
 *   node scripts/test_clip_candidate_analysis.js
 */

import fs from 'fs';
import path from 'path';
import { pipeline, RawImage } from '@huggingface/transformers';

const PROJECT_ROOT    = process.cwd();
const EMBEDDINGS_PATH = path.join(PROJECT_ROOT, 'embeddings', 'reference_embeddings.json');
const TEST_IMAGE_PATH = path.join(PROJECT_ROOT, 'test_images', 'new_leg_press.png');
const MODEL_ID        = 'Xenova/clip-vit-base-patch32';
const ACTUAL_TARGET   = 'leg-press-45';

const THRESHOLDS = [0.70, 0.72, 0.74, 0.76, 0.78];

function dotProduct(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
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

async function main() {
  console.log('══════════════════════════════════════════════════════════════');
  console.log(' test_clip_candidate_analysis.js');
  console.log(' Model         :', MODEL_ID);
  console.log(' Embeddings DB :', EMBEDDINGS_PATH);
  console.log(' Test Image    :', TEST_IMAGE_PATH);
  console.log(' Actual Target :', ACTUAL_TARGET);
  console.log('══════════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(EMBEDDINGS_PATH)) {
    console.error(`ERROR: Reference embeddings not found at ${EMBEDDINGS_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.error(`ERROR: Test image missing at ${TEST_IMAGE_PATH}`);
    process.exit(1);
  }

  const rawDb = JSON.parse(fs.readFileSync(EMBEDDINGS_PATH, 'utf-8'));
  const entries = (rawDb.entries || []).map(e => ({
    ...e,
    embeddingNorm: Array.from(l2Normalize(e.embedding)),
  }));

  console.log('[analysis] Loading CLIP feature extractor...');
  const extractor = await pipeline('image-feature-extraction', MODEL_ID);
  console.log('[analysis] Feature extractor loaded.');

  const rawImg = await RawImage.read(TEST_IMAGE_PATH);
  const modelOutput = await extractor(rawImg);
  const queryVec = Array.from(l2Normalize(Array.from(modelOutput.data)));

  console.log('[analysis] Query embedding generated successfully.\n');

  // Compute similarities for all 78 references
  const allRefSimilarities = entries.map(ref => ({
    machineId: ref.machineId,
    machineName: ref.machineName,
    filename: ref.filename,
    relative_path: ref.relative_path,
    similarity: dotProduct(queryVec, ref.embeddingNorm),
  }));

  // Group similarities by machineId
  const machineGroups = new Map();
  allRefSimilarities.forEach(item => {
    if (!machineGroups.has(item.machineId)) {
      machineGroups.set(item.machineId, []);
    }
    machineGroups.get(item.machineId).push(item);
  });

  // Calculate MAX similarity per machine to pick Top-3 candidates
  const maxRankings = Array.from(machineGroups.entries()).map(([machineId, sims]) => {
    sims.sort((a, b) => b.similarity - a.similarity);
    return {
      machineId,
      maxSim: sims[0].similarity,
      sims,
    };
  }).sort((a, b) => b.maxSim - a.maxSim);

  console.log('──────────────────────────────────────────────────────────────');
  console.log(' ALL 8 MACHINE CLASSES RANKED BY MAX SIMILARITY');
  console.log('──────────────────────────────────────────────────────────────');
  maxRankings.forEach((m, idx) => {
    const isTarget = m.machineId === ACTUAL_TARGET ? ' <-- ACTUAL TARGET' : '';
    console.log(`${idx + 1}. ${m.machineId.padEnd(26)} ${m.maxSim.toFixed(4)}${isTarget}`);
  });
  console.log('──────────────────────────────────────────────────────────────\n');

  // Top-3 Candidates
  const top3Candidates = maxRankings.slice(0, 3).map(m => m.machineId);

  console.log(`Top-3 Candidates Selected: ${top3Candidates.join(', ')}\n`);

  // Analyze each of the Top-3 candidates
  const candidateStats = [];

  top3Candidates.forEach(machineId => {
    const group = machineGroups.get(machineId);
    const sims = group.map(g => g.similarity).sort((a, b) => b - a);
    const totalCount = sims.length;

    const best = sims[0];
    const top3Avg = sims.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, totalCount);
    const top5Avg = sims.slice(0, 5).reduce((a, b) => a + b, 0) / Math.min(5, totalCount);
    const allAvg = sims.reduce((a, b) => a + b, 0) / totalCount;

    const thresholdCounts = {};
    const thresholdPcts = {};

    THRESHOLDS.forEach(t => {
      const count = sims.filter(s => s >= t).length;
      thresholdCounts[t] = count;
      thresholdPcts[t] = ((count / totalCount) * 100).toFixed(1);
    });

    candidateStats.push({
      machineId,
      totalCount,
      best,
      top3Avg,
      top5Avg,
      allAvg,
      thresholdCounts,
      thresholdPcts,
      rawSims: group.sort((a, b) => b.similarity - a.similarity),
    });
  });

  // ── Print Candidate-Specific Summary Table ──────────────────────────────────
  console.log('========================================================================================================');
  console.log(' CANDIDATE-SPECIFIC STATISTICAL ANALYSIS TABLE');
  console.log('========================================================================================================');
  console.log('Machine                  Total   Best    Top3Avg Top5Avg AllAvg  >0.70 (>0.70%)  >0.74 (>0.74%)  >0.78 (>0.78%)');
  console.log('--------------------------------------------------------------------------------------------------------');

  candidateStats.forEach(c => {
    const isTarget = c.machineId === ACTUAL_TARGET ? '*' : ' ';
    const label = `${isTarget}${c.machineId}`.padEnd(24);
    const tot   = `${c.totalCount}`.padEnd(7);
    const best  = c.best.toFixed(4).padEnd(8);
    const t3    = c.top3Avg.toFixed(4).padEnd(8);
    const t5    = c.top5Avg.toFixed(4).padEnd(8);
    const all   = c.allAvg.toFixed(4).padEnd(8);

    const t70 = `${c.thresholdCounts[0.70]} (${c.thresholdPcts[0.70]}%)`.padEnd(15);
    const t74 = `${c.thresholdCounts[0.74]} (${c.thresholdPcts[0.74]}%)`.padEnd(15);
    const t78 = `${c.thresholdCounts[0.78]} (${c.thresholdPcts[0.78]}%)`;

    console.log(`${label}${tot}${best}${t3}${t5}${all}${t70}${t74}${t78}`);
  });
  console.log('========================================================================================================\n');

  // Detailed Threshold Breakdown Table
  console.log('Detailed Threshold Breakdown (Count & % of Machine\'s References):');
  console.log('--------------------------------------------------------------------------------');
  console.log('Machine                 >0.70          >0.72          >0.74          >0.76          >0.78');
  console.log('--------------------------------------------------------------------------------');
  candidateStats.forEach(c => {
    const label = c.machineId.padEnd(22);
    const cols = THRESHOLDS.map(t => `${c.thresholdCounts[t]}/${c.totalCount} (${c.thresholdPcts[t]}%)`.padEnd(14)).join('');
    console.log(`${label} ${cols}`);
  });
  console.log('\n');

  // ── Print Individual Reference Similarities ─────────────────────────────────
  console.log('==============================================================');
  console.log(' INDIVIDUAL REFERENCE SIMILARITY BREAKDOWN FOR TOP-3 CANDIDATES');
  console.log('==============================================================\n');

  candidateStats.forEach(c => {
    console.log(`── Machine: ${c.machineId} (Total References: ${c.totalCount}) ──`);
    c.rawSims.forEach((ref, idx) => {
      const idxStr = `${idx + 1}.`.padEnd(4);
      const fnStr  = ref.filename.padEnd(30);
      const score  = ref.similarity.toFixed(4);
      console.log(`  ${idxStr} ${fnStr} : ${score}`);
    });
    console.log('');
  });
}

main().catch(err => {
  console.error('[candidate-analysis] Unhandled Fatal Error:', err);
  process.exit(1);
});
