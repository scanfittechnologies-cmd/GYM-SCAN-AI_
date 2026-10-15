import React, { useState, useRef } from 'react';
import { Machine, MachineExercise } from '../types';
import { useGym } from '../context/GymContext';
import { 
  ArrowLeft, 
  Star, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  Shield, 
  Dumbbell, 
  Info, 
  QrCode, 
  Flag, 
  Sparkles, 
  ChevronRight, 
  Award, 
  Video, 
  BookOpen, 
  Camera, 
  RotateCcw,
  Sliders,
  CheckCircle2,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { MachineImageGallery } from '../components/machines/MachineImageGallery';
import { MuscleAnatomyDiagram } from '../components/machines/MuscleAnatomyDiagram';
import { InteractiveTutorialModal } from '../components/machines/InteractiveTutorialModal';
import { ExerciseDetailModal } from '../components/machines/ExerciseDetailModal';
import { ReportModal } from '../components/machines/ReportModal';
import { MachineSvgIllustration } from '../components/machines/MachineSvgIllustrations';
import { getExercisesForMachine } from '../data/machineExercises';

interface MachineDetailPageProps {
  machine: Machine | null;
  source?: 'qr' | 'photo' | 'library' | 'activity';
  onBack: () => void;
  onNavigate?: (tab: string) => void;
}

export const MachineDetailPage: React.FC<MachineDetailPageProps> = ({ 
  machine, 
  source = 'library',
  onBack,
  onNavigate
}) => {
  const { 
    machines,
    isMachineDiscovered, 
    isTutorialCompleted, 
    isFavorite, 
    toggleFavorite 
  } = useGym();

  const [activeTab, setActiveTab] = useState<'overview' | 'steps' | 'adjustments' | 'exercises' | 'mistakes' | 'anatomy' | 'tutorials'>('overview');
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<MachineExercise | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

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
            onClick={() => toggleFavorite(machine.id)}
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
              <span className="badge badge-muted" style={{ fontSize: '0.65rem' }}>
                QR: {machine.qrCodeId}
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
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs for Specific Sections */}
      <div>
        <div style={{
          display: 'flex',
          gap: '0.4rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '0.5rem',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          {[
            { id: 'overview', label: 'Step-by-Step Usage' },
            { id: 'adjustments', label: 'Machine Adjustments' },
            { id: 'exercises', label: `Exercises (${exercises.length})` },
            { id: 'mistakes', label: 'Common Mistakes' },
            { id: 'anatomy', label: 'Muscle Anatomy' },
            { id: 'tutorials', label: 'Demonstration Tutorial' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  background: isActive ? 'rgba(0, 245, 155, 0.12)' : 'transparent',
                  color: isActive ? '#00F59B' : '#94A3B8',
                  border: isActive ? '1px solid rgba(0, 245, 155, 0.3)' : '1px solid transparent',
                  borderRadius: '10px',
                  padding: '0.55rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div style={{ marginTop: '1.25rem' }}>
          
          {/* 5. STEP-BY-STEP USAGE INSTRUCTIONS */}
          {activeTab === 'overview' && (
            <div className="glass-card" style={{ padding: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#F1F5F9', margin: 0 }}>
                  Step-by-Step Usage Instructions
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Standard Exercise Execution
                </span>
              </div>

              {machine.setupInstructions && machine.setupInstructions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {machine.setupInstructions.map((instruction, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.85rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        padding: '0.9rem 1rem',
                        borderRadius: '14px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'rgba(0, 245, 155, 0.15)',
                        color: '#00F59B',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', color: '#00F59B', fontWeight: 700, textTransform: 'uppercase' }}>
                          Step {idx + 1}
                        </div>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.88rem', color: '#E2E8F0', lineHeight: 1.45 }}>
                          {instruction}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Cadence & Form Cues */}
                  {machine.movementGuidance && machine.movementGuidance.length > 0 && (
                    <div style={{ marginTop: '0.75rem', padding: '1rem', background: 'rgba(0, 210, 255, 0.04)', borderRadius: '12px', border: '1px solid rgba(0, 210, 255, 0.15)' }}>
                      <h4 style={{ fontSize: '0.9rem', color: '#00D2FF', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={14} /> Movement Rhythm & Breathing Cues:
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#CBD5E1', lineHeight: 1.5 }}>
                        {machine.movementGuidance.map((cue, idx) => (
                          <li key={idx}>{cue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94A3B8' }}>
                  <Info size={32} style={{ margin: '0 auto 8px auto', opacity: 0.6 }} />
                  <p style={{ fontSize: '0.88rem', margin: 0 }}>
                    Information for this machine is still being reviewed.
                  </p>
                </div>
              )}
            </div>
          )}

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

          {/* 6. COMMON MISTAKES */}
          {activeTab === 'mistakes' && (
            <div className="glass-card" style={{ padding: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#F1F5F9', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF4757' }} />
                Common Mistakes & Fixes
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {machine.commonMistakes && machine.commonMistakes.length > 0 ? (
                  machine.commonMistakes.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(255, 71, 87, 0.05)',
                        border: '1px solid rgba(255, 71, 87, 0.2)',
                        borderRadius: '14px',
                        padding: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FF6B81', fontWeight: 700, fontSize: '0.88rem' }}>
                        <AlertTriangle size={16} /> ❌ Mistake: {item.mistake}
                      </div>
                      <div style={{ marginTop: '6px', paddingLeft: '1.5rem', fontSize: '0.84rem', color: '#00F59B', lineHeight: 1.4 }}>
                        <strong>✅ Fix:</strong> {item.correction}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                    Information for this machine is still being reviewed.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Muscle Anatomy Diagram */}
          {activeTab === 'anatomy' && (
            <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
              <MuscleAnatomyDiagram
                primaryMuscles={machine.primaryMuscles}
                secondaryMuscles={machine.secondaryMuscles}
                category={machine.category}
              />
            </div>
          )}

          {/* 9. HUMAN DEMONSTRATION TUTORIALS */}
          {activeTab === 'tutorials' && (
            <div className="glass-card" style={{ padding: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Video size={18} color="#00D2FF" />
                  <h3 style={{ fontSize: '1.1rem', color: '#F1F5F9', margin: 0 }}>
                    Human Demonstration Guide
                  </h3>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  {machine.videoDurationSec ? `${machine.videoDurationSec}s Breakdown` : 'Demonstration'}
                </span>
              </div>

              {/* Video Player Container / Simulation Area */}
              <div style={{
                position: 'relative',
                height: '260px',
                background: '#090D15',
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {isVideoPlaying ? (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.9)',
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00F59B', animation: 'pulse 1.5s infinite', marginBottom: '8px' }} />
                    <h4 style={{ fontSize: '1.1rem', color: '#F1F5F9', marginBottom: '4px' }}>
                      Streaming Form Demo: {machine.name}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#94A3B8', maxWidth: '380px', margin: '0 0 1rem 0' }}>
                      Demonstrating proper torso stabilization, grip positioning, and controlled tempo cadence.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsVideoPlaying(false)}
                      className="btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}
                    >
                      Close Video
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <div 
                      onClick={() => setIsVideoPlaying(true)}
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #00F59B 0%, #00D2FF 100%)',
                        color: '#05140F',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem auto',
                        cursor: 'pointer',
                        boxShadow: '0 0 25px rgba(0, 245, 155, 0.4)',
                        transition: 'transform 0.2s ease'
                      }}
                      title="Play Demonstration Guide"
                    >
                      <Play size={28} fill="#05140F" style={{ marginLeft: '4px' }} />
                    </div>
                    <h4 style={{ fontSize: '1rem', color: '#F1F5F9', marginBottom: '0.25rem' }}>
                      {machine.name} Tutorial
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                      Tap to watch certified setup and execution form demonstration
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 7. SAFETY TIPS SECTION */}
      <div style={{
        background: 'rgba(255, 184, 0, 0.05)',
        border: '1px solid rgba(255, 184, 0, 0.22)',
        borderRadius: '18px',
        padding: '1.35rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={20} color="#FFB800" />
          <h3 style={{ fontSize: '1rem', color: '#FFB800', margin: 0 }}>
            Safety Tips & Personal Trainer Guidance
          </h3>
        </div>

        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.84rem', color: '#CBD5E1', lineHeight: 1.55 }}>
          {machine.safetyReminders && machine.safetyReminders.map((rem, idx) => (
            <li key={idx} style={{ marginBottom: '4px' }}>{rem}</li>
          ))}
          <li>Start with a lightweight resistance to test shoulder, elbow, and knee joint mobility.</li>
          <li>Avoid sudden jerking motions or letting weight stacks slam together during the eccentric phase.</li>
          <li>Stop immediately if you experience sharp or unusual joint discomfort.</li>
          <li>
            <strong style={{ color: '#FFB800' }}>Trainer Recommendation:</strong> If you are unsure about adjusting this equipment or have pre-existing injuries, ask a certified gym fitness trainer on duty for personalized assistance.
          </li>
        </ul>
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
              <div
                key={rel.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('scan')}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}
          >
            <QrCode size={14} /> Scan Another Machine
          </button>
          
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('library')}
            className="btn-ghost"
            style={{ fontSize: '0.8rem', color: '#38BDF8' }}
          >
            <BookOpen size={14} /> Back to Library
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowTutorialModal(true)}
          className="btn-primary"
          style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
        >
          <Award size={15} /> Launch Step Guide (+5 XP)
        </button>
      </div>

      {/* Interactive Modals */}
      {showTutorialModal && (
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

