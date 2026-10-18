import React, { useState, useEffect } from 'react';
import { useGym } from '../context/GymContext';
import { Machine } from '../types';
import { Sparkles, Shield } from 'lucide-react';
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
