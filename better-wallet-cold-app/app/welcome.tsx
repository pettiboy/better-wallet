import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";

export default function WelcomeScreen() {
  const primaryColor = useThemeColor({}, "primary");
  const overlayColor = useThemeColor({}, "overlay");
  const cardColor = useThemeColor({}, "card");

  const handleCreateWallet = () => {
    router.push("/onboarding/mnemonic-display");
  };

  return (
    <SafeThemedView style={styles.container}>
      <View style={styles.content}>
        {/* Ethereum Icon */}
        <View style={[styles.iconContainer, { backgroundColor: primaryColor }]}>
          <Text style={styles.ethereumIcon}>Ξ</Text>
        </View>

        {/* Main Title */}
        <ThemedText type="title" style={styles.title}>
          Ethereum Cold Wallet
        </ThemedText>

        {/* Subtitle */}
        <ThemedText style={styles.subtitle}>
          Turn this phone into a secure, offline Ethereum wallet
        </ThemedText>

        {/* Security Features */}
        <View
          style={[styles.featuresContainer, { backgroundColor: overlayColor }]}
        >
          <ThemedText type="subtitle" style={styles.featuresTitle}>
            Security Features
          </ThemedText>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔒</Text>
            <ThemedText style={styles.featureText}>
              Completely offline operation
            </ThemedText>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🛡️</Text>
            <ThemedText style={styles.featureText}>
              Private keys never leave this device
            </ThemedText>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📱</Text>
            <ThemedText style={styles.featureText}>
              Sign transactions via QR codes
            </ThemedText>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔐</Text>
            <ThemedText style={styles.featureText}>
              Biometric authentication protection
            </ThemedText>
          </View>
        </View>

        {/* Security Warning */}
        <View style={[styles.warningContainer, { backgroundColor: cardColor }]}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <ThemedText style={styles.warningText}>
            Keep this device offline at all times for maximum security
          </ThemedText>
        </View>

        {/* Action Button */}
        <ThemedButton
          title="Create New Wallet"
          variant="primary"
          onPress={handleCreateWallet}
          style={styles.createButton}
        />

        {/* Additional Info */}
        <ThemedText style={styles.infoText}>
          Your wallet will be generated with a 12-word recovery phrase. Write it
          down and store it safely offline.
        </ThemedText>
      </View>
    </SafeThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ethereumIcon: {
    fontSize: 48,
    color: "white",
    fontWeight: "bold",
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
    opacity: 0.8,
  },
  featuresContainer: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    width: "100%",
    maxWidth: 400,
  },
  featuresTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  featureText: {
    flex: 1,
    lineHeight: 20,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    width: "100%",
    maxWidth: 400,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    lineHeight: 20,
    fontWeight: "600",
  },
  createButton: {
    width: "100%",
    maxWidth: 300,
    marginBottom: 16,
  },
  infoText: {
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.7,
    maxWidth: 350,
  },
});
