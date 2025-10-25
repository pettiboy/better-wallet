import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { WalletProvider, useWallet } from "@/contexts/WalletContext";
import { isDeviceOffline } from "@/services/network";
import OfflineCheckScreen from "./offline-check";
import { SafeAreaView } from "react-native-safe-area-context";

export const unstable_settings = {
  anchor: "(tabs)",
};

function AppContent() {
  const [isOffline, setIsOffline] = useState<boolean | null>(null);
  const { isLoading, isSetupComplete, hasWallet } = useWallet();

  useEffect(() => {
    checkOfflineStatus();
  }, []);

  // Redirect to dashboard if wallet exists and setup is complete
  useEffect(() => {
    if (!isLoading && hasWallet && isSetupComplete && isOffline) {
      router.replace("/(tabs)");
    }
  }, [isLoading, hasWallet, isSetupComplete, isOffline]);

  const checkOfflineStatus = async () => {
    try {
      const offline = await isDeviceOffline();
      setIsOffline(offline);
    } catch (error) {
      console.error("Error checking offline status:", error);
      // Default to showing offline check for security
      setIsOffline(false);
    }
  };

  // Show loading while checking wallet and network status
  if (isLoading || isOffline === null) {
    return (
      <View style={styles.loadingContainer}>
        {/* Loading will be handled by individual screens */}
      </View>
    );
  }

  // Show offline enforcement if device is online
  if (!isOffline) {
    return <OfflineCheckScreen />;
  }

  // Show main app if offline
  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="receive" options={{ title: "Receive ETH" }} />
      <Stack.Screen
        name="scan-transaction"
        options={{ title: "Scan Transaction" }}
      />
      <Stack.Screen
        name="verify-transaction"
        options={{ title: "Verify Transaction" }}
      />
      <Stack.Screen
        name="signing-complete"
        options={{ title: "Transaction Signed" }}
      />
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Modal" }}
      />
      {/* Onboarding screens */}
      <Stack.Screen
        name="onboarding/mnemonic-display"
        options={{ title: "Recovery Phrase", headerShown: false }}
      />
      <Stack.Screen
        name="onboarding/mnemonic-verify"
        options={{ title: "Verify Recovery Phrase", headerShown: false }}
      />
      <Stack.Screen
        name="onboarding/wallet-created"
        options={{ title: "Wallet Created", headerShown: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <WalletProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SafeAreaView style={{ flex: 1 }}>
          <AppContent />
        </SafeAreaView>
        <StatusBar style="auto" />
      </ThemeProvider>
    </WalletProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
});
