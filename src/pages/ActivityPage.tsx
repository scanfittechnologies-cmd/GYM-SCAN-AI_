import React, { useState, useMemo } from 'react';
import { useGym } from '../context/GymContext';
import { Machine, ActivityRecord } from '../types';
import { 
  History, 
  QrCode, 
  Upload, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  Flame,
  Trophy,
  BookOpen,
  ShieldCheck
} from 'lucide-react';

interface ActivityPageProps {
  onSelectMachine: (machine: Machine, source?: 'qr' | 'photo' | 'library' | 'activity') => void;
  onNavigate: (tab: string, scanMode?: string) => void;
}

type ActivityFilter = 'all' | 'qr_scan' | 'photo_scan' | 'tutorial_viewed' | 'achievement_unlocked';

export const ActivityPage: React.FC<ActivityPageProps> = ({ onSelectMachine, onNavigate }) => {
  const { 
    activityLog, 
    discoveredMachineIds, 
    completedTutorialIds, 
    achievements,
    totalXP, 
    currentLevel, 
    machines, 
    getMachineById
  } = useGym();

  const [activeFilter, setActiveFilter] = useState<ActivityFilter>('all');

  // Filtered activity list
  const filteredActivities = useMemo(() => {
    let list = [...activityLog];
    if (activeFilter !== 'all') {
      list = list.filter(item => item.activityType === activeFilter);
    }
    // Newest first default sort
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [activityLog, activeFilter]);

  // Verified scans count (QR + Photo)
  const verifiedScansCount = useMemo(() => {
    return activityLog.filter(
      a => (a.activityType === 'qr_scan' || a.activityType === 'photo_scan') && a.status === 'Verified'
    ).length;
  }, [activityLog]);

  // Achievement unlock count
  const unlockedAchievementsCount = achievements.filter(a => a.unlocked).length;

  // Filter counts for active badges
  const filterCounts = useMemo(() => {
    return {
      all: activityLog.length,
      qr_scan: activityLog.filter(a => a.activityType === 'qr_scan').length,
      photo_scan: activityLog.filter(a => a.activityType === 'photo_scan').length,
      tutorial_viewed: activityLog.filter(a => a.activityType === 'tutorial_viewed').length,
      achievement_unlocked: activityLog.filter(a => a.activityType === 'achievement_unlocked').length,
    };
  }, [activityLog]);

  // Utility function for clean confidence display
  const formatConfidence = (confidence?: number | null) => {
    if (confidence === undefined || confidence === null) return 'N/A';
    const percentage = confidence <= 1 ? confidence * 100 : confidence;
    return `${Math.round(percentage)}%`;
  };

  // Weekly activity cadence calculation (last 7 days)
  const weeklyCadence = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const result: { day: string; count: number; isToday: boolean }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayName = days[d.getDay()];
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const endOfDay = startOfDay + 86400000;

      const count = activityLog.filter(s => s.timestamp >= startOfDay && s.timestamp < endOfDay).length;
      result.push({
        day: dayName,
        count,
        isToday: i === 0
      });
    }
    return result;
  }, [activityLog]);

  const maxWeeklyCount = Math.max(...weeklyCadence.map(w => w.count), 3);

  // Helper to render activity icon
  const renderActivityIcon = (activity: ActivityRecord) => {
    switch (activity.activityType) {
      case 'qr_scan':
        return (
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(0, 245, 155, 0.15)',
            border: '1.5px solid #00F59B',
            color: '#00F59B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <QrCode size={18} />
          </div>
        );
      case 'photo_scan':
        return (
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(0, 210, 255, 0.15)',
            border: '1.5px solid #00D2FF',
            color: '#00D2FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Upload size={18} />
          </div>
        );
      case 'tutorial_viewed':
        return (
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1.5px solid #A855F7',
            color: '#A855F7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <BookOpen size={18} />
          </div>
        );
      case 'achievement_unlocked':
        return (
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 184, 0, 0.15)',
            border: '1.5px solid #FFB800',
            color: '#FFB800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Trophy size={18} />
          </div>
        );
      default:
        return (
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid #94A3B8',
            color: '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Sparkles size={18} />
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.72rem', padding: '3px 9px' }}>
              Activity Feed
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
              Activity Verified
            </span>
          </div>
          <h1 style={{ fontSize: '1.9rem', color: '#F1F5F9', margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
            My Activity
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#94A3B8', marginTop: '6px', maxWidth: '620px', lineHeight: 1.45 }}>
            Real-time chronological timeline of your verified equipment scans, tutorials mastered, XP earnings, and milestone achievements.
          </p>
        </div>
      </div>

      {/* 1. TOP STATISTIC CARDS (6 Key Metrics) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
        gap: '0.85rem'
      }}>
        {/* Total XP */}
        <div className="glass-card" style={{ padding: '1rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#00F59B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total XP
            </span>
            <Sparkles size={14} color="#00F59B" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F1F5F9', margin: '4px 0' }}>
            {totalXP}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
            Earned from verified actions
          </div>
        </div>

        {/* Total Verified Scans */}
        <div className="glass-card" style={{ padding: '1rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#00D2FF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Verified Scans
            </span>
            <ShieldCheck size={14} color="#00D2FF" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F1F5F9', margin: '4px 0' }}>
            {verifiedScansCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
            QR & AI Vision matches
          </div>
        </div>

        {/* Unique Machines Discovered */}
        <div className="glass-card" style={{ padding: '1rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Discovered
            </span>
            <QrCode size={14} color="#38BDF8" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F1F5F9', margin: '4px 0' }}>
            {discoveredMachineIds.length} <span style={{ fontSize: '0.85rem', color: '#64748B' }}>/ {machines.length}</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
            {Math.round((discoveredMachineIds.length / machines.length) * 100)}% of gym catalog
          </div>
        </div>

        {/* Tutorials Viewed */}
        <div className="glass-card" style={{ padding: '1rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#A855F7', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tutorials
            </span>
            <BookOpen size={14} color="#A855F7" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F1F5F9', margin: '4px 0' }}>
            {completedTutorialIds.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
            Form checklists passed
          </div>
        </div>

        {/* Current Level */}
        <div className="glass-card" style={{ padding: '1rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#EC4899', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Current Level
            </span>
            <Flame size={14} color="#EC4899" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F1F5F9', margin: '4px 0' }}>
            Lvl {currentLevel.level}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#00F59B', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentLevel.title}
          </div>
        </div>

        {/* Achievement Progress */}
        <div 
          className="glass-card" 
          style={{ padding: '1rem 1.15rem', cursor: 'pointer' }}
          onClick={() => onNavigate('achievements')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#FFB800', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Achievements
            </span>
            <Trophy size={14} color="#FFB800" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F1F5F9', margin: '4px 0' }}>
            {unlockedAchievementsCount} <span style={{ fontSize: '0.85rem', color: '#64748B' }}>/ {achievements.length}</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#00D2FF', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
            View Badges & XP Tiers <ChevronRight size={12} />
          </div>
        </div>
      </div>


      {/* 3. WEEKLY ACTIVITY CADENCE */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#00F59B" />
            <h3 style={{ fontSize: '0.98rem', color: '#F1F5F9', margin: 0, fontWeight: 700 }}>Weekly Activity Cadence</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Last 7 Days (Real Event Count)</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '0.5rem',
          height: '110px',
          padding: '0 0.5rem'
        }}>
          {weeklyCadence.map((item, idx) => {
            const barHeightPercent = item.count > 0 ? Math.max(16, Math.round((item.count / maxWeeklyCount) * 100)) : 8;
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                <span style={{ fontSize: '0.7rem', color: item.isToday ? '#00F59B' : '#64748B', fontWeight: 700 }}>
                  {item.count > 0 ? item.count : '-'}
                </span>
                <div style={{
                  width: '100%',
                  maxWidth: '36px',
                  height: `${barHeightPercent}%`,
                  background: item.isToday 
                    ? 'linear-gradient(180deg, #00F59B, #00D2B4)' 
                    : item.count > 0 ? 'rgba(0, 245, 155, 0.35)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  transition: 'height 0.4s ease'
                }} />
                <span style={{ fontSize: '0.72rem', color: item.isToday ? '#00F59B' : '#94A3B8', fontWeight: item.isToday ? 800 : 500 }}>
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ACTIVITY HISTORY WITH FILTERS & REAL TIMELINE */}
      <div className="glass-card p-3 sm:p-6" style={{ width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="#00D2FF" />
            <h3 style={{ fontSize: '1.05rem', color: '#F1F5F9', margin: 0, fontWeight: 700 }}>Activity History</h3>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              ({filteredActivities.length} {filteredActivities.length === 1 ? 'Record' : 'Records'})
            </span>
          </div>

          {/* Activity Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', background: 'rgba(255, 255, 255, 0.04)', padding: '3px', borderRadius: '10px' }}>
            {(
              [
                { id: 'all', label: 'All Activity', count: filterCounts.all },
                { id: 'qr_scan', label: 'QR Scans', count: filterCounts.qr_scan },
                { id: 'photo_scan', label: 'Photo Scans', count: filterCounts.photo_scan },
                { id: 'tutorial_viewed', label: 'Tutorials', count: filterCounts.tutorial_viewed },
                { id: 'achievement_unlocked', label: 'Achievements', count: filterCounts.achievement_unlocked },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                style={{
                  background: activeFilter === filter.id ? 'rgba(0, 245, 155, 0.18)' : 'transparent',
                  color: activeFilter === filter.id ? '#00F59B' : '#94A3B8',
                  border: activeFilter === filter.id ? '1px solid rgba(0, 245, 155, 0.3)' : '1px solid transparent',
                  borderRadius: '7px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Activity Record List */}
        {filteredActivities.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', position: 'relative' }}>
            {/* Vertical timeline line */}
            <div style={{
              position: 'absolute',
              left: '18px',
              top: '12px',
              bottom: '12px',
              width: '2px',
              background: 'rgba(255, 255, 255, 0.07)',
              zIndex: 0
            }} />

            {filteredActivities.map((record) => {
              const machine = record.machineId ? getMachineById(record.machineId) : undefined;
              const dateObj = new Date(record.timestamp);
              const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
              const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const cleanNotes = record.notes
                ? record.notes.replace(/—?\s*Demo\s*Data\s*—?/gi, '').replace(/^\s*—\s*/, '').replace(/\s*—\s*$/, '').trim()
                : '';

              return (
                <div
                  key={record.id}
                  className="px-3.5 py-3 sm:px-4 sm:py-3.5"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    position: 'relative',
                    zIndex: 1,
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.15s ease',
                    boxSizing: 'border-box',
                    width: '100%',
                    minWidth: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(0, 245, 155, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  {/* Timeline icon dot */}
                  <div style={{ flexShrink: 0 }}>
                    {renderActivityIcon(record)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', width: '100%' }}>
                      {/* Machine Title & Tags Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', minWidth: 0 }}>
                        <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#F1F5F9', wordBreak: 'break-word' }}>
                          {record.machineName}
                        </span>
                        {record.machineCategory && (
                          <span className="badge badge-muted" style={{ fontSize: '0.65rem' }}>
                            {record.machineCategory}
                          </span>
                        )}
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '1px 7px',
                          borderRadius: '999px',
                          background: record.status === 'Verified' ? 'rgba(0, 245, 155, 0.15)' : 'rgba(0, 210, 255, 0.15)',
                          color: record.status === 'Verified' ? '#00F59B' : '#00D2FF',
                          border: record.status === 'Verified' ? '1px solid rgba(0, 245, 155, 0.3)' : '1px solid rgba(0, 210, 255, 0.3)'
                        }}>
                          {record.status}
                        </span>
                      </div>

                      {/* Meta info & Action Buttons (Date, XP, View Details) */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            {dateStr} at {timeStr}
                          </span>
                          {record.xpAwarded > 0 && (
                            <span style={{
                              background: 'rgba(0, 245, 155, 0.18)',
                              color: '#00F59B',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '2px 7px',
                              borderRadius: '999px',
                              border: '1px solid rgba(0, 245, 155, 0.3)',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}>
                              +{record.xpAwarded} XP
                            </span>
                          )}
                        </div>

                        {machine && (
                          <button
                            onClick={() => onSelectMachine(machine, 'activity')}
                            style={{
                              background: 'rgba(0, 245, 155, 0.1)',
                              border: '1px solid rgba(0, 245, 155, 0.25)',
                              color: '#00F59B',
                              borderRadius: '8px',
                              padding: '3px 9px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              transition: 'all 0.15s',
                              flexShrink: 0
                            }}
                          >
                            View Details <ChevronRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ marginTop: '5px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: 1.4, display: 'block' }}>
                        {record.activityType === 'qr_scan' && 'Scan Method: QR Code Tag Scan'}
                        {record.activityType === 'photo_scan' && `Scan Method: Photo Vision (${formatConfidence(record.confidence)} Match)`}
                        {record.activityType === 'tutorial_viewed' && 'Action: Form & Safety Setup Guide Completed'}
                        {record.activityType === 'achievement_unlocked' && 'Milestone: Achievement Badge Unlocked'}
                        {cleanNotes && <span style={{ color: '#64748B' }}> — {cleanNotes}</span>}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State (Prompt 6 requirement) */
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              margin: '0 auto 1.25rem auto'
            }}>
              <History size={28} />
            </div>
            <h4 style={{ fontSize: '1.05rem', color: '#F1F5F9', marginBottom: '0.4rem', fontWeight: 700 }}>
              No activity yet. Scan your first machine to start your journey.
            </h4>
            <p style={{ fontSize: '0.84rem', color: '#94A3B8', maxWidth: '380px', margin: '0 auto 1.5rem auto', lineHeight: 1.4 }}>
              Point your camera at any gym QR sticker or take a photo of equipment to earn your first XP and unlock badges.
            </p>
            <button
              onClick={() => onNavigate('scan')}
              className="btn-primary"
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
            >
              <QrCode size={18} /> Scan Your First Machine
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
