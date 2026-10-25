import React, { useState, useRef, useEffect } from 'react';
import { Machine, MachineExercise } from '../types';
import { useGym } from '../context/GymContext';
import { 
  ArrowLeft, 
  Star, 
  CheckCircle, 
  AlertTriangle, 
  Dumbbell, 
  Info, 
  QrCode, 
  Flag, 
  Sparkles, 
  ChevronRight, 
  Award, 
  BookOpen, 
  Camera, 
  RotateCcw, 
  Sliders, 
  CheckCircle2, 
  HelpCircle, 
  ExternalLink
} from 'lucide-react';
import { MachineImageGallery } from '../components/machines/MachineImageGallery';
import { InteractiveTutorialModal } from '../components/machines/InteractiveTutorialModal';
import { ExerciseDetailModal } from '../components/machines/ExerciseDetailModal';
import { ReportModal } from '../components/machines/ReportModal';
import { MachineSvgIllustration } from '../components/machines/MachineSvgIllustrations';
import { getExercisesForMachine } from '../data/machineExercises';
import { useSoftGate } from '../hooks/useSoftGate';

// Feature flag: set to true to re-enable the interactive guide button & modal
const SHOW_START_GUIDE = false;

interface MachineDetailPageProps {
  machine: Machine | null;
  source?: 'qr' | 'photo' | 'library' | 'activity';
  onBack: () => void;
  onNavigate?: (tab: string) => void;
  onSelectMachine?: (machine: Machine, source?: 'qr' | 'photo' | 'library' | 'activity') => void;
}

