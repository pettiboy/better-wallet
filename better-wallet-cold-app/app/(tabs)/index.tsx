import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedText } from "@/components/themed-text";
import { QRDisplay } from "@/components/QRDisplay";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useWallet } from "@/contexts/WalletContext";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BorderWidth, Shadows, Spacing } from "@/constants/theme";

export default function DashboardScreen() {
  const { address, isLoading, isSetupComplete } = useWallet();
  const [showQR, setShowQR] = useState(false);

  const warningColor = useThemeColor({}, "warning");
  const overlayColor = useThemeColor({}, "overlay");
  const borderColor = useThemeColor({}, "border");
  const primaryColor = useThemeColor({}, "primary");
  const successColor = useThemeColor({}, "success");
  const cardColor = useThemeColor({}, "card");

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
            LOADING WALLET...
          </ThemedText>
        </View>
      </SafeThemedView>
    );
  }

  if (!isSetupComplete) {
    return null;
  }

  const handleShowAddress = () => {
    setShowQR(true);
  };

  const handleScanTransaction = () => {
    router.push("/scan-transaction");
  };

  if (showQR && address) {
    return (
      <SafeThemedView style={styles.container} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <ThemedText type="title" style={styles.title}>
              YOUR ETHEREUM ADDRESS
            </ThemedText>

            <ThemedText style={styles.subtitle}>
              Safe to share - Scan with your hot wallet
            </ThemedText>

            <QRDisplay data={address} title="" description="" size={280} />

            <ThemedButton
              title="Hide QR Code"
              variant="secondary"
              onPress={() => setShowQR(false)}
              style={styles.hideButton}
            />
          </View>
        </ScrollView>
      </SafeThemedView>
    );
  }

  return (
    <SafeThemedView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <ThemedText type="title" style={styles.title}>
            COLD WALLET
          </ThemedText>

          {/* Offline Indicator */}
          <View
            style={[
              styles.offlineIndicator,
              {
                backgroundColor: successColor,
                borderColor,
                borderWidth: BorderWidth.thick,
                ...Shadows.medium,
              },
            ]}
          >
            <Ionicons name="airplane" size={24} color="#fff" />
            <ThemedText style={styles.offlineText}>
              OFFLINE MODE - SECURE
            </ThemedText>
          </View>

          {/* Wallet Info */}
          <View
            style={[
              styles.walletInfo,
              {
                backgroundColor: cardColor,
                borderColor,
                borderWidth: BorderWidth.thick,
                ...Shadows.medium,
              },
            ]}
          >
            <ThemedText type="subtitle" style={styles.walletTitle}>
              YOUR WALLET
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
              style={[
                styles.actionButton,
                {
                  backgroundColor: primaryColor,
                  borderColor,
                  borderWidth: BorderWidth.thick,
                  ...Shadows.large,
                },
              ]}
              onPress={handleShowAddress}
              activeOpacity={0.8}
            >
              <Ionicons name="qr-code" size={40} color="#fff" />
              <ThemedText style={styles.actionTitle}>
                RECEIVE ETH/TOKENS
              </ThemedText>
              <ThemedText style={styles.actionSubtitle}>
                Show address QR code
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: successColor,
                  borderColor,
                  borderWidth: BorderWidth.thick,
                  ...Shadows.large,
                },
              ]}
              onPress={handleScanTransaction}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={40} color="#fff" />
              <ThemedText style={styles.actionTitle}>
                SCAN TRANSACTION
              </ThemedText>
              <ThemedText style={styles.actionSubtitle}>
                Sign transaction from hot wallet
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Security Status */}
          <View
            style={[
              styles.securityStatus,
              {
                backgroundColor: overlayColor,
                borderColor,
                borderWidth: BorderWidth.thick,
                ...Shadows.small,
              },
            ]}
          >
            <ThemedText type="subtitle" style={styles.securityTitle}>
              SECURITY STATUS
            </ThemedText>

            <View style={styles.securityItem}>
              <Ionicons name="lock-closed" size={20} color="#000" />
              <ThemedText style={styles.securityText}>
                Private keys stored offline
              </ThemedText>
            </View>

            <View style={styles.securityItem}>
              <Ionicons name="airplane" size={20} color="#000" />
              <ThemedText style={styles.securityText}>
                Airplane mode enforced
              </ThemedText>
            </View>

            <View style={styles.securityItem}>
              <Ionicons name="finger-print" size={20} color="#000" />
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

// Import ThemedButton here at the top with other imports
import { ThemedButton } from "@/components/themed-button";

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
    fontWeight: "800",
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.md,
    paddingBottom: 100,
  },
  content: {
    flex: 1,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
    fontWeight: "800",
    fontSize: 28,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing.lg,
    fontSize: 15,
    fontWeight: "600",
  },
  offlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: 0,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  offlineText: {
    fontWeight: "800",
    fontSize: 16,
    color: "#fff",
    letterSpacing: 0.5,
  },
  walletInfo: {
    padding: Spacing.lg,
    borderRadius: 0,
    marginBottom: Spacing.lg,
  },
  walletTitle: {
    marginBottom: Spacing.md,
    textAlign: "center",
    fontWeight: "800",
    fontSize: 18,
  },
  addressContainer: {
    marginBottom: Spacing.sm,
  },
  addressLabel: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "700",
  },
  addressText: {
    fontFamily: "monospace",
    fontSize: 16,
    fontWeight: "700",
  },
  balanceContainer: {
    marginBottom: Spacing.xs,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "700",
  },
  balanceText: {
    fontSize: 18,
    fontWeight: "700",
  },
  actionButtons: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    padding: Spacing.lg,
    borderRadius: 0,
    alignItems: "center",
    gap: Spacing.sm,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "white",
    letterSpacing: 0.5,
  },
  actionSubtitle: {
    fontSize: 14,
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
  securityStatus: {
    padding: Spacing.lg,
    borderRadius: 0,
  },
  securityTitle: {
    marginBottom: Spacing.md,
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
  },
  securityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  hideButton: {
    width: "100%",
    marginTop: Spacing.lg,
  },
});
