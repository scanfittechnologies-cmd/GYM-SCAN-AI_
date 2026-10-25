import React, { useState, useEffect } from 'react';
import { useGym } from '../context/GymContext';
import { useSoftGate } from '../hooks/useSoftGate';
import { useUserTier } from '../hooks/useUserTier';
import { Machine } from '../types';
import { QrCode, Sparkles, Upload } from 'lucide-react';
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
  shortLabel: string;
  sublabel: string;
  icon: React.ReactNode;
  accent: string;
  glow: string;
  gradientActive: string;
  borderActive: string;
}[] = [
  {
    id: 'qr',
    label: 'Scan QR Code',
    shortLabel: 'QR Code',
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
    shortLabel: 'Snap',
    sublabel: 'Vision Scanner Active',
    icon: <Sparkles size={18} />,
    accent: '#00D2FF',
    glow: 'rgba(0, 210, 255, 0.22)',
    gradientActive: 'linear-gradient(135deg, rgba(0, 210, 255, 0.18) 0%, rgba(4, 10, 26, 0.96) 100%)',
    borderActive: '#00D2FF',
  },
  {
    id: 'upload',
    label: 'Upload Photo',
    shortLabel: 'Upload',
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
  // Shown only when the user explicitly tries to start a scan after the daily limit is reached
  const [showLimitBanner, setShowLimitBanner] = useState<boolean>(false);

  const {
    tier,
    scanCount,
    incrementScanCount,
    hasReachedScanLimit,
    freeScanLimit,
  } = useUserTier();

  useEffect(() => {
    if (initialMode) {
      setActiveMode(resolveInitialMode(initialMode));
    }
  }, [initialMode]);

  // ── Reactively show limit banner when scan limit is reached ───────────────
  useEffect(() => {
    if (hasReachedScanLimit) {
      setShowLimitBanner(true);
    }
  }, [hasReachedScanLimit]);

  const { recordMachineScan } = useGym();
  const { requireAuth } = useSoftGate();

  // ── Pre-scan paywall gate ─────────────────────────────────────────────────
  // Intercepts tab switch: blocks camera/upload for free users at their limit.
  const handleTabClick = (tabId: ScanMode) => {
    if (tier === 'free' && hasReachedScanLimit) {
      setShowLimitBanner(true);
      return;
    }
    setShowLimitBanner(false);
    setActiveMode(tabId);
  };

  // ── Post-scan completion handler ──────────────────────────────────────────
  // Called only when a machine is confirmed after a successful scan.
  const handleScanSuccess = (
    machine: Machine,
    scanType: 'qr' | 'photo',
    imageUrl?: string,
    confidence?: number
  ) => {
    // QR scans don't go through PhotoAIAnalyzer, so we consume credit here
    if (scanType === 'qr') {
      if (tier === 'free' && hasReachedScanLimit) {
        setShowLimitBanner(true);
        return;
      }
      incrementScanCount();
    }

    // Soft-gate: saving scan results + earning XP requires auth
    requireAuth(
      () => recordMachineScan(machine.id, scanType, imageUrl, confidence),
      'Create a free account to save your scan history and earn discovery XP!'
    );
    // Machine detail navigation is always allowed (viewing is free)
    onMachineSelected(machine, scanType);
  };

  // ── Daily beta limit banner shown instead of scanner when limit reached ──────
  const DailyLimitBanner = () => (
    <div
      id="scan-hub-daily-limit-banner"
      style={{
        minHeight: '220px',
        borderRadius: '20px',
        border: '1.5px solid rgba(255, 165, 0, 0.35)',
        background: 'linear-gradient(135deg, rgba(255,165,0,0.07) 0%, rgba(4,10,26,0.97) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.85rem',
        padding: '2rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: '2.2rem' }}>🌅</span>
      <div>
        <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F1F5F9', marginBottom: '0.35rem' }}>
          Daily Scan Limit Reached
        </p>
        <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.6, maxWidth: '340px' }}>
          You've reached your{' '}
          <strong style={{ color: '#FFA500' }}>{freeScanLimit} free daily beta scans</strong>.
          {' '}Check back tomorrow for more!
        </p>
      </div>
      <div style={{
        background: 'rgba(255, 165, 0, 0.08)',
        border: '1px solid rgba(255, 165, 0, 0.2)',
        borderRadius: '10px',
        padding: '0.5rem 1.25rem',
        fontSize: '0.78rem',
        color: '#94A3B8',
      }}>
        ⏰ Scans reset every 24 hours
      </div>
    </div>
  );

  return (
    <div className="pb-28 md:pb-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '800px', margin: '0 auto' }}>

      {/* 1. Page Header */}
      <div style={{ textAlign: 'center', maxWidth: '580px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
            <Sparkles size={11} /> Equipment Identification Hub
          </span>
          {tier === 'free' && (
            <span
              id="scan-counter-pill"
              className="badge badge-blue"
              style={{
                fontSize: '0.7rem',
                padding: '2px 8px',
                fontWeight: 700,
                letterSpacing: '0.02em',
                background: hasReachedScanLimit
                  ? 'rgba(255, 107, 129, 0.15)'
                  : 'rgba(0, 210, 255, 0.15)',
                border: hasReachedScanLimit
                  ? '1px solid #FF6B81'
                  : '1px solid #00D2FF',
                color: hasReachedScanLimit ? '#FF6B81' : '#00D2FF',
              }}
            >
              {hasReachedScanLimit
                ? '🔒 Daily Limit Reached'
                : `⚡ Beta: ${scanCount} of ${freeScanLimit} daily scans used`}
            </span>
          )}
        </div>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.2rem)', color: '#F1F5F9', marginBottom: '0.35rem', lineHeight: 1.2 }}>
          Identify Gym Machine
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#94A3B8', lineHeight: 1.45, margin: 0 }}>
          Scan a QR code, snap a photo, or upload an image — instant machine setup guides.
        </p>
      </div>

      {/* 2. Segmented Mode Selector */}
      <div
        role="tablist"
        aria-label="Scanner mode"
        className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full max-w-[680px] mx-auto p-1.5"
        style={{
          background: 'rgba(7, 10, 18, 0.88)',
          backdropFilter: 'blur(16px)',
          borderRadius: '18px',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.38)',
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeMode === tab.id;
          const isBlocked = tier === 'free' && hasReachedScanLimit;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              id={`scan-tab-${tab.id}`}
              onClick={() => handleTabClick(tab.id)}
              className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 sm:py-3 sm:px-2"
              style={{
                borderRadius: '13px',
                border: isActive ? `1.5px solid ${tab.borderActive}` : '1.5px solid transparent',
                background: isActive ? tab.gradientActive : 'transparent',
                boxShadow: isActive
                  ? `0 0 22px ${tab.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`
                  : 'none',
                cursor: isBlocked ? 'not-allowed' : 'pointer',
                opacity: isBlocked && !isActive ? 0.5 : 1,
                transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: 'relative',
                outline: 'none',
              }}
            >
              {/* Active glow pulse dot */}
              {isActive && (
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: tab.accent,
                  boxShadow: `0 0 8px ${tab.accent}`,
                }} />
              )}

              {/* Lock indicator for blocked tabs */}
              {isBlocked && !isActive && (
                <span style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '0.6rem' }}>🔒</span>
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
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </span>

              {/* Sub-label */}
              <span
                className="hidden sm:block"
                style={{
                  fontSize: '0.62rem',
                  color: isActive ? tab.accent + 'AA' : '#475569',
                  fontWeight: 500,
                  lineHeight: 1,
                  textAlign: 'center',
                  transition: 'color 0.18s ease',
                  whiteSpace: 'nowrap',
                }}
              >
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



      {/* 3. Active Scanner View — or Daily Limit Banner when user tries a new scan after limit */}
      {showLimitBanner ? (
        <DailyLimitBanner />
      ) : activeMode === 'qr' ? (
        <CameraScanner
          activeMode={activeMode}
          onModeChange={setActiveMode}
          onMachineIdentified={(m, type, img, conf) => handleScanSuccess(m, type || 'qr', img, conf)}
          onSwitchToManual={() => onNavigate('library')}
          onSwitchToPhoto={() => setActiveMode('ai_camera')}
          onScanCredited={incrementScanCount}
        />
      ) : (
        <PhotoAIAnalyzer
          activeMode={activeMode}
          onModeChange={setActiveMode}
          onMachineConfirmed={(m, type, img, conf) => handleScanSuccess(m, type, img, conf)}
          onOpenSettingsDocs={() => onNavigate('profile')}
          onSelectManual={() => onNavigate('library')}
          onScanCredited={incrementScanCount}
        />
      )}
    </div>
  );
};
