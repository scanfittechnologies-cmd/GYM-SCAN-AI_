/**
 * scripts/evaluate_clip_two_stage.js
 *
 * Standalone experiment script for Gym Scan AI.
 * Evaluates Two-Stage CLIP Recognition:
 *   Stage 1: Retrieve Top 3 candidate machine classes using TOP-3 AVERAGE.
 *   Stage 2: Re-rank Stage 1 candidates using CONSISTENCY SCORE:
 *            50% norm(TOP3_AVG) + 30% norm(ALL_REF_AVG) + 20% norm(DENSITY_0.72)
 *
 * Usage:
 *   node scripts/evaluate_clip_two_stage.js
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

function minMaxNormArray(arr) {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = max - min;
  if (range < 1e-9) {
    return arr.map(() => 1.0);
  }
  return arr.map(v => (v - min) / range);
}

function runTwoStageInference(candidates, queryVecNorm) {
  // Group similarities by machineId
  const grouped = new Map();
  candidates.forEach(cand => {
    const sim = dotProduct(queryVecNorm, cand.embeddingNorm);
    if (!grouped.has(cand.machineId)) {
      grouped.set(cand.machineId, []);
    }
    grouped.get(cand.machineId).push(sim);
  });

  // Calculate STAGE 1: TOP-3 AVERAGE for all 8 machine classes
  const stage1All = [];
  grouped.forEach((sims, machineId) => {
    sims.sort((a, b) => b - a);
    const k3 = Math.min(3, sims.length);
    const top3Avg = sims.slice(0, k3).reduce((a, b) => a + b, 0) / k3;
    const maxSim  = sims[0];
    const allAvg  = sims.reduce((a, b) => a + b, 0) / sims.length;

    stage1All.push({
      machineId,
      maxSim,
      top3Avg,
      allAvg,
      sims,
    });
  });

  // Rank all classes by Stage 1 Top-3 Average
  stage1All.sort((a, b) => b.top3Avg - a.top3Avg);

  // Stage 1 Candidates = Top 3 classes
  const stage1Top3 = stage1All.slice(0, 3);

  // Calculate STAGE 2: Consistency Metrics & Score for Stage 1 Top-3 Candidates
  const candTop3AvgVals = stage1Top3.map(c => c.top3Avg);
  const candAllAvgVals  = stage1Top3.map(c => c.allAvg);
  const candD72Vals     = stage1Top3.map(c => c.sims.filter(s => s >= 0.72).length / c.sims.length);

  const normTop3Avg = minMaxNormArray(candTop3AvgVals);
  const normAllAvg  = minMaxNormArray(candAllAvgVals);
  const normD72     = minMaxNormArray(candD72Vals);

  const stage2Candidates = stage1Top3.map((c, i) => {
    const totalCount = c.sims.length;
    const d72 = candD72Vals[i];
    const d74 = c.sims.filter(s => s >= 0.74).length / totalCount;
    const d76 = c.sims.filter(s => s >= 0.76).length / totalCount;

    const consistencyScore = 0.50 * normTop3Avg[i] + 0.30 * normAllAvg[i] + 0.20 * normD72[i];

    return {
      machineId: c.machineId,
      stage1Top3Avg: c.top3Avg,
      stage1Max: c.maxSim,
      allAvg: c.allAvg,
      density72: d72,
      density74: d74,
      density76: d76,
      normTop3Avg: normTop3Avg[i],
      normAllAvg: normAllAvg[i],
      normD72: normD72[i],
      consistencyScore,
    };
  });

  // Sort Stage 2 candidates by Consistency Score descending
  stage2Candidates.sort((a, b) => b.consistencyScore - a.consistencyScore);

  // Construct final 8-class ranking: Stage 2 Top 3 followed by remaining 5 classes sorted by Stage 1
  const remaining = stage1All.slice(3).map(c => ({
    machineId: c.machineId,
    stage1Top3Avg: c.top3Avg,
    stage1Max: c.maxSim,
    allAvg: c.allAvg,
    density72: c.sims.filter(s => s >= 0.72).length / c.sims.length,
    density74: c.sims.filter(s => s >= 0.74).length / c.sims.length,
    density76: c.sims.filter(s => s >= 0.76).length / c.sims.length,
    consistencyScore: -1, // Not evaluated in Stage 2
  }));

  const finalRanking = [...stage2Candidates, ...remaining];

  return {
    stage1All,
    stage1Top3,
    stage2Candidates,
    finalRanking,
  };
}

async function main() {
  console.log('══════════════════════════════════════════════════════════════');
  console.log(' evaluate_clip_two_stage.js (Two-Stage CLIP Recognition)');
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
  const allMachineIds = [...new Set(entries.map(e => e.machineId))].sort();
  console.log(`[LOO-Eval] Running Leave-One-Out Evaluation across ${totalImages} images...\n`);

  let stage1Top1Correct = 0;
  let stage1Top3Correct = 0;
  let stage1Top5Correct = 0;

  let finalTop1Correct = 0;
  let finalTop3Correct = 0;
  let finalTop5Correct = 0;

  let stage2FixedCount = 0; // Stage 1 wrong, Stage 2 right
  let stage2BrokeCount = 0; // Stage 1 right, Stage 2 wrong

  const finalMargins = [];
  const perClassFinal = {};
  const confusions = {};

  allMachineIds.forEach(id => {
    perClassFinal[id] = { total: 0, correct: 0 };
  });

  // ── TASK 4: Leave-One-Out Evaluation ────────────────────────────────────────
  for (let i = 0; i < totalImages; i++) {
    const query = entries[i];
    const candidates = entries.filter((_, idx) => idx !== i);
    const trueClass = query.machineId;

    const res = runTwoStageInference(candidates, query.embeddingNorm);

    const s1Pred = res.stage1All[0].machineId;
    const s1Top3Match = res.stage1All.slice(0, 3).some(c => c.machineId === trueClass);
    const s1Top5Match = res.stage1All.slice(0, 5).some(c => c.machineId === trueClass);

    if (s1Pred === trueClass) stage1Top1Correct++;
    if (s1Top3Match) stage1Top3Correct++;
    if (s1Top5Match) stage1Top5Correct++;

    const finalPred = res.finalRanking[0].machineId;
    const finalTop3Match = res.finalRanking.slice(0, 3).some(c => c.machineId === trueClass);
    const finalTop5Match = res.finalRanking.slice(0, 5).some(c => c.machineId === trueClass);
    const margin = res.finalRanking.length >= 2 ? (res.finalRanking[0].consistencyScore - res.finalRanking[1].consistencyScore) : 0;

    if (finalPred === trueClass) finalTop1Correct++;
    if (finalTop3Match) finalTop3Correct++;
    if (finalTop5Match) finalTop5Correct++;
    finalMargins.push(margin);

    perClassFinal[trueClass].total++;
    if (finalPred === trueClass) perClassFinal[trueClass].correct++;

    // Track transitions between Stage 1 and Stage 2
    if (s1Pred !== trueClass && finalPred === trueClass) {
      stage2FixedCount++;
    }
    if (s1Pred === trueClass && finalPred !== trueClass) {
      stage2BrokeCount++;
    }

    if (finalPred !== trueClass) {
      const pairKey = `${trueClass} -> ${finalPred}`;
      confusions[pairKey] = (confusions[pairKey] || 0) + 1;
    }
  }

  // ── TASK 4 SUMMARY ──────────────────────────────────────────────────────────
  console.log('======================================================================');
  console.log(' TASK 4 — LEAVE-ONE-OUT (LOO) EVALUATION SUMMARY (78 Images)');
  console.log('======================================================================\n');

  console.log(`Stage 1 (TOP-3 AVERAGE) Top-1 Accuracy : ${stage1Top1Correct}/${totalImages} (${((stage1Top1Correct / totalImages) * 100).toFixed(1)}%)`);
  console.log(`Stage 1 (TOP-3 AVERAGE) Top-3 Accuracy : ${stage1Top3Correct}/${totalImages} (${((stage1Top3Correct / totalImages) * 100).toFixed(1)}%)`);
  console.log(`Stage 1 (TOP-3 AVERAGE) Top-5 Accuracy : ${stage1Top5Correct}/${totalImages} (${((stage1Top5Correct / totalImages) * 100).toFixed(1)}%)\n`);

  console.log(`Two-Stage Final Ranking Top-1 Accuracy : ${finalTop1Correct}/${totalImages} (${((finalTop1Correct / totalImages) * 100).toFixed(1)}%)`);
  console.log(`Two-Stage Final Ranking Top-3 Accuracy : ${finalTop3Correct}/${totalImages} (${((finalTop3Correct / totalImages) * 100).toFixed(1)}%)`);
  console.log(`Two-Stage Final Ranking Top-5 Accuracy : ${finalTop5Correct}/${totalImages} (${((finalTop5Correct / totalImages) * 100).toFixed(1)}%)`);
  const avgMargin = (finalMargins.reduce((a, b) => a + b, 0) / finalMargins.length).toFixed(4);
  console.log(`Average Two-Stage Top-1/Top-2 Margin   : ${avgMargin}\n`);

  console.log(`Stage 2 Transitions:`);
  console.log(`  - Mistakes Fixed (Stage 1 Wrong -> Stage 2 Correct) : ${stage2FixedCount}`);
  console.log(`  - Correct Broken (Stage 1 Correct -> Stage 2 Wrong) : ${stage2BrokeCount}\n`);

  console.log('Per-Class Top-1 Accuracy (Two-Stage Final):');
  console.log('----------------------------------------------------------------------');
  allMachineIds.forEach(id => {
    const stat = perClassFinal[id];
    const pct  = ((stat.correct / stat.total) * 100).toFixed(1);
    console.log(`  ${id.padEnd(26)} : ${stat.correct}/${stat.total} (${pct}%)`);
  });
  console.log('');

  console.log('Most Common Confusion Pairs (Two-Stage Final):');
  console.log('----------------------------------------------------------------------');
  const sortedConfs = Object.entries(confusions).sort((a, b) => b[1] - a[1]);
  if (sortedConfs.length === 0) {
    console.log('  None! Perfect accuracy.');
  } else {
    sortedConfs.forEach(([pair, count]) => {
      console.log(`  - ${pair} : ${count} image(s)`);
    });
  }
  console.log('\n');

  // ── TASK 5: Unseen Leg-Press Test ───────────────────────────────────────────
  console.log('======================================================================');
  console.log(' TASK 5 — UNSEEN LEG-PRESS TEST (test_images/new_leg_press.png)');
  console.log('======================================================================\n');

  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.error(`ERROR: Test image missing at ${TEST_IMAGE_PATH}`);
    process.exit(1);
  }

  console.log('[Unseen Test] Loading CLIP feature extractor...');
  const extractor = await pipeline('image-feature-extraction', MODEL_ID);
  console.log('[Unseen Test] Feature extractor loaded.');

  const rawImg = await RawImage.read(TEST_IMAGE_PATH);
  const out = await extractor(rawImg);
  const testVecNorm = Array.from(l2Normalize(Array.from(out.data)));

  const unseenRes = runTwoStageInference(entries, testVecNorm);

  console.log('\nSTAGE 1 — TOP-3 AVERAGE (All 8 Classes Ranked):');
  console.log('----------------------------------------------------------------------');
  unseenRes.stage1All.forEach((item, idx) => {
    const isTarget = item.machineId === ACTUAL_TARGET ? ' <-- ACTUAL TARGET' : '';
    console.log(`  ${idx + 1}. ${item.machineId.padEnd(26)} Top3Avg: ${item.top3Avg.toFixed(4)}${isTarget}`);
  });

  const s1LegPressRank = unseenRes.stage1All.findIndex(c => c.machineId === ACTUAL_TARGET) + 1;
  console.log(`\n  => Stage 1 Rank of leg-press-45: ${s1LegPressRank}\n`);

  console.log('STAGE 2 — CONSISTENCY RE-RANKING (Top 3 Stage 1 Candidates):');
  console.log('----------------------------------------------------------------------');
  console.log('Machine                    Top3Avg  AllAvg   D>=0.72  D>=0.74  D>=0.76  ConsistencyScore');
  console.log('-----------------------------------------------------------------------------------------');

  unseenRes.stage2Candidates.forEach((c, idx) => {
    const isTarget = c.machineId === ACTUAL_TARGET ? '*' : ' ';
    const label = `${isTarget}${c.machineId}`.padEnd(26);
    const t3    = c.stage1Top3Avg.toFixed(4).padEnd(9);
    const all   = c.allAvg.toFixed(4).padEnd(9);
    const d72   = c.density72.toFixed(4).padEnd(9);
    const d74   = c.density74.toFixed(4).padEnd(9);
    const d76   = c.density76.toFixed(4).padEnd(9);
    const score = c.consistencyScore.toFixed(4);
    console.log(`${label}${t3}${all}${d72}${d74}${d76}${score}`);
  });

  const s2LegPressRank = unseenRes.finalRanking.findIndex(c => c.machineId === ACTUAL_TARGET) + 1;
  console.log(`\n  => Final Two-Stage Rank of leg-press-45: ${s2LegPressRank}\n`);

  // ── TASK 6: Comparison Table ────────────────────────────────────────────────
  console.log('======================================================================');
  console.log(' TASK 6 — FINAL ACCURACY & UNSEEN TEST COMPARISON');
  console.log('======================================================================\n');

  console.log('METHOD                         TOP-1       TOP-3       TOP-5');
  console.log('----------------------------------------------------------------------');
  console.log(`CLIP MAX                       84.6%       98.7%       100.0%`);
  console.log(`CLIP TOP-3 AVERAGE             87.2%       100.0%      100.0%`);
  const finalTop1Pct = ((finalTop1Correct / totalImages) * 100).toFixed(1);
  const finalTop3Pct = ((finalTop3Correct / totalImages) * 100).toFixed(1);
  const finalTop5Pct = ((finalTop5Correct / totalImages) * 100).toFixed(1);
  console.log(`TWO-STAGE CLIP                 ${finalTop1Pct}%       ${finalTop3Pct}%      ${finalTop5Pct}%\n`);

  console.log('UNSEEN LEG-PRESS (test_images/new_leg_press.png) RANKINGS:');
  console.log('----------------------------------------------------------------------');
  console.log(`MAX                          Rank 3 (seated-cable-row #1)`);
  console.log(`TOP-3 AVERAGE                Rank 3 (seated-cable-row #1)`);
  console.log(`TWO-STAGE CLIP               Rank ${s2LegPressRank} (${unseenRes.finalRanking[0].machineId} #1)\n`);
}

main().catch(err => {
  console.error('[two-stage] Unhandled Fatal Error:', err);
  process.exit(1);
});
