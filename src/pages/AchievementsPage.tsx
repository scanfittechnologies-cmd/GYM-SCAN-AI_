import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  Lock, 
  Compass, 
  BookOpen, 
  Layers, 
  QrCode,
  Zap,
  Star
} from 'lucide-react';
import { LEVEL_CONFIG } from '../config/xpConfig';

interface AchievementsPageProps {
  onNavigate?: (tab: string) => void;
}

/* ── Icon resolver ── */
const getIcon = (iconName: string, unlocked: boolean) => {
  const cls = unlocked
    ? 'w-5 h-5 text-[#22C55E]'
    : 'w-5 h-5 text-[#64748B]';

  switch (iconName) {
    case 'compass':   return <Compass className={cls} />;
    case 'map-pin':   return <Trophy className={cls} />;
    case 'award':     return <Award className={cls} />;
    case 'qr-code':   return <QrCode className={cls} />;
    case 'book-open': return <BookOpen className={cls} />;
    case 'layers':    return <Layers className={cls} />;
    default:          return <Trophy className={cls} />;
  }
};

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ onNavigate }) => {
  const { totalXP, currentLevel, achievements, xpTransactions } = useGym();
  const [filterType, setFilterType] = useState<'all' | 'unlocked' | 'locked'>('all');

  const filteredAchievements = achievements.filter(ach => {
    if (filterType === 'unlocked') return ach.unlocked;
    if (filterType === 'locked') return !ach.unlocked;
    return true;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="w-full flex flex-col space-y-4 pb-12 select-none">

      {/* ── 1. Header ── */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Badges & XP</h1>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            {unlockedCount} / {achievements.length} milestones unlocked
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141716] border border-[#22C55E]/30 text-xs font-bold text-[#22C55E]">
          <Zap className="w-3.5 h-3.5" />
          <span>L{currentLevel.level} • {totalXP} XP</span>
        </div>
      </div>

      {/* ── 2. Level Progress Card ── */}
      <div className="bg-[#141716] border border-[#222624] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Level badge circle */}
            <div className="w-11 h-11 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E] text-sm font-black">
              L{currentLevel.level}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{currentLevel.title}</h2>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                {currentLevel.isMaxLevel
                  ? 'Maximum rank achieved!'
                  : `${currentLevel.xpNeededForNext} XP to Level ${currentLevel.level + 1}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-white">{totalXP}</span>
            <span className="text-xs text-[#9CA3AF] ml-1">XP</span>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-[10px] text-[#9CA3AF] mb-1.5">
            <span>Level {currentLevel.level} Progress</span>
            <span className="font-semibold text-[#22C55E]">{currentLevel.progressPercent}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={currentLevel.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full h-2 bg-[#222624] rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
              style={{ width: `${currentLevel.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Level tier pips */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#222624] overflow-x-auto scrollbar-hide">
          {LEVEL_CONFIG.map((tier) => {
            const isAchieved = currentLevel.level >= tier.level;
            const isCurrent = currentLevel.level === tier.level;
            return (
              <div
                key={tier.level}
                className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-center transition-all ${
                  isCurrent
                    ? 'bg-[#22C55E]/15 border border-[#22C55E]/50'
                    : isAchieved
                      ? 'bg-[#101211] border border-[#22C55E]/20'
                      : 'bg-[#101211] border border-[#1E2220]'
                }`}
              >
                <div className={`text-[10px] font-bold ${isAchieved ? 'text-[#22C55E]' : 'text-[#64748B]'}`}>
                  L{tier.level}
                </div>
                <div className={`text-[9px] mt-0.5 ${isAchieved ? 'text-[#9CA3AF]' : 'text-[#555]'}`}>
                  {tier.minXP}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Filter Pills ── */}
      <div className="flex items-center gap-1.5 bg-[#101211] p-1 rounded-xl border border-[#1E2220]">
        {(['all', 'unlocked', 'locked'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setFilterType(filter)}
            className={`flex-1 text-xs font-semibold py-1.5 rounded-lg capitalize transition-all ${
              filterType === filter
                ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30'
                : 'text-[#9CA3AF] border border-transparent hover:text-white'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* ── 4. 2-Column Milestone Badge Grid ── */}
      <div className="grid grid-cols-2 gap-2.5">
        {filteredAchievements.map((ach) => {
          const progressPercent = Math.min(100, Math.round((ach.currentCount / ach.targetCount) * 100));

          if (ach.unlocked) {
            /* ─── Unlocked Badge Card ─── */
            return (
              <div
                key={ach.id}
                className="bg-[#141716] border border-[#22C55E]/40 rounded-2xl p-3 flex flex-col gap-2.5 transition-all"
              >
                {/* Icon + XP chip */}
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center flex-shrink-0">
                    {getIcon(ach.icon, true)}
                  </div>
                  <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-1.5 py-0.5 rounded-md">
                    +{ach.rewardXP} XP
                  </span>
                </div>

                {/* Title + description */}
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{ach.title}</h4>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-snug line-clamp-2">{ach.description}</p>
                </div>

                {/* Completed bar */}
                <div className="w-full h-1 bg-[#22C55E]/20 rounded-full overflow-hidden">
                  <div className="h-full bg-[#22C55E] rounded-full w-full" />
                </div>

                {ach.unlockedAt && (
                  <div className="flex items-center gap-1 text-[9px] text-[#22C55E]/70">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>
                      {new Date(ach.unlockedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            );
          }

          /* ─── Locked Badge Card ─── */
          return (
            <div
              key={ach.id}
              className="bg-[#101211] border border-[#1E2220] rounded-2xl p-3 flex flex-col gap-2.5 opacity-65 transition-all"
            >
              {/* Icon + XP chip */}
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-[#1A1D1C] border border-[#222624] flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4.5 h-4.5 text-[#64748B]" />
                </div>
                <span className="text-[10px] font-semibold text-[#64748B] bg-[#1A1D1C] px-1.5 py-0.5 rounded-md border border-[#222624]">
                  +{ach.rewardXP} XP
                </span>
              </div>

              {/* Title + requirement */}
              <div>
                <h4 className="text-xs font-bold text-[#CBD5E1] leading-tight">{ach.title}</h4>
                <p className="text-[10px] text-[#64748B] mt-0.5 leading-snug line-clamp-2">{ach.requirement}</p>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-[9px] text-[#64748B] mb-1">
                  <span>{ach.currentCount} / {ach.targetCount}</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-1 bg-[#1A1D1C] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#475569] rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 5. XP Activity Log ── */}
      {xpTransactions.length > 0 && (
        <div className="bg-[#141716] border border-[#222624] rounded-2xl p-3.5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#22C55E]" />
              <span className="text-xs font-semibold text-white">XP Log</span>
            </div>
            <span className="text-[11px] text-[#9CA3AF]">{xpTransactions.length} events</span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto scrollbar-hide">
            {xpTransactions.slice(0, 20).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-[#101211] border border-[#1E2220]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] font-bold text-[#22C55E]">+{tx.amount}</span>
                  <span className="text-[11px] text-[#CBD5E1] truncate">{tx.reason}</span>
                </div>
                <span className="text-[10px] text-[#64748B] flex-shrink-0 ml-2">
                  {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
