import React, { useState, useEffect } from 'react';
import { useGym } from '../context/GymContext';
import { Machine } from '../types';
import { QrCode, Sparkles, Upload, Shield } from 'lucide-react';
import { CameraScanner } from '../components/scanner/CameraScanner';
import { PhotoAIAnalyzer } from '../components/scanner/PhotoAIAnalyzer';

export type ScanMode = 'qr' | 'ai_camera' | 'upload';

interface ScanHubPageProps {
  initialMode?: 'qr' | 'photo' | 'ai_camera' | 'upload';
  onMachineSelected: (machine: Machine, source?: 'qr' | 'photo') => void;
  onNavigate: (tab: string) => void;
}

const TABS: {
  id: ScanMode;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  accent: string;
  glow: string;
  gradientActive: string;
  borderActive: string;
}[] = [
  {
    id: 'qr',
    label: 'Scan QR Badge',
    sublabel: 'Instant auto-detect',
    icon: <QrCode size={18} />,
    accent: '#00F59B',
    glow: 'rgba(0, 245, 155, 0.22)',
    gradientActive: 'linear-gradient(135deg, rgba(0, 245, 155, 0.18) 0%, rgba(4, 12, 20, 0.96) 100%)',
    borderActive: '#00F59B',
  },
  {
    id: 'ai_camera',
    label: 'Snap Machine Photo',
    sublabel: 'Gemini AI vision',
    icon: <Sparkles size={18} />,
    accent: '#00D2FF',
    glow: 'rgba(0, 210, 255, 0.22)',
    gradientActive: 'linear-gradient(135deg, rgba(0, 210, 255, 0.18) 0%, rgba(4, 10, 26, 0.96) 100%)',
    borderActive: '#00D2FF',
  },
  {
    id: 'upload',
    label: 'Upload Photo',
    sublabel: 'From gallery',
    icon: <Upload size={18} />,
    accent: '#38BDF8',
    glow: 'rgba(56, 189, 248, 0.22)',
    gradientActive: 'linear-gradient(135deg, rgba(56, 189, 248, 0.18) 0%, rgba(4, 10, 26, 0.96) 100%)',
    borderActive: '#38BDF8',
  },
];

export const ScanHubPage: React.FC<ScanHubPageProps> = ({
  initialMode = 'qr',
  onMachineSelected,
  onNavigate
}) => {
  const resolveInitialMode = (mode?: string): ScanMode => {
    if (mode === 'upload') return 'upload';
    if (mode === 'photo' || mode === 'ai_camera') return 'ai_camera';
    return 'qr';
  };

  const [activeMode, setActiveMode] = useState<ScanMode>(() => resolveInitialMode(initialMode));

  useEffect(() => {
    if (initialMode) {
      setActiveMode(resolveInitialMode(initialMode));
    }
  }, [initialMode]);

  const { recordMachineScan } = useGym();

  const handleScanSuccess = (
    machine: Machine,
    scanType: 'qr' | 'photo',
    imageUrl?: string,
    confidence?: number
  ) => {
    recordMachineScan(machine.id, scanType, imageUrl, confidence);
    onMachineSelected(machine, scanType);
  };

  return (
    <div className="pb-28 md:pb-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '800px', margin: '0 auto' }}>

      {/* 1. Page Header */}
      <div style={{ textAlign: 'center', maxWidth: '580px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem' }}>
          <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
            <Sparkles size={11} /> Equipment Identification Hub
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.2rem)', color: '#F1F5F9', marginBottom: '0.35rem', lineHeight: 1.2 }}>
          Identify Gym Machine
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#94A3B8', lineHeight: 1.45, margin: 0 }}>
          Scan a QR badge, snap a photo, or upload an image — instant machine setup guides.
        </p>
      </div>

      {/* 2. Prominent Segmented Mode Selector */}
      <div
        role="tablist"
        aria-label="Scanner mode"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          padding: '6px',
          background: 'rgba(7, 10, 18, 0.88)',
          backdropFilter: 'blur(16px)',
          borderRadius: '18px',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.38)',
          maxWidth: '680px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              id={`scan-tab-${tab.id}`}
              onClick={() => setActiveMode(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '13px 8px 11px',
                borderRadius: '13px',
                border: isActive ? `1.5px solid ${tab.borderActive}` : '1.5px solid transparent',
                background: isActive ? tab.gradientActive : 'transparent',
                boxShadow: isActive
                  ? `0 0 22px ${tab.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`
                  : 'none',
                cursor: 'pointer',
                transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: 'relative',
                outline: 'none',
              }}
            >
              {/* Active glow pulse dot */}
              {isActive && (
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '9px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: tab.accent,
                  boxShadow: `0 0 8px ${tab.accent}`,
                }} />
              )}

              {/* Icon */}
              <span style={{
                color: isActive ? tab.accent : '#64748B',
                transition: 'color 0.18s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {tab.icon}
              </span>

              {/* Primary label */}
              <span style={{
                fontSize: '0.73rem',
                fontWeight: 700,
                color: isActive ? tab.accent : '#94A3B8',
                letterSpacing: '0.01em',
                lineHeight: 1.2,
                textAlign: 'center',
                transition: 'color 0.18s ease',
                whiteSpace: 'nowrap',
              }}>
                {tab.label}
              </span>

              {/* Sub-label */}
              <span style={{
                fontSize: '0.62rem',
                color: isActive ? tab.accent + 'AA' : '#475569',
                fontWeight: 500,
                lineHeight: 1,
                textAlign: 'center',
                transition: 'color 0.18s ease',
                whiteSpace: 'nowrap',
              }}>
                {tab.sublabel}
              </span>

              {/* Active bottom glow bar */}
              {isActive && (
                <span style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '38%',
                  height: '2px',
                  borderRadius: '2px 2px 0 0',
                  background: tab.accent,
                  boxShadow: `0 -3px 10px ${tab.glow}`,
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Active Scanner View — driven by activeMode */}
      {activeMode === 'qr' ? (
        <CameraScanner
          activeMode={activeMode}
          onModeChange={setActiveMode}
          onMachineIdentified={(m, type, img, conf) => handleScanSuccess(m, type || 'qr', img, conf)}
          onSwitchToManual={() => onNavigate('library')}
          onSwitchToPhoto={() => setActiveMode('ai_camera')}
        />
      ) : (
        <PhotoAIAnalyzer
          activeMode={activeMode}
          onModeChange={setActiveMode}
          onMachineConfirmed={(m, type, img, conf) => handleScanSuccess(m, type, img, conf)}
          onOpenSettingsDocs={() => onNavigate('profile')}
          onSelectManual={() => onNavigate('library')}
        />
      )}

      {/* 4. Safety & Educational Disclaimer */}
      <div style={{
        background: 'rgba(255, 184, 0, 0.05)',
        border: '1px solid rgba(255, 184, 0, 0.2)',
        borderRadius: '14px',
        padding: '0.85rem 1.1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}>
        <Shield size={18} color="#FFB800" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.78rem', color: '#CBD5E1', lineHeight: 1.45 }}>
          <strong style={{ color: '#FFB800', display: 'block', marginBottom: '2px' }}>Safety Notice:</strong> Machine information is provided for educational guidance. Confirm unfamiliar equipment with qualified gym staff or a fitness professional before use.
        </div>
      </div>

    </div>
  );
};
