// recognitionConfig.js - Configurable thresholds and settings for Machine Recognition

import path from 'path';

export const RECOGNITION_CONFIG = {
  // Primary recognition provider: 'local_model'
  ACTIVE_PROVIDER: process.env.RECOGNITION_PROVIDER || 'local_model',

  // Configurable confidence thresholds (0.0 to 1.0)
  // >= HIGH_CONFIDENCE_MIN (50%) => status: 'identified'  (direct success)
  // >= UNCERTAIN_MIN (35%) and < HIGH => status: 'uncertain' (top-3 candidates for one-tap confirm)
  // <  UNCERTAIN_MIN (35%)            => status: 'not_identified' (trigger manual search fallback)
  THRESHOLDS: {
    HIGH_CONFIDENCE_MIN: parseFloat(process.env.HIGH_CONFIDENCE_MIN || '0.50'),
    UNCERTAIN_MIN: parseFloat(process.env.UNCERTAIN_MIN || '0.35'),
  },

  // Max number of top candidate matches to return
  MAX_CANDIDATES: 3,

  // Local ONNX model path & mapping file path (getters ensure env vars set after import are evaluated)
  get ONNX_MODEL_PATH() {
    return process.env.ONNX_MODEL_PATH || path.join(process.cwd(), 'models', 'ai_model.onnx');
  },
  get CLASS_MAPPING_PATH() {
    return process.env.CLASS_MAPPING_PATH || path.join(process.cwd(), 'models', 'class_mapping.json');
  },

  // Roboflow Inference API Settings
  get ROBOFLOW_API_KEY() {
    return (process.env.ROBOFLOW_API_KEY || '').trim();
  },
  get ROBOFLOW_MODEL_ID() {
    return (process.env.ROBOFLOW_MODEL_ID || '').trim();
  },
  get HAS_ROBOFLOW() {
    const key = (process.env.ROBOFLOW_API_KEY || '').trim();
    const model = (process.env.ROBOFLOW_MODEL_ID || '').trim();
    return Boolean(key && model && !key.includes('YOUR_ROBOFLOW') && !model.includes('YOUR_ROBOFLOW'));
  }
};

