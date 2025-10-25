import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DeviceModeProvider } from './contexts/DeviceModeContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { OnboardingPage } from './pages/OnboardingPage';
import { SetupPage } from './pages/SetupPage';
import { ColdHomePage } from './pages/cold/ColdHomePage';
import { SignPage } from './pages/cold/SignPage';
import { SettingsPage } from './pages/cold/SettingsPage';
import { HotHomePage } from './pages/hot/HotHomePage';
import { SendPage } from './pages/hot/SendPage';
import { useDeviceMode } from './contexts/DeviceModeContext';
import { useOnboarding } from './contexts/OnboardingContext';

function AppContent() {
  const { mode, isLoading: deviceLoading } = useDeviceMode();
  const { hasCompletedOnboarding, isLoading: onboardingLoading } = useOnboarding();

  // Show loading while checking contexts
  if (deviceLoading || onboardingLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Show onboarding if not completed */}
        {!hasCompletedOnboarding && (
          <Route path="*" element={<OnboardingPage />} />
        )}
        
        {/* Setup mode */}
        {hasCompletedOnboarding && mode === 'setup' && (
          <Route path="*" element={<SetupPage />} />
        )}
        
        {/* Cold wallet mode */}
        {hasCompletedOnboarding && mode === 'cold' && (
          <>
            <Route path="/cold/home" element={<ColdHomePage />} />
            <Route path="/cold/sign" element={<SignPage />} />
            <Route path="/cold/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/cold/home" replace />} />
          </>
        )}
        
        {/* Hot wallet mode */}
        {hasCompletedOnboarding && mode === 'hot' && (
          <>
            <Route path="/hot/home" element={<HotHomePage />} />
            <Route path="/hot/send" element={<SendPage />} />
            <Route path="*" element={<Navigate to="/hot/home" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <OnboardingProvider>
      <DeviceModeProvider>
        <AppContent />
      </DeviceModeProvider>
    </OnboardingProvider>
  );
}

export default App;