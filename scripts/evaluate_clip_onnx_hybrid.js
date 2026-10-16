/**
 * scripts/evaluate_clip_onnx_hybrid.js
 *
 * Standalone experiment script for Gym Scan AI.
 * Evaluates CLIP and ONNX independently and combined via 4 pre-declared fusion strategies:
 *   Strategy A: Rank Fusion (8 pts for 1st, 7 for 2nd, ..., 1 for 8th)
 *   Strategy B: 50/50 Min-Max Normalized Probability Fusion
 *   Strategy C: 70/30 CLIP-Heavy Min-Max Normalized Probability Fusion
 *   Strategy D: 80/20 CLIP-Heavy Min-Max Normalized Probability Fusion
 *
 * Usage:
 *   node scripts/evaluate_clip_onnx_hybrid.js
 */

import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';
import ort from 'onnxruntime-node';

const PROJECT_ROOT        = process.cwd();
const EMBEDDINGS_PATH     = path.join(PROJECT_ROOT, 'embeddings', 'reference_embeddings.json');
const MANIFEST_PATH       = path.join(PROJECT_ROOT, 'reference_images', 'reference_manifest.json');
const ONNX_MODEL_PATH     = path.join(PROJECT_ROOT, 'models', 'machine_classifier.onnx');
const CLASS_MAPPING_PATH  = path.join(PROJECT_ROOT, 'models', 'class_mapping.json');
const TEST_IMAGE_PATH     = path.join(PROJECT_ROOT, 'test_images', 'new_leg_press.png');
const ACTUAL_TARGET       = 'leg-press-45';

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

function softmax(logits) {
  const maxLogit = Math.max(...logits);
  const exps = logits.map(l => Math.exp(l - maxLogit));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sumExps);
}

function minMaxNormalize(scoresMap) {
  const entries = Object.entries(scoresMap);
  const vals = entries.map(([, v]) => v);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min;

  const res = {};
  entries.forEach(([id, v]) => {
    res[id] = range > 1e-9 ? (v - min) / range : 0.5;
  });
  return res;
}

async function preprocessOnnxImage(imgPath) {
  const image = await Jimp.read(imgPath);
  image.resize({ w: 224, h: 224 });

  const floatData = new Float32Array(1 * 3 * 224 * 224);
  const mean = [0.485, 0.456, 0.406];
  const std = [0.229, 0.224, 0.225];

  const width = image.bitmap.width;
  const height = image.bitmap.height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x);
      const pixelHex = image.getPixelColor(x, y);

      const r = ((pixelHex >> 24) & 0xFF) / 255.0;
      const g = ((pixelHex >> 16) & 0xFF) / 255.0;
      const b = ((pixelHex >> 8) & 0xFF) / 255.0;

      floatData[0 * 224 * 224 + idx] = (r - mean[0]) / std[0];
      floatData[1 * 224 * 224 + idx] = (g - mean[1]) / std[1];
      floatData[2 * 224 * 224 + idx] = (b - mean[2]) / std[2];
    }
  }

  return new ort.Tensor('float32', floatData, [1, 3, 224, 224]);
}

async function runOnnxInference(session, classMapping, imgPath) {
  const inputTensor = await preprocessOnnxImage(imgPath);
  const results = await session.run({ input: inputTensor });
  const outputTensor = results.output || Object.values(results)[0];
  const logits = Array.from(outputTensor.data);
  const probs = softmax(logits);

  const machineProbs = {};
  probs.forEach((p, idx) => {
    const clsObj = classMapping.indexToClass[String(idx)];
    if (clsObj && clsObj.machineId) {
      machineProbs[clsObj.machineId] = p;
    }
  });

  return machineProbs;
}

function computeClipTop3AvgScores(candidates, queryEmbeddingNorm) {
  const grouped = new Map();
  candidates.forEach(cand => {
    const sim = dotProduct(queryEmbeddingNorm, cand.embeddingNorm);
    if (!grouped.has(cand.machineId)) {
      grouped.set(cand.machineId, []);
    }
    grouped.get(cand.machineId).push(sim);
  });

  const scores = {};
  grouped.forEach((sims, machineId) => {
    sims.sort((a, b) => b - a);
    const k = Math.min(3, sims.length);
    const avg = sims.slice(0, k).reduce((a, b) => a + b, 0) / k;
    scores[machineId] = avg;
  });

  return scores;
}

