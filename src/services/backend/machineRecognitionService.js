import { RECOGNITION_CONFIG } from './recognitionConfig.js';
import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';
import { initializeReferenceMatcher, matchReferenceImage } from './referenceMatcher.js';
// ❌ OLD:
// import { inferWithRoboflow } from './roboflowService.js';

// ✅ NEW:
import { analyzeGymMachine } from './geminiVisionService.js';

let onnxSession = null;
let classMapping = null;
let modelLoadingError = null;
let ortModule = null;

/**
 * Initialize and load ONNX inference session and class mapping on startup.
 */
export async function initializeLocalModel() {
  const startTime = Date.now();
  console.log('[MachineRecognitionService] Initializing Local Vision Model Pipeline...');

  // Initialize reference image matcher
  try {
    await initializeReferenceMatcher();
  } catch (refErr) {
    console.warn('[MachineRecognitionService] Warning: Reference matcher init failed:', refErr.message);
  }

  try {
    // 1. Verify class mapping existence
    if (!fs.existsSync(RECOGNITION_CONFIG.CLASS_MAPPING_PATH)) {
      modelLoadingError = `Class mapping missing at ${RECOGNITION_CONFIG.CLASS_MAPPING_PATH}`;
      console.warn(`[MachineRecognitionService] ${modelLoadingError}`);
      return { status: 'MODEL_NOT_READY', error: modelLoadingError };
    }

    const mappingRaw = fs.readFileSync(RECOGNITION_CONFIG.CLASS_MAPPING_PATH, 'utf-8');
    classMapping = JSON.parse(mappingRaw);

    if (!classMapping.totalClasses || classMapping.totalClasses < 1) {
      modelLoadingError = `Invalid class mapping: totalClasses must be >= 1, found ${classMapping.totalClasses}`;
      console.warn(`[MachineRecognitionService] ${modelLoadingError}`);
      return { status: 'MODEL_NOT_READY', error: modelLoadingError };
    }
    console.log(`[MachineRecognitionService] ONNX Model Path: ${RECOGNITION_CONFIG.ONNX_MODEL_PATH}`);
    console.log(`[MachineRecognitionService] Class Mapping Path: ${RECOGNITION_CONFIG.CLASS_MAPPING_PATH}`);
    console.log(`[MachineRecognitionService] Class mapping loaded: ${classMapping.totalClasses} classes.`);

    // 2. Check if ONNX model exists
    if (!fs.existsSync(RECOGNITION_CONFIG.ONNX_MODEL_PATH)) {
      modelLoadingError = `ONNX model file missing at ${RECOGNITION_CONFIG.ONNX_MODEL_PATH}`;
      console.log(`[MachineRecognitionService] ${modelLoadingError}`);
      return { status: 'MODEL_NOT_TRAINED', error: modelLoadingError };
    }

    // 3. Dynamically import onnxruntime-node if available
    try {
      ortModule = await import('onnxruntime-node');
    } catch (e) {
      modelLoadingError = 'onnxruntime-node package is not installed or unavailable.';
      console.log(`[MachineRecognitionService] ${modelLoadingError}`);
      return { status: 'MODEL_NOT_READY', error: modelLoadingError };
    }

    onnxSession = await ortModule.InferenceSession.create(RECOGNITION_CONFIG.ONNX_MODEL_PATH);
    const loadTimeMs = Date.now() - startTime;
    console.log(`[MachineRecognitionService] ONNX model loaded successfully in ${loadTimeMs}ms.`);
    return { status: 'READY', loadTimeMs };
  } catch (err) {
    modelLoadingError = `Failed to load ONNX model: ${err.message}`;
    console.error(`[MachineRecognitionService] ${modelLoadingError}`);
    return { status: 'MODEL_NOT_READY', error: modelLoadingError };
  }
}

/**
 * Entry point for Machine Recognition requests.
 */
