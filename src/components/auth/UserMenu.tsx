import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface UserMenuProps {
  onNavigate: (tab: string) => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const athleteName = user?.displayName || 'Athlete';
  const initial = athleteName.charAt(0).toUpperCase();

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => onNavigate('profile')}
        className="flex items-center text-[10px] sm:text-xs px-2 py-1 gap-1.5 shrink-0"
        title="View Profile & Settings"
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
          className="w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-xs rounded-md bg-[#23272F] text-white font-bold flex items-center justify-center border border-[#2E3440]"
        >
          {initial}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
          <span className="font-semibold text-white max-w-[65px] sm:max-w-[100px] truncate leading-tight text-[10px] sm:text-xs">
            {athleteName}
          </span>
          <span 
            className="font-medium uppercase leading-none text-[8px] sm:text-[9px] text-[#9CA3AF]"
          >
            Athlete
          </span>
        </div>
      </button>
    </div>
  );
};
