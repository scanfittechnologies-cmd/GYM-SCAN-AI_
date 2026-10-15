import React from 'react';
import { Home, QrCode, BookOpen, History, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'scan', label: 'Scan', icon: QrCode, isSpecial: true },
    { id: 'activity', label: 'Activity', icon: History },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'rgba(10, 12, 16, 0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.09)',
        padding: '0.4rem 0.75rem calc(0.5rem + env(safe-area-inset-bottom, 0px)) 0.75rem',
        boxShadow: '0 -10px 32px rgba(0, 0, 0, 0.65)'
      }}
      className="mobile-bottom-nav"
    >
      <div style={{
        maxWidth: '540px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isSpecial) {
            return (
              <div
                key={tab.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginTop: '-24px',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                <button
                  type="button"
                  id="mobile-nav-scan-btn"
                  aria-label="Open Scanner"
                  onClick={() => onTabChange(tab.id)}
                  style={{
                    background: isActive 
                      ? 'linear-gradient(135deg, #00FFB2 0%, #00D2FF 100%)' 
                      : 'linear-gradient(135deg, #00F59B 0%, #00D2FF 100%)',
                    color: '#05140F',
                    border: '3px solid #0A0C10',
                    borderRadius: '50%',
                    width: '58px',
                    height: '58px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: isActive
                      ? '0 0 24px rgba(0, 245, 155, 0.7), 0 8px 20px rgba(0, 0, 0, 0.6)'
                      : '0 0 16px rgba(0, 245, 155, 0.45), 0 6px 16px rgba(0, 0, 0, 0.5)',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    outline: 'none'
                  }}
                >
                  <Icon size={28} strokeWidth={2.6} />
                </button>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: isActive ? '#00F59B' : '#CBD5E1',
                  marginTop: '3px',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}>
                  Scan
                </span>
              </div>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              id={`mobile-nav-${tab.id}-btn`}
              aria-label={`Navigate to ${tab.label}`}
              onClick={() => onTabChange(tab.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isActive ? '#00F59B' : '#94A3B8',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '0.45rem 0.6rem',
                minWidth: '56px',
                minHeight: '48px',
                cursor: 'pointer',
                borderRadius: '12px',
                transition: 'all 0.18s ease',
                position: 'relative',
                outline: 'none'
              }}
            >
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{
                    filter: isActive ? 'drop-shadow(0 0 8px rgba(0, 245, 155, 0.5))' : 'none',
                    transition: 'filter 0.2s ease'
                  }}
                />
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    top: -5,
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: '#00F59B',
                    boxShadow: '0 0 6px #00F59B'
                  }} />
                )}
              </div>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '-0.01em',
                color: isActive ? '#00F59B' : '#94A3B8'
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <style>{`
        @media (min-width: 860px) {
          .mobile-bottom-nav {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};

