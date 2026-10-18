import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { 
  Trophy, 
  Sparkles, 
  Award, 
  CheckCircle, 
  Lock, 
  Compass, 
  BookOpen, 
  Bookmark, 
  Layers, 
  Clock, 
  Flame, 
  QrCode,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { LEVEL_CONFIG } from '../config/xpConfig';

interface AchievementsPageProps {
  onNavigate?: (tab: string) => void;
}

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ onNavigate }) => {
  const { totalXP, currentLevel, achievements, xpTransactions } = useGym();
  const [filterType, setFilterType] = useState<'all' | 'unlocked' | 'locked'>('all');

  const getAchievementIcon = (iconName: string, unlocked: boolean) => {
    const color = unlocked ? '#00F59B' : '#64748B';
    switch (iconName) {
      case 'compass': return <Compass size={24} color={color} />;
      case 'map-pin': return <Trophy size={24} color={color} />;
      case 'award': return <Award size={24} color={color} />;
      case 'qr-code': return <QrCode size={24} color={color} />;
      case 'book-open': return <BookOpen size={24} color={color} />;
      case 'layers': return <Layers size={24} color={color} />;
      case 'bookmark': return <Bookmark size={24} color={color} />;
      default: return <Trophy size={24} color={color} />;
    }
  };

  const filteredAchievements = achievements.filter(ach => {
    if (filterType === 'unlocked') return ach.unlocked;
    if (filterType === 'locked') return !ach.unlocked;
    return true;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '850px', margin: '0 auto' }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
          <span className="badge badge-emerald" style={{ fontSize: '0.72rem', padding: '3px 9px' }}>
            Gamified Progression
          </span>
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold"
            style={{
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: '#34D399',
              fontWeight: 600
            }}
          >
            Gamification System Active
          </span>
        </div>
        <h1 style={{ fontSize: '1.9rem', color: '#F1F5F9', margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
          XP & Achievements
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#94A3B8', marginTop: '6px', maxWidth: '650px', lineHeight: 1.45 }}>
          Earn Experience Points (XP) for expanding your machine repertoire, verifying equipment QR codes, and completing form tutorials.
        </p>
      </div>

      {/* Level Progression Hero Card */}
      <div className="glass-panel" style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, rgba(18, 26, 40, 0.95) 0%, rgba(10, 16, 26, 0.98) 100%)',
        border: '1px solid rgba(0, 245, 155, 0.3)',
        borderRadius: '16px'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
            <div style={{
              width: '58px',
              height: '58px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(0, 245, 155, 0.2), rgba(0, 210, 255, 0.2))',
              border: '2px solid #00F59B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00F59B',
              fontSize: '1.45rem',
              fontWeight: 900
            }}>
              L{currentLevel.level}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                  Current Rank Title
                </span>
                {currentLevel.isMaxLevel && (
                  <span style={{ fontSize: '0.68rem', background: '#FFB800', color: '#0F172A', padding: '2px 8px', borderRadius: '999px', fontWeight: 800 }}>
                    MAX LEVEL
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: '1.35rem', color: '#F1F5F9', margin: '3px 0 0 0', fontWeight: 800 }}>
                {currentLevel.title}
              </h2>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#00F59B', lineHeight: 1 }}>
              {totalXP} <span style={{ fontSize: '1.05rem', color: '#94A3B8', fontWeight: 600 }}>XP</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              {currentLevel.isMaxLevel 
                ? 'Maximum level reached!'
                : `Next Rank at ${currentLevel.nextXP} XP (${currentLevel.xpNeededForNext} XP away)`}
            </span>
          </div>
        </div>

        {/* Accessible Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#CBD5E1', marginBottom: '6px' }}>
            <span>Level {currentLevel.level} Progress</span>
            <strong style={{ color: '#00F59B' }}>{currentLevel.progressPercent}%</strong>
          </div>
          <div 
            role="progressbar"
            aria-valuenow={currentLevel.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{
              width: '100%',
              height: '11px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '999px',
              overflow: 'hidden'
            }}
          >
            <div style={{
              width: `${currentLevel.progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00F59B 0%, #00D2FF 100%)',
              borderRadius: '999px',
              transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }} />
          </div>
        </div>

        {/* XP Rules Breakdown */}
        <div
          className="flex flex-wrap items-center gap-2 sm:gap-2.5"
          style={{
            marginTop: '1.35rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div className="bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-700/50" style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            <strong style={{ color: '#00F59B' }}>+10 XP</strong> Verified QR Scan
          </div>
          <div className="bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-700/50" style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            <strong style={{ color: '#00D2FF' }}>+10 XP</strong> Photo Vision Match
          </div>
          <div className="bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-700/50" style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            <strong style={{ color: '#38BDF8' }}>+10 XP</strong> Unique Discovery Bonus
          </div>
          <div className="bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-700/50" style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            <strong style={{ color: '#A855F7' }}>+5 XP</strong> View Form Tutorial
          </div>
          <div className="bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-700/50" style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            <strong style={{ color: '#FFB800' }}>+25–100 XP</strong> Achievement Badges
          </div>
        </div>
      </div>

      {/* Level Tier Road Map */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.98rem', color: '#F1F5F9', margin: '0 0 0.85rem 0', fontWeight: 700 }}>
          Configurable Level Tiers
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {LEVEL_CONFIG.map((tier) => {
            const isAchieved = currentLevel.level >= tier.level;
            const isCurrent = currentLevel.level === tier.level;

            return (
              <div
                key={tier.level}
                style={{
                  padding: '0.75rem',
                  borderRadius: '12px',
                  background: isCurrent 
                    ? 'rgba(0, 245, 155, 0.12)' 
                    : isAchieved 
                    ? 'rgba(255, 255, 255, 0.03)' 
                    : 'rgba(255, 255, 255, 0.01)',
                  border: isCurrent 
                    ? '1.5px solid #00F59B' 
                    : isAchieved 
                    ? '1px solid rgba(0, 245, 155, 0.25)' 
                    : '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isAchieved ? '#00F59B' : '#64748B' }}>
                    Level {tier.level}
                  </span>
                  {isAchieved && <CheckCircle size={13} color="#00F59B" />}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F1F5F9', margin: '2px 0' }}>
                  {tier.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                  {tier.minXP} XP
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements List Section */}
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#F1F5F9', margin: 0, fontWeight: 800 }}>
              Milestone Badges ({unlockedCount} / {achievements.length} Unlocked)
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '2px 0 0 0' }}>
              Badges automatically unlock when verified scan and tutorial requirements are satisfied.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.04)', padding: '3px', borderRadius: '10px' }}>
            {(['all', 'unlocked', 'locked'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                style={{
                  background: filterType === filter ? 'rgba(0, 245, 155, 0.18)' : 'transparent',
                  color: filterType === filter ? '#00F59B' : '#94A3B8',
                  border: filterType === filter ? '1px solid rgba(0, 245, 155, 0.3)' : '1px solid transparent',
                  borderRadius: '7px',
                  padding: '4px 11px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s'
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredAchievements.map((ach) => {
            const progressPercent = Math.min(100, Math.round((ach.currentCount / ach.targetCount) * 100));
            const dateUnlockedStr = ach.unlockedAt 
              ? new Date(ach.unlockedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
              : undefined;

            return (
              <div
                key={ach.id}
                className={ach.unlocked
                  ? "bg-emerald-950/20 border-emerald-500/30 shadow-lg shadow-emerald-500/5 border"
                  : "bg-slate-900/60 border-slate-800 border"
                }
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  borderRadius: '20px',
                  border: ach.unlocked
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : '1px solid rgba(30, 41, 59, 0.8)',
                  background: ach.unlocked
                    ? 'rgba(6, 78, 59, 0.2)'
                    : 'rgba(15, 23, 42, 0.6)',
                  boxShadow: ach.unlocked
                    ? '0 10px 25px -5px rgba(16, 185, 129, 0.08), 0 8px 10px -6px rgba(16, 185, 129, 0.04)'
                    : 'none',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div 
                    className={ach.unlocked ? "bg-emerald-500/20 text-emerald-400" : ""}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: ach.unlocked
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'rgba(255, 255, 255, 0.04)',
                      border: ach.unlocked
                        ? '1.5px solid rgba(16, 185, 129, 0.5)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '1.4rem'
                    }}
                  >
                    {ach.unlocked ? (
                      <span role="img" aria-label="trophy">🏆</span>
                    ) : (
                      <span role="img" aria-label="locked">🔒</span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '2px' }}>
                      <h4 style={{ fontSize: '0.98rem', color: ach.unlocked ? '#F1F5F9' : '#CBD5E1', margin: 0, fontWeight: 800 }}>
                        {ach.title}
                      </h4>
                      <span 
                        className={ach.unlocked ? "bg-emerald-500 text-slate-950 font-bold" : ""}
                        style={{
                          background: ach.unlocked ? '#10B981' : 'rgba(255, 255, 255, 0.06)',
                          color: ach.unlocked ? '#020617' : '#94A3B8',
                          fontSize: '0.74rem',
                          fontWeight: ach.unlocked ? 700 : 600,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          border: ach.unlocked ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                          flexShrink: 0
                        }}
                      >
                        +{ach.rewardXP} XP
                      </span>
                    </div>

                    <div style={{ fontSize: '0.74rem', color: ach.unlocked ? '#34D399' : '#94A3B8', fontWeight: 600, marginTop: '2px' }}>
                      Requirement: {ach.requirement}
                    </div>

                    <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '4px 0 0 0', lineHeight: 1.35 }}>
                      {ach.description}
                    </p>
                  </div>
                </div>

                {/* Progress toward unlocking */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#94A3B8', marginBottom: '4px' }}>
                    <span>{ach.unlocked ? 'Badge Completed' : 'Current Progress'}</span>
                    <strong style={{ color: ach.unlocked ? '#34D399' : '#CBD5E1' }}>
                      {Math.min(ach.currentCount, ach.targetCount)} of {ach.targetCount} ({progressPercent}%)
                    </strong>
                  </div>

                  <div 
                    role="progressbar"
                    aria-valuenow={progressPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    style={{
                      width: '100%',
                      height: '6px',
                      background: ach.unlocked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '999px',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      width: `${progressPercent}%`,
                      height: '100%',
                      background: ach.unlocked
                        ? 'linear-gradient(90deg, #10B981, #34D399)'
                        : '#475569',
                      borderRadius: '999px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>

                  {dateUnlockedStr && (
                    <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={12} color="#34D399" /> Unlocked on {dateUnlockedStr}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* XP Transaction History Log */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="#00F59B" />
            <h3 style={{ fontSize: '0.98rem', color: '#F1F5F9', margin: 0, fontWeight: 700 }}>XP Audit Log</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            Verified Learning Events ({xpTransactions.length})
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
          {xpTransactions.map((tx) => (
            <div
              key={tx.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.9rem',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                fontSize: '0.8rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#00F59B', fontWeight: 800 }}>+{tx.amount} XP</span>
                <span style={{ color: '#CBD5E1' }}>{tx.reason}</span>
              </div>
              <span style={{ color: '#64748B', fontSize: '0.72rem', flexShrink: 0 }}>
                {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
