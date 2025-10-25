import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
  Text,
} from "react-native";
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

export default function SettingsScreen() {
  const { address, resetWallet } = useWallet();
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [mnemonic, setMnemonic] = useState<string>("");
  const [biometricInfo, setBiometricInfo] = useState<BiometricInfo | null>(
    null
  );
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const warningColor = useThemeColor({}, "warning");
  const overlayColor = useThemeColor({}, "overlay");
  const dangerColor = useThemeColor({}, "danger");
  const cardColor = useThemeColor({}, "card");

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
    <SafeThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Cold Wallet Settings
          </ThemedText>

          {/* Security Warning */}
          <View
            style={[styles.warningContainer, { backgroundColor: warningColor }]}
          >
            <Text style={styles.warningIcon}>⚠️</Text>
            <ThemedText style={styles.warningText}>
              KEEP THIS DEVICE OFFLINE
            </ThemedText>
            <ThemedText style={styles.warningSubtext}>
              Never connect this device to the internet while storing private
              keys
            </ThemedText>
          </View>

          {/* Wallet Address Section */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Your Address
            </ThemedText>
            <View
              style={[styles.addressBox, { backgroundColor: overlayColor }]}
            >
              <ThemedText style={styles.address}>
                {address || "Not available"}
              </ThemedText>
            </View>
          </View>

          {/* Security Section */}
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

          {/* Recovery Phrase Section */}
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

          {/* Factory Reset Section */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Danger Zone
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
              App Information
            </ThemedText>
            <View
              style={[styles.infoContainer, { backgroundColor: overlayColor }]}
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
    padding: 20,
  },
  content: {
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
    color: "white",
  },
  warningSubtext: {
    textAlign: "center",
    fontSize: 14,
    color: "white",
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
  resetWarning: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
  infoContainer: {
    padding: 16,
    borderRadius: 8,
  },
  infoItem: {
    marginBottom: 4,
    fontSize: 14,
  },
});
