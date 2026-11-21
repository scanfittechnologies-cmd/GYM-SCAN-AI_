import React, { useState, useEffect } from 'react';
import { GymProvider, useGym } from './context/GymContext';
import { AuthProvider } from './context/AuthContext';
import { Machine } from './types';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/auth/AuthModal';
import { IntroSplash } from './components/common/IntroSplash';

import { LandingPage } from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import { HomePage } from './pages/HomePage';
import { ScanHubPage } from './pages/ScanHubPage';
import { MachineLibraryPage } from './pages/MachineLibraryPage';
import { MachineDetailPage } from './pages/MachineDetailPage';
import { ActivityPage } from './pages/ActivityPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { ProfilePage } from './pages/ProfilePage';
import { WorkoutRoutineGenerator } from './components/machines/WorkoutRoutineGenerator';



const KNOWN_TABS = ['pricing', 'home', 'scan', 'library', 'activity', 'achievements', 'profile'];

const AppContent: React.FC = () => {
  const { addToast } = useGym();
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return !sessionStorage.getItem('hasSeenIntro');
  });
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [machineSource, setMachineSource] = useState<'qr' | 'photo' | 'library' | 'activity'>('library');
  const [scanInitialMode, setScanInitialMode] = useState<'photo' | 'ai_camera' | 'upload'>('ai_camera');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      const purchasedTier = params.get('tier');
      const finalTier = (purchasedTier === 'pro') ? 'pro' : 'plus';
      localStorage.setItem('user_tier', finalTier);
      window.dispatchEvent(new Event('tier_change'));

      addToast({
        type: 'success',
        title: 'Payment Successful!',
        message: `Welcome to ScanFit ${finalTier === 'pro' ? 'Pro' : 'Plus'}! Premium features unlocked.`,
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [addToast]);

  const handleNavigate = (tab: string, scanModeOrMachineId?: string) => {
    setSelectedMachine(null);
    const targetTab = tab === 'xp' ? 'achievements' : tab;
    if (targetTab === 'scan') {
      if (scanModeOrMachineId === 'upload') {
        setScanInitialMode('upload');
      } else {
        setScanInitialMode('ai_camera');
      }
    }
    setCurrentTab(targetTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMachine = (machine: Machine, source: 'qr' | 'photo' | 'library' | 'activity' = 'library') => {
    setSelectedMachine(machine);
    setMachineSource(source);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromDetail = () => {
    setSelectedMachine(null);
  };

  const handleIntroComplete = () => {
    sessionStorage.setItem('hasSeenIntro', 'true');
    setShowSplash(false);
  };

  // Pricing page uses full-width layout without the standard nav padding
  const isFullWidthPage = currentTab === 'pricing';

  return (
    <div className="min-h-screen bg-[#0A0C0B] flex flex-col justify-between items-center w-full overflow-x-hidden">
      {/* Intro Splash Screen */}
      {showSplash && <IntroSplash onComplete={handleIntroComplete} />}

      {/* Centered Mobile App Shell (max-w-[430px]) */}
      <div className="w-full max-w-[430px] min-h-screen bg-[#0A0C0B] flex flex-col relative shadow-2xl border-x border-[#141716] overflow-x-hidden">
        {/* Top Sticky Header */}
        <Navbar currentTab={currentTab} onTabChange={handleNavigate} />

        {/* Main App Content Area */}
        <main
          className={
            isFullWidthPage 
              ? '' 
              : 'w-full px-4 pt-3 pb-24 overflow-x-hidden'
          }
          style={{ flex: 1 }}
        >
          {selectedMachine ? (
            <div className="page-enter">
              <MachineDetailPage
                machine={selectedMachine}
                source={machineSource}
                onBack={handleBackFromDetail}
                onNavigate={handleNavigate}
                onSelectMachine={handleSelectMachine}
              />
            </div>
          ) : (
            <div className="page-enter" key={currentTab}>
              {currentTab === 'landing' && (
                <LandingPage
                  onNavigate={handleNavigate}
                  onSelectMachine={(m) => handleSelectMachine(m, 'library')}
                />
              )}

              {currentTab === 'pricing' && (
                <div className="pt-4">
                  <PricingPage onNavigate={handleNavigate} />
                </div>
              )}

              {currentTab === 'home' && (
                <HomePage
                  onNavigate={handleNavigate}
                  onSelectMachine={handleSelectMachine}
                />
              )}

              {currentTab === 'scan' && (
                <ScanHubPage
                  initialMode={scanInitialMode}
                  onMachineSelected={handleSelectMachine}
                  onNavigate={handleNavigate}
                />
              )}

              {currentTab === 'library' && (
                <MachineLibraryPage
                  onSelectMachine={handleSelectMachine}
                  onNavigate={handleNavigate}
                />
              )}

              {/* ── Guest-First Pages: Directly accessible without authentication gates ── */}
              {currentTab === 'activity' && (
                <ActivityPage
                  onSelectMachine={handleSelectMachine}
                  onNavigate={handleNavigate}
                />
              )}

              {currentTab === 'achievements' && (
                <AchievementsPage onNavigate={handleNavigate} />
              )}

              {currentTab === 'profile' && (
                <ProfilePage
                  onSelectMachine={handleSelectMachine}
                  onNavigate={handleNavigate}
                />
              )}

              {/* 404 Fallback for unknown tabs */}
              {!KNOWN_TABS.includes(currentTab) && (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  minHeight: '50vh', textAlign: 'center', gap: '1rem', padding: '2rem',
                }}>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: '#1d2332', fontFamily: 'var(--font-mono)' }}>404</div>
                  <h2 style={{ fontSize: '1.4rem', color: '#F1F5F9' }}>Page Not Found</h2>
                  <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>This section does not exist or has been moved.</p>
                  <button onClick={() => handleNavigate('home')} className="btn-primary">
                    Return to Dashboard
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav
          currentTab={selectedMachine ? 'library' : currentTab}
          onTabChange={handleNavigate}
        />
      </div>

      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Authentication Modal Dialog */}
      <AuthModal />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <GymProvider>
        <AppContent />
      </GymProvider>
    </AuthProvider>
  );
}

export default App;


