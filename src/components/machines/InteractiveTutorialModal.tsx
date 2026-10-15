import React, { useState } from 'react';
import { Machine } from '../../types';
import { useGym } from '../../context/GymContext';
import { X, CheckCircle, Award, Play, AlertCircle, ChevronRight, Check } from 'lucide-react';
import { MachineSvgIllustration } from './MachineSvgIllustrations';

interface InteractiveTutorialModalProps {
  machine: Machine;
  onClose: () => void;
}

export const InteractiveTutorialModal: React.FC<InteractiveTutorialModalProps> = ({
  machine,
  onClose,
}) => {
  const { markTutorialCompleted, isTutorialCompleted } = useGym();
  const alreadyDone = isTutorialCompleted(machine.id);

  const [currentStep, setCurrentStep] = useState(0);
  const [checkedCheckpoints, setCheckedCheckpoints] = useState<number[]>([]);
  const [simulatedPlaying, setSimulatedPlaying] = useState(false);

  const toggleCheckpoint = (index: number) => {
    if (checkedCheckpoints.includes(index)) {
      setCheckedCheckpoints(checkedCheckpoints.filter(i => i !== index));
    } else {
      setCheckedCheckpoints([...checkedCheckpoints, index]);
    }
  };

  const handleFinishTutorial = () => {
    markTutorialCompleted(machine.id);
    onClose();
  };

  const allCheckpointsPassed = checkedCheckpoints.length === machine.tutorialSteps.length;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 7, 10, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: '#131824',
        border: '1px solid rgba(0, 245, 155, 0.3)',
        borderRadius: '24px',
        maxWidth: '560px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '1.5rem',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 245, 155, 0.1)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(0, 245, 155, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00F59B'
            }}>
              <Award size={20} />
            </div>
            <div>
              <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Interactive Guide</span>
              <h3 style={{ fontSize: '1.15rem', color: '#F1F5F9', margin: '2px 0 0 0' }}>{machine.name} Form Mastery</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Video Simulation Player */}
        <div style={{
          position: 'relative',
          height: '180px',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#0B0F17',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <MachineSvgIllustration type={machine.imageSvg} />
          
          <div style={{
            position: 'absolute',
            inset: 0,
            background: simulatedPlaying 
              ? 'rgba(0, 0, 0, 0.2)' 
              : 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                color: '#CBD5E1',
                fontWeight: 600
              }}>
                HD Movement Demonstration
              </span>
              <span style={{
                background: 'rgba(0,0,0,0.6)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                color: '#94A3B8'
              }}>
                0:{machine.videoDurationSec}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => setSimulatedPlaying(!simulatedPlaying)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00F59B, #00D2FF)',
                  border: 'none',
                  color: '#05140F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(0, 245, 155, 0.5)',
                  transform: simulatedPlaying ? 'scale(0.95)' : 'scale(1)',
                  transition: 'transform 0.15s'
                }}
              >
                <Play size={22} fill="#05140F" style={{ marginLeft: '2px' }} />
              </button>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#CBD5E1', textAlign: 'center' }}>
              {simulatedPlaying ? '▶ Looping demonstration form guide' : 'Click to preview proper range of motion'}
            </div>
          </div>
        </div>

        {/* Step Checkpoints */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F1F5F9', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Form Checkpoints ({checkedCheckpoints.length}/{machine.tutorialSteps.length})
            </span>
            <span style={{ fontSize: '0.78rem', color: '#00F59B', fontWeight: 600 }}>
              +5 XP on completion
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {machine.tutorialSteps.map((step, idx) => {
              const isChecked = checkedCheckpoints.includes(idx);
              return (
                <div
                  key={idx}
                  onClick={() => toggleCheckpoint(idx)}
                  style={{
                    background: isChecked ? 'rgba(0, 245, 155, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    border: isChecked ? '1px solid rgba(0, 245, 155, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '0.85rem 1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    border: isChecked ? 'none' : '2px solid #475569',
                    background: isChecked ? '#00F59B' : 'transparent',
                    color: '#05140F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '2px',
                    flexShrink: 0,
                    transition: 'all 0.15s'
                  }}>
                    {isChecked && <Check size={15} strokeWidth={3} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isChecked ? '#00F59B' : '#F1F5F9' }}>
                      Step {step.stepNumber}: {step.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px', lineHeight: 1.4 }}>
                      {step.description}
                    </div>
                    {step.tip && (
                      <div style={{ fontSize: '0.75rem', color: '#38BDF8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        💡 Pro Tip: {step.tip}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div style={{
          background: 'rgba(255, 184, 0, 0.08)',
          border: '1px solid rgba(255, 184, 0, 0.25)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          marginBottom: '1.25rem'
        }}>
          <AlertCircle size={18} color="#FFB800" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#E2E8F0', lineHeight: 1.35 }}>
            <strong>Safety Notice:</strong> Machine adjustments vary across gym brands. Always ask gym staff if you feel discomfort.
          </p>
        </div>

        {/* Finish Action */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ flex: 1 }}
          >
            Close
          </button>
          
          <button
            onClick={handleFinishTutorial}
            disabled={!allCheckpointsPassed && !alreadyDone}
            className="btn-primary"
            style={{ flex: 2 }}
          >
            {alreadyDone ? (
              <>
                <CheckCircle size={18} /> Tutorial Completed
              </>
            ) : allCheckpointsPassed ? (
              <>
                <Award size={18} /> Complete & Claim 5 XP
              </>
            ) : (
              `Check All ${machine.tutorialSteps.length} Points (${checkedCheckpoints.length}/${machine.tutorialSteps.length})`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
