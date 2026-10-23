import React from 'react';
import { useGym } from '../../context/GymContext';
import { useAuth } from '../../context/AuthContext';
import { UserMenu } from '../auth/UserMenu';
import { 
  Dumbbell, 
  QrCode, 
  BookOpen, 
  History, 
  Trophy, 
  User, 
  Home
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

// Desktop nav tabs that require authentication
const AUTH_GATED_NAV = ['activity', 'achievements', 'profile'];

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const { totalXP, currentLevel, userProfile } = useGym();
  const { isAuthenticated, openSoftGate, openAuthModal } = useAuth();

  // Synced user total XP and Level across all routes
  const displayXP = totalXP || userProfile?.totalXP || 95;
  const displayLevel = currentLevel?.level || userProfile?.currentLevel || 1;

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'scan', label: 'Scan Machine', icon: QrCode },
    { id: 'library', label: 'Machine Library', icon: BookOpen },
    { id: 'activity', label: 'My Activity', icon: History },
    { id: 'achievements', label: 'XP and Achievements', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleNavClick = (tabId: string) => {
    if (!isAuthenticated && AUTH_GATED_NAV.includes(tabId)) {
      const messages: Record<string, string> = {
        activity: 'Create a free account to save your scan history and track your progress!',
        achievements: 'Create a free account to earn XP, unlock badges, and track your streak!',
        profile: 'Create a free account to set up your athlete profile!',
      };
      openSoftGate(messages[tabId] || 'Create a free account to access this feature!', 'signup');
    }
    // Always navigate — the page handles the gating visually
    onTabChange(tabId);
  };

  return (
    <header 
      className="sticky top-0 z-50 w-full h-[52px] max-h-[52px] flex items-center"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(10, 12, 16, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        width: '100%',
        height: '52px',
        maxHeight: '52px'
      }}
    >
      <div className="w-full max-w-[1280px] h-full mx-auto px-2 sm:px-3 md:px-5 flex items-center justify-between gap-1.5 sm:gap-2 md:gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => onTabChange('home')}
          className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 cursor-pointer select-none shrink-0"
        >
          <div 
            className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9"
            style={{
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00F59B 0%, #00D2FF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#05140F',
              boxShadow: '0 0 12px rgba(0, 245, 155, 0.35)',
              flexShrink: 0
            }}
          >
            <Dumbbell className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" strokeWidth={2.5} />
          </div>

          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              background: 'linear-gradient(90deg, #FFFFFF 30%, #00F59B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }} className="text-sm sm:text-base md:text-[1.2rem] whitespace-nowrap">
              ScanFit
            </div>
            <div className="text-[0.55rem] sm:text-[0.6rem] md:text-[0.65rem] text-[#64748B] font-semibold tracking-wider uppercase hidden sm:block">
              Smart Gym Equipment Guide
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '4px 6px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }} className="desktop-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isGated = !isAuthenticated && AUTH_GATED_NAV.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isGated ? `${item.label} (sign in required)` : item.label}
                style={{
                  background: isActive ? 'rgba(0, 245, 155, 0.12)' : 'transparent',
                  color: isActive ? '#00F59B' : isGated ? '#475569' : '#94A3B8',
                  border: isActive ? '1px solid rgba(0, 245, 155, 0.25)' : '1px solid transparent',
                  borderRadius: '8px',
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  opacity: isGated ? 0.55 : 1,
                  position: 'relative'
                }}
              >
                <Icon size={15} />
                {item.label}
                {/* Sign-in CTA badge for gated tabs */}
                {isGated && (
                  <span style={{
                    fontSize: '0.55rem',
                    background: 'rgba(0, 245, 155, 0.15)',
                    border: '1px solid rgba(0, 245, 155, 0.25)',
                    borderRadius: '6px',
                    color: '#00F59B',
                    padding: '1px 4px',
                    fontWeight: 700,
                    letterSpacing: '0.02em'
                  }}>
                    FREE
                  </span>
                )}
              </button>
            );
          })}

        </nav>

        {/* Right Controls: XP Pill & UserMenu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* XP Level Pill — only show when authenticated */}
          {isAuthenticated && (
            <div 
              onClick={() => onTabChange('achievements')}
              style={{
                background: 'linear-gradient(135deg, rgba(22, 27, 38, 0.9), rgba(15, 20, 30, 0.9))',
                border: '1px solid rgba(0, 245, 155, 0.3)',
                borderRadius: '999px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
              className="flex items-center text-[10px] sm:text-xs px-2 py-1 gap-1.5 shrink-0"
            >
              <div 
                className="w-5 h-5 sm:w-6 sm:h-6 text-[9px] sm:text-[11px]"
                style={{
                  borderRadius: '50%',
                  background: 'rgba(0, 245, 155, 0.2)',
                  color: '#00F59B',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(0, 245, 155, 0.4)'
                }}
              >
                L{displayLevel}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span className="font-extrabold text-[#00F59B] text-[10px] sm:text-xs">
                    {displayXP}
                  </span>
                  <span className="text-[#94A3B8] font-semibold text-[8px] sm:text-[10px]">XP</span>
                </div>
              </div>
            </div>
          )}

          {/* Guest Sign-In Prompt — shown when unauthenticated */}
          {!isAuthenticated && (
            <button
              onClick={() => openAuthModal('signup')}
              style={{
                background: 'linear-gradient(135deg, rgba(0, 245, 155, 0.12) 0%, rgba(0, 210, 255, 0.08) 100%)',
                border: '1px solid rgba(0, 245, 155, 0.3)',
                borderRadius: '999px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#00F59B',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap'
              }}
              className="shrink-0 hidden sm:flex"
            >
              ✦ Join Free
            </button>
          )}

          {/* User Menu Dropdown */}
          <UserMenu onNavigate={onTabChange} />
        </div>
      </div>

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};
