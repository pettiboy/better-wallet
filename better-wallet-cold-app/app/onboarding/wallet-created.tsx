import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated, ScrollView } from "react-native";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useWallet } from "@/contexts/WalletContext";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BorderWidth, Shadows, Spacing } from "@/constants/theme";

export default function WalletCreatedScreen() {
  const { markSetupComplete, reloadWallet } = useWallet();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  const successColor = useThemeColor({}, "success");
  const overlayColor = useThemeColor({}, "overlay");
  const borderColor = useThemeColor({}, "border");

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    markSetupComplete();
    reloadWallet();
  }, [fadeAnim, markSetupComplete, reloadWallet, scaleAnim]);

  const handleGoToDashboard = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeThemedView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: successColor,
                borderColor,
                borderWidth: BorderWidth.thick,
                ...Shadows.large,
              },
            ]}
          >
            <Ionicons name="checkmark" size={72} color="white" />
          </View>

          {/* Main Message */}
          <ThemedText type="title" style={styles.title}>
            WALLET CREATED!
          </ThemedText>

          <ThemedText style={styles.subtitle}>
            Your cold wallet is ready. You can now receive ETH or sign Ethereum
            transactions.
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
              YOUR WALLET IS NOW SECURE WITH:
            </ThemedText>

            <View style={styles.featureItem}>
              <Ionicons name="lock-closed" size={24} color="#000" />
              <ThemedText style={styles.featureText}>
                Offline private key storage
              </ThemedText>
            </View>

            <View style={styles.featureItem}>
              <MaterialCommunityIcons
                name="shield-check"
                size={24}
                color="#000"
              />
              <ThemedText style={styles.featureText}>
                Biometric authentication protection
              </ThemedText>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="phone-portrait" size={24} color="#000" />
              <ThemedText style={styles.featureText}>
                QR code transaction signing
              </ThemedText>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="airplane" size={24} color="#000" />
              <ThemedText style={styles.featureText}>
                Airplane mode enforcement
              </ThemedText>
            </View>
          </View>

          {/* Next Steps */}
          <View
            style={[
              styles.nextStepsContainer,
              {
                backgroundColor: overlayColor,
                borderColor,
                borderWidth: BorderWidth.thick,
                ...Shadows.small,
              },
            ]}
          >
            <ThemedText type="subtitle" style={styles.nextStepsTitle}>
              WHAT&apos;S NEXT?
            </ThemedText>

            <View style={styles.nextStepItem}>
              <ThemedText style={styles.stepNumber}>1</ThemedText>
              <ThemedText style={styles.stepText}>
                Keep this device offline at all times
              </ThemedText>
            </View>

            <View style={styles.nextStepItem}>
              <ThemedText style={styles.stepNumber}>2</ThemedText>
              <ThemedText style={styles.stepText}>
                Use your hot wallet to create transactions
              </ThemedText>
            </View>

            <View style={styles.nextStepItem}>
              <ThemedText style={styles.stepNumber}>3</ThemedText>
              <ThemedText style={styles.stepText}>
                Scan transaction QR codes to sign them
              </ThemedText>
            </View>

            <View style={styles.nextStepItem}>
              <ThemedText style={styles.stepNumber}>4</ThemedText>
              <ThemedText style={styles.stepText}>
                Share signed transaction QR codes back to hot wallet
              </ThemedText>
            </View>
          </View>

          {/* Action Button */}
          <ThemedButton
            title="Go to Dashboard"
            variant="primary"
            onPress={handleGoToDashboard}
            style={styles.dashboardButton}
          />

          {/* Security Reminder */}
          <View
            style={[
              styles.reminderContainer,
              {
                borderColor,
                borderWidth: BorderWidth.thin,
              },
            ]}
          >
            <Ionicons name="information-circle" size={20} color="#000" />
            <ThemedText style={styles.reminderText}>
              Never connect this device to the internet while storing private
              keys
            </ThemedText>
          </View>
        </Animated.View>
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
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
  content: {
    alignItems: "center",
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
    fontSize: 32,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 24,
    fontSize: 16,
    fontWeight: "600",
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
    fontSize: 16,
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
  nextStepsContainer: {
    padding: Spacing.lg,
    borderRadius: 0,
    marginBottom: Spacing.xl,
    width: "100%",
  },
  nextStepsTitle: {
    marginBottom: Spacing.md,
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
  },
  nextStepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    textAlign: "center",
    fontWeight: "800",
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    lineHeight: 20,
    fontSize: 14,
    fontWeight: "600",
  },
  dashboardButton: {
    width: "100%",
    marginBottom: Spacing.md,
  },
  reminderContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: 0,
    gap: Spacing.xs,
    width: "100%",
  },
  reminderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
});
