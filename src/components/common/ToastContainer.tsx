import React from 'react';
import { useGym } from '../../context/GymContext';
import { XPNotificationToast } from './XPNotificationToast';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useGym();

  if (toasts.length === 0) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '400px',
        width: 'calc(100vw - 2.5rem)',
        pointerEvents: 'none'
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <XPNotificationToast
            toast={toast}
            onDismiss={removeToast}
          />
        </div>
      ))}
    </div>
  );
};
