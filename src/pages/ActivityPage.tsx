import React from 'react';
import { 
  Flame, 
  Calendar, 
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
    machines = [],
    streakInfo
  } = useGym();

  const machinesScanned = discoveredMachineIds.length;
  const currentStreak = streakInfo?.activeDays ?? (activityLog.length > 0 ? 1 : 0);

  // Filter to scan-type activities only
  const scanHistory = activityLog.filter(
    item => item.activityType === 'qr_scan' || item.activityType === 'photo_scan'
  );

  // Build a set of days (date strings) with activity for the weekly strip
  const activityDates = new Set(
    activityLog.map(item => new Date(item.timestamp).toDateString())
  );
  const today = new Date();
  const todayIndex = today.getDay(); // 0=Sun

  // Days for the 7-day strip
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Calculate the date for each day of the current week (starting Sunday)
  const getWeekDayDate = (dayIdx: number): Date => {
    const d = new Date(today);
    d.setDate(d.getDate() - todayIndex + dayIdx);
    return d;
  };

  return (
    <div className="w-full flex flex-col space-y-4 pb-12 select-none">
      {/* ── 1. Header ── */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Activity</h1>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Your workout & scan history</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141716] border border-[#222624] text-xs font-semibold text-[#22C55E]">
          <Flame className="w-3.5 h-3.5 fill-[#22C55E]" />
          <span>{currentStreak > 0 ? `${currentStreak} Day Streak` : 'Streak Active'}</span>
        </div>
      </div>

      {/* ── 2. 3-Metric Summary Strip ── */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Machines Scanned */}
        <div className="bg-[#141716] border border-[#222624] rounded-2xl p-3 flex flex-col">
          <span className="text-[11px] font-medium text-[#9CA3AF]">Scanned</span>
          <span className="text-xl font-black text-white mt-1">{machinesScanned}</span>
          <span className="text-[10px] text-[#22C55E] mt-0.5 flex items-center gap-0.5">
            <CheckCircle2 className="w-2.5 h-2.5" /> Machines
          </span>
        </div>

        {/* Day Streak */}
        <div className="bg-[#141716] border border-[#222624] rounded-2xl p-3 flex flex-col">
          <span className="text-[11px] font-medium text-[#9CA3AF]">Streak</span>
          <span className="text-xl font-black text-white mt-1">{currentStreak}</span>
          <span className="text-[10px] text-[#22C55E] mt-0.5 flex items-center gap-0.5">
            <Flame className="w-2.5 h-2.5" /> {currentStreak === 1 ? 'Day Active' : 'Days'}
          </span>
        </div>

        {/* Total XP */}
        <div className="bg-[#141716] border border-[#222624] rounded-2xl p-3 flex flex-col">
          <span className="text-[11px] font-medium text-[#9CA3AF]">Total XP</span>
          <span className="text-xl font-black text-white mt-1">{totalXP}</span>
          <span className="text-[10px] text-[#22C55E] mt-0.5 flex items-center gap-0.5">
            <Zap className="w-2.5 h-2.5" /> Points
          </span>
        </div>
      </div>

      {/* ── 3. Weekly Consistency Card ── */}
      <div className="bg-[#141716] border border-[#222624] rounded-2xl p-3.5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#22C55E]" />
            <span className="text-xs font-semibold text-white">Weekly Consistency</span>
          </div>
          <span className="text-[11px] font-medium text-[#9CA3AF]">This week</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {daysOfWeek.map((day, idx) => {
            const isToday = idx === todayIndex;
            const dayDate = getWeekDayDate(idx);
            const hadActivity = activityDates.has(dayDate.toDateString());

            return (
              <div 
                key={idx} 
                className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all ${
                  isToday 
                    ? 'bg-[#22C55E]/15 border border-[#22C55E]/50' 
                    : 'bg-[#101211] border border-[#1A1D1C]'
                }`}
              >
                <span className={`text-[10px] font-medium ${isToday ? 'text-white' : 'text-[#9CA3AF]'}`}>{day}</span>
                <div className={`w-2 h-2 rounded-full mt-1.5 ${
                  hadActivity 
                    ? 'bg-[#22C55E]' 
                    : isToday 
                      ? 'bg-[#22C55E]/40' 
                      : 'bg-[#222624]'
                }`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. Recent Scans History ── */}
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
