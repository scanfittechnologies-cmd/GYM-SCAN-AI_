import React, { useState } from 'react';
import {
  Dumbbell,
  QrCode,
  BookOpen,
  Trophy,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle,
  Camera,
  History,
  Layers,
  Target,
  FileSearch,
  Scan,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { MACHINES_DATABASE } from '../data/machines';
import { getMachinePhotos } from '../data/machinePhotos';

interface LandingPageProps {
  onNavigate: (tab: string, mode?: string) => void;
  onSelectMachine?: (machine: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectMachine }) => {
  const [activeHeroTab, setActiveHeroTab] = useState<'chest' | 'lat' | 'leg' | 'cable'>('chest');
  const [heroImgError, setHeroImgError] = useState(false);

  // Selected featured preview machines matching user request
  const featuredMachineIds = [
    'seated-chest-press',
    'lat-pulldown',
    'leg-press-45',
    'cable-crossover',
  ];

  const previewMachines = MACHINES_DATABASE.filter((m) =>
    featuredMachineIds.includes(m.id)
  );

  // Hero showcase equipment items
  const heroShowcaseItems = [
    {
      id: 'chest',
      machineId: 'seated-chest-press',
      name: 'Chest Press Machine',
      category: 'Chest',
      tag: 'Pin-Loaded',
      photoUrl: '/machines/seated-chest-press.jpg',
      muscles: 'Pectoralis Major, Anterior Deltoid',
    },
    {
      id: 'lat',
      machineId: 'lat-pulldown',
      name: 'Lat Pulldown Machine',
      category: 'Back',
      tag: 'Cable / Pin-Loaded',
      photoUrl: '/machines/lat-pulldown.jpg',
      muscles: 'Latissimus Dorsi, Biceps Brachii',
    },
    {
      id: 'leg',
      machineId: 'leg-press-45',
      name: 'Leg Press Machine (45°)',
      category: 'Legs',
      tag: 'Plate-Loaded',
      photoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1000&auto=format&fit=crop&q=75',
      muscles: 'Quadriceps, Glutes, Hamstrings',
    },
    {
      id: 'cable',
      machineId: 'cable-crossover',
      name: 'Cable Crossover Station',
      category: 'Chest / Arms',
      tag: 'Dual Cable Pulley',
      photoUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1000&auto=format&fit=crop&q=75',
      muscles: 'Pectorals, Deltoids, Core',
    },
  ];

  const activeHeroItem = heroShowcaseItems.find((item) => item.id === activeHeroTab) || heroShowcaseItems[0];

  // Feature grid cards
  const FEATURE_CARDS = [
    {
      title: "Scan & Identify",
      desc: "Point your camera or upload an equipment photo for instant identification.",
      icon: Camera,
      path: "/scan"
    },
    {
      title: "Machine Tutorials",
      desc: "Access step-by-step seat adjustment, grip positioning, and safety cues.",
      icon: BookOpen,
      path: "/library"
    },
    {
      title: "Activity Tracking",
      desc: "Keep a clean timeline of all your scanned equipment and completed exercises.",
      icon: History,
      path: "/activity"
    },
    {
      title: "XP & Achievements",
      desc: "Earn XP milestones and unlock achievement badges as you build gym confidence.",
      icon: Trophy,
      path: "/achievements"
    }
  ];

  // 3 Steps Requirement for realistic scanning flow
  const workflowSteps = [
    {
      step: '01',
      title: 'Scan or Upload a Machine',
      desc: 'Use your smartphone camera to scan a QR code badge or upload a clear photo of the equipment.',
      color: '#00F59B',
      icon: Scan,
    },
    {
      step: '02',
      title: 'Identify the Equipment',
      desc: 'View verified machine specs, primary muscle groups, brand details, and equipment type.',
      color: '#00D2FF',
      icon: FileSearch,
    },
    {
      step: '03',
      title: 'Learn Setup & Exercises',
      desc: 'Follow step-by-step seat adjustment, grip positioning, motion guidance, and safety reminders.',
      color: '#A855F7',
      icon: Target,
    },
  ];

  const handleMachineClick = (machine: any) => {
    if (onSelectMachine) {
      onSelectMachine(machine);
    } else {
      onNavigate('library');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* 1. HERO SECTION REDESIGN */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: 'clamp(2rem, 4vw, 3.5rem) 1.25rem clamp(2.5rem, 5vw, 4rem)',
          background: 'linear-gradient(180deg, rgba(0, 245, 155, 0.05) 0%, rgba(10, 12, 16, 0.95) 100%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '700px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(0, 245, 155, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: '-80px',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(0, 210, 255, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1240px', margin: '0 auto' }}>
          {/* Main Grid: Content Left, Realistic Visual Right */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
            }}
          >
            {/* Hero Left Content */}
            <div style={{ textAlign: 'left' }}>
              {/* Replace old badge text */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide"
                style={{ marginBottom: '1.25rem' }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ⚡ AI Vision Online · 50+ Gym Machines Supported
              </div>

              <h1
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 900,
                  fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  marginBottom: '1.15rem',
                  color: '#FFFFFF',
                }}
              >
                Know Your Machine.{' '}
                <span
                  style={{
                    background: 'linear-gradient(90deg, #00F59B 0%, #00D2FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Train With Confidence.
                </span>
              </h1>

              <p
                style={{
                  fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
                  color: '#94A3B8',
                  lineHeight: 1.6,
                  maxWidth: '560px',
                  marginBottom: '1.85rem',
                }}
              >
                Instantly identify commercial gym equipment, master seat setup adjustments, and follow clear exercise form guidance right on the gym floor.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <button
                  id="landing-scan-machine-btn"
                  onClick={() => onNavigate('scan')}
                  className="btn-primary"
                  style={{ fontSize: '0.98rem', padding: '0.85rem 1.8rem', borderRadius: '14px', fontWeight: 800 }}
                >
                  <QrCode size={18} /> Scan a Machine
                </button>

                <button
                  id="landing-explore-machines-btn"
                  onClick={() => onNavigate('library')}
                  className="btn-secondary"
                  style={{ fontSize: '0.98rem', padding: '0.85rem 1.8rem', borderRadius: '14px', fontWeight: 700 }}
                >
                  <BookOpen size={18} /> Explore Machines
                </button>
              </div>

              {/* Trust Indicators */}
              <div
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                  fontSize: '0.82rem',
                  color: '#64748B',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  paddingTop: '1.25rem',
                }}
              >
                {[
                  'No account required',
                  'Free beginner companion',
                  'Educational setup guidance',
                ].map((text, idx) => (
                  <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8' }}>
                    <CheckCircle size={14} color="#00F59B" /> {text}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero Right Visual: High-Quality Gym Equipment Showcase */}
            <div style={{ position: 'relative' }}>
              <div
                className="glass-panel"
                style={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(0,245,155,0.08)',
                  background: 'linear-gradient(145deg, #131926 0%, #0B0E17 100%)',
                }}
              >
                {/* Equipment Selector Tabs */}
                <div
                  style={{
                    display: 'flex',
                    background: 'rgba(0,0,0,0.4)',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    padding: '6px',
                    gap: '4px',
                    overflowX: 'auto',
                  }}
                >
                  {heroShowcaseItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveHeroTab(item.id as any);
                        setHeroImgError(false);
                      }}
                      style={{
                        flex: 1,
                        minWidth: '85px',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: activeHeroTab === item.id ? '1px solid rgba(0, 245, 155, 0.4)' : '1px solid transparent',
                        background: activeHeroTab === item.id ? 'rgba(0, 245, 155, 0.12)' : 'transparent',
                        color: activeHeroTab === item.id ? '#00F59B' : '#94A3B8',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {item.name.split(' ')[0]} {item.name.split(' ')[1] || ''}
                    </button>
                  ))}
                </div>

                {/* Machine Photo Container */}
                <div
                  style={{
                    position: 'relative',
                    height: '320px',
                    background: 'radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {!heroImgError ? (
                    <img
                      src={activeHeroItem.photoUrl}
                      alt={activeHeroItem.name}
                      onError={() => setHeroImgError(true)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        display: 'block',
                      }}
                      loading="eager"
                    />
                  ) : (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '1.5rem',
                        color: '#94A3B8',
                      }}
                    >
                      <Dumbbell size={40} color="#00F59B" style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{activeHeroItem.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>[ Reference Equipment Visual ]</div>
                    </div>
                  )}

                  {/* Gradient Scrim */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(11, 14, 23, 0.95) 0%, rgba(11, 14, 23, 0.2) 60%, transparent 100%)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Top Floating Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(10, 14, 22, 0.82)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(0, 245, 155, 0.35)',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#00F59B',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <ShieldCheck size={13} /> Authentic Gym Hardware
                  </div>

                  {/* Bottom Overlay Info */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '14px',
                      left: '14px',
                      right: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      zIndex: 2,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                        {activeHeroItem.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#CBD5E1', marginTop: '2px' }}>
                        Targets: <span style={{ color: '#00D2FF' }}>{activeHeroItem.muscles}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('library')}
                      style={{
                        background: 'rgba(0, 245, 155, 0.15)',
                        border: '1px solid rgba(0, 245, 155, 0.35)',
                        color: '#00F59B',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        flexShrink: 0,
                      }}
                    >
                      Inspect <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sleeker compact banner */}
      <div style={{ padding: '0 1.25rem' }}>
        <div className="max-w-4xl mx-auto my-8 px-4 py-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-semibold">ℹ️ Note:</span>
            <span>Photo identification & equipment guides provide general educational guidance for commercial gym setups.</span>
          </div>
        </div>
      </div>

      {/* 2. REALISTIC GYM APP FEEL (SCANNING WORKFLOW PREVIEW) */}
      <section style={{ padding: '0 1.25rem 3.5rem 1.25rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="badge badge-emerald" style={{ marginBottom: '0.6rem' }}>
              <Zap size={12} /> Simple 3-Step Workflow
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)',
                fontWeight: 800,
                color: '#F1F5F9',
                margin: '0.3rem 0 0.5rem 0',
              }}
            >
              Designed for Quick Floor Guidance
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#94A3B8', maxWidth: '540px', margin: '0 auto' }}>
              No complicated manuals or awkward guessing. Get immediate setup clarity in three simple steps.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {workflowSteps.map((item, idx) => {
              const StepIcon = item.icon;
              return (
                <div
                  key={idx}
                  className="glass-card"
                  style={{
                    padding: '1.5rem',
                    position: 'relative',
                    border: '1px solid rgba(255,255,255,0.09)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1.8rem',
                        fontWeight: 900,
                        color: item.color,
                        lineHeight: 1,
                      }}
                    >
                      {item.step}
                    </span>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: `${item.color}15`,
                        border: `1px solid ${item.color}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.color,
                      }}
                    >
                      <StepIcon size={20} />
                    </div>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: '#F1F5F9',
                      marginBottom: '0.45rem',
                    }}
                  >
                    {item.title}
                  </h3>

                  <p style={{ fontSize: '0.84rem', color: '#94A3B8', lineHeight: 1.5, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. FEATURE CARDS REDESIGN */}
      <section style={{ padding: '0 1.25rem 3.5rem 1.25rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
            <span className="badge badge-blue" style={{ marginBottom: '0.65rem' }}>
              <Layers size={12} /> Core Features
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
                fontWeight: 800,
                color: '#F1F5F9',
                margin: '0.4rem 0 0.5rem 0',
              }}
            >
              Everything You Need at the Gym
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#94A3B8', maxWidth: '520px', margin: '0 auto' }}>
              Practical, fitness-focused tools to increase training clarity and safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {FEATURE_CARDS.map((card, index) => {
              const CardIcon = card.icon;
              return (
                <div 
                  key={index} 
                  role="button"
                  tabIndex={0}
                  onClick={() => onNavigate(card.path.replace(/^\//, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onNavigate(card.path.replace(/^\//, ''));
                    }
                  }}
                  className="group relative p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-emerald-500/10 text-left"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-800 group-hover:bg-emerald-500/10 text-emerald-400 transition-colors">
                      <CardIcon className="w-6 h-6" size={24} />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-emerald-400 transition-colors">
                      Explore →
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. REALISTIC MACHINE PREVIEW SECTION */}
      <section
        style={{
          padding: '3.5rem 1.25rem',
          background: 'linear-gradient(180deg, rgba(0, 245, 155, 0.03) 0%, rgba(17, 20, 28, 0.4) 100%)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>
                <Dumbbell size={12} /> Database Spotlights
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
                  fontWeight: 800,
                  color: '#F1F5F9',
                  margin: '0.2rem 0 0.2rem 0',
                }}
              >
                Explore Real Gym Equipment
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#94A3B8', margin: 0 }}>
                Verified equipment specifications, setup guidelines, and target muscle maps.
              </p>
            </div>

            <button
              onClick={() => onNavigate('library')}
              className="btn-secondary"
              style={{ fontSize: '0.84rem', padding: '0.6rem 1.2rem', borderRadius: '10px' }}
            >
              View Full Library ({MACHINES_DATABASE.length} Machines) <ArrowRight size={14} />
            </button>
          </div>

          {/* 4 Machine Preview Cards with visually distinct real Unsplash equipment images */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {previewMachines.map((machine) => {
              const photos = getMachinePhotos(machine.id);
              const displayImage = machine.frontReferenceImage || photos?.front;

              return (
                <div
                  key={machine.id}
                  className="glass-card"
                  onClick={() => handleMachineClick(machine)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {/* Photo container */}
                  <div
                    style={{
                      position: 'relative',
                      height: '180px',
                      background: 'radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)',
                      overflow: 'hidden',
                    }}
                  >
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={machine.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        style={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#64748B',
                          fontSize: '0.75rem',
                        }}
                      >
                        Photo Pending Verification
                      </div>
                    )}

                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.1) 60%, transparent 100%)',
                      }}
                    />

                    {/* Category Pill */}
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        background: 'rgba(0, 245, 155, 0.2)',
                        border: '1px solid rgba(0, 245, 155, 0.4)',
                        color: '#00F59B',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        backdropFilter: 'blur(6px)',
                      }}
                    >
                      {machine.category}
                    </span>

                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(10, 14, 22, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#94A3B8',
                        fontSize: '0.62rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {machine.qrCodeId}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div
                    style={{
                      padding: '1.1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      flex: 1,
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: '#F1F5F9',
                          marginBottom: '0.3rem',
                        }}
                      >
                        {machine.name}
                      </h3>

                      <div style={{ fontSize: '0.75rem', color: '#00D2FF', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Primary: {machine.primaryMuscles[0]?.split('(')[0] || machine.category}
                      </div>

                      <p
                        style={{
                          fontSize: '0.8rem',
                          color: '#94A3B8',
                          lineHeight: 1.4,
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {machine.tagline || machine.description}
                      </p>
                    </div>

                    <div
                      style={{
                        marginTop: '1rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        {machine.equipmentType}
                      </span>

                      <button
                        className="btn-ghost"
                        style={{
                          background: 'rgba(0,245,155,0.1)',
                          color: '#00F59B',
                          border: '1px solid rgba(0,245,155,0.25)',
                          borderRadius: '8px',
                          padding: '4px 10px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        View Machine <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. SAFETY REMINDER */}
      <section style={{ padding: '2.5rem 1.25rem' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div
            style={{
              background: 'rgba(255, 184, 0, 0.05)',
              border: '1px solid rgba(255, 184, 0, 0.22)',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.9rem',
            }}
          >
            <Shield size={22} color="#FFB800" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.84rem', color: '#CBD5E1', lineHeight: 1.5 }}>
              <strong style={{ color: '#FFB800', display: 'block', marginBottom: '3px' }}>
                Safety & Exercise Disclaimer
              </strong>
              Camera & photo machine identification can misidentify equipment under low lighting or obscured angles. Always confirm the machine title on the physical unit frame and consult a certified trainer if you are unsure of your seat adjustments or weight pin loading.
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        style={{
          padding: '3.5rem 1.25rem 4.5rem 1.25rem',
          textAlign: 'center',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0, 245, 155, 0.05) 100%)',
        }}
      >
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #00F59B 0%, #00D2FF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#05140F',
              margin: '0 auto 1.25rem auto',
              boxShadow: '0 0 35px rgba(0, 245, 155, 0.3)',
            }}
          >
            <Dumbbell size={32} strokeWidth={2.5} />
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)',
              fontWeight: 900,
              color: '#F1F5F9',
              marginBottom: '0.65rem',
              letterSpacing: '-0.02em',
            }}
          >
            Ready to Start Training?
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#94A3B8', marginBottom: '1.75rem', lineHeight: 1.5 }}>
            Scan a QR code badge, upload a machine photo, or browse our complete exercise database.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              id="landing-final-cta-btn"
              onClick={() => onNavigate('scan')}
              className="btn-primary"
              style={{ fontSize: '0.95rem', padding: '0.85rem 1.75rem', borderRadius: '14px', fontWeight: 800 }}
            >
              <QrCode size={18} /> Scan a Machine
            </button>
            <button
              id="landing-view-library-btn"
              onClick={() => onNavigate('library')}
              className="btn-secondary"
              style={{ fontSize: '0.95rem', padding: '0.85rem 1.75rem', borderRadius: '14px' }}
            >
              <BookOpen size={18} /> Browse Machine Library
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '1.5rem 1.25rem',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: '#475569',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Dumbbell size={14} color="#00F59B" />
          <span style={{ fontWeight: 700, color: '#64748B' }}>Gym Scan AI</span>
          <span>&mdash; Educational Gym Equipment Companion</span>
        </div>
        <div>Demo mode active &middot; All data stored locally in browser</div>
        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.2rem' }}>
          {[
            ['pricing', 'Pricing'],
            ['home', 'Dashboard'],
            ['library', 'Machine Library'],
          ].map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => onNavigate(tab)}
              style={{
                background: 'none',
                border: 'none',
                color: '#475569',
                cursor: 'pointer',
                fontSize: '0.78rem',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
};