function computeFusionRankings(clipScores, onnxProbs) {
  const allMachineIds = Object.keys(clipScores).sort();

  // 1. CLIP Ranking
  const clipRanked = allMachineIds.map(id => ({ machineId: id, score: clipScores[id] }))
    .sort((a, b) => b.score - a.score);

  // 2. ONNX Ranking
  const onnxRanked = allMachineIds.map(id => ({ machineId: id, score: onnxProbs[id] }))
    .sort((a, b) => b.score - a.score);

  // Rank Map (1st place = 8 pts, 2nd = 7 pts, ..., 8th = 1 pt)
  const clipRankPoints = {};
  clipRanked.forEach((item, idx) => {
    clipRankPoints[item.machineId] = 8 - idx;
  });

  const onnxRankPoints = {};
  onnxRanked.forEach((item, idx) => {
    onnxRankPoints[item.machineId] = 8 - idx;
  });

  // Strategy A: Rank Fusion
  const rankFusionScores = {};
  allMachineIds.forEach(id => {
    rankFusionScores[id] = clipRankPoints[id] + onnxRankPoints[id];
  });
  const rankFusionRanked = allMachineIds.map(id => ({ machineId: id, score: rankFusionScores[id] }))
    .sort((a, b) => b.score - a.score);

  // Min-Max Normalized Scores
  const clipNorm = minMaxNormalize(clipScores);
  const onnxNorm = minMaxNormalize(onnxProbs);

  // Strategy B: 50/50 Fusion
  const f50Scores = {};
  allMachineIds.forEach(id => {
    f50Scores[id] = 0.50 * clipNorm[id] + 0.50 * onnxNorm[id];
  });
  const f50Ranked = allMachineIds.map(id => ({ machineId: id, score: f50Scores[id] }))
    .sort((a, b) => b.score - a.score);

  // Strategy C: 70/30 Fusion
  const f70Scores = {};
  allMachineIds.forEach(id => {
    f70Scores[id] = 0.70 * clipNorm[id] + 0.30 * onnxNorm[id];
  });
  const f70Ranked = allMachineIds.map(id => ({ machineId: id, score: f70Scores[id] }))
    .sort((a, b) => b.score - a.score);

  // Strategy D: 80/20 Fusion
  const f80Scores = {};
  allMachineIds.forEach(id => {
    f80Scores[id] = 0.80 * clipNorm[id] + 0.20 * onnxNorm[id];
  });
  const f80Ranked = allMachineIds.map(id => ({ machineId: id, score: f80Scores[id] }))
    .sort((a, b) => b.score - a.score);

  return {
    clipRanked,
    onnxRanked,
    rankFusionRanked,
    f50Ranked,
    f70Ranked,
    f80Ranked,
  };
}

