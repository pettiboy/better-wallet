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
import {
  detectERC20Transfer,
  formatTokenAmount,
  breakdownContractData,
  formatParameter,
} from "@/utils/erc20-detector";
import {
  detectTransactionType,
  calculateLegacyGasCost,
  calculateEIP1559GasCost,
  formatGasPrice,
  getTransactionCategory,
} from "@/utils/transaction-types";
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
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  const toggleField = (field: string) => {
    setExpandedFields((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(field)) {
        newSet.delete(field);
      } else {
        newSet.add(field);
      }
      return newSet;
    });
  };

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
        error.message.includes("Authentication required")
      ) {
        Alert.alert(
          "Authentication Required",
          "You must authenticate to access your wallet and sign this transaction. Please try again."
        );
      } else if (
        error instanceof Error &&
        error.message.includes("Biometric authentication is required")
      ) {
        Alert.alert(
          "Authentication Required",
          "Biometric authentication is required but not available. Please check your device settings."
        );
      } else if (
        error instanceof Error &&
        error.message.includes("invalidated")
      ) {
        Alert.alert(
          "Security Alert",
          "Your biometric data has changed. For security, your wallet has been locked. Please restore from recovery phrase."
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

  // Detect transaction type and get info
  const txTypeInfo = detectTransactionType(transaction);
  const txCategory = getTransactionCategory(transaction);

  // Calculate gas costs based on transaction type
  const isLegacyTx =
    txTypeInfo.type === 0 || transaction.gasPrice !== undefined;
  const isEIP1559Tx =
    txTypeInfo.type === 2 ||
    transaction.maxFeePerGas !== undefined ||
    transaction.maxPriorityFeePerGas !== undefined;

  // Legacy transaction gas fields
  const gasPrice = transaction.gasPrice
    ? formatGasPrice(BigInt(transaction.gasPrice.toString()))
    : undefined;
  const legacyTotalCost = isLegacyTx
    ? calculateLegacyGasCost(
        transaction.gasPrice
          ? BigInt(transaction.gasPrice.toString())
          : undefined,
        transaction.gasLimit
          ? BigInt(transaction.gasLimit.toString())
          : undefined
      )
    : undefined;

  // EIP-1559 transaction gas fields
  const maxFeePerGas = transaction.maxFeePerGas
    ? ethers.formatUnits(transaction.maxFeePerGas, "gwei")
    : "N/A";
  const maxPriorityFeePerGas = transaction.maxPriorityFeePerGas
    ? ethers.formatUnits(transaction.maxPriorityFeePerGas, "gwei")
    : "N/A";
  const eip1559TotalCost = isEIP1559Tx
    ? calculateEIP1559GasCost(
        transaction.maxFeePerGas
          ? BigInt(transaction.maxFeePerGas.toString())
          : undefined,
        transaction.gasLimit
          ? BigInt(transaction.gasLimit.toString())
          : undefined
      )
    : undefined;

  // Determine which total cost to display
  const totalCost = isLegacyTx ? legacyTotalCost : eip1559TotalCost;

  const erc20Transfer = hasData
    ? detectERC20Transfer(transaction.data as string)
    : null;

  // Breakdown contract data for detailed display
  const contractDataBreakdown = hasData
    ? breakdownContractData(transaction.data as string)
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
              <ExpandableDetailRow
                label="URL"
                value={metadata.dappMetadata.url}
                fieldKey="dapp-url"
                isExpanded={expandedFields.has("dapp-url")}
                onToggle={() => toggleField("dapp-url")}
              />
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

          {/* Transaction Type Information */}
          <View
            style={[
              styles.typeContainer,
              {
                backgroundColor: cardColor,
                borderColor,
                borderWidth: BorderWidth.thick,
                ...Shadows.medium,
              },
            ]}
          >
            <ThemedText type="subtitle" style={styles.typeTitle}>
              TRANSACTION TYPE
            </ThemedText>
            <DetailRow label="Type" value={txTypeInfo.name} />
            <View style={styles.descriptionContainer}>
              <ThemedText style={styles.typeDescription}>
                {txTypeInfo.description}
              </ThemedText>
            </View>
          </View>

          {/* Transaction Category with Risk Level */}
          <View
            style={[
              styles.categoryContainer,
              {
                backgroundColor:
                  txCategory.riskLevel === "high"
                    ? warningColor
                    : txCategory.riskLevel === "medium"
                    ? overlayColor
                    : successColor,
                borderColor,
                borderWidth: BorderWidth.thick,
                ...Shadows.medium,
              },
            ]}
          >
            <View style={styles.categoryHeader}>
              <Ionicons
                name={
                  txCategory.riskLevel === "high"
                    ? "warning"
                    : txCategory.riskLevel === "medium"
                    ? "information-circle"
                    : "checkmark-circle"
                }
                size={24}
                color={
                  txCategory.riskLevel === "high" ||
                  txCategory.riskLevel === "low"
                    ? "#000"
                    : borderColor
                }
              />
              <ThemedText
                style={[
                  styles.categoryTitle,
                  (txCategory.riskLevel === "high" ||
                    txCategory.riskLevel === "low") && { color: "#000" },
                ]}
              >
                {txCategory.category.toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.categoryDescription,
                (txCategory.riskLevel === "high" ||
                  txCategory.riskLevel === "low") && { color: "#000" },
              ]}
            >
              {txCategory.description}
            </ThemedText>
          </View>

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
                  <ExpandableDetailRow
                    label="To"
                    value={erc20Transfer.to}
                    fieldKey="erc20-to"
                    isExpanded={expandedFields.has("erc20-to")}
                    onToggle={() => toggleField("erc20-to")}
                  />

                  <DetailRow
                    label="Amount"
                    value={formatTokenAmount(erc20Transfer.amount)}
                  />
                </>
              )}

              {erc20Transfer.type === "approve" && (
                <>
                  <ExpandableDetailRow
                    label="Spender"
                    value={erc20Transfer.spender || ""}
                    fieldKey="erc20-spender"
                    isExpanded={expandedFields.has("erc20-spender")}
                    onToggle={() => toggleField("erc20-spender")}
                  />

                  <DetailRow
                    label="Amount"
                    value={formatTokenAmount(erc20Transfer.amount)}
                  />
                </>
              )}
            </View>
          )}

          {/* Contract Interaction Warning with Details */}
          {hasData && !erc20Transfer && contractDataBreakdown && (
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
                  This transaction calls a smart contract function. Verify all
                  details before signing.
                </ThemedText>

                {/* Contract Function Details */}
                <View style={styles.contractDetailsSection}>
                  <ThemedText style={styles.contractDetailLabel}>
                    Function:
                  </ThemedText>
                  <ThemedText style={styles.contractDetailValue}>
                    {contractDataBreakdown.functionName}
                  </ThemedText>

                  <ThemedText style={styles.contractDetailLabel}>
                    Selector:
                  </ThemedText>
                  <ThemedText style={styles.contractDetailValue}>
                    {contractDataBreakdown.functionSelector}
                  </ThemedText>

                  <ThemedText style={styles.contractDetailLabel}>
                    Data Size:
                  </ThemedText>
                  <ThemedText style={styles.contractDetailValue}>
                    {contractDataBreakdown.dataSize} bytes
                  </ThemedText>

                  <ThemedText style={styles.contractDetailLabel}>
                    Parameters:
                  </ThemedText>
                  <ThemedText style={styles.contractDetailValue}>
                    {contractDataBreakdown.parameterCount} parameter(s)
                  </ThemedText>

                  {/* Show decoded parameters */}
                  {contractDataBreakdown.parameters.length > 0 && (
                    <View style={styles.parametersContainer}>
                      <ThemedText style={styles.parametersTitle}>
                        Decoded Parameters:
                      </ThemedText>
                      {contractDataBreakdown.parameters.map((param, index) => (
                        <View key={index} style={styles.parameterRow}>
                          <ThemedText style={styles.parameterIndex}>
                            [{index}]
                          </ThemedText>
                          <View style={styles.parameterValueContainer}>
                            <ThemedText style={styles.parameterValue}>
                              {formatParameter(param, index)}
                            </ThemedText>
                            <ExpandableDetailRow
                              label="Raw Hex"
                              value={param}
                              fieldKey={`param-${index}`}
                              isExpanded={expandedFields.has(`param-${index}`)}
                              onToggle={() => toggleField(`param-${index}`)}
                            />
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
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

            {transaction.from && (
              <ExpandableDetailRow
                label="From"
                value={transaction.from as string}
                fieldKey="from-address"
                isExpanded={expandedFields.has("from-address")}
                onToggle={() => toggleField("from-address")}
              />
            )}

            <ExpandableDetailRow
              label="To"
              value={transaction.to as string}
              fieldKey="to-address"
              isExpanded={expandedFields.has("to-address")}
              onToggle={() => toggleField("to-address")}
            />

            <DetailRow label="Amount" value={`${amount} ETH`} />

            {transaction.nonce !== undefined && transaction.nonce !== null && (
              <DetailRow label="Nonce" value={transaction.nonce.toString()} />
            )}

            <DetailRow label="Gas Limit" value={gasLimit} />

            <DetailRow
              label="Chain ID"
              value={transaction.chainId?.toString() || "N/A"}
            />

            {hasData && (
              <ExpandableDetailRow
                label="Raw Data"
                value={transaction.data as string}
                fieldKey="tx-data"
                isExpanded={expandedFields.has("tx-data")}
                onToggle={() => toggleField("tx-data")}
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
                {/* Legacy Transaction (Type 0) Gas Display */}
                {isLegacyTx && gasPrice && (
                  <>
                    <DetailRow label="Gas Price" value={`${gasPrice} Gwei`} />
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
                        {legacyTotalCost} ETH
                      </ThemedText>
                    </View>
                  </>
                )}

                {/* EIP-1559 Transaction (Type 2) Gas Display */}
                {isEIP1559Tx && !isLegacyTx && (
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
                        {eip1559TotalCost} ETH
                      </ThemedText>
                    </View>
                  </>
                )}

                {/* Fallback for unknown gas type */}
                {!isLegacyTx && !isEIP1559Tx && (
                  <ThemedText style={styles.noGasInfo}>
                    Gas information not available
                  </ThemedText>
                )}
              </>
            ) : (
              <View style={styles.simpleFeeRow}>
                <ThemedText style={styles.simpleFeeLabel}>
                  Total Fee:
                </ThemedText>
                <ThemedText style={styles.simpleFeeValue}>
                  {totalCost || "N/A"} ETH
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
      <ThemedText style={styles.detailValue}>{value}</ThemedText>
    </View>
  );
}

function ExpandableDetailRow({
  label,
  value,
  fieldKey,
  isExpanded,
  onToggle,
}: {
  label: string;
  value: string;
  fieldKey: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const borderColor = useThemeColor({}, "border");
  const primaryColor = useThemeColor({}, "primary");
  const shouldTruncate = value.length > 20;

  if (!shouldTruncate) {
    return <DetailRow label={label} value={value} />;
  }

  return (
    <View style={styles.expandableRow}>
      <View style={styles.expandableHeader}>
        <ThemedText style={styles.detailLabel}>{label}:</ThemedText>
        <TouchableOpacity
          onPress={onToggle}
          style={[
            styles.expandButton,
            { borderColor, borderWidth: BorderWidth.thin },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={primaryColor}
          />
          <ThemedText
            style={[styles.expandButtonText, { color: primaryColor }]}
          >
            {isExpanded ? "HIDE" : "SHOW"}
          </ThemedText>
        </TouchableOpacity>
      </View>
      <View style={styles.expandableValueContainer}>
        <ThemedText
          style={styles.expandableValue}
          numberOfLines={isExpanded ? undefined : 1}
          ellipsizeMode="middle"
        >
          {value}
        </ThemedText>
        {!isExpanded && (
          <ThemedText style={styles.expandHint}>
            (Tap SHOW to view full {label.toLowerCase()})
          </ThemedText>
        )}
      </View>
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
    marginBottom: Spacing.lg,
    textAlign: "center",
    fontWeight: "800",
    fontSize: 26,
    letterSpacing: 0.5,
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
    letterSpacing: 0.5,
  },
  dappContainer: {
    borderRadius: 0,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  dappTitle: {
    marginBottom: Spacing.md,
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  descriptionContainer: {
    marginTop: Spacing.xs,
  },
  description: {
    fontSize: 15,
    marginTop: 4,
    fontWeight: "600",
    lineHeight: 22,
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
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  warningDescription: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  detailsContainer: {
    borderRadius: 0,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  detailsTitle: {
    marginBottom: Spacing.md,
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  detailLabel: {
    fontWeight: "700",
    fontSize: 15,
    lineHeight: 22,
  },
  detailValue: {
    flex: 1,
    textAlign: "right",
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 22,
  },
  expandableRow: {
    marginBottom: Spacing.md,
  },
  expandableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    borderRadius: 0,
  },
  expandButtonText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  expandableValueContainer: {
    width: "100%",
    marginTop: Spacing.xs,
  },
  expandableValue: {
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 20,
  },
  expandHint: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
    opacity: 0.6,
    fontStyle: "italic",
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
    fontSize: 17,
    letterSpacing: 0.5,
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
    fontSize: 17,
    lineHeight: 24,
  },
  totalCostValue: {
    fontWeight: "800",
    fontSize: 17,
    fontFamily: "monospace",
    lineHeight: 24,
  },
  simpleFeeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  simpleFeeLabel: {
    fontWeight: "700",
    fontSize: 17,
    lineHeight: 24,
  },
  simpleFeeValue: {
    fontWeight: "800",
    fontSize: 17,
    fontFamily: "monospace",
    lineHeight: 24,
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
    marginBottom: Spacing.md,
    textAlign: "center",
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  tokenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tokenLabel: {
    fontWeight: "700",
    fontSize: 15,
    lineHeight: 22,
  },
  tokenValue: {
    flex: 1,
    textAlign: "right",
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 22,
  },
  typeContainer: {
    borderRadius: 0,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  typeTitle: {
    marginBottom: Spacing.md,
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  typeDescription: {
    fontSize: 15,
    marginTop: 4,
    fontWeight: "600",
    lineHeight: 22,
  },
  categoryContainer: {
    borderRadius: 0,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  categoryDescription: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    marginLeft: 32,
  },
  contractDetailsSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.2)",
  },
  contractDetailLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: Spacing.xs,
    color: "#000",
  },
  contractDetailValue: {
    fontSize: 13,
    fontFamily: "monospace",
    fontWeight: "600",
    marginBottom: Spacing.xs,
    color: "#000",
  },
  parametersContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.2)",
  },
  parametersTitle: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: Spacing.sm,
    color: "#000",
  },
  parameterRow: {
    flexDirection: "row",
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  parameterIndex: {
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "700",
    color: "#000",
    minWidth: 30,
  },
  parameterValueContainer: {
    flex: 1,
  },
  parameterValue: {
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
    lineHeight: 18,
  },
  noGasInfo: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: Spacing.md,
    opacity: 0.7,
  },
});