export const MachineDetailPage: React.FC<MachineDetailPageProps> = ({ 
  machine, 
  source = 'library',
  onBack,
  onNavigate,
  onSelectMachine
}) => {
  const { 
    machines,
    isMachineDiscovered, 
    isTutorialCompleted, 
    isFavorite, 
    toggleFavorite 
  } = useGym();

  const { requireAuth } = useSoftGate();
  const [activeTab, setActiveTab] = useState<'overview' | 'adjustments' | 'exercises' | 'mistakes'>('overview');
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<MachineExercise | null>(null);

  // Scroll to top and reset tab whenever machine changes
  useEffect(() => {
    if (machine?.id) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      setActiveTab('overview');
    }
  }, [machine?.id]);

  // Missing or Incomplete Machine state
  if (!machine) {
    return (
      <div className="glass-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', maxWidth: '500px', margin: '2rem auto' }}>
        <AlertTriangle size={48} color="#FF6B81" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '1.3rem', color: '#F1F5F9', marginBottom: '0.5rem' }}>
          Equipment Information Not Found
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1.5rem' }}>
          Information for this machine is still being reviewed.
        </p>
        <button onClick={onBack} className="btn-primary">
          <ArrowLeft size={16} /> Return to Machine Library
        </button>
      </div>
    );
  }

  const favorited = isFavorite(machine.id);
  const tutorialDone = isTutorialCompleted(machine.id);

  // Check if machine info is complete
  const isInfoComplete = Boolean(
    machine.name && 
    machine.description && 
    machine.primaryMuscles && 
    machine.primaryMuscles.length > 0 &&
    machine.setupInstructions && 
    machine.setupInstructions.length > 0
  );

  // Resolve exercises for this machine
  const exercises = machine.exercises && machine.exercises.length > 0
    ? machine.exercises
    : getExercisesForMachine(machine.id, machine.name, machine.category);

  // Find related machines in the same category or target area
  const relatedMachines = machines.filter(m => m.id !== machine.id && (m.category === machine.category || m.difficulty === machine.difficulty)).slice(0, 3);

  // Source badge text helper
  const getSourceBadge = () => {
    switch (source) {
      case 'qr':
        return { label: 'Identified via QR Scan', icon: QrCode, color: '#00F59B' };
      case 'photo':
        return { label: 'Identified via AI Vision', icon: Camera, color: '#00D2FF' };
      case 'activity':
        return { label: 'Opened from Activity Log', icon: RotateCcw, color: '#FFB800' };
      default:
        return { label: 'Machine Library Entry', icon: BookOpen, color: '#94A3B8' };
    }
  };

  const sourceBadge = getSourceBadge();
  const SourceIcon = sourceBadge.icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '860px', margin: '0 auto' }}>
      
      {/* Incomplete info notice if review is pending */}
      {!isInfoComplete && (
        <div style={{
          background: 'rgba(255, 184, 0, 0.1)',
          border: '1px solid rgba(255, 184, 0, 0.3)',
          borderRadius: '14px',
          padding: '0.85rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#FFB800',
          fontSize: '0.85rem'
        }}>
          <Info size={18} style={{ flexShrink: 0 }} />
          <span>Information for this machine is still being reviewed. Basic orientation guide shown below.</span>
        </div>
      )}

      {/* 1. Navigation & Top Control Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary"
          style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Identification Source Badge */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '999px',
            padding: '4px 10px',
            fontSize: '0.72rem',
            color: sourceBadge.color,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontWeight: 600
          }}>
            <SourceIcon size={12} />
            <span>{sourceBadge.label}</span>
          </div>

          {/* Favorite Routine Toggle */}
          <button
            type="button"
            onClick={() => requireAuth(
              () => toggleFavorite(machine.id),
              'Create a free account to save your favorite machines and build your workout routine!'
            )}
            style={{
              background: favorited ? 'rgba(255, 184, 0, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: favorited ? '1px solid rgba(255, 184, 0, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '0.45rem 0.85rem',
              color: favorited ? '#FFB800' : '#CBD5E1',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem',
              transition: 'all 0.15s'
            }}
          >
            <Star size={15} fill={favorited ? '#FFB800' : 'none'} />
            {favorited ? 'Saved' : 'Save'}
          </button>

          {/* Report Incorrect Info Button */}
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '0.45rem 0.75rem',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              fontSize: '0.78rem'
            }}
          >
            <Flag size={14} /> Report
          </button>
        </div>
      </div>

      {/* 2. Machine Header & Image Gallery Showcase */}
      <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          alignItems: 'center'
        }}>
          {/* Gallery Component */}
          <MachineImageGallery machine={machine} />

          {/* Machine Header Metadata */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span className="badge badge-emerald">
                {machine.category}
              </span>
              <span className="badge badge-blue">
                {machine.equipmentType}
              </span>
              <span className="badge badge-purple">
                {machine.difficulty} Level
              </span>
            </div>

            {/* 1. Machine Name */}
            <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', color: '#F1F5F9', margin: 0, lineHeight: 1.2 }}>
              {machine.name}
            </h1>

            {/* 2. What the machine is used for */}
            <div>
              <div style={{ fontSize: '0.75rem', color: '#00F59B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>
                Primary Purpose
              </div>
              <p style={{ fontSize: '0.88rem', color: '#CBD5E1', lineHeight: 1.45, margin: 0 }}>
                {machine.description}
              </p>
            </div>

            {/* 3. Target Muscle Groups */}
            <div style={{ marginTop: '0.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '4px', fontWeight: 600 }}>
                Target Muscle Groups:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {machine.primaryMuscles.map((muscle, idx) => (
                  <span key={idx} style={{
                    background: 'rgba(0, 245, 155, 0.12)',
                    color: '#00F59B',
                    border: '1px solid rgba(0, 245, 155, 0.25)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    🎯 {muscle}
                  </span>
                ))}
                {machine.secondaryMuscles && machine.secondaryMuscles.map((muscle, idx) => (
                  <span key={`sec-${idx}`} style={{
                    background: 'rgba(0, 210, 255, 0.08)',
                    color: '#38BDF8',
                    border: '1px solid rgba(0, 210, 255, 0.2)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}>
                    {muscle}
                  </span>
                ))}
              </div>
            </div>

            {/* Launch Tutorial Action */}
            {SHOW_START_GUIDE && (
              <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowTutorialModal(true)}
                  className="btn-primary"
                  style={{ flex: 1, minWidth: '180px', padding: '0.75rem 1.1rem', fontSize: '0.88rem' }}
                >
                  {tutorialDone ? (
                    <>
                      <CheckCircle size={16} /> Revisit Interactive Guide
                    </>
                  ) : (
                    <>
                      <Award size={16} /> Start Guide (+5 XP)
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs for Specific Sections */}
      <div>
        <div 
          className="w-full max-w-full overflow-x-auto no-scrollbar flex items-center snap-x scroll-smooth py-1"
          style={{
            gap: '0.4rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '0.5rem',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
          }}
        >
          {[
            { id: 'overview', label: 'Step-by-Step Usage' },
            { id: 'adjustments', label: 'Machine Adjustments' },
            { id: 'exercises', label: `Exercises (${exercises.length})` },
            { id: 'mistakes', label: 'Common Mistakes & Injury Prevention' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className="snap-start shrink-0"
                style={{
                  background: isActive ? 'rgba(0, 245, 155, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? '#00F59B' : '#94A3B8',
                  border: isActive ? '1px solid rgba(0, 245, 155, 0.35)' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div style={{ marginTop: '1.25rem' }}>
          
          {/* 5. STEP-BY-STEP USAGE INSTRUCTIONS — Visual Action Card Grid */}
          {activeTab === 'overview' && (() => {
            // Helper to generate machine/category tailored Stage 4 (Execute) fallback
            const getCategoryTailoredExecution = (category: string, primaryMuscles: string[] = [], name: string = '') => {
              const cat = (category || '').toLowerCase();
              const muscles = (primaryMuscles || []).join(' ').toLowerCase();
              const n = (name || '').toLowerCase();

              // 1. Chest & Shoulders -> Pressing cues & elbow angle warnings
              if (cat.includes('chest') || muscles.includes('pectoral') || cat.includes('shoulder') || muscles.includes('deltoid')) {
                return {
                  title: 'Press & Protect Rotator Cuffs',
                  description: 'Press firmly through palms in a converging arc without locking elbows harshly; keep wrists rigid and maintain a 45–60° elbow angle to torso to safeguard shoulder joints.'
                };
              }

              // 2. Back & Lats -> Pulling cues, elbow drive & scapular squeeze
              if (cat.includes('back') || muscles.includes('lat') || muscles.includes('rhomboid') || muscles.includes('trapezius')) {
                return {
                  title: 'Drive Elbows & Squeeze Scapulae',
                  description: 'Lead the movement by driving elbows downward and back toward ribs; squeeze shoulder blades together for 1s at peak contraction and resist over 3s.'
                };
              }

              // 3. Legs -> Foot placement, joint lockout safety & range of motion
              if (cat.includes('leg') || muscles.includes('quad') || muscles.includes('hamstring') || muscles.includes('glute') || muscles.includes('calf')) {
                return {
                  title: 'Midfoot Drive & Joint Protection',
                  description: 'Drive through midfoot and heels through a controlled 90° range of motion; never violently hyperextend or lock knees at top and maintain knee-toe alignment.'
                };
              }

              // 4. Arms (Biceps/Triceps) -> Isolation cues & fixed pivot points
              if (cat.includes('arm') || muscles.includes('bicep') || muscles.includes('tricep') || n.includes('curl') || n.includes('extension') || n.includes('dip')) {
                return {
                  title: 'Fixed Pivots & Peak Squeeze',
                  description: 'Pin your elbows firmly in place as fixed pivot points; squeeze target biceps or triceps intensely for 1 full second at peak contraction and resist momentum on reset.'
                };
              }

              // 5. Cardio -> Cadence pacing, posture & gradual ramp up
              if (cat.includes('cardio') || n.includes('treadmill') || n.includes('bike') || n.includes('rower') || n.includes('climber')) {
                return {
                  title: 'Cadence Flow & Posture Ramp',
                  description: 'Maintain tall upright spine and relaxed shoulders; begin at a light baseline pace and gradually ramp up speed and resistance while synchronizing breathing cycles.'
                };
              }

              // 6. Core -> Ribs-to-pelvis flexion & isometric hold
              if (cat.includes('core') || muscles.includes('abdominis') || muscles.includes('oblique')) {
                return {
                  title: 'Rib-to-Pelvis Flexion & Hold',
                  description: 'Exhale and curl your ribcage down toward your pelvic line strictly using abdominal flexion; hold the peak contraction for 2s without straining your neck.'
                };
              }

              return {
                title: 'Controlled Execution & Squeeze',
                description: 'Initiate deliberate muscular contraction through full range of motion; pause for 1s at peak tension and control the 3-second negative return under active control.'
              };
            };

            const categoryExec = getCategoryTailoredExecution(machine.category, machine.primaryMuscles, machine.name);

            // Resolve steps dynamically with category-tailored graceful fallback
            const displaySteps = machine.steps && machine.steps.length > 0
              ? machine.steps.map((step, idx) => {
                  // If stage 4 description in an older/fallback machine is generic or missing, ensure tailored execution cues
                  if (idx === 3 && (!step.description || step.description.length < 20)) {
                    return {
                      ...step,
                      stage: 'Execute',
                      icon: step.icon || '💥',
                      title: step.title || categoryExec.title,
                      description: categoryExec.description,
                    };
                  }
                  return step;
                })
              : [
                  {
                    stage: 'Setup',
                    icon: '🪑',
                    title: 'Machine Setup & Anchoring',
                    description: machine.setupInstructions?.[0] || 'Adjust machine seat, pads, or cables to fit your body height and natural joint alignment.'
                  },
                  {
                    stage: 'Adjust',
                    icon: '🎯',
                    title: 'Select Resistance & Pins',
                    description: machine.setupInstructions?.[1] || 'Insert selector pin into weight stack or load weight plates suited to your current strength level.'
                  },
                  {
                    stage: 'Position',
                    icon: '🧘',
                    title: 'Body Stance & Core Brace',
                    description: machine.setupInstructions?.[2] || 'Sit or stand with torso braced, feet planted flat on floor, and grip handles securely.'
                  },
                  {
                    stage: 'Execute',
                    icon: '💥',
                    title: categoryExec.title,
                    description: categoryExec.description
                  }
                ];

            // Helper to get stage aesthetic styling with glowing amber Stage 4
            const getStageMeta = (stage: string, idx: number, customIcon?: string) => {
              const normalized = (stage || '').toLowerCase();
              if (normalized.includes('setup')) {
                return {
                  emoji: customIcon || '🪑',
                  stage: stage || 'Setup',
                  accent: '#00F59B',
                  accentBg: 'rgba(0, 245, 155, 0.1)',
                  border: 'rgba(0, 245, 155, 0.25)',
                  glow: 'none',
                  isExecute: false,
                };
              }
              if (normalized.includes('adjust')) {
                return {
                  emoji: customIcon || '🎯',
                  stage: stage || 'Adjust',
                  accent: '#38BDF8',
                  accentBg: 'rgba(56, 189, 248, 0.1)',
                  border: 'rgba(56, 189, 248, 0.25)',
                  glow: 'none',
                  isExecute: false,
                };
              }
              if (normalized.includes('pos')) {
                return {
                  emoji: customIcon || '🧘',
                  stage: stage || 'Position',
                  accent: '#C084FC',
                  accentBg: 'rgba(192, 132, 252, 0.1)',
                  border: 'rgba(192, 132, 252, 0.25)',
                  glow: 'none',
                  isExecute: false,
                };
              }
              if (normalized.includes('exec') || normalized.includes('push') || normalized.includes('pull') || idx === 3) {
                return {
                  emoji: customIcon || '💥',
                  stage: stage || 'Execute',
                  accent: '#FFB800',
                  accentBg: 'rgba(255, 184, 0, 0.16)',
                  border: 'rgba(255, 184, 0, 0.38)',
                  glow: '0 0 20px rgba(255, 184, 0, 0.14)',
                  isExecute: true,
                };
              }
              const defaultMetas = [
                { emoji: '🪑', stage: 'Setup', accent: '#00F59B', accentBg: 'rgba(0, 245, 155, 0.1)', border: 'rgba(0, 245, 155, 0.25)', glow: 'none', isExecute: false },
                { emoji: '🎯', stage: 'Adjust', accent: '#38BDF8', accentBg: 'rgba(56, 189, 248, 0.1)', border: 'rgba(56, 189, 248, 0.25)', glow: 'none', isExecute: false },
                { emoji: '🧘', stage: 'Position', accent: '#C084FC', accentBg: 'rgba(192, 132, 252, 0.1)', border: 'rgba(192, 132, 252, 0.25)', glow: 'none', isExecute: false },
                { emoji: '💥', stage: 'Execute', accent: '#FFB800', accentBg: 'rgba(255, 184, 0, 0.16)', border: 'rgba(255, 184, 0, 0.38)', glow: '0 0 20px rgba(255, 184, 0, 0.14)', isExecute: true },
              ];
              const fb = defaultMetas[idx % defaultMetas.length];
              return {
                ...fb,
                emoji: customIcon || fb.emoji,
                stage: stage || fb.stage,
              };
            };

            // Resolve dynamic movement cues
            const cues = machine.movementCues || {
              exhale: machine.movementGuidance?.[0] || 'On concentric exertion phase (pushing or pulling the weight)',
              inhale: machine.movementGuidance?.[2] || 'On controlled 3-second eccentric return phase',
              tempo: '1s Explosive Drive | 1s Peak Hold | 3s Controlled Negative'
            };

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s ease-out' }}>

                {/* Section header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 6, height: 24, borderRadius: 3, background: 'linear-gradient(180deg, #00F59B, #00D2FF)' }} />
                    <h3 style={{ fontSize: '1.15rem', color: '#F1F5F9', margin: 0, fontWeight: 800 }}>Step-by-Step Usage</h3>
                  </div>
                  <span style={{
                    fontSize: '0.7rem', color: '#00F59B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                    background: 'rgba(0,245,155,0.1)', border: '1px solid rgba(0,245,155,0.25)',
                    padding: '2px 10px', borderRadius: '999px'
                  }}>Standard Execution</span>
                </div>

                {displaySteps.length > 0 ? (
                  <>
                    {/* ─── Visual Action Step Cards Grid ─── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      {displaySteps.map((step, idx) => {
                        const meta = getStageMeta(step.stage, idx, step.icon);
                        return (
                          <div
                            key={idx}
                            style={{
                              background: meta.isExecute 
                                ? 'linear-gradient(145deg, rgba(255, 184, 0, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)' 
                                : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${meta.border}`,
                              borderRadius: '18px',
                              padding: '1.15rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.65rem',
                              position: 'relative',
                              overflow: 'hidden',
                              boxShadow: meta.glow,
                              transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                          >
                            {/* Step number watermark */}
                            <div style={{
                              position: 'absolute', top: '0.6rem', right: '0.8rem',
                              fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-heading)',
                              color: meta.accentBg, lineHeight: 1, userSelect: 'none', pointerEvents: 'none'
                            }}>{idx + 1}</div>

                            {/* Icon + Stage pill with glowing amber/gold badge on Stage 4 */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{meta.emoji}</span>
                              <span style={{
                                fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase',
                                letterSpacing: '0.07em', color: meta.accent,
                                background: meta.accentBg, border: `1px solid ${meta.border}`,
                                padding: '2px 9px', borderRadius: '999px',
                                boxShadow: meta.isExecute ? '0 0 12px rgba(255, 184, 0, 0.45)' : 'none',
                              }}>{meta.stage}</span>
                            </div>

                            {/* Step label & Title */}
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                                Step {idx + 1}
                              </div>
                              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: meta.isExecute ? '#FEF08A' : '#F8FAFC', margin: 0, lineHeight: 1.3 }}>
                                {step.title}
                              </h4>
                            </div>

                            {/* Instruction text */}
                            <p style={{ margin: 0, fontSize: '0.84rem', color: '#CBD5E1', lineHeight: 1.48, fontWeight: 400 }}>
                              {step.description}
                            </p>

                            {/* Bottom accent bar */}
                            <div style={{ height: '3px', borderRadius: '999px', background: `linear-gradient(90deg, ${meta.accent}, transparent)`, marginTop: 'auto' }} />
                          </div>
                        );
                      })}
                    </div>

                    {/* ─── Movement Cue Pills ─── */}
                    <div style={{
                      padding: '1rem 1.25rem',
                      background: 'rgba(0,210,255,0.04)',
                      border: '1px solid rgba(0,210,255,0.18)',
                      borderRadius: '16px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                        <Sparkles size={14} color="#00D2FF" />
                        <span style={{ fontSize: '0.78rem', color: '#00D2FF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Movement Rhythm &amp; Breathing
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          background: 'rgba(0,245,155,0.1)', border: '1px solid rgba(0,245,155,0.3)',
                          borderRadius: '999px', padding: '5px 12px',
                          fontSize: '0.8rem', color: '#E2E8F0', fontWeight: 500,
                        }}>
                          <strong style={{ color: '#00F59B', fontWeight: 700 }}>🟢 Exhale:</strong> {cues.exhale}
                        </span>

                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)',
                          borderRadius: '999px', padding: '5px 12px',
                          fontSize: '0.8rem', color: '#E2E8F0', fontWeight: 500,
                        }}>
                          <strong style={{ color: '#38BDF8', fontWeight: 700 }}>🔵 Inhale:</strong> {cues.inhale}
                        </span>

                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.3)',
                          borderRadius: '999px', padding: '5px 12px',
                          fontSize: '0.8rem', color: '#E2E8F0', fontWeight: 500,
                        }}>
                          <strong style={{ color: '#FFB800', fontWeight: 700 }}>⚡ Tempo:</strong> {cues.tempo}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94A3B8' }}>
                    <Info size={32} style={{ margin: '0 auto 8px auto', opacity: 0.6 }} />
                    <p style={{ fontSize: '0.88rem', margin: 0 }}>
                      Information for this machine is still being reviewed.
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 4. MACHINE ADJUSTMENT INSTRUCTIONS */}
          {activeTab === 'adjustments' && (
            <div className="glass-card" style={{ padding: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <Sliders size={20} color="#00F59B" />
                <h3 style={{ fontSize: '1.15rem', color: '#F1F5F9', margin: 0 }}>
                  Machine Adjustment Instructions
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <h4 style={{ fontSize: '0.95rem', color: '#00F59B', marginBottom: '0.4rem' }}>
                    1. Seat Height & Backrest Position
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0, lineHeight: 1.45 }}>
                    Locate the pull-pin lever under the seat cushion. Adjust height so the handles or pivot axis align naturally with your target joint (e.g. mid-chest or knee joint). Make sure the pin clicks securely into place before loading weight.
                  </p>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <h4 style={{ fontSize: '0.95rem', color: '#00F59B', marginBottom: '0.4rem' }}>
                    2. Weight Stack Pin Selector
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0, lineHeight: 1.45 }}>
                    Ensure the selector pin is fully inserted into the weight plate hole. For beginners, select a lightweight plate (10–20 lbs) to test joint comfort and ensure fluid movement throughout the range of motion.
                  </p>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <h4 style={{ fontSize: '0.95rem', color: '#00F59B', marginBottom: '0.4rem' }}>
                    3. Range of Motion / Arm Lever Stop
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0, lineHeight: 1.45 }}>
                    If equipped with an overhead or base cam limiter, adjust the starting position to allow a comfortable stretch without hyper-extending shoulders, knees, or lower back.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 8. EXERCISES THAT CAN BE PERFORMED */}
          {activeTab === 'exercises' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.2s ease-out' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#F1F5F9', margin: 0 }}>
                  Exercises You Can Perform
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
                  Targeted exercise variations verified for this equipment
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem'
              }}>
                {exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="glass-card"
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '0.85rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '4px' }}>
                        <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                          {ex.difficulty}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: 600 }}>
                          🎯 {ex.mainMuscle}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1.05rem', color: '#F1F5F9', margin: '4px 0 6px 0', fontWeight: 700 }}>
                        {ex.name}
                      </h4>

                      <p style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.4, margin: 0 }}>
                        {ex.description}
                      </p>
                    </div>

                    <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedExercise(ex)}
                        className="btn-secondary"
                        style={{
                          width: '100%',
                          fontSize: '0.8rem',
                          padding: '0.5rem 0.85rem',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>View Exercise Details</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. COMMON MISTAKES — Side-by-Side Do's & Don'ts Cards */}
          {activeTab === 'mistakes' && (() => {
            const mistakesList = machine.commonMistakes && machine.commonMistakes.length > 0
              ? machine.commonMistakes
              : [
                  {
                    mistake: 'Using momentum or torso swinging to heave the weight',
                    fix: 'Lock your core solid, maintain neutral spine, and isolate the target muscles with zero swinging.',
                    correction: 'Lock your core solid, maintain neutral spine, and isolate the target muscles with zero swinging.'
                  },
                  {
                    mistake: 'Letting weight stack slam down uncontrollably',
                    fix: 'Control the 3-second eccentric return so the weight stack hovers smoothly without slamming.',
                    correction: 'Control the 3-second eccentric return so the weight stack hovers smoothly without slamming.'
                  }
                ];

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s ease-out' }}>

                {/* Section header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 6, height: 24, borderRadius: 3, background: 'linear-gradient(180deg, #FF4757, #FF6B81)' }} />
                    <h3 style={{ fontSize: '1.15rem', color: '#F1F5F9', margin: 0, fontWeight: 800 }}>Common Mistakes &amp; Fixes</h3>
                  </div>
                  <span style={{
                    fontSize: '0.7rem', color: '#FF6B81', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                    background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.25)',
                    padding: '2px 10px', borderRadius: '999px'
                  }}>Form Check</span>
                </div>

                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {mistakesList.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 md:grid-cols-2 gap-3"
                    >
                      {/* Left: ❌ Mistake */}
                      <div style={{
                        background: 'rgba(255,71,87,0.07)',
                        border: '1px solid rgba(255,71,87,0.25)',
                        borderRadius: '16px',
                        padding: '1rem 1.1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                            color: '#FF6B81', background: 'rgba(255,71,87,0.15)',
                            border: '1px solid rgba(255,71,87,0.3)', padding: '2px 8px', borderRadius: '999px'
                          }}>❌ Mistake</span>
                          <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>#{idx + 1}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#FCA5A5', fontWeight: 600, lineHeight: 1.4 }}>
                          {item.mistake}
                        </p>
                        {/* Bottom accent */}
                        <div style={{ height: '2px', borderRadius: '999px', background: 'linear-gradient(90deg, rgba(255,71,87,0.6), transparent)', marginTop: 'auto' }} />
                      </div>

                      {/* Right: ✅ Correct Form */}
                      <div style={{
                        background: 'rgba(0,245,155,0.07)',
                        border: '1px solid rgba(0,245,155,0.25)',
                        borderRadius: '16px',
                        padding: '1rem 1.1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                            color: '#00F59B', background: 'rgba(0,245,155,0.15)',
                            border: '1px solid rgba(0,245,155,0.3)', padding: '2px 8px', borderRadius: '999px'
                          }}>✅ Correct Form</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#6EE7B7', fontWeight: 600, lineHeight: 1.4 }}>
                          {item.fix || item.correction}
                        </p>
                        {/* Bottom accent */}
                        <div style={{ height: '2px', borderRadius: '999px', background: 'linear-gradient(90deg, rgba(0,245,155,0.6), transparent)', marginTop: 'auto' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

        </div>
      </div>

      {/* 10. RELATED MACHINES SECTION */}
      {relatedMachines.length > 0 && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#F1F5F9', marginBottom: '0.85rem' }}>
            Related Equipment in Gym Facility
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.85rem'
          }}>
            {relatedMachines.map((rel) => (
              <button
                key={rel.id}
                type="button"
                onClick={() => onSelectMachine ? onSelectMachine(rel, source) : undefined}
                className="hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all text-left"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <div style={{ width: '48px', height: '48px', background: '#090D15', borderRadius: '8px', padding: '4px', flexShrink: 0 }}>
                  <MachineSvgIllustration type={rel.imageSvg} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {rel.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#00F59B' }}>
                    {rel.category} • {rel.difficulty}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('library')}
            className="btn-ghost"
            style={{ fontSize: '0.8rem', color: '#38BDF8' }}
          >
            <BookOpen size={14} /> Back to Library
          </button>
        </div>

        {SHOW_START_GUIDE && (
          <button
            type="button"
            onClick={() => setShowTutorialModal(true)}
            className="btn-primary"
            style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
          >
            <Award size={15} /> Launch Step Guide (+5 XP)
          </button>
        )}
      </div>

      {/* Interactive Modals */}
      {SHOW_START_GUIDE && showTutorialModal && (
        <InteractiveTutorialModal
          machine={machine}
          onClose={() => setShowTutorialModal(false)}
        />
      )}

      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          machine={machine}
          onClose={() => setSelectedExercise(null)}
        />
      )}

      {showReportModal && (
        <ReportModal
          machine={machine}
          onClose={() => setShowReportModal(false)}
        />
      )}

    </div>
  );
};

