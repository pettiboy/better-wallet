import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { WalletProvider, useWallet } from "@/contexts/WalletContext";
import { isDeviceOffline } from "@/services/network";
import OfflineCheckScreen from "./offline-check";

export const unstable_settings = {
  anchor: "(tabs)",
};

function AppContent() {
  const [isOffline, setIsOffline] = useState<boolean | null>(null);
  const { isLoading } = useWallet();

  useEffect(() => {
    checkOfflineStatus();
  }, []);

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
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <WalletProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AppContent />
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
