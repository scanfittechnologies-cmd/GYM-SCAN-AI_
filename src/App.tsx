import React, { useState } from 'react';
import { GymProvider, useGym } from './context/GymContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Machine } from './types';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { ToastContainer } from './components/common/ToastContainer';
import { DemoBanner } from './components/common/DemoBanner';
import { AuthModal } from './components/auth/AuthModal';

import { LandingPage } from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import { HomePage } from './pages/HomePage';
import { ScanHubPage } from './pages/ScanHubPage';
import { MachineLibraryPage } from './pages/MachineLibraryPage';
import { MachineDetailPage } from './pages/MachineDetailPage';
import { ActivityPage } from './pages/ActivityPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const KNOWN_TABS = ['landing', 'pricing', 'home', 'scan', 'library', 'activity', 'achievements', 'profile', 'admin'];

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [machineSource, setMachineSource] = useState<'qr' | 'photo' | 'library' | 'activity'>('library');
  const [scanInitialMode, setScanInitialMode] = useState<'qr' | 'photo' | 'ai_camera' | 'upload'>('qr');

  const handleNavigate = (tab: string, scanModeOrMachineId?: string) => {
    setSelectedMachine(null);
    if (tab === 'scan') {
      if (scanModeOrMachineId === 'upload') {
        setScanInitialMode('upload');
      } else if (scanModeOrMachineId === 'photo' || scanModeOrMachineId === 'ai_camera') {
        setScanInitialMode('ai_camera');
      } else if (scanModeOrMachineId === 'qr') {
        setScanInitialMode('qr');
      }
    }
    setCurrentTab(tab);
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

  // Landing and pricing pages use full-width layout without the standard nav padding
  const isFullWidthPage = currentTab === 'landing' || currentTab === 'pricing';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Client Demo Status Banner */}
      <DemoBanner onOpenSettings={() => handleNavigate('profile')} />

      {/* Top Sticky Header — hidden on landing for cleaner look */}
      {currentTab !== 'landing' && (
        <Navbar currentTab={currentTab} onTabChange={handleNavigate} />
      )}

      {/* Main Responsive App Content Area */}
      <main
        className={isFullWidthPage ? '' : currentTab === 'library' ? 'app-container' : 'app-container pt-16 sm:pt-20 md:pt-6'}
        style={{ flex: 1 }}
      >
        {selectedMachine ? (
          <div className="page-enter">
            <MachineDetailPage
              machine={selectedMachine}
              source={machineSource}
              onBack={handleBackFromDetail}
              onNavigate={handleNavigate}
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

            {currentTab === 'admin' && (
              <AdminDashboardPage
                onNavigate={handleNavigate}
                onSelectMachine={handleSelectMachine}
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

      {/* Mobile Bottom Navigation Bar — hidden on landing page */}
      {currentTab !== 'landing' && (
        <BottomNav
          currentTab={selectedMachine ? 'library' : currentTab}
          onTabChange={handleNavigate}
        />
      )}

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


