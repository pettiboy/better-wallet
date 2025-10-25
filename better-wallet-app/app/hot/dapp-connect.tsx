import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedButton } from "@/components/themed-button";
import { QRDisplay } from "@/components/QRDisplay";
import { QRScanner } from "@/components/QRScanner";
import { useWalletConnect } from "@/contexts/WalletConnectContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  serializeTransaction,
  deserializeSignedTransaction,
} from "@/utils/transaction-serializer";
import {
  parseTransactionRequest,
  getSessionByTopic,
} from "@/services/walletconnect";
import { broadcastTransaction } from "@/services/ethereum";
import { ethers } from "ethers";

type Step =
  | "connect"
  | "sessions"
  | "scan-uri"
  | "show-unsigned"
  | "scan-signed"
  | "broadcasting";

export default function DappConnectScreen() {
  const {
    initialized,
    sessions,
    pendingProposal,
    pendingRequest,
    pair,
    approveSession,
    rejectSession,
    respondTransaction,
    rejectTransaction,
    disconnectSession,
    clearPendingRequest,
  } = useWalletConnect();

  const [step, setStep] = useState<Step>("connect");
  const [wcUri, setWcUri] = useState("");
  const [currentRequest, setCurrentRequest] = useState<any>(null);
  const [unsignedTxData, setUnsignedTxData] = useState<string | null>(null);

  const borderColor = useThemeColor({}, "border");
  const overlayColor = useThemeColor({}, "overlay");
  const infoColor = useThemeColor({}, "info");
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const primaryColor = useThemeColor({}, "primary");
  const dangerColor = useThemeColor({}, "danger");

  // Handle pending proposal
  useEffect(() => {
    if (pendingProposal) {
      Alert.alert(
        "Connection Request",
        `${pendingProposal.params.proposer.metadata.name} wants to connect to your wallet.`,
        [
          {
            text: "Reject",
            style: "cancel",
            onPress: () => handleRejectSession(),
          },
          {
            text: "Approve",
            onPress: () => handleApproveSession(),
          },
        ]
      );
    }
  }, [pendingProposal]);

  // Handle pending transaction request
  useEffect(() => {
    if (pendingRequest) {
      try {
        const parsed = parseTransactionRequest(pendingRequest);
        setCurrentRequest(parsed);
        setStep("show-unsigned");
      } catch (error) {
        console.error("Failed to parse request:", error);
        Alert.alert("Error", "Unsupported transaction request");
      }
    }
  }, [pendingRequest]);

  const handlePairWithUri = async () => {
    if (!wcUri.trim()) {
      Alert.alert("Error", "Please enter a WalletConnect URI");
      return;
    }

    try {
      await pair(wcUri);
      setWcUri("");
      Alert.alert("Success", "Pairing initiated. Waiting for approval...");
      setStep("sessions");
    } catch (error) {
      console.error("Pairing error:", error);
      Alert.alert("Error", "Failed to pair with dApp");
    }
  };

  const handleApproveSession = async () => {
    if (!pendingProposal) return;

    try {
      await approveSession(pendingProposal);
      setStep("sessions");
    } catch (error) {
      console.error("Approve session error:", error);
      Alert.alert("Error", "Failed to approve session");
    }
  };

  const handleRejectSession = async () => {
    if (!pendingProposal) return;

    try {
      await rejectSession(pendingProposal);
    } catch (error) {
      console.error("Reject session error:", error);
    }
  };

  const handleDisconnect = async (topic: string) => {
    try {
      await disconnectSession(topic);
    } catch (error) {
      console.error("Disconnect error:", error);
      Alert.alert("Error", "Failed to disconnect session");
    }
  };

  const handleRejectTransaction = async () => {
    try {
      await rejectTransaction("User rejected transaction");
      setCurrentRequest(null);
      setUnsignedTxData(null);
      setStep("sessions");
    } catch (error) {
      console.error("Reject transaction error:", error);
      Alert.alert("Error", "Failed to reject transaction");
    }
  };

  const handleScanSigned = async (data: string) => {
    setStep("broadcasting");

    try {
      // Deserialize signed transaction with metadata
      const { signedTransaction, metadata } =
        deserializeSignedTransaction(data);

      // Broadcast to network
      const hash = await broadcastTransaction(signedTransaction);

      // Respond to dApp via WalletConnect
      await respondTransaction(signedTransaction);

      Alert.alert(
        "Success",
        `Transaction sent to dApp!\nHash: ${hash.substring(0, 10)}...`
      );

      // Reset state
      setCurrentRequest(null);
      setUnsignedTxData(null);
      clearPendingRequest();
      setStep("sessions");
    } catch (error) {
      console.error("Broadcast error:", error);
      Alert.alert("Error", "Failed to broadcast transaction");
      setStep("show-unsigned");
    }
  };

  if (!initialized) {
    return (
      <SafeThemedView>
        <ScrollView contentContainerStyle={styles.centerContainer}>
          <ThemedText type="title" style={styles.title}>
            Initializing WalletConnect...
          </ThemedText>
        </ScrollView>
      </SafeThemedView>
    );
  }

  // Show unsigned transaction from dApp
  if (step === "show-unsigned" && currentRequest && pendingRequest) {
    const session = getSessionByTopic(pendingRequest.topic);
    const dappMetadata = session?.peer.metadata;

    // Serialize transaction with WalletConnect metadata
    const serializedTx = serializeTransaction(currentRequest.transaction, {
      source: "walletconnect",
      dappMetadata: dappMetadata
        ? {
            name: dappMetadata.name,
            url: dappMetadata.url,
            icon: dappMetadata.icons?.[0],
            description: dappMetadata.description,
          }
        : undefined,
      requestId: pendingRequest.id,
      topic: pendingRequest.topic,
    });

    if (!unsignedTxData) {
      setUnsignedTxData(serializedTx);
    }

    return (
      <SafeThemedView>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>
              dApp Transaction Request
            </ThemedText>

            {dappMetadata && (
              <View style={[styles.dappInfo, { backgroundColor: infoColor }]}>
                <ThemedText style={styles.dappName}>
                  {dappMetadata.name}
                </ThemedText>
                <ThemedText style={styles.dappUrl}>
                  {dappMetadata.url}
                </ThemedText>
              </View>
            )}

            <ThemedText style={styles.instructions}>
              Show this QR code to your cold wallet for signing
            </ThemedText>

            <QRDisplay
              data={serializedTx}
              title="Transaction from dApp"
              size={280}
            />

            <View
              style={[
                styles.transactionDetails,
                { backgroundColor: overlayColor },
              ]}
            >
              <DetailRow
                label="To"
                value={currentRequest.transaction.to || ""}
              />
              <DetailRow
                label="Amount"
                value={`${ethers.formatEther(
                  currentRequest.transaction.value || 0
                )} ETH`}
              />
              <DetailRow label="Chain" value={currentRequest.chainId} />
            </View>

            <ThemedButton
              title="Scan Signed Transaction"
              variant="primary"
              onPress={() => setStep("scan-signed")}
            />

            <ThemedButton
              title="Reject Transaction"
              variant="danger"
              onPress={handleRejectTransaction}
              style={styles.marginTop}
            />
          </ThemedView>
        </ScrollView>
      </SafeThemedView>
    );
  }

  // Scan signed transaction
  if (step === "scan-signed") {
    return (
      <QRScanner
        title="Scan Signed Transaction"
        onScan={handleScanSigned}
        onClose={() => setStep("show-unsigned")}
      />
    );
  }

  // Broadcasting
  if (step === "broadcasting") {
    return (
      <SafeThemedView>
        <ScrollView contentContainerStyle={styles.centerContainer}>
          <ThemedText type="title" style={styles.title}>
            Broadcasting...
          </ThemedText>
          <ThemedText style={styles.message}>
            Sending transaction to dApp
          </ThemedText>
        </ScrollView>
      </SafeThemedView>
    );
  }

  // Scan WalletConnect URI
  if (step === "scan-uri") {
    return (
      <QRScanner
        title="Scan WalletConnect QR"
        onScan={(data) => {
          setWcUri(data);
          setStep("connect");
        }}
        onClose={() => setStep("connect")}
      />
    );
  }

  // Sessions list
  if (step === "sessions" && sessions.length > 0) {
    return (
      <SafeThemedView>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>
              Connected dApps
            </ThemedText>

            {sessions.map((session) => (
              <View
                key={session.topic}
                style={[styles.sessionCard, { backgroundColor: overlayColor }]}
              >
                <View style={styles.sessionInfo}>
                  <ThemedText style={styles.sessionName}>
                    {session.peer.metadata.name}
                  </ThemedText>
                  <ThemedText style={styles.sessionUrl}>
                    {session.peer.metadata.url}
                  </ThemedText>
                </View>
                <ThemedButton
                  title="Disconnect"
                  variant="danger"
                  onPress={() => handleDisconnect(session.topic)}
                  style={styles.disconnectButton}
                />
              </View>
            ))}

            <ThemedButton
              title="Connect New dApp"
              variant="primary"
              onPress={() => setStep("connect")}
              style={styles.marginTop}
            />
          </ThemedView>
        </ScrollView>
      </SafeThemedView>
    );
  }

  // Connect screen (default)
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
              Connect to dApp
            </ThemedText>

            {sessions.length > 0 && (
              <ThemedButton
                title={`View Connected dApps (${sessions.length})`}
                variant="secondary"
                onPress={() => setStep("sessions")}
                style={styles.marginBottom}
              />
            )}

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>
                WalletConnect URI
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { borderColor, color: textColor, backgroundColor },
                ]}
                value={wcUri}
                onChangeText={setWcUri}
                placeholder="wc:..."
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
                multiline
              />
            </View>

            <ThemedButton
              title="Connect"
              variant="primary"
              onPress={handlePairWithUri}
            />

            <ThemedButton
              title="Scan QR Code"
              variant="secondary"
              onPress={() => setStep("scan-uri")}
              style={styles.marginTop}
            />

            <View style={[styles.infoBox, { backgroundColor: infoColor }]}>
              <ThemedText style={styles.infoText}>
                💡 Scan a WalletConnect QR code from a dApp (like Uniswap,
                OpenSea) or paste the connection URI to connect.
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
    fontSize: 14,
    minHeight: 60,
  },
  dappInfo: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  dappName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  dappUrl: {
    fontSize: 14,
    opacity: 0.7,
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
  sessionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  sessionUrl: {
    fontSize: 12,
    opacity: 0.7,
  },
  disconnectButton: {
    minWidth: 100,
  },
  message: {
    textAlign: "center",
    marginTop: 32,
  },
  infoBox: {
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  marginTop: {
    marginTop: 12,
  },
  marginBottom: {
    marginBottom: 12,
  },
});
