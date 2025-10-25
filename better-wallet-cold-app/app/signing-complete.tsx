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
import { Ionicons } from "@expo/vector-icons";
import { BorderWidth, Shadows, Spacing } from "@/constants/theme";

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
      const serialized = serializeSignedTransaction(signedTransaction, {
        source: "manual",
      });
      setSignedTxData(serialized);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
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
  }, [signedTransaction, fadeAnim, scaleAnim]);

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

  if (!signedTransaction || !signedTxData) {
    return (
      <SafeThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText type="title" style={styles.errorTitle}>
            NO SIGNED TRANSACTION
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
    <SafeThemedView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            style={[
              styles.iconContainer,
              {
                backgroundColor: successColor,
                borderColor,
                borderWidth: BorderWidth.thick,
                ...Shadows.large,
              },
            ]}
          >
            <Ionicons name="checkmark" size={64} color="#fff" />
          </View>

          {/* Success Message */}
          <ThemedText type="title" style={styles.title}>
            TRANSACTION SIGNED!
          </ThemedText>

          <ThemedText style={styles.subtitle}>
            Your transaction has been signed and is ready to be broadcast to the
            network.
          </ThemedText>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <QRDisplay data={signedTxData} title="" description="" size={280} />
          </View>

          {/* Transaction Details */}
          <View
            style={[
              styles.detailsContainer,
              {
                backgroundColor: overlayColor,
                borderColor,
                borderWidth: BorderWidth.thick,
                ...Shadows.small,
              },
            ]}
          >
            <ThemedText type="subtitle" style={styles.detailsTitle}>
              TRANSACTION STATUS
            </ThemedText>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Status:</ThemedText>
              <View style={styles.statusBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={successColor}
                />
                <ThemedText
                  style={[styles.detailValue, { color: successColor }]}
                >
                  SIGNED
                </ThemedText>
              </View>
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
              {
                backgroundColor: overlayColor,
                borderColor,
                borderWidth: BorderWidth.thick,
                ...Shadows.small,
              },
            ]}
          >
            <ThemedText type="subtitle" style={styles.instructionsTitle}>
              WHAT'S NEXT?
            </ThemedText>

            <View style={styles.instructionItem}>
              <ThemedText style={styles.instructionNumber}>1</ThemedText>
              <ThemedText style={styles.instructionText}>
                Open your hot wallet app
              </ThemedText>
            </View>

            <View style={styles.instructionItem}>
              <ThemedText style={styles.instructionNumber}>2</ThemedText>
              <ThemedText style={styles.instructionText}>
                Scan this QR code with your hot wallet
              </ThemedText>
            </View>

            <View style={styles.instructionItem}>
              <ThemedText style={styles.instructionNumber}>3</ThemedText>
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
              style={styles.button}
            />

            <ThemedButton
              title="Sign Another Transaction"
              variant="success"
              onPress={handleSignAnother}
              style={styles.button}
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
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  content: {
    flex: 1,
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  errorTitle: {
    marginBottom: Spacing.md,
    textAlign: "center",
    fontWeight: "800",
  },
  errorText: {
    textAlign: "center",
    marginBottom: Spacing.lg,
    fontSize: 15,
    fontWeight: "600",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 0,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
    fontWeight: "800",
    fontSize: 28,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 22,
    fontSize: 15,
    fontWeight: "600",
    paddingHorizontal: Spacing.md,
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
    width: "100%",
  },
  detailsContainer: {
    padding: Spacing.lg,
    borderRadius: 0,
    marginBottom: Spacing.md,
    width: "100%",
  },
  detailsTitle: {
    marginBottom: Spacing.md,
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  detailLabel: {
    fontWeight: "700",
    fontSize: 14,
  },
  detailValue: {
    fontWeight: "700",
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  instructionsContainer: {
    padding: Spacing.lg,
    borderRadius: 0,
    marginBottom: Spacing.lg,
    width: "100%",
  },
  instructionsTitle: {
    marginBottom: Spacing.md,
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  instructionNumber: {
    width: 24,
    fontWeight: "800",
    fontSize: 16,
  },
  instructionText: {
    flex: 1,
    lineHeight: 20,
    fontSize: 14,
    fontWeight: "600",
  },
  buttonContainer: {
    gap: Spacing.sm,
    width: "100%",
  },
  button: {
    width: "100%",
  },
  backButton: {
    width: "100%",
    maxWidth: 300,
  },
});
