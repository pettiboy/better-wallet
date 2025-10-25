import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedText } from "@/components/themed-text";
import { QRScanner } from "@/components/QRScanner";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import { deserializeTransaction } from "@/utils/transaction-serializer";

export default function ScanTransactionScreen() {
  const [isScanning, setIsScanning] = useState(true);

  const overlayColor = useThemeColor({}, "overlay");

  const handleScan = (data: string) => {
    try {
      // Try to parse the transaction data
      const transactionData = deserializeTransaction(data);

      // Navigate to verification screen with the parsed transaction
      router.push({
        pathname: "/verify-transaction",
        params: {
          transactionData: JSON.stringify(transactionData),
        },
      });
    } catch (error) {
      console.error("Error parsing transaction:", error);
      Alert.alert(
        "Invalid Transaction",
        "The scanned QR code does not contain a valid transaction. Please try again.",
        [{ text: "OK", onPress: () => setIsScanning(true) }]
      );
    }
  };

  const handleClose = () => {
    router.back();
  };

  if (isScanning) {
    return (
      <QRScanner
        title="Scan Unsigned Transaction"
        onScan={handleScan}
        onClose={handleClose}
      />
    );
  }

  return (
    <SafeThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Scan Transaction
        </ThemedText>

        <ThemedText style={styles.subtitle}>
          Point camera at the transaction QR code from your hot wallet
        </ThemedText>
      </View>
    </SafeThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.7,
  },
});
