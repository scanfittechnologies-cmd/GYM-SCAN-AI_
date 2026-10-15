import React from 'react';
import { MachineExercise, Machine } from '../../types';
import { 
  X, 
  Dumbbell, 
  ShieldCheck, 
  Wind, 
  AlertTriangle, 
  ArrowLeft, 
  Sparkles,
  CheckCircle,
  HelpCircle,
  Play
} from 'lucide-react';
import { MachineSvgIllustration } from './MachineSvgIllustrations';

interface ExerciseDetailModalProps {
  exercise: MachineExercise;
  machine: Machine;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  machine,
  onClose
}) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 7, 12, 0.88)',
      backdropFilter: 'blur(12px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '24px',
          padding: '1.75rem',
          border: '1px solid rgba(0, 245, 155, 0.3)',
          background: 'linear-gradient(135deg, rgba(17, 24, 38, 0.98) 0%, rgba(10, 14, 22, 0.99) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                Exercise Guide
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                • on {machine.name}
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', color: '#F1F5F9', margin: '4px 0 2px 0', lineHeight: 1.2 }}>
              {exercise.name}
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>
              Primary Target: <strong style={{ color: '#00F59B' }}>{exercise.mainMuscle}</strong>
              {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                <span> • Also targets: {exercise.secondaryMuscles.join(', ')}</span>
              )}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Visual Illustration & Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '1rem',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{
            height: '140px',
            background: '#0B0F17',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <MachineSvgIllustration type={exercise.imageSvg || machine.imageSvg} />
          </div>

          <div>
            <span className="badge badge-blue" style={{ fontSize: '0.68rem', marginBottom: '0.35rem' }}>
              {exercise.difficulty} Variation
            </span>
            <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.45, margin: '4px 0 0 0' }}>
              {exercise.description}
            </p>
          </div>
        </div>

        {/* 1. Setup Instructions */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h4 style={{ fontSize: '0.95rem', color: '#00F59B', margin: '0 0 0.6rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00F59B' }} />
            1. Setup & Starting Position
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#E2E8F0', lineHeight: 1.5 }}>
            {exercise.setupGuidance.map((step, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>{step}</li>
            ))}
          </ul>
        </div>

        {/* 2. Step-by-Step Movement Guidance */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h4 style={{ fontSize: '0.95rem', color: '#00D2FF', margin: '0 0 0.6rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D2FF' }} />
            2. Step-by-Step Movement Guidance
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#E2E8F0', lineHeight: 1.5 }}>
            {exercise.movementSteps.map((step, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>{step}</li>
            ))}
          </ul>
        </div>

        {/* 3. Breathing Guidance */}
        <div style={{
          background: 'rgba(0, 210, 255, 0.06)',
          border: '1px solid rgba(0, 210, 255, 0.2)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.8rem',
          color: '#CBD5E1'
        }}>
          <Wind size={18} color="#00D2FF" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#00D2FF' }}>Breathing Cadence:</strong> {exercise.breathingCues}
          </div>
        </div>

        {/* 4. Common Form Mistakes */}
        {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h4 style={{ fontSize: '0.92rem', color: '#FF6B81', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={15} /> Common Mistakes to Avoid
            </h4>
            {exercise.commonMistakes.map((m, idx) => (
              <div key={idx} style={{
                background: 'rgba(255, 71, 87, 0.05)',
                border: '1px solid rgba(255, 71, 87, 0.15)',
                borderRadius: '10px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.8rem'
              }}>
                <div style={{ color: '#FF6B81', fontWeight: 600 }}>❌ {m.mistake}</div>
                <div style={{ color: '#00F59B', marginTop: '2px' }}>✅ {m.correction}</div>
              </div>
            ))}
          </div>
        )}

        {/* Safety Reminder Banner */}
        <div style={{
          background: 'rgba(255, 184, 0, 0.08)',
          border: '1px solid rgba(255, 184, 0, 0.25)',
          borderRadius: '14px',
          padding: '0.85rem 1rem',
          fontSize: '0.78rem',
          color: '#CBD5E1',
          lineHeight: 1.4
        }}>
          <strong style={{ color: '#FFB800' }}>Safety Reminder:</strong> {exercise.safetyReminder} Use a manageable resistance and ask a qualified trainer for help if you are unsure about your form.
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            <ArrowLeft size={16} /> Return to Machine Overview
          </button>
        </div>
      </div>
    </div>
  );
};
