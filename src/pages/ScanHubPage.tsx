import React, { useState, useEffect } from 'react';
import { useGym } from '../context/GymContext';
import { Machine } from '../types';
import { QrCode, Upload, Sparkles, Shield } from 'lucide-react';
import { CameraScanner } from '../components/scanner/CameraScanner';
import { PhotoAIAnalyzer } from '../components/scanner/PhotoAIAnalyzer';

export type ScanMode = 'qr' | 'ai_camera' | 'upload';

interface ScanHubPageProps {
  initialMode?: 'qr' | 'photo' | 'ai_camera' | 'upload';
  onMachineSelected: (machine: Machine, source?: 'qr' | 'photo') => void;
  onNavigate: (tab: string) => void;
}
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
    <div className="pb-28 md:pb-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>

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
          Scan an equipment QR code badge or upload a machine photo to view setup guides.
        </p>
      </div>

      {/* 2. Compact Scanner Mode Selector Tabs (3 Synchronized Modes) */}
      <div
        className="flex w-full gap-1 p-1 bg-slate-900/80 rounded-xl text-xs max-w-xl mx-auto border border-white/10"
      >
        {/* Option 1: Scan QR Code */}
        <button
          type="button"
          onClick={() => setActiveMode('qr')}
          className={`flex-1 py-1.5 text-center text-[11px] sm:text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all rounded-lg whitespace-nowrap truncate ${
            activeMode === 'qr' ? 'text-[#00F59B]' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          }`}
          style={{
            background: activeMode === 'qr'
              ? 'linear-gradient(135deg, rgba(0, 245, 155, 0.2) 0%, rgba(13, 20, 28, 0.95) 100%)'
              : 'transparent',
            border: activeMode === 'qr'
              ? '1.5px solid #00F59B'
              : '1px solid transparent',
            boxShadow: activeMode === 'qr' ? '0 4px 16px rgba(0, 245, 155, 0.15)' : 'none'
          }}
        >
          <QrCode size={14} className="shrink-0" />
          <span className="truncate whitespace-nowrap">Scan QR Code</span>
          {activeMode === 'qr' && (
            <span style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#00F59B',
              marginLeft: '2px'
            }} className="shrink-0" />
          )}
        </button>

        {/* Option 2: Snap Machine Photo (AI) */}
        <button
          type="button"
          onClick={() => setActiveMode('ai_camera')}
          className={`flex-1 py-1.5 text-center text-[11px] sm:text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all rounded-lg whitespace-nowrap truncate ${
            activeMode === 'ai_camera' ? 'text-[#00D2FF]' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          }`}
          style={{
            background: activeMode === 'ai_camera'
              ? 'linear-gradient(135deg, rgba(0, 210, 255, 0.2) 0%, rgba(12, 19, 32, 0.95) 100%)'
              : 'transparent',
            border: activeMode === 'ai_camera'
              ? '1.5px solid #00D2FF'
              : '1px solid transparent',
            boxShadow: activeMode === 'ai_camera' ? '0 4px 16px rgba(0, 210, 255, 0.15)' : 'none'
          }}
        >
          <Sparkles size={14} className="shrink-0" />
          <span className="truncate whitespace-nowrap">Snap Machine Photo</span>
          {activeMode === 'ai_camera' && (
            <span style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#00D2FF',
              marginLeft: '2px'
            }} className="shrink-0" />
          )}
        </button>

        {/* Option 3: Upload Machine Photo */}
        <button
          type="button"
          onClick={() => setActiveMode('upload')}
          className={`flex-1 py-1.5 text-center text-[11px] sm:text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all rounded-lg whitespace-nowrap truncate ${
            activeMode === 'upload' ? 'text-[#38BDF8]' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          }`}
          style={{
            background: activeMode === 'upload'
              ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)'
              : 'transparent',
            border: activeMode === 'upload'
              ? '1.5px solid #38BDF8'
              : '1px solid transparent',
            boxShadow: activeMode === 'upload' ? '0 4px 16px rgba(56, 189, 248, 0.15)' : 'none'
          }}
        >
          <Upload size={14} className="shrink-0" />
          <span className="truncate whitespace-nowrap">Upload Photo</span>
          {activeMode === 'upload' && (
            <span style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#38BDF8',
              marginLeft: '2px'
            }} className="shrink-0" />
          )}
        </button>
      </div>

      {/* 3. Active Identification Tool View */}
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
