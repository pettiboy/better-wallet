import React, { useState } from "react";
import { Alert } from "react-native";
import { QRScanner } from "@/components/QRScanner";
import { router } from "expo-router";
import { deserializeTransaction } from "@/utils/transaction-serializer";

export default function ScanTransactionScreen() {
  const [scannerKey, setScannerKey] = useState(0);

  const handleScan = (data: string) => {
    try {
      // Try to parse the transaction data
      const transactionData = deserializeTransaction(data);

      // Validate that we have required transaction fields
      if (!transactionData.transaction || !transactionData.transaction.to) {
        throw new Error("Invalid transaction format: missing required fields");
      }

      // Convert BigInt values to strings for JSON serialization
      const serializableTransaction = {
        ...transactionData,
        transaction: {
          ...transactionData.transaction,
          value: transactionData.transaction.value?.toString(),
          gasLimit: transactionData.transaction.gasLimit?.toString(),
          maxFeePerGas: transactionData.transaction.maxFeePerGas?.toString(),
          maxPriorityFeePerGas:
            transactionData.transaction.maxPriorityFeePerGas?.toString(),
        },
      };

      // Navigate to verification screen with the parsed transaction
      router.push({
        pathname: "/verify-transaction",
        params: {
          transactionData: JSON.stringify(serializableTransaction),
        },
      });
    } catch (error) {
      console.error("Error parsing transaction:", error);

      // Determine error message based on error type
      let errorMessage =
        "The scanned QR code does not contain a valid transaction.";

      if (error instanceof SyntaxError) {
        errorMessage =
          "Invalid QR code format. This does not appear to be a transaction QR code.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert(
        "Invalid Transaction QR Code",
        errorMessage +
          "\n\nPlease scan a valid transaction QR code from your hot wallet.",
        [
          {
            text: "Try Again",
            onPress: () => {
              // Force remount of QRScanner by changing key
              setScannerKey((prev) => prev + 1);
            },
          },
          {
            text: "Cancel",
            style: "cancel",
            onPress: handleClose,
          },
        ]
      );
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <QRScanner
      key={scannerKey}
      title="Scan Unsigned Transaction"
      onScan={handleScan}
      onClose={handleClose}
    />
  );
}
