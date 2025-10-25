import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from "react-native";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useWallet } from "@/contexts/WalletContext";
import { router } from "expo-router";

export default function DashboardScreen() {
  const { address, isLoading, isSetupComplete } = useWallet();
  const [showQR, setShowQR] = useState(false);

  const warningColor = useThemeColor({}, "warning");
  const overlayColor = useThemeColor({}, "overlay");
  const borderColor = useThemeColor({}, "border");
  const primaryColor = useThemeColor({}, "primary");

  // Redirect to welcome if no wallet setup
  useEffect(() => {
    if (!isLoading && !isSetupComplete) {
      router.replace("/welcome");
    }
  }, [isLoading, isSetupComplete]);

  if (isLoading) {
    return (
      <SafeThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText type="title" style={styles.loadingTitle}>
            Loading Wallet...
          </ThemedText>
        </View>
      </SafeThemedView>
    );
  }

  if (!isSetupComplete) {
    return null; // Will redirect to welcome
  }

  const handleShowAddress = () => {
    setShowQR(true);
  };

  const handleScanTransaction = () => {
    router.push("/scan-transaction");
  };

  const handleSettings = () => {
    router.push("/(tabs)/settings");
  };

  if (showQR && address) {
    return (
      <SafeThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <ThemedText type="title" style={styles.title}>
              Your Ethereum Address
            </ThemedText>

            <ThemedText style={styles.subtitle}>
              Safe to share - Scan with your hot wallet
            </ThemedText>

            {/* QR Code would go here - using QRDisplay component */}
            <View
              style={[
                styles.qrPlaceholder,
                { backgroundColor: overlayColor, borderColor },
              ]}
            >
              <Text style={styles.qrText}>QR Code</Text>
              <ThemedText style={styles.addressText}>{address}</ThemedText>
            </View>

            <ThemedButton
              title="Hide QR Code"
              variant="primary"
              onPress={() => setShowQR(false)}
              style={styles.hideButton}
            />
          </View>
        </ScrollView>
      </SafeThemedView>
    );
  }

  return (
    <SafeThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <ThemedText type="title" style={styles.title}>
            Cold Wallet Dashboard
          </ThemedText>

          {/* Offline Indicator */}
          <View
            style={[styles.offlineIndicator, { backgroundColor: warningColor }]}
          >
            <Text style={styles.offlineIcon}>✈️</Text>
            <ThemedText style={styles.offlineText}>
              OFFLINE MODE - SECURE
            </ThemedText>
          </View>

          {/* Wallet Info */}
          <View
            style={[
              styles.walletInfo,
              { backgroundColor: overlayColor, borderColor },
            ]}
          >
            <ThemedText type="subtitle" style={styles.walletTitle}>
              Your Wallet
            </ThemedText>

            <View style={styles.addressContainer}>
              <ThemedText style={styles.addressLabel}>Address:</ThemedText>
              <ThemedText style={styles.addressText}>
                {address
                  ? `${address.substring(0, 6)}...${address.substring(
                      address.length - 4
                    )}`
                  : "Not available"}
              </ThemedText>
            </View>

            <View style={styles.balanceContainer}>
              <ThemedText style={styles.balanceLabel}>Balance:</ThemedText>
              <ThemedText style={styles.balanceText}>Offline Mode</ThemedText>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: primaryColor }]}
              onPress={handleShowAddress}
            >
              <Text style={styles.actionIcon}>📱</Text>
              <ThemedText style={styles.actionTitle}>
                Receive ETH/Tokens
              </ThemedText>
              <ThemedText style={styles.actionSubtitle}>
                Show address QR code
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: primaryColor }]}
              onPress={handleScanTransaction}
            >
              <Text style={styles.actionIcon}>📷</Text>
              <ThemedText style={styles.actionTitle}>
                Scan Transaction
              </ThemedText>
              <ThemedText style={styles.actionSubtitle}>
                Sign transaction from hot wallet
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Security Status */}
          <View
            style={[styles.securityStatus, { backgroundColor: overlayColor }]}
          >
            <ThemedText type="subtitle" style={styles.securityTitle}>
              Security Status
            </ThemedText>

            <View style={styles.securityItem}>
              <Text style={styles.securityIcon}>🔒</Text>
              <ThemedText style={styles.securityText}>
                Private keys stored offline
              </ThemedText>
            </View>

            <View style={styles.securityItem}>
              <Text style={styles.securityIcon}>✈️</Text>
              <ThemedText style={styles.securityText}>
                Airplane mode enforced
              </ThemedText>
            </View>

            <View style={styles.securityItem}>
              <Text style={styles.securityIcon}>🛡️</Text>
              <ThemedText style={styles.securityText}>
                Biometric authentication enabled
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingTitle: {
    textAlign: "center",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100, // Extra padding for tab bar
  },
  content: {
    flex: 1,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  offlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  offlineIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  offlineText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  walletInfo: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  walletTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  addressContainer: {
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  addressText: {
    fontFamily: "monospace",
    fontSize: 16,
    fontWeight: "600",
  },
  balanceContainer: {
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 18,
    fontWeight: "600",
    opacity: 0.8,
  },
  actionButtons: {
    gap: 16,
    marginBottom: 24,
  },
  actionButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "white",
  },
  actionSubtitle: {
    fontSize: 14,
    opacity: 0.9,
    color: "white",
    textAlign: "center",
  },
  securityStatus: {
    padding: 20,
    borderRadius: 16,
  },
  securityTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  securityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
  },
  qrPlaceholder: {
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 24,
  },
  qrText: {
    fontSize: 24,
    marginBottom: 16,
    opacity: 0.5,
  },
  addressText: {
    fontFamily: "monospace",
    fontSize: 12,
    textAlign: "center",
  },
  hideButton: {
    width: "100%",
    maxWidth: 300,
  },
});
