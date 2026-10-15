import React from 'react';
import { ToastMessage } from '../../types';
import { Sparkles, Trophy, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

interface XPNotificationToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const XPNotificationToast: React.FC<XPNotificationToastProps> = ({ toast, onDismiss }) => {
  let borderColor = 'rgba(255, 255, 255, 0.15)';
  let bgGradient = 'linear-gradient(135deg, rgba(26, 32, 46, 0.96), rgba(18, 22, 32, 0.98))';
  let icon = <Info size={20} color="#00D2FF" />;

  if (toast.type === 'xp') {
    borderColor = 'rgba(0, 245, 155, 0.55)';
    bgGradient = 'linear-gradient(135deg, rgba(13, 36, 26, 0.96), rgba(8, 24, 18, 0.98))';
    icon = <Sparkles size={22} color="#00F59B" className="animate-pulse" />;
  } else if (toast.type === 'achievement') {
    borderColor = 'rgba(255, 184, 0, 0.65)';
    bgGradient = 'linear-gradient(135deg, rgba(46, 34, 10, 0.96), rgba(28, 20, 8, 0.98))';
    icon = <Trophy size={22} color="#FFB800" />;
  } else if (toast.type === 'success') {
    borderColor = 'rgba(0, 245, 155, 0.45)';
    icon = <CheckCircle size={20} color="#00F59B" />;
  } else if (toast.type === 'warning' || toast.type === 'error') {
    borderColor = 'rgba(255, 71, 87, 0.55)';
    icon = <AlertTriangle size={20} color="#FF4757" />;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        background: bgGradient,
        border: `1px solid ${borderColor}`,
        backdropFilter: 'blur(16px)',
        borderRadius: '16px',
        padding: '0.9rem 1.1rem',
        boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.7), 0 0 15px rgba(0, 245, 155, 0.1)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem',
        pointerEvents: 'auto',
        animation: 'fadeIn 0.25s ease-out',
        position: 'relative'
      }}
    >
      <div style={{ marginTop: '2px', flexShrink: 0 }}>
        {icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#F1F5F9', letterSpacing: '-0.01em' }}>
            {toast.title}
          </span>
          {toast.xpAmount !== undefined && (
            <span style={{
              background: 'rgba(0, 245, 155, 0.2)',
              color: '#00F59B',
              fontWeight: 900,
              fontSize: '0.78rem',
              padding: '2px 9px',
              borderRadius: '999px',
              border: '1px solid rgba(0, 245, 155, 0.4)',
              flexShrink: 0,
              boxShadow: '0 0 10px rgba(0, 245, 155, 0.2)'
            }}>
              +{toast.xpAmount} XP
            </span>
          )}
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.38 }}>
          {toast.message}
        </p>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: 'none',
          color: '#94A3B8',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: '4px',
          transition: 'all 0.15s'
        }}
        title="Dismiss alert"
      >
        <X size={14} />
      </button>
    </div>
  );
};