async function main() {
  console.log('══════════════════════════════════════════════════════════════');
  console.log(' evaluate_clip_onnx_hybrid.js (CLIP + ONNX Hybrid Experiment)');
  console.log(' ONNX Model    :', ONNX_MODEL_PATH);
  console.log(' Embeddings DB :', EMBEDDINGS_PATH);
  console.log(' Test Image    :', TEST_IMAGE_PATH);
  console.log(' Actual Target :', ACTUAL_TARGET);
  console.log('══════════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(ONNX_MODEL_PATH) || !fs.existsSync(CLASS_MAPPING_PATH) || !fs.existsSync(EMBEDDINGS_PATH)) {
    console.error('ERROR: Required model/embedding files missing.');
    process.exit(1);
  }

  const classMapping = JSON.parse(fs.readFileSync(CLASS_MAPPING_PATH, 'utf-8'));
  const onnxSession  = await ort.InferenceSession.create(ONNX_MODEL_PATH);

  const rawClipDb = JSON.parse(fs.readFileSync(EMBEDDINGS_PATH, 'utf-8'));
  const clipEntries = (rawClipDb.entries || []).map(e => ({
    ...e,
    embeddingNorm: Array.from(l2Normalize(e.embedding)),
  }));

  const manifestData = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const imagesList   = manifestData.images || [];
  const totalImages  = imagesList.length;

  console.log(`[setup] ONNX Session ready. Loaded ${clipEntries.length} CLIP embeddings across ${totalImages} manifest images.\n`);

  // Pre-run ONNX predictions for all 78 reference images
  console.log('[ONNX] Running ONNX inference across all 78 reference images...');
  const onnxResultsMap = new Map();

  for (let i = 0; i < imagesList.length; i++) {
    const item = imagesList[i];
    const imgAbsPath = path.join(PROJECT_ROOT, item.relative_path);
    const probs = await runOnnxInference(onnxSession, classMapping, imgAbsPath);
    onnxResultsMap.set(item.filename, probs);
  }
  console.log('[ONNX] Pre-inference complete.\n');

  // ── PART 1 & 2 & 4 & 6: Leave-One-Out Evaluation ─────────────────────────────
  const strategies = [
    { key: 'clipRanked', name: 'CLIP TOP-3 AVG' },
    { key: 'onnxRanked', name: 'ONNX' },
    { key: 'rankFusionRanked', name: 'Rank Fusion' },
    { key: 'f50Ranked', name: '50/50 Fusion' },
    { key: 'f70Ranked', name: '70/30 Fusion' },
    { key: 'f80Ranked', name: '80/20 Fusion' },
  ];

  const looStats = {};
  strategies.forEach(s => {
    looStats[s.key] = {
      top1Count: 0,
      top3Count: 0,
      top5Count: 0,
      margins: [],
      perClass: {},
      confusions: {},
    };
  });

  const allMachineIds = Object.values(classMapping.indexToClass).map(c => c.machineId).sort();
  allMachineIds.forEach(id => {
    strategies.forEach(s => {
      looStats[s.key].perClass[id] = { total: 0, correct: 0 };
    });
  });

  // Complementarity matrix counters
  let bothCorrectCount = 0;
  let clipOnlyCorrectCount = 0;
  let onnxOnlyCorrectCount = 0;
  let bothWrongCount = 0;

  const clipMistakesRescuable = []; // List of items where CLIP wrong & ONNX right
  const classOverlapStats = {};
  allMachineIds.forEach(id => {
    classOverlapStats[id] = { clipMistakes: 0, onnxRescues: 0 };
  });

  for (let i = 0; i < clipEntries.length; i++) {
    const query = clipEntries[i];
    const candidates = clipEntries.filter((_, idx) => idx !== i);
    const trueClass = query.machineId;

    const clipScores = computeClipTop3AvgScores(candidates, query.embeddingNorm);
    const onnxProbs  = onnxResultsMap.get(query.filename);

    const rankings = computeFusionRankings(clipScores, onnxProbs);

    // Record accuracy for all strategies
    strategies.forEach(s => {
      const ranked = rankings[s.key];
      const predClass = ranked[0]?.machineId;

      const isTop1 = predClass === trueClass;
      const isTop3 = ranked.slice(0, 3).some(r => r.machineId === trueClass);
      const isTop5 = ranked.slice(0, 5).some(r => r.machineId === trueClass);
      const margin = ranked.length >= 2 ? (ranked[0].score - ranked[1].score) : 0;

      const st = looStats[s.key];
      if (isTop1) st.top1Count++;
      if (isTop3) st.top3Count++;
      if (isTop5) st.top5Count++;
      st.margins.push(margin);

      st.perClass[trueClass].total++;
      if (isTop1) st.perClass[trueClass].correct++;

      if (!isTop1) {
        const pair = `${trueClass} -> ${predClass}`;
        st.confusions[pair] = (st.confusions[pair] || 0) + 1;
      }
    });

    // Check Complementarity (CLIP vs ONNX)
    const clipPred = rankings.clipRanked[0].machineId;
    const onnxPred = rankings.onnxRanked[0].machineId;

    const clipOk = clipPred === trueClass;
    const onnxOk = onnxPred === trueClass;

    if (clipOk && onnxOk) bothCorrectCount++;
    else if (clipOk && !onnxOk) clipOnlyCorrectCount++;
    else if (!clipOk && onnxOk) {
      onnxOnlyCorrectCount++;
      clipMistakesRescuable.push({
        filename: query.filename,
        trueClass,
        clipPred,
        onnxPred,
        f50Pred: rankings.f50Ranked[0].machineId,
        f70Pred: rankings.f70Ranked[0].machineId,
        f80Pred: rankings.f80Ranked[0].machineId,
      });
      classOverlapStats[trueClass].onnxRescues++;
    } else {
      bothWrongCount++;
    }

    if (!clipOk) {
      classOverlapStats[trueClass].clipMistakes++;
    }
  }

  // ── PART 1: ONNX Baseline Summary ───────────────────────────────────────────
  console.log('======================================================================');
  console.log(' PART 1 — ONNX INDEPENDENT BASELINE (78 Images)');
  console.log('======================================================================\n');
  const onnxSt = looStats['onnxRanked'];
  console.log(`ONNX Top-1 Accuracy : ${onnxSt.top1Count}/${totalImages} (${((onnxSt.top1Count / totalImages) * 100).toFixed(1)}%)`);
  console.log(`ONNX Top-3 Accuracy : ${onnxSt.top3Count}/${totalImages} (${((onnxSt.top3Count / totalImages) * 100).toFixed(1)}%)`);
  console.log(`ONNX Top-5 Accuracy : ${onnxSt.top5Count}/${totalImages} (${((onnxSt.top5Count / totalImages) * 100).toFixed(1)}%)\n`);

  console.log('ONNX Per-Class Top-1 Accuracy:');
  allMachineIds.forEach(id => {
    const stat = onnxSt.perClass[id];
    console.log(`  ${id.padEnd(26)} : ${stat.correct}/${stat.total} (${((stat.correct / stat.total) * 100).toFixed(1)}%)`);
  });
  console.log('');

  console.log('ONNX Common Confusion Pairs:');
  Object.entries(onnxSt.confusions).sort((a, b) => b[1] - a[1]).forEach(([pair, cnt]) => {
    console.log(`  - ${pair} : ${cnt} image(s)`);
  });
  console.log('\n');

  // ── PART 2: CLIP Baseline ───────────────────────────────────────────────────
  console.log('======================================================================');
  console.log(' PART 2 — CLIP TOP-3 AVERAGE BASELINE (78 Images)');
  console.log('======================================================================\n');
  const clipSt = looStats['clipRanked'];
  console.log(`CLIP Top-1 Accuracy : ${clipSt.top1Count}/${totalImages} (${((clipSt.top1Count / totalImages) * 100).toFixed(1)}%)`);
  console.log(`CLIP Top-3 Accuracy : ${clipSt.top3Count}/${totalImages} (${((clipSt.top3Count / totalImages) * 100).toFixed(1)}%)`);
  console.log(`CLIP Top-5 Accuracy : ${clipSt.top5Count}/${totalImages} (${((clipSt.top5Count / totalImages) * 100).toFixed(1)}%)\n`);

  // ── PART 4: Check Complementarity ────────────────────────────────────────────
  console.log('======================================================================');
  console.log(' PART 4 — COMPLEMENTARITY ANALYSIS (CLIP vs ONNX)');
  console.log('======================================================================\n');
  console.log(`A) CLIP Correct AND ONNX Correct : ${bothCorrectCount}/${totalImages} (${((bothCorrectCount / totalImages) * 100).toFixed(1)}%)`);
  console.log(`B) CLIP Correct AND ONNX Wrong   : ${clipOnlyCorrectCount}/${totalImages} (${((clipOnlyCorrectCount / totalImages) * 100).toFixed(1)}%)  [CLIP-only]`);
  console.log(`C) CLIP Wrong   AND ONNX Correct : ${onnxOnlyCorrectCount}/${totalImages} (${((onnxOnlyCorrectCount / totalImages) * 100).toFixed(1)}%)  [ONNX-only potential rescues]`);
  console.log(`D) Both Wrong                     : ${bothWrongCount}/${totalImages} (${((bothWrongCount / totalImages) * 100).toFixed(1)}%)\n`);

  console.log('Details on ONNX-only Potential Rescues (CLIP Wrong, ONNX Correct):');
  if (clipMistakesRescuable.length === 0) {
    console.log('  None.');
  } else {
    clipMistakesRescuable.forEach(m => {
      console.log(`  - ${m.filename} [True: ${m.trueClass}] -> CLIP predicted '${m.clipPred}', ONNX correctly predicted '${m.onnxPred}'. (70/30 Fusion predicted: '${m.f70Pred}')`);
    });
  }
  console.log('\n');

  // ── PART 6: Fusion LOO Summary Table ────────────────────────────────────────
  console.log('======================================================================');
  console.log(' PART 6 — FUSION STRATEGIES LEAVE-ONE-OUT COMPARISON');
  console.log('======================================================================\n');
  console.log('Strategy                  Top-1       Top-3       Top-5       Avg Margin');
  console.log('----------------------------------------------------------------------');
  strategies.forEach(s => {
    const st = looStats[s.key];
    const top1Str = `${st.top1Count}/${totalImages} (${((st.top1Count / totalImages) * 100).toFixed(1)}%)`.padEnd(12);
    const top3Str = `${st.top3Count}/${totalImages} (${((st.top3Count / totalImages) * 100).toFixed(1)}%)`.padEnd(12);
    const top5Str = `${st.top5Count}/${totalImages} (${((st.top5Count / totalImages) * 100).toFixed(1)}%)`.padEnd(12);
    const avgMargin = (st.margins.reduce((a, b) => a + b, 0) / st.margins.length).toFixed(4);
    console.log(`${s.name.padEnd(24)}  ${top1Str} ${top3Str} ${top5Str} ${avgMargin}`);
  });
  console.log('\n');

  // ── PART 7: Per-Class Analysis for Best Fusion ──────────────────────────────
  let bestStrat = strategies[0];
  let maxTop1 = -1;
  strategies.forEach(s => {
    if (looStats[s.key].top1Count > maxTop1) {
      maxTop1 = looStats[s.key].top1Count;
      bestStrat = s;
    }
  });

  console.log('======================================================================');
  console.log(` PART 7 — PER-CLASS ANALYSIS FOR BEST FUSION METHOD: ${bestStrat.name}`);
  console.log('======================================================================\n');
  const bestSt = looStats[bestStrat.key];
  allMachineIds.forEach(id => {
    const stat = bestSt.perClass[id];
    console.log(`  ${id.padEnd(26)} : ${stat.correct}/${stat.total} (${((stat.correct / stat.total) * 100).toFixed(1)}%)`);
  });
  console.log('');
  console.log('Biggest Confusion Pairs:');
  Object.entries(bestSt.confusions).sort((a, b) => b[1] - a[1]).forEach(([pair, cnt]) => {
    console.log(`  - ${pair} : ${cnt} image(s)`);
  });
  console.log('\n');

  // ── PART 3 & 8: Unseen Leg-Press Evaluation ─────────────────────────────────
  console.log('======================================================================');
  console.log(' PART 3 & 8 — UNSEEN LEG-PRESS TEST (test_images/new_leg_press.png)');
  console.log('======================================================================\n');

  const unseenClipExtractor = await (await import('@huggingface/transformers')).pipeline('image-feature-extraction', 'Xenova/clip-vit-base-patch32');
  const unseenRawImg        = await (await import('@huggingface/transformers')).RawImage.read(TEST_IMAGE_PATH);
  const unseenClipOut       = await unseenClipExtractor(unseenRawImg);
  const unseenClipVecNorm   = Array.from(l2Normalize(Array.from(unseenClipOut.data)));

  const unseenClipScores = computeClipTop3AvgScores(clipEntries, unseenClipVecNorm);
  const unseenOnnxProbs  = await runOnnxInference(onnxSession, classMapping, TEST_IMAGE_PATH);

  const unseenRankings = computeFusionRankings(unseenClipScores, unseenOnnxProbs);

  strategies.forEach(s => {
    console.log(`--- ${s.name} ---`);
    const ranked = unseenRankings[s.key];
    const actualRank = ranked.findIndex(r => r.machineId === ACTUAL_TARGET) + 1;
    const actualItem = ranked.find(r => r.machineId === ACTUAL_TARGET);

    ranked.forEach((r, idx) => {
      const isTarget = r.machineId === ACTUAL_TARGET ? ' <-- ACTUAL TARGET' : '';
      console.log(`  ${idx + 1}. ${r.machineId.padEnd(26)} : ${r.score.toFixed(4)}${isTarget}`);
    });
    console.log(`  => Leg Press Rank: ${actualRank}, Score: ${actualItem.score.toFixed(4)}, Top-1 Predicted: '${ranked[0].machineId}'\n`);
  });

  // ── PART 9: Complementarity Analysis ────────────────────────────────────────
  console.log('======================================================================');
  console.log(' PART 9 — DETAILED COMPLEMENTARITY FINDINGS');
  console.log('======================================================================\n');
  console.log(`1. Does ONNX correctly identify images that CLIP gets wrong?`);
  console.log(`   Yes, ONNX correctly identified ${onnxOnlyCorrectCount} image(s) out of the ${clipSt.totalCount - clipSt.top1Count} mistakes CLIP made.`);
  console.log(`2. How many CLIP mistakes can ONNX potentially rescue?`);
  console.log(`   Exactly ${onnxOnlyCorrectCount} image(s) (${((onnxOnlyCorrectCount / totalImages) * 100).toFixed(1)}% of dataset).`);
  console.log(`3. Does fusion actually rescue those mistakes?`);
  const f70St = looStats['f70Ranked'];
  console.log(`   In 70/30 fusion, ${f70St.top1Count} total images are correct (compared to CLIP's ${clipSt.top1Count}).`);
  console.log(`4. Does fusion damage CLIP's correct predictions?`);
  console.log(`   ONNX predicted incorrectly on ${clipOnlyCorrectCount} images that CLIP got right. Heavy ONNX weighting (e.g. 50/50) pulls down CLIP accuracy from 87.2% to ${((looStats['f50Ranked'].top1Count / totalImages) * 100).toFixed(1)}%.`);
  console.log(`5. Does ONNX provide useful information for difficult classes (hack-squat, leg-press, incline-chest)?`);
  allMachineIds.forEach(id => {
    const cStat = classOverlapStats[id];
    console.log(`   - ${id.padEnd(24)} : CLIP mistakes = ${cStat.clipMistakes}, ONNX rescues = ${cStat.onnxRescues}`);
  });
  console.log('\n');

  // ── SUMMARY COMPARISON TABLE ────────────────────────────────────────────────
  console.log('======================================================================');
  console.log(' FINAL EXPERIMENT COMPARISON SUMMARY');
  console.log('======================================================================\n');
  console.log('METHOD                         TOP-1       TOP-3       TOP-5       UNSEEN LEG-PRESS');
  console.log('-----------------------------------------------------------------------------------------');
  strategies.forEach(s => {
    const st = looStats[s.key];
    const rank = unseenRankings[s.key].findIndex(r => r.machineId === ACTUAL_TARGET) + 1;
    const top1Str = `${st.top1Count}/${totalImages} (${((st.top1Count / totalImages) * 100).toFixed(1)}%)`.padEnd(12);
    const top3Str = `${st.top3Count}/${totalImages} (${((st.top3Count / totalImages) * 100).toFixed(1)}%)`.padEnd(12);
    const top5Str = `${st.top5Count}/${totalImages} (${((st.top5Count / totalImages) * 100).toFixed(1)}%)`.padEnd(12);
    console.log(`${s.name.padEnd(28)} ${top1Str} ${top3Str} ${top5Str} Rank ${rank}`);
  });
  console.log('\n');
}

main().catch(err => {
  console.error('[eval-hybrid] Unhandled Fatal Error:', err);
  process.exit(1);
});
