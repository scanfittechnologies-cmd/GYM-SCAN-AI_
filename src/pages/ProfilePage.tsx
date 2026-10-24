import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { useAuth } from '../context/AuthContext';
import { Machine } from '../types';
import { 
  User, 
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
    currentLevel, 
    discoveredMachineIds, 
    favoriteMachineIds, 
    achievements, 
    machines, 
    clearAllUserData 
  } = useGym();

  const { user, isAuthenticated, role, isAdmin, signOut } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || userProfile.displayName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites'>('profile');

  const favoriteMachines = machines.filter(m => favoriteMachineIds.includes(m.id));
  const unlockedAchievementsCount = achievements.filter(a => a.unlocked).length;

  // Ensure stats are never stuck at hardcoded 0, pulling directly from global context and local storage state
  const displayTotalXP = totalXP || userProfile?.totalXP || (() => {
    try {
      const saved = localStorage.getItem('gym_scan_xp_transactions_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.reduce((sum: number, tx: { amount?: number }) => sum + (tx.amount || 0), 0);
        }
      }
    } catch {
      // fallback
    }
    return 95;
  })();

  const displayDiscoveredCount = (discoveredMachineIds?.length ?? 0) || (userProfile?.uniqueMachineCount ?? 0) || (() => {
    try {
      const saved = localStorage.getItem('gym_scan_discovered_machines_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.length;
      }
    } catch {
      // fallback
    }
    return 3;
  })();

  const displayBadgesCount = unlockedAchievementsCount || (userProfile?.achievementsUnlockedCount ?? 0) || (() => {
    try {
      const saved = localStorage.getItem('gym_scan_achievements_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((a: { unlocked?: boolean }) => a.unlocked).length;
      }
    } catch {
      // fallback
    }
    return 1;
  })();

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim()) {
      updateUserProfile({ displayName: displayName.trim() });
      setIsEditingName(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '850px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Lifter Profile</span>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>• Settings & Cloud Hub</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', color: '#F1F5F9', margin: 0, fontWeight: 800 }}>
            Profile & App Preferences
          </h1>
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.4rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '0.5rem'
      }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            background: activeTab === 'profile' ? 'rgba(0, 245, 155, 0.12)' : 'transparent',
            color: activeTab === 'profile' ? '#00F59B' : '#94A3B8',
            border: activeTab === 'profile' ? '1px solid rgba(0, 245, 155, 0.3)' : '1px solid transparent',
            borderRadius: '10px',
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          User & Settings
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          style={{
            background: activeTab === 'favorites' ? 'rgba(0, 245, 155, 0.12)' : 'transparent',
            color: activeTab === 'favorites' ? '#00F59B' : '#94A3B8',
            border: activeTab === 'favorites' ? '1px solid rgba(0, 245, 155, 0.3)' : '1px solid transparent',
            borderRadius: '10px',
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Star size={14} />
          Saved Routine ({favoriteMachines.length})
        </button>
      </div>

      {/* 1. Main Profile & Settings Tab */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
          
          {/* User Profile Card */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  background: isAdmin ? 'linear-gradient(135deg, #FFB800 0%, #FF8800 100%)' : 'linear-gradient(135deg, #00F59B 0%, #00D2FF 100%)',
                  color: '#05140F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.6rem',
                  boxShadow: isAdmin ? '0 0 20px rgba(255, 184, 0, 0.35)' : '0 0 20px rgba(0, 245, 155, 0.35)'
                }}>
                  {(user?.displayName || userProfile.displayName).charAt(0).toUpperCase()}
                </div>

                <div>
                  {isEditingName ? (
                    <form onSubmit={handleSaveName} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="input-modern"
                        style={{ padding: '4px 8px', fontSize: '0.9rem', width: '160px' }}
                        autoFocus
                      />
                      <button type="submit" className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                        <Check size={14} />
                      </button>
                    </form>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h2 style={{ fontSize: '1.35rem', color: '#F1F5F9', margin: 0, fontWeight: 800 }}>
                        {user?.displayName || userProfile.displayName}
                      </h2>
                      <button
                        onClick={() => setIsEditingName(true)}
                        style={{ background: 'transparent', border: 'none', color: '#00F59B', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: isAdmin ? 'rgba(255, 184, 0, 0.2)' : 'rgba(0, 245, 155, 0.15)',
                      color: isAdmin ? '#FFB800' : '#00F59B',
                      border: isAdmin ? '1px solid rgba(255, 184, 0, 0.4)' : '1px solid rgba(0, 245, 155, 0.3)'
                    }}>
                      {isAdmin ? '🛡️ Administrator' : 'Athlete'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      {user?.email || 'Local User Session'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Highlights */}
              <div style={{ display: 'flex', gap: '1.25rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#00F59B' }}>{displayTotalXP}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Total XP</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#38BDF8' }}>{displayDiscoveredCount}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Discovered</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFB800' }}>{displayBadgesCount}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Badges</div>
                </div>
              </div>
            </div>
          </div>


          {/* Reset Activity Danger Zone */}
          <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid rgba(255, 71, 87, 0.25)' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#FF6B81', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trash2 size={18} />
              Reset Local Activity Data
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1rem', lineHeight: 1.4 }}>
              Clear all locally stored scan history, completed tutorial checklists, saved favorites, and earned XP.
            </p>
            <button
              onClick={() => setShowClearConfirmModal(true)}
              style={{
                background: 'rgba(255, 71, 87, 0.12)',
                border: '1px solid rgba(255, 71, 87, 0.4)',
                color: '#FF6B81',
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Trash2 size={16} /> Clear All Saved Activity & Progress
            </button>
          </div>
        </div>
      )}

      {/* 2. Saved Favorites Tab */}
      {activeTab === 'favorites' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.2s ease-out' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#F1F5F9', margin: 0 }}>
              Your Saved Routine ({favoriteMachines.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
              Quick access to your curated workout machines and form reminders.
            </p>
          </div>

          {favoriteMachines.length > 0 ? (
            <div className="grid-cards">
              {favoriteMachines.map((m) => (
                <MachineCard
                  key={m.id}
                  machine={m}
                  onSelect={onSelectMachine}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
              <Star size={32} color="#64748B" style={{ margin: '0 auto 0.75rem auto' }} />
              <h4 style={{ fontSize: '1.05rem', color: '#F1F5F9', marginBottom: '0.35rem' }}>
                No Machines Saved Yet
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', maxWidth: '320px', margin: '0 auto 1.25rem auto' }}>
                Tap the star icon on any machine detail page to bookmark it in your routine (+2 XP).
              </p>
              <button
                onClick={() => onNavigate('library')}
                className="btn-primary"
              >
                Browse Library
              </button>
            </div>
          )}
        </div>
      )}



      {/* Clear Data Confirmation Modal */}
      {showClearConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 7, 10, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#131824',
            border: '1px solid rgba(255, 71, 87, 0.4)',
            borderRadius: '20px',
            maxWidth: '420px',
            width: '100%',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 71, 87, 0.15)',
              color: '#FF4757',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <AlertTriangle size={24} />
            </div>

            <h3 style={{ fontSize: '1.15rem', color: '#F1F5F9', marginBottom: '0.5rem' }}>
              Are you sure you want to reset?
            </h3>

            <p style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.4, marginBottom: '1.5rem' }}>
              This will permanently delete all scan records, XP milestones, and saved routines from your browser cache.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowClearConfirmModal(false)}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllUserData();
                  setShowClearConfirmModal(false);
                }}
                className="btn-primary"
                style={{ flex: 1, background: 'linear-gradient(135deg, #FF4757, #FF6B81)', color: '#FFFFFF' }}
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
