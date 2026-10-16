/**
 * scripts/evaluate_real_world_unseen.js
 *
 * Standalone experiment script for Gym Scan AI.
 * Evaluates 3 real-world unseen test images in unseen_test_images/:
 *   1. pec_deck_01.png -> pec-deck-machine
 *   2. lat_pulldown_01.png -> lat-pulldown
 *   3. leg_extension_01.png -> leg-extension
 *
 * Uses:
 *   A) CLIP TOP-3 AVERAGE
 *   B) ONNX Classifier
 *   C) 50/50 CLIP + ONNX Fusion (Min-Max Normalized)
 *   D) Rank Fusion
 *
 * Usage:
 *   node scripts/evaluate_real_world_unseen.js
 */

import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';
import ort from 'onnxruntime-node';
import { pipeline, RawImage } from '@huggingface/transformers';

const PROJECT_ROOT        = process.cwd();
const UNSEEN_DIR          = path.join(PROJECT_ROOT, 'unseen_test_images');
const EMBEDDINGS_PATH     = path.join(PROJECT_ROOT, 'embeddings', 'reference_embeddings.json');
const ONNX_MODEL_PATH     = path.join(PROJECT_ROOT, 'models', 'machine_classifier.onnx');
const CLASS_MAPPING_PATH  = path.join(PROJECT_ROOT, 'models', 'class_mapping.json');
const CLIP_MODEL_ID       = 'Xenova/clip-vit-base-patch32';

const TEST_IMAGES = [
  { filename: 'pec_deck_01.png',      groundTruth: 'pec-deck-machine' },
  { filename: 'lat_pulldown_01.png',  groundTruth: 'lat-pulldown' },
  { filename: 'leg_extension_01.png', groundTruth: 'leg-extension' },
];

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

