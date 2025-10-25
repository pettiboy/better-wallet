import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { QRDisplay } from "@/components/QRDisplay";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useWallet } from "@/contexts/WalletContext";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";

export default function ReceiveScreen() {
  const { address } = useWallet();
  const overlayColor = useThemeColor({}, "overlay");
  const borderColor = useThemeColor({}, "border");
  const successColor = useThemeColor({}, "success");

  const handleCopyAddress = async () => {
    if (address) {
      try {
        await Clipboard.setStringAsync(address);
        Alert.alert("Copied", "Address copied to clipboard");
      } catch (error) {
        console.error("Error copying address:", error);
        Alert.alert("Error", "Failed to copy address");
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (!address) {
    return (
      <SafeThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText type="title" style={styles.errorTitle}>
            No Wallet Address
          </ThemedText>
          <ThemedText style={styles.errorText}>
            Wallet address not available. Please check your wallet setup.
          </ThemedText>
          <ThemedButton
            title="Go Back"
            variant="primary"
            onPress={handleBack}
            style={styles.backButton}
          />
        </View>
      </SafeThemedView>
    );
  }

  return (
    <SafeThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <ThemedText type="title" style={styles.title}>
            Receive ETH & Tokens
          </ThemedText>

          <ThemedText style={styles.subtitle}>
            Share this address to receive Ethereum and ERC-20 tokens
          </ThemedText>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <QRDisplay
              data={address}
              title="Your Ethereum Address"
              description="Scan this with your hot wallet"
              size={280}
            />
          </View>

          {/* Address Display */}
          <View
            style={[
              styles.addressContainer,
              { backgroundColor: overlayColor, borderColor },
            ]}
          >
            <ThemedText type="subtitle" style={styles.addressTitle}>
              Address Details
            </ThemedText>

            <View style={styles.addressRow}>
              <ThemedText style={styles.addressLabel}>Full Address:</ThemedText>
              <TouchableOpacity
                onPress={handleCopyAddress}
                style={styles.copyButton}
              >
                <ThemedText style={styles.copyText}>Copy</ThemedText>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.addressBox,
                { backgroundColor: "rgba(255,255,255,0.05)" },
              ]}
            >
              <ThemedText style={styles.addressText}>{address}</ThemedText>
            </View>
          </View>

          {/* Instructions */}
          <View
            style={[
              styles.instructionsContainer,
              { backgroundColor: overlayColor },
            ]}
          >
            <ThemedText type="subtitle" style={styles.instructionsTitle}>
              How to Receive:
            </ThemedText>

            <View style={styles.instructionItem}>
              <ThemedText style={styles.instructionNumber}>1.</ThemedText>
              <ThemedText style={styles.instructionText}>
                Share this address with the sender
              </ThemedText>
            </View>

            <View style={styles.instructionItem}>
              <ThemedText style={styles.instructionNumber}>2.</ThemedText>
              <ThemedText style={styles.instructionText}>
                They can send ETH or ERC-20 tokens to this address
              </ThemedText>
            </View>

            <View style={styles.instructionItem}>
              <ThemedText style={styles.instructionNumber}>3.</ThemedText>
              <ThemedText style={styles.instructionText}>
                Transactions will appear in your hot wallet
              </ThemedText>
            </View>
          </View>

          {/* Security Note */}
          <View
            style={[styles.securityNote, { backgroundColor: successColor }]}
          >
            <ThemedText style={styles.securityIcon}>🛡️</ThemedText>
            <ThemedText style={styles.securityText}>
              This address is safe to share publicly. Only your private key can
              spend from this address.
            </ThemedText>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <ThemedButton
              title="Copy Address"
              variant="primary"
              onPress={handleCopyAddress}
              style={styles.copyAddressButton}
            />

            <ThemedButton
              title="Back to Dashboard"
              variant="secondary"
              onPress={handleBack}
              style={styles.backButton}
            />
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  errorText: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
    opacity: 0.8,
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  addressContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  addressTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  addressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  copyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  copyText: {
    fontSize: 12,
    fontWeight: "600",
  },
  addressBox: {
    padding: 12,
    borderRadius: 8,
  },
  addressText: {
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18,
  },
  instructionsContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  instructionsTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  instructionItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
    width: 20,
  },
  instructionText: {
    flex: 1,
    lineHeight: 20,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "white",
  },
  buttonContainer: {
    gap: 12,
  },
  copyAddressButton: {
    width: "100%",
  },
  backButton: {
    width: "100%",
  },
});
