import React from 'react';
import { useGym } from '../../context/GymContext';
import { Dumbbell, Settings } from 'lucide-react';

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
      className="sticky top-0 z-50 w-full flex items-center bg-[#0A0C0B] border-b border-[#222624] py-2"
    >
      <div className="w-full max-w-[430px] mx-auto px-4 flex items-center justify-between gap-3">
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

        {/* Right Controls: Level / XP Pill + Gear Settings Icon Button directly below it */}
        <div className="flex flex-col items-end gap-1 shrink-0 select-none">
          {/* Level / XP Status Pill */}
          <div 
            onClick={() => onTabChange('achievements')}
            className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1A1E1C] border border-[#2E3531] hover:border-[#3D4741] transition-colors cursor-pointer"
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

          {/* Sleek Compact Settings Gear Icon Button */}
          <button
            type="button"
            onClick={() => onTabChange('profile')}
            className={`p-1 rounded-full bg-[#141716] border border-[#222624] hover:border-[#22C55E]/40 text-gray-300 hover:text-white transition-all cursor-pointer ${
              currentTab === 'profile' ? 'border-[#22C55E]/60 text-[#22C55E]' : ''
            }`}
            title="Profile & App Preferences"
            aria-label="Profile and Settings"
          >
            <Settings size={12} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </header>
  );
};
