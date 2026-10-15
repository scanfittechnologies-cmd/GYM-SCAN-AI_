import React, { useState } from 'react';
import { Machine } from '../../types';
import { useGym } from '../../context/GymContext';
import { X, AlertTriangle, Send } from 'lucide-react';

interface ReportModalProps {
  machine: Machine;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ machine, onClose }) => {
  const { reportMachineIssue } = useGym();
  const [issueType, setIssueType] = useState('Incorrect Setup / Pin');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    reportMachineIssue(machine.id, issueType, description);
    onClose();
  };

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
        border: '1px solid rgba(255, 71, 87, 0.3)',
        borderRadius: '20px',
        maxWidth: '480px',
        width: '100%',
        padding: '1.5rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(255, 71, 87, 0.15)',
              color: '#FF4757',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={18} />
            </div>
            <h3 style={{ fontSize: '1.1rem', color: '#F1F5F9', margin: 0 }}>Report Machine Info</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '1rem' }}>
          Help us improve instructions for <strong style={{ color: '#F1F5F9' }}>{machine.name}</strong>. Feedback is reviewed to ensure gym safety.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.4rem' }}>
              Issue Category
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="input-modern"
              style={{ padding: '0.65rem 0.85rem' }}
            >
              <option value="Incorrect Setup / Pin">Incorrect Setup / Pin instructions</option>
              <option value="Movement Guidance Error">Movement / Form correction needed</option>
              <option value="Muscle Group Mismatch">Wrong Primary/Secondary muscle label</option>
              <option value="Safety Risk">Unsafe recommendation or missing warning</option>
              <option value="Other">Other suggestion</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.4rem' }}>
              Details & Correction
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe what needs correction or specify the manufacturer model..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-modern"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1.5, background: 'linear-gradient(135deg, #FF4757, #FF6B81)', color: '#FFFFFF' }}
            >
              <Send size={16} /> Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
