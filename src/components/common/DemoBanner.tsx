import React from 'react';

export const DemoBanner: React.FC = () => {

  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(0, 245, 155, 0.08) 0%, rgba(0, 210, 255, 0.08) 100%)',
      borderBottom: '1px solid rgba(0, 245, 155, 0.2)',
      padding: '0.45rem 1rem',
      fontSize: '0.78rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
      color: '#CBD5E1',
      position: 'relative',
      zIndex: 40
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {/* Replace old badge text */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ⚡ AI Vision Online · 50+ Gym Machines Supported
        </div>
      </div>

      {/* Right controls (removed Connect APIs and dismiss icon) */}
    </div>
  );
};
