import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Switch, Alert } from "react-native";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useWallet } from "@/contexts/WalletContext";
import {
  getBiometricInfo,
  isBiometricEnabled,
  setBiometricEnabled as setBiometricEnabledSetting,
  getAuthenticationTypeName,
  type BiometricInfo,
} from "@/services/biometric";
import { loadMnemonic, deleteWallet } from "@/services/wallet";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BorderWidth, Shadows, Spacing } from "@/constants/theme";

export default function SettingsScreen() {
  const { address, resetWallet } = useWallet();
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [mnemonic, setMnemonic] = useState<string>("");
  const [biometricInfo, setBiometricInfo] = useState<BiometricInfo | null>(
    null
  );
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isLoadingMnemonic, setIsLoadingMnemonic] = useState(false);

  const warningColor = useThemeColor({}, "warning");
  const overlayColor = useThemeColor({}, "overlay");
  const dangerColor = useThemeColor({}, "danger");
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");

  useEffect(() => {
    loadBiometricInfo();
  }, []);

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
      setIsLoadingMnemonic(true);
      const mnemonicPhrase = await loadMnemonic();
      if (mnemonicPhrase) {
        setMnemonic(mnemonicPhrase);
        setShowMnemonic(true);
      } else {
        Alert.alert("Error", "No recovery phrase found");
      }
    } catch {
      Alert.alert("Error", "Failed to load recovery phrase");
    } finally {
      setIsLoadingMnemonic(false);
    }
  };

  const handleHideMnemonic = () => {
    setShowMnemonic(false);
    setMnemonic("");
  };

  const handleFactoryReset = () => {
    Alert.alert(
      "Factory Reset",
      "This will delete your private key and recovery phrase. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWallet();
              resetWallet();
              router.replace("/welcome");
            } catch (error) {
              console.error("Error during factory reset:", error);
              Alert.alert("Error", "Failed to reset wallet");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeThemedView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            SETTINGS
          </ThemedText>

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
            <Ionicons name="warning" size={32} color="#000" />
            <View style={styles.warningTextContainer}>
              <ThemedText style={styles.warningText}>
                KEEP THIS DEVICE OFFLINE
              </ThemedText>
              <ThemedText style={styles.warningSubtext}>
                Never connect this device to the internet while storing private
                keys
              </ThemedText>
            </View>
          </View>

          {/* Wallet Address Section */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              YOUR ADDRESS
            </ThemedText>
            <View
              style={[
                styles.addressBox,
                {
                  backgroundColor: cardColor,
                  borderColor,
                  borderWidth: BorderWidth.thick,
                  ...Shadows.small,
                },
              ]}
            >
              <ThemedText style={styles.address}>
                {address || "Not available"}
              </ThemedText>
            </View>
          </View>

          {/* Security Section */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              SECURITY
            </ThemedText>

            <View
              style={[
                styles.securityContainer,
                {
                  backgroundColor: overlayColor,
                  borderColor,
                  borderWidth: BorderWidth.thick,
                  ...Shadows.small,
                },
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
                <View style={styles.securityWarning}>
                  <Ionicons name="warning" size={16} color={dangerColor} />
                  <ThemedText
                    style={[styles.securityWarningText, { color: dangerColor }]}
                  >
                    Biometric authentication is not available on this device
                  </ThemedText>
                </View>
              )}

              {biometricInfo &&
                biometricInfo.isAvailable &&
                !biometricInfo.isEnrolled && (
                  <View style={styles.securityWarning}>
                    <Ionicons name="warning" size={16} color={dangerColor} />
                    <ThemedText
                      style={[
                        styles.securityWarningText,
                        { color: dangerColor },
                      ]}
                    >
                      Please set up biometric authentication in your device
                      settings
                    </ThemedText>
                  </View>
                )}
            </View>
          </View>

          {/* Recovery Phrase Section */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              RECOVERY PHRASE
            </ThemedText>

            {!showMnemonic ? (
              <ThemedButton
                title="Show Recovery Phrase"
                variant="primary"
                onPress={handleShowMnemonic}
                loading={isLoadingMnemonic}
              />
            ) : (
              <View style={styles.mnemonicContainer}>
                <View
                  style={[
                    styles.mnemonicWarningBox,
                    {
                      backgroundColor: dangerColor,
                      borderColor,
                      borderWidth: BorderWidth.thin,
                    },
                  ]}
                >
                  <Ionicons name="warning" size={20} color="#fff" />
                  <ThemedText style={styles.mnemonicWarning}>
                    Keep this safe and private!
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.mnemonicBox,
                    {
                      backgroundColor: cardColor,
                      borderColor,
                      borderWidth: BorderWidth.thick,
                      ...Shadows.medium,
                    },
                  ]}
                >
                  {mnemonic.split(" ").map((word, index) => (
                    <View
                      key={index}
                      style={[
                        styles.mnemonicWord,
                        {
                          backgroundColor: overlayColor,
                          borderColor,
                          borderWidth: BorderWidth.thin,
                        },
                      ]}
                    >
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

          {/* Factory Reset Section */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              DANGER ZONE
            </ThemedText>
            <ThemedButton
              title="Factory Reset"
              variant="danger"
              onPress={handleFactoryReset}
            />
            <ThemedText style={styles.resetWarning}>
              This will permanently delete your wallet and recovery phrase.
            </ThemedText>
          </View>

          {/* App Info */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              APP INFORMATION
            </ThemedText>
            <View
              style={[
                styles.infoContainer,
                {
                  backgroundColor: overlayColor,
                  borderColor,
                  borderWidth: BorderWidth.thick,
                  ...Shadows.small,
                },
              ]}
            >
              <ThemedText style={styles.infoItem}>Version: 1.0.0</ThemedText>
              <ThemedText style={styles.infoItem}>
                Type: Ethereum Cold Wallet
              </ThemedText>
              <ThemedText style={styles.infoItem}>
                Security: Offline Only
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
  scrollView: {
    flex: 1,
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
    marginBottom: Spacing.lg,
    textAlign: "center",
    fontWeight: "800",
    fontSize: 28,
  },
  warningContainer: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: 0,
    alignItems: "center",
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningText: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  warningSubtext: {
    fontSize: 13,
    fontWeight: "600",
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    fontWeight: "800",
    fontSize: 16,
  },
  addressBox: {
    padding: Spacing.md,
    borderRadius: 0,
  },
  address: {
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "700",
  },
  securityContainer: {
    borderRadius: 0,
    padding: Spacing.md,
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  securityInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  securityLabel: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 13,
    fontWeight: "600",
  },
  securityWarning: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  securityWarningText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  mnemonicContainer: {
    marginTop: Spacing.xs,
  },
  mnemonicWarningBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: 0,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  mnemonicWarning: {
    fontWeight: "700",
    color: "#fff",
    fontSize: 14,
  },
  mnemonicBox: {
    padding: Spacing.sm,
    borderRadius: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  mnemonicWord: {
    width: "48%",
    flexDirection: "row",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 0,
  },
  mnemonicWordNumber: {
    fontWeight: "800",
    marginRight: Spacing.xs,
    fontSize: 13,
  },
  mnemonicWordText: {
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: 13,
  },
  marginTop: {
    marginTop: Spacing.md,
  },
  resetWarning: {
    marginTop: Spacing.sm,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  infoContainer: {
    padding: Spacing.md,
    borderRadius: 0,
  },
  infoItem: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "600",
  },
});
