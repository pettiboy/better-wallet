import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TextInput, Alert } from "react-native";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { QRScanner } from "@/components/QRScanner";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BorderWidth, Shadows, Spacing } from "@/constants/theme";
import { importWalletFromMnemonic, validateMnemonic } from "@/services/wallet";
import { useWallet } from "@/contexts/WalletContext";

export default function ImportWalletScreen() {
  const [mnemonic, setMnemonic] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { setWalletAddress, markSetupComplete } = useWallet();

  const overlayColor = useThemeColor({}, "overlay");
  const warningColor = useThemeColor({}, "warning");
  const borderColor = useThemeColor({}, "border");
  const errorColor = useThemeColor({}, "danger");
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const handleMnemonicChange = (text: string) => {
    setMnemonic(text);
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleValidate = () => {
    const validation = validateMnemonic(mnemonic);
    if (!validation.isValid) {
      setValidationError(validation.error || "Invalid mnemonic phrase");
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleImport = async () => {
    // Validate first
    if (!handleValidate()) {
      return;
    }

    try {
      setIsImporting(true);

      // Import wallet (this will trigger authentication)
      const wallet = await importWalletFromMnemonic(mnemonic);

      // Update wallet context
      setWalletAddress(wallet.address);
      markSetupComplete();

      // Clear mnemonic from memory
      setMnemonic("");

      // Show success and navigate
      Alert.alert(
        "Wallet Imported",
        "Your wallet has been imported successfully!",
        [
          {
            text: "Continue",
            onPress: () => {
              router.replace("/(tabs)");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error importing wallet:", error);

      if (
        error instanceof Error &&
        error.message.includes("Authentication required")
      ) {
        Alert.alert(
          "Authentication Required",
          "You must authenticate to import your wallet. Please try again."
        );
      } else if (
        error instanceof Error &&
        error.message.includes("Authentication")
      ) {
        Alert.alert(
          "Authentication Failed",
          "Failed to authenticate. Please try again."
        );
      } else {
        Alert.alert(
          "Import Failed",
          error instanceof Error
            ? error.message
            : "Failed to import wallet. Please check your recovery phrase and try again."
        );
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleScanQR = () => {
    setIsScanning(true);
  };

  const handleQRScanned = (data: string) => {
    try {
      // Clean up the scanned data
      const cleanedData = data.trim();

      // Set the mnemonic
      setMnemonic(cleanedData);

      // Close scanner
      setIsScanning(false);

      // Validate automatically after scanning
      const validation = validateMnemonic(cleanedData);
      if (!validation.isValid) {
        setValidationError(
          validation.error || "Invalid mnemonic phrase from QR code"
        );
        Alert.alert(
          "Invalid QR Code",
          "The scanned QR code does not contain a valid 12-word recovery phrase. Please try again or enter manually."
        );
      } else {
        Alert.alert(
          "Recovery Phrase Scanned",
          "Your recovery phrase has been scanned successfully. Review and tap Import to continue."
        );
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
      setIsScanning(false);
      Alert.alert(
        "Scan Error",
        "Failed to process the QR code. Please try again or enter manually."
      );
    }
  };

  const handleCloseScan = () => {
    setIsScanning(false);
  };

  const handleCancel = () => {
    if (mnemonic.trim().length > 0) {
      Alert.alert(
        "Cancel Import?",
        "Are you sure you want to cancel? Your entered phrase will be lost.",
        [
          { text: "Continue Editing", style: "cancel" },
          {
            text: "Cancel Import",
            style: "destructive",
            onPress: () => {
              setMnemonic("");
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const wordCount = mnemonic.trim().split(/\s+/).filter(Boolean).length;
  const isValidWordCount = wordCount === 12;

  // Show QR scanner if scanning mode is active
  if (isScanning) {
    return (
      <QRScanner
        title="Scan Recovery Phrase QR"
        onScan={handleQRScanned}
        onClose={handleCloseScan}
      />
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Import Wallet",
          headerShown: false,
        }}
      />
      <SafeThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <ThemedText type="title" style={styles.title}>
                IMPORT WALLET
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Enter your 12-word recovery phrase to restore your wallet
              </ThemedText>
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
              <Ionicons name="warning" size={24} color="#000" />
              <View style={styles.warningTextContainer}>
                <ThemedText style={styles.warningTitle}>
                  SECURITY WARNING
                </ThemedText>
                <ThemedText style={styles.warningText}>
                  • Only import on a device you trust and control{"\n"}• This
                  device should remain offline (air-gapped){"\n"}• Your recovery
                  phrase will be stored with hardware encryption{"\n"}•
                  Authentication required to access after import
                </ThemedText>
              </View>
            </View>

            {/* Mnemonic Input */}
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: overlayColor,
                  borderColor,
                  borderWidth: BorderWidth.thick,
                  ...Shadows.medium,
                },
              ]}
            >
              <View style={styles.inputHeader}>
                <ThemedText style={styles.inputLabel}>
                  Recovery Phrase (12 words)
                </ThemedText>
                <View style={styles.wordCountBadge}>
                  <ThemedText
                    style={[
                      styles.wordCountText,
                      isValidWordCount && styles.wordCountValid,
                    ]}
                  >
                    {wordCount}/12
                  </ThemedText>
                </View>
              </View>

              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor,
                    borderColor,
                    color: textColor,
                  },
                  validationError && {
                    borderColor: errorColor,
                    borderWidth: BorderWidth.thick,
                  },
                ]}
                value={mnemonic}
                onChangeText={handleMnemonicChange}
                placeholder="Enter your 12 words separated by spaces"
                placeholderTextColor={`${textColor}60`}
                multiline
                numberOfLines={4}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={true}
                textAlignVertical="top"
              />

              <View style={styles.inputActions}>
                <ThemedButton
                  title="Scan QR"
                  variant="secondary"
                  onPress={handleScanQR}
                  style={styles.scanButton}
                />
                <ThemedButton
                  title="Validate"
                  variant="secondary"
                  onPress={handleValidate}
                  style={styles.validateButton}
                />
              </View>

              {validationError && (
                <View style={styles.errorContainer}>
                  <Ionicons name="close-circle" size={18} color={errorColor} />
                  <ThemedText style={[styles.errorText, { color: errorColor }]}>
                    {validationError}
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Info Section */}
            <View
              style={[
                styles.infoContainer,
                {
                  backgroundColor: overlayColor,
                  borderColor,
                  borderWidth: BorderWidth.thick,
                },
              ]}
            >
              <ThemedText style={styles.infoTitle}>Tips:</ThemedText>
              <ThemedText style={styles.infoText}>
                • Enter exactly 12 words separated by spaces{"\n"}• Scan QR code
                containing your recovery phrase{"\n"}• Words must be from the
                BIP-39 word list{"\n"}• All words should be lowercase{"\n"}•
                Copy-paste is supported{"\n"}• Use &quot;Validate&quot; to check
                before importing
              </ThemedText>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View
          style={[
            styles.buttonContainer,
            {
              backgroundColor,
              borderTopColor: borderColor,
              borderTopWidth: BorderWidth.thick,
            },
          ]}
        >
          <ThemedButton
            title={isImporting ? "Importing..." : "Import Wallet"}
            variant="primary"
            onPress={handleImport}
            disabled={isImporting || !isValidWordCount || !!validationError}
            loading={isImporting}
            style={styles.importButton}
          />

          <ThemedButton
            title="Cancel"
            // outline button
            variant="outline"
            onPress={handleCancel}
            disabled={isImporting}
            style={styles.cancelButton}
          />
        </View>
      </SafeThemedView>
    </>
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
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
    fontWeight: "800",
    fontSize: 26,
    letterSpacing: 0.5,
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 22,
    fontSize: 15,
    fontWeight: "500",
    opacity: 0.8,
  },
  warningContainer: {
    borderRadius: 0,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  warningText: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
  },
  inputContainer: {
    borderRadius: 0,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  wordCountBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 0,
  },
  wordCountText: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  wordCountValid: {
    color: "#22c55e",
  },
  textInput: {
    minHeight: 120,
    padding: Spacing.sm,
    borderWidth: BorderWidth.thin,
    borderRadius: 0,
    fontSize: 14,
    fontFamily: "monospace",
    fontWeight: "600",
    lineHeight: 22,
  },
  inputActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  scanButton: {
    flex: 1,
  },
  validateButton: {
    flex: 1,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  infoContainer: {
    borderRadius: 0,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  infoText: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
    opacity: 0.8,
  },
  buttonContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  importButton: {
    width: "100%",
  },
  cancelButton: {
    width: "100%",
  },
});
