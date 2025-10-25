import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Animated } from "react-native";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useWallet } from "@/contexts/WalletContext";
import { router } from "expo-router";

export default function WalletCreatedScreen() {
  const { setWalletAddress, markSetupComplete } = useWallet();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  const successColor = useThemeColor({}, "success");
  const primaryColor = useThemeColor({}, "primary");
  const overlayColor = useThemeColor({}, "overlay");

  useEffect(() => {
    // Animate the success screen
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Mark setup as complete
    markSetupComplete();
  }, []);

  const handleGoToDashboard = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeThemedView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Success Icon */}
        <View style={[styles.iconContainer, { backgroundColor: successColor }]}>
          <Text style={styles.successIcon}>✓</Text>
        </View>

        {/* Main Message */}
        <ThemedText type="title" style={styles.title}>
          Wallet Created Successfully!
        </ThemedText>

        <ThemedText style={styles.subtitle}>
          Your cold wallet is ready. You can now receive ETH or sign Ethereum
          transactions.
        </ThemedText>

        {/* Security Features */}
        <View
          style={[styles.featuresContainer, { backgroundColor: overlayColor }]}
        >
          <ThemedText type="subtitle" style={styles.featuresTitle}>
            Your wallet is now secure with:
          </ThemedText>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔒</Text>
            <ThemedText style={styles.featureText}>
              Offline private key storage
            </ThemedText>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🛡️</Text>
            <ThemedText style={styles.featureText}>
              Biometric authentication protection
            </ThemedText>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📱</Text>
            <ThemedText style={styles.featureText}>
              QR code transaction signing
            </ThemedText>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✈️</Text>
            <ThemedText style={styles.featureText}>
              Airplane mode enforcement
            </ThemedText>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.nextStepsContainer}>
          <ThemedText type="subtitle" style={styles.nextStepsTitle}>
            What's Next?
          </ThemedText>

          <ThemedText style={styles.nextStepItem}>
            1. Keep this device offline at all times
          </ThemedText>
          <ThemedText style={styles.nextStepItem}>
            2. Use your hot wallet to create transactions
          </ThemedText>
          <ThemedText style={styles.nextStepItem}>
            3. Scan transaction QR codes to sign them
          </ThemedText>
          <ThemedText style={styles.nextStepItem}>
            4. Share signed transaction QR codes back to hot wallet
          </ThemedText>
        </View>

        {/* Action Button */}
        <ThemedButton
          title="Go to Dashboard"
          variant="primary"
          onPress={handleGoToDashboard}
          style={styles.dashboardButton}
        />

        {/* Security Reminder */}
        <ThemedText style={styles.reminderText}>
          Remember: Never connect this device to the internet while storing
          private keys
        </ThemedText>
      </Animated.View>
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
  successIcon: {
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
    padding: 20,
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
  nextStepsContainer: {
    marginBottom: 32,
    width: "100%",
    maxWidth: 400,
  },
  nextStepsTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  nextStepItem: {
    marginBottom: 8,
    lineHeight: 20,
    opacity: 0.8,
  },
  dashboardButton: {
    width: "100%",
    maxWidth: 300,
    marginBottom: 16,
  },
  reminderText: {
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.6,
    maxWidth: 350,
    fontStyle: "italic",
  },
});
