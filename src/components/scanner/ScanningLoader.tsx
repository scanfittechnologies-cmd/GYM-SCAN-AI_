import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export const LOADING_STEPS = [
  "📸 Uploading image securely...",
  "🔍 Analyzing machine structure & cables...",
  "⚖️ Checking weight stacks and pads...",
  "📋 Verifying against allowed equipment list..."
];

interface ScanningLoaderProps {
  isScanning: boolean;
}

export default function ScanningLoader({ isScanning }: ScanningLoaderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isScanning) {
      setCurrentStepIndex(0);
      interval = setInterval(() => {
        setCurrentStepIndex((prevIndex) => (prevIndex + 1) % LOADING_STEPS.length);
      }, 2500); // Changes message every 2.5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning]);

  if (!isScanning) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 14, 0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, #101624 0%, #0B0F17 100%)',
          border: '1px solid rgba(0, 245, 155, 0.25)',
          borderRadius: '20px',
          padding: '2rem 1.75rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '380px',
          width: '90%',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 245, 155, 0.15)',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(0, 210, 255, 0.1)',
            border: '1px solid rgba(0, 210, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00D2FF',
            marginBottom: '1rem',
            boxShadow: '0 0 20px rgba(0, 210, 255, 0.25)'
          }}
        >
          <Loader2 size={32} className="spin-animation" style={{ animation: 'spin 1.2s linear infinite' }} />
        </div>

        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: '#F8FAFC',
            margin: '0 0 0.5rem 0',
            letterSpacing: '-0.02em'
          }}
        >
          AI Vision Scanning
        </h3>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0, 245, 155, 0.1)',
            border: '1px solid rgba(0, 245, 155, 0.2)',
            borderRadius: '999px',
            padding: '0.25rem 0.75rem',
            fontSize: '0.72rem',
            color: '#00F59B',
            fontWeight: 600,
            marginBottom: '1rem'
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00F59B', animation: 'pulse 1.2s infinite' }} />
          Vision Scanner Active
        </div>

        <p
          key={currentStepIndex}
          style={{
            fontSize: '0.92rem',
            color: '#CBD5E1',
            margin: '0',
            minHeight: '2.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1.45,
            animation: 'fadeIn 0.3s ease-in-out'
          }}
        >
          {LOADING_STEPS[currentStepIndex]}
        </p>

        {/* Progress step indicators */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '1.25rem' }}>
          {LOADING_STEPS.map((_, idx) => (
            <span
              key={idx}
              style={{
                width: idx === currentStepIndex ? '20px' : '6px',
                height: '6px',
                borderRadius: '999px',
                background: idx === currentStepIndex ? '#00D2FF' : 'rgba(255, 255, 255, 0.15)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
