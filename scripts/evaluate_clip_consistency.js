/**
 * scripts/evaluate_clip_consistency.js
 *
 * Standalone experiment script for Gym Scan AI.
 * Evaluates Consistency-Based CLIP Scoring vs MAX and TOP-K Average:
 *  1. MAX
 *  2. ALL-REF-AVG
 *  3. THRESHOLD-DENSITY-0.72 (>= 0.72 ratio)
 *  4. THRESHOLD-DENSITY-0.74 (>= 0.74 ratio)
 *  5. THRESHOLD-DENSITY-0.76 (>= 0.76 ratio)
 *  6. CONSISTENCY-HYBRID (70% min-max normalized ALL-REF-AVG + 30% min-max normalized DENSITY-0.72)
 *
 * Usage:
 *   node scripts/evaluate_clip_consistency.js
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

function minMaxNormalize(valuesMap) {
  // Normalize valuesMap ({ machineId: rawValue }) per query into [0, 1] range
  const entries = Object.entries(valuesMap);
  const rawVals = entries.map(([, v]) => v);
  const min = Math.min(...rawVals);
  const max = Math.max(...rawVals);
  const range = max - min;

  const normalized = {};
  entries.forEach(([id, val]) => {
    normalized[id] = range > 1e-9 ? (val - min) / range : 0.5;
  });
  return normalized;
}

function computeAllScores(candidates, queryEmbedding) {
  // Group similarities by machineId
  const grouped = new Map();
  candidates.forEach(cand => {
    const sim = dotProduct(queryEmbedding, cand.embeddingNorm);
    if (!grouped.has(cand.machineId)) {
      grouped.set(cand.machineId, []);
    }
    grouped.get(cand.machineId).push(sim);
  });

  const rawScores = {
    MAX: {},
    ALL_AVG: {},
    DENSITY_72: {},
    DENSITY_74: {},
    DENSITY_76: {},
    HYBRID: {},
  };

  grouped.forEach((sims, machineId) => {
    const total = sims.length;
    const maxVal = Math.max(...sims);
    const avgVal = sims.reduce((a, b) => a + b, 0) / total;
    const d72 = sims.filter(s => s >= 0.72).length / total;
    const d74 = sims.filter(s => s >= 0.74).length / total;
    const d76 = sims.filter(s => s >= 0.76).length / total;

    rawScores.MAX[machineId] = maxVal;
    rawScores.ALL_AVG[machineId] = avgVal;
    rawScores.DENSITY_72[machineId] = d72;
    rawScores.DENSITY_74[machineId] = d74;
    rawScores.DENSITY_76[machineId] = d76;
  });

  // Calculate Hybrid score using min-max normalized ALL_AVG and DENSITY_72
  const normAvg = minMaxNormalize(rawScores.ALL_AVG);
  const normD72 = minMaxNormalize(rawScores.DENSITY_72);

  Object.keys(rawScores.ALL_AVG).forEach(machineId => {
    rawScores.HYBRID[machineId] = 0.70 * normAvg[machineId] + 0.30 * normD72[machineId];
  });

  // Convert rawScores into ranked lists per strategy
  const strategiesList = [
    { key: 'MAX', name: 'MAX', rawKey: 'MAX' },
    { key: 'ALL_AVG', name: 'ALL-REF-AVG', rawKey: 'ALL_AVG' },
    { key: 'DENSITY_72', name: 'DENSITY >= 0.72', rawKey: 'DENSITY_72' },
    { key: 'DENSITY_74', name: 'DENSITY >= 0.74', rawKey: 'DENSITY_74' },
    { key: 'DENSITY_76', name: 'DENSITY >= 0.76', rawKey: 'DENSITY_76' },
    { key: 'HYBRID', name: 'CONSISTENCY-HYBRID', rawKey: 'HYBRID' },
  ];

  const rankings = {};
  strategiesList.forEach(strat => {
    const scores = rawScores[strat.rawKey];
    rankings[strat.key] = Object.entries(scores)
      .map(([machineId, score]) => ({ machineId, score }))
      .sort((a, b) => b.score - a.score);
  });

  return rankings;
}

async function main() {
  console.log('══════════════════════════════════════════════════════════════');
  console.log(' evaluate_clip_consistency.js (Consistency-Based Scoring)');
  console.log(' Model         :', MODEL_ID);
  console.log(' Embeddings DB :', EMBEDDINGS_PATH);
  console.log(' Test Image    :', TEST_IMAGE_PATH);
  console.log(' Actual Target :', ACTUAL_TARGET);
  console.log('══════════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(EMBEDDINGS_PATH)) {
    console.error(`ERROR: Reference embeddings not found at ${EMBEDDINGS_PATH}`);
    process.exit(1);
  }

  const rawDb = JSON.parse(fs.readFileSync(EMBEDDINGS_PATH, 'utf-8'));
  const entries = (rawDb.entries || []).map(e => ({
    ...e,
    embeddingNorm: Array.from(l2Normalize(e.embedding)),
  }));

  const totalImages = entries.length;
  console.log(`[LOO-Eval] Running Leave-One-Out Evaluation across ${totalImages} images...\n`);

  const strategies = [
    { key: 'MAX', name: 'MAX' },
    { key: 'ALL_AVG', name: 'ALL-REF-AVG' },
    { key: 'DENSITY_72', name: 'DENSITY >= 0.72' },
    { key: 'DENSITY_74', name: 'DENSITY >= 0.74' },
    { key: 'DENSITY_76', name: 'DENSITY >= 0.76' },
    { key: 'HYBRID', name: 'CONSISTENCY-HYBRID' },
  ];

  const allMachineIds = [...new Set(entries.map(e => e.machineId))].sort();

  const results = {};
  strategies.forEach(s => {
    results[s.key] = {
      top1Count: 0,
      top3Count: 0,
      top5Count: 0,
      totalCount: totalImages,
      margins: [],
      perClass: {},
      confusions: {},
    };
    allMachineIds.forEach(id => {
      results[s.key].perClass[id] = { total: 0, correct: 0 };
    });
  });

  // Leave-One-Out Evaluation
  for (let i = 0; i < totalImages; i++) {
    const query = entries[i];
    const candidates = entries.filter((_, idx) => idx !== i);
    const trueClass = query.machineId;

    const queryRankings = computeAllScores(candidates, query.embeddingNorm);

    strategies.forEach(s => {
      const ranked = queryRankings[s.key];
      const predClass = ranked[0]?.machineId;

      const top1Match = predClass === trueClass;
      const top3Match = ranked.slice(0, 3).some(r => r.machineId === trueClass);
      const top5Match = ranked.slice(0, 5).some(r => r.machineId === trueClass);
      const margin    = ranked.length >= 2 ? (ranked[0].score - ranked[1].score) : 0;

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

  // ── PART 2: Summary Table ───────────────────────────────────────────────────
  console.log('======================================================================');
  console.log(' PART 2 — LEAVE-ONE-OUT (LOO) ACCURACY SUMMARY (78 Images)');
  console.log('======================================================================\n');

  console.log('Strategy                  Top-1       Top-3       Top-5       Avg Margin');
  console.log('----------------------------------------------------------------------');
  strategies.forEach(s => {
    const res = results[s.key];
    const top1Str = `${res.top1Count}/${res.totalCount} (${((res.top1Count / res.totalCount) * 100).toFixed(1)}%)`.padEnd(12);
    const top3Str = `${res.top3Count}/${res.totalCount} (${((res.top3Count / res.totalCount) * 100).toFixed(1)}%)`.padEnd(12);
    const top5Str = `${res.top5Count}/${res.totalCount} (${((res.top5Count / res.totalCount) * 100).toFixed(1)}%)`.padEnd(12);
    const avgMargin = (res.margins.reduce((a, b) => a + b, 0) / res.margins.length).toFixed(4);
    console.log(`${s.name.padEnd(24)}  ${top1Str} ${top3Str} ${top5Str} ${avgMargin}`);
  });
  console.log('\n');

  // ── PART 3: Unseen Leg Press Test ───────────────────────────────────────────
  console.log('======================================================================');
  console.log(' PART 3 — UNSEEN LEG-PRESS TEST (test_images/new_leg_press.png)');
  console.log('======================================================================\n');

  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.error(`ERROR: Test image missing at ${TEST_IMAGE_PATH}`);
    process.exit(1);
  }

  console.log('[Unseen Test] Loading CLIP feature extractor...');
  const extractor = await pipeline('image-feature-extraction', MODEL_ID);
  console.log('[Unseen Test] Model loaded.');

  const rawImg = await RawImage.read(TEST_IMAGE_PATH);
  const out = await extractor(rawImg);
  const testVecNorm = Array.from(l2Normalize(Array.from(out.data)));

  const unseenRankings = computeAllScores(entries, testVecNorm);

  console.log('\nUNSEEN LEG-PRESS RANKING RESULTS:\n');
  strategies.forEach(s => {
    console.log(`--- ${s.name} ---`);
    const ranked = unseenRankings[s.key];
    const actualItem = ranked.find(r => r.machineId === ACTUAL_TARGET);
    const actualRank = ranked.findIndex(r => r.machineId === ACTUAL_TARGET) + 1;

    ranked.forEach((item, idx) => {
      const isTarget = item.machineId === ACTUAL_TARGET ? ' <-- ACTUAL TARGET' : '';
      console.log(`  ${idx + 1}. ${item.machineId.padEnd(24)} : ${item.score.toFixed(4)}${isTarget}`);
    });
    console.log(`  => Actual target (${ACTUAL_TARGET}) Rank: ${actualRank}\n`);
  });

  // ── PART 4: Confusion Analysis (Best LOO Strategy) ─────────────────────────
  // Find strategy with highest Top-1 accuracy
  let bestStrat = strategies[0];
  let maxTop1 = -1;
  strategies.forEach(s => {
    if (results[s.key].top1Count > maxTop1) {
      maxTop1 = results[s.key].top1Count;
      bestStrat = s;
    }
  });

  console.log('======================================================================');
  console.log(` PART 4 — CONFUSION ANALYSIS FOR BEST LOO STRATEGY: ${bestStrat.name}`);
  console.log('======================================================================\n');

  console.log('Per-Class Top-1 Accuracy:');
  console.log('----------------------------------------------------------------------');
  allMachineIds.forEach(id => {
    const stat = results[bestStrat.key].perClass[id];
    const pct = ((stat.correct / stat.total) * 100).toFixed(1);
    console.log(`  ${id.padEnd(26)} : ${stat.correct}/${stat.total} (${pct}%)`);
  });
  console.log('');

  console.log('Most Common Confusion Pairs:');
  console.log('----------------------------------------------------------------------');
  const sortedConfs = Object.entries(results[bestStrat.key].confusions).sort((a, b) => b[1] - a[1]);
  if (sortedConfs.length === 0) {
    console.log('  None! Perfect accuracy.');
  } else {
    sortedConfs.forEach(([pair, count]) => {
      console.log(`  - ${pair} : ${count} image(s)`);
    });
  }
  console.log('\n');

  // ── PART 5: Final Summary Table (Matching Prompt Spec) ──────────────────────
  console.log('======================================================================');
  console.log(' FINAL EXPERIMENT COMPARISON TABLE');
  console.log('======================================================================\n');

  console.log('Strategy                  Top-1       Top-3       Top-5');
  console.log('--------------------------------------------------------');
  strategies.forEach(s => {
    const res = results[s.key];
    console.log(`${s.name.padEnd(26)}${res.top1Count}/${res.totalCount}`.padEnd(38) + `${res.top3Count}/${res.totalCount}`.padEnd(50) + `${res.top5Count}/${res.totalCount}`);
  });
  console.log('\n');
}

main().catch(err => {
  console.error('[eval-consistency] Unhandled Fatal Error:', err);
  process.exit(1);
});
