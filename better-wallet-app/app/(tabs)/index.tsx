import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedButton } from "@/components/themed-button";
import { useDeviceMode } from "@/contexts/DeviceModeContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { OnboardingScreens } from "@/components/OnboardingScreens";
import { QRScanner } from "@/components/QRScanner";
import { QRDisplay } from "@/components/QRDisplay";
import {
  generateWallet,
  storePrivateKey,
  hasWallet,
  loadPrivateKey,
  getAddress,
} from "@/services/wallet";
import { router } from "expo-router";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function HomeScreen() {
  const { mode, setMode, setWalletAddress } = useDeviceMode();
  const { hasCompletedOnboarding, isLoading } = useOnboarding();

  // Show loading while checking onboarding status
  if (isLoading) {
    return null;
  }

  // Show onboarding if not completed
  if (!hasCompletedOnboarding) {
    return <OnboardingScreens onComplete={() => {}} />;
  }

  // Setup mode
  if (mode === "setup") {
    return (
      <SetupScreen onSetupComplete={setMode} onAddressSet={setWalletAddress} />
    );
  }

  // Cold wallet mode
  if (mode === "cold") {
    return <ColdHomeScreen />;
  }

  // Hot wallet mode
  if (mode === "hot") {
    return <HotHomeScreenWrapper />;
  }

  return null;
}

function SetupScreen({
  onSetupComplete,
  onAddressSet,
}: {
  onSetupComplete: (mode: "hot" | "cold") => void;
  onAddressSet: (address: string) => void;
}) {
  const [scanning, setScanning] = useState(false);
  const cardColor = useThemeColor({}, "card");
  const overlayColor = useThemeColor({}, "overlay");
  const warningColor = useThemeColor({}, "warning");
  const primaryColor = useThemeColor({}, "primary");

  const handleColdWallet = async () => {
    try {
      const exists = await hasWallet();

      if (exists) {
        Alert.alert(
          "Wallet Exists",
          "A wallet already exists on this device. Continue?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Continue",
              onPress: async () => {
                const privateKey = await loadPrivateKey();
                if (privateKey) {
                  const address = getAddress(privateKey);
                  onAddressSet(address);
                }
                onSetupComplete("cold");
              },
            },
          ]
        );
        return;
      }

      const wallet = await generateWallet();
      await storePrivateKey(wallet.privateKey, wallet.mnemonic);
      onAddressSet(wallet.address);

      Alert.alert(
        "Wallet Created",
        `Your wallet has been created securely. Address: ${wallet.address.substring(
          0,
          10
        )}...`,
        [{ text: "OK", onPress: () => onSetupComplete("cold") }]
      );
    } catch (error) {
      console.error("Error setting up cold wallet:", error);
      Alert.alert("Error", "Failed to create wallet");
    }
  };

  const handleHotWallet = () => {
    setScanning(true);
  };

  const handleScan = (data: string) => {
    setScanning(false);

    if (data.startsWith("0x") && data.length === 42) {
      onAddressSet(data);
      onSetupComplete("hot");
      Alert.alert(
        "Success",
        `Connected to wallet: ${data.substring(0, 10)}...`
      );
    } else {
      Alert.alert("Error", "Invalid address QR code");
    }
  };

  if (scanning) {
    return (
      <QRScanner
        title="Scan Cold Wallet Address"
        onScan={handleScan}
        onClose={() => setScanning(false)}
      />
    );
  }

  return (
    <SafeThemedView>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            Better Wallet
          </ThemedText>

          <ThemedText style={styles.subtitle}>
            Turn your smartphone into an air-gapped hardware wallet
          </ThemedText>

          <View
            style={[styles.explanationBox, { backgroundColor: overlayColor }]}
          >
            <ThemedText type="subtitle" style={styles.explanationTitle}>
              How It Works
            </ThemedText>
            <ThemedText style={styles.explanationText}>
              • <ThemedText type="defaultSemiBold">Cold Wallet:</ThemedText>{" "}
              Stores private keys offline, signs transactions
            </ThemedText>
            <ThemedText style={styles.explanationText}>
              • <ThemedText type="defaultSemiBold">Hot Wallet:</ThemedText>{" "}
              Connects to blockchain, broadcasts transactions
            </ThemedText>
            <ThemedText style={styles.explanationText}>
              • Communication via QR codes only
            </ThemedText>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.coldButton, { backgroundColor: warningColor }]}
              onPress={handleColdWallet}
            >
              <Text style={styles.buttonIcon}>🔒</Text>
              <Text style={styles.buttonTitle}>Cold Wallet</Text>
              <Text style={styles.buttonSubtitle}>
                Store keys offline (Old Phone)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.hotButton, { backgroundColor: primaryColor }]}
              onPress={handleHotWallet}
            >
              <Text style={styles.buttonIcon}>📱</Text>
              <Text style={styles.buttonTitle}>Hot Wallet</Text>
              <Text style={styles.buttonSubtitle}>
                Connect to blockchain (Main Phone)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.securityNote, { backgroundColor: cardColor }]}>
            <ThemedText style={styles.securityText}>
              ⚠️ For maximum security, use a dedicated offline device as your
              cold wallet
            </ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </SafeThemedView>
  );
}

