import React from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BorderWidth, Shadows, Spacing } from "@/constants/theme";

export default function WelcomeScreen() {
  const overlayColor = useThemeColor({}, "overlay");
  const warningColor = useThemeColor({}, "warning");
  const borderColor = useThemeColor({}, "border");

  const handleCreateWallet = () => {
    router.push("/onboarding/mnemonic-display");
  };

  const handleImportWallet = () => {
    router.push("/onboarding/import-wallet");
  };

  return (
    <SafeThemedView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Ethereum Icon */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: "white",
              borderColor,
              borderWidth: BorderWidth.thick,
              ...Shadows.large,
            },
          ]}
        >
          {/* use logo from assets/images/icon.png */}
          <Image
            source={require("../assets/images/icon.png")}
            style={{ width: 100, height: 100 }}
          />
        </View>

        {/* Main Title */}
        <ThemedText type="title" style={styles.title}>
          Better Wallet
        </ThemedText>

        {/* Subtitle */}
        <ThemedText style={styles.subtitle}>
          Turn this phone into a secure, offline Ethereum wallet
        </ThemedText>

        {/* Security Features */}
        <View
          style={[
            styles.featuresContainer,
            {
              backgroundColor: overlayColor,
              borderColor,
              borderWidth: BorderWidth.thick,
              ...Shadows.medium,
            },
          ]}
        >
          <ThemedText type="subtitle" style={styles.featuresTitle}>
            SECURITY FEATURES
          </ThemedText>

          <View style={styles.featureItem}>
            <Ionicons name="lock-closed" size={24} color="#000" />
            <ThemedText style={styles.featureText}>
              Completely offline operation
            </ThemedText>
          </View>

          <View style={styles.featureItem}>
            <MaterialCommunityIcons
              name="shield-check"
              size={24}
              color="#000"
            />
            <ThemedText style={styles.featureText}>
              Private keys never leave this device
            </ThemedText>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="phone-portrait" size={24} color="#000" />
            <ThemedText style={styles.featureText}>
              Sign transactions via QR codes
            </ThemedText>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="finger-print" size={24} color="#000" />
            <ThemedText style={styles.featureText}>
              Biometric authentication protection
            </ThemedText>
          </View>
        </View>

        {/* Security Warning */}
        <View
          style={[
            styles.warningContainer,
            {
              backgroundColor: warningColor,
              borderColor,
              borderWidth: BorderWidth.thick,
              ...Shadows.medium,
            },
          ]}
        >
          <Ionicons
            name="warning"
            size={28}
            color="#000"
            style={styles.warningIcon}
          />
          <ThemedText style={styles.warningText}>
            Keep this device offline at all times for maximum security
          </ThemedText>
        </View>

        {/* Action Buttons */}
        <ThemedButton
          title="Create New Wallet"
          variant="primary"
          onPress={handleCreateWallet}
          style={styles.createButton}
        />

        <ThemedButton
          title="Import Existing Wallet"
          variant="secondary"
          onPress={handleImportWallet}
          style={styles.importButton}
        />

        {/* Additional Info */}
        <ThemedText style={styles.infoText}>
          Create a new wallet or import an existing one using your 12-word
          recovery phrase.
        </ThemedText>
      </ScrollView>
    </SafeThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 0,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
    fontWeight: "800",
    fontSize: 28,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 24,
    fontSize: 16,
    fontWeight: "500",
    paddingHorizontal: Spacing.md,
  },
  featuresContainer: {
    padding: Spacing.lg,
    borderRadius: 0,
    marginBottom: Spacing.lg,
    width: "100%",
  },
  featuresTitle: {
    marginBottom: Spacing.md,
    textAlign: "center",
    fontWeight: "800",
    fontSize: 18,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  featureText: {
    flex: 1,
    lineHeight: 22,
    fontSize: 15,
    fontWeight: "600",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: 0,
    marginBottom: Spacing.xl,
    width: "100%",
    gap: Spacing.sm,
  },
  warningIcon: {
    marginRight: Spacing.xs,
  },
  warningText: {
    flex: 1,
    lineHeight: 20,
    fontWeight: "700",
    fontSize: 14,
  },
  createButton: {
    width: "100%",
    marginBottom: Spacing.sm,
  },
  importButton: {
    width: "100%",
    marginBottom: Spacing.md,
  },
  infoText: {
    textAlign: "center",
    lineHeight: 20,
    fontSize: 13,
    fontWeight: "500",
  },
});
