import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { useGym } from '../../context/GymContext';
import { Machine } from '../../types';
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
  Upload,
  Loader2,
  HelpCircle,
  X,
  Dumbbell,
  Zap
} from 'lucide-react';
import { MachineSvgIllustration } from '../machines/MachineSvgIllustrations';
import ScanningLoader from './ScanningLoader';
import { compressImageIfNeeded } from './PhotoAIAnalyzer';
import { analyzeGymMachineImage, StructuredVisionOutput } from '../../services/visionService';
import { playSuccessFeedback, extractGymMachineCode } from '../../utils/scannerFeedback';

export interface CameraScannerProps {
  onMachineIdentified: (machine: Machine, scanType: 'qr' | 'photo', imageUrl?: string, confidence?: number) => void;
  onSwitchToManual: () => void;
  onSwitchToPhoto?: () => void;
  initialMode?: 'qr' | 'ai-snapshot';
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
  initialMode = 'qr'
}) => {
  const { machines, getMachineByQRCode } = useGym();
  
  // Scanner Viewfinder Mode: QR Code Badge vs Snapshot AI Machine
  const [scannerMode, setScannerMode] = useState<'qr' | 'ai-snapshot'>(initialMode);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const activeStreamRef = useRef<MediaStream | null>(null);
  
  const [cameraState, setCameraState] = useState<CameraPermissionState>('unrequested');
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [showTestQrDrawer, setShowTestQrDrawer] = useState(false);
  const [showCameraHelpModal, setShowCameraHelpModal] = useState(false);

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

    // 1. Capture current video frame onto HTML canvas
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // 2. Pause camera stream & start scanning loader
    stopCameraStream();
    setIsAiScanning(true);
    setScanError(null);

    try {
      // 3. Compress/downscale using existing compressImageIfNeeded (<1200px / <1MB)
      const compressedDataUrl = await compressImageIfNeeded(rawDataUrl);
      setDetectedImageUrl(compressedDataUrl);

      // 4. Dispatch directly to Render backend /api/scan-machine via analyzeGymMachineImage
      const { output } = await analyzeGymMachineImage(
        compressedDataUrl, 
        machines, 
        `live-snapshot-${Date.now()}.jpg`
      );

      setVisionOutput(output);

      if (output.result_status === 'MACHINE_IDENTIFIED' || output.result_status === 'confirmed_candidate') {
        const primary = machines.find(m => 
          m.name.toLowerCase() === output.possible_machine_name?.toLowerCase() ||
          m.name.toLowerCase() === output.machineName?.toLowerCase()
        );

        if (primary) {
          playSuccessFeedback();
          const matches: { machine: Machine; matchingFeatures: string[]; notes: string }[] = [
            {
              machine: primary,
              matchingFeatures: output.visible_features.length > 0 
                ? output.visible_features 
                : (primary.visualCharacteristics || ['Verified Machine Features']),
              notes: 'Confirmed candidate identified from machine visual structure.'
            }
          ];

          if (output.alternative_matches && output.alternative_matches.length > 0) {
            for (const altName of output.alternative_matches) {
              const alt = machines.find(m => m.name.toLowerCase() === altName.toLowerCase() && m.id !== primary.id);
              if (alt) {
                matches.push({
                  machine: alt,
                  matchingFeatures: alt.visualCharacteristics || [`${alt.category} Station`],
                  notes: `Alternative option in ${alt.category} category.`
                });
              }
            }
          }

          setAiPossibleMatches(matches);
          setSelectedAiMatch(primary);
          setDetectedMachine(primary);
          setDetectedScanType('photo');
          setDetectedConfidence(output.confidence || 92);
        } else {
          setScanError('Machine detected, but not found in current gym catalog. You can select it manually.');
        }
      } else if (output.result_status === 'VISION_API_RATE_LIMITED') {
        setScanError('AI request quota temporarily reached. Please scan equipment QR code or browse library.');
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

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    processQRCode(manualCodeInput.trim());
  };

  const handleConfirmViewDetails = () => {
    const target = selectedAiMatch || detectedMachine;
    if (!target) return;
    stopCameraStream();
    onMachineIdentified(
      target, 
      detectedScanType, 
      detectedImageUrl || undefined, 
      detectedConfidence ? detectedConfidence / 100 : 1.0
    );
  };

  const handleScanAgain = () => {
    setDetectedMachine(null);
    setSelectedAiMatch(null);
    setScanError(null);
    setManualCodeInput('');
    setVisionOutput(null);
    setAiPossibleMatches([]);
    setDetectedImageUrl(null);
    startCamera();
  };

  return (
    <div className="pb-28 md:pb-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '640px', margin: '0 auto' }}>
      
      {/* 0. Top Viewfinder Mode Switcher Toggle Pill */}
      <div
        className="flex flex-row w-full gap-1.5 p-1 bg-slate-900/80 rounded-xl max-w-xl mx-auto border border-white/10"
      >
        <button
          type="button"
          onClick={() => {
            setScannerMode('qr');
            setScanError(null);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] sm:text-xs cursor-pointer transition-all rounded-lg truncate whitespace-nowrap"
          style={{
            background: scannerMode === 'qr'
              ? 'linear-gradient(135deg, rgba(0, 245, 155, 0.22) 0%, rgba(13, 22, 28, 0.95) 100%)'
              : 'transparent',
            border: scannerMode === 'qr' ? '1.5px solid #00F59B' : '1px solid transparent',
            color: scannerMode === 'qr' ? '#00F59B' : '#94A3B8',
            fontWeight: 700,
            boxShadow: scannerMode === 'qr' ? '0 4px 14px rgba(0, 245, 155, 0.18)' : 'none'
          }}
        >
          <QrCode size={14} className="shrink-0" />
          <span className="truncate whitespace-nowrap">Scan QR Badge</span>
          {scannerMode === 'qr' && (
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00F59B' }} className="shrink-0" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setScannerMode('ai-snapshot');
            setScanError(null);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] sm:text-xs cursor-pointer transition-all rounded-lg truncate whitespace-nowrap"
          style={{
            background: scannerMode === 'ai-snapshot'
              ? 'linear-gradient(135deg, rgba(0, 210, 255, 0.22) 0%, rgba(12, 20, 34, 0.95) 100%)'
              : 'transparent',
            border: scannerMode === 'ai-snapshot' ? '1.5px solid #00D2FF' : '1px solid transparent',
            color: scannerMode === 'ai-snapshot' ? '#00D2FF' : '#94A3B8',
            fontWeight: 700,
            boxShadow: scannerMode === 'ai-snapshot' ? '0 4px 14px rgba(0, 210, 255, 0.18)' : 'none'
          }}
        >
          <Sparkles size={14} className="shrink-0" />
          <span className="truncate whitespace-nowrap">Snap Machine Photo (AI)</span>
          {scannerMode === 'ai-snapshot' && (
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00D2FF' }} className="shrink-0" />
          )}
        </button>
      </div>

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
                    : `Gemini AI Match • ${detectedConfidence || 92}% Confidence`}
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

            {/* SVG Illustration thumbnail */}
            <div style={{
              width: '160px',
              height: '90px',
              background: '#0D111A',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '6px'
            }}>
              <MachineSvgIllustration type={detectedMachine.imageSvg} />
            </div>

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

              {/* Photo Upload alternative fallback */}
              {onSwitchToPhoto && (
                <button
                  type="button"
                  onClick={() => {
                    stopCameraStream();
                    onSwitchToPhoto();
                  }}
                  className="btn-secondary"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  <Upload size={16} /> Upload Machine Photo File
                </button>
              )}

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

              {onSwitchToPhoto && (
                <button
                  type="button"
                  onClick={onSwitchToPhoto}
                  className="btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                >
                  <Upload size={13} /> Try Photo Upload
                </button>
              )}

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

      {/* 3. Manual Machine Code Entry Form & Sample Badges Drawer */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F1F5F9' }}>
              Have an equipment badge code?
            </span>
            <div style={{ fontSize: '0.73rem', color: '#94A3B8' }}>
              Enter the label printed on the equipment badge.
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowTestQrDrawer(!showTestQrDrawer)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#00D2FF',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <Sparkles size={13} />
            {showTestQrDrawer ? 'Hide Sample Badges' : 'Show Sample Badges (Demo Mode)'}
          </button>
        </div>

        <form onSubmit={handleManualCodeSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="e.g. GYM-CHEST-01, GYM-BACK-01, GYM-LEG-04"
            value={manualCodeInput}
            onChange={(e) => setManualCodeInput(e.target.value)}
            className="input-modern"
            style={{ flex: 1, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
          />
          <button 
            type="submit" 
            disabled={!manualCodeInput.trim() || isVerifying}
            className="btn-primary" 
            style={{ padding: '0.75rem 1.25rem', whiteSpace: 'nowrap' }}
          >
            {isVerifying ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        {/* Sample Badges for Demo Testing */}
        {showTestQrDrawer && (
          <div style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '0.6rem' }}>
              💡 Demo Mode: Click any registered badge code below to verify lookup:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {machines.slice(0, 8).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => processQRCode(m.qrCodeId)}
                  style={{
                    background: 'rgba(0, 245, 155, 0.08)',
                    border: '1px solid rgba(0, 245, 155, 0.25)',
                    color: '#00F59B',
                    borderRadius: '8px',
                    padding: '4px 9px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <QrCode size={12} />
                  {m.qrCodeId} ({m.name.split(' ')[0]})
                </button>
              ))}
              
              <button
                type="button"
                onClick={() => processQRCode('INVALID-CODE-999')}
                style={{
                  background: 'rgba(255, 71, 87, 0.08)',
                  border: '1px solid rgba(255, 71, 87, 0.25)',
                  color: '#FF6B81',
                  borderRadius: '8px',
                  padding: '4px 9px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ⚠️ Test Unknown Code
              </button>
            </div>
          </div>
        )}
      </div>

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

    </div>
  );
};
