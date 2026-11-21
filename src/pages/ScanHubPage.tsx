import React, { useState, useEffect } from 'react';
import { useGym } from '../context/GymContext';
import { useSoftGate } from '../hooks/useSoftGate';
import { useUserTier } from '../hooks/useUserTier';
import { Machine } from '../types';
import { ArrowLeft } from 'lucide-react';
import { PhotoAIAnalyzer } from '../components/scanner/PhotoAIAnalyzer';

export type ScanMode = 'ai_camera' | 'upload';

interface ScanHubPageProps {
  initialMode?: 'qr' | 'photo' | 'ai_camera' | 'upload';
  onMachineSelected: (machine: Machine, source?: 'qr' | 'photo') => void;
  onNavigate: (tab: string) => void;
}

export const ScanHubPage: React.FC<ScanHubPageProps> = ({
  initialMode = 'ai_camera',
  onMachineSelected,
  onNavigate
}) => {
  const resolveInitialMode = (mode?: string): ScanMode => {
    if (mode === 'upload' || mode === 'photo') return 'upload';
    return 'ai_camera';
  };

  const [activeMode, setActiveMode] = useState<ScanMode>(() => resolveInitialMode(initialMode));
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

  useEffect(() => {
    if (hasReachedScanLimit) {
      setShowLimitBanner(true);
    }
  }, [hasReachedScanLimit]);

  const { recordMachineScan } = useGym();
  const { requireAuth } = useSoftGate();

  // Post-scan completion handler
  const handleScanSuccess = (
    machine: Machine,
    scanType: 'qr' | 'photo',
    imageUrl?: string,
    confidence?: number
  ) => {
    requireAuth(
      () => recordMachineScan(machine.id, scanType, imageUrl, confidence),
      'Create a free account to save your scan history and earn discovery XP!'
    );
    onMachineSelected(machine, scanType);
  };

  // Limit banner when daily scans are exhausted
  const DailyLimitBanner = () => (
    <div className="w-full bg-[#141716] border border-[#222624] rounded-3xl p-6 text-center flex flex-col items-center gap-3 mt-4">
      <div className="w-12 h-12 rounded-2xl bg-[#0A0C0B] border border-[#222624] flex items-center justify-center text-xl">
        🔒
      </div>
      <div>
        <h3 className="text-base font-bold text-white">Daily Scan Limit Reached</h3>
        <p className="text-xs text-[#9CA3AF] mt-1 max-w-[280px]">
          You have reached your {freeScanLimit} free daily scans. Daily limits reset every 24 hours.
        </p>
      </div>
      <button
        onClick={() => onNavigate('library')}
        className="px-4 py-2 rounded-xl bg-[#22C55E] text-black text-xs font-bold cursor-pointer mt-1"
      >
        Browse Machine Library
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 1. Minimal Top Header */}
      <div className="flex items-center justify-between px-0.5">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <h1 className="text-sm font-extrabold tracking-tight text-white uppercase">
          Scan Equipment
        </h1>

        {tier === 'free' ? (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#141716] border border-[#222624] text-[#22C55E]">
            {scanCount}/{freeScanLimit}
          </span>
        ) : (
          <span className="w-6" />
        )}
      </div>

      {/* 2. Active Scanner / Analyzer */}
      {showLimitBanner ? (
        <DailyLimitBanner />
      ) : (
        <PhotoAIAnalyzer
          activeMode={activeMode}
          onModeChange={(m) => {
            if (m === 'upload' || m === 'ai_camera') {
              setActiveMode(m);
            }
          }}
          onMachineConfirmed={(m, type, img, conf) => handleScanSuccess(m, type, img, conf)}
          onOpenSettingsDocs={() => onNavigate('profile')}
          onSelectManual={() => onNavigate('library')}
          onScanCredited={incrementScanCount}
        />
      )}
    </div>
  );
};
