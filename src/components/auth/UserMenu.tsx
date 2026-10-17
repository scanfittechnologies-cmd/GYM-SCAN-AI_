import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  LogOut, 
  ShieldCheck, 
  Settings, 
  Sparkles, 
  ChevronDown, 
  KeyRound,
  Layers,
  Crown
} from 'lucide-react';

interface UserMenuProps {
  onNavigate: (tab: string) => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, role, isAdmin, signOut, openAuthModal, setDevRole } = useAuth();
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
          border: isAdmin ? '1.5px solid rgba(255, 184, 0, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
      >
        {/* Avatar Bubble */}
        <div 
          className="w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-xs rounded-md"
          style={{
            background: isAdmin 
              ? 'linear-gradient(135deg, #FFB800 0%, #FF8800 100%)' 
              : 'linear-gradient(135deg, #00F59B 0%, #00D2FF 100%)',
            color: '#05140F',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isAdmin ? '0 0 8px rgba(255, 184, 0, 0.3)' : '0 0 8px rgba(0, 245, 155, 0.25)'
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
            style={{
              color: isAdmin ? '#FFB800' : '#00F59B'
            }}
          >
            {isAdmin ? '🛡️ Admin' : 'Athlete'}
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
            {/* Admin Console (if Admin) */}
            {isAdmin && (
              <button
                onClick={() => { onNavigate('admin'); setIsOpen(false); }}
                style={{
                  background: 'rgba(255, 184, 0, 0.1)',
                  border: '1px solid rgba(255, 184, 0, 0.25)',
                  color: '#FFB800',
                  borderRadius: '8px',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                <Crown size={15} color="#FFB800" /> Admin Console
              </button>
            )}

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

            {/* Test Role Toggle (Dev Switcher) */}
            <div style={{ padding: '0.4rem 0.6rem', margin: '0.3rem 0', borderTop: '1px solid rgba(255, 255, 255, 0.06)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>
                Sandbox Role Test
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setDevRole('admin')}
                  style={{
                    flex: 1,
                    padding: '3px',
                    borderRadius: '6px',
                    fontSize: '0.68rem',
                    border: 'none',
                    background: role === 'admin' ? 'rgba(255, 184, 0, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: role === 'admin' ? '#FFB800' : '#94A3B8',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setDevRole('user')}
                  style={{
                    flex: 1,
                    padding: '3px',
                    borderRadius: '6px',
                    fontSize: '0.68rem',
                    border: 'none',
                    background: role === 'user' ? 'rgba(0, 245, 155, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: role === 'user' ? '#00F59B' : '#94A3B8',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  User
                </button>
              </div>
            </div>

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
