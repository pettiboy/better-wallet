import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { QRDisplay } from "@/components/QRDisplay";
import { QRScanner } from "@/components/QRScanner";
import { useDeviceMode } from "@/contexts/DeviceModeContext";
import {
  constructTransaction,
  broadcastTransaction,
  isValidAddress,
} from "@/services/ethereum";
import { ethers } from "ethers";

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

    // The scanned data should be the signed transaction
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
      <ScrollView style={styles.scrollView}>
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

          <View style={styles.transactionDetails}>
            <DetailRow label="To" value={unsignedTx.to as string} />
            <DetailRow
              label="Amount"
              value={`${ethers.formatEther(unsignedTx.value || 0)} ETH`}
            />
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setStep("scan-signed")}
          >
            <Text style={styles.primaryButtonText}>
              Scan Signed Transaction
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleReset}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    );
  }

  if (step === "broadcasting") {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Broadcasting...
        </ThemedText>
        <ThemedText style={styles.message}>
          Sending transaction to the network
        </ThemedText>
      </ThemedView>
    );
  }

  if (step === "success" && txHash) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.successTitle}>
          ✅ Transaction Sent!
        </ThemedText>

        <View style={styles.hashContainer}>
          <ThemedText style={styles.hashLabel}>Transaction Hash:</ThemedText>
          <ThemedText style={styles.hash}>{txHash}</ThemedText>
        </View>

        <ThemedText style={styles.explorerText}>
          View on block explorer:
        </ThemedText>
        <ThemedText style={styles.explorerLink} numberOfLines={1}>
          https://sepolia.etherscan.io/tx/{txHash}
        </ThemedText>

        <TouchableOpacity style={styles.primaryButton} onPress={handleReset}>
          <Text style={styles.primaryButtonText}>Send Another Transaction</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            Send Transaction
          </ThemedText>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Recipient Address</ThemedText>
            <TextInput
              style={styles.input}
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
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.0"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCreateTransaction}
          >
            <Text style={styles.primaryButtonText}>Create Transaction</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <ThemedText style={styles.infoText}>
              💡 This will create an unsigned transaction. You&apos;ll need to
              show the QR code to your cold wallet for signing.
            </ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
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
  container: {
    flex: 1,
    padding: 20,
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
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  secondaryButtonText: {
    color: "#FF3B30",
    fontSize: 18,
    fontWeight: "600",
  },
  transactionDetails: {
    backgroundColor: "rgba(0,0,0,0.05)",
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
    backgroundColor: "rgba(0,0,0,0.05)",
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
    color: "#007AFF",
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: "#E8F4FD",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
