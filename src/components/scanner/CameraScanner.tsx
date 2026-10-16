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
  Info, 
  CheckCircle, 
  RotateCcw,
  Upload,
  Loader2,
  HelpCircle,
  X
} from 'lucide-react';
import { MachineSvgIllustration } from '../machines/MachineSvgIllustrations';

interface CameraScannerProps {
  onMachineIdentified: (machine: Machine, scanType: 'qr') => void;
  onSwitchToManual: () => void;
  onSwitchToPhoto?: () => void;
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
  onSwitchToPhoto
}) => {
  const { machines, getMachineByQRCode } = useGym();
  
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
  const [detectedMachine, setDetectedMachine] = useState<Machine | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showCameraHelpModal, setShowCameraHelpModal] = useState(false);

  // Stop camera stream helper safely
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

  // Process QR Code against exact database mapping
  const processQRCode = useCallback((rawCode: string) => {
    if (!rawCode || isVerifying) return;
    const cleanCode = rawCode.trim().toUpperCase();
    
    setScanError(null);
    setIsVerifying(true);
    setLastScannedCode(cleanCode);

    // Exact database lookup
    setTimeout(() => {
      setIsVerifying(false);
      const machine = getMachineByQRCode(cleanCode);

      if (machine) {
        setDetectedMachine(machine);
        stopCameraStream();
      } else {
        setDetectedMachine(null);
        setScanError(`We couldn't find this equipment code ("${cleanCode}") in our database. Check the code or ask gym staff for help.`);
      }
    }, 250);
  }, [getMachineByQRCode, isVerifying, stopCameraStream]);

  // Continuous frame analysis using jsQR
  const scanFrameRef = useRef<() => void>(() => {});

  const scanFrame = useCallback(() => {
    if (!isScanningRef.current || !videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      if (isScanningRef.current) {
        animationFrameRef.current = requestAnimationFrame(() => scanFrameRef.current());
      }
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
  }, [processQRCode]);

  useEffect(() => {
    scanFrameRef.current = scanFrame;
  }, [scanFrame]);

  // Request Camera Permission & Start Camera
  const startCamera = async () => {
    setCameraState('loading');
    setScanError(null);
    setDetectedMachine(null);

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

  // Stop camera when unmounting or switching views
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

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    processQRCode(manualCodeInput.trim());
  };

  const handleConfirmViewDetails = () => {
    if (!detectedMachine) return;
    stopCameraStream();
    onMachineIdentified(detectedMachine, 'qr');
  };

  const handleScanAgain = () => {
    setDetectedMachine(null);
    setScanError(null);
    setManualCodeInput('');
    startCamera();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '640px', margin: '0 auto' }}>
      
      {/* 1. Camera Viewport / Scanner View */}
      <div style={{
        position: 'relative',
        minHeight: '340px',
        backgroundColor: '#07090E',
        borderRadius: '24px',
        overflow: 'hidden',
        border: detectedMachine ? '2px solid #00F59B' : '1px solid rgba(0, 245, 155, 0.25)',
        boxShadow: detectedMachine ? '0 0 30px rgba(0, 245, 155, 0.25)' : '0 16px 36px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {isVerifying ? (
          /* Loading Verification State */
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
                Verifying Equipment Code...
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>
                Searching machine database for code: <strong style={{ color: '#00F59B' }}>{lastScannedCode}</strong>
              </p>
            </div>
          </div>
        ) : detectedMachine ? (
          /* Scanned Machine Success Preview State */
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
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(0, 245, 155, 0.15)',
              border: '2px solid #00F59B',
              color: '#00F59B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 245, 155, 0.35)'
            }}>
              <CheckCircle size={32} />
            </div>

            <div>
              <span className="badge badge-emerald" style={{ fontSize: '0.7rem', marginBottom: '0.4rem' }}>
                Confirmed QR Database Match • {detectedMachine.qrCodeId}
              </span>
              <h3 style={{ fontSize: '1.35rem', color: '#F1F5F9', margin: '4px 0 2px 0' }}>
                {detectedMachine.name}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>
                {detectedMachine.category} Equipment • {detectedMachine.difficulty} Level
              </p>
            </div>

            {/* Illustration thumbnail */}
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

            <div style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '380px' }}>
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
                style={{ flex: 1.2, fontSize: '0.85rem' }}
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

            {/* Viewfinder Overlay with Laser & Target Frame */}
            <div style={{
              position: 'absolute',
              width: '210px',
              height: '210px',
              border: '2px dashed rgba(0, 245, 155, 0.6)',
              borderRadius: '16px',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              <div className="viewfinder-corner corner-tl" />
              <div className="viewfinder-corner corner-tr" />
              <div className="viewfinder-corner corner-bl" />
              <div className="viewfinder-corner corner-br" />
              <div className="scanner-laser" />
            </div>

            {/* Top Bar Camera Controls */}
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
                background: 'rgba(10, 14, 22, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(0, 245, 155, 0.3)',
                fontSize: '0.72rem',
                color: '#00F59B',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00F59B', animation: 'pulse 1.5s infinite' }} />
                Camera Scanner Active
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

            {/* Bottom instruction label */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              background: 'rgba(10, 14, 22, 0.88)',
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.75rem',
              color: '#CBD5E1',
              textAlign: 'center',
              maxWidth: '90%'
            }}>
              Center the equipment QR badge inside the frame
            </div>
          </>
        ) : (
          /* Precise Camera States Handling (Unrequested, Denied, Unavailable, Stopped, Error) */
          <div style={{
            padding: '2rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            maxWidth: '460px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: cameraState === 'denied' || cameraState === 'unavailable' || cameraState === 'error' ? 'rgba(255, 71, 87, 0.1)' : 'rgba(0, 245, 155, 0.1)',
              border: cameraState === 'denied' || cameraState === 'unavailable' || cameraState === 'error' ? '1px solid rgba(255, 71, 87, 0.3)' : '1px solid rgba(0, 245, 155, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: cameraState === 'denied' || cameraState === 'unavailable' || cameraState === 'error' ? '#FF4757' : '#00F59B'
            }}>
              {cameraState === 'denied' || cameraState === 'unavailable' || cameraState === 'error' ? <CameraOff size={32} /> : <Camera size={32} />}
            </div>

            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#F1F5F9', marginBottom: '0.35rem' }}>
                {cameraState === 'denied' 
                  ? 'Camera Access Denied' 
                  : cameraState === 'unavailable'
                  ? 'Camera Unavailable'
                  : cameraState === 'error'
                  ? 'Camera Error'
                  : cameraState === 'stopped'
                  ? 'Camera Paused'
                  : 'Scan Equipment QR Code'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.5, margin: 0 }}>
                {cameraState === 'denied'
                  ? 'Camera access is unavailable. You can allow camera access in your browser settings or upload a machine photo instead.'
                  : cameraState === 'unavailable'
                  ? 'No working camera device was detected on your device. You can upload a photo or enter the badge code manually below.'
                  : cameraState === 'error'
                  ? 'Encountered an unexpected error starting the camera stream. Please try again or upload a photo.'
                  : cameraState === 'stopped'
                  ? 'Camera scanner is currently stopped. Click below to resume scanning.'
                  : 'Point your device camera at a registered equipment QR badge for an instant lookup.'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%', maxWidth: '300px' }}>
              <button
                type="button"
                onClick={startCamera}
                disabled={cameraState === 'loading'}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                {cameraState === 'loading' ? (
                  <>Starting Camera...</>
                ) : (
                  <>
                    <Camera size={18} />
                    {cameraState === 'denied' || cameraState === 'error' ? 'Try Camera Again' : cameraState === 'stopped' ? 'Resume Camera' : 'Start QR Scanner'}
                  </>
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
                  <Upload size={16} /> Upload Machine Photo
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

      {/* 2. Error Message Box for Unregistered QR Codes */}
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
              Equipment Code Unrecognized
            </div>
            <p style={{ fontSize: '0.8rem', color: '#CBD5E1', margin: '3px 0 0.6rem 0', lineHeight: 1.4 }}>
              {scanError}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {onSwitchToPhoto && (
                <button
                  type="button"
                  onClick={onSwitchToPhoto}
                  className="btn-primary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #00D2FF 0%, #0088FF 100%)' }}
                >
                  <Upload size={13} /> Try Photo Upload Instead
                </button>
              )}
              <button
                type="button"
                onClick={handleScanAgain}
                className="btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
              >
                <RotateCcw size={13} /> Try Another Code
              </button>
              <button
                type="button"
                onClick={onSwitchToManual}
                className="btn-ghost"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: '#00F59B' }}
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
              Have a machine code?
            </span>
            <div style={{ fontSize: '0.73rem', color: '#94A3B8' }}>
              Enter the code printed on the equipment label.
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

        {/* Sample Badges for Demo Mode Testing */}
        {showTestQrDrawer && (
          <div style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '0.6rem' }}>
              💡 Demo Mode: Click any registered badge code below to verify database lookup:
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
              
              {/* Intentional invalid test badge */}
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
              <p>If your browser previously blocked camera access, follow these quick steps:</p>
              <ol style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>Look at the left side of your browser URL address bar for the lock or camera icon.</li>
                <li>Click the icon and find <strong>Camera</strong> permissions.</li>
                <li>Change permission setting from <em>Block</em> to <em>Allow</em>.</li>
                <li>Refresh the page and click <strong>Try Camera Again</strong>.</li>
              </ol>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem' }}>
                Alternatively, you can always use the <strong>Upload Machine Photo</strong> option without camera access.
              </p>
            </div>

            <button
              onClick={() => setShowCameraHelpModal(false)}
              className="btn-primary"
              style={{ width: '100%', marginTop: '1.25rem', fontSize: '0.85rem' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

