import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedButton } from "@/components/themed-button";
import { QRScanner } from "@/components/QRScanner";
import { QRDisplay } from "@/components/QRDisplay";
import { signTransaction, loadPrivateKey } from "@/services/wallet";
import { ethers } from "ethers";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function SignScreen() {
  const [scanning, setScanning] = useState(false);
  const [unsignedTx, setUnsignedTx] =
    useState<ethers.TransactionRequest | null>(null);
  const [signedTx, setSignedTx] = useState<string | null>(null);

  const overlayColor = useThemeColor({}, "overlay");

  const handleScan = async (data: string) => {
    try {
      const tx = JSON.parse(data);
      setUnsignedTx(tx);
      setScanning(false);
    } catch {
      Alert.alert("Error", "Invalid transaction QR code");
      setScanning(false);
    }
  };

  const handleSign = async () => {
    if (!unsignedTx) return;

    try {
      const privateKey = await loadPrivateKey();

      if (!privateKey) {
        Alert.alert(
          "Error",
          "No private key found. Please set up wallet first."
        );
        return;
      }

      const signed = await signTransaction(unsignedTx, privateKey);
      setSignedTx(signed);

      Alert.alert(
        "Success",
        "Transaction signed! Show this QR code to your hot wallet."
      );
    } catch (error) {
      console.error("Error signing transaction:", error);
      Alert.alert("Error", "Failed to sign transaction");
    }
  };

  const handleReset = () => {
    setUnsignedTx(null);
    setSignedTx(null);
  };

  if (scanning) {
    return (
      <QRScanner
        title="Scan Unsigned Transaction"
        onScan={handleScan}
        onClose={() => setScanning(false)}
      />
    );
  }

  if (signedTx) {
    return (
      <SafeThemedView>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedView style={styles.container}>
            <QRDisplay
              data={signedTx}
              title="Signed Transaction"
              description="Scan this with your hot wallet to broadcast"
              size={280}
            />
            <ThemedButton
              title="Sign Another Transaction"
              variant="primary"
              onPress={handleReset}
              style={styles.marginTop}
            />
          </ThemedView>
        </ScrollView>
      </SafeThemedView>
    );
  }

  if (unsignedTx) {
    return (
      <SafeThemedView>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>
              Review Transaction
            </ThemedText>

            <View
              style={[
                styles.detailsContainer,
                { backgroundColor: overlayColor },
              ]}
            >
              <DetailRow label="To" value={unsignedTx.to as string} />
              <DetailRow
                label="Amount"
                value={`${ethers.formatEther(unsignedTx.value || 0)} ETH`}
              />
              <DetailRow
                label="Gas Limit"
                value={unsignedTx.gasLimit?.toString() || "N/A"}
              />
              <DetailRow
                label="Chain ID"
                value={unsignedTx.chainId?.toString() || "N/A"}
              />
            </View>

            <View style={styles.buttonContainer}>
              <ThemedButton
                title="Sign Transaction"
                variant="success"
                onPress={handleSign}
              />

              <ThemedButton
                title="Cancel"
                variant="danger"
                onPress={handleReset}
                style={styles.marginTop}
              />
            </View>
          </ThemedView>
        </ScrollView>
      </SafeThemedView>
    );
  }

  return (
    <SafeThemedView>
      <ScrollView contentContainerStyle={styles.centerContainer}>
        <ThemedText type="title" style={styles.title}>
          Sign Transaction
        </ThemedText>

        <ThemedText style={styles.instructions}>
          Scan the QR code from your hot wallet to sign a transaction
        </ThemedText>

        <ThemedButton
          title="Scan Transaction QR"
          variant="primary"
          onPress={() => setScanning(true)}
        />
      </ScrollView>
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
    justifyContent: "center",
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
  },
  instructions: {
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.7,
  },
  detailsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabel: {
    fontWeight: "600",
    marginRight: 8,
  },
  detailValue: {
    flex: 1,
    textAlign: "right",
  },
  buttonContainer: {
    gap: 12,
  },
  marginTop: {
    marginTop: 12,
  },
});
