import React, { useState } from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle, X } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy'
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 7, 12, 0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 10001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          borderRadius: '24px',
          border: '1px solid rgba(0, 245, 155, 0.35)',
          background: 'linear-gradient(135deg, rgba(16, 24, 38, 0.98) 0%, rgba(9, 13, 22, 0.99) 100%)',
          boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.85), 0 0 35px rgba(0, 245, 155, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00F59B 0%, #00D2FF 100%)',
              color: '#05140F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(0, 245, 155, 0.3)'
            }}>
              <ShieldCheck size={22} strokeWidth={2.4} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#F1F5F9', margin: 0, fontWeight: 800 }}>
                {activeTab === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#00F59B', fontWeight: 600 }}>
                ScanFit Security & Privacy Commitment
              </span>
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
            title="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: 'flex',
          padding: '0.75rem 1.5rem 0 1.5rem',
          gap: '0.5rem'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '10px',
              border: activeTab === 'privacy' ? '1px solid rgba(0, 245, 155, 0.3)' : '1px solid transparent',
              background: activeTab === 'privacy' ? 'rgba(0, 245, 155, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: activeTab === 'privacy' ? '#00F59B' : '#94A3B8',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <Lock size={14} /> Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '10px',
              border: activeTab === 'terms' ? '1px solid rgba(0, 210, 255, 0.3)' : '1px solid transparent',
              background: activeTab === 'terms' ? 'rgba(0, 210, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: activeTab === 'terms' ? '#00D2FF' : '#94A3B8',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <FileText size={14} /> Terms of Service
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            fontSize: '0.84rem',
            color: '#CBD5E1',
            lineHeight: 1.6,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {activeTab === 'privacy' ? (
            <>
              {/* Highlighted Guarantee Box */}
              <div
                style={{
                  background: 'rgba(0, 245, 155, 0.08)',
                  border: '1px solid rgba(0, 245, 155, 0.3)',
                  borderRadius: '14px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <CheckCircle size={20} color="#00F59B" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.85rem', color: '#F1F5F9', fontWeight: 600 }}>
                  ScanFit respects your privacy. Photos captured for equipment scanning are processed strictly in real-time in-memory and are never stored, saved, or shared on external servers.
                </div>
              </div>

              <div>
                <h4 style={{ color: '#F1F5F9', margin: '0 0 0.35rem 0', fontSize: '0.92rem', fontWeight: 700 }}>
                  1. Ephemeral In-Memory Image Processing
                </h4>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem' }}>
                  When you point your camera or upload a gym equipment photo, our application performs instant image compression and identification strictly in temporary memory. Image frames are immediately cleared and destroyed as soon as analysis is complete. We do not store biometric data or personal gym footage.
                </p>
              </div>

              <div>
                <h4 style={{ color: '#F1F5F9', margin: '0 0 0.35rem 0', fontSize: '0.92rem', fontWeight: 700 }}>
                  2. Camera Feed Control & Permissions
                </h4>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem' }}>
                  Camera access is only activated when you explicitly launch the Scanner. Video stream tracks are immediately stopped and terminated whenever you exit or close the scanner view, ensuring complete camera privacy.
                </p>
              </div>

              <div>
                <h4 style={{ color: '#F1F5F9', margin: '0 0 0.35rem 0', fontSize: '0.92rem', fontWeight: 700 }}>
                  3. Secure User Authentication & Local Storage
                </h4>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem' }}>
                  Passwords are cryptographic hashes calculated using SHA-256 with client-side salt. Plaintext passwords are never logged, inspected, or transmitted. Your workout logs and scanned achievements remain stored locally within your browser.
                </p>
              </div>

              <div>
                <h4 style={{ color: '#F1F5F9', margin: '0 0 0.35rem 0', fontSize: '0.92rem', fontWeight: 700 }}>
                  4. Third-Party API Privacy & Network Isolation
                </h4>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem' }}>
                  All AI vision queries are routed via secure HTTPS endpoints. Payloads contain strictly the image data required for machine identification, without any user telemetry, geolocation, or personal identifier metadata.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 style={{ color: '#F1F5F9', margin: '0 0 0.35rem 0', fontSize: '0.92rem', fontWeight: 700 }}>
                  1. Educational & Guidance Use Only
                </h4>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem' }}>
                  ScanFit provides educational equipment identification, muscle tracking guidance, and exercise tutorials. It is not a substitute for certified medical, physical therapy, or professional coaching advice.
                </p>
              </div>

              <div>
                <h4 style={{ color: '#F1F5F9', margin: '0 0 0.35rem 0', fontSize: '0.92rem', fontWeight: 700 }}>
                  2. Gym Facility Safety & Etiquette
                </h4>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem' }}>
                  Always inspect equipment pins, latches, safety stops, and cable integrity prior to lifting. When scanning machines, be mindful of fellow gym members and adhere to facility photography policies.
                </p>
              </div>

              <div>
                <h4 style={{ color: '#F1F5F9', margin: '0 0 0.35rem 0', fontSize: '0.92rem', fontWeight: 700 }}>
                  3. User Accounts & Fair Usage
                </h4>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem' }}>
                  Users agree to provide accurate registration information and refrain from submitting malicious files or attempting unauthorized access to ScanFit services and APIs.
                </p>
              </div>

              <div>
                <h4 style={{ color: '#F1F5F9', margin: '0 0 0.35rem 0', fontSize: '0.92rem', fontWeight: 700 }}>
                  4. Limitation of Liability
                </h4>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem' }}>
                  Athletes assume all inherent risks associated with weightlifting and physical exercise. ScanFit is not liable for injuries resulting from improper exercise execution or equipment misuse.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(5, 7, 12, 0.5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
            Last revised: October 2026
          </span>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '0.45rem 1.25rem', fontSize: '0.82rem' }}
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
