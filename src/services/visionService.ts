import { Machine, MachineCategory } from '../types';

export type VisionResultStatus =
  | 'MACHINE_IDENTIFIED'
  | 'MACHINE_NOT_IDENTIFIED'
  | 'IMAGE_INVALID'
  | 'VISION_API_RATE_LIMITED'
  | 'VISION_API_UNAVAILABLE'
  | 'VISION_API_ERROR'
  | 'confirmed_candidate'
  | 'uncertain'
  | 'unknown'
  | 'analysis_failed';

export interface MachineCandidateMatch {
  name: string;
  category?: string;
  confidence: number;
}

export interface StructuredVisionOutput {
  equipmentVisible: boolean;
  equipment_detected: boolean;
  imageQuality: 'good' | 'low_light' | 'blurry' | 'poor';
  machineIdentified: boolean;
  machineName: string | null;
  machineCategory: string;
  equipment_category: MachineCategory | 'Unknown';
  possible_machine_name: string | null;
  confidence: number;
  possibleMatches: MachineCandidateMatch[];
  alternative_matches: string[];
  visualFeatures: string[];
  visible_features: string[];
  primaryMuscles?: string[];
  setupSteps?: string[];
  exercise?: string;
  uncertainty_reason?: string;
  needs_more_photos: boolean;
  result_status: VisionResultStatus;
  // API Diagnostic details
  errorType?: string;
  errorMessage?: string;
  retryDelay?: string | null;
  geminiError?: any;
  statusHttp?: number;
}

export interface AnalysisDebugRecord {
  analysisId: string;
  timestamp: number;
  dateTime: string;
  imageReceived: boolean;
  imageFormat: string;
  imageSizeKb: number;
  aiAnalysisCompleted: boolean;
  aiProvider: string;
  modelName: string;
  requestStatus: 'success' | 'failed' | 'rejected' | 'uncertain';
  responseStatus: number;
  machinesConsidered: number;
  topCandidates: Array<{ id: string; name: string; category: string; score: number }>;
  selectedMachineId: string | null;
  selectedMachineName: string | null;
  confidenceScore: number;
  reasonForIdentification: string;
  predictedCategory?: string;
  possibleMachineResult?: string | null;
  filtered: boolean;
  userConfirmed?: boolean;
  errorDetails?: string;
  rawGeminiError?: any;
}

const DEBUG_RECORDS_KEY = 'gym_scan_analysis_debug_logs_v1';

export function getAnalysisDebugRecords(): AnalysisDebugRecord[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(DEBUG_RECORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAnalysisDebugRecord(record: AnalysisDebugRecord): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const records = getAnalysisDebugRecords();
    const updated = [record, ...records].slice(0, 100);
    localStorage.setItem(DEBUG_RECORDS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('[GymScan Vision] Failed to save debug record', e);
  }
}

export function markAnalysisDebugRecordConfirmed(analysisId: string): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const records = getAnalysisDebugRecords();
    const target = records.find(r => r.analysisId === analysisId);
    if (target) {
      target.userConfirmed = true;
      localStorage.setItem(DEBUG_RECORDS_KEY, JSON.stringify(records));
    }
  } catch (e) {
    console.error('[GymScan Vision] Failed to confirm debug record', e);
  }
}

function parseImageMeta(base64DataUrl: string): { format: string; sizeKb: number } {
  const mimeMatch = base64DataUrl.match(/data:([^;]+);/);
  const format = mimeMatch ? mimeMatch[1] : 'unknown';
  const base64Part = base64DataUrl.split(',')[1] || '';
  const sizeKb = Math.round((base64Part.length * 3) / 4 / 1024);
  return { format, sizeKb };
}

/**
 * Live Backend API Base URL
 * Official production backend: https://scanner-app-fydt.onrender.com
 * Can be overridden via VITE_BACKEND_URL environment variable.
 */
export const BACKEND_BASE_URL = (
  (import.meta.env?.VITE_BACKEND_URL as string | undefined) ||
  'https://scanner-app-fydt.onrender.com'
).replace(/\/+$/, '');

/**
 * Main entry point: Analyze uploaded gym machine image against backend /api/scan-machine API.
 */
