import React from 'react';

interface ScanningLoaderProps {
  isScanning: boolean;
}

export default function ScanningLoader({ isScanning }: ScanningLoaderProps) {
  if (!isScanning) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 bg-[#0A0C0B]/90 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-[280px] bg-[#141716] border border-[#222624] rounded-3xl p-6 flex flex-col items-center gap-3.5 shadow-2xl text-center">
        {/* Clean Green Spinner */}
        <div className="relative w-11 h-11 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full border-2 border-[#222624] border-t-[#22C55E] animate-spin" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Identifying machine...
          </h3>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">
            Analyzing visual cues & structure
          </p>
        </div>
      </div>
    </div>
  );
}
