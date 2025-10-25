import React, { useState, useEffect } from "react";
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
import { useThemeColor } from "@/hooks/use-theme-color";
import { useLocalSearchParams, router } from "expo-router";
import { signTransaction, loadPrivateKey } from "@/services/wallet";
import { authenticateIfRequired } from "@/services/biometric";
import { ethers } from "ethers";
import { SerializedTransaction } from "@/utils/transaction-serializer";
import { detectERC20Transfer, formatTokenAmount } from "@/utils/erc20-detector";

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
  const dangerColor = useThemeColor({}, "danger");
  const successColor = useThemeColor({}, "success");
  const borderColor = useThemeColor({}, "border");

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

      // Authenticate user if biometric authentication is enabled
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

      // Navigate to signing complete screen
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
          <ThemedText type="title" style={styles.loadingTitle}>
            Loading Transaction...
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

  // Calculate total cost
  const totalCost =
    transaction.maxFeePerGas && transaction.gasLimit
      ? ethers.formatEther(transaction.maxFeePerGas * transaction.gasLimit)
      : "N/A";

  // Detect ERC-20 token transfer
  const erc20Transfer = hasData
    ? detectERC20Transfer(transaction.data as string)
    : null;

  return (
    <SafeThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Review Transaction
          </ThemedText>

          {/* Transaction Source */}
          <View
            style={[
              styles.sourceContainer,
              {
                backgroundColor: isWalletConnect ? successColor : overlayColor,
              },
            ]}
          >
            <ThemedText style={styles.sourceLabel}>
              {isWalletConnect ? "📱 dApp Request" : "✏️ Manual Transaction"}
            </ThemedText>
          </View>

          {/* dApp Information (if from WalletConnect) */}
          {isWalletConnect && metadata.dappMetadata && (
            <View
              style={[styles.dappContainer, { backgroundColor: overlayColor }]}
            >
              <ThemedText type="subtitle" style={styles.dappTitle}>
                dApp Information
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

          {/* ERC-20 Token Transfer Detection */}
          {erc20Transfer && (
            <View
              style={[styles.tokenContainer, { backgroundColor: overlayColor }]}
            >
              <ThemedText type="subtitle" style={styles.tokenTitle}>
                Token Transfer Detected
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
                { backgroundColor: warningColor },
              ]}
            >
              <ThemedText style={styles.warningText}>
                ⚠️ Contract Interaction
              </ThemedText>
              <ThemedText style={styles.warningDescription}>
                This transaction includes contract data. Verify the recipient
                and dApp before signing.
              </ThemedText>
            </View>
          )}

          {/* Transaction Details */}
          <View
            style={[styles.detailsContainer, { backgroundColor: overlayColor }]}
          >
            <ThemedText type="subtitle" style={styles.detailsTitle}>
              Transaction Details
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
            style={[styles.feesContainer, { backgroundColor: overlayColor }]}
          >
            <View style={styles.feesHeader}>
              <ThemedText type="subtitle" style={styles.feesTitle}>
                Gas Fees
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowDetailedFees(!showDetailedFees)}
                style={styles.toggleButton}
              >
                <ThemedText style={styles.toggleText}>
                  {showDetailedFees ? "Simple View" : "Detailed View"}
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
                <View style={styles.totalCostRow}>
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

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <ThemedButton
              title={isSigning ? "Signing..." : "Sign Transaction"}
              variant="success"
              onPress={handleSign}
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
        </View>
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
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingTitle: {
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
  },
  sourceContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  sourceLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  dappContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dappTitle: {
    marginBottom: 12,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
  warningContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  warningDescription: {
    fontSize: 14,
    opacity: 0.9,
  },
  detailsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailsTitle: {
    marginBottom: 12,
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
    fontFamily: "monospace",
  },
  feesContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  feesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  feesTitle: {
    marginBottom: 0,
  },
  toggleButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  totalCostRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  totalCostLabel: {
    fontWeight: "bold",
    fontSize: 16,
  },
  totalCostValue: {
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "monospace",
  },
  simpleFeeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  simpleFeeLabel: {
    fontWeight: "600",
    fontSize: 16,
  },
  simpleFeeValue: {
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "monospace",
  },
  buttonContainer: {
    gap: 12,
  },
  signButton: {
    width: "100%",
  },
  cancelButton: {
    width: "100%",
  },
  tokenContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tokenTitle: {
    marginBottom: 12,
    textAlign: "center",
  },
  tokenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  tokenLabel: {
    fontWeight: "600",
    marginRight: 8,
  },
  tokenValue: {
    flex: 1,
    textAlign: "right",
    fontFamily: "monospace",
  },
});
