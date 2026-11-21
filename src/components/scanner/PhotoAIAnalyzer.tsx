import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { useGym } from '../../context/GymContext';
import { Machine, MachineCategory } from '../../types';
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

import ScanningLoader from './ScanningLoader';
import { PhotoUploadTab } from './PhotoUploadTab';
import {
  analyzeGymMachineImage,
  StructuredVisionOutput,
  AnalysisDebugRecord,
  markAnalysisDebugRecordConfirmed,
  sanitizeMatchReasons
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
  initialMode?: 'ai' | 'qr' | 'upload';
  activeMode?: 'qr' | 'ai_camera' | 'upload';
  onModeChange?: (mode: 'qr' | 'ai_camera' | 'upload') => void;
  onScanCredited?: () => void;
}

export const PhotoAIAnalyzer: React.FC<PhotoAIAnalyzerProps> = ({
  onMachineConfirmed,
  onOpenSettingsDocs,
  onSelectManual,
  initialMode = 'ai',
  activeMode,
  onModeChange,
  onScanCredited
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
  const [liveCameraMode, setLiveCameraMode] = useState<'ai' | 'qr'>(initialMode === 'qr' ? 'qr' : 'ai');

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const qrAnimationRef = useRef<number | null>(null);
  const isQrScanningRef = useRef<boolean>(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [showLimitModal, setShowLimitModal] = useState<boolean>(false);

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
    '3. Authenticating request with Vision Analysis service...',
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

  const currentMode: 'qr' | 'ai_camera' | 'upload' = activeMode || (initialMode === 'upload' ? 'upload' : liveCameraMode === 'qr' ? 'qr' : 'ai_camera');

  const handleSelectMode = (newMode: 'qr' | 'ai_camera' | 'upload') => {
    if (newMode === 'upload') {
      stopLiveCamera();
    } else if (newMode === 'qr') {
      setLiveCameraMode('qr');
    } else {
      setLiveCameraMode('ai');
    }
    setFileError(null);
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  useEffect(() => {
    if (activeMode === 'upload') {
      stopLiveCamera();
    } else if (activeMode === 'qr') {
      setLiveCameraMode('qr');
    } else if (activeMode === 'ai_camera') {
      setLiveCameraMode('ai');
    }
  }, [activeMode, stopLiveCamera]);

  // Helper for dynamic content based on liveCameraMode ('ai' vs 'qr')
  const getModeContent = () => {
    if (liveCameraMode === 'qr') {
      return {
        icon: <QrCode size={34} color="#00F59B" />,
        badgeText: 'Equipment QR Code Scanner',
        title: 'Equipment QR Code Scanner',
        subtitle: 'Align the equipment QR code inside the frame for automatic instant detection.',
        mainButton: '📷 Open QR Code Scanner',
        liveStatusText: 'Real-Time QR Scanner Active',
        helperText: 'Position QR code inside green box',
        accentColor: '#00F59B',
        buttonGradient: 'linear-gradient(135deg, #00F59B 0%, #00B36B 100%)',
        buttonTextColor: '#040810',
        boxShadow: '0 6px 20px rgba(0, 245, 155, 0.35)'
      };
    }
    return {
      icon: <Sparkles size={34} color="#00D2FF" />,
      badgeText: 'Machine Photo Recognition',
      title: 'Machine Photo Recognition',
      subtitle: 'Point your camera directly at any gym machine and take a photo for instant 3-second machine identification.',
      mainButton: '⚡ Open Camera',
      liveStatusText: 'Live AI Machine Frame Active',
      helperText: 'Align gym machine inside frame & tap Snap Photo',
      accentColor: '#00D2FF',
      buttonGradient: 'linear-gradient(135deg, #00D2FF 0%, #0077FE 100%)',
      buttonTextColor: '#FFFFFF',
      boxShadow: '0 6px 20px rgba(0, 210, 255, 0.35)'
    };
  };

  // Real-time QR scanner loop for live camera feed
  const scanQrFrameRef = useRef<() => void>(() => { });

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
    let rawDataUrl = canvas.toDataURL('image/jpeg', 0.92);

    stopLiveCamera();

    setUploadedImage(rawDataUrl);
    setSelectedFileMeta({ name: `live-scan-${Date.now()}.jpg`, size: `${Math.round((rawDataUrl.length * 0.75) / 1024)} KB` });

    const compressed = await compressImageIfNeeded(rawDataUrl);
    // Release raw frame reference — analysis uses compressed copy only
    rawDataUrl = '';
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

  const startCooldown = (delayStrOrSeconds?: string | number | null) => {
    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);

    let seconds = 30; // default 30s
    if (typeof delayStrOrSeconds === 'number') {
      seconds = delayStrOrSeconds;
    } else if (delayStrOrSeconds) {
      const match = delayStrOrSeconds.match(/(\d+)/);
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

    const completedScans = parseInt(localStorage.getItem('guest_scan_count') || '0', 10);

    // Block ONLY when 3 full scans have already been completed
    if (completedScans >= 3) {
      setShowLimitModal(true);
      return;
    }

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
        // Increment guest scan count ONLY inside the successful response block after Gemini Vision returns result
        localStorage.setItem('guest_scan_count', (completedScans + 1).toString());
        // Include output.title as a valid candidate source for dynamic Gemini-identified machines
        if (output.possible_machine_name || output.machineName || output.title) {
          const candidateName = output.title || output.possible_machine_name || output.machineName || 'Identified Machine';
          let primary = machines.find(m =>
            (output.libraryId && m.id.toLowerCase() === output.libraryId.toLowerCase()) ||
            m.name.toLowerCase() === candidateName.toLowerCase()
          );

          // Dynamic Machine generation for ANY equipment recognized by Gemini outside library
          if (!primary) {
            const dynamicCategory = (output.equipment_category !== 'Unknown' ? output.equipment_category : (output.machineCategory !== 'Unknown' ? output.machineCategory : 'Other')) as MachineCategory;
            const dynamicSetup = output.setupGuide && output.setupGuide.length > 0
              ? output.setupGuide
              : (output.setupSteps && output.setupSteps.length > 0 ? output.setupSteps : ['Adjust seating, pins, or console settings to appropriate starter levels.', 'Ensure proper posture and align joints with the pivot or motion path.', 'Execute the exercise or workout smoothly with controlled breathing.']);

            const lowerCand = candidateName.toLowerCase();
            const lowerCat = String(dynamicCategory).toLowerCase();
            const dynamicSvg = lowerCand.includes('treadmill') ? 'treadmill'
              : (lowerCand.includes('bike') || lowerCand.includes('cycle')) ? 'stationary-bike'
                : (lowerCand.includes('elliptical') || lowerCat.includes('cardio')) ? 'treadmill'
                  : lowerCand.includes('cable') ? 'cable-station'
                    : lowerCand.includes('lat') ? 'lat-pulldown'
                      : lowerCand.includes('row') ? 'seated-row'
                        : lowerCand.includes('smith') ? 'smith-machine'
                          : (lowerCand.includes('leg press') || lowerCand.includes('hack')) ? 'leg-press'
                            : lowerCand.includes('leg extension') ? 'leg-extension'
                              : lowerCand.includes('leg curl') ? 'leg-curl'
                                : lowerCand.includes('curl') ? 'preacher-curl'
                                  : lowerCand.includes('shoulder') ? 'shoulder-press'
                                    : (lowerCand.includes('pec deck') || lowerCand.includes('fly')) ? 'pec-deck'
                                      : lowerCand.includes('incline') ? 'incline-press'
                                        : 'chest-press';

            primary = output.dynamicMachine || {
              id: `new-machine-${Date.now()}`,
              name: output.title || candidateName,
              alternativeNames: [candidateName],
              category: dynamicCategory,
              tagline: output.description || 'AI-discovered gym equipment with dynamic setup instructions',
              difficulty: 'Intermediate',
              primaryMuscles: output.primaryMuscles && output.primaryMuscles.length > 0 ? output.primaryMuscles : ['Target Muscle Group'],
              secondaryMuscles: [],
              equipmentType: 'Free Motion / Other',
              qrCodeId: `AI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              matchKeywords: [candidateName.toLowerCase()],
              imageSvg: dynamicSvg,
              description: output.description || `Dynamic equipment identified by ScanFit Vision AI: ${candidateName}`,
              setupInstructions: dynamicSetup,
              movementGuidance: [
                'Maintain neutral spine and engage core throughout the movement.',
                'Control both concentric and eccentric phases without swinging.'
              ],
              commonMistakes: [
                { mistake: 'Using excessive momentum', fix: 'Lower resistance or speed and execute under controlled posture.' }
              ],
              safetyReminders: ['Inspect safety stops, belts, pins, or locking clips before beginning.'],
              tutorialSteps: dynamicSetup.map((step, idx) => ({
                stepNumber: idx + 1,
                title: `Step ${idx + 1}`,
                description: step
              })),
              verificationStatus: 'Community Sample'
            };
          }

          if (primary) {
            const rawPrimaryFeatures = output.visible_features.length > 0
              ? output.visible_features
              : (output.isNewMachine ? ['Dynamically Identified Machine', 'Custom AI Setup Guide Generated'] : (primary.visualCharacteristics || ['Verified Category Alignment']));

            const matchCandidates: { machine: Machine; matchingFeatures: string[]; notes: string }[] = [
              {
                machine: primary,
                matchingFeatures: sanitizeMatchReasons(rawPrimaryFeatures),
                notes: output.isNewMachine
                  ? 'Newly identified equipment outside local catalog — complete details generated by ScanFit Vision AI.'
                  : 'Confirmed candidate based on visual features and library alignment.'
              }
            ];

            if (output.alternative_matches && output.alternative_matches.length > 0) {
              for (const altName of output.alternative_matches) {
                const altMachine = machines.find(m => m.name.toLowerCase() === altName.toLowerCase() && m.id !== primary!.id);
                if (altMachine) {
                  matchCandidates.push({
                    machine: altMachine,
                    matchingFeatures: sanitizeMatchReasons(altMachine.visualCharacteristics || [`${altMachine.category} Station`]),
                    notes: `Alternative option in the ${altMachine.category} category.`
                  });
                }
              }
            }

            setPossibleMatches(matchCandidates);
            setSelectedMatch(primary);
            // Consume scan credit immediately upon AI recognition, before user confirmation
            onScanCredited?.();
            startCooldown(10);
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
    const ephemeralImg = uploadedImage;
    // Release ephemeral captured image immediately to clear from memory/state
    setUploadedImage(null);
    onMachineConfirmed(
      selectedMatch,
      'photo',
      ephemeralImg || undefined,
      (visionOutput?.confidence || 90) / 100
    );
  };

  return (
    <div className="pb-24 w-full flex flex-col gap-3.5">

      {/* 0. Minimal Fullscreen Scanning Loader */}
      <ScanningLoader isScanning={analyzing} />

      {/* 1. Live WebRTC Camera Stream Viewport OR Upload Dropzone */}
      {isLiveCameraOpen && currentMode !== 'upload' ? (
        <div className="relative w-full h-[380px] bg-[#0A0C0B] rounded-3xl overflow-hidden border border-[#222624] flex flex-col items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Clean Viewfinder Target Frame with Corner Focus Brackets */}
          <div className="absolute w-[72%] max-w-[270px] h-[210px] pointer-events-none flex items-center justify-center">
            {/* Corner brackets [ ] */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#22C55E] rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#22C55E] rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#22C55E] rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#22C55E] rounded-br-lg" />
            
            <span className="text-[11px] font-medium text-white/90 bg-[#0A0C0B]/75 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-sm">
              Frame the machine clearly
            </span>
          </div>

          {/* Camera Actions Header (Switch / Close) */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
            <button
              type="button"
              onClick={() => {
                const next = cameraFacing === 'environment' ? 'user' : 'environment';
                setCameraFacing(next);
                startLiveCamera(next);
              }}
              className="w-8 h-8 rounded-full bg-[#141716]/80 border border-[#222624] text-white flex items-center justify-center cursor-pointer hover:bg-[#1C201E]"
              title="Switch Camera"
            >
              <RotateCcw size={14} />
            </button>
            <button
              type="button"
              onClick={stopLiveCamera}
              className="w-8 h-8 rounded-full bg-[#141716]/80 border border-[#222624] text-[#9CA3AF] hover:text-white flex items-center justify-center cursor-pointer hover:bg-[#1C201E]"
              title="Close Camera"
            >
              <XCircle size={16} />
            </button>
          </div>

          {/* Bottom Shutter & Upload Pill Controls */}
          <div className="absolute bottom-4 inset-x-0 flex flex-col items-center gap-3 z-20">
            {/* Center Circular Green Shutter Button */}
            <button
              type="button"
              onClick={captureLivePhoto}
              disabled={analyzing || cooldownSeconds > 0}
              aria-label="Capture machine photo"
              className="w-16 h-16 rounded-full bg-[#22C55E] hover:bg-[#1ED760] active:scale-95 text-black border-4 border-[#0A0C0B] flex items-center justify-center shadow-lg transition-transform cursor-pointer"
            >
              <Camera size={26} strokeWidth={2.4} />
            </button>

            {/* Upload Secondary Pill */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#141716]/90 border border-[#222624] text-xs font-semibold text-[#9CA3AF] hover:text-white backdrop-blur-md cursor-pointer transition-colors"
            >
              <Upload size={13} />
              <span>Upload Photo</span>
            </button>
          </div>
        </div>
      ) : !uploadedImage ? (
        <div className="flex flex-col gap-3 w-full">
          {currentMode === 'upload' ? (
            <PhotoUploadTab
              onImageSelected={validateAndProcessFile}
              isScanning={analyzing}
              previewUrl={uploadedImage}
            />
          ) : (
            /* Idle Viewfinder Card */
            <div className="w-full bg-[#141716] border border-[#222624] rounded-3xl p-6 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-[#0A0C0B] border border-[#222624] flex items-center justify-center text-[#22C55E]">
                <Camera size={28} strokeWidth={2.2} />
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Camera Ready
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-1 max-w-[260px] leading-relaxed">
                  Point camera directly at any gym equipment for instant cues and setup guides.
                </p>
              </div>

              <div className="flex flex-col gap-2 w-full max-w-[280px]">
                <button
                  type="button"
                  onClick={() => startLiveCamera()}
                  disabled={analyzing}
                  className="w-full py-3 rounded-2xl bg-[#22C55E] hover:bg-[#1ED760] active:scale-98 text-black font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <Camera size={18} strokeWidth={2.4} />
                  <span>Open Live Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 rounded-2xl bg-[#0A0C0B] border border-[#222624] text-[#9CA3AF] hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Upload size={14} />
                  <span>Choose from Gallery</span>
                </button>
              </div>
            </div>
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
            The Vision Analysis daily request limit was reached. Your image was uploaded successfully. Please wait for the cooldown window before resending.
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
                Vision API Error Response Diagnostic Details:
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
              <RotateCcw size={15} /> {cooldownSeconds > 0 ? `Try Again (${cooldownSeconds}s)` : 'Re-send Image for Analysis'}
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
            {visionOutput.errorMessage || 'Vision Analysis service is temporarily unavailable. Please try again later.'}
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
                Vision API Error Response Diagnostic Details:
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
            {visionOutput.errorMessage || 'Vision Analysis request failed.'}
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
                Vision API Diagnostic Error Details:
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
      {(() => {
        const resultStatus = visionOutput?.result_status;
        const isUnrecognized = resultStatus === 'MACHINE_NOT_IDENTIFIED' || resultStatus === 'unknown';
        return analysisCompleted && visionOutput && (isUnrecognized || resultStatus === 'uncertain') && !visionOutput?.title && !visionOutput?.machineName && (
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
        );
      })()}

      {/* 8. STATE: MACHINE_IDENTIFIED - Native Hevy/Strong Gym Result View */}
      {analysisCompleted && visionOutput && (visionOutput.result_status === 'MACHINE_IDENTIFIED' || visionOutput.result_status === 'confirmed_candidate') && possibleMatches.length > 0 && selectedMatch && (
        <div className="w-full flex flex-col gap-3.5 select-none">

          {/* Top Machine Hero Card */}
          <div className="relative w-full rounded-3xl overflow-hidden border border-[#222624] bg-[#141716] flex flex-col justify-end p-4">
            <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-[#0A0C0B] border border-[#222624] mb-3">
              {uploadedImage || selectedMatch.frontReferenceImage ? (
                <img
                  src={uploadedImage || selectedMatch.frontReferenceImage!}
                  alt={selectedMatch.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#6B7280]">
                  <Camera size={36} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C0B]/90 via-transparent to-transparent" />
              
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#0A0C0B]/85 border border-[#222624] text-[10px] font-mono font-bold text-[#22C55E]">
                {visionOutput.confidence}% Match
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <h2 className="text-xl font-extrabold text-white tracking-tight leading-tight">
                {selectedMatch.name}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="text-[#22C55E] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  {selectedMatch.primaryMuscles[0]?.split('(')[0].trim() || selectedMatch.category}
                </span>
                {selectedMatch.secondaryMuscles && selectedMatch.secondaryMuscles.length > 0 && (
                  <span className="text-[#9CA3AF] text-[11px] truncate">
                    • {selectedMatch.secondaryMuscles.slice(0, 2).map(m => m.split('(')[0].trim()).join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Scannable Workout Cards (Hevy/Strong inspired) */}
          <div className="flex flex-col gap-2.5">
            {/* Quick Setup Card */}
            <div className="bg-[#141716] border border-[#222624] rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  Quick Setup
                </span>
                <span className="text-[10px] text-[#6B7280] font-semibold">1-2-3 Guide</span>
              </div>
              <div className="flex flex-col gap-1.5 text-xs text-[#CBD5E1]">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#0A0C0B] border border-[#222624] text-[10px] font-bold text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span><strong>Seat / Pad:</strong> Adjust seat height so joint aligns with the machine pivot.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#0A0C0B] border border-[#222624] text-[10px] font-bold text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span><strong>Pin Weight:</strong> Choose a warm-up pin weight that allows 10–12 controlled reps.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#0A0C0B] border border-[#222624] text-[10px] font-bold text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span><strong>Grip:</strong> Secure comfortable handle or pad position before initiating motion.</span>
                </div>
              </div>
            </div>

            {/* Form Execution Card */}
            <div className="bg-[#141716] border border-[#222624] rounded-2xl p-4 flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                Form Execution
              </span>
              <ul className="flex flex-col gap-1.5 text-xs text-[#CBD5E1] pl-1">
                <li className="flex items-start gap-2">
                  <span className="text-[#22C55E]">•</span>
                  <span>Maintain flat back against pad, chest up, and brace core.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#22C55E]">•</span>
                  <span>Push/pull through full active range without slamming weight plates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#22C55E]">•</span>
                  <span>Exhale on the exertion stroke; inhale slowly on the eccentric return.</span>
                </li>
              </ul>
            </div>

            {/* Common Mistakes */}
            <div className="bg-[#141716] border border-[#222624] rounded-2xl p-4 flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B81] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B81]" />
                Common Mistakes
              </span>
              <ul className="flex flex-col gap-1.5 text-xs text-[#9CA3AF] pl-1">
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B81]">✕</span>
                  <span>Using excessive momentum or arching spine off backrest.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B81]">✕</span>
                  <span>Locking out joints forcefully at the end of each rep.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={handleConfirmAndProceed}
              className="w-full py-3.5 rounded-2xl bg-[#22C55E] hover:bg-[#1ED760] active:scale-98 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
            >
              <CheckCircle size={18} strokeWidth={2.4} />
              <span>Mark Explored (+25 XP)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAnalysisCompleted(false);
                setVisionOutput(null);
                setUploadedImage(null);
                startLiveCamera();
              }}
              className="w-full py-2.5 rounded-2xl bg-[#141716] border border-[#222624] text-[#9CA3AF] hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw size={14} />
              <span>Scan Another Machine</span>
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

      {/* Scan Limit Paywall Modal */}
      {showLimitModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(5, 8, 15, 0.88)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.25rem',
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #101626 0%, #0A0E18 100%)',
            border: '1.5px solid rgba(255, 184, 0, 0.4)',
            borderRadius: '24px',
            padding: '2rem 1.5rem',
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 184, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            animation: 'fadeIn 0.2s ease-out',
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(255, 184, 0, 0.12)',
              border: '1px solid rgba(255, 184, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
            }}>
              🔒
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
              Daily Scan Limit Reached
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: 0, lineHeight: 1.55 }}>
              You've completed your <strong style={{ color: '#FFB800' }}>3 free scans</strong>. Further AI machine scans are locked until your limit resets.
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '0.65rem 1rem',
              fontSize: '0.78rem',
              color: '#CBD5E1',
              width: '100%',
            }}>
              ✨ 3 of 3 Free Scans Completed
            </div>

            <button
              type="button"
              onClick={() => setShowLimitModal(false)}
              className="btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', marginTop: '0.5rem' }}
            >
              Got It
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
