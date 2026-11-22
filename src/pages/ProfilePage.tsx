import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { useAuth } from '../context/AuthContext';
import { Machine } from '../types';
import { 
  Trash2, 
  AlertTriangle, 
  Check, 
  Star 
} from 'lucide-react';
import { MachineCard } from '../components/machines/MachineCard';

interface ProfilePageProps {
  onSelectMachine: (machine: Machine) => void;
  onNavigate: (tab: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onSelectMachine, onNavigate }) => {
  const { 
    userProfile, 
    updateUserProfile, 
    totalXP, 
    discoveredMachineIds, 
    favoriteMachineIds, 
    achievements, 
    machines, 
    clearAllUserData 
  } = useGym();

  const { user } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || userProfile.displayName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites'>('profile');

  const favoriteMachines = machines.filter(m => favoriteMachineIds.includes(m.id));
  const unlockedAchievementsCount = achievements.filter(a => a.unlocked).length;

  const displayTotalXP = totalXP ?? 0;
  const displayDiscoveredCount = discoveredMachineIds?.length ?? 0;
  const displayBadgesCount = unlockedAchievementsCount ?? 0;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim()) {
      updateUserProfile({ displayName: displayName.trim() });
      setIsEditingName(false);
    }
  };

  const activeName = user?.displayName || userProfile.displayName || 'Alex';
  const initial = activeName.charAt(0).toUpperCase();

  return (
    <div className="w-full flex flex-col gap-4 pb-12 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Profile & App Preferences
          </h1>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Manage athlete profile & local app data
          </p>
        </div>
      </div>

      {/* Sub Tabs: User & Settings / Saved Routine */}
      <div className="grid grid-cols-2 gap-1.5 bg-[#101211] p-1 rounded-2xl border border-[#222624]">
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-2 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40 shadow-sm'
              : 'text-[#9CA3AF] hover:text-white border border-transparent'
          }`}
        >
          User & Settings
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`py-2 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'favorites'
              ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40 shadow-sm'
              : 'text-[#9CA3AF] hover:text-white border border-transparent'
          }`}
        >
          <Star size={13} className={activeTab === 'favorites' ? 'fill-[#22C55E]' : ''} />
          <span>Saved Routine ({favoriteMachines.length})</span>
        </button>
      </div>

      {/* 1. Main Profile & Settings Tab */}
      {activeTab === 'profile' && (
        <div className="flex flex-col gap-3.5">
          
          {/* Clean Native Profile Card (#141716 bg, 1px #222624 border) */}
          <div className="bg-[#141716] border border-[#222624] rounded-3xl p-4 sm:p-5 flex flex-col gap-4">
            
            {/* User Identity Row */}
            <div className="flex items-center gap-3.5">
              {/* Circular dark avatar badge with crisp #22C55E border & text */}
              <div className="w-14 h-14 rounded-2xl bg-[#0A0C0B] border border-[#22C55E]/40 text-[#22C55E] font-black text-xl flex items-center justify-center shrink-0">
                {initial}
              </div>

              <div className="flex-1 min-w-0">
                {isEditingName ? (
                  <form onSubmit={handleSaveName} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-[#0A0C0B] border border-[#22C55E] text-white text-xs font-bold rounded-lg px-2.5 py-1 outline-none w-36"
                      autoFocus
                    />
                    <button 
                      type="submit" 
                      className="px-2.5 py-1 rounded-lg bg-[#22C55E] text-black font-bold text-xs flex items-center justify-center cursor-pointer"
                    >
                      <Check size={14} />
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-white truncate">
                      {activeName}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(true)}
                      className="text-xs font-semibold text-[#22C55E] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                )}
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                    Athlete
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Summary Metrics: Crisp pure white numbers with muted gray labels */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#222624]">
              <div className="bg-[#101211] border border-[#1E2220] rounded-xl p-2.5 text-center flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white tracking-tight">{displayTotalXP}</span>
                <span className="text-xs text-[#9CA3AF] mt-0.5 font-medium">Total XP</span>
              </div>

              <div className="bg-[#101211] border border-[#1E2220] rounded-xl p-2.5 text-center flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white tracking-tight">{displayDiscoveredCount}</span>
                <span className="text-xs text-[#9CA3AF] mt-0.5 font-medium">Discovered</span>
              </div>

              <div className="bg-[#101211] border border-[#1E2220] rounded-xl p-2.5 text-center flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white tracking-tight">{displayBadgesCount}</span>
                <span className="text-xs text-[#9CA3AF] mt-0.5 font-medium">Badges</span>
              </div>
            </div>

          </div>

          {/* Reset Activity Data Card */}
          <div className="bg-[#141716] border border-red-500/25 rounded-3xl p-4 flex flex-col gap-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <Trash2 size={14} />
              <span>Reset Local Activity Data</span>
            </h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Clear all locally stored scan history, completed tutorial checklists, saved favorites, and earned XP.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 hover:text-red-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-[0.99]"
              >
                <Trash2 size={14} />
                <span>Clear All Saved Activity & Progress</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 2. Saved Favorites Tab */}
      {activeTab === 'favorites' && (
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Your Saved Routine ({favoriteMachines.length})
            </h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Quick access to your curated workout machines and form reminders.
            </p>
          </div>

          {favoriteMachines.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5">
              {favoriteMachines.map((m) => (
                <MachineCard
                  key={m.id}
                  machine={m}
                  onSelect={onSelectMachine}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#141716] border border-[#222624] rounded-3xl p-8 text-center flex flex-col items-center gap-2">
              <Star size={28} className="text-[#64748B]" />
              <h4 className="text-sm font-bold text-white mt-1">
                No Machines Saved Yet
              </h4>
              <p className="text-xs text-[#9CA3AF] max-w-[240px] leading-relaxed">
                Tap the star icon on any machine detail page to bookmark it in your routine (+2 XP).
              </p>
              <button
                type="button"
                onClick={() => onNavigate('library')}
                className="mt-2 px-4 py-2 rounded-xl bg-[#22C55E] hover:bg-[#1ED760] text-black font-bold text-xs cursor-pointer transition-all"
              >
                Browse Library
              </button>
            </div>
          )}
        </div>
      )}

      {/* Clear Data Confirmation Modal */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 bg-[#05070A]/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141716] border border-red-500/40 rounded-3xl max-w-sm w-full p-5 text-center flex flex-col items-center gap-3 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-base font-bold text-white">
              Are you sure you want to reset?
            </h3>

            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              This will permanently delete all scan records, XP milestones, and saved routines from your browser cache.
            </p>

            <div className="grid grid-cols-2 gap-2 w-full pt-1">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="py-2.5 px-3 rounded-xl bg-[#101211] border border-[#222624] text-xs font-semibold text-[#CBD5E1] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllUserData();
                  setShowClearConfirmModal(false);
                }}
                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// UserProfile alias export for flexibility
export const UserProfile = ProfilePage;
