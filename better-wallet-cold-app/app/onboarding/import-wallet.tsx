import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { QRScanner } from "@/components/QRScanner";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BorderWidth, Shadows, Spacing } from "@/constants/theme";
import {
  importWalletFromMnemonic,
  validateMnemonic,
  importWalletFromPrivateKey,
  validatePrivateKey,
} from "@/services/wallet";
import { useWallet } from "@/contexts/WalletContext";

type ImportMode = "mnemonic" | "privateKey";

export default function ImportWalletScreen() {
  const [importMode, setImportMode] = useState<ImportMode>("mnemonic");
  const [mnemonic, setMnemonic] = useState("");
  const [privateKey, setPrivateKey] = useState("");
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

  const handleInputChange = (text: string) => {
    if (importMode === "mnemonic") {
      setMnemonic(text);
    } else {
      setPrivateKey(text);
    }
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleValidate = () => {
    if (importMode === "mnemonic") {
      const validation = validateMnemonic(mnemonic);
      if (!validation.isValid) {
        setValidationError(validation.error || "Invalid mnemonic phrase");
        return false;
      }
    } else {
      const validation = validatePrivateKey(privateKey);
      if (!validation.isValid) {
        setValidationError(validation.error || "Invalid private key");
        return false;
      }
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

      let walletAddress: string;

      if (importMode === "mnemonic") {
        // Import wallet from mnemonic (this will trigger authentication)
        const wallet = await importWalletFromMnemonic(mnemonic);
        walletAddress = wallet.address;
        // Clear mnemonic from memory
        setMnemonic("");
      } else {
        // Import wallet from private key (this will trigger authentication)
        const wallet = await importWalletFromPrivateKey(privateKey);
        walletAddress = wallet.address;
        // Clear private key from memory
        setPrivateKey("");
      }

      // Update wallet context
      setWalletAddress(walletAddress);
      markSetupComplete();

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
            : `Failed to import wallet. Please check your ${
                importMode === "mnemonic" ? "recovery phrase" : "private key"
              } and try again.`
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

      // Close scanner
      setIsScanning(false);

      if (importMode === "mnemonic") {
        // Set the mnemonic
        setMnemonic(cleanedData);

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
      } else {
        // Set the private key
        setPrivateKey(cleanedData);

        // Validate automatically after scanning
        const validation = validatePrivateKey(cleanedData);
        if (!validation.isValid) {
          setValidationError(
            validation.error || "Invalid private key from QR code"
          );
          Alert.alert(
            "Invalid QR Code",
            "The scanned QR code does not contain a valid private key. Please try again or enter manually."
          );
        } else {
          Alert.alert(
            "Private Key Scanned",
            "Your private key has been scanned successfully. Review and tap Import to continue."
          );
        }
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
    const hasInput =
      importMode === "mnemonic"
        ? mnemonic.trim().length > 0
        : privateKey.trim().length > 0;

    if (hasInput) {
      Alert.alert(
        "Cancel Import?",
        `Are you sure you want to cancel? Your entered ${
          importMode === "mnemonic" ? "phrase" : "private key"
        } will be lost.`,
        [
          { text: "Continue Editing", style: "cancel" },
          {
            text: "Cancel Import",
            style: "destructive",
            onPress: () => {
              setMnemonic("");
              setPrivateKey("");
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

  // For private key, count hex characters (without 0x prefix)
  const privateKeyWithoutPrefix = privateKey.trim().startsWith("0x")
    ? privateKey.trim().slice(2)
    : privateKey.trim();
  const hexCharCount = privateKeyWithoutPrefix.length;
  const isValidPrivateKeyLength = hexCharCount === 64;

  // Show QR scanner if scanning mode is active
  if (isScanning) {
    return (
      <QRScanner
        title={
          importMode === "mnemonic"
            ? "Scan Recovery Phrase QR"
            : "Scan Private Key QR"
        }
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
                {importMode === "mnemonic"
                  ? "Enter your 12-word recovery phrase to restore your wallet"
                  : "Enter your private key to restore your wallet"}
              </ThemedText>
            </View>

            {/* Import Mode Toggle */}
            <View
              style={[
                styles.toggleContainer,
                {
                  backgroundColor: overlayColor,
                  borderColor,
                  borderWidth: BorderWidth.thick,
                  ...Shadows.medium,
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.toggleButton,
                  {
                    backgroundColor:
                      importMode === "mnemonic" ? borderColor : "transparent",
                    borderColor,
                    borderWidth: BorderWidth.thin,
                  },
                ]}
                onPress={() => {
                  setImportMode("mnemonic");
                  setValidationError(null);
                }}
                disabled={importMode === "mnemonic"}
              >
                <ThemedText
                  style={[
                    styles.toggleButtonText,
                    importMode === "mnemonic" && styles.toggleButtonTextActive,
                  ]}
                >
                  Recovery Phrase
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.toggleButton,
                  {
                    backgroundColor:
                      importMode === "privateKey" ? borderColor : "transparent",
                    borderColor,
                    borderWidth: BorderWidth.thin,
                  },
                ]}
                onPress={() => {
                  setImportMode("privateKey");
                  setValidationError(null);
                }}
                disabled={importMode === "privateKey"}
              >
                <ThemedText
                  style={[
                    styles.toggleButtonText,
                    importMode === "privateKey" &&
                      styles.toggleButtonTextActive,
                  ]}
                >
                  Private Key
                </ThemedText>
              </TouchableOpacity>
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

            {/* Input Section - Conditional based on import mode */}
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
                  {importMode === "mnemonic"
                    ? "Recovery Phrase (12 words)"
                    : "Private Key (64 hex chars)"}
                </ThemedText>
                <View style={styles.wordCountBadge}>
                  <ThemedText
                    style={[
                      styles.wordCountText,
                      (importMode === "mnemonic"
                        ? isValidWordCount
                        : isValidPrivateKeyLength) && styles.wordCountValid,
                    ]}
                  >
                    {importMode === "mnemonic"
                      ? `${wordCount}/12`
                      : `${hexCharCount}/64`}
                  </ThemedText>
                </View>
              </View>

              <TextInput
                style={[
                  styles.textInput,
                  importMode === "privateKey" && styles.textInputSingleLine,
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
                value={importMode === "mnemonic" ? mnemonic : privateKey}
                onChangeText={handleInputChange}
                placeholder={
                  importMode === "mnemonic"
                    ? "Enter your 12 words separated by spaces"
                    : "Enter your private key (with or without 0x prefix)"
                }
                placeholderTextColor={`${textColor}60`}
                multiline={importMode === "mnemonic"}
                numberOfLines={importMode === "mnemonic" ? 4 : 1}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={true}
                textAlignVertical={importMode === "mnemonic" ? "top" : "center"}
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
                {importMode === "mnemonic"
                  ? '• Enter exactly 12 words separated by spaces\n• Scan QR code containing your recovery phrase\n• Words must be from the BIP-39 word list\n• All words should be lowercase\n• Copy-paste is supported\n• Use "Validate" to check before importing'
                  : '• Enter 64 hexadecimal characters (0-9, a-f)\n• Can be with or without 0x prefix\n• Scan QR code containing your private key\n• Copy-paste is supported\n• Use "Validate" to check before importing\n• Private key imports won\'t have a recovery phrase backup'}
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
            disabled={
              isImporting ||
              (importMode === "mnemonic"
                ? !isValidWordCount
                : !isValidPrivateKeyLength) ||
              !!validationError
            }
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
  toggleContainer: {
    flexDirection: "row",
    borderRadius: 0,
    padding: Spacing.xs,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  toggleButtonTextActive: {
    fontWeight: "800",
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
  textInputSingleLine: {
    minHeight: 50,
    lineHeight: 18,
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