function ColdHomeScreen() {
  const { walletAddress } = useDeviceMode();
  const [showQR, setShowQR] = useState(false);
  const warningColor = useThemeColor({}, "warning");
  const overlayColor = useThemeColor({}, "overlay");
  const borderColor = useThemeColor({}, "border");

  const handleShowAddress = () => {
    setShowQR(true);
  };

  if (showQR && walletAddress) {
    return (
      <SafeThemedView>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedView style={styles.container}>
            <QRDisplay
              data={walletAddress}
              title="Your Wallet Address"
              description="Scan this with your hot wallet"
              size={280}
            />
            <ThemedButton
              title="Hide QR Code"
              variant="primary"
              onPress={() => setShowQR(false)}
              style={styles.marginTop}
            />
          </ThemedView>
        </ScrollView>
      </SafeThemedView>
    );
  }

  return (
    <SafeThemedView>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            Cold Wallet
          </ThemedText>

          <View
            style={[styles.offlineIndicator, { backgroundColor: warningColor }]}
          >
            <Text style={styles.offlineText}>✈️ OFFLINE MODE</Text>
          </View>

          <View
            style={[
              styles.addressContainer,
              { backgroundColor: overlayColor, borderColor, borderWidth: 1 },
            ]}
          >
            <ThemedText style={styles.addressLabel}>Your Address:</ThemedText>
            <ThemedText style={styles.address}>{walletAddress}</ThemedText>
          </View>

          <View style={styles.actionButtons}>
            <ThemedButton
              title="Show Address QR"
              variant="primary"
              onPress={handleShowAddress}
            />

            <ThemedButton
              title="Sign Transaction"
              variant="primary"
              onPress={() => router.push("/cold/sign")}
              style={styles.marginTop}
            />

            <ThemedButton
              title="Settings"
              variant="primary"
              onPress={() => router.push("/cold/settings")}
              style={styles.marginTop}
            />
          </View>
        </ThemedView>
      </ScrollView>
    </SafeThemedView>
  );
}

function HotHomeScreenWrapper() {
  const HotHomeContent = require("../hot/home").default;
  return <HotHomeContent />;
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.7,
  },
  explanationBox: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
  },
  explanationTitle: {
    marginBottom: 12,
  },
  explanationText: {
    marginBottom: 8,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 24,
  },
  coldButton: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  hotButton: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  buttonTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  buttonSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    textAlign: "center",
  },
  securityNote: {
    padding: 16,
    borderRadius: 8,
  },
  securityText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  offlineIndicator: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: "center",
  },
  offlineText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  addressContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  addressLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 6,
  },
  address: {
    fontFamily: "monospace",
    fontSize: 12,
  },
  actionButtons: {
    gap: 12,
  },
  marginTop: {
    marginTop: 12,
  },
});
