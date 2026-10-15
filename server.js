//import './env-preload.js';   //MUST be first: loads .env before any other module reads process.env
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { recognizeMachine, initializeLocalModel } from './src/services/backend/machineRecognitionService.js';
import { analyzeGymMachine } from './services/backend/geminiVisionService.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

import { RECOGNITION_CONFIG } from './services/backend/recognitionConfig.js';

// dotenv.config() is called in env-preload.js (first import above)

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '25mb' }));

// ── Startup diagnostics ───────────────────────────────────────────────────
console.log(`[GymScan Backend] Starting Vision Model Server...`);
console.log(`[GymScan Backend] Node: ${process.version}`);
console.log(`[GymScan Backend] Roboflow Inference API Configured: ${RECOGNITION_CONFIG.HAS_ROBOFLOW ? `Yes (${RECOGNITION_CONFIG.ROBOFLOW_MODEL_ID})` : 'No (Using local ONNX)'}`);

// Initialize Local ONNX Model and Class Mapping
initializeLocalModel().then((res) => {
  console.log(`[GymScan Backend] Local Model Initialization Result:`, res);
});

// ── GET /api/health ────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  return res.json({
    status: 'ok',
    service: 'gymscan-local-backend'
  });
});

// ── POST /api/scan-machine ─────────────────────────────────────────────────
app.post('/api/scan-machine', async (req, res, next) => {
  try {
    // 1. Validate image payload
    const { image } = req.body || {};
    if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        errorType: 'INVALID_IMAGE',
        message: 'Request must include an "image" field as a data:image/... base64 URL.',
        status: 400
      });
    }

    // 2. Invoke local Machine Recognition Service
    const recognitionResult = await recognizeMachine(image);

    // Handle untrained or unready local model
    if (recognitionResult.systemStatus === 'MODEL_NOT_TRAINED') {
      return res.status(503).json({
        success: false,
        errorType: 'MODEL_NOT_TRAINED',
        message: 'Local vision model has not been trained yet. Please train and export ONNX model.',
        status: 503,
        model: recognitionResult.model
      });
    }

    if (recognitionResult.systemStatus === 'MODEL_NOT_READY') {
      return res.status(503).json({
        success: false,
        errorType: 'MODEL_NOT_READY',
        message: recognitionResult.reason || 'Local vision model environment is not ready.',
        status: 503,
        model: recognitionResult.model
      });
    }

    // Handle unrecognized machine or confidence below threshold gracefully
    if (recognitionResult.status === 'not_identified') {
      const fallbackReason = recognitionResult.reason || 'Unrecognized machine. Confidence below threshold or no clear machine features detected.';
      return res.json({
        success: false,
        status: 200,
        recognitionStatus: 'not_identified',
        machineId: null,
        message: fallbackReason,
        modelUsed: recognitionResult.model,
        processingTimeMs: recognitionResult.processingTimeMs,
        candidates: [],
        data: {
          machineName: 'Unknown',
          category: 'Unknown',
          confidence: recognitionResult.confidence || 0,
          confidenceLevel: 'low',
          exactModelIdentified: false,
          exercise: 'None',
          visualFeatures: recognitionResult.visualFeatures || [],
          possibleMatches: []
        }
      });
    }

    // Format clean response preserving existing frontend API contract
    const formattedData = recognitionResult.rawOutput || {
      machineName: recognitionResult.machineName || 'Unknown',
      category: recognitionResult.category || 'Full Body',
      confidence: recognitionResult.confidence || 0,
      confidenceLevel: recognitionResult.status === 'identified' ? 'high' : recognitionResult.status === 'uncertain' ? 'medium' : 'low',
      exactModelIdentified: recognitionResult.status === 'identified',
      exercise: recognitionResult.machineName || 'None',
      visualFeatures: recognitionResult.visualFeatures || [],
      possibleMatches: (recognitionResult.candidates || []).map(c => ({
        machineName: c.machineName,
        category: c.category || 'Full Body'
      }))
    };

    return res.json({
      success: true,
      status: 200,
      recognitionStatus: recognitionResult.status,
      machineId: recognitionResult.machineId,
      modelUsed: recognitionResult.model,
      processingTimeMs: recognitionResult.processingTimeMs,
      candidates: recognitionResult.candidates || [],
      data: formattedData
    });
  } catch (err) {
    console.error('[GymScan Backend] Unhandled error in /api/scan-machine:', err);
    return res.status(500).json({
      success: false,
      errorType: 'SERVER_ERROR',
      message: err.message || 'Internal server error while processing scan.',
      status: 500
    });
  }
});

// ── POST /api/scan (Multipart Upload -> Gemini Vision) ─────────────────────
app.post('/api/scan', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Call Gemini Vision Service
    const geminiResult = await analyzeGymMachine(req.file.buffer, req.file.mimetype);

    // Format the payload returned to the frontend
    return res.json({
      source: 'Google Gemini Vision',
      match: geminiResult.match,
      status: geminiResult.status,
      confidence: geminiResult.confidence,
      reasoning: geminiResult.reasoning
    });

  } catch (err) {
    console.error('Scan Error:', err);
    return res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// Global fallback error handling middleware — guarantees JSON response for all uncaught errors
app.use((err, req, res, next) => {
  console.error('[GymScan Backend] Global error handler caught exception:', err);
  if (!res.headersSent) {
    res.status(err.status || 500).json({
      success: false,
      errorType: err.type || 'SERVER_ERROR',
      message: err.message || 'An unexpected error occurred on the server.',
      status: err.status || 500
    });
  }
});

app.listen(PORT, () => {
  console.log(`[GymScan AI Backend] Listening on http://localhost:${PORT}`);
  console.log(`[GymScan AI Backend] POST /api/scan-machine ready`);
  console.log(`[GymScan AI Backend] Engine: Local ONNX Inference Engine (50 Mapped Classes)`);
});