function computeClipTop3AvgScores(clipEntries, queryEmbeddingNorm) {
  const grouped = new Map();
  clipEntries.forEach(cand => {
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

async function main() {
  console.log('══════════════════════════════════════════════════════════════');
  console.log(' evaluate_real_world_unseen.js');
  console.log(' CLIP Model    :', CLIP_MODEL_ID);
  console.log(' ONNX Model    :', ONNX_MODEL_PATH);
  console.log(' Unseen Folder :', UNSEEN_DIR);
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

  console.log('[setup] Loading CLIP feature extractor...');
  const clipExtractor = await pipeline('image-feature-extraction', CLIP_MODEL_ID);
  console.log('[setup] Model loaded. Starting evaluation...\n');

  const methodsList = [
    { key: 'clip', name: 'CLIP' },
    { key: 'onnx', name: 'ONNX' },
    { key: 'f50',  name: '50/50 Fusion' },
    { key: 'rank', name: 'Rank Fusion' },
  ];

  const overallAccuracy = {
    clip: { top1: 0, top3: 0, top5: 0 },
    onnx: { top1: 0, top3: 0, top5: 0 },
    f50:  { top1: 0, top3: 0, top5: 0 },
    rank: { top1: 0, top3: 0, top5: 0 },
  };

  const totalUnseen = TEST_IMAGES.length;

  for (let i = 0; i < TEST_IMAGES.length; i++) {
    const item = TEST_IMAGES[i];
    const imgPath = path.join(UNSEEN_DIR, item.filename);

    if (!fs.existsSync(imgPath)) {
      console.error(`ERROR: File missing at ${imgPath}`);
      process.exit(1);
    }

    // 1. CLIP Inference
    const rawImg = await RawImage.read(imgPath);
    const clipOut = await clipExtractor(rawImg);
    const clipVecNorm = Array.from(l2Normalize(Array.from(clipOut.data)));
    const clipScores = computeClipTop3AvgScores(clipEntries, clipVecNorm);

    // 2. ONNX Inference
    const onnxProbs = await runOnnxInference(onnxSession, classMapping, imgPath);

    // 3. Fusion Computations
    const allMachineIds = Object.keys(clipScores).sort();

    const clipRanked = allMachineIds.map(id => ({ machineId: id, score: clipScores[id] }))
      .sort((a, b) => b.score - a.score);

    const onnxRanked = allMachineIds.map(id => ({ machineId: id, score: onnxProbs[id] }))
      .sort((a, b) => b.score - a.score);

    // Points for Rank Fusion (1st = 8 pts, ..., 8th = 1 pt)
    const clipPoints = {};
    clipRanked.forEach((r, idx) => clipPoints[r.machineId] = 8 - idx);

    const onnxPoints = {};
    onnxRanked.forEach((r, idx) => onnxPoints[r.machineId] = 8 - idx);

    const rankScores = {};
    allMachineIds.forEach(id => {
      rankScores[id] = clipPoints[id] + onnxPoints[id];
    });
    const rankRanked = allMachineIds.map(id => ({ machineId: id, score: rankScores[id] }))
      .sort((a, b) => b.score - a.score);

    // 50/50 Fusion
    const clipNorm = minMaxNormalize(clipScores);
    const onnxNorm = minMaxNormalize(onnxProbs);

    const f50Scores = {};
    allMachineIds.forEach(id => {
      f50Scores[id] = 0.50 * clipNorm[id] + 0.50 * onnxNorm[id];
    });
    const f50Ranked = allMachineIds.map(id => ({ machineId: id, score: f50Scores[id] }))
      .sort((a, b) => b.score - a.score);

    const rankingsMap = {
      clip: clipRanked,
      onnx: onnxRanked,
      f50:  f50Ranked,
      rank: rankRanked,
    };

    // Record accuracy for each method
    methodsList.forEach(m => {
      const ranked = rankingsMap[m.key];
      const isTop1 = ranked[0]?.machineId === item.groundTruth;
      const isTop3 = ranked.slice(0, 3).some(r => r.machineId === item.groundTruth);
      const isTop5 = ranked.slice(0, 5).some(r => r.machineId === item.groundTruth);

      if (isTop1) overallAccuracy[m.key].top1++;
      if (isTop3) overallAccuracy[m.key].top3++;
      if (isTop5) overallAccuracy[m.key].top5++;
    });

    // ── Print Individual Image Section ─────────────────────────────────────────
    console.log('==================================================');
    console.log(`IMAGE: ${item.filename}`);
    console.log(`GROUND TRUTH: ${item.groundTruth}`);
    console.log('==================================================\n');

    console.log('CLIP TOP-5:');
    clipRanked.slice(0, 5).forEach((r, idx) => {
      const mark = r.machineId === item.groundTruth ? ' <-- ACTUAL TARGET' : '';
      console.log(`  ${idx + 1}. ${r.machineId.padEnd(26)} : ${r.score.toFixed(4)}${mark}`);
    });
    console.log(`  Top-1 Correct: ${clipRanked[0].machineId === item.groundTruth ? 'YES' : 'NO'}\n`);

    console.log('ONNX TOP-5:');
    onnxRanked.slice(0, 5).forEach((r, idx) => {
      const mark = r.machineId === item.groundTruth ? ' <-- ACTUAL TARGET' : '';
      console.log(`  ${idx + 1}. ${r.machineId.padEnd(26)} : ${r.score.toFixed(4)}${mark}`);
    });
    console.log(`  Top-1 Correct: ${onnxRanked[0].machineId === item.groundTruth ? 'YES' : 'NO'}\n`);

    console.log('50/50 FUSION TOP-5:');
    f50Ranked.slice(0, 5).forEach((r, idx) => {
      const mark = r.machineId === item.groundTruth ? ' <-- ACTUAL TARGET' : '';
      console.log(`  ${idx + 1}. ${r.machineId.padEnd(26)} : ${r.score.toFixed(4)}${mark}`);
    });
    console.log(`  Top-1 Correct: ${f50Ranked[0].machineId === item.groundTruth ? 'YES' : 'NO'}\n`);

    console.log('RANK FUSION TOP-5:');
    rankRanked.slice(0, 5).forEach((r, idx) => {
      const mark = r.machineId === item.groundTruth ? ' <-- ACTUAL TARGET' : '';
      console.log(`  ${idx + 1}. ${r.machineId.padEnd(26)} : ${r.score.toFixed(4)}${mark}`);
    });
    console.log(`  Top-1 Correct: ${rankRanked[0].machineId === item.groundTruth ? 'YES' : 'NO'}\n`);
  }

  // ── Summary Table ───────────────────────────────────────────────────────────
  console.log('==================================================');
  console.log('REAL-WORLD UNSEEN TEST SUMMARY');
  console.log('==================================================\n');

  console.log('Method                  Top-1 Accuracy  Top-3 Accuracy  Top-5 Accuracy');
  console.log('----------------------------------------------------------------------');
  methodsList.forEach(m => {
    const acc = overallAccuracy[m.key];
    const t1Str = `${acc.top1}/${totalUnseen} (${((acc.top1 / totalUnseen) * 100).toFixed(0)}%)`.padEnd(16);
    const t3Str = `${acc.top3}/${totalUnseen} (${((acc.top3 / totalUnseen) * 100).toFixed(0)}%)`.padEnd(16);
    const t5Str = `${acc.top5}/${totalUnseen} (${((acc.top5 / totalUnseen) * 100).toFixed(0)}%)`;
    console.log(`${m.name.padEnd(22)}  ${t1Str}${t3Str}${t5Str}`);
  });
  console.log('\n');
}

main().catch(err => {
  console.error('[eval-unseen] Unhandled Fatal Error:', err);
  process.exit(1);
});
