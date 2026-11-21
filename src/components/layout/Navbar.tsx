import React from 'react';
import { useGym } from '../../context/GymContext';
import { Dumbbell } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const { totalXP, currentLevel, userProfile } = useGym();

  // Synced user total XP and Level across all routes
  const displayXP = totalXP ?? userProfile?.totalXP ?? 0;
  const displayLevel = currentLevel?.level ?? userProfile?.currentLevel ?? 1;

  return (
    <header 
      className="sticky top-0 z-50 w-full h-[52px] max-h-[52px] flex items-center bg-[#0A0C0B] border-b border-[#222624]"
    >
      <div className="w-full max-w-[430px] h-full mx-auto px-4 flex items-center justify-between gap-3">
        {/* ScanFit Logo & Brand Wordmark */}
        <div 
          onClick={() => onTabChange('home')}
          className="flex items-center gap-2 cursor-pointer select-none shrink-0"
        >
          <div className="w-7 h-7 rounded-lg bg-[#22C55E] flex items-center justify-center text-black shrink-0">
            <Dumbbell size={15} strokeWidth={2.6} />
          </div>
          <span className="font-black text-base tracking-wider text-white uppercase">
            SCANFIT
          </span>
        </div>

        {/* Right Controls: Compact Level / XP Status Pill (L1 • 0 XP) */}
        <div 
          onClick={() => onTabChange('achievements')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A1E1C] border border-[#2E3531] hover:border-[#3D4741] transition-colors cursor-pointer select-none"
          title="View Level & XP Details"
        >
          <span className="text-[11px] font-bold text-white tracking-wide">
            L{displayLevel}
          </span>
          <span className="text-[10px] text-[#9CA3AF]">•</span>
          <span className="text-[11px] font-mono font-bold text-[#22C55E]">
            {displayXP} <span className="text-[9px] text-[#D1D5DB] font-sans font-medium">XP</span>
          </span>
        </div>
      </div>
    </header>
  );
};
