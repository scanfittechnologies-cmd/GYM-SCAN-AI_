/**
 * evaluate_reference_embeddings.js
 *
 * Evaluates CLIP image embeddings (Xenova/clip-vit-base-patch32) on the 78 reference images
 * using leave-one-out cross-validation (query image excluded from candidate index).
 *
 * Outputs: embeddings/reference_embedding_evaluation.json
 *
 * Does NOT modify any existing server or pipeline code.
 */

import fs from 'fs';
import path from 'path';
import { pipeline, RawImage } from '@huggingface/transformers';

const PROJECT_ROOT        = process.cwd();
const EMBEDDINGS_PATH     = path.join(PROJECT_ROOT, 'embeddings', 'reference_embeddings.json');
const OUTPUT_EVAL_PATH    = path.join(PROJECT_ROOT, 'embeddings', 'reference_embedding_evaluation.json');
const MODEL_ID            = 'Xenova/clip-vit-base-patch32';

// ── Math & Stat Helpers ───────────────────────────────────────────────────────

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

function computeStats(arr) {
  if (!arr || arr.length === 0) {
    return { count: 0, min: 0, max: 0, mean: 0, median: 0, p25: 0, p75: 0 };
  }
  const sorted = [...arr].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const mean = sum / count;

  const getPercentile = (p) => {
    const idx = (count - 1) * p;
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    const weight = idx - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  return {
    count,
    min: Number(sorted[0].toFixed(4)),
    max: Number(sorted[count - 1].toFixed(4)),
    mean: Number(mean.toFixed(4)),
    median: Number(getPercentile(0.5).toFixed(4)),
    p25: Number(getPercentile(0.25).toFixed(4)),
    p75: Number(getPercentile(0.75).toFixed(4)),
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();
  console.log('══════════════════════════════════════════════════════════════');
  console.log(' evaluate_reference_embeddings.js');
  console.log(' Model      :', MODEL_ID);
  console.log(' Embeddings :', EMBEDDINGS_PATH);
  console.log(' Output     :', OUTPUT_EVAL_PATH);
  console.log('══════════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(EMBEDDINGS_PATH)) {
    console.error(`[eval] ERROR: Embeddings file not found: ${EMBEDDINGS_PATH}`);
    process.exit(1);
  }

  const dbData = JSON.parse(fs.readFileSync(EMBEDDINGS_PATH, 'utf-8'));
  const entries = dbData.entries || [];

  if (entries.length === 0) {
    console.error('[eval] ERROR: No entries found in reference_embeddings.json');
    process.exit(1);
  }

  console.log(`[eval] Loaded ${entries.length} reference embeddings from index.`);

  // Verify feature extractor runtime loading
  console.log(`[eval] Initializing CLIP model "${MODEL_ID}" for runtime extraction verification...`);
  let extractor;
  try {
    extractor = await pipeline('image-feature-extraction', MODEL_ID);
    console.log('[eval] Model initialized successfully.\n');
  } catch (err) {
    console.error(`[eval] ERROR initializing CLIP model: ${err.message}`);
    process.exit(1);
  }

  // Extract list of all unique machine IDs
  const allMachineIds = Array.from(new Set(entries.map(e => e.machineId))).sort();
  console.log(`[eval] Unique machines in dataset (${allMachineIds.length}): ${allMachineIds.join(', ')}\n`);

  // We will run Leave-One-Out evaluation across all 78 images
  // For each query image, extract fresh embedding via model (to test full pipeline end-to-end)
  // and match against all candidate embeddings in DB excluding the query entry itself.
  
  const queryResults = [];
  let top1CorrectCount = 0;
  let top3CorrectCount = 0;
  let top5CorrectCount = 0;

  const correctSimilarities = [];
  const incorrectSimilarities = [];
  const marginList = [];

  // Confusion matrix mapping: actualMachineId -> predictedMachineId -> count
  const confusionMatrix = {};
  allMachineIds.forEach(m1 => {
    confusionMatrix[m1] = {};
    allMachineIds.forEach(m2 => {
      confusionMatrix[m1][m2] = 0;
    });
  });

  console.log('[eval] Evaluating 78 queries using Leave-One-Out cross-validation...\n');

  for (let i = 0; i < entries.length; i++) {
    const queryEntry = entries[i];
    const absPath = path.join(PROJECT_ROOT, queryEntry.relative_path);
    const label = queryEntry.relative_path.replace('reference_images/', '');

    // Extract query embedding dynamically to verify runtime feature extraction
    let queryEmbedding;
    try {
      const rawImg = await RawImage.read(absPath);
      const rawTensor = await extractor(rawImg);
      const rawArr = Array.from(rawTensor.data);
      queryEmbedding = Array.from(l2Normalize(rawArr));
    } catch (err) {
      console.warn(`[eval] Warning: Failed dynamic extraction for ${label}, falling back to stored vector: ${err.message}`);
      queryEmbedding = queryEntry.embedding;
    }

    const actualMachineId = queryEntry.machineId;

    // Filter candidate set: exclude query image itself
    const candidates = entries.filter(e => e.relative_path !== queryEntry.relative_path);

    // Aggregate similarities per machine using MAX SIMILARITY (nearest reference neighbor score)
    // Also compute Top-3 average per machine for comparison
    const machineScoresMap = new Map();

    candidates.forEach(cand => {
      const sim = dotProduct(queryEmbedding, cand.embedding);
      if (!machineScoresMap.has(cand.machineId)) {
        machineScoresMap.set(cand.machineId, {
          machineId: cand.machineId,
          machineName: cand.machineName,
          category: cand.category,
          sims: [],
          bestImg: cand.relative_path,
          bestSim: -1,
        });
      }
      const record = machineScoresMap.get(cand.machineId);
      record.sims.push(sim);
      if (sim > record.bestSim) {
        record.bestSim = sim;
        record.bestImg = cand.relative_path;
      }
    });

    // Score machines by MAX similarity
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

    const predictedMachineId = rankedMachines[0].machineId;
    const top1Sim = rankedMachines[0].maxSimilarity;
    const top2Sim = rankedMachines.length > 1 ? rankedMachines[1].maxSimilarity : 0;
    const margin = Number((top1Sim - top2Sim).toFixed(4));

    const isTop1 = predictedMachineId === actualMachineId;
    const isTop3 = rankedMachines.slice(0, 3).some(m => m.machineId === actualMachineId);
    const isTop5 = rankedMachines.slice(0, 5).some(m => m.machineId === actualMachineId);

    if (isTop1) {
      top1CorrectCount++;
      correctSimilarities.push(top1Sim);
    } else {
      incorrectSimilarities.push(top1Sim);
    }

    if (isTop3) top3CorrectCount++;
    if (isTop5) top5CorrectCount++;

    marginList.push(margin);
    confusionMatrix[actualMachineId][predictedMachineId]++;

    queryResults.push({
      queryIndex: i + 1,
      queryFilename: queryEntry.filename,
      queryPath: queryEntry.relative_path,
      actualMachineId,
      predictedMachineId,
      isCorrect: isTop1,
      inTop3: isTop3,
      inTop5: isTop5,
      top1Similarity: top1Sim,
      marginToTop2: margin,
      top5Candidates: rankedMachines.slice(0, 5),
    });
  }

  // Calculate overall metrics
  const totalQueries = entries.length;
  const top1Acc = Number((top1CorrectCount / totalQueries).toFixed(4));
  const top3Acc = Number((top3CorrectCount / totalQueries).toFixed(4));
  const top5Acc = Number((top5CorrectCount / totalQueries).toFixed(4));

  const correctSimStats = computeStats(correctSimilarities);
  const incorrectSimStats = computeStats(incorrectSimilarities);
  const marginStats = computeStats(marginList);

  // Identify confused machine pairs (actual -> predicted where actual != predicted)
  const confusedPairs = [];
  allMachineIds.forEach(actual => {
    allMachineIds.forEach(predicted => {
      if (actual !== predicted) {
        const count = confusionMatrix[actual][predicted];
        if (count > 0) {
          confusedPairs.push({
            actualMachineId: actual,
            predictedMachineId: predicted,
            errorCount: count,
          });
        }
      }
    });
  });
  confusedPairs.sort((a, b) => b.errorCount - a.errorCount);

  // Per-machine accuracy breakdown
  const machineBreakdown = {};
  allMachineIds.forEach(mId => {
    const mQueries = queryResults.filter(q => q.actualMachineId === mId);
    const mCorrect = mQueries.filter(q => q.isCorrect).length;
    machineBreakdown[mId] = {
      total: mQueries.length,
      correct: mCorrect,
      accuracy: Number((mCorrect / (mQueries.length || 1)).toFixed(4)),
    };
  });

  const evaluationOutput = {
    model: MODEL_ID,
    evaluationType: 'Leave-One-Out Cross Validation',
    aggregationMethod: 'Max Similarity Per Machine across Reference Candidates',
    totalQueries,
    accuracy: {
      top1Count: top1CorrectCount,
      top1Accuracy: top1Acc,
      top3Count: top3CorrectCount,
      top3Accuracy: top3Acc,
      top5Count: top5CorrectCount,
      top5Accuracy: top5Acc,
    },
    similarityDistributions: {
      correctMatches: correctSimStats,
      incorrectMatches: incorrectSimStats,
      top1VsTop2Margin: marginStats,
    },
    confusionMatrix,
    mostConfusedPairs: confusedPairs,
    perMachineBreakdown: machineBreakdown,
    queryDetails: queryResults,
    evaluatedAt: new Date().toISOString(),
  };

  // Write evaluation JSON
  const dir = path.dirname(OUTPUT_EVAL_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(OUTPUT_EVAL_PATH, JSON.stringify(evaluationOutput, null, 2), 'utf-8');

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  // ── Console Formatting ──────────────────────────────────────────────────────

  console.log('══════════════════════════════════════════════════════════════');
  console.log(' CLIP EMBEDDING EVALUATION SUMMARY');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(` Strategy      : Leave-One-Out (Query excluded from candidates)`);
  console.log(` Aggregation   : Max Similarity per Machine`);
  console.log(` Total Queries : ${totalQueries}`);
  console.log(` Top-1 Accuracy: ${(top1Acc * 100).toFixed(2)}% (${top1CorrectCount}/${totalQueries})`);
  console.log(` Top-3 Accuracy: ${(top3Acc * 100).toFixed(2)}% (${top3CorrectCount}/${totalQueries})`);
  console.log(` Top-5 Accuracy: ${(top5Acc * 100).toFixed(2)}% (${top5CorrectCount}/${totalQueries})`);
  console.log(` Evaluation Time: ${durationSec}s\n`);

  console.log('── Similarity Distributions ──────────────────────────────────');
  console.log(` Correct Matches   (n=${correctSimStats.count}) : mean=${correctSimStats.mean}, min=${correctSimStats.min}, max=${correctSimStats.max}, median=${correctSimStats.median}`);
  console.log(` Incorrect Matches (n=${incorrectSimStats.count}) : mean=${incorrectSimStats.mean}, min=${incorrectSimStats.min}, max=${incorrectSimStats.max}, median=${incorrectSimStats.median}`);
  console.log(` Top-1 Margin      (n=${marginStats.count}) : mean=${marginStats.mean}, min=${marginStats.min}, max=${marginStats.max}, median=${marginStats.median}\n`);

  console.log('── Per-Machine Accuracy Breakdown ────────────────────────────');
  allMachineIds.forEach(mId => {
    const stats = machineBreakdown[mId];
    const pct = (stats.accuracy * 100).toFixed(1).padStart(5);
    console.log(` ${mId.padEnd(26)} : ${stats.correct}/${stats.total} (${pct}%)`);
  });
  console.log();

  console.log('── Confusion Matrix (Actual ↓ vs Predicted →) ────────────────');
  const shortHeaders = allMachineIds.map(m => m.slice(0, 6).padEnd(6));
  console.log(''.padEnd(24) + shortHeaders.join(' '));
  allMachineIds.forEach(actual => {
    const rowStr = allMachineIds.map(pred => String(confusionMatrix[actual][pred]).padStart(6)).join(' ');
    console.log(` ${actual.padEnd(22)} ${rowStr}`);
  });
  console.log();

  if (confusedPairs.length > 0) {
    console.log('── Most Commonly Confused Machine Pairs ─────────────────────');
    confusedPairs.forEach(p => {
      console.log(` Actual: ${p.actualMachineId.padEnd(24)} -> Predicted: ${p.predictedMachineId.padEnd(24)} (${p.errorCount} error${p.errorCount > 1 ? 's' : ''})`);
    });
  } else {
    console.log('── Most Commonly Confused Machine Pairs ─────────────────────');
    console.log(' None! 100% perfect classification across all 78 reference images.');
  }

  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(` Detailed evaluation saved to: ${OUTPUT_EVAL_PATH}`);
  console.log('══════════════════════════════════════════════════════════════');
}

main().catch(err => {
  console.error('[eval] Fatal error during evaluation:', err);
  process.exit(1);
});
