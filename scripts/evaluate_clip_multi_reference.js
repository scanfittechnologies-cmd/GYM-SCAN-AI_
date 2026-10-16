/**
 * scripts/evaluate_clip_multi_reference.js
 *
 * Standalone experiment script for Gym Scan AI (Experiment 1).
 * Evaluates CLIP embeddings comparing single-best (MAX) vs multi-reference scoring:
 *  - Strategy A: MAX similarity
 *  - Strategy B: TOP-3 AVERAGE similarity
 *  - Strategy C: TOP-5 AVERAGE similarity
 *
 * Performs:
 * 1. Leave-One-Out (LOO) evaluation on all 78 reference images.
 * 2. Unseen image evaluation on test_images/new_leg_press.png.
 *
 * Usage:
 *   node scripts/evaluate_clip_multi_reference.js
 */

import fs from 'fs';
import path from 'path';
import { pipeline, RawImage } from '@huggingface/transformers';

const PROJECT_ROOT    = process.cwd();
const EMBEDDINGS_PATH = path.join(PROJECT_ROOT, 'embeddings', 'reference_embeddings.json');
const TEST_IMAGE_PATH = path.join(PROJECT_ROOT, 'test_images', 'new_leg_press.png');
const MODEL_ID        = 'Xenova/clip-vit-base-patch32';
const ACTUAL_TARGET   = 'leg-press-45';

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

function computeMachineScore(similarities, strategy) {
  // similarities: sorted descending array of float numbers
  if (!similarities || similarities.length === 0) return 0;
  if (strategy === 'MAX') {
    return similarities[0];
  }
  if (strategy === 'TOP-3') {
    const k = Math.min(3, similarities.length);
    let sum = 0;
    for (let i = 0; i < k; i++) sum += similarities[i];
    return sum / k;
  }
  if (strategy === 'TOP-5') {
    const k = Math.min(5, similarities.length);
    let sum = 0;
    for (let i = 0; i < k; i++) sum += similarities[i];
    return sum / k;
  }
  throw new Error(`Unknown strategy: ${strategy}`);
}

function evaluateSet(queryEmbedding, candidates, strategy) {
  // Group candidate similarities by machineId
  const grouped = new Map();
  candidates.forEach(cand => {
    const sim = dotProduct(queryEmbedding, cand.embeddingNorm);
    if (!grouped.has(cand.machineId)) {
      grouped.set(cand.machineId, []);
    }
    grouped.get(cand.machineId).push(sim);
  });

  const machineScores = [];
  grouped.forEach((sims, machineId) => {
    sims.sort((a, b) => b - a);
    const score = computeMachineScore(sims, strategy);
    machineScores.push({ machineId, score });
  });

  machineScores.sort((a, b) => b.score - a.score);
  return machineScores;
}

