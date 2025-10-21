import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedButton } from "@/components/themed-button";
import { QRDisplay } from "@/components/QRDisplay";
import { QRScanner } from "@/components/QRScanner";
import { useDeviceMode } from "@/contexts/DeviceModeContext";
import {
  constructTransaction,
  broadcastTransaction,
  isValidAddress,
} from "@/services/ethereum";
import { ethers } from "ethers";
import { useThemeColor } from "@/hooks/use-theme-color";

type Step =
  | "input"
  | "show-unsigned"
  | "scan-signed"
  | "broadcasting"
  | "success";

export default function SendScreen() {
  const { walletAddress } = useDeviceMode();
  const [step, setStep] = useState<Step>("input");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [unsignedTx, setUnsignedTx] =
    useState<ethers.TransactionRequest | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const borderColor = useThemeColor({}, "border");
  const overlayColor = useThemeColor({}, "overlay");
  const infoColor = useThemeColor({}, "info");
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const primaryColor = useThemeColor({}, "primary");

  const handleCreateTransaction = async () => {
    if (!walletAddress) {
      Alert.alert("Error", "No wallet address found");
      return;
    }

    if (!recipient || !amount) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!isValidAddress(recipient)) {
      Alert.alert("Error", "Invalid recipient address");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Error", "Invalid amount");
      return;
    }

    try {
      const tx = await constructTransaction(walletAddress, recipient, amount);
      setUnsignedTx(tx);
      setStep("show-unsigned");
    } catch (error) {
      console.error("Error creating transaction:", error);
      Alert.alert(
        "Error",
        "Failed to create transaction. Check your balance and internet connection."
      );
    }
  };

  const handleScanSigned = (data: string) => {
    setStep("input");
    broadcastSignedTransaction(data);
  };

  const broadcastSignedTransaction = async (signedTx: string) => {
    setStep("broadcasting");

    try {
      const hash = await broadcastTransaction(signedTx);
      setTxHash(hash);
      setStep("success");
      Alert.alert(
        "Success",
        `Transaction broadcasted!\nHash: ${hash.substring(0, 10)}...`
      );
    } catch (error) {
      console.error("Error broadcasting transaction:", error);
      Alert.alert("Error", "Failed to broadcast transaction");
      setStep("input");
    }
  };

  const handleReset = () => {
    setStep("input");
    setRecipient("");
    setAmount("");
    setUnsignedTx(null);
    setTxHash(null);
  };

  if (step === "scan-signed") {
    return (
      <QRScanner
        title="Scan Signed Transaction"
        onScan={handleScanSigned}
        onClose={() => setStep("show-unsigned")}
      />
    );
  }

  if (step === "show-unsigned" && unsignedTx) {
    return (
      <SafeThemedView>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>
              Unsigned Transaction
            </ThemedText>

            <ThemedText style={styles.instructions}>
              Show this QR code to your cold wallet for signing
            </ThemedText>

            <QRDisplay
              data={JSON.stringify(unsignedTx)}
              title="Transaction to Sign"
              size={280}
            />

            <View
              style={[
                styles.transactionDetails,
                { backgroundColor: overlayColor },
              ]}
            >
              <DetailRow label="To" value={unsignedTx.to as string} />
              <DetailRow
                label="Amount"
                value={`${ethers.formatEther(unsignedTx.value || 0)} ETH`}
              />
            </View>

            <ThemedButton
              title="Scan Signed Transaction"
              variant="primary"
              onPress={() => setStep("scan-signed")}
            />

            <ThemedButton
              title="Cancel"
              variant="danger"
              onPress={handleReset}
              style={styles.marginTop}
            />
          </ThemedView>
        </ScrollView>
      </SafeThemedView>
    );
  }

  if (step === "broadcasting") {
    return (
      <SafeThemedView>
        <ScrollView contentContainerStyle={styles.centerContainer}>
          <ThemedText type="title" style={styles.title}>
            Broadcasting...
          </ThemedText>
          <ThemedText style={styles.message}>
            Sending transaction to the network
          </ThemedText>
        </ScrollView>
      </SafeThemedView>
    );
  }

  if (step === "success" && txHash) {
    return (
      <SafeThemedView>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.successTitle}>
              ✅ Transaction Sent!
            </ThemedText>

            <View
              style={[styles.hashContainer, { backgroundColor: overlayColor }]}
            >
              <ThemedText style={styles.hashLabel}>
                Transaction Hash:
              </ThemedText>
              <ThemedText style={styles.hash}>{txHash}</ThemedText>
            </View>

            <ThemedText style={styles.explorerText}>
              View on block explorer:
            </ThemedText>
            <ThemedText
              style={[styles.explorerLink, { color: primaryColor }]}
              numberOfLines={1}
            >
              https://sepolia.etherscan.io/tx/{txHash}
            </ThemedText>

            <ThemedButton
              title="Send Another Transaction"
              variant="primary"
              onPress={handleReset}
            />
          </ThemedView>
        </ScrollView>
      </SafeThemedView>
    );
  }

  return (
    <SafeThemedView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>
              Send Transaction
            </ThemedText>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>
                Recipient Address
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { borderColor, color: textColor, backgroundColor },
                ]}
                value={recipient}
                onChangeText={setRecipient}
                placeholder="0x..."
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Amount (ETH)</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { borderColor, color: textColor, backgroundColor },
                ]}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.0"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />
            </View>

            <ThemedButton
              title="Create Transaction"
              variant="primary"
              onPress={handleCreateTransaction}
            />

            <View style={[styles.infoBox, { backgroundColor: infoColor }]}>
              <ThemedText style={styles.infoText}>
                💡 This will create an unsigned transaction. You&apos;ll need to
                show the QR code to your cold wallet for signing.
              </ThemedText>
            </View>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeThemedView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <ThemedText style={styles.detailLabel}>{label}:</ThemedText>
      <ThemedText
        style={styles.detailValue}
        numberOfLines={1}
        ellipsizeMode="middle"
      >
        {value}
      </ThemedText>
    </View>
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
  centerContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 24,
    textAlign: "center",
  },
  successTitle: {
    marginBottom: 24,
    textAlign: "center",
    color: "#34C759",
  },
  instructions: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  transactionDetails: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: "600",
    marginRight: 8,
  },
  detailValue: {
    flex: 1,
    textAlign: "right",
    fontFamily: "monospace",
  },
  message: {
    textAlign: "center",
    marginTop: 32,
  },
  hashContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  hashLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 6,
  },
  hash: {
    fontFamily: "monospace",
    fontSize: 11,
  },
  explorerText: {
    fontSize: 14,
    marginBottom: 6,
  },
  explorerLink: {
    fontFamily: "monospace",
    fontSize: 11,
    marginBottom: 24,
  },
  infoBox: {
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  marginTop: {
    marginTop: 12,
  },
});
