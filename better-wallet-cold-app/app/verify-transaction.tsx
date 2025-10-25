import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useLocalSearchParams, router } from "expo-router";
import { signTransaction, loadPrivateKey } from "@/services/wallet";
import { authenticateIfRequired } from "@/services/biometric";
import { ethers } from "ethers";
import { SerializedTransaction } from "@/utils/transaction-serializer";
import { detectERC20Transfer, formatTokenAmount } from "@/utils/erc20-detector";
import { Ionicons } from "@expo/vector-icons";
import { BorderWidth, Shadows, Spacing } from "@/constants/theme";

export default function VerifyTransactionScreen() {
  const { transactionData } = useLocalSearchParams<{
    transactionData: string;
  }>();
  const [parsedTransaction, setParsedTransaction] =
    useState<SerializedTransaction | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [showDetailedFees, setShowDetailedFees] = useState(true);

  const overlayColor = useThemeColor({}, "overlay");
  const warningColor = useThemeColor({}, "warning");
  const successColor = useThemeColor({}, "success");
  const borderColor = useThemeColor({}, "border");
  const cardColor = useThemeColor({}, "card");
  const backgroundColor = useThemeColor({}, "background");

  useEffect(() => {
    if (transactionData) {
      try {
        const parsed = JSON.parse(transactionData);
        setParsedTransaction(parsed);
      } catch (error) {
        console.error("Error parsing transaction data:", error);
        Alert.alert("Error", "Invalid transaction data");
        router.back();
      }
    }
  }, [transactionData]);

  const handleSign = async () => {
    if (!parsedTransaction) return;

    try {
      setIsSigning(true);

      const isAuthenticated = await authenticateIfRequired(
        "Authenticate to sign this transaction"
      );

      if (!isAuthenticated) {
        Alert.alert(
          "Authentication Failed",
          "Authentication is required to sign transactions. Please try again."
        );
        return;
      }

      const privateKey = await loadPrivateKey();
      if (!privateKey) {
        Alert.alert(
          "Error",
          "No private key found. Please set up wallet first."
        );
        return;
      }

      const signedTx = await signTransaction(
        parsedTransaction.transaction,
        privateKey
      );

      router.push({
        pathname: "/signing-complete",
        params: { signedTransaction: signedTx },
      });
    } catch (error) {
      console.error("Error signing transaction:", error);

      if (
        error instanceof Error &&
        error.message.includes("Biometric authentication is required")
      ) {
        Alert.alert(
          "Authentication Required",
          "Biometric authentication is required but not available. Please check your device settings."
        );
      } else {
        Alert.alert("Error", "Failed to sign transaction");
      }
    } finally {
      setIsSigning(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!parsedTransaction) {
    return (
      <SafeThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={borderColor} />
          <ThemedText type="title" style={styles.loadingTitle}>
            LOADING TRANSACTION...
          </ThemedText>
        </View>
      </SafeThemedView>
    );
  }

  const { transaction, metadata } = parsedTransaction;
  const isWalletConnect = metadata.source === "walletconnect";
  const hasData = transaction.data && transaction.data !== "0x";
  const amount = transaction.value
    ? ethers.formatEther(transaction.value)
    : "0";
  const gasLimit = transaction.gasLimit?.toString() || "N/A";
  const maxFeePerGas = transaction.maxFeePerGas
    ? ethers.formatUnits(transaction.maxFeePerGas, "gwei")
    : "N/A";
  const maxPriorityFeePerGas = transaction.maxPriorityFeePerGas
    ? ethers.formatUnits(transaction.maxPriorityFeePerGas, "gwei")
    : "N/A";

  const totalCost =
    transaction.maxFeePerGas && transaction.gasLimit
      ? ethers.formatEther(
          BigInt(transaction.maxFeePerGas.toString()) *
            BigInt(transaction.gasLimit.toString())
        )
      : "N/A";

  const erc20Transfer = hasData
    ? detectERC20Transfer(transaction.data as string)
    : null;

  return (
    <SafeThemedView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            REVIEW TRANSACTION
          </ThemedText>

          {/* Transaction Source */}
          <View
            style={[
              styles.sourceContainer,
              {
                backgroundColor: isWalletConnect ? successColor : overlayColor,
                borderColor,
                borderWidth: BorderWidth.thick,
                ...Shadows.small,
              },
            ]}
          >
            <Ionicons
              name={isWalletConnect ? "phone-portrait" : "create"}
              size={24}
              color={isWalletConnect ? "#fff" : "#000"}
            />
            <ThemedText
              style={[styles.sourceLabel, isWalletConnect && { color: "#fff" }]}
            >
              {isWalletConnect ? "dApp Request" : "Manual Transaction"}
            </ThemedText>
          </View>

          {/* dApp Information */}
          {isWalletConnect && metadata.dappMetadata && (
            <View
              style={[
                styles.dappContainer,
                {
                  backgroundColor: cardColor,
                  borderColor,
                  borderWidth: BorderWidth.thick,
                  ...Shadows.medium,
                },
              ]}
            >
              <ThemedText type="subtitle" style={styles.dappTitle}>
                DAPP INFORMATION
              </ThemedText>
              <DetailRow label="Name" value={metadata.dappMetadata.name} />
              <DetailRow label="URL" value={metadata.dappMetadata.url} />
              {metadata.dappMetadata.description && (
                <View style={styles.descriptionContainer}>
                  <ThemedText style={styles.detailLabel}>
                    Description:
                  </ThemedText>
                  <ThemedText style={styles.description}>
                    {metadata.dappMetadata.description}
                  </ThemedText>
                </View>
              )}
            </View>
          )}

          {/* ERC-20 Token Transfer */}
          {erc20Transfer && (
            <View
              style={[
                styles.tokenContainer,
                {
                  backgroundColor: cardColor,
                  borderColor,
                  borderWidth: BorderWidth.thick,
                  ...Shadows.medium,
                },
              ]}
            >
              <ThemedText type="subtitle" style={styles.tokenTitle}>
                TOKEN TRANSFER DETECTED
              </ThemedText>

              <View style={styles.tokenRow}>
                <ThemedText style={styles.tokenLabel}>Type:</ThemedText>
                <ThemedText style={styles.tokenValue}>
                  {erc20Transfer.type === "transfer"
                    ? "Token Transfer"
                    : erc20Transfer.type === "approve"
                    ? "Token Approval"
                    : "Unknown"}
                </ThemedText>
              </View>

              {erc20Transfer.type === "transfer" && (
                <>
                  <View style={styles.tokenRow}>
                    <ThemedText style={styles.tokenLabel}>To:</ThemedText>
                    <ThemedText
                      style={styles.tokenValue}
                      numberOfLines={1}
                      ellipsizeMode="middle"
                    >
                      {erc20Transfer.to}
                    </ThemedText>
                  </View>

                  <View style={styles.tokenRow}>
                    <ThemedText style={styles.tokenLabel}>Amount:</ThemedText>
                    <ThemedText style={styles.tokenValue}>
                      {formatTokenAmount(erc20Transfer.amount)}
                    </ThemedText>
                  </View>
                </>
              )}

              {erc20Transfer.type === "approve" && (
                <>
                  <View style={styles.tokenRow}>
                    <ThemedText style={styles.tokenLabel}>Spender:</ThemedText>
                    <ThemedText
                      style={styles.tokenValue}
                      numberOfLines={1}
                      ellipsizeMode="middle"
                    >
                      {erc20Transfer.spender}
                    </ThemedText>
                  </View>

                  <View style={styles.tokenRow}>
                    <ThemedText style={styles.tokenLabel}>Amount:</ThemedText>
                    <ThemedText style={styles.tokenValue}>
                      {formatTokenAmount(erc20Transfer.amount)}
                    </ThemedText>
                  </View>
                </>
              )}
            </View>
          )}

          {/* Contract Interaction Warning */}
          {hasData && !erc20Transfer && (
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
                <ThemedText style={styles.warningText}>
                  CONTRACT INTERACTION
                </ThemedText>
                <ThemedText style={styles.warningDescription}>
                  This transaction includes contract data. Verify the recipient
                  and dApp before signing.
                </ThemedText>
              </View>
            </View>
          )}

          {/* Transaction Details */}
          <View
            style={[
              styles.detailsContainer,
              {
                backgroundColor: overlayColor,
                borderColor,
                borderWidth: BorderWidth.thick,
                ...Shadows.medium,
              },
            ]}
          >
            <ThemedText type="subtitle" style={styles.detailsTitle}>
              TRANSACTION DETAILS
            </ThemedText>

            <DetailRow label="To" value={transaction.to as string} />
            <DetailRow label="Amount" value={`${amount} ETH`} />
            <DetailRow label="Gas Limit" value={gasLimit} />
            <DetailRow
              label="Chain ID"
              value={transaction.chainId?.toString() || "N/A"}
            />

            {hasData && (
              <DetailRow
                label="Data"
                value={`${(transaction.data as string).substring(0, 20)}...`}
              />
            )}
          </View>

          {/* Gas Fee Details */}
          <View
            style={[
              styles.feesContainer,
              {
                backgroundColor: overlayColor,
                borderColor,
                borderWidth: BorderWidth.thick,
                ...Shadows.medium,
              },
            ]}
          >
            <View style={styles.feesHeader}>
              <ThemedText type="subtitle" style={styles.feesTitle}>
                GAS FEES
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowDetailedFees(!showDetailedFees)}
                style={[
                  styles.toggleButton,
                  {
                    borderColor,
                    borderWidth: BorderWidth.thin,
                  },
                ]}
              >
                <ThemedText style={styles.toggleText}>
                  {showDetailedFees ? "SIMPLE" : "DETAILED"}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {showDetailedFees ? (
              <>
                <DetailRow
                  label="Max Fee per Gas"
                  value={`${maxFeePerGas} Gwei`}
                />
                <DetailRow
                  label="Max Priority Fee"
                  value={`${maxPriorityFeePerGas} Gwei`}
                />
                <DetailRow label="Gas Limit" value={gasLimit} />
                <View
                  style={[
                    styles.totalCostRow,
                    {
                      borderTopColor: borderColor,
                      borderTopWidth: BorderWidth.thin,
                    },
                  ]}
                >
                  <ThemedText style={styles.totalCostLabel}>
                    Total Cost:
                  </ThemedText>
                  <ThemedText style={styles.totalCostValue}>
                    {totalCost} ETH
                  </ThemedText>
                </View>
              </>
            ) : (
              <View style={styles.simpleFeeRow}>
                <ThemedText style={styles.simpleFeeLabel}>
                  Total Fee:
                </ThemedText>
                <ThemedText style={styles.simpleFeeValue}>
                  {totalCost} ETH
                </ThemedText>
              </View>
            )}
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
          title="Sign Transaction"
          variant="success"
          onPress={handleSign}
          loading={isSigning}
          disabled={isSigning}
          style={styles.signButton}
        />

        <ThemedButton
          title="Cancel"
          variant="danger"
          onPress={handleCancel}
          style={styles.cancelButton}
        />
      </View>
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
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  loadingTitle: {
    textAlign: "center",
    fontWeight: "800",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: Spacing.md,
    textAlign: "center",
    fontWeight: "800",
    fontSize: 24,
  },
  sourceContainer: {
    borderRadius: 0,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  sourceLabel: {
    fontSize: 16,
    fontWeight: "800",
  },
  dappContainer: {
    borderRadius: 0,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  dappTitle: {
    marginBottom: Spacing.sm,
    fontWeight: "800",
    fontSize: 16,
  },
  descriptionContainer: {
    marginTop: Spacing.xs,
  },
  description: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: "600",
  },
  warningContainer: {
    borderRadius: 0,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningText: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  warningDescription: {
    fontSize: 14,
    fontWeight: "600",
  },
  detailsContainer: {
    borderRadius: 0,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  detailsTitle: {
    marginBottom: Spacing.sm,
    fontWeight: "800",
    fontSize: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  detailLabel: {
    fontWeight: "700",
    fontSize: 14,
  },
  detailValue: {
    flex: 1,
    textAlign: "right",
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: "700",
  },
  feesContainer: {
    borderRadius: 0,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  feesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  feesTitle: {
    marginBottom: 0,
    fontWeight: "800",
    fontSize: 16,
  },
  toggleButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 0,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: "800",
  },
  totalCostRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  totalCostLabel: {
    fontWeight: "800",
    fontSize: 16,
  },
  totalCostValue: {
    fontWeight: "800",
    fontSize: 16,
    fontFamily: "monospace",
  },
  simpleFeeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  simpleFeeLabel: {
    fontWeight: "700",
    fontSize: 16,
  },
  simpleFeeValue: {
    fontWeight: "800",
    fontSize: 16,
    fontFamily: "monospace",
  },
  buttonContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  signButton: {
    width: "100%",
  },
  cancelButton: {
    width: "100%",
  },
  tokenContainer: {
    borderRadius: 0,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  tokenTitle: {
    marginBottom: Spacing.sm,
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
  },
  tokenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  tokenLabel: {
    fontWeight: "700",
    fontSize: 14,
  },
  tokenValue: {
    flex: 1,
    textAlign: "right",
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: "700",
  },
});
