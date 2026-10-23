import React, { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  Zap, 
  Dumbbell, 
  Flame, 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  Target, 
  ChevronRight,
  Plus
} from 'lucide-react';
import { useUserTier } from '../../hooks/useUserTier';
import { PricingModal } from '../pricing/PricingModal';
import { Machine } from '../../types';

interface WorkoutRoutineGeneratorProps {
  onNavigate: (tab: string) => void;
  savedMachines?: Machine[];
}

export const WorkoutRoutineGenerator: React.FC<WorkoutRoutineGeneratorProps> = ({
  onNavigate,
  savedMachines = [],
}) => {
  const { isPro } = useUserTier();
  const [showPricingModal, setShowPricingModal] = useState<boolean>(false);
  const [selectedGoal, setSelectedGoal] = useState<'hypertrophy' | 'strength' | 'endurance'>('hypertrophy');
  const [selectedSplit, setSelectedSplit] = useState<'full_body' | 'push_pull_legs' | 'upper_lower'>('full_body');

  const sampleRoutines = [
    {
      day: 'Day 1: Full-Body Precision Push & Leg Power',
      duration: '45 mins',
      burn: '~380 kcal',
      exercises: [
        { name: 'Seated Chest Press', target: 'Chest & Triceps', sets: '4 sets × 10-12 reps', rest: '90s' },
        { name: '45° Leg Press', target: 'Quadriceps & Glutes', sets: '4 sets × 12 reps', rest: '90s' },
        { name: 'Lat Pulldown', target: 'Lats & Biceps', sets: '3 sets × 10 reps', rest: '60s' },
        { name: 'Seated Leg Curl', target: 'Hamstrings', sets: '3 sets × 12 reps', rest: '60s' },
      ],
    },
    {
      day: 'Day 2: Back Dominance & Core Stability',
      duration: '40 mins',
      burn: '~320 kcal',
      exercises: [
        { name: 'Seated Cable Row', target: 'Rhomboids & Mid-Back', sets: '4 sets × 10 reps', rest: '90s' },
        { name: 'Pec Deck Machine', target: 'Pectoralis Major & Deltoids', sets: '3 sets × 12-15 reps', rest: '60s' },
        { name: 'Standing Calf Raise', target: 'Gastrocnemius', sets: '4 sets × 15 reps', rest: '45s' },
      ],
    },
  ];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div
        className="glass-card"
        style={{
          padding: '1.75rem',
          borderRadius: '24px',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(15, 20, 32, 0.95) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 12px 36px -10px rgba(168, 85, 247, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
            <span
              style={{
                background: 'linear-gradient(135deg, #A855F7, #6366F1)',
                color: '#FFFFFF',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 10px',
                borderRadius: '999px',
                letterSpacing: '0.04em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Zap size={11} fill="currentColor" /> PRO EXCLUSIVE
            </span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#F8FAFC', margin: 0, lineHeight: 1.2 }}>
            AI Workout Routine Generator
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: '0.4rem 0 0 0', maxWidth: '540px' }}>
            Builds structured push-pull-legs and full-body workout splits based on the exact equipment in your facility.
          </p>
        </div>

        {!isPro && (
          <button
            onClick={() => setShowPricingModal(true)}
            style={{
              background: 'linear-gradient(135deg, #A855F7 0%, #6366F1 100%)',
              border: 'none',
              borderRadius: '14px',
              padding: '0.75rem 1.4rem',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 6px 20px rgba(168, 85, 247, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            <Sparkles size={16} /> Upgrade to Pro to Generate
          </button>
        )}
      </div>

      {/* Routine Options Controls */}
      <div
        className="glass-card"
        style={{
          padding: '1.5rem',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          opacity: isPro ? 1 : 0.65,
        }}
      >
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>
            Primary Training Goal
          </label>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {(['hypertrophy', 'strength', 'endurance'] as const).map(g => (
              <button
                key={g}
                disabled={!isPro}
                onClick={() => setSelectedGoal(g)}
                style={{
                  background: selectedGoal === g ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: selectedGoal === g ? '1.5px solid #A855F7' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: selectedGoal === g ? '#E9D5FF' : '#94A3B8',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: isPro ? 'pointer' : 'not-allowed',
                  textTransform: 'capitalize',
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>
            Workout Split Format
          </label>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {([
              { id: 'full_body', label: 'Full Body' },
              { id: 'push_pull_legs', label: 'Push / Pull / Legs' },
              { id: 'upper_lower', label: 'Upper / Lower' },
            ] as const).map(s => (
              <button
                key={s.id}
                disabled={!isPro}
                onClick={() => setSelectedSplit(s.id)}
                style={{
                  background: selectedSplit === s.id ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: selectedSplit === s.id ? '1.5px solid #A855F7' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: selectedSplit === s.id ? '#E9D5FF' : '#94A3B8',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: isPro ? 'pointer' : 'not-allowed',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Routine Display Cards Container */}
      <div style={{ position: 'relative' }}>
        
        {/* If user is NOT Pro, show premium locked overlay */}
        {!isPro && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              backdropFilter: 'blur(9px)',
              WebkitBackdropFilter: 'blur(9px)',
              backgroundColor: 'rgba(11, 15, 25, 0.82)',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '2.5rem 1.5rem',
              gap: '1.1rem',
              boxShadow: '0 0 50px rgba(0, 0, 0, 0.5) inset',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(99, 102, 241, 0.25))',
                border: '1px solid rgba(168, 85, 247, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#C084FC',
                boxShadow: '0 0 24px rgba(168, 85, 247, 0.35)',
              }}
            >
              <Lock size={30} />
            </div>

            <div style={{ maxWidth: '480px' }}>
              <span
                style={{
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.35)',
                  color: '#C084FC',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 10px',
                  borderRadius: '999px',
                  letterSpacing: '0.04em',
                }}
              >
                PRO FEATURE
              </span>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#F8FAFC', margin: '0.6rem 0 0.35rem 0' }}>
                AI Workout Generator Locked
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: 1.55 }}>
                Available exclusively for Pro tier members ($4.99/mo). Scan machines in your gym and let our AI algorithm build a periodized training program with sets, reps, and rest intervals.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => setShowPricingModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #A855F7 0%, #6366F1 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 1.6rem',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)',
                }}
              >
                <Zap size={16} fill="currentColor" /> Unlock Pro Access ($4.99)
              </button>
              <button
                onClick={() => onNavigate('pricing')}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '0.75rem 1.25rem',
                  color: '#CBD5E1',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                Compare Plans
              </button>
            </div>
          </div>
        )}

        {/* Blurred Teaser / Active Cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            filter: isPro ? 'none' : 'blur(5px)',
            userSelect: isPro ? 'auto' : 'none',
            pointerEvents: isPro ? 'auto' : 'none',
          }}
        >
          {sampleRoutines.map((routine, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: '1.75rem',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(15, 20, 32, 0.7)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
                  {routine.day}
                </h4>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', color: '#94A3B8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} color="#38BDF8" /> {routine.duration}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Flame size={13} color="#FF6B81" /> {routine.burn}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {routine.exercises.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '12px',
                      padding: '0.75rem 1rem',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ color: '#F1F5F9', fontWeight: 700, fontSize: '0.9rem' }}>
                        {ex.name}
                      </div>
                      <div style={{ color: '#64748B', fontSize: '0.75rem' }}>
                        {ex.target}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#00F59B', fontWeight: 700, fontSize: '0.82rem' }}>
                        {ex.sets}
                      </div>
                      <div style={{ color: '#64748B', fontSize: '0.72rem' }}>
                        Rest: {ex.rest}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onNavigateToPricing={() => {
          setShowPricingModal(false);
          onNavigate('pricing');
        }}
        highlightTier="pro"
        customTitle="AI Workout Routine Generator"
        customMessage="Upgrade to Pro to generate personalized gym machine routines based on equipment available at your gym facility!"
      />
    </div>
  );
};
export default WorkoutRoutineGenerator;
