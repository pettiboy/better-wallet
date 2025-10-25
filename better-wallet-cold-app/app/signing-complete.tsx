import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, Animated } from "react-native";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { QRDisplay } from "@/components/QRDisplay";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useLocalSearchParams, router } from "expo-router";
import { serializeSignedTransaction } from "@/utils/transaction-serializer";
import * as Clipboard from "expo-clipboard";

export default function SigningCompleteScreen() {
  const { signedTransaction } = useLocalSearchParams<{
    signedTransaction: string;
  }>();
  const [signedTxData, setSignedTxData] = useState<string>("");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  const successColor = useThemeColor({}, "success");
  const overlayColor = useThemeColor({}, "overlay");
  const borderColor = useThemeColor({}, "border");

  useEffect(() => {
    if (signedTransaction) {
      // Serialize the signed transaction with metadata for QR display
      const serialized = serializeSignedTransaction(signedTransaction, {
        source: "manual",
      });
      setSignedTxData(serialized);

      // Animate the success screen
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [signedTransaction]);

  const handleCopyTransaction = async () => {
    if (signedTransaction) {
      try {
        await Clipboard.setStringAsync(signedTransaction);
        Alert.alert("Copied", "Signed transaction copied to clipboard");
      } catch (error) {
        console.error("Error copying transaction:", error);
        Alert.alert("Error", "Failed to copy transaction");
      }
    }
  };

  const handleSignAnother = () => {
    router.push("/(tabs)");
  };

  const handleShowQRAgain = () => {
    // This will just re-render the QR code
    setSignedTxData((serialized) => serialized);
  };

  if (!signedTransaction || !signedTxData) {
    return (
      <SafeThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText type="title" style={styles.errorTitle}>
            No Signed Transaction
          </ThemedText>
          <ThemedText style={styles.errorText}>
            Signed transaction not available. Please try signing again.
          </ThemedText>
          <ThemedButton
            title="Go Back"
            variant="primary"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
      </SafeThemedView>
    );
  }

  return (
    <SafeThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Success Icon */}
          <View
            style={[styles.iconContainer, { backgroundColor: successColor }]}
          >
            <ThemedText style={styles.successIcon}>✓</ThemedText>
          </View>

          {/* Success Message */}
          <ThemedText type="title" style={styles.title}>
            Transaction Signed Successfully!
          </ThemedText>

          <ThemedText style={styles.subtitle}>
            Your transaction has been signed and is ready to be broadcast to the
            network.
          </ThemedText>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <QRDisplay
              data={signedTxData}
              title="Signed Transaction"
              description="Scan this with your hot wallet to broadcast"
              size={280}
            />
          </View>

          {/* Transaction Details */}
          <View
            style={[
              styles.detailsContainer,
              { backgroundColor: overlayColor, borderColor },
            ]}
          >
            <ThemedText type="subtitle" style={styles.detailsTitle}>
              Transaction Details
            </ThemedText>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Status:</ThemedText>
              <ThemedText style={[styles.detailValue, { color: successColor }]}>
                ✓ Signed
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Next Step:</ThemedText>
              <ThemedText style={styles.detailValue}>
                Scan QR with hot wallet
              </ThemedText>
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
              What's Next?
            </ThemedText>

            <View style={styles.instructionItem}>
              <ThemedText style={styles.instructionNumber}>1.</ThemedText>
              <ThemedText style={styles.instructionText}>
                Open your hot wallet app
              </ThemedText>
            </View>

            <View style={styles.instructionItem}>
              <ThemedText style={styles.instructionNumber}>2.</ThemedText>
              <ThemedText style={styles.instructionText}>
                Scan this QR code with your hot wallet
              </ThemedText>
            </View>

            <View style={styles.instructionItem}>
              <ThemedText style={styles.instructionNumber}>3.</ThemedText>
              <ThemedText style={styles.instructionText}>
                Your hot wallet will broadcast the transaction
              </ThemedText>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <ThemedButton
              title="Copy Transaction"
              variant="primary"
              onPress={handleCopyTransaction}
              style={styles.copyButton}
            />

            <ThemedButton
              title="Show QR Again"
              variant="secondary"
              onPress={handleShowQRAgain}
              style={styles.showQRButton}
            />

            <ThemedButton
              title="Sign Another Transaction"
              variant="success"
              onPress={handleSignAnother}
              style={styles.signAnotherButton}
            />
          </View>
        </Animated.View>
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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successIcon: {
    fontSize: 40,
    color: "white",
    fontWeight: "bold",
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
  detailsContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  detailsTitle: {
    marginBottom: 16,
    textAlign: "center",
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
    fontWeight: "600",
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
  buttonContainer: {
    gap: 12,
  },
  copyButton: {
    width: "100%",
  },
  showQRButton: {
    width: "100%",
  },
  signAnotherButton: {
    width: "100%",
  },
  backButton: {
    width: "100%",
    maxWidth: 300,
  },
});
