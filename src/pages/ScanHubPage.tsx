import React, { useState, useEffect } from 'react';
import { useGym } from '../context/GymContext';
import { Machine } from '../types';
import { QrCode, Upload, Sparkles, Shield } from 'lucide-react';
import { CameraScanner } from '../components/scanner/CameraScanner';
import { PhotoAIAnalyzer } from '../components/scanner/PhotoAIAnalyzer';

interface ScanHubPageProps {
  initialMode?: 'qr' | 'photo';
  onMachineSelected: (machine: Machine, source?: 'qr' | 'photo') => void;
  onNavigate: (tab: string) => void;
}
export const ScanHubPage: React.FC<ScanHubPageProps> = ({
  initialMode = 'qr',
  onMachineSelected,
  onNavigate
}) => {
  const [activeMode, setActiveMode] = useState<'qr' | 'photo'>(initialMode);

  useEffect(() => {
    if (initialMode) {
    setActiveMode(initialMode);
    }
  }, [initialMode]);

  const {recordMachineScan} = useGym();

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
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto', paddingBottom: '2rem' }}>

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

    {/* 2. Compact Scanner Mode Selector Tabs */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.75rem',
      background: 'rgba(15, 23, 42, 0.6)',
      padding: '6px',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      {/* Primary Option: Scan QR Code */}
      <button
        type="button"
        onClick={() => setActiveMode('qr')}
        style={{
          background: activeMode === 'qr'
            ? 'linear-gradient(135deg, rgba(0, 245, 155, 0.2) 0%, rgba(13, 20, 28, 0.95) 100%)'
            : 'transparent',
          border: activeMode === 'qr'
            ? '1.5px solid #00F59B'
            : '1px solid transparent',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: activeMode === 'qr' ? '#00F59B' : '#94A3B8',
          fontWeight: 700,
          fontSize: '0.9rem',
          transition: 'all 0.2s ease',
          boxShadow: activeMode === 'qr' ? '0 4px 16px rgba(0, 245, 155, 0.15)' : 'none'
        }}
      >
        <QrCode size={18} />
        <span>Scan QR Code</span>
        {activeMode === 'qr' && (
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#00F59B',
            marginLeft: '4px'
          }} />
        )}
      </button>

      {/* Secondary Option: Upload Machine Photo */}
      <button
        type="button"
        onClick={() => setActiveMode('photo')}
        style={{
          background: activeMode === 'photo'
            ? 'linear-gradient(135deg, rgba(0, 210, 255, 0.2) 0%, rgba(12, 19, 32, 0.95) 100%)'
            : 'transparent',
          border: activeMode === 'photo'
            ? '1.5px solid #00D2FF'
            : '1px solid transparent',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: activeMode === 'photo' ? '#00D2FF' : '#94A3B8',
          fontWeight: 700,
          fontSize: '0.9rem',
          transition: 'all 0.2s ease',
          boxShadow: activeMode === 'photo' ? '0 4px 16px rgba(0, 210, 255, 0.15)' : 'none'
        }}
      >
        <Upload size={18} />
        <span>Upload Machine Photo</span>
        {activeMode === 'photo' && (
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#00D2FF',
            marginLeft: '4px'
          }} />
        )}
      </button>
    </div>

    {/* 3. Active Identification Tool View */}
    {activeMode === 'qr' ? (
      <CameraScanner
        onMachineIdentified={(m, type, img, conf) => handleScanSuccess(m, type || 'qr', img, conf)}
        onSwitchToManual={() => onNavigate('library')}
        onSwitchToPhoto={() => setActiveMode('photo')}
      />
    ) : (
      <PhotoAIAnalyzer
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
