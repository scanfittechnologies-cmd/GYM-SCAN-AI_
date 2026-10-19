import React, { useEffect, useState } from 'react';
import { Dumbbell, Sparkles } from 'lucide-react';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [tickerMessage, setTickerMessage] = useState('⚡ Initializing Gemini Vision AI...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Progress fill over ~1300ms
    const startTime = Date.now();
    const duration = 1350;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(currentProgress);

      if (elapsed >= 650) {
        setTickerMessage('🎯 Calibrating 50+ Gym Equipment Profiles...');
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete();
        }, 300); // 300ms smooth fadeout
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      id="intro-splash-overlay"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center select-none"
      style={{
        backgroundColor: '#0B0F17',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.03)' : 'scale(1)',
        transition: 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      {/* Background radial glow */}
      <div
        style={{
          position: 'absolute',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 245, 155, 0.15) 0%, rgba(0, 210, 255, 0.08) 45%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(35px)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm w-full">
        {/* Animated Glowing Logo Badge */}
        <div className="relative mb-6">
          {/* Outer Pulsing Glow Ring */}
          <div
            className="absolute -inset-3 rounded-3xl opacity-75 blur-md animate-pulse"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 245, 155, 0.6) 0%, rgba(0, 210, 255, 0.5) 100%)',
            }}
          />

          {/* Core Badge */}
          <div
            className="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,245,155,0.3)]"
            style={{
              background: 'linear-gradient(135deg, #00F59B 0%, #00D2FF 100%)',
              color: '#05140F',
              border: '2px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <Dumbbell size={42} strokeWidth={2.5} className="animate-bounce" />
          </div>
        </div>

        {/* Brand Title & Tagline */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="font-extrabold tracking-wider text-xl sm:text-2xl text-white font-['Outfit']">
            ScanFit
          </span>
          <Sparkles size={16} className="text-[#00F59B] animate-spin" />
        </div>

        <div className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-400 mb-8">
          Smart Equipment Vision Platform
        </div>

        {/* Dynamic High-Tech Ticker Text */}
        <div className="h-6 flex items-center justify-center mb-4">
          <p
            key={tickerMessage}
            className="text-xs sm:text-sm font-medium text-emerald-300 font-mono tracking-tight transition-all duration-200"
            style={{ textShadow: '0 0 12px rgba(0, 245, 155, 0.5)' }}
          >
            {tickerMessage}
          </p>
        </div>

        {/* Sleek Neon Progress Bar Container */}
        <div className="w-full max-w-[240px] bg-slate-800/80 rounded-full h-1.5 p-0.5 border border-slate-700/60 shadow-inner overflow-hidden relative">
          <div
            className="h-full rounded-full transition-all duration-75 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00F59B 0%, #00D2FF 100%)',
              boxShadow: '0 0 12px rgba(0, 245, 155, 0.8)',
            }}
          />
        </div>

        {/* Percentage Indicator */}
        <div className="mt-2 text-[10px] font-mono text-slate-500 font-medium">
          {progress}%
        </div>
      </div>
    </div>
  );
};
