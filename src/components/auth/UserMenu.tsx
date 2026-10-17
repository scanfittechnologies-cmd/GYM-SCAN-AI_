import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  LogOut, 
  Settings, 
  ChevronDown
} from 'lucide-react';

interface UserMenuProps {
  onNavigate: (tab: string) => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, signOut, openAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={() => openAuthModal('signin')}
        className="btn-primary text-[10px] sm:text-xs px-2 py-1 gap-1.5"
      >
        <User size={13} /> Sign In
      </button>
    );
  }

  const initial = (user.displayName || user.email).charAt(0).toUpperCase();

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-[10px] sm:text-xs px-2 py-1 gap-1.5 shrink-0"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
      >
        {/* Avatar Bubble */}
        <div 
          className="w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-xs rounded-md"
          style={{
            background: 'linear-gradient(135deg, #00F59B 0%, #00D2FF 100%)',
            color: '#05140F',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 8px rgba(0, 245, 155, 0.25)'
          }}
        >
          {initial}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
          <span className="font-bold text-[#F1F5F9] max-w-[65px] sm:max-w-[100px] truncate leading-tight text-[10px] sm:text-xs">
            {user.displayName}
          </span>
          <span 
            className="font-extrabold uppercase leading-none text-[8px] sm:text-[9px]"
            style={{ color: '#00F59B' }}
          >
            Athlete
          </span>
        </div>

        <ChevronDown size={12} color="#94A3B8" className="shrink-0" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="glass-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '230px',
            padding: '0.65rem',
            borderRadius: '16px',
            background: 'rgba(15, 23, 42, 0.98)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.7)',
            zIndex: 9999,
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {/* User info banner */}
          <div style={{ padding: '0.5rem 0.6rem 0.75rem 0.6rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '0.4rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#F1F5F9' }}>{user.displayName}</div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', wordBreak: 'break-all' }}>{user.email}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {/* Profile & Settings */}
            <button
              onClick={() => { onNavigate('profile'); setIsOpen(false); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#CBD5E1',
                borderRadius: '8px',
                padding: '0.55rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Settings size={15} color="#00F59B" /> Profile & Settings
            </button>

            {/* Sign Out */}
            <button
              onClick={() => { signOut(); setIsOpen(false); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FF6B81',
                borderRadius: '8px',
                padding: '0.55rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 71, 87, 0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
