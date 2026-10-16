import React, { useState, useRef, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import { Machine } from '../../types';
import { 
  Upload, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Check, 
  Trash2, 
  AlertCircle, 
  RotateCcw, 
  Camera, 
  XCircle, 
  Clock,
  HelpCircle,
  FileSearch,
  ShieldAlert
} from 'lucide-react';
import { MachineSvgIllustration } from '../machines/MachineSvgIllustrations';
import ScanningLoader from './ScanningLoader';
import { PhotoUploadTab } from './PhotoUploadTab';
import { 
  analyzeGymMachineImage, 
  StructuredVisionOutput, 
  AnalysisDebugRecord,
  markAnalysisDebugRecordConfirmed
} from '../../services/visionService';

interface PhotoAIAnalyzerProps {
  onMachineConfirmed: (machine: Machine, scanType: 'photo', imageUrl?: string, confidence?: number) => void;
  onOpenSettingsDocs: () => void;
  onSelectManual?: () => void;
}

export const PhotoAIAnalyzer: React.FC<PhotoAIAnalyzerProps> = ({
  onMachineConfirmed,
  onOpenSettingsDocs,
  onSelectManual
}) => {
  const { machines, userProfile } = useGym();
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cancelTokenRef = useRef<boolean>(false);
  const cooldownIntervalRef = useRef<any>(null);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFileMeta, setSelectedFileMeta] = useState<{ name: string; size: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  
  // Rate limit cooldown state
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  // Structured Output state
  const [visionOutput, setVisionOutput] = useState<StructuredVisionOutput | null>(null);
  const [possibleMatches, setPossibleMatches] = useState<{ machine: Machine; matchingFeatures: string[]; notes: string }[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Machine | null>(null);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [isTakingLonger, setIsTakingLonger] = useState(false);
  const [activeDebugRecord, setActiveDebugRecord] = useState<AnalysisDebugRecord | null>(null);

  const stages = [
    '1. Validating image format & preparing request payload...',
    '2. Connecting to server backend /api/scan-machine route...',
    '3. Authenticating request with Gemini Vision AI service...',
    '4. Processing structured machine identification response...'
  ];

  // Clean up cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    };
  }, []);

  const startCooldown = (delayStr?: string | null) => {
    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    
    let seconds = 30; // default 30s
    if (delayStr) {
      const match = delayStr.match(/(\d+)/);
      if (match) seconds = parseInt(match[1], 10);
    }

    setCooldownSeconds(seconds);
    cooldownIntervalRef.current = setInterval(() => {
      setCooldownSeconds(prev => {
        if (prev <= 1) {
          clearInterval(cooldownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const inspectImageQuality = (dataUrl: string): Promise<{ valid: boolean; reason?: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 50 || img.height < 50) {
          resolve({ valid: false, reason: 'Image dimensions are too small (below 50x50). Please upload a larger photo.' });
          return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ valid: true });
          return;
        }

        canvas.width = 64;
        canvas.height = 64;
        ctx.drawImage(img, 0, 0, 64, 64);
        const imgData = ctx.getImageData(0, 0, 64, 64).data;

        let totalBrightness = 0;
        let isCompletelyBlank = true;
        const firstPixel = [imgData[0], imgData[1], imgData[2]];

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          totalBrightness += (r + g + b) / 3;

          if (Math.abs(r - firstPixel[0]) > 10 || Math.abs(g - firstPixel[1]) > 10 || Math.abs(b - firstPixel[2]) > 10) {
            isCompletelyBlank = false;
          }
        }

        const avgBrightness = totalBrightness / (64 * 64);

        if (avgBrightness < 5) {
          resolve({ valid: false, reason: 'The uploaded photo is too dark. Please take a photo in a well-lit gym area.' });
          return;
        }

        if (isCompletelyBlank) {
          resolve({ valid: false, reason: 'The image appears empty or blank. Please select a photo containing gym equipment.' });
          return;
        }

        resolve({ valid: true });
      };

      img.onerror = () => {
        resolve({ valid: false, reason: 'Could not decode image file. Please try another photo.' });
      };

      img.src = dataUrl;
    });
  };

  /**
   * Compress/downscale an image data URL if it's too large.
   * Keeps images under 1200px wide and under ~1MB base64 size for fast scanning.
   */
  const compressImageIfNeeded = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const MAX_SIDE = 1200;
      const MAX_B64_BYTES = 1 * 1024 * 1024; // 1MB base64
      const b64Part = dataUrl.split(',')[1] || '';
      const approxBytes = b64Part.length * 0.75;

      const img = new Image();
      img.onload = () => {
        const needsResize = img.width > MAX_SIDE || img.height > MAX_SIDE;
        const needsCompress = approxBytes > MAX_B64_BYTES;

        if (!needsResize && !needsCompress) {
          resolve(dataUrl);
          return;
        }

        const scale = needsResize
          ? Math.min(MAX_SIDE / img.width, MAX_SIDE / img.height)
          : 1;
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = () => resolve(dataUrl); // fallback: use original
      img.src = dataUrl;
    });
  };


  const validateAndProcessFile = async (file: File) => {
    setFileError(null);
    setAnalysisCompleted(false);
    setVisionOutput(null);
    setPossibleMatches([]);
    setSelectedMatch(null);
    setIsTakingLonger(false);
    setActiveDebugRecord(null);

    const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

    if (!ACCEPTED_TYPES.includes(file.type.toLowerCase())) {
      setFileError(`Unsupported file format "${file.type || file.name}". Please select a JPG, PNG, or WEBP photo.`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setFileError(`File size (${sizeMB}MB) exceeds the 10MB limit.`);
      return false;
    }

    const sizeFormatted = (file.size / 1024).toFixed(0) + ' KB';
    setSelectedFileMeta({ name: file.name, size: sizeFormatted });

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const qualityCheck = await inspectImageQuality(dataUrl);

      if (!qualityCheck.valid) {
        setFileError(qualityCheck.reason || 'Image quality check failed. Please upload a clearer photo.');
        setUploadedImage(null);
        setSelectedFileMeta(null);
        return;
      }

      setUploadedImage(dataUrl);
      // Compress before sending to backend for faster scan
      const compressedDataUrl = await compressImageIfNeeded(dataUrl);
      triggerRealVisionAnalysis(compressedDataUrl);
    };

    reader.readAsDataURL(file);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndProcessFile(file);
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    cancelTokenRef.current = true;
    setUploadedImage(null);
    setSelectedFileMeta(null);
    setFileError(null);
    setVisionOutput(null);
    setPossibleMatches([]);
    setSelectedMatch(null);
    setAnalyzing(false);
    setAnalysisCompleted(false);
    setIsTakingLonger(false);
    setActiveDebugRecord(null);
  };

  const handleCancelAnalysis = () => {
    cancelTokenRef.current = true;
    setAnalyzing(false);
    setAnalysisStep('Analysis cancelled by user.');
  };

  const triggerRealVisionAnalysis = async (imgDataUrl?: string) => {
    const targetImg = imgDataUrl || uploadedImage;
    if (!targetImg) return;

    cancelTokenRef.current = false;
    setAnalyzing(true);
    setVisionOutput(null);
    setPossibleMatches([]);
    setSelectedMatch(null);
    setAnalysisCompleted(false);
    setIsTakingLonger(false);
    setCurrentStageIndex(0);
    setAnalysisStep(stages[0]);

    const stageTimer = setInterval(() => {
      setCurrentStageIndex(prev => {
        if (prev < 3) return prev + 1;
        return prev;
      });
    }, 450);

    try {
      const { output, debugRecord } = await analyzeGymMachineImage(targetImg, machines, selectedFileMeta?.name);
      clearInterval(stageTimer);

      if (cancelTokenRef.current) return;

      setActiveDebugRecord(debugRecord);
      setVisionOutput(output);
      setCurrentStageIndex(3);

      // Start cooldown timer if rate limited
      if (output.result_status === 'VISION_API_RATE_LIMITED') {
        startCooldown(output.retryDelay);
      }

      if (output.result_status === 'MACHINE_IDENTIFIED' || output.result_status === 'confirmed_candidate') {
        if (output.possible_machine_name) {
          const primary = machines.find(m => m.name.toLowerCase() === output.possible_machine_name?.toLowerCase());

          if (primary) {
            const matchCandidates: { machine: Machine; matchingFeatures: string[]; notes: string }[] = [
              {
                machine: primary,
                matchingFeatures: output.visible_features.length > 0 ? output.visible_features : (primary.visualCharacteristics || ['Verified Category Alignment']),
                notes: 'Confirmed candidate based on visual features and category alignment.'
              }
            ];

            if (output.alternative_matches && output.alternative_matches.length > 0) {
              for (const altName of output.alternative_matches) {
                const altMachine = machines.find(m => m.name.toLowerCase() === altName.toLowerCase() && m.id !== primary.id);
                if (altMachine) {
                  matchCandidates.push({
                    machine: altMachine,
                    matchingFeatures: altMachine.visualCharacteristics || [`${altMachine.category} Station`],
                    notes: `Alternative option in the ${altMachine.category} category.`
                  });
                }
              }
            }

            setPossibleMatches(matchCandidates);
            setSelectedMatch(primary);
          }
        }
      }

      setAnalyzing(false);
      setAnalysisCompleted(true);
    } catch (err: any) {
      clearInterval(stageTimer);
      setAnalyzing(false);
      setFileError('An error occurred during vision analysis. Please try again.');
    }
  };

  const handleConfirmAndProceed = () => {
    if (!selectedMatch) return;
    if (activeDebugRecord) {
      markAnalysisDebugRecordConfirmed(activeDebugRecord.analysisId);
    }
    onMachineConfirmed(
      selectedMatch, 
      'photo', 
      uploadedImage || undefined,
      (visionOutput?.confidence || 90) / 100
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      
      {/* 0. Fullscreen AI Vision Scanning Loader */}
      <ScanningLoader isScanning={analyzing} />

      {/* User-Facing Info Banner */}
      <div className="w-full max-w-xl mx-auto my-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Instant AI Analysis</h4>
            <p className="text-[11px] text-slate-400">Upload any commercial strength machine for instant setup & exercise guidance.</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider uppercase whitespace-nowrap">
          ⚡ AI Online
        </span>
      </div>

      {/* 2. Upload Box / Image Preview Card with Enhanced Drag-and-Drop Dropzone */}
      <PhotoUploadTab
        onImageSelected={validateAndProcessFile}
        isScanning={analyzing}
        previewUrl={uploadedImage}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {fileError && (
        <div style={{
          background: 'rgba(255, 71, 87, 0.1)',
          border: '1px solid rgba(255, 71, 87, 0.3)',
          borderRadius: '12px',
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.65rem',
          color: '#FF6B81',
          fontSize: '0.82rem',
          textAlign: 'left',
          marginBottom: '1rem'
        }}>
          <AlertCircle size={18} color="#FF4757" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#FF4757', display: 'block', marginBottom: '2px' }}>Image Issue</strong>
            {fileError}
          </div>
        </div>
      )}

      {analyzing && (
        <div style={{
          background: 'rgba(11, 15, 23, 0.85)',
          border: '1px solid rgba(0, 245, 155, 0.25)',
          borderRadius: '16px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', maxWidth: '340px', textAlign: 'left' }}>
            {stages.map((stg, sIdx) => {
              const isPast = currentStageIndex > sIdx;
              const isCurrent = currentStageIndex === sIdx;
              return (
                <div key={sIdx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.72rem',
                  color: isPast ? '#00F59B' : isCurrent ? '#F1F5F9' : '#64748B',
                  fontWeight: isCurrent ? 700 : 500
                }}>
                  {isPast ? (
                    <Check size={13} color="#00F59B" />
                  ) : isCurrent ? (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D2FF', animation: 'pulse 1s infinite' }} />
                  ) : (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#334155' }} />
                  )}
                  <span>{stg}</span>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleCancelAnalysis}
            className="btn-ghost"
            style={{ fontSize: '0.75rem', color: '#94A3B8' }}
          >
            <XCircle size={14} /> Cancel Analysis
          </button>
        </div>
      )}

      {uploadedImage && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {selectedFileMeta && (
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Selected: <strong style={{ color: '#F1F5F9' }}>{selectedFileMeta.name}</strong> ({selectedFileMeta.size})
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={analyzing}
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.55rem 1rem' }}
            >
              <Camera size={14} /> Take Photo with Camera
            </button>

            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={analyzing}
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.55rem 1rem', color: '#FF6B81', borderColor: 'rgba(255, 71, 87, 0.25)' }}
            >
              <Trash2 size={14} /> Remove Image
            </button>

            {!analysisCompleted && (
              <button
                type="button"
                onClick={() => triggerRealVisionAnalysis()}
                disabled={analyzing || cooldownSeconds > 0}
                className="btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.55rem 1.3rem' }}
              >
                <Sparkles size={16} /> Identify Machine
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Instructions */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        fontSize: '0.8rem',
        color: '#94A3B8'
      }}>
        <strong style={{ color: '#00D2FF', display: 'block', marginBottom: '4px' }}>
          💡 Instructions for Best Photo Analysis:
        </strong>
        <p style={{ margin: 0, lineHeight: 1.5, color: '#CBD5E1' }}>
          For better results, show the full machine, including its seat, handles, frame, and adjustment points. Avoid blurry or heavily obstructed images.
        </p>
      </div>

      {/* 4. STATE: VISION_API_RATE_LIMITED (HTTP 429) */}
      {analysisCompleted && visionOutput && visionOutput.result_status === 'VISION_API_RATE_LIMITED' && (
        <div style={{
          background: 'rgba(255, 184, 0, 0.08)',
          border: '1px solid rgba(255, 184, 0, 0.3)',
          borderRadius: '18px',
          padding: '1.5rem',
          textAlign: 'left',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
            <Clock size={28} color="#FFB800" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '1.1rem', color: '#F1F5F9', margin: 0 }}>
                AI quota temporarily reached
              </h4>
              <span className="badge badge-amber" style={{ fontSize: '0.65rem', marginTop: '3px' }}>
                HTTP 429 • RESOURCE_EXHAUSTED
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#CBD5E1', margin: '0 0 0.85rem 0', lineHeight: 1.5 }}>
            The Gemini API free tier request limit (20 requests/day per model) was reached. Your image was uploaded successfully. Please wait for the cooldown window before resending.
          </p>

          {cooldownSeconds > 0 ? (
            <div style={{
              background: 'rgba(255, 184, 0, 0.12)',
              border: '1px solid rgba(255, 184, 0, 0.25)',
              borderRadius: '10px',
              padding: '0.6rem 0.9rem',
              fontSize: '0.82rem',
              color: '#FFB800',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Clock size={16} className="animate-spin" />
              <span>Retry Cooldown Active: Resending available in <strong>{cooldownSeconds}s</strong></span>
            </div>
          ) : (
            <div style={{
              background: 'rgba(0, 245, 155, 0.1)',
              border: '1px solid rgba(0, 245, 155, 0.25)',
              borderRadius: '10px',
              padding: '0.6rem 0.9rem',
              fontSize: '0.82rem',
              color: '#00F59B',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle size={16} />
              <span>Cooldown complete! You can resend your image now.</span>
            </div>
          )}

          {/* Diagnostic response body box in development/debug mode */}
          {visionOutput.geminiError && (
            <div style={{
              background: '#07090E',
              border: '1px solid rgba(255, 184, 0, 0.25)',
              borderRadius: '12px',
              padding: '0.85rem',
              marginBottom: '1.25rem',
              overflowX: 'auto'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#FFB800', fontWeight: 700, marginBottom: '4px' }}>
                Gemini API Error Response Diagnostic Details:
              </div>
              <pre style={{
                margin: 0,
                fontSize: '0.72rem',
                color: '#CBD5E1',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {JSON.stringify(visionOutput.geminiError, null, 2)}
              </pre>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => triggerRealVisionAnalysis()}
              disabled={cooldownSeconds > 0}
              className="btn-secondary"
              style={{
                fontSize: '0.85rem',
                opacity: cooldownSeconds > 0 ? 0.6 : 1,
                cursor: cooldownSeconds > 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <RotateCcw size={15} /> {cooldownSeconds > 0 ? `Try Again (${cooldownSeconds}s)` : 'Re-send Image to Gemini'}
            </button>

            {onSelectManual && (
              <button
                type="button"
                onClick={onSelectManual}
                className="btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                <FileSearch size={15} /> Select Machine Manually
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. STATE: VISION_API_UNAVAILABLE (HTTP 503) */}
      {analysisCompleted && visionOutput && visionOutput.result_status === 'VISION_API_UNAVAILABLE' && (
        <div style={{
          background: 'rgba(255, 71, 87, 0.08)',
          border: '1px solid rgba(255, 71, 87, 0.3)',
          borderRadius: '18px',
          padding: '1.5rem',
          textAlign: 'left',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
            <AlertTriangle size={28} color="#FF4757" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '1.1rem', color: '#F1F5F9', margin: 0 }}>
                AI service temporarily unavailable
              </h4>
              <span className="badge badge-rose" style={{ fontSize: '0.65rem', marginTop: '3px' }}>
                HTTP 503 Unavailable
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#CBD5E1', margin: '0 0 0.85rem 0', lineHeight: 1.5 }}>
            {visionOutput.errorMessage || 'Gemini Vision service is temporarily unavailable. Please try again later.'}
          </p>

          {visionOutput.geminiError && (
            <div style={{
              background: '#07090E',
              border: '1px solid rgba(255, 71, 87, 0.25)',
              borderRadius: '12px',
              padding: '0.85rem',
              marginBottom: '1.25rem',
              overflowX: 'auto'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#FF6B81', fontWeight: 700, marginBottom: '4px' }}>
                Gemini API Error Response Diagnostic Details:
              </div>
              <pre style={{
                margin: 0,
                fontSize: '0.72rem',
                color: '#CBD5E1',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {JSON.stringify(visionOutput.geminiError, null, 2)}
              </pre>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => triggerRealVisionAnalysis()}
              className="btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              <RotateCcw size={15} /> Try Again
            </button>

            {onSelectManual && (
              <button
                type="button"
                onClick={onSelectManual}
                className="btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                <FileSearch size={15} /> Select Machine Manually
              </button>
            )}
          </div>
        </div>
      )}

      {/* 6. STATE: VISION_API_ERROR (Other API/Network Errors) */}
      {analysisCompleted && visionOutput && visionOutput.result_status === 'VISION_API_ERROR' && (
        <div style={{
          background: 'rgba(255, 71, 87, 0.08)',
          border: '1px solid rgba(255, 71, 87, 0.3)',
          borderRadius: '18px',
          padding: '1.5rem',
          textAlign: 'left',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
            <AlertCircle size={28} color="#FF4757" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '1.1rem', color: '#F1F5F9', margin: 0 }}>
                Vision API Error
              </h4>
              <span className="badge badge-rose" style={{ fontSize: '0.65rem', marginTop: '3px' }}>
                HTTP {visionOutput.statusHttp || 500}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#CBD5E1', margin: '0 0 0.85rem 0', lineHeight: 1.5 }}>
            {visionOutput.errorMessage || 'Gemini request failed.'}
          </p>

          {visionOutput.geminiError && (
            <div style={{
              background: '#07090E',
              border: '1px solid rgba(255, 71, 87, 0.25)',
              borderRadius: '12px',
              padding: '0.85rem',
              marginBottom: '1.25rem',
              overflowX: 'auto'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#FF6B81', fontWeight: 700, marginBottom: '4px' }}>
                Gemini Diagnostic Error Details:
              </div>
              <pre style={{
                margin: 0,
                fontSize: '0.72rem',
                color: '#CBD5E1',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {JSON.stringify(visionOutput.geminiError, null, 2)}
              </pre>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => triggerRealVisionAnalysis()}
              className="btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              <RotateCcw size={15} /> Try Again
            </button>

            {onSelectManual && (
              <button
                type="button"
                onClick={onSelectManual}
                className="btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                <FileSearch size={15} /> Select Machine Manually
              </button>
            )}
          </div>
        </div>
      )}

      {/* 7. STATE: MACHINE_NOT_IDENTIFIED (Image OK, but AI could not identify machine or low confidence) */}
      {analysisCompleted && visionOutput && (visionOutput.result_status === 'MACHINE_NOT_IDENTIFIED' || visionOutput.result_status === 'uncertain' || visionOutput.result_status === 'unknown') && (
        <div style={{
          background: 'rgba(255, 184, 0, 0.08)',
          border: '1px solid rgba(255, 184, 0, 0.3)',
          borderRadius: '18px',
          padding: '1.75rem 1.5rem',
          textAlign: 'center',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'rgba(255, 184, 0, 0.12)',
            border: '1px solid rgba(255, 184, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.85rem auto'
          }}>
            <HelpCircle size={30} color="#FFB800" />
          </div>

          <h4 style={{ fontSize: '1.2rem', color: '#F1F5F9', marginBottom: '0.45rem', fontWeight: 600 }}>
            Machine Unrecognized or Low Confidence
          </h4>

          <p style={{ fontSize: '0.86rem', color: '#CBD5E1', margin: '0 auto 0.85rem auto', maxWidth: '480px', lineHeight: 1.5 }}>
            {visionOutput.uncertainty_reason || "The image was uploaded, but the recognition model confidence is below the required 50% threshold. The machine features could not be reliably identified."}
          </p>

          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            margin: '0 auto 1.4rem auto',
            maxWidth: '440px',
            fontSize: '0.78rem',
            color: '#94A3B8',
            textAlign: 'left',
            lineHeight: 1.45
          }}>
            <span style={{ color: '#00D2FF', fontWeight: 600, display: 'block', marginBottom: '3px' }}>💡 Helpful Tips:</span>
            • Try taking a photo from another angle showing the full frame & seat.<br />
            • Ensure good lighting without glare or blur.<br />
            • Or select/search for the machine directly from the exercise library.
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="btn-primary"
              style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Camera size={15} /> Try Another Angle
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary"
              style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Upload size={15} /> Upload Clearer Photo
            </button>

            {onSelectManual && (
              <button
                type="button"
                onClick={onSelectManual}
                className="btn-secondary"
                style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FileSearch size={15} /> Search Manually
              </button>
            )}
          </div>
        </div>
      )}

      {/* 8. STATE: MACHINE_IDENTIFIED */}
      {analysisCompleted && visionOutput && (visionOutput.result_status === 'MACHINE_IDENTIFIED' || visionOutput.result_status === 'confirmed_candidate') && possibleMatches.length > 0 && selectedMatch && (
        <div className="glass-card" style={{ padding: '1.5rem', animation: 'fadeIn 0.25s ease-out' }}>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '6px' }}>
              <span className={`badge ${visionOutput.confidence >= 80 ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.72rem' }}>
                {visionOutput.confidence >= 80 ? 'Confirmed Match' : 'Likely Match — You can confirm this machine'}
              </span>
              <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                Confidence: {visionOutput.confidence}%
              </span>
            </div>
            
            <h3 style={{ fontSize: '1.25rem', color: '#F1F5F9', margin: '4px 0 4px 0' }}>
              Machine: <strong style={{ color: '#00F59B' }}>{selectedMatch.name}</strong>
            </h3>
            
            <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: '0 0 6px 0' }}>
              Exercise: <strong style={{ color: '#00D2FF' }}>{selectedMatch.name}</strong> • Category: <strong style={{ color: '#F1F5F9' }}>{selectedMatch.category}</strong>
            </p>
            
            {selectedMatch.primaryMuscles && selectedMatch.primaryMuscles.length > 0 && (
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0 }}>
                Target Muscles: <span style={{ color: '#CBD5E1' }}>{selectedMatch.primaryMuscles.join(', ')}</span>
              </p>
            )}

            {visionOutput.setupSteps && visionOutput.setupSteps.length > 0 && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.75rem 0.9rem',
                background: 'rgba(0, 210, 255, 0.05)',
                border: '1px solid rgba(0, 210, 255, 0.2)',
                borderRadius: '10px'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00D2FF', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                  ⚡ Quick Setup:
                </span>
                <ol style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.75rem', color: '#CBD5E1', lineHeight: 1.45 }}>
                  {visionOutput.setupSteps.map((step, sIdx) => (
                    <li key={sIdx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {possibleMatches.map((match, idx) => {
              const isSelected = selectedMatch.id === match.machine.id;

              return (
                <div
                  key={match.machine.id}
                  onClick={() => setSelectedMatch(match.machine)}
                  style={{
                    background: isSelected ? 'rgba(0, 245, 155, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1.5px solid #00F59B' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.85rem',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1 }}>
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: isSelected ? '#00F59B' : 'rgba(255, 255, 255, 0.1)',
                      color: '#05140F',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '0.95rem' }}>
                          {match.machine.name}
                        </span>
                        <span className="badge badge-muted" style={{ fontSize: '0.65rem' }}>
                          {match.machine.category}
                        </span>
                        {idx === 0 && (
                          <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                            Top Match
                          </span>
                        )}
                      </div>

                      <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {match.matchingFeatures.map((feat, fIdx) => (
                          <span
                            key={fIdx}
                            style={{
                              fontSize: '0.7rem',
                              background: 'rgba(255, 255, 255, 0.05)',
                              padding: '2px 7px',
                              borderRadius: '6px',
                              color: '#CBD5E1'
                            }}
                          >
                            ✓ {feat}
                          </span>
                        ))}
                      </div>

                      <p style={{ fontSize: '0.76rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: 1.35 }}>
                        {match.notes}
                      </p>
                    </div>
                  </div>

                  <div style={{ width: '80px', height: '50px', background: '#07090E', borderRadius: '8px', padding: '4px', flexShrink: 0 }}>
                    <MachineSvgIllustration type={match.machine.imageSvg} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => triggerRealVisionAnalysis()}
              className="btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              <RotateCcw size={14} /> Re-analyze
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              <Upload size={14} /> Upload Another
            </button>

            <button
              type="button"
              onClick={handleConfirmAndProceed}
              className="btn-primary"
              style={{ flex: 1, minWidth: '220px', fontSize: '0.9rem' }}
            >
              <CheckCircle size={18} /> Confirm "{selectedMatch.name}"
            </button>
          </div>
        </div>
      )}

      {/* Admin Debug Panel */}
      {userProfile?.role === 'admin' && activeDebugRecord && (
        <div style={{
          background: '#0B0F17',
          border: '1px solid rgba(0, 210, 255, 0.3)',
          borderRadius: '16px',
          padding: '1.25rem',
          fontSize: '0.78rem',
          fontFamily: 'monospace',
          color: '#94A3B8',
          marginTop: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <strong style={{ color: '#00D2FF', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={16} /> Admin Vision Debug Log
            </strong>
            <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{activeDebugRecord.analysisId}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
            <div><strong>Timestamp:</strong> {activeDebugRecord.dateTime}</div>
            <div><strong>Model Name:</strong> {activeDebugRecord.modelName}</div>
            <div><strong>Request Status:</strong> {activeDebugRecord.requestStatus}</div>
            <div><strong>HTTP Status:</strong> {activeDebugRecord.responseStatus}</div>
            <div><strong>Selected Machine:</strong> {activeDebugRecord.selectedMachineName || 'None'}</div>
          </div>
        </div>
      )}

    </div>
  );
};
