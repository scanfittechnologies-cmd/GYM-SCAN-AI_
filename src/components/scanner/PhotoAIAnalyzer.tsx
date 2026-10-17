import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
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
  ShieldAlert,
  QrCode
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
import { playSuccessFeedback, extractGymMachineCode } from '../../utils/scannerFeedback';

/**
 * Compress/downscale an image data URL if it's too large.
 * Keeps images under 1200px wide and under ~1MB base64 size for fast scanning.
 */
export const compressImageIfNeeded = (dataUrl: string): Promise<string> => {
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

interface PhotoAIAnalyzerProps {
  onMachineConfirmed: (machine: Machine, scanType: 'photo', imageUrl?: string, confidence?: number) => void;
  onOpenSettingsDocs: () => void;
  onSelectManual?: () => void;
  initialMode?: 'ai' | 'qr';
}

export const PhotoAIAnalyzer: React.FC<PhotoAIAnalyzerProps> = ({
  onMachineConfirmed,
  onOpenSettingsDocs,
  onSelectManual,
  initialMode = 'ai'
}) => {
  const { machines, userProfile } = useGym();
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const cancelTokenRef = useRef<boolean>(false);
  const cooldownIntervalRef = useRef<any>(null);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFileMeta, setSelectedFileMeta] = useState<{ name: string; size: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [liveCameraMode, setLiveCameraMode] = useState<'ai' | 'qr'>(initialMode);

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const qrAnimationRef = useRef<number | null>(null);
  const isQrScanningRef = useRef<boolean>(false);

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

  // Stop live WebRTC camera stream
  const stopLiveCamera = useCallback(() => {
    isQrScanningRef.current = false;
    if (qrAnimationRef.current) {
      cancelAnimationFrame(qrAnimationRef.current);
      qrAnimationRef.current = null;
    }
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(track => track.stop());
      activeStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsLiveCameraOpen(false);
    setCameraError(null);
  }, []);

  // Helper for dynamic content based on liveCameraMode ('ai' vs 'qr')
  const getModeContent = () => {
    if (liveCameraMode === 'qr') {
      return {
        icon: <QrCode size={34} color="#00F59B" />,
        badgeText: 'Equipment QR Badge Scanner',
        title: 'Equipment QR Badge Scanner',
        subtitle: 'Align the equipment QR sticker inside the frame for automatic instant detection.',
        mainButton: '📷 Open QR Badge Scanner',
        liveStatusText: 'Real-Time QR Scanner Active',
        helperText: 'Position QR badge inside green box',
        accentColor: '#00F59B',
        buttonGradient: 'linear-gradient(135deg, #00F59B 0%, #00B36B 100%)',
        buttonTextColor: '#040810',
        boxShadow: '0 6px 20px rgba(0, 245, 155, 0.35)'
      };
    }
    return {
      icon: <Sparkles size={34} color="#00D2FF" />,
      badgeText: 'AI Machine Photo Recognition',
      title: 'AI Machine Photo Recognition',
      subtitle: 'Point your camera directly at any gym machine and take a photo for 3-second Gemini AI identification.',
      mainButton: '⚡ Open AI Camera Scanner',
      liveStatusText: 'Live AI Machine Frame Active',
      helperText: 'Align gym machine inside frame & tap Snap Photo',
      accentColor: '#00D2FF',
      buttonGradient: 'linear-gradient(135deg, #00D2FF 0%, #0077FE 100%)',
      buttonTextColor: '#FFFFFF',
      boxShadow: '0 6px 20px rgba(0, 210, 255, 0.35)'
    };
  };

  // Real-time QR scanner loop for live camera feed
  const scanQrFrameRef = useRef<() => void>(() => {});

  const scanQrFrame = useCallback(() => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      if (isQrScanningRef.current) {
        qrAnimationRef.current = requestAnimationFrame(() => scanQrFrameRef.current());
      }
      return;
    }

    // When Mode === 'AI', hide the continuous QR auto-scanner loop
    if (liveCameraMode !== 'qr') {
      return;
    }

    const video = videoRef.current;
    if (!qrCanvasRef.current) {
      qrCanvasRef.current = document.createElement('canvas');
    }
    const canvas = qrCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        const cleanCode = extractGymMachineCode(code.data);
        const match = machines.find(m => 
          (m.qrCodeId && m.qrCodeId.toUpperCase() === cleanCode) || 
          m.id.toUpperCase() === cleanCode ||
          m.name.toUpperCase() === cleanCode
        );

        if (match) {
          playSuccessFeedback();
          stopLiveCamera();
          setSelectedMatch(match);
          setPossibleMatches([{
            machine: match,
            matchingFeatures: match.visualCharacteristics || ['QR Badge Verified'],
            notes: `Instant match via QR Badge (${match.qrCodeId}).`
          }]);
          setVisionOutput({
            equipmentVisible: true,
            equipment_detected: true,
            imageQuality: 'good',
            machineIdentified: true,
            machineName: match.name,
            machineCategory: match.category,
            equipment_category: match.category,
            possible_machine_name: match.name,
            confidence: 100,
            possibleMatches: [{ name: match.name, confidence: 100 }],
            alternative_matches: [],
            visualFeatures: match.visualCharacteristics || [],
            visible_features: match.visualCharacteristics || [],
            primaryMuscles: match.primaryMuscles,
            setupSteps: match.setupInstructions || [],
            needs_more_photos: false,
            result_status: 'MACHINE_IDENTIFIED'
          });
          setAnalysisCompleted(true);
          return;
        }
      }
    }

    if (isQrScanningRef.current) {
      qrAnimationRef.current = requestAnimationFrame(() => scanQrFrameRef.current());
    }
  }, [machines, stopLiveCamera, liveCameraMode]);

  useEffect(() => {
    scanQrFrameRef.current = scanQrFrame;
  }, [scanQrFrame]);

  // Start live WebRTC camera stream
  const startLiveCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    setCameraError(null);
    setIsLiveCameraOpen(true);

    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      setCameraError('Camera access is not supported by your browser.');
      return;
    }

    try {
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach(track => track.stop());
        activeStreamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing || "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      activeStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
        videoRef.current.play().catch(console.error);
      }

      isQrScanningRef.current = true;
      qrAnimationRef.current = requestAnimationFrame(scanQrFrame);
    } catch (err: any) {
      console.warn('Live camera access error:', err);
      setCameraError(err?.message || 'Could not access camera. Please check camera permissions.');
    }
  };

  // Capture photo from live video feed
  const captureLivePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.92);

    stopLiveCamera();

    setUploadedImage(rawDataUrl);
    setSelectedFileMeta({ name: `live-scan-${Date.now()}.jpg`, size: `${Math.round((rawDataUrl.length * 0.75) / 1024)} KB` });

    const compressed = await compressImageIfNeeded(rawDataUrl);
    triggerRealVisionAnalysis(compressed);
  };

  // Sync video stream when live camera state opens
  useEffect(() => {
    if (isLiveCameraOpen && videoRef.current && activeStreamRef.current) {
      const video = videoRef.current;
      if (video.srcObject !== activeStreamRef.current) {
        video.srcObject = activeStreamRef.current;
      }
      video.onloadedmetadata = () => {
        video.play().catch(console.error);
      };
      video.play().catch(console.error);
    }
  }, [isLiveCameraOpen]);

  // Clean up timers & camera stream on unmount
  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach(track => track.stop());
        activeStreamRef.current = null;
      }
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
    <div className="pb-28 md:pb-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      
      {/* 0. Fullscreen AI Vision Scanning Loader */}
      <ScanningLoader isScanning={analyzing} />

      {/* Viewfinder Mode Switcher: QR Badge vs AI Snapshot */}
      <div
        className="flex flex-col sm:flex-row gap-2 w-full max-w-xl mx-auto p-1.5 sm:p-2"
        style={{
          background: 'rgba(15, 23, 42, 0.65)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <button
          type="button"
          onClick={() => {
            setLiveCameraMode('qr');
            setFileError(null);
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm cursor-pointer transition-all"
          style={{
            background: liveCameraMode === 'qr'
              ? 'linear-gradient(135deg, rgba(0, 245, 155, 0.2) 0%, rgba(13, 20, 28, 0.95) 100%)'
              : 'transparent',
            border: liveCameraMode === 'qr'
              ? '1.5px solid #00F59B'
              : '1px solid transparent',
            borderRadius: '12px',
            color: liveCameraMode === 'qr' ? '#00F59B' : '#94A3B8',
            fontWeight: 700,
            boxShadow: liveCameraMode === 'qr' ? '0 4px 16px rgba(0, 245, 155, 0.15)' : 'none'
          }}
        >
          <QrCode size={16} className="shrink-0" />
          <span>Scan QR Badge</span>
          {liveCameraMode === 'qr' && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00F59B' }} />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setLiveCameraMode('ai');
            setFileError(null);
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm cursor-pointer transition-all"
          style={{
            background: liveCameraMode === 'ai'
              ? 'linear-gradient(135deg, rgba(0, 210, 255, 0.2) 0%, rgba(12, 19, 32, 0.95) 100%)'
              : 'transparent',
            border: liveCameraMode === 'ai'
              ? '1.5px solid #00D2FF'
              : '1px solid transparent',
            borderRadius: '12px',
            color: liveCameraMode === 'ai' ? '#00D2FF' : '#94A3B8',
            fontWeight: 700,
            boxShadow: liveCameraMode === 'ai' ? '0 4px 16px rgba(0, 210, 255, 0.15)' : 'none'
          }}
        >
          <Sparkles size={16} className="shrink-0" />
          <span>Snap Machine Photo (AI)</span>
          {liveCameraMode === 'ai' && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D2FF' }} />
          )}
        </button>
      </div>

      {/* 2. Live WebRTC Camera Stream Viewport OR Upload Dropzone */}
      {isLiveCameraOpen ? (
        <div
          className="h-[55vh] max-h-[420px] md:h-[480px]"
          style={{
          position: 'relative',
          backgroundColor: '#07090E',
          borderRadius: '24px',
          overflow: 'hidden',
          border: liveCameraMode === 'ai' ? '1.5px solid #00D2FF' : '1.5px solid #00F59B',
          boxShadow: liveCameraMode === 'ai' ? '0 16px 36px rgba(0, 210, 255, 0.25)' : '0 16px 36px rgba(0, 245, 155, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Mode Switcher Segmented Control */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(7, 10, 18, 0.88)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '999px',
            padding: '3px',
            display: 'flex',
            gap: '4px',
            zIndex: 25
          }}>
            <button
              type="button"
              onClick={() => setLiveCameraMode('qr')}
              style={{
                background: liveCameraMode === 'qr' ? 'linear-gradient(135deg, #00F59B 0%, #00B36B 100%)' : 'transparent',
                border: 'none',
                borderRadius: '999px',
                padding: '4px 12px',
                color: liveCameraMode === 'qr' ? '#040810' : '#94A3B8',
                fontWeight: 700,
                fontSize: '0.73rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s ease'
              }}
            >
              <QrCode size={12} /> Scan QR Badge
            </button>
            <button
              type="button"
              onClick={() => setLiveCameraMode('ai')}
              style={{
                background: liveCameraMode === 'ai' ? 'linear-gradient(135deg, #00D2FF 0%, #0077FE 100%)' : 'transparent',
                border: 'none',
                borderRadius: '999px',
                padding: '4px 12px',
                color: liveCameraMode === 'ai' ? '#040810' : '#94A3B8',
                fontWeight: 700,
                fontSize: '0.73rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s ease'
              }}
            >
              <Sparkles size={12} /> Snap Machine Photo (AI)
            </button>
          </div>

          {/* Viewfinder Overlay with Laser & Target Frame */}
          {liveCameraMode === 'qr' ? (
            <div style={{
              position: 'absolute',
              width: '210px',
              height: '210px',
              border: '2px dashed rgba(0, 245, 155, 0.7)',
              borderRadius: '16px',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              <div className="viewfinder-corner corner-tl" style={{ borderColor: '#00F59B' }} />
              <div className="viewfinder-corner corner-tr" style={{ borderColor: '#00F59B' }} />
              <div className="viewfinder-corner corner-bl" style={{ borderColor: '#00F59B' }} />
              <div className="viewfinder-corner corner-br" style={{ borderColor: '#00F59B' }} />
              <div className="scanner-laser" />
            </div>
          ) : (
            <div style={{
              position: 'absolute',
              width: '82%',
              maxWidth: '340px',
              height: '220px',
              border: '1.5px dashed rgba(0, 210, 255, 0.65)',
              borderRadius: '18px',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              <div className="viewfinder-corner corner-tl" style={{ borderColor: '#00D2FF' }} />
              <div className="viewfinder-corner corner-tr" style={{ borderColor: '#00D2FF' }} />
              <div className="viewfinder-corner corner-bl" style={{ borderColor: '#00D2FF' }} />
              <div className="viewfinder-corner corner-br" style={{ borderColor: '#00D2FF' }} />
            </div>
          )}

          {/* Camera Header Actions (Switch Camera / Close) */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            gap: '6px',
            zIndex: 26
          }}>
            <button
              type="button"
              onClick={() => {
                const next = cameraFacing === 'environment' ? 'user' : 'environment';
                setCameraFacing(next);
                startLiveCamera(next);
              }}
              className="btn-ghost"
              style={{
                background: 'rgba(10, 14, 22, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
              title="Switch Camera (Front/Back)"
            >
              <RotateCcw size={14} color="#F1F5F9" />
            </button>
            <button
              type="button"
              onClick={stopLiveCamera}
              className="btn-ghost"
              style={{
                background: 'rgba(10, 14, 22, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
              title="Close Camera"
            >
              <XCircle size={16} color="#FF6B81" />
            </button>
          </div>

          {/* Bottom Controls Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            zIndex: 25
          }}>
            {/* When Mode === 'ai', display prominent glowing shutter button */}
            {liveCameraMode === 'ai' && (
              <button
                type="button"
                onClick={captureLivePhoto}
                style={{
                  background: 'linear-gradient(135deg, #00D2FF 0%, #0077FE 100%)',
                  color: '#FFFFFF',
                  border: '1.5px solid rgba(255, 255, 255, 0.35)',
                  borderRadius: '999px',
                  padding: '0.75rem 1.85rem',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 25px rgba(0, 210, 255, 0.45)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                }}
              >
                <Camera size={18} />
                <span>📸 Snap Photo for AI Scan</span>
                <Sparkles size={15} />
              </button>
            )}

            <div style={{
              background: 'rgba(10, 14, 22, 0.88)',
              backdropFilter: 'blur(8px)',
              padding: '5px 14px',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.75rem',
              color: '#CBD5E1',
              textAlign: 'center',
              maxWidth: '90%'
            }}>
              {getModeContent().helperText}
            </div>
          </div>
        </div>
      ) : !uploadedImage ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          {/* Dynamic Idle Card Content */}
          <div
            className="pb-28 md:pb-6"
            style={{
              backgroundColor: '#07090E',
              borderRadius: '24px',
              border: liveCameraMode === 'qr' ? '1px solid rgba(0, 245, 155, 0.3)' : '1px solid rgba(0, 210, 255, 0.3)',
              boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6)',
              paddingTop: '2.5rem',
              paddingLeft: '1.5rem',
              paddingRight: '1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem',
              animation: 'fadeIn 0.25s ease-out'
            }}
          >
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '22px',
              background: liveCameraMode === 'qr' ? 'rgba(0, 245, 155, 0.12)' : 'rgba(0, 210, 255, 0.12)',
              border: liveCameraMode === 'qr' ? '1px solid rgba(0, 245, 155, 0.35)' : '1px solid rgba(0, 210, 255, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: getModeContent().accentColor,
              boxShadow: liveCameraMode === 'qr' ? '0 0 25px rgba(0, 245, 155, 0.15)' : '0 0 25px rgba(0, 210, 255, 0.15)'
            }}>
              {getModeContent().icon}
            </div>

            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '0.45rem' }}>
                <span className={liveCameraMode === 'qr' ? 'badge badge-emerald' : 'badge badge-blue'} style={{ fontSize: '0.72rem' }}>
                  {getModeContent().badgeText}
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#F1F5F9', marginBottom: '0.45rem', fontWeight: 700 }}>
                {getModeContent().title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5, margin: 0, maxWidth: '380px' }}>
                {getModeContent().subtitle}
              </p>
            </div>

            <div className="mb-20 md:mb-0" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%', maxWidth: '320px' }}>
              <button
                type="button"
                onClick={() => startLiveCamera()}
                disabled={analyzing}
                style={{
                  background: getModeContent().buttonGradient,
                  color: getModeContent().buttonTextColor,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '14px',
                  border: 'none',
                  boxShadow: getModeContent().boxShadow,
                  cursor: analyzing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
              >
                {getModeContent().mainButton}
              </button>
            </div>
          </div>

          {/* When in AI mode and idle, provide Photo Upload option below */}
          {liveCameraMode === 'ai' && (
            <PhotoUploadTab
              onImageSelected={validateAndProcessFile}
              isScanning={analyzing}
              previewUrl={uploadedImage}
            />
          )}
        </div>
      ) : null}

      {cameraError && (
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
            <strong style={{ color: '#FF4757', display: 'block', marginBottom: '2px' }}>Camera Notice</strong>
            {cameraError}
          </div>
        </div>
      )}

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
              onClick={() => {
                if (typeof navigator.mediaDevices?.getUserMedia === 'function') {
                  setUploadedImage(null);
                  startLiveCamera();
                } else {
                  cameraInputRef.current?.click();
                }
              }}
              disabled={analyzing}
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.55rem 1rem' }}
            >
              <Camera size={14} /> Retake with Live Camera
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
