import React, { useState } from 'react';
import { Database, Sparkles, ChevronRight, X } from 'lucide-react';

interface DemoBannerProps {
  onOpenSettings?: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onOpenSettings }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

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

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#00D2FF',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.75rem',
              padding: '2px 4px'
            }}
          >
            <Database size={12} />
            Connect APIs <ChevronRight size={12} />
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Dismiss banner"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
};
