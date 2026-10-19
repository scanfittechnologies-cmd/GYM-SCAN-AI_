import React from 'react';
import { useGym } from '../context/GymContext';
import { Machine } from '../types';
import { 
  Dumbbell,
  QrCode, 
  Upload, 
  Sparkles, 
  ArrowRight, 
  Shield, 
  ChevronRight
} from 'lucide-react';
import { MachineCard } from '../components/machines/MachineCard';

interface HomePageProps {
  onNavigate: (tab: string, scanMode?: string) => void;
  onSelectMachine: (machine: Machine) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectMachine }) => {
  const { 
    discoveredMachineIds, 
    machines,
    userProfile
  } = useGym();

  // Highlight specific beginner starter machines requested: Chest Press, Lat Pulldown, Leg Press, Seated Cable Row
  const starterMachineIds = ['seated-chest-press', 'lat-pulldown', '45-leg-press', 'seated-cable-row'];
  const discoverMachines = machines.filter(m => starterMachineIds.includes(m.id));
  // If some are not matched, fallback to first 4 machines
  const displayDiscoverMachines = discoverMachines.length === 4 ? discoverMachines : machines.slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Header Branding & Welcome Message (Hero Banner) */}
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
            Welcome back, <span style={{
              background: 'linear-gradient(90deg, #FFFFFF 20%, #00F59B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>{userProfile.displayName || 'Gym Explorer'}</span>.
          </h1>

          <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: 1.5, margin: 0 }}>
            Ready to train? Tap a scan mode below to instantly pull up setup guides and form cues.
          </p>
        </div>
      </div>

      {/* 2. Identify & Scan Equipment Action Launchpad */}
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

      {/* 3. Discover Machines Section */}
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

      {/* 4. Gym Safety & Educational Guidance Notice */}
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

