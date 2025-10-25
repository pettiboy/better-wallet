import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DeviceModeProvider } from './contexts/DeviceModeContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { WalletConnectProvider } from './contexts/WalletConnectContext';
import { OnboardingPage } from './pages/OnboardingPage';
import { SetupPage } from './pages/SetupPage';
import { HotHomePage } from './pages/hot/HotHomePage';
import { SendPage } from './pages/hot/SendPage';
import { DappConnectPage } from './pages/hot/DappConnectPage';
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
        
        {/* Hot wallet mode */}
        {hasCompletedOnboarding && mode === 'hot' && (
          <>
            <Route path="/hot/home" element={<HotHomePage />} />
            <Route path="/hot/send" element={<SendPage />} />
            <Route path="/hot/dapp-connect" element={<DappConnectPage />} />
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
        <WalletConnectProvider>
          <AppContent />
        </WalletConnectProvider>
      </DeviceModeProvider>
    </OnboardingProvider>
  );
}

export default App;