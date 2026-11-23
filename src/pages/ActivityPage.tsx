import React from 'react';
import { 
  ChevronRight, 
  Sparkles,
  Zap,
  CheckCircle2,
  ScanLine
} from 'lucide-react';
import { useGym } from '../context/GymContext';
import { Machine } from '../types';

interface ActivityPageProps {
  onSelectMachine: (machine: Machine, source?: 'qr' | 'photo' | 'library' | 'activity') => void;
  onNavigate: (tab: string) => void;
}

export const ActivityPage: React.FC<ActivityPageProps> = ({ onSelectMachine, onNavigate }) => {
  const { 
    totalXP, 
    activityLog = [], 
    discoveredMachineIds = [], 
    machines = []
  } = useGym();

  const machinesScanned = discoveredMachineIds.length;

  // Filter to scan-type activities only
  const scanHistory = activityLog.filter(
    item => item.activityType === 'qr_scan' || item.activityType === 'photo_scan'
  );

  return (
    <div className="w-full flex flex-col space-y-4 pb-12 select-none">
      {/* ── 1. Header ── */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Activity</h1>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Your workout & scan history</p>
        </div>
      </div>

      {/* ── 2. 2-Column Summary Grid ── */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Machines Scanned */}
        <div className="bg-[#141716] border border-[#222624] rounded-2xl p-3.5 flex flex-col">
          <span className="text-xs font-medium text-[#9CA3AF]">Machines Scanned</span>
          <span className="text-2xl font-black text-white mt-1">{machinesScanned}</span>
          <span className="text-[11px] text-[#22C55E] mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Discovered
          </span>
        </div>

        {/* Total XP */}
        <div className="bg-[#141716] border border-[#222624] rounded-2xl p-3.5 flex flex-col">
          <span className="text-xs font-medium text-[#9CA3AF]">Total XP</span>
          <span className="text-2xl font-black text-white mt-1">{totalXP}</span>
          <span className="text-[11px] text-[#22C55E] mt-1 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Points
          </span>
        </div>
      </div>

      {/* ── 3. Recent Scans History ── */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Recent Scans</span>
            {scanHistory.length > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#101211] text-[#9CA3AF] border border-[#222624]">
                {scanHistory.length}
              </span>
            )}
          </h2>
          <span className="text-[11px] text-[#9CA3AF]">Auto-saved</span>
        </div>

        {scanHistory.length === 0 ? (
          /* ── Empty state ── */
          <div className="bg-[#141716] border border-[#222624] rounded-2xl p-6 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#222624] flex items-center justify-center mb-3 text-[#9CA3AF]">
              <ScanLine className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No scans recorded yet</h3>
            <p className="text-xs text-[#9CA3AF] mt-1 max-w-[240px]">
              Point your camera at any gym machine to identify setup, form cues, and earn XP.
            </p>
            <button
              onClick={() => onNavigate('scan')}
              className="mt-4 px-4 py-2 bg-[#22C55E] hover:bg-[#1ebd5a] active:scale-95 text-[#0A0C0B] font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Scan First Machine
            </button>
          </div>
        ) : (
          /* ── History list ── */
          <div className="space-y-2">
            {scanHistory.slice(0, 15).map((logItem, index) => {
              const matchedMachine = machines.find(m => m.id === logItem.machineId);
              const displayName = logItem.machineName || matchedMachine?.name || 'Gym Machine';
              const muscle = matchedMachine?.primaryMuscles?.[0] || matchedMachine?.category || 'Full Body';
              const thumb = logItem.imageUrl || matchedMachine?.frontReferenceImage || matchedMachine?.galleryImages?.[0] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=300&q=80';
              const formattedDate = new Date(logItem.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric'
              });

              return (
                <div
                  key={logItem.id || index}
                  onClick={() => matchedMachine && onSelectMachine(matchedMachine, 'activity')}
                  className={`bg-[#141716] border border-[#222624] rounded-2xl p-2.5 flex items-center justify-between gap-3 transition-all ${
                    matchedMachine ? 'hover:border-[#22C55E]/40 active:scale-[0.99] cursor-pointer' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#0A0C0B] flex-shrink-0 border border-[#222624]">
                      <img 
                        src={thumb} 
                        alt={displayName} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{displayName}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-semibold text-[#22C55E] bg-[#22C55E]/10 px-1.5 py-0.5 rounded-md">
                          {muscle}
                        </span>
                        <span className="text-[10px] text-[#9CA3AF]">{formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] font-bold text-[#22C55E] bg-[#22C55E]/15 px-2 py-0.5 rounded-full border border-[#22C55E]/30">
                      +{logItem.xpAwarded || 25} XP
                    </span>
                    {matchedMachine && (
                      <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
