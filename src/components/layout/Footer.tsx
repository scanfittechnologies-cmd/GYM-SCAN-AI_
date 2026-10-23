import React, { useState } from 'react';
import { Dumbbell, Lock, FileText } from 'lucide-react';
import { PrivacyModal } from '../common/PrivacyModal';

interface FooterProps {
  onNavigate?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [privacyTab, setPrivacyTab] = useState<'privacy' | 'terms'>('privacy');

  return (
    <>
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(8, 11, 18, 0.85)',
          backdropFilter: 'blur(10px)',
          padding: '2rem 1.25rem 3rem 1.25rem',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: '#64748B',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          alignItems: 'center',
          marginTop: 'auto',
          width: '100%'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Dumbbell size={16} color="#00F59B" />
          <span style={{ fontWeight: 800, color: '#F1F5F9', letterSpacing: '0.02em' }}>ScanFit AI</span>
          <span style={{ color: '#475569' }}>&mdash; Smart Gym Equipment Guide</span>
        </div>

        <div style={{ color: '#94A3B8', fontSize: '0.75rem', maxWidth: '520px', lineHeight: 1.5 }}>
          Real-time ephemeral camera scanning. Image feeds are processed in-memory and never stored on external servers.
        </div>

        {/* Navigation & Legal Links */}
        <div style={{
          display: 'flex',
          gap: '1.25rem',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginTop: '0.25rem'
        }}>
          {onNavigate && (
            <>
              <button
                type="button"
                onClick={() => onNavigate('home')}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.78rem', padding: 0 }}
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => onNavigate('library')}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.78rem', padding: 0 }}
              >
                Machine Library
              </button>
              <button
                type="button"
                onClick={() => onNavigate('pricing')}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.78rem', padding: 0 }}
              >
                Pricing
              </button>
              <span style={{ color: '#334155' }}>•</span>
            </>
          )}

          <button
            type="button"
            onClick={() => { setPrivacyTab('privacy'); setShowPrivacyModal(true); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#00F59B',
              cursor: 'pointer',
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: 0,
              textDecoration: 'underline'
            }}
          >
            <Lock size={12} /> Privacy Policy
          </button>

          <span style={{ color: '#334155' }}>•</span>

          <button
            type="button"
            onClick={() => { setPrivacyTab('terms'); setShowPrivacyModal(true); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#00D2FF',
              cursor: 'pointer',
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: 0,
              textDecoration: 'underline'
            }}
          >
            <FileText size={12} /> Terms of Service
          </button>
        </div>

        <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.4rem' }}>
          &copy; {new Date().getFullYear()} ScanFit Technologies. All rights reserved.
        </div>
      </footer>

      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        initialTab={privacyTab}
      />
    </>
  );
};
