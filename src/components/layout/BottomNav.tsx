import React from 'react';
import { Home, BookOpen, Camera, History, Trophy } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  // Mobile bottom tab bar with 5 concise items: Home, Library, Scan, Activity, Badges
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'scan', label: 'Scan', icon: Camera, isCenterScan: true },
    { id: 'activity', label: 'Activity', icon: History },
    { id: 'achievements', label: 'Badges', icon: Trophy },
  ];

  const handleTabPress = (tabId: string) => {
    onTabChange(tabId);
  };

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
    >
      <div className="w-full max-w-[430px] mx-auto pointer-events-auto bg-[#0A0C0B]/95 backdrop-blur-md border-t border-[#222624] px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] flex items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isCenterScan) {
            return (
              <button
                key={tab.id}
                type="button"
                id="mobile-nav-scan-btn"
                aria-label="Open Scanner"
                onClick={() => handleTabPress(tab.id)}
                className="flex flex-col items-center justify-center -mt-5 relative z-10 cursor-pointer px-1 shrink-0"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-[#0A0C0B] transition-transform active:scale-95 ${
                    isActive
                      ? 'bg-[#1ED760] text-black shadow-[0_0_16px_rgba(30,215,96,0.35)]'
                      : 'bg-[#22C55E] text-black'
                  }`}
                  style={{ width: '48px', height: '48px' }}
                >
                  <Icon size={22} strokeWidth={2.4} />
                </div>
                <span className="text-[10px] font-semibold tracking-wider text-[#9CA3AF] mt-0.5">
                  Scan
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              id={`mobile-nav-${tab.id}-btn`}
              aria-label={`Navigate to ${tab.label}`}
              onClick={() => handleTabPress(tab.id)}
              className="flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl cursor-pointer transition-colors flex-1"
            >
              <Icon
                size={19}
                strokeWidth={isActive ? 2.4 : 1.8}
                className={isActive ? 'text-[#22C55E]' : 'text-[#6B7280]'}
              />
              <span
                className={`text-[10px] font-medium tracking-tight text-center leading-tight truncate ${
                  isActive ? 'text-[#22C55E] font-semibold' : 'text-[#6B7280]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
