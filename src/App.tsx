import React, { useState, useEffect } from 'react';
import { GymProvider, useGym } from './context/GymContext';
import { AuthProvider, useAuth } from './context/AuthContext';
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

import { 
  Sparkles, 
  Trophy, 
  History, 
  UserCircle, 
  ArrowRight 
} from 'lucide-react';

/* ── Soft Gate Screen ──
   Shown to unauthenticated guests when they navigate to auth-gated pages.
   Provides a contextual message with a friendly CTA to sign up/in. */
interface SoftGateScreenProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  ctaMessage: string;
  onSignUp: () => void;
  onSignIn: () => void;
}

const SoftGateScreen: React.FC<SoftGateScreenProps> = ({
  icon, title, subtitle, ctaMessage, onSignUp, onSignIn
}) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '55vh',
    textAlign: 'center',
    padding: '2rem 1.5rem',
    gap: '1.25rem',
    maxWidth: '520px',
    margin: '0 auto'
  }}>
    {/* Glowing Icon Container */}
    <div style={{
      width: '72px',
      height: '72px',
      borderRadius: '20px',
      background: 'linear-gradient(135deg, rgba(0, 245, 155, 0.15) 0%, rgba(0, 210, 255, 0.1) 100%)',
      border: '1px solid rgba(0, 245, 155, 0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 30px rgba(0, 245, 155, 0.15)',
      animation: 'pulse 3s ease-in-out infinite'
    }}>
      {icon}
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <h2 style={{
        fontSize: '1.5rem',
        color: '#F1F5F9',
        fontWeight: 800,
        margin: 0,
        letterSpacing: '-0.02em'
      }}>
        {title}
      </h2>
      <p style={{
        fontSize: '0.88rem',
        color: '#94A3B8',
        margin: 0,
        lineHeight: 1.5,
        maxWidth: '400px'
      }}>
        {subtitle}
      </p>
    </div>

    {/* CTA Banner */}
    <div style={{
      background: 'linear-gradient(135deg, rgba(0, 245, 155, 0.1) 0%, rgba(0, 210, 255, 0.06) 100%)',
      border: '1px solid rgba(0, 245, 155, 0.25)',
      borderRadius: '16px',
      padding: '1rem 1.25rem',
      width: '100%',
      maxWidth: '400px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, #00F59B, #00D2FF)',
        borderRadius: '16px 16px 0 0'
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.65rem' }}>
        <Sparkles size={16} color="#00F59B" />
        <span style={{ fontSize: '0.82rem', color: '#E2E8F0', fontWeight: 700 }}>
          {ctaMessage}
        </span>
      </div>
      <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '1rem' }}>
        It's free, takes 30 seconds, and unlocks your full ScanFit experience.
      </span>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={onSignUp}
          className="btn-primary"
          style={{
            flex: 1,
            padding: '0.65rem',
            fontSize: '0.85rem',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          Create Free Account <ArrowRight size={14} />
        </button>
        <button
          onClick={onSignIn}
          style={{
            flex: 'none',
            padding: '0.65rem 1rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            color: '#CBD5E1',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          Sign In
        </button>
      </div>
    </div>
  </div>
);

const KNOWN_TABS = ['pricing', 'home', 'scan', 'library', 'activity', 'achievements', 'profile'];

const AppContent: React.FC = () => {
  const { addToast } = useGym();
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return !sessionStorage.getItem('hasSeenIntro');
  });
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [machineSource, setMachineSource] = useState<'qr' | 'photo' | 'library' | 'activity'>('library');
  const [scanInitialMode, setScanInitialMode] = useState<'qr' | 'photo' | 'ai_camera' | 'upload'>('qr');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      addToast({
        type: 'success',
        title: 'Payment Successful!',
        message: 'Welcome to ScanFit Premium!',
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
      } else if (scanModeOrMachineId === 'photo' || scanModeOrMachineId === 'ai_camera') {
        setScanInitialMode('ai_camera');
      } else if (scanModeOrMachineId === 'qr') {
        setScanInitialMode('qr');
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

  const { isAuthenticated, openSoftGate, openAuthModal } = useAuth();

  // Helper: render SoftGateScreen for auth-required pages
  const renderSoftGate = (config: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    ctaMessage: string;
  }) => (
    <SoftGateScreen
      {...config}
      onSignUp={() => openSoftGate(config.ctaMessage, 'signup')}
      onSignIn={() => openAuthModal('signin')}
    />
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Intro Splash Screen */}
      {showSplash && <IntroSplash onComplete={handleIntroComplete} />}


      {/* Top Sticky Header */}
      <Navbar currentTab={currentTab} onTabChange={handleNavigate} />

      {/* Main Responsive App Content Area */}
      <main
        className={isFullWidthPage ? '' : currentTab === 'library' ? 'w-full overflow-x-hidden' : 'app-container pt-16 sm:pt-20 md:pt-6'}
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
              <div className="app-container pt-16 sm:pt-20 md:pt-6">
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

            {/* ── Auth-Gated Pages: Show SoftGateScreen for guests ── */}
            {currentTab === 'activity' && (
              isAuthenticated ? (
                <ActivityPage
                  onSelectMachine={handleSelectMachine}
                  onNavigate={handleNavigate}
                />
              ) : renderSoftGate({
                icon: <History size={32} color="#00F59B" />,
                title: 'Your Workout History',
                subtitle: 'Track every machine scan, XP earned, and workout session in one place. Your personal training log awaits.',
                ctaMessage: 'Create a free account to save your scan history and track your progress!'
              })
            )}

            {currentTab === 'achievements' && (
              isAuthenticated ? (
                <AchievementsPage onNavigate={handleNavigate} />
              ) : renderSoftGate({
                icon: <Trophy size={32} color="#FFB800" />,
                title: 'XP & Achievements',
                subtitle: 'Earn XP for discovering machines, earn badges for milestones, and climb the level ranks as you explore your gym.',
                ctaMessage: 'Create a free account to earn XP, unlock badges, and track your streak!'
              })
            )}

            {currentTab === 'profile' && (
              isAuthenticated ? (
                <ProfilePage
                  onSelectMachine={handleSelectMachine}
                  onNavigate={handleNavigate}
                />
              ) : renderSoftGate({
                icon: <UserCircle size={32} color="#00D2FF" />,
                title: 'Your Athlete Profile',
                subtitle: 'Customize your profile, manage your favorite machines, adjust app settings, and view your full gym journey.',
                ctaMessage: 'Create a free account to set up your athlete profile and personalize your experience!'
              })
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

      {/* Main Navigation Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={selectedMachine ? 'library' : currentTab}
        onTabChange={handleNavigate}
      />

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


