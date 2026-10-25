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
  Home,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  isPro?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const { totalXP, currentLevel, userProfile } = useGym();
  const { isAuthenticated } = useAuth();

  // Synced user total XP and Level across all routes
  const displayXP = totalXP ?? userProfile?.totalXP ?? 0;
  const displayLevel = currentLevel?.level ?? userProfile?.currentLevel ?? 1;

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'scan', label: 'Scan Machine', icon: QrCode },
    { id: 'library', label: 'Machine Library', icon: BookOpen },
    // { id: 'routines', label: 'AI Routines', icon: Sparkles, isPro: true },
    { id: 'activity', label: 'My Activity', icon: History },
    { id: 'achievements', label: 'XP and Achievements', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleNavClick = (tabId: string) => {
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                background: 'linear-gradient(90deg, #FFFFFF 30%, #00F59B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }} className="text-sm sm:text-base md:text-[1.2rem] whitespace-nowrap">
                ScanFit
              </span>
              <span style={{
                fontSize: '0.55rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                lineHeight: 1,
                color: '#00F59B',
                background: 'rgba(0, 245, 155, 0.1)',
                border: '1px solid rgba(0, 245, 155, 0.28)',
                padding: '2px 5px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center'
              }}>
                BETA
              </span>
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
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={item.label}
                style={{
                  background: isActive ? 'rgba(0, 245, 155, 0.12)' : 'transparent',
                  color: isActive ? '#00F59B' : '#94A3B8',
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
                  position: 'relative'
                }}
              >
                <Icon size={15} />
                {item.label}
                {item.isPro && (
                  <span style={{
                    fontSize: '0.55rem',
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(99, 102, 241, 0.25))',
                    border: '1px solid rgba(168, 85, 247, 0.45)',
                    borderRadius: '6px',
                    color: '#C084FC',
                    padding: '1px 5px',
                    fontWeight: 800,
                    letterSpacing: '0.04em'
                  }}>
                    PRO
                  </span>
                )}
              </button>
            );
          })}

        </nav>

        {/* Right Controls: XP Pill & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* XP Level Pill */}
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
