import React from 'react';
import { useGym } from '../context/GymContext';
import { Machine } from '../types';
import { 
  Dumbbell,
  QrCode, 
  Upload, 
  Sparkles, 
  Trophy, 
  CheckCircle, 
  Flame, 
  ArrowRight, 
  Shield, 
  Clock,
  Compass,
  Star,
  ChevronRight,
  Zap,
  Info,
  Layers,
  BookOpen,
  Camera
} from 'lucide-react';
import { MachineCard } from '../components/machines/MachineCard';

interface HomePageProps {
  onNavigate: (tab: string, scanMode?: string) => void;
  onSelectMachine: (machine: Machine) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectMachine }) => {
  const { 
    totalXP, 
    currentLevel, 
    discoveredMachineIds, 
    completedTutorialIds, 
    achievements,
    scanRecords,
    machines,
    userProfile,
    getMachineById
  } = useGym();

  // Highlight specific beginner starter machines requested: Chest Press, Lat Pulldown, Leg Press, Seated Cable Row
  const starterMachineIds = ['seated-chest-press', 'lat-pulldown', '45-leg-press', 'seated-cable-row'];
  const discoverMachines = machines.filter(m => starterMachineIds.includes(m.id));
  // If some are not matched, fallback to first 4 machines
  const displayDiscoverMachines = discoverMachines.length === 4 ? discoverMachines : machines.slice(0, 4);

  const recentScans = scanRecords.slice(0, 4);
  const unlockedBadgesCount = achievements.filter(a => a.unlocked).length;
  const achievementPercentage = Math.round((unlockedBadgesCount / achievements.length) * 100);

  // Utility function for clean confidence display
  const formatConfidence = (confidence?: number | null) => {
    if (confidence === undefined || confidence === null) return 'N/A';
    // If confidence is already a decimal like 0.95 or 0.35
    const percentage = confidence <= 1 ? confidence * 100 : confidence;
    return `${Math.round(percentage)}%`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Header Branding & Welcome Message */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(10, 14, 22, 0.98) 100%)',
        border: '1px solid rgba(0, 245, 155, 0.22)',
        borderRadius: '24px',
        padding: '2rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Ambient Glows */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 245, 155, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '20%',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 210, 255, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '680px' }}>
          
          {/* Top Logo & App Title Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #00F59B 0%, #00D2FF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#05140F',
              boxShadow: '0 0 12px rgba(0, 245, 155, 0.4)'
            }}>
              <Dumbbell size={18} strokeWidth={2.5} />
            </div>

            <div style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1rem',
              letterSpacing: '-0.01em',
              color: '#F1F5F9'
            }}>
              GYM SCAN <span style={{ color: '#00F59B' }}>AI</span>
            </div>

            <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
              <Sparkles size={11} /> Smart Gym Companion
            </span>
          </div>

          {/* Friendly Welcome Greeting */}
          <h1 style={{
            fontSize: 'clamp(1.75rem, 4.5vw, 2.4rem)',
            lineHeight: 1.15,
            marginBottom: '0.6rem',
            color: '#FFFFFF'
          }}>
            Welcome Back, <span style={{
              background: 'linear-gradient(90deg, #FFFFFF 20%, #00F59B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>{userProfile.displayName || 'Athlete'}</span>.
          </h1>

          <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            Never feel lost in the gym again. Point your camera at any machine to unlock instant seat adjustment guidance, form cues, and track your workout XP.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#CBD5E1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Zap size={15} color="#00F59B" />
              <span>Current Rank: <strong style={{ color: '#00F59B' }}>{currentLevel.title}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Flame size={15} color="#FFB800" />
              <span>XP Level: <strong style={{ color: '#FFB800' }}>Level {currentLevel.level}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four Statistics Cards Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#F1F5F9', margin: 0 }}>
              Activity & Progress Overview
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '2px 0 0 0' }}>
              Real-time exploration metrics from your gym sessions
            </p>
          </div>

          {/* Clearly marked Demo Data badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(0, 210, 255, 0.08)',
            border: '1px solid rgba(0, 210, 255, 0.25)',
            borderRadius: '999px',
            padding: '3px 10px',
            fontSize: '0.7rem',
            color: '#38BDF8',
            fontWeight: 600
          }}>
            <Info size={12} />
            <span>DEMO DATA • Local Cache Active</span>
          </div>
        </div>

        {/* 4 Responsive Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.85rem'
        }}>
          
          {/* Card 1: Total XP */}
          <div 
            onClick={() => onNavigate('achievements')}
            className="glass-card" 
            style={{ padding: '1.15rem', cursor: 'pointer', border: '1px solid rgba(0, 245, 155, 0.25)' }}
            title="Click to view XP Breakdown and Rank Badges"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#00F59B', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total XP
              </span>
              <Sparkles size={18} />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#F1F5F9', lineHeight: 1 }}>
              {totalXP} <span style={{ fontSize: '0.9rem', color: '#00F59B', fontWeight: 700 }}>XP</span>
            </div>
            <div style={{ fontSize: '0.73rem', color: '#94A3B8', marginTop: '6px' }}>
              Level {currentLevel.level} • {currentLevel.progressPercent}% to L{currentLevel.level + 1}
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '999px',
              overflow: 'hidden',
              marginTop: '6px'
            }}>
              <div style={{
                width: `${currentLevel.progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00F59B 0%, #00D2FF 100%)',
                borderRadius: '999px'
              }} />
            </div>
          </div>

          {/* Card 2: Unique Machines Scanned */}
          <div 
            onClick={() => onNavigate('library')}
            className="glass-card" 
            style={{ padding: '1.15rem', cursor: 'pointer', border: '1px solid rgba(56, 189, 248, 0.2)' }}
            title="Click to browse Machine Library"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#38BDF8', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Unique Scanned
              </span>
              <Compass size={18} />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#F1F5F9', lineHeight: 1 }}>
              {discoveredMachineIds.length} <span style={{ fontSize: '0.95rem', color: '#64748B', fontWeight: 500 }}>/ {machines.length}</span>
            </div>
            <div style={{ fontSize: '0.73rem', color: '#94A3B8', marginTop: '6px' }}>
              {Math.round((discoveredMachineIds.length / machines.length) * 100)}% Gym Equipment Mapped
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '999px',
              overflow: 'hidden',
              marginTop: '6px'
            }}>
              <div style={{
                width: `${Math.round((discoveredMachineIds.length / machines.length) * 100)}%`,
                height: '100%',
                background: '#38BDF8',
                borderRadius: '999px'
              }} />
            </div>
          </div>

          {/* Card 3: Tutorials Viewed */}
          <div 
            onClick={() => onNavigate('activity')}
            className="glass-card" 
            style={{ padding: '1.15rem', cursor: 'pointer', border: '1px solid rgba(255, 184, 0, 0.2)' }}
            title="Click to view Activity timeline"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#FFB800', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Tutorials Viewed
              </span>
              <CheckCircle size={18} />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#F1F5F9', lineHeight: 1 }}>
              {completedTutorialIds.length} <span style={{ fontSize: '0.95rem', color: '#64748B', fontWeight: 500 }}>Guides</span>
            </div>
            <div style={{ fontSize: '0.73rem', color: '#94A3B8', marginTop: '6px' }}>
              Form Guides Mastered (+5 XP each)
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '999px',
              overflow: 'hidden',
              marginTop: '6px'
            }}>
              <div style={{
                width: `${Math.min(100, (completedTutorialIds.length / machines.length) * 100)}%`,
                height: '100%',
                background: '#FFB800',
                borderRadius: '999px'
              }} />
            </div>
          </div>

          {/* Card 4: Current Achievement Progress */}
          <div 
            onClick={() => onNavigate('achievements')}
            className="glass-card" 
            style={{ padding: '1.15rem', cursor: 'pointer', border: '1px solid rgba(236, 72, 153, 0.2)' }}
            title="Click to view Badges and Achievements"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#EC4899', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Achievements
              </span>
              <Trophy size={18} />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#F1F5F9', lineHeight: 1 }}>
              {unlockedBadgesCount} <span style={{ fontSize: '0.95rem', color: '#64748B', fontWeight: 500 }}>/ {achievements.length}</span>
            </div>
            <div style={{ fontSize: '0.73rem', color: '#94A3B8', marginTop: '6px' }}>
              {achievementPercentage}% Badges Unlocked
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '999px',
              overflow: 'hidden',
              marginTop: '6px'
            }}>
              <div style={{
                width: `${achievementPercentage}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #EC4899 0%, #A855F7 100%)',
                borderRadius: '999px'
              }} />
            </div>
          </div>

        </div>
      </div>

      {/* 3. Two Large Action Buttons Below Statistics */}
      <div>
        <div style={{ marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', color: '#F1F5F9', margin: 0 }}>
            Identify & Scan Equipment
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '2px 0 0 0' }}>
            Choose your preferred scanning method below to load step-by-step guidance
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem'
        }}>
          {/* Button 1: Scan QR Code */}
          <button
            onClick={() => onNavigate('scan', 'qr')}
            style={{
              background: 'linear-gradient(135deg, rgba(0, 245, 155, 0.15) 0%, rgba(13, 22, 28, 0.95) 100%)',
              border: '1.5px solid rgba(0, 245, 155, 0.4)',
              borderRadius: '18px',
              padding: '1.25rem 1.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              cursor: 'pointer',
              textAlign: 'left',
              boxShadow: '0 8px 24px -6px rgba(0, 245, 155, 0.15)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="glass-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #00F59B 0%, #00D2B4 100%)',
                color: '#05140F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 14px rgba(0, 245, 155, 0.4)'
              }}>
                <QrCode size={26} strokeWidth={2.4} />
              </div>

              <div>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  lineHeight: 1.2
                }}>
                  Scan QR Code
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '3px', lineHeight: 1.3 }}>
                  Scan equipment sticker badge with camera
                </div>
              </div>
            </div>

            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(0, 245, 155, 0.12)',
              border: '1px solid rgba(0, 245, 155, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00F59B',
              flexShrink: 0
            }}>
              <ArrowRight size={18} />
            </div>
          </button>

          {/* Button 2: Upload Machine Photo */}
          <button
            onClick={() => onNavigate('scan', 'photo')}
            style={{
              background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.15) 0%, rgba(12, 19, 32, 0.95) 100%)',
              border: '1.5px solid rgba(0, 210, 255, 0.4)',
              borderRadius: '18px',
              padding: '1.25rem 1.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              cursor: 'pointer',
              textAlign: 'left',
              boxShadow: '0 8px 24px -6px rgba(0, 210, 255, 0.15)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="glass-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #00D2FF 0%, #0088FF 100%)',
                color: '#05140F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 14px rgba(0, 210, 255, 0.4)'
              }}>
                <Upload size={24} strokeWidth={2.4} />
              </div>

              <div>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  lineHeight: 1.2
                }}>
                  Upload Machine Photo
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '3px', lineHeight: 1.3 }}>
                  Identify equipment with AI vision analyzer
                </div>
              </div>
            </div>

            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(0, 210, 255, 0.12)',
              border: '1px solid rgba(0, 210, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00D2FF',
              flexShrink: 0
            }}>
              <ArrowRight size={18} />
            </div>
          </button>
        </div>
      </div>

      {/* 4. Recent Activity Section */}
      <div className="glass-card" style={{ padding: '1.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Clock size={18} color="#00F59B" />
            <h3 style={{ fontSize: '1.05rem', color: '#F1F5F9', margin: 0 }}>
              Recent Activity
            </h3>
            <span className="badge badge-muted" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
              {scanRecords.length} Logged
            </span>
          </div>

          <button
            onClick={() => onNavigate('activity')}
            className="btn-ghost"
            style={{ fontSize: '0.82rem', color: '#38BDF8', fontWeight: 600 }}
          >
            Full Activity Log <ArrowRight size={14} />
          </button>
        </div>

        {recentScans.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {recentScans.map((scan) => {
              const machine = scan.machineId ? getMachineById(scan.machineId) : undefined;
              const scanDate = new Date(scan.timestamp);
              const formattedDate = scanDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
              const formattedTime = scanDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const scanType = scan.scanMethod || 'qr';

              return (
                <div
                  key={scan.id}
                  onClick={() => machine && onSelectMachine(machine)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: machine ? 'pointer' : 'default',
                    transition: 'all 0.15s ease',
                    gap: '0.75rem'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    {/* Method Icon */}
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: scanType === 'qr' ? 'rgba(0, 245, 155, 0.15)' : 'rgba(0, 210, 255, 0.15)',
                      border: scanType === 'qr' ? '1px solid rgba(0, 245, 155, 0.3)' : '1px solid rgba(0, 210, 255, 0.3)',
                      color: scanType === 'qr' ? '#00F59B' : '#00D2FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {scanType === 'qr' ? <QrCode size={16} /> : <Upload size={16} />}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F1F5F9' }}>
                          {scan.machineName}
                        </span>
                        {scan.machineCategory && (
                          <span className="badge badge-muted" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                            {scan.machineCategory}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                        <span>Scanned {formattedDate} at {formattedTime} •</span>
                        <span className="text-xs text-slate-400">
                          {scan.scanMethod === 'qr' 
                            ? 'QR Badge Verified' 
                            : `AI Photo (${formatConfidence(scan.confidence)} match)`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* XP Earned & View Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    {scan.xpAwarded > 0 ? (
                      <span style={{
                        background: 'rgba(0, 245, 155, 0.12)',
                        color: '#00F59B',
                        border: '1px solid rgba(0, 245, 155, 0.25)',
                        borderRadius: '999px',
                        padding: '2px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 800
                      }}>
                        +{scan.xpAwarded} XP
                      </span>
                    ) : (
                      <span style={{
                        background: 'rgba(100, 116, 139, 0.12)',
                        color: '#64748B',
                        border: '1px solid rgba(100, 116, 139, 0.2)',
                        borderRadius: '999px',
                        padding: '2px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}>
                        Repeat
                      </span>
                    )}
                    <ChevronRight size={15} color="#64748B" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div style={{
            textAlign: 'center',
            padding: '2rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '14px',
            border: '1px dashed rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              margin: '0 auto 0.75rem auto'
            }}>
              <Clock size={22} />
            </div>
            <h4 style={{ fontSize: '1rem', color: '#F1F5F9', marginBottom: '0.35rem' }}>
              No Recent Scans Recorded
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', maxWidth: '340px', margin: '0 auto 1.25rem auto', lineHeight: 1.4 }}>
              Scan equipment QR codes or snap photos during your workout to log your gym discovery journey.
            </p>
            <button
              onClick={() => onNavigate('library')}
              className="btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem' }}
            >
              <BookOpen size={16} /> Explore Machine Library
            </button>
          </div>
        )}
      </div>

      {/* 5. Discover Machines Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
                Featured Equipment
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', color: '#F1F5F9', margin: '3px 0 0 0' }}>
              Discover Machines
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '2px 0 0 0' }}>
              Key compound equipment recommended for beginner strength workouts (Chest Press, Lat Pulldown, Leg Press, Cable Row)
            </p>
          </div>

          <button
            onClick={() => onNavigate('library')}
            className="btn-primary"
            style={{ fontSize: '0.82rem', padding: '0.55rem 1.1rem' }}
          >
            View Machine Library ({machines.length}) <ChevronRight size={14} />
          </button>
        </div>

        {/* Grid of Starter Machine Cards */}
        <div className="grid-cards">
          {displayDiscoverMachines.map((machine) => (
            <MachineCard
              key={machine.id}
              machine={{
                ...machine,
                isDiscovered: discoveredMachineIds.includes(machine.id)
              }}
              onSelect={onSelectMachine}
            />
          ))}
        </div>
      </div>

      {/* 6. Gym Safety & Educational Guidance Notice */}
      <div style={{
        background: 'rgba(255, 184, 0, 0.05)',
        border: '1px solid rgba(255, 184, 0, 0.22)',
        borderRadius: '18px',
        padding: '1.15rem 1.35rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.9rem'
      }}>
        <Shield size={22} color="#FFB800" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: 1.45 }}>
          <strong style={{ color: '#FFB800' }}>Educational Orientation Only:</strong> Gym Scan AI provides orientation and general setup cues for fitness equipment. It does not replace guidance from certified fitness professionals. Always start with light weights to test seat positioning, and never hesitate to ask gym floor staff for assistance.
        </div>
      </div>

    </div>
  );
};
