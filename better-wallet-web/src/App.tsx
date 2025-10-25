import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { DeviceModeProvider } from "./contexts/DeviceModeContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import { WalletConnectProvider } from "./contexts/WalletConnectContext";
import { MobileContainer } from "./components/MobileContainer";
import { BottomTabBar } from "./components/BottomTabBar";
import { OfflineNotice } from "./components/OfflineNotice";
import { OnboardingPage } from "./pages/OnboardingPage";
import { SetupPage } from "./pages/SetupPage";
import { HotHomePage } from "./pages/hot/HotHomePage";
import { SendPage } from "./pages/hot/SendPage";
import { DappConnectPage } from "./pages/hot/DappConnectPage";
import { SettingsPage } from "./pages/hot/SettingsPage";
import { useDeviceMode } from "./contexts/DeviceModeContext";
import { useOnboarding } from "./contexts/OnboardingContext";

function AppContent() {
  const { mode, isLoading: deviceLoading } = useDeviceMode();
  const { hasCompletedOnboarding, isLoading: onboardingLoading } =
    useOnboarding();

  // Show loading while checking contexts
  if (deviceLoading || onboardingLoading) {
    return (
      <MobileContainer>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--color-bg-main)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div className="spinner" style={{ margin: "0 auto 1rem" }}></div>
            <p style={{ color: "var(--color-black)", fontWeight: 700 }}>
              Loading...
            </p>
          </div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <Router>
      <MobileContainer>
        <Routes>
          {/* Show onboarding if not completed */}
          {!hasCompletedOnboarding && (
            <Route path="*" element={<OnboardingPage />} />
          )}

          {/* Setup mode */}
          {hasCompletedOnboarding && mode === "setup" && (
            <Route path="*" element={<SetupPage />} />
          )}

          {/* Hot wallet mode with bottom navigation */}
          {hasCompletedOnboarding && mode === "hot" && (
            <>
              <Route path="/hot/home" element={<HotHomePage />} />
              <Route path="/hot/send" element={<SendPage />} />
              <Route path="/hot/dapp-connect" element={<DappConnectPage />} />
              <Route path="/hot/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/hot/home" replace />} />
            </>
          )}
        </Routes>

        {/* Show bottom tab bar only in hot wallet mode */}
        {hasCompletedOnboarding && mode === "hot" && <BottomTabBar />}

        {/* Offline notice */}
        <OfflineNotice />
      </MobileContainer>
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
