import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { useGym } from '../../context/GymContext';
import { Machine, MachineCategory } from '../../types';
import { 
  Camera, 
  CameraOff, 
  RefreshCw, 
  AlertCircle, 
  Search, 
  QrCode, 
  Sparkles, 
  Square, 
  ArrowRight, 
  CheckCircle, 
  RotateCcw,
  Loader2,
  HelpCircle,
  X,
  Dumbbell,
  Zap
} from 'lucide-react';

import ScanningLoader from './ScanningLoader';
import { compressImageIfNeeded } from './PhotoAIAnalyzer';
import { analyzeGymMachineImage, StructuredVisionOutput, sanitizeMatchReasons } from '../../services/visionService';
import { playSuccessFeedback, extractGymMachineCode } from '../../utils/scannerFeedback';

export interface CameraScannerProps {
  onMachineIdentified: (machine: Machine, scanType: 'qr' | 'photo', imageUrl?: string, confidence?: number) => void;
  onSwitchToManual: () => void;
  onSwitchToPhoto?: () => void;
  initialMode?: 'qr' | 'ai-snapshot';
  activeMode?: 'qr' | 'ai_camera' | 'upload';
  onModeChange?: (mode: 'qr' | 'ai_camera' | 'upload') => void;
  onScanCredited?: () => void;
}