export async function recognizeMachine(imageBase64DataUrl) {
  const startTime = Date.now();

  // 1. Image payload validation
  if (!imageBase64DataUrl || typeof imageBase64DataUrl !== 'string' || !imageBase64DataUrl.startsWith('data:image/')) {
    return {
      status: 'not_identified',
      machineId: null,
      machineName: null,
      confidence: 0,
      reason: 'Invalid or missing image payload.',
      candidates: [],
      model: 'local-onnx-efficientnet-b0',
      processingTimeMs: Date.now() - startTime
    };
  }

  // 2. Try Reference Image Similarity Match FIRST
  try {
    const refMatch = await matchReferenceImage(imageBase64DataUrl);
    if (refMatch && refMatch.matched) {
      const processingTimeMs = Date.now() - startTime;
      return {
        ...refMatch,
        processingTimeMs
      };
    }
  } catch (refMatchErr) {
    console.warn('[MachineRecognitionService] Reference matcher check error (falling back):', refMatchErr.message);
  }

  // 3. Try Gemini Vision AI Inference if GEMINI_API_KEY is configured
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log('[MachineRecognitionService] Running Gemini Vision Inference...');
      const geminiResult = await analyzeGymMachine(imageBase64DataUrl);
      const processingTimeMs = Date.now() - startTime;

      if (geminiResult && geminiResult.status === 'identified' && (geminiResult.match || geminiResult.machineName)) {
        const recognizedName = geminiResult.machineName || geminiResult.match;
        const machineSlug = recognizedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const modelName = geminiResult.modelUsed || 'gemini-3.5-flash-lite';
        const primaryMuscles = geminiResult.primaryMuscles || [];
        const setupSteps = geminiResult.setupSteps || [];

        return {
          status: 'identified',
          machineId: machineSlug,
          machineName: recognizedName,
          category: 'Strength Equipment',
          confidence: geminiResult.confidence || 92,
          reason: geminiResult.reasoning || '',
          primaryMuscles,
          setupSteps,
          visualFeatures: [
            `Gemini Vision AI (${modelName})`,
            ...(primaryMuscles.length > 0 ? [`Muscles: ${primaryMuscles.join(', ')}`] : []),
            geminiResult.reasoning || `Detected: ${recognizedName}`
          ],
          candidates: [
            {
              machineId: machineSlug,
              machineName: recognizedName,
              category: 'Strength Equipment',
              confidence: geminiResult.confidence || 92
            }
          ],
          rawOutput: {
            machineName: recognizedName,
            category: 'Strength Equipment',
            confidence: geminiResult.confidence || 92,
            confidenceLevel: 'high',
            exactModelIdentified: true,
            exercise: recognizedName,
            primaryMuscles,
            setupSteps,
            visualFeatures: [
              `Gemini Vision AI (${modelName})`,
              ...(primaryMuscles.length > 0 ? [`Muscles: ${primaryMuscles.join(', ')}`] : []),
              geminiResult.reasoning || `Detected: ${recognizedName}`
            ],
            possibleMatches: []
          },
          model: modelName,
          processingTimeMs
        };
      } else if (geminiResult && geminiResult.status === 'not_identified') {
        const modelName = geminiResult.modelUsed || 'gemini-3.5-flash-lite';
        return {
          status: 'not_identified',
          machineId: null,
          machineName: null,
          category: 'Unknown',
          confidence: geminiResult.confidence || 0,
          reason: geminiResult.reasoning || 'Gemini Vision could not determine or match this equipment.',
          primaryMuscles: [],
          setupSteps: [],
          visualFeatures: [geminiResult.reasoning || 'No matches found'],
          candidates: [],
          rawOutput: {
            machineName: 'Unknown',
            category: 'Unknown',
            confidence: geminiResult.confidence || 0,
            confidenceLevel: 'low',
            exactModelIdentified: false,
            exercise: 'None',
            primaryMuscles: [],
            setupSteps: [],
            visualFeatures: [geminiResult.reasoning || 'No matches found'],
            possibleMatches: []
          },
          model: modelName,
          processingTimeMs
        };
      }
    } catch (geminiErr) {
      console.warn('[MachineRecognitionService] Gemini Vision exception, falling back to local ONNX:', geminiErr.message);
    }
  }

  // 4. Fallback: Check ONNX model loading status if no reference or Roboflow match
  if (!classMapping) {
    await initializeLocalModel();
  }

  if (!onnxSession) {
    const errorStatus = fs.existsSync(RECOGNITION_CONFIG.ONNX_MODEL_PATH) ? 'MODEL_NOT_READY' : 'MODEL_NOT_TRAINED';
    return {
      status: 'not_identified',
      machineId: null,
      machineName: null,
      confidence: 0,
      reason: modelLoadingError || (errorStatus === 'MODEL_NOT_TRAINED' ? 'Local model has not been trained yet.' : 'Local ONNX model runtime is not ready.'),
      systemStatus: errorStatus,
      candidates: [],
      model: 'local-onnx-efficientnet-b0',
      processingTimeMs: Date.now() - startTime
    };
  }

  // 3. Fallback: Run ONNX Inference if no strong reference match
  try {
    // Note: Preprocessing steps (resizing 224x224, normalizing image tensor)
    // Run ONNX inference pass across all 50 mapped classes
    const inputTensor = await preprocessImageToTensor(imageBase64DataUrl);
    const feeds = { input: inputTensor };
    const results = await onnxSession.run(feeds);
    const outputTensor = results.output || Object.values(results)[0];
    const logits = Array.from(outputTensor.data);

    // Apply Softmax across all 50 classes
    const probabilities = softmax(logits);

    // Verify predictions exist
    if (!probabilities || probabilities.length === 0) {
      const processingTimeMs = Date.now() - startTime;
      return {
        status: 'not_identified',
        machineId: null,
        machineName: null,
        category: 'Unknown',
        confidence: 0,
        predictedIndex: null,
        reason: 'Empty prediction result list returned from model inference.',
        visualFeatures: [],
        candidates: [],
        rawOutput: {
          predictedIndex: null,
          machineName: 'Unknown',
          category: 'Unknown',
          confidence: 0,
          confidenceLevel: 'low',
          exactModelIdentified: false,
          exercise: 'Unknown',
          visualFeatures: ['No detection extracted'],
          possibleMatches: []
        },
        model: 'local-onnx-efficientnet-b0',
        processingTimeMs
      };
    }

    // Find top-1 and top-N candidate matches
    const indexed = probabilities.map((prob, idx) => ({ idx, prob }));
    indexed.sort((a, b) => b.prob - a.prob);

    // Safeguard: Check if indexed predictions list is empty before accessing elements
    if (!indexed || indexed.length === 0 || !indexed[0]) {
      const processingTimeMs = Date.now() - startTime;
      return {
        status: 'not_identified',
        machineId: null,
        machineName: null,
        category: 'Unknown',
        confidence: 0,
        predictedIndex: null,
        reason: 'No candidate predictions found in inference output.',
        visualFeatures: [],
        candidates: [],
        rawOutput: {
          predictedIndex: null,
          machineName: 'Unknown',
          category: 'Unknown',
          confidence: 0,
          confidenceLevel: 'low',
          exactModelIdentified: false,
          exercise: 'Unknown',
          visualFeatures: ['No candidates available'],
          possibleMatches: []
        },
        model: 'local-onnx-efficientnet-b0',
        processingTimeMs
      };
    }

    const top1 = indexed[0];
    const confidence = Math.round((top1.prob || 0) * 100);
    const targetClass = (classMapping && classMapping.indexToClass) ? classMapping.indexToClass[String(top1.idx)] : null;

    const confRatio = top1.prob || 0;
    const highThreshold = RECOGNITION_CONFIG.THRESHOLDS.HIGH_CONFIDENCE_MIN;
    const minThreshold = RECOGNITION_CONFIG.THRESHOLDS.UNCERTAIN_MIN; // 0.50 (50%)

    let status = 'identified';
    if (confRatio < minThreshold) {
      status = 'not_identified';
    } else if (confRatio < highThreshold) {
      status = 'uncertain';
    }

    const candidates = indexed.slice(0, RECOGNITION_CONFIG.MAX_CANDIDATES).map(item => {
      const cls = (classMapping && classMapping.indexToClass && classMapping.indexToClass[String(item.idx)]) || {};
      return {
        machineId: cls.machineId || `class-${item.idx}`,
        machineName: cls.machineName || cls.machineId || `class-${item.idx}`,
        category: cls.category || 'Other',
        confidence: Math.round(item.prob * 100)
      };
    });

    const processingTimeMs = Date.now() - startTime;
    const top1Class    = targetClass || {};
    const top1Name     = top1Class.machineName || top1Class.machineId || `class-${top1.idx}`;
    const top1Category = top1Class.category || 'Other';
    const totalClassesCount = classMapping ? classMapping.totalClasses : 0;

    return {
      status,
      machineId: status === 'not_identified' ? null : top1Class.machineId,
      machineName: status === 'not_identified' ? null : top1Name,
      category: top1Category,
      confidence,
      predictedIndex: top1.idx,
      reason: status === 'not_identified' ? `Top confidence (${confidence}%) below threshold (${Math.round(minThreshold * 100)}%). Machine unrecognized.` : undefined,
      visualFeatures: [`Local ONNX Inference (${confidence}% Confidence)`],
      candidates: status === 'not_identified' ? [] : candidates,
      rawOutput: {
        predictedIndex: top1.idx,
        machineName: status === 'not_identified' ? 'Unknown' : top1Name,
        category: top1Category,
        confidence,
        confidenceLevel: status === 'identified' ? 'high' : status === 'uncertain' ? 'medium' : 'low',
        exactModelIdentified: status === 'identified',
        exercise: top1Name,
        visualFeatures: [`Evaluated against ${totalClassesCount} classes`],
        possibleMatches: status === 'not_identified' ? [] : candidates
      },
      model: 'local-onnx-efficientnet-b0',
      processingTimeMs
    };
  } catch (err) {
    console.error('[MachineRecognitionService] Inference error:', err);
    return {
      status: 'not_identified',
      machineId: null,
      machineName: null,
      confidence: 0,
      reason: `Local ONNX inference error: ${err.message}`,
      candidates: [],
      model: 'local-onnx-efficientnet-b0',
      processingTimeMs: Date.now() - startTime
    };
  }
}

function softmax(logits) {
  const maxLogit = Math.max(...logits);
  const exps = logits.map(l => Math.exp(l - maxLogit));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sumExps);
}

async function preprocessImageToTensor(base64DataUrl) {
  const base64Data = base64DataUrl.split(',')[1] || base64DataUrl;
  const imageBuffer = Buffer.from(base64Data, 'base64');

  const image = await Jimp.read(imageBuffer);
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

  return ortModule ? new ortModule.Tensor('float32', floatData, [1, 3, 224, 224]) : null;
}

