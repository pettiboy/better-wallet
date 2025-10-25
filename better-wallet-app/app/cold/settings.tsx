import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ScrollView, Switch } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedButton } from "@/components/themed-button";
import { QRDisplay } from "@/components/QRDisplay";
import { loadPrivateKey, loadMnemonic, getAddress } from "@/services/wallet";
import { useDeviceMode } from "@/contexts/DeviceModeContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import {
  getBiometricInfo,
  isBiometricEnabled,
  setBiometricEnabled as setBiometricEnabledSetting,
  getAuthenticationTypeName,
  type BiometricInfo,
} from "@/services/biometric";

export default function SettingsScreen() {
  const [address, setAddress] = useState<string>("");
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [mnemonic, setMnemonic] = useState<string>("");
  const [biometricInfo, setBiometricInfo] = useState<BiometricInfo | null>(
    null
  );
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const { walletAddress } = useDeviceMode();
  const { resetOnboarding } = useOnboarding();

  const warningColor = useThemeColor({}, "warning");
  const overlayColor = useThemeColor({}, "overlay");
  const dangerColor = useThemeColor({}, "danger");

  useEffect(() => {
    loadWalletInfo();
    loadBiometricInfo();
  }, []);

  const loadWalletInfo = async () => {
    try {
      const privateKey = await loadPrivateKey();
      if (privateKey) {
        const addr = getAddress(privateKey);
        setAddress(addr);
      }
    } catch (error) {
      console.error("Error loading wallet info:", error);
    }
  };

  const loadBiometricInfo = async () => {
    try {
      const [biometricData, isEnabled] = await Promise.all([
        getBiometricInfo(),
        isBiometricEnabled(),
      ]);
      setBiometricInfo(biometricData);
      setBiometricEnabled(isEnabled);
    } catch (error) {
      console.error("Error loading biometric info:", error);
    }
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    try {
      if (
        enabled &&
        biometricInfo &&
        (!biometricInfo.isAvailable || !biometricInfo.isEnrolled)
      ) {
        Alert.alert(
          "Biometric Not Available",
          "Biometric authentication is not available or not enrolled on this device. Please set up fingerprint, Face ID, or device PIN in your device settings."
        );
        return;
      }

      await setBiometricEnabledSetting(enabled);
      setBiometricEnabled(enabled);
    } catch (error) {
      console.error("Error updating biometric setting:", error);
      Alert.alert("Error", "Failed to update biometric setting");
    }
  };

  const handleShowMnemonic = async () => {
    try {
      const mnemonicPhrase = await loadMnemonic();
      if (mnemonicPhrase) {
        setMnemonic(mnemonicPhrase);
        setShowMnemonic(true);
      } else {
        Alert.alert("Error", "No recovery phrase found");
      }
    } catch {
      Alert.alert("Error", "Failed to load recovery phrase");
    }
  };

  const handleHideMnemonic = () => {
    setShowMnemonic(false);
    setMnemonic("");
  };

  const handleViewOnboardingAgain = async () => {
    try {
      await resetOnboarding();
      router.push("/(tabs)");
    } catch (error) {
      console.error("Error resetting onboarding:", error);
      Alert.alert("Error", "Failed to reset onboarding");
    }
  };

  return (
    <SafeThemedView>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            Cold Wallet Settings
          </ThemedText>

          <View
            style={[styles.warningContainer, { backgroundColor: warningColor }]}
          >
            <ThemedText style={styles.warningIcon}>⚠️</ThemedText>
            <ThemedText
              style={styles.warningText}
              lightColor="white"
              darkColor="white"
            >
              KEEP THIS DEVICE OFFLINE
            </ThemedText>
            <ThemedText
              style={styles.warningSubtext}
              lightColor="white"
              darkColor="white"
            >
              Never connect this device to the internet while storing private
              keys
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Your Address
            </ThemedText>
            <View
              style={[styles.addressBox, { backgroundColor: overlayColor }]}
            >
              <ThemedText style={styles.address}>
                {address || walletAddress}
              </ThemedText>
            </View>
          </View>

          {(address || walletAddress) && (
            <QRDisplay
              data={address || walletAddress || ""}
              title="Wallet Address QR"
              description="Scan this with your hot wallet"
              size={220}
            />
          )}

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Security
            </ThemedText>

            <View
              style={[
                styles.securityContainer,
                { backgroundColor: overlayColor },
              ]}
            >
              <View style={styles.securityRow}>
                <View style={styles.securityInfo}>
                  <ThemedText style={styles.securityLabel}>
                    Require Authentication Before Signing
                  </ThemedText>
                  <ThemedText style={styles.securityDescription}>
                    {biometricInfo
                      ? `Use ${getAuthenticationTypeName(
                          biometricInfo
                        )} to authenticate before signing transactions`
                      : "Checking authentication availability..."}
                  </ThemedText>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  disabled={
                    biometricInfo
                      ? !biometricInfo.isAvailable || !biometricInfo.isEnrolled
                      : true
                  }
                />
              </View>

              {biometricInfo && !biometricInfo.isAvailable && (
                <ThemedText
                  style={[styles.securityWarningText, { color: dangerColor }]}
                >
                  ⚠️ Biometric authentication is not available on this device
                </ThemedText>
              )}

              {biometricInfo &&
                biometricInfo.isAvailable &&
                !biometricInfo.isEnrolled && (
                  <ThemedText
                    style={[styles.securityWarningText, { color: dangerColor }]}
                  >
                    ⚠️ Please set up biometric authentication in your device
                    settings
                  </ThemedText>
                )}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Recovery Phrase
            </ThemedText>

            {!showMnemonic ? (
              <ThemedButton
                title="Show Recovery Phrase"
                variant="primary"
                onPress={handleShowMnemonic}
              />
            ) : (
              <View style={styles.mnemonicContainer}>
                <ThemedText
                  style={[styles.mnemonicWarning, { color: dangerColor }]}
                >
                  ⚠️ Keep this safe and private!
                </ThemedText>
                <View
                  style={[
                    styles.mnemonicBox,
                    { backgroundColor: overlayColor },
                  ]}
                >
                  {mnemonic.split(" ").map((word, index) => (
                    <View key={index} style={styles.mnemonicWord}>
                      <ThemedText style={styles.mnemonicWordNumber}>
                        {index + 1}.
                      </ThemedText>
                      <ThemedText style={styles.mnemonicWordText}>
                        {word}
                      </ThemedText>
                    </View>
                  ))}
                </View>
                <ThemedButton
                  title="Hide Recovery Phrase"
                  variant="danger"
                  onPress={handleHideMnemonic}
                  style={styles.marginTop}
                />
              </View>
            )}
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Help & Support
            </ThemedText>
            <ThemedButton
              title="View Onboarding Again"
              variant="secondary"
              onPress={handleViewOnboardingAgain}
            />
          </View>
        </ThemedView>
      </ScrollView>
    </SafeThemedView>
  );
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
  },
  title: {
    marginBottom: 24,
    textAlign: "center",
  },
  warningContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  warningIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  warningSubtext: {
    textAlign: "center",
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  addressBox: {
    padding: 12,
    borderRadius: 8,
  },
  address: {
    fontFamily: "monospace",
    fontSize: 12,
  },
  mnemonicContainer: {
    marginTop: 8,
  },
  mnemonicWarning: {
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "600",
  },
  mnemonicBox: {
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  mnemonicWord: {
    width: "50%",
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  mnemonicWordNumber: {
    fontWeight: "600",
    marginRight: 6,
    opacity: 0.5,
  },
  mnemonicWordText: {
    fontFamily: "monospace",
  },
  marginTop: {
    marginTop: 16,
  },
  securityContainer: {
    borderRadius: 12,
    padding: 16,
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  securityInfo: {
    flex: 1,
    marginRight: 12,
  },
  securityLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  securityWarningText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});
