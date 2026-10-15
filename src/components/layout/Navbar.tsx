import React from 'react';
import { useGym } from '../../context/GymContext';
import { useAuth } from '../../context/AuthContext';
import { UserMenu } from '../auth/UserMenu';
import { 
  Dumbbell, 
  Sparkles, 
  QrCode, 
  BookOpen, 
  History, 
  Trophy, 
  User, 
  Home,
  ShieldAlert,
  Crown
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const { totalXP, currentLevel, userProfile } = useGym();
  const { isAdmin } = useAuth();

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

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(10, 12, 16, 0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      width: '100%'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => onTabChange('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00F59B 0%, #00D2FF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#05140F',
            boxShadow: '0 0 16px rgba(0, 245, 155, 0.4)'
          }}>
            <Dumbbell size={22} strokeWidth={2.5} />
          </div>

          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              fontSize: '1.2rem',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              background: 'linear-gradient(90deg, #FFFFFF 30%, #00F59B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              GYM SCAN <span style={{ color: '#00F59B', WebkitTextFillColor: '#00F59B' }}>AI</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Equipment Vision & Guide
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
                onClick={() => onTabChange(item.id)}
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
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}

          {/* Admin Tab (Visible if Admin) */}
          {isAdmin && (
            <button
              onClick={() => onTabChange('admin')}
              style={{
                background: currentTab === 'admin' ? 'rgba(255, 184, 0, 0.2)' : 'rgba(255, 184, 0, 0.08)',
                color: '#FFB800',
                border: currentTab === 'admin' ? '1px solid #FFB800' : '1px solid rgba(255, 184, 0, 0.3)',
                borderRadius: '8px',
                padding: '0.5rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Crown size={15} color="#FFB800" />
              Admin
            </button>
          )}
        </nav>

        {/* Right Controls: XP Pill & UserMenu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* XP Level Pill */}
          <div 
            onClick={() => onTabChange('achievements')}
            style={{
              background: 'linear-gradient(135deg, rgba(22, 27, 38, 0.9), rgba(15, 20, 30, 0.9))',
              border: '1px solid rgba(0, 245, 155, 0.3)',
              borderRadius: '999px',
              padding: '4px 12px 4px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'rgba(0, 245, 155, 0.2)',
              color: '#00F59B',
              fontWeight: 800,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0, 245, 155, 0.4)'
            }}>
              L{displayLevel}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#00F59B' }}>
                  {displayXP}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>XP</span>
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