export type CameraPermissionState = 
  | 'unrequested'
  | 'loading'
  | 'active'
  | 'denied'
  | 'unavailable'
  | 'stopped'
  | 'error';

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onMachineIdentified,
  onSwitchToManual,
  onSwitchToPhoto,
  initialMode = 'qr',
  activeMode = 'qr',
  onModeChange,
  onScanCredited
}) => {
  const { machines, getMachineByQRCode } = useGym();
  
  // Scanner Viewfinder Mode: QR Code Badge vs Snapshot AI Machine
  const [scannerMode, setScannerMode] = useState<'qr' | 'ai-snapshot'>(initialMode);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const [cameraState, setCameraState] = useState<CameraPermissionState>('unrequested');
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [scanError, setScanError] = useState<string | null>(null);
  const [showCameraHelpModal, setShowCameraHelpModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  // Result identification states
  const [detectedMachine, setDetectedMachine] = useState<Machine | null>(null);
  const [detectedScanType, setDetectedScanType] = useState<'qr' | 'photo'>('qr');
  const [detectedImageUrl, setDetectedImageUrl] = useState<string | null>(null);
  const [detectedConfidence, setDetectedConfidence] = useState<number | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // AI Snapshot states
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [visionOutput, setVisionOutput] = useState<StructuredVisionOutput | null>(null);
  const [aiPossibleMatches, setAiPossibleMatches] = useState<{ machine: Machine; matchingFeatures: string[]; notes: string }[]>([]);
  const [selectedAiMatch, setSelectedAiMatch] = useState<Machine | null>(null);

  // Stop camera stream safely
  const stopCameraStream = useCallback(() => {
    isScanningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      activeStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState('stopped');
  }, []);

  /** Start a post-scan cooldown timer (default 10s) to prevent rapid button spam. */
  const startCooldown = useCallback((seconds = 10) => {
    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    setCooldownSeconds(seconds);
    cooldownIntervalRef.current = setInterval(() => {
      setCooldownSeconds(prev => {
        if (prev <= 1) {
          clearInterval(cooldownIntervalRef.current!);
          cooldownIntervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Process QR Code against exact database mapping with audio & haptic chime
  const processQRCode = useCallback((rawCode: string) => {
    if (!rawCode || isVerifying) return;
    const cleanCode = extractGymMachineCode(rawCode);
    if (!cleanCode) return;
    
    setScanError(null);
    setIsVerifying(true);
    setLastScannedCode(cleanCode);

    // Database lookup
    setTimeout(() => {
      setIsVerifying(false);
      const machine = getMachineByQRCode(cleanCode) || 
        machines.find(m => 
          (m.qrCodeId && m.qrCodeId.toUpperCase() === cleanCode) || 
          m.id.toUpperCase() === cleanCode ||
          m.name.toUpperCase() === cleanCode
        );

      if (machine) {
        playSuccessFeedback();
        setDetectedMachine(machine);
        setDetectedScanType('qr');
        setDetectedConfidence(100);
        setDetectedImageUrl(null);
        stopCameraStream();
      } else {
        setDetectedMachine(null);
        setScanError(`We couldn't find equipment code "${cleanCode}" in our database. Check the badge code or try our Snapshot AI Machine Scanner.`);
      }
    }, 200);
  }, [getMachineByQRCode, isVerifying, machines, stopCameraStream]);

  // Dynamic helper for Mode === 'qr' vs Mode === 'ai-snapshot'
  const getModeContent = () => {
    if (scannerMode === 'qr') {
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

  // Continuous frame analysis using jsQR loop on requestAnimationFrame
  const scanFrameRef = useRef<() => void>(() => {});

  const scanFrame = useCallback(() => {
    if (!isScanningRef.current || !videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      if (isScanningRef.current) {
        animationFrameRef.current = requestAnimationFrame(() => scanFrameRef.current());
      }
      return;
    }

    // When Mode === 'ai-snapshot', hide the continuous QR auto-scanner loop
    if (scannerMode !== 'qr') {
      return;
    }

    const video = videoRef.current;
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
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
        processQRCode(code.data);
        return;
      }
    }

    if (isScanningRef.current) {
      animationFrameRef.current = requestAnimationFrame(() => scanFrameRef.current());
    }
  }, [processQRCode, scannerMode]);

  useEffect(() => {
    scanFrameRef.current = scanFrame;
  }, [scanFrame]);

  // Request Camera Permission & Start Camera
  const startCamera = async () => {
    setCameraState('loading');
    setScanError(null);
    setDetectedMachine(null);
    setVisionOutput(null);
    setAiPossibleMatches([]);
    setSelectedAiMatch(null);

    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      setCameraState('unavailable');
      return;
    }

    try {
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach(track => track.stop());
        activeStreamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: cameraFacing || "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      activeStreamRef.current = stream;
      setCameraState('active');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
        videoRef.current.play().catch(console.error);
      }
      isScanningRef.current = true;
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    } catch (err: any) {
      console.warn('Camera access error or permission denied:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraState('denied');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraState('unavailable');
      } else {
        setCameraState('error');
      }
      isScanningRef.current = false;
    }
  };

  // Sync video stream when camera state becomes active
  useEffect(() => {
    if (cameraState === 'active' && videoRef.current && activeStreamRef.current) {
      const video = videoRef.current;
      if (video.srcObject !== activeStreamRef.current) {
        video.srcObject = activeStreamRef.current;
      }
      video.onloadedmetadata = () => {
        video.play().catch(console.error);
      };
      video.play().catch(console.error);
    }
  }, [cameraState]);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      isScanningRef.current = false;
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach(track => track.stop());
        activeStreamRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, []);

  // Toggle Front/Back Camera
  const toggleCameraFacing = () => {
    const nextMode = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextMode);
    if (cameraState === 'active') {
      stopCameraStream();
      setTimeout(() => startCamera(), 150);
    }
  };

  // Snapshot AI Machine Scanner: Capture frame & dispatch to Render backend
  const handleCaptureAndScanMachine = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const completedScans = parseInt(localStorage.getItem('guest_scan_count') || '0', 10);
    // Block ONLY when 3 full scans have already been completed
    if (completedScans >= 3) {
      setShowLimitModal(true);
      return;
    }

    // 1. Capture current video frame onto HTML canvas
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let rawDataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // 2. Pause camera stream & start scanning loader
    stopCameraStream();
    setIsAiScanning(true);
    setScanError(null);

    try {
      // 3. Compress/downscale using existing compressImageIfNeeded (<1200px / <1MB)
      const compressedDataUrl = await compressImageIfNeeded(rawDataUrl);
      // Release raw frame reference — only retain compressed version temporarily during analysis
      rawDataUrl = '';
      setDetectedImageUrl(compressedDataUrl);

      // 4. Dispatch directly to Render backend /api/scan-machine via analyzeGymMachineImage
      const { output } = await analyzeGymMachineImage(
        compressedDataUrl, 
        machines, 
        `live-snapshot-${Date.now()}.jpg`
      );

      setVisionOutput(output);

      if (output.result_status === 'MACHINE_IDENTIFIED' || output.result_status === 'confirmed_candidate') {
        // Increment guest scan count ONLY inside the successful response block
        localStorage.setItem('guest_scan_count', (completedScans + 1).toString());
        // Include output.title as a valid candidate source for dynamic Gemini-identified machines
        const candidateName = output.title || output.possible_machine_name || output.machineName || 'Identified Machine';
        let primary = machines.find(m =>
          (output.libraryId && m.id.toLowerCase() === output.libraryId.toLowerCase()) ||
          m.name.toLowerCase() === candidateName.toLowerCase()
        );

        if (!primary) {
          const dynamicCategory = (output.equipment_category !== 'Unknown' ? output.equipment_category : (output.machineCategory !== 'Unknown' ? output.machineCategory : 'Other')) as MachineCategory;
          const dynamicSetup = output.setupGuide && output.setupGuide.length > 0
            ? output.setupGuide
            : (output.setupSteps && output.setupSteps.length > 0 ? output.setupSteps : ['Adjust seating, pins, or console settings to starter position.', 'Maintain proper form and posture.', 'Move with control and smooth breathing.']);

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
            primaryMuscles: output.primaryMuscles && output.primaryMuscles.length > 0 ? output.primaryMuscles : ['Target Muscles'],
            secondaryMuscles: [],
            equipmentType: 'Free Motion / Other',
            qrCodeId: `AI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            matchKeywords: [candidateName.toLowerCase()],
            imageSvg: dynamicSvg,
            description: output.description || `Dynamic equipment identified by ScanFit Vision AI: ${candidateName}`,
            setupInstructions: dynamicSetup,
            movementGuidance: ['Perform repetition under control throughout full range of motion.'],
            commonMistakes: [{ mistake: 'Swinging weight or rush cadence', fix: 'Slow down and control the movement cadence.' }],
            safetyReminders: ['Inspect machine and ensure pins/latches/belts are secure.'],
            tutorialSteps: dynamicSetup.map((step, idx) => ({
              stepNumber: idx + 1,
              title: `Step ${idx + 1}`,
              description: step
            })),
            verificationStatus: 'Community Sample'
          };
        }

        if (primary) {
          const rawFeatures = output.visible_features.length > 0 
            ? output.visible_features 
            : (output.isNewMachine ? ['Dynamically Identified Machine', 'AI Setup Guide Generated'] : (primary.visualCharacteristics || ['Verified Machine Features']));
          const sanitizedFeatures = sanitizeMatchReasons(rawFeatures);

          const matches: { machine: Machine; matchingFeatures: string[]; notes: string }[] = [
            {
              machine: primary,
              matchingFeatures: sanitizedFeatures,
              notes: output.isNewMachine
                ? 'Newly identified equipment outside local catalog — generated by ScanFit Vision AI.'
                : 'Confirmed candidate identified from machine visual structure.'
            }
          ];

          if (output.alternative_matches && output.alternative_matches.length > 0) {
            for (const altName of output.alternative_matches) {
              const alt = machines.find(m => m.name.toLowerCase() === altName.toLowerCase() && m.id !== primary!.id);
              if (alt) {
                matches.push({
                  machine: alt,
                  matchingFeatures: sanitizeMatchReasons(alt.visualCharacteristics || [`${alt.category} Station`]),
                  notes: `Alternative option in ${alt.category} category.`
                });
              }
            }
          }

          playSuccessFeedback();
          setAiPossibleMatches(matches);
          setSelectedAiMatch(primary);
          setDetectedMachine(primary);
          setDetectedScanType('photo');
          setDetectedConfidence(output.confidence || 92);
          // Consume scan credit immediately upon AI recognition, before user confirmation
          onScanCredited?.();
          startCooldown(10);
        } else {
          setScanError('Could not reliably recognize machine. Please try another angle or select manually.');
        }
      } else if (output.result_status === 'VISION_API_RATE_LIMITED') {
        setScanError('AI request quota temporarily reached. Please scan equipment QR code or browse library.');
      } else if (Boolean(output.title || output.machineName)) {
        // Gemini returned a valid title but result_status was not MACHINE_IDENTIFIED — still show success
        const candidateName = output.title || output.machineName || 'Identified Machine';
        const dynamicCategory = (output.equipment_category && output.equipment_category !== 'Unknown' ? output.equipment_category : 'Other') as MachineCategory;
        const dynamicSetup = output.setupGuide && output.setupGuide.length > 0
          ? output.setupGuide
          : (output.setupSteps && output.setupSteps.length > 0 ? output.setupSteps : ['Adjust seating and select starter resistance.', 'Maintain proper form and posture.', 'Move with control and smooth breathing.']);
        const dynamicMachine: Machine = {
          id: `new-machine-${Date.now()}`,
          name: candidateName,
          alternativeNames: [candidateName],
          category: dynamicCategory,
          tagline: output.description || 'AI-discovered gym equipment with dynamic setup instructions',
          difficulty: 'Intermediate',
          primaryMuscles: output.primaryMuscles && output.primaryMuscles.length > 0 ? output.primaryMuscles : ['Target Muscles'],
          secondaryMuscles: [],
          equipmentType: 'Free Motion / Other',
          qrCodeId: `AI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          matchKeywords: [candidateName.toLowerCase()],
          imageSvg: 'chest-press',
          description: output.description || `Dynamically identified by ScanFit Vision AI: ${candidateName}`,
          setupInstructions: dynamicSetup,
          movementGuidance: ['Perform repetitions under full range of motion with control.'],
          commonMistakes: [{ mistake: 'Using momentum', fix: 'Slow down and control the movement.' }],
          safetyReminders: ['Inspect machine and ensure pins/latches are secure.'],
          tutorialSteps: dynamicSetup.map((step, idx) => ({ stepNumber: idx + 1, title: `Step ${idx + 1}`, description: step })),
          verificationStatus: 'Community Sample'
        };
        playSuccessFeedback();
        setAiPossibleMatches([{ machine: dynamicMachine, matchingFeatures: ['Dynamically Identified Machine', 'AI Setup Guide Generated'], notes: 'Identified by ScanFit Vision AI outside local catalog.' }]);
        setSelectedAiMatch(dynamicMachine);
        setDetectedMachine(dynamicMachine);
        setDetectedScanType('photo');
        setDetectedConfidence(output.confidence || 85);
        // Consume scan credit immediately upon AI recognition, before user confirmation
        onScanCredited?.();
        startCooldown(10);
      } else {
        setScanError(output.uncertainty_reason || 'Could not reliably identify this machine. Please center the full frame or scan its QR code.');
      }
    } catch (err: any) {
      console.error('Snapshot AI Machine Scan error:', err);
      setScanError('An error occurred while connecting to AI Vision service. Please try again.');
    } finally {
      setIsAiScanning(false);
    }
  };

  const handleConfirmViewDetails = () => {
    const target = selectedAiMatch || detectedMachine;
    if (!target) return;
    const ephemeralImg = detectedImageUrl;
    // Release ephemeral image from state immediately to preserve memory and privacy
    setDetectedImageUrl(null);
    stopCameraStream();
    onMachineIdentified(
      target, 
      detectedScanType, 
      ephemeralImg || undefined, 
      detectedConfidence ? detectedConfidence / 100 : 1.0
    );
  };

  const handleScanAgain = () => {
    setDetectedMachine(null);
    setSelectedAiMatch(null);
    setScanError(null);
    setVisionOutput(null);
    setAiPossibleMatches([]);
    setDetectedImageUrl(null);
    startCamera();
  };

  return (
    <div className="pb-28 md:pb-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '640px', margin: '0 auto' }}>
      


      {/* 1. Camera Viewport / Scanner View */}
      <div
        className="h-[55vh] max-h-[420px] md:h-[480px] w-full"
        style={{
          position: 'relative',
          backgroundColor: '#07090E',
          borderRadius: '24px',
          overflow: 'hidden',
          border: detectedMachine 
            ? (detectedScanType === 'qr' ? '2px solid #00F59B' : '2px solid #00D2FF')
            : scannerMode === 'qr' 
              ? '1px solid rgba(0, 245, 155, 0.3)' 
              : '1px solid rgba(0, 210, 255, 0.3)',
          boxShadow: detectedMachine 
            ? (detectedScanType === 'qr' ? '0 0 35px rgba(0, 245, 155, 0.25)' : '0 0 35px rgba(0, 210, 255, 0.25)')
            : '0 16px 36px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border 0.3s ease, box-shadow 0.3s ease'
        }}
      >
        {/* Fullscreen AI Scanning Loader overlay */}
        <ScanningLoader isScanning={isAiScanning} />

        {isVerifying ? (
          /* Loading Verification State for QR */
          <div style={{
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem'
          }}>
            <Loader2 size={44} color="#00F59B" style={{ animation: 'spin 1s linear infinite' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#F1F5F9', marginBottom: '0.35rem' }}>
                Verifying Equipment QR Code...
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>
                Searching gym database for code: <strong style={{ color: '#00F59B' }}>{lastScannedCode}</strong>
              </p>
            </div>
          </div>
        ) : detectedMachine ? (
          /* Scanned Machine Success Preview State (Both QR & AI Snapshot) */
          <div style={{
            padding: '1.75rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            width: '100%',
            animation: 'fadeIn 0.25s ease-out'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: detectedScanType === 'qr' ? 'rgba(0, 245, 155, 0.15)' : 'rgba(0, 210, 255, 0.15)',
              border: detectedScanType === 'qr' ? '2px solid #00F59B' : '2px solid #00D2FF',
              color: detectedScanType === 'qr' ? '#00F59B' : '#00D2FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: detectedScanType === 'qr' ? '0 0 25px rgba(0, 245, 155, 0.35)' : '0 0 25px rgba(0, 210, 255, 0.35)'
            }}>
              <CheckCircle size={34} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <span className={detectedScanType === 'qr' ? 'badge badge-emerald' : 'badge badge-blue'} style={{ fontSize: '0.72rem' }}>
                  {detectedScanType === 'qr' 
                    ? `Confirmed QR Match • ${detectedMachine.qrCodeId}` 
                    : `ScanFit Match • ${detectedConfidence || 92}% Confidence`}
                </span>
                <span className="badge badge-muted" style={{ fontSize: '0.72rem' }}>
                  {detectedMachine.category} Equipment
                </span>
              </div>

              <h3 style={{ fontSize: '1.4rem', color: '#F1F5F9', margin: '4px 0 2px 0', fontWeight: 700 }}>
                {detectedMachine.name}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>
                {detectedMachine.tagline || `${detectedMachine.equipmentType} • ${detectedMachine.difficulty} Level`}
              </p>
            </div>

            {/* Target Muscles Information */}
            {detectedMachine.primaryMuscles && detectedMachine.primaryMuscles.length > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '10px',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                color: '#CBD5E1'
              }}>
                <Dumbbell size={14} color="#00D2FF" />
                <span><strong>Target Muscles:</strong> {detectedMachine.primaryMuscles.join(', ')}</span>
              </div>
            )}

            {/* Quick Setup Guidance */}
            {(visionOutput?.setupSteps?.length || detectedMachine.setupInstructions?.length) && (
              <div style={{
                background: 'rgba(10, 15, 25, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                width: '100%',
                maxWidth: '440px',
                textAlign: 'left'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00F59B', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                  <Zap size={13} /> Quick Setup Steps:
                </span>
                <ol style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.75rem', color: '#CBD5E1', lineHeight: 1.45 }}>
                  {(visionOutput?.setupSteps || detectedMachine.setupInstructions || []).slice(0, 3).map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}


            {/* Alternative candidates selection if from AI snapshot */}
            {aiPossibleMatches.length > 1 && (
              <div style={{ width: '100%', maxWidth: '420px', textAlign: 'left' }}>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                  Alternative matches detected:
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {aiPossibleMatches.map(match => (
                    <button
                      key={match.machine.id}
                      type="button"
                      onClick={() => {
                        setSelectedAiMatch(match.machine);
                        setDetectedMachine(match.machine);
                      }}
                      style={{
                        background: detectedMachine.id === match.machine.id ? 'rgba(0, 210, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: detectedMachine.id === match.machine.id ? '1px solid #00D2FF' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: detectedMachine.id === match.machine.id ? '#00D2FF' : '#94A3B8',
                        borderRadius: '8px',
                        padding: '4px 8px',
                        fontSize: '0.72rem',
                        cursor: 'pointer'
                      }}
                    >
                      {match.machine.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action CTAs */}
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '420px' }}>
              <button
                type="button"
                onClick={handleScanAgain}
                className="btn-secondary"
                style={{ flex: 1, fontSize: '0.85rem' }}
              >
                <RotateCcw size={15} /> Scan Another
              </button>
              <button
                type="button"
                onClick={handleConfirmViewDetails}
                className="btn-primary"
                style={{
                  flex: 1.4,
                  fontSize: '0.88rem',
                  background: detectedScanType === 'photo' 
                    ? 'linear-gradient(135deg, #00D2FF 0%, #0077FE 100%)'
                    : undefined
                }}
              >
                View Machine Guide <ArrowRight size={15} />
              </button>
            </div>
          </div>
        ) : cameraState === 'active' ? (
          /* Live Camera Stream Active */
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />

            {/* Dynamic Viewfinder Reticle based on Mode */}
            {scannerMode === 'qr' ? (
              /* QR Code Dashed Green Reticle with Laser Sweep */
              <div style={{
                position: 'absolute',
                width: '210px',
                height: '210px',
                border: '2px dashed rgba(0, 245, 155, 0.65)',
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
              /* AI Machine Snapshot Wide Framing Brackets */
              <div style={{
                position: 'absolute',
                width: '84%',
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

            {/* Top Bar Camera Stream Controls */}
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              right: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 20
            }}>
              <div style={{
                background: 'rgba(10, 14, 22, 0.88)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: '999px',
                border: scannerMode === 'qr' 
                  ? '1px solid rgba(0, 245, 155, 0.35)' 
                  : '1px solid rgba(0, 210, 255, 0.35)',
                fontSize: '0.72rem',
                color: scannerMode === 'qr' ? '#00F59B' : '#00D2FF',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  background: scannerMode === 'qr' ? '#00F59B' : '#00D2FF', 
                  animation: 'pulse 1.5s infinite' 
                }} />
                {scannerMode === 'qr' ? 'Real-Time QR Scanner' : 'Live AI Machine Frame'}
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  style={{
                    background: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#F1F5F9',
                    cursor: 'pointer'
                  }}
                  title="Switch Camera (Front/Back)"
                >
                  <RefreshCw size={15} />
                </button>

                <button
                  type="button"
                  onClick={stopCameraStream}
                  style={{
                    background: 'rgba(255, 71, 87, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 71, 87, 0.4)',
                    borderRadius: '999px',
                    padding: '4px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                  title="Stop Camera Stream"
                >
                  <Square size={13} fill="#FFFFFF" /> Stop
                </button>
              </div>
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
              zIndex: 20
            }}>
              {/* When Mode === 'ai-snapshot', display prominent glowing shutter button */}
              {scannerMode === 'ai-snapshot' && (
                <button
                  type="button"
                  onClick={handleCaptureAndScanMachine}
                  disabled={isAiScanning || cooldownSeconds > 0}
                  style={{
                    background: (isAiScanning || cooldownSeconds > 0)
                      ? 'rgba(30, 40, 60, 0.85)'
                      : 'linear-gradient(135deg, #00D2FF 0%, #0077FE 100%)',
                    color: (isAiScanning || cooldownSeconds > 0) ? '#64748B' : '#FFFFFF',
                    border: (isAiScanning || cooldownSeconds > 0)
                      ? '1.5px solid rgba(100,116,139,0.3)'
                      : '1.5px solid rgba(255, 255, 255, 0.35)',
                    borderRadius: '999px',
                    padding: '0.75rem 1.85rem',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: (isAiScanning || cooldownSeconds > 0)
                      ? 'none'
                      : '0 8px 25px rgba(0, 210, 255, 0.45)',
                    cursor: (isAiScanning || cooldownSeconds > 0) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <Camera size={18} />
                  {cooldownSeconds > 0
                    ? <span>⏳ Ready in {cooldownSeconds}s…</span>
                    : <span>📸 Snap Photo to Scan</span>}
                  <Sparkles size={15} />
                </button>
              )}

              {/* Bottom dynamic instruction badge */}
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
          </>
        ) : (
          /* Dynamic Idle Card Content (QR Mode vs AI Mode) */
          <div
            className="p-3 sm:p-5 md:p-8"
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem',
              maxWidth: '460px',
              animation: 'fadeIn 0.25s ease-out'
            }}
          >
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '22px',
              background: cameraState === 'denied' || cameraState === 'unavailable' || cameraState === 'error'
                ? 'rgba(255, 71, 87, 0.12)'
                : scannerMode === 'qr' ? 'rgba(0, 245, 155, 0.12)' : 'rgba(0, 210, 255, 0.12)',
              border: cameraState === 'denied' || cameraState === 'unavailable' || cameraState === 'error'
                ? '1px solid rgba(255, 71, 87, 0.3)'
                : scannerMode === 'qr' ? '1px solid rgba(0, 245, 155, 0.35)' : '1px solid rgba(0, 210, 255, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: cameraState === 'denied' || cameraState === 'unavailable' || cameraState === 'error' 
                ? '#FF4757' 
                : getModeContent().accentColor,
              boxShadow: scannerMode === 'qr' ? '0 0 25px rgba(0, 245, 155, 0.15)' : '0 0 25px rgba(0, 210, 255, 0.15)'
            }}>
              {cameraState === 'denied' || cameraState === 'unavailable' || cameraState === 'error' ? (
                <CameraOff size={34} />
              ) : (
                getModeContent().icon
              )}
            </div>

            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '0.45rem' }}>
                <span className={scannerMode === 'qr' ? 'badge badge-emerald' : 'badge badge-blue'} style={{ fontSize: '0.72rem' }}>
                  {getModeContent().badgeText}
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#F1F5F9', marginBottom: '0.45rem', fontWeight: 700 }}>
                {cameraState === 'denied' 
                  ? 'Camera Access Denied' 
                  : cameraState === 'unavailable'
                  ? 'Camera Unavailable'
                  : cameraState === 'error'
                  ? 'Camera Error'
                  : cameraState === 'stopped'
                  ? `${getModeContent().title} (Paused)`
                  : getModeContent().title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5, margin: 0, maxWidth: '380px' }}>
                {cameraState === 'denied'
                  ? 'Camera access is blocked. You can allow camera access in browser permissions or upload an equipment photo instead.'
                  : cameraState === 'unavailable'
                  ? 'No working camera device was detected. You can upload a photo or enter the badge code manually below.'
                  : cameraState === 'error'
                  ? 'Encountered an unexpected error starting the camera stream. Please try again or upload a photo.'
                  : cameraState === 'stopped'
                  ? 'Camera scanner is currently stopped. Click below to resume scanning.'
                  : getModeContent().subtitle}
              </p>
            </div>

            <div className="mb-20 md:mb-0" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%', maxWidth: '320px' }}>
              <button
                type="button"
                onClick={startCamera}
                disabled={cameraState === 'loading'}
                style={{
                  background: getModeContent().buttonGradient,
                  color: getModeContent().buttonTextColor,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '14px',
                  border: 'none',
                  boxShadow: getModeContent().boxShadow,
                  cursor: cameraState === 'loading' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
              >
                {cameraState === 'loading' ? (
                  <>Starting Camera...</>
                ) : cameraState === 'denied' || cameraState === 'error' ? (
                  <>Try Camera Again</>
                ) : cameraState === 'stopped' ? (
                  <>Resume Camera</>
                ) : (
                  <>{getModeContent().mainButton}</>
                )}
              </button>



              {cameraState === 'denied' && (
                <button
                  type="button"
                  onClick={() => setShowCameraHelpModal(true)}
                  className="btn-ghost"
                  style={{ fontSize: '0.78rem', color: '#00D2FF' }}
                >
                  <HelpCircle size={14} /> View Camera Help
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Error Message Box */}
      {scanError && (
        <div style={{
          background: 'rgba(255, 71, 87, 0.1)',
          border: '1px solid rgba(255, 71, 87, 0.3)',
          borderRadius: '16px',
          padding: '1rem 1.15rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <AlertCircle size={20} color="#FF4757" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FF4757' }}>
              Equipment Identification Notice
            </div>
            <p style={{ fontSize: '0.8rem', color: '#CBD5E1', margin: '3px 0 0.6rem 0', lineHeight: 1.4 }}>
              {scanError}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleScanAgain}
                className="btn-primary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
              >
                <RotateCcw size={13} /> Try Camera Again
              </button>



              <button
                type="button"
                onClick={onSwitchToManual}
                className="btn-ghost"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: '#00D2FF' }}
              >
                <Search size={13} /> Browse Directory
              </button>
            </div>
          </div>
        </div>
      )}



      {/* 4. Camera Help Modal Dialog */}
      {showCameraHelpModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 8, 14, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '1.5rem', position: 'relative' }}>
            <button
              onClick={() => setShowCameraHelpModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.1rem', color: '#F1F5F9', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={20} color="#00D2FF" /> How to Enable Camera Access
            </h3>

            <div style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p>If your browser blocked camera access, follow these quick steps:</p>
              <ol style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>Look at the left side of your browser URL address bar for the lock or camera icon.</li>
                <li>Click the icon and find <strong>Camera</strong> permissions.</li>
                <li>Change permission setting from <em>Block</em> to <em>Allow</em>.</li>
                <li>Refresh the page and click <strong>Try Camera Again</strong>.</li>
              </ol>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem' }}>
                You can also always use the <strong>Upload Machine Photo</strong> option without camera access.
              </p>
            </div>

            <button
              onClick={() => setShowCameraHelpModal(false)}
              className="btn-primary"
              style={{ width: '100%', marginTop: '1.25rem' }}
            >
              Got it
            </button>
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