async function main() {
  console.log('══════════════════════════════════════════════════════════════');
  console.log(' evaluate_clip_multi_reference.js (Experiment 1)');
  console.log(' Model          :', MODEL_ID);
  console.log(' Reference File :', EMBEDDINGS_PATH);
  console.log(' Test Image     :', TEST_IMAGE_PATH);
  console.log('══════════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(EMBEDDINGS_PATH)) {
    console.error(`ERROR: Reference embeddings not found at ${EMBEDDINGS_PATH}`);
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(EMBEDDINGS_PATH, 'utf-8'));
  const entries = (rawData.entries || []).map(e => ({
    ...e,
    embeddingNorm: Array.from(l2Normalize(e.embedding)),
  }));

  const totalImages = entries.length;
  console.log(`[LOO-Eval] Loaded ${totalImages} reference embeddings.\n`);

  const strategies = [
    { key: 'MAX', name: 'MAX' },
    { key: 'TOP-3', name: 'TOP-3 AVERAGE' },
    { key: 'TOP-5', name: 'TOP-5 AVERAGE' },
  ];

  const results = {};
  strategies.forEach(s => {
    results[s.key] = {
      top1Count: 0,
      top3Count: 0,
      top5Count: 0,
      totalCount: totalImages,
      margins: [],
      perClass: {}, // { machineId: { total: 0, correct: 0 } }
      confusions: {}, // { "trueClass -> predClass": count }
    };
  });

  // Collect set of unique machineIds
  const allMachineIds = [...new Set(entries.map(e => e.machineId))];
  allMachineIds.forEach(id => {
    strategies.forEach(s => {
      results[s.key].perClass[id] = { total: 0, correct: 0 };
    });
  });

  // Leave-One-Out Loop
  for (let i = 0; i < totalImages; i++) {
    const query = entries[i];
    const candidates = entries.filter((_, idx) => idx !== i);

    strategies.forEach(s => {
      const ranked = evaluateSet(query.embeddingNorm, candidates, s.key);
      const trueClass = query.machineId;
      const predClass = ranked[0]?.machineId;

      const top1Match = predClass === trueClass;
      const top3Match = ranked.slice(0, 3).some(item => item.machineId === trueClass);
      const top5Match = ranked.slice(0, 5).some(item => item.machineId === trueClass);

      const margin = ranked.length >= 2 ? (ranked[0].score - ranked[1].score) : 0;

      const res = results[s.key];
      if (top1Match) res.top1Count++;
      if (top3Match) res.top3Count++;
      if (top5Match) res.top5Count++;
      res.margins.push(margin);

      res.perClass[trueClass].total++;
      if (top1Match) res.perClass[trueClass].correct++;

      if (!top1Match) {
        const pairKey = `${trueClass} -> ${predClass}`;
        res.confusions[pairKey] = (res.confusions[pairKey] || 0) + 1;
      }
    });
  }

  // ── Print Leave-One-Out Evaluation Summary ──────────────────────────────────
  console.log('==============================================================');
  console.log(' LEAVE-ONE-OUT (LOO) CROSS-VALIDATION SUMMARY (78 Images)');
  console.log('==============================================================\n');

  console.log('Strategy              Top-1       Top-3       Top-5       Avg Margin');
  console.log('----------------------------------------------------------------------');
  strategies.forEach(s => {
    const res = results[s.key];
    const avgMargin = (res.margins.reduce((a, b) => a + b, 0) / res.margins.length).toFixed(4);
    const top1Str = `${res.top1Count}/${res.totalCount} (${((res.top1Count / res.totalCount) * 100).toFixed(1)}%)`.padEnd(12);
    const top3Str = `${res.top3Count}/${res.totalCount} (${((res.top3Count / res.totalCount) * 100).toFixed(1)}%)`.padEnd(12);
    const top5Str = `${res.top5Count}/${res.totalCount} (${((res.top5Count / res.totalCount) * 100).toFixed(1)}%)`.padEnd(12);
    console.log(`${s.name.padEnd(20)}  ${top1Str} ${top3Str} ${top5Str} ${avgMargin}`);
  });
  console.log('');

  // Print Per-Class Top-1 Accuracy
  console.log('----------------------------------------------------------------------');
  console.log('Per-Class Top-1 Accuracy:');
  console.log('----------------------------------------------------------------------');
  const classHeader = 'Machine ID'.padEnd(26) + 'MAX'.padEnd(15) + 'TOP-3 AVG'.padEnd(15) + 'TOP-5 AVG';
  console.log(classHeader);
  console.log('-'.repeat(classHeader.length));

  allMachineIds.sort().forEach(id => {
    const maxAcc = results['MAX'].perClass[id];
    const top3Acc = results['TOP-3'].perClass[id];
    const top5Acc = results['TOP-5'].perClass[id];

    const maxStr = `${maxAcc.correct}/${maxAcc.total} (${((maxAcc.correct / maxAcc.total) * 100).toFixed(0)}%)`.padEnd(15);
    const top3Str = `${top3Acc.correct}/${top3Acc.total} (${((top3Acc.correct / top3Acc.total) * 100).toFixed(0)}%)`.padEnd(15);
    const top5Str = `${top5Acc.correct}/${top5Acc.total} (${((top5Acc.correct / top5Acc.total) * 100).toFixed(0)}%)`;

    console.log(`${id.padEnd(26)}${maxStr}${top3Str}${top5Str}`);
  });
  console.log('');

  // Print Common Misclassifications
  console.log('----------------------------------------------------------------------');
  console.log('Common Misclassifications (Top-1 Errors):');
  console.log('----------------------------------------------------------------------');
  strategies.forEach(s => {
    const confs = results[s.key].confusions;
    const sortedConfs = Object.entries(confs).sort((a, b) => b[1] - a[1]);
    console.log(`[${s.name}] Total Errors: ${results[s.key].totalCount - results[s.key].top1Count}`);
    if (sortedConfs.length === 0) {
      console.log('  None! Perfect accuracy.');
    } else {
      sortedConfs.forEach(([pair, count]) => {
        console.log(`  - ${pair}: ${count} image(s)`);
      });
    }
  });
  console.log('\n');

  // ── Unseen Test Image Evaluation ────────────────────────────────────────────
  console.log('==============================================================');
  console.log(' UNSEEN TEST IMAGE EVALUATION (test_images/new_leg_press.png)');
  console.log('==============================================================\n');

  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.error(`ERROR: Test image missing at ${TEST_IMAGE_PATH}`);
    process.exit(1);
  }

  console.log('[Unseen Test] Loading CLIP feature extractor...');
  const extractor = await pipeline('image-feature-extraction', MODEL_ID);
  console.log('[Unseen Test] Model loaded.');

  const imgRaw = await RawImage.read(TEST_IMAGE_PATH);
  const out = await extractor(imgRaw);
  const rawTestVec = Array.from(out.data);
  const testVecNorm = Array.from(l2Normalize(rawTestVec));

  console.log(`[Unseen Test] Extracted embedding for ${TEST_IMAGE_PATH}\n`);

  const unseenRankings = {};
  strategies.forEach(s => {
    unseenRankings[s.key] = evaluateSet(testVecNorm, entries, s.key);
  });

  console.log('UNSEEN LEG-PRESS RESULT');
  strategies.forEach(s => {
    console.log(`\n${s.name}:`);
    unseenRankings[s.key].forEach((item, index) => {
      const isTarget = item.machineId === ACTUAL_TARGET ? ' <-- ACTUAL TARGET' : '';
      console.log(`${index + 1}. ${item.machineId.padEnd(24)} ${item.score.toFixed(4)}${isTarget}`);
    });
  });

  // ── Final Summary Table (matching prompt spec) ──────────────────────────────
  console.log('\n==============================================================');
  console.log(' FINAL EXPERIMENT COMPARISON SUMMARY');
  console.log('==============================================================\n');

  console.log('Strategy              Top-1       Top-3       Top-5');
  strategies.forEach(s => {
    const res = results[s.key];
    console.log(`${s.name.padEnd(20).replace('AVERAGE', 'AVG')}${res.top1Count}/${res.totalCount}`.padEnd(32) + `${res.top3Count}/${res.totalCount}`.padEnd(44) + `${res.top5Count}/${res.totalCount}`);
  });
  console.log('');
}

main().catch(err => {
  console.error('[eval-multi] Unhandled Fatal Error:', err);
  process.exit(1);
});
