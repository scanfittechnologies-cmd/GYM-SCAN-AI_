import React, { useEffect, useState } from 'react';
import { Dumbbell } from 'lucide-react';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [tickerMessage, setTickerMessage] = useState('Initializing gym scanner...');
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
        setTickerMessage('Calibrating gym equipment profiles...');
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
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center select-none bg-[#0A0C0B]"
      style={{
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.02)' : 'scale(1)',
        transition: 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm w-full">
        {/* Centered dark charcoal icon badge with crisp #22C55E dumbbell icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#141716] border border-[#222624] flex items-center justify-center mb-4 shadow-lg">
          <Dumbbell size={32} strokeWidth={2.4} className="text-[#22C55E]" />
        </div>

        {/* Brand Title & Subtitle */}
        <h1 className="font-black tracking-wider text-xl sm:text-2xl text-white uppercase mb-1">
          SCANFIT
        </h1>

        <p className="text-xs font-semibold text-[#9CA3AF] mb-6">
          Gym Equipment Scanner
        </p>

        {/* Dynamic Loading Status Text */}
        <div className="h-5 flex items-center justify-center mb-3">
          <p className="text-xs font-medium text-[#CBD5E1] tracking-tight">
            {tickerMessage}
          </p>
        </div>

        {/* Slim Progress Bar Container with Solid #22C55E Fill */}
        <div className="w-full max-w-[200px] bg-[#141716] rounded-full h-1.5 p-0 border border-[#222624] overflow-hidden relative">
          <div
            className="h-full bg-[#22C55E] rounded-full transition-all duration-75 ease-out"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        {/* Percentage Readout Cleanly Centered */}
        <div className="mt-2 text-[11px] font-mono text-[#9CA3AF] font-semibold">
          {progress}%
        </div>
      </div>
    </div>
  );
};