export async function analyzeGymMachineImage(
  base64DataUrl: string,
  availableMachines: Machine[],
  fileName?: string
): Promise<{ output: StructuredVisionOutput; debugRecord: AnalysisDebugRecord }> {
  const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = Date.now();
  const dateTime = new Date().toISOString();

  // 1. Validate image payload format
  if (!base64DataUrl || !base64DataUrl.startsWith('data:image/')) {
    console.warn('[GymScan Vision] Invalid image payload format');
    const record: AnalysisDebugRecord = {
      analysisId,
      timestamp,
      dateTime,
      imageReceived: false,
      imageFormat: 'invalid',
      imageSizeKb: 0,
      aiAnalysisCompleted: false,
      aiProvider: 'GymScan Backend Scanner API',
      modelName: 'gemini-1.5-flash',
      requestStatus: 'failed',
      responseStatus: 400,
      machinesConsidered: availableMachines.length,
      topCandidates: [],
      selectedMachineId: null,
      selectedMachineName: null,
      confidenceScore: 0,
      reasonForIdentification: 'Invalid image format — payload is not a valid base64 image data URL.',
      predictedCategory: 'Unknown',
      possibleMachineResult: null,
      filtered: false,
      errorDetails: 'Image payload must be a valid data:image/ base64 URL'
    };
    saveAnalysisDebugRecord(record);
    return {
      output: {
        equipmentVisible: false,
        equipment_detected: false,
        imageQuality: 'poor',
        machineIdentified: false,
        machineName: null,
        machineCategory: 'Unknown',
        equipment_category: 'Unknown',
        possible_machine_name: null,
        confidence: 0,
        possibleMatches: [],
        alternative_matches: [],
        visualFeatures: [],
        visible_features: [],
        uncertainty_reason: 'Invalid image payload format.',
        needs_more_photos: false,
        result_status: 'IMAGE_INVALID',
        errorType: 'IMAGE_INVALID',
        errorMessage: 'Invalid image format provided.',
        statusHttp: 400
      },
      debugRecord: record
    };
  }

  const imageMeta = parseImageMeta(base64DataUrl);
  const scanEndpoint = `${BACKEND_BASE_URL}/api/scan-machine`;
  console.log(`[GymScan Vision] Querying POST ${scanEndpoint} with ${imageMeta.format} (${imageMeta.sizeKb} KB)...`);

  try {
    const apiResponse = await fetch(scanEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64DataUrl })
    });

    const resJson = await apiResponse.json();

    // ── Handle Non-200 Error Responses from Backend ───────────────────────────
    // HTTP 200 + success:false means a legitimate "not_identified" scanner result.
    // Only non-2xx HTTP responses (network/server failures) are treated as API errors.
    if (!apiResponse.ok) {
      const httpStatus = apiResponse.status || resJson.status || 500;
      const errorType = resJson.errorType || (httpStatus === 429 ? 'VISION_API_RATE_LIMITED' : httpStatus === 503 ? 'VISION_API_UNAVAILABLE' : 'VISION_API_ERROR');
      const errorMessage = resJson.message || `HTTP ${httpStatus} error from backend scanner.`;
      const retryDelay = resJson.retryDelay || null;
      const geminiError = resJson.geminiError || resJson.lastError || null;

      let resultStatus: VisionResultStatus = 'VISION_API_ERROR';
      if (httpStatus === 429 || errorType === 'VISION_API_RATE_LIMITED') {
        resultStatus = 'VISION_API_RATE_LIMITED';
      } else if (httpStatus === 503 || errorType === 'VISION_API_UNAVAILABLE') {
        resultStatus = 'VISION_API_UNAVAILABLE';
      } else if (errorType === 'INVALID_IMAGE' || errorType === 'INVALID_MIME') {
        resultStatus = 'IMAGE_INVALID';
      }

      console.warn(`[GymScan Vision] API returned error status ${httpStatus} (${errorType}):`, errorMessage);

      const record: AnalysisDebugRecord = {
        analysisId,
        timestamp,
        dateTime,
        imageReceived: true,
        imageFormat: imageMeta.format,
        imageSizeKb: imageMeta.sizeKb,
        aiAnalysisCompleted: false,
        aiProvider: 'GymScan Backend Scanner API',
        modelName: resJson.model || 'gemini-1.5-flash',
        requestStatus: 'failed',
        responseStatus: httpStatus,
        machinesConsidered: availableMachines.length,
        topCandidates: [],
        selectedMachineId: null,
        selectedMachineName: null,
        confidenceScore: 0,
        reasonForIdentification: errorMessage,
        predictedCategory: 'Unknown',
        possibleMachineResult: null,
        filtered: false,
        errorDetails: errorMessage,
        rawGeminiError: geminiError
      };
      saveAnalysisDebugRecord(record);

      return {
        output: {
          equipmentVisible: false,
          equipment_detected: false,
          imageQuality: 'good',
          machineIdentified: false,
          machineName: null,
          machineCategory: 'Unknown',
          equipment_category: 'Unknown',
          possible_machine_name: null,
          confidence: 0,
          possibleMatches: [],
          alternative_matches: [],
          visualFeatures: [],
          visible_features: [],
          uncertainty_reason: errorMessage,
          needs_more_photos: false,
          result_status: resultStatus,
          errorType,
          errorMessage,
          retryDelay,
          geminiError,
          statusHttp: httpStatus
        },
        debugRecord: record
      };
    }

    // ── Handle Successful Identification or Not Identified Graceful Response ───
    // ResJson format: { success: boolean, status: 200, recognitionStatus: string, message?: string, data: { machineName, category, confidence, ... } }
    const backendData = (resJson.data || resJson) as {
      machineName?: string;
      category?: string;
      confidence?: number;
      confidenceLevel?: 'high' | 'medium' | 'low';
      exactModelIdentified?: boolean;
      exercise?: string;
      visualFeatures?: string[];
      possibleMatches?: Array<{ machineName: string; category: string; matchReason?: string }>;
    };

    // Check if the backend flagged this as not identified or unrecognized
    const isExplicitlyNotIdentified = resJson.recognitionStatus === 'not_identified' || resJson.success === false;
    const isUncertain = resJson.recognitionStatus === 'uncertain';

    // Introduce confidence score threshold (50% / 0.50)
    const confidenceScore = typeof backendData.confidence === 'number' ? backendData.confidence : 0;
    const isBelowThreshold = confidenceScore < 50;

    // Match identified machineName or machineId against local machine library
    let matchedMachine = resJson.machineId
      ? availableMachines.find(m => m.id.toLowerCase() === String(resJson.machineId).toLowerCase())
      : undefined;

    if (!matchedMachine && backendData.machineName && backendData.machineName !== 'Unknown') {
      matchedMachine = availableMachines.find(
        m => m.name.toLowerCase() === backendData.machineName!.toLowerCase() ||
             m.alternativeNames?.some(a => a.toLowerCase() === backendData.machineName!.toLowerCase())
      );
    }

    if (!matchedMachine && backendData.machineName && backendData.machineName !== 'Unknown') {
      matchedMachine = availableMachines.find(
        m => m.name.toLowerCase().includes(backendData.machineName!.toLowerCase()) ||
             backendData.machineName!.toLowerCase().includes(m.name.toLowerCase()) ||
             m.category.toLowerCase() === (backendData.category || '').toLowerCase()
      );
    }

    const primaryName = matchedMachine ? matchedMachine.name : (backendData.machineName || null);
    const categoryName = matchedMachine ? matchedMachine.category : ((backendData.category as MachineCategory) || 'Unknown');

    // For uncertain status: use the backend candidates array directly so the one-tap confirm UI gets properly mapped names
    const backendCandidates: Array<{ machineId?: string; machineName: string; category?: string; confidence?: number }> =
      Array.isArray(resJson.candidates) && resJson.candidates.length > 0
        ? resJson.candidates
        : [];

    // Safe extraction of candidate predictions list
    // Prefer backend candidates (already CLASS_MAPPING resolved) over rawOutput.possibleMatches
    const rawPossibleMatches = backendCandidates.length > 0
      ? backendCandidates
      : (Array.isArray(backendData.possibleMatches) ? backendData.possibleMatches : []);

    const formattedMatches: MachineCandidateMatch[] = rawPossibleMatches.map((p: any) => ({
      name: p.machineName || p.name || 'Unknown',
      category: p.category,
      confidence: typeof p.confidence === 'number' ? p.confidence : Math.max(1, Math.round((confidenceScore || 85) * 0.85))
    }));

    if (formattedMatches.length === 0 && matchedMachine && !isBelowThreshold && !isExplicitlyNotIdentified && !isUncertain) {
      formattedMatches.push({
        name: matchedMachine.name,
        category: matchedMachine.category,
        confidence: confidenceScore || 85
      });
    }

    // Unrecognized: explicit not_identified, confidence below 45%, or no machineName resolved
    const isUnrecognized = isExplicitlyNotIdentified || (isBelowThreshold && !isUncertain) || !primaryName || primaryName === 'Unknown';
    const resultStatus: VisionResultStatus = isUnrecognized ? 'MACHINE_NOT_IDENTIFIED' : (isUncertain ? 'uncertain' : 'MACHINE_IDENTIFIED');

    const fallbackMessage = resJson.message || 
      (isUncertain
        ? `Confidence (${confidenceScore}%) is uncertain — please tap one of the suggestions to confirm.`
        : isBelowThreshold 
          ? `Model confidence (${confidenceScore}%) is below the required 50% threshold. The machine features weren't clear enough.`
          : "Unrecognized machine or random image. Please try another angle or search manually.");

    const structuredOutput: StructuredVisionOutput = {
      equipmentVisible: !isUnrecognized,
      equipment_detected: !isUnrecognized,
      imageQuality: 'good',
      machineIdentified: !isUnrecognized,
      machineName: isUnrecognized ? null : primaryName,
      machineCategory: isUnrecognized ? 'Unknown' : categoryName,
      equipment_category: isUnrecognized ? 'Unknown' : (categoryName as any),
      possible_machine_name: isUnrecognized ? null : primaryName,
      confidence: confidenceScore,
      possibleMatches: isUnrecognized ? [] : formattedMatches,
      alternative_matches: isUnrecognized ? [] : formattedMatches.map(m => m.name),
      visualFeatures: backendData.visualFeatures || [],
      visible_features: backendData.visualFeatures || [],
      primaryMuscles: (backendData as any).primaryMuscles || resJson.primaryMuscles || [],
      setupSteps: (backendData as any).setupSteps || resJson.setupSteps || [],
      exercise: isUnrecognized ? undefined : (backendData.exercise || primaryName || undefined),
      uncertainty_reason: isUnrecognized ? fallbackMessage : undefined,
      needs_more_photos: isUnrecognized,
      result_status: resultStatus,
      statusHttp: 200
    };

    const debugRecord: AnalysisDebugRecord = {
      analysisId,
      timestamp,
      dateTime,
      imageReceived: true,
      imageFormat: imageMeta.format,
      imageSizeKb: imageMeta.sizeKb,
      aiAnalysisCompleted: true,
      aiProvider: 'GymScan Backend AI Vision API',
      modelName: resJson.modelUsed || 'gemini-1.5-flash',
      requestStatus: 'success',
      responseStatus: 200,
      machinesConsidered: availableMachines.length,
      topCandidates: matchedMachine
        ? [{ id: matchedMachine.id, name: matchedMachine.name, category: matchedMachine.category, score: backendData.confidence || 85 }]
        : [],
      selectedMachineId: matchedMachine?.id ?? null,
      selectedMachineName: primaryName,
      confidenceScore: backendData.confidence || 85,
      reasonForIdentification: (backendData.visualFeatures || []).join(', ') || 'Backend AI Vision Analysis',
      predictedCategory: categoryName,
      possibleMachineResult: primaryName,
      filtered: true
    };

    saveAnalysisDebugRecord(debugRecord);
    return { output: structuredOutput, debugRecord };

  } catch (err: any) {
    console.error('[GymScan Vision] Network fetch error:', err);
    const errorMsg = err?.message || `Could not connect to backend ${scanEndpoint} endpoint.`;

    const record: AnalysisDebugRecord = {
      analysisId,
      timestamp,
      dateTime,
      imageReceived: true,
      imageFormat: imageMeta.format,
      imageSizeKb: imageMeta.sizeKb,
      aiAnalysisCompleted: false,
      aiProvider: 'GymScan Backend Scanner API',
      modelName: 'gemini-1.5-flash',
      requestStatus: 'failed',
      responseStatus: 500,
      machinesConsidered: availableMachines.length,
      topCandidates: [],
      selectedMachineId: null,
      selectedMachineName: null,
      confidenceScore: 0,
      reasonForIdentification: errorMsg,
      predictedCategory: 'Unknown',
      possibleMachineResult: null,
      filtered: false,
      errorDetails: errorMsg
    };
    saveAnalysisDebugRecord(record);

    return {
      output: {
        equipmentVisible: false,
        equipment_detected: false,
        imageQuality: 'poor',
        machineIdentified: false,
        machineName: null,
        machineCategory: 'Unknown',
        equipment_category: 'Unknown',
        possible_machine_name: null,
        confidence: 0,
        possibleMatches: [],
        alternative_matches: [],
        visualFeatures: [],
        visible_features: [],
        uncertainty_reason: `Connection Error: ${errorMsg}`,
        needs_more_photos: false,
        result_status: 'VISION_API_UNAVAILABLE',
        errorType: 'VISION_API_UNAVAILABLE',
        errorMessage: `Could not connect to backend server: ${errorMsg}`,
        statusHttp: 500
      },
      debugRecord: record
    };
  }
}

export interface ScanApiResponse {
  source: string;
  match: string | null;
  status: 'identified' | 'not_identified';
  confidence: number;
  reasoning: string;
}

/**
 * Scan gym machine using multipart FormData via POST /api/scan
 */
export async function uploadAndScanMachine(imageFile: File | Blob): Promise<ScanApiResponse> {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${BACKEND_BASE_URL}/api/scan`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Scan failed with HTTP ${response.status}`);
  }

  const result: ScanApiResponse = await response.json();
  return result;
}
