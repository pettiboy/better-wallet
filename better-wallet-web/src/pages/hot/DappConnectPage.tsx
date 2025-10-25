import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "../../components/Button";
import { QRDisplay } from "../../components/QRDisplay";
import { QRScanner } from "../../components/QRScanner";
import { useWalletConnect } from "../../contexts/WalletConnectContext";
import {
  serializeTransaction,
  deserializeSignedTransaction,
} from "../../utils/transaction-serializer";
import {
  parseTransactionRequest,
  getSessionByTopic,
  updateTransactionNonce,
} from "../../services/walletconnect";
import { broadcastTransaction, getProvider } from "../../services/ethereum";

type Step =
  | "connect"
  | "sessions"
  | "scan-uri"
  | "show-unsigned"
  | "scan-signed"
  | "broadcasting";

export function DappConnectPage() {
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

  // Handle pending proposal
  useEffect(() => {
    if (pendingProposal) {
      const confirmed = window.confirm(
        `${pendingProposal.params.proposer.metadata.name} wants to connect to your wallet. Do you want to approve this connection?`
      );

      if (confirmed) {
        handleApproveSession();
      } else {
        handleRejectSession();
      }
    }
  }, [pendingProposal]);

  // Handle pending transaction request
  useEffect(() => {
    if (pendingRequest) {
      handleTransactionRequest(pendingRequest);
    }
  }, [pendingRequest]);

  const handleTransactionRequest = async (request: any) => {
    try {
      const parsed = parseTransactionRequest(request);

      // Update nonce to prevent stale nonce errors
      const provider = getProvider();
      const updatedTransaction = await updateTransactionNonce(
        parsed.transaction,
        provider
      );

      const updatedRequest = {
        ...parsed,
        transaction: updatedTransaction,
      };

      setCurrentRequest(updatedRequest);
      setStep("show-unsigned");
    } catch (error) {
      console.error("Failed to parse request:", error);
      alert("Unsupported transaction request");
    }
  };

  const handlePairWithUri = async () => {
    if (!wcUri.trim()) {
      alert("Please enter a WalletConnect URI");
      return;
    }

    try {
      await pair(wcUri);
      setWcUri("");
      alert("Pairing initiated. Waiting for approval...");
      setStep("sessions");
    } catch (error) {
      console.error("Pairing error:", error);
      alert("Failed to pair with dApp");
    }
  };

  const handleApproveSession = async () => {
    if (!pendingProposal) return;

    try {
      await approveSession(pendingProposal);
      setStep("sessions");
    } catch (error) {
      console.error("Approve session error:", error);
      alert("Failed to approve session");
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
      alert("Failed to disconnect session");
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
      alert("Failed to reject transaction");
    }
  };

  const handleScanSigned = async (data: string) => {
    setStep("broadcasting");

    try {
      // Deserialize signed transaction with metadata
      const { signedTransaction } = deserializeSignedTransaction(data);

      // Broadcast to network FIRST to get the transaction hash
      const hash = await broadcastTransaction(signedTransaction);
      console.log("Transaction broadcasted with hash:", hash);

      // Respond to dApp with the transaction HASH (not the raw tx)
      // This is what eth_sendTransaction expects as a return value
      await respondTransaction(hash);

      alert(`Transaction sent to dApp!\nHash: ${hash.substring(0, 10)}...`);

      // Reset state
      setCurrentRequest(null);
      setUnsignedTxData(null);
      clearPendingRequest();
      setStep("sessions");
    } catch (error) {
      console.error("Broadcast error:", error);
      alert("Failed to broadcast transaction");
      setStep("show-unsigned");
    }
  };

  if (!initialized) {
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: "var(--color-bg-main)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          paddingBottom: "6rem",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--color-white)",
            border: "4px solid var(--color-black)",
            boxShadow: "8px 8px 0 var(--color-black)",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 900,
              marginBottom: "1rem",
            }}
          >
            Initializing WalletConnect...
          </h1>
          <div className="spinner" style={{ margin: "0 auto" }}></div>
        </div>
      </div>
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
      <div
        style={{
          flex: 1,
          backgroundColor: "var(--color-bg-main)",
          overflowY: "auto",
          padding: "1.5rem",
          paddingBottom: "6rem",
        }}
      >
        <div style={{ maxWidth: "400px", margin: "0 auto" }}>
          <div
            style={{
              backgroundColor: "var(--color-white)",
              border: "4px solid var(--color-black)",
              boxShadow: "8px 8px 0 var(--color-black)",
              padding: "2rem",
            }}
          >
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 900,
                textAlign: "center",
                marginBottom: "1rem",
              }}
            >
              dApp Transaction Request
            </h1>

            {dappMetadata && (
              <div
                style={{
                  backgroundColor: "var(--color-info)",
                  border: "3px solid var(--color-black)",
                  padding: "1rem",
                  marginBottom: "1.5rem",
                  color: "var(--color-white)",
                }}
              >
                <h3 style={{ fontWeight: 900, marginBottom: "0.25rem" }}>
                  {dappMetadata.name}
                </h3>
                <p style={{ fontSize: "0.875rem", fontWeight: 700 }}>
                  {dappMetadata.url}
                </p>
              </div>
            )}

            <p
              style={{
                textAlign: "center",
                color: "var(--color-gray-800)",
                marginBottom: "1.5rem",
                fontWeight: 500,
              }}
            >
              Show this QR code to your cold wallet for signing
            </p>

            <QRDisplay
              data={serializedTx}
              title="Transaction from dApp"
              size={250}
            />

            <div
              style={{
                backgroundColor: "var(--color-gray-100)",
                border: "3px solid var(--color-black)",
                padding: "1rem",
                marginBottom: "1.5rem",
              }}
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
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <Button
                title="Scan Signed Transaction"
                variant="primary"
                onClick={() => setStep("scan-signed")}
                fullWidth
              />

              <Button
                title="Reject Transaction"
                variant="danger"
                onClick={handleRejectTransaction}
                fullWidth
              />
            </div>
          </div>
        </div>
      </div>
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
      <div
        style={{
          flex: 1,
          backgroundColor: "var(--color-bg-main)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          paddingBottom: "6rem",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--color-white)",
            border: "4px solid var(--color-black)",
            boxShadow: "8px 8px 0 var(--color-black)",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 900,
              marginBottom: "1rem",
            }}
          >
            Broadcasting...
          </h1>
          <p
            style={{
              color: "var(--color-gray-800)",
              marginBottom: "1.5rem",
              fontWeight: 500,
            }}
          >
            Sending transaction to dApp
          </p>
          <div className="spinner" style={{ margin: "0 auto" }}></div>
        </div>
      </div>
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
      <div
        style={{
          flex: 1,
          backgroundColor: "var(--color-bg-main)",
          overflowY: "auto",
          padding: "1.5rem",
          paddingBottom: "6rem",
        }}
      >
        <div style={{ maxWidth: "400px", margin: "0 auto" }}>
          <div
            style={{
              backgroundColor: "var(--color-white)",
              border: "4px solid var(--color-black)",
              boxShadow: "8px 8px 0 var(--color-black)",
              padding: "2rem",
            }}
          >
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 900,
                textAlign: "center",
                marginBottom: "1.5rem",
              }}
            >
              🔌 Connected dApps
            </h1>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              {sessions.map((session) => (
                <div
                  key={session.topic}
                  style={{
                    backgroundColor: "var(--color-gray-100)",
                    border: "3px solid var(--color-black)",
                    padding: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 900, marginBottom: "0.25rem" }}>
                      {session.peer.metadata.name}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--color-gray-800)",
                        fontWeight: 500,
                      }}
                    >
                      {session.peer.metadata.url}
                    </p>
                  </div>
                  <Button
                    title="✕"
                    variant="danger"
                    onClick={() => handleDisconnect(session.topic)}
                  />
                </div>
              ))}
            </div>

            <Button
              title="Connect New dApp"
              icon="+"
              variant="primary"
              onClick={() => setStep("connect")}
              fullWidth
            />
          </div>
        </div>
      </div>
    );
  }

  // Connect screen (default)
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "var(--color-bg-main)",
        overflowY: "auto",
        padding: "1.5rem",
        paddingBottom: "6rem",
      }}
    >
      <div style={{ maxWidth: "400px", margin: "0 auto" }}>
        <div
          style={{
            backgroundColor: "var(--color-white)",
            border: "4px solid var(--color-black)",
            boxShadow: "8px 8px 0 var(--color-black)",
            padding: "2rem",
          }}
        >
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 900,
              textAlign: "center",
              marginBottom: "1.5rem",
            }}
          >
            🔌 Connect to dApp
          </h1>

          {sessions.length > 0 && (
            <Button
              title={`View Connected dApps (${sessions.length})`}
              variant="secondary"
              onClick={() => setStep("sessions")}
              fullWidth
            />
          )}

          <div style={{ marginBottom: "1.25rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 900,
                marginTop: "1rem",
                marginBottom: "0.5rem",
                color: "var(--color-black)",
              }}
            >
              WalletConnect URI
            </label>
            <textarea
              value={wcUri}
              onChange={(e) => setWcUri(e.target.value)}
              placeholder="wc:..."
              rows={3}
              style={{
                width: "100%",
                resize: "none",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <Button
              title="Connect"
              variant="primary"
              onClick={handlePairWithUri}
              fullWidth
            />

            <Button
              title="Scan QR Code"
              icon="📷"
              variant="secondary"
              onClick={() => setStep("scan-uri")}
              fullWidth
            />
          </div>

          <div
            style={{
              backgroundColor: "var(--color-info)",
              border: "3px solid var(--color-black)",
              padding: "1rem",
              color: "var(--color-white)",
            }}
          >
            <p style={{ fontSize: "0.875rem", fontWeight: 700, margin: 0 }}>
              💡 Scan a WalletConnect QR code from a dApp (like Uniswap,
              OpenSea) or paste the connection URI to connect.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "0.75rem",
      }}
    >
      <span style={{ fontWeight: 900, fontSize: "0.875rem" }}>{label}:</span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "0.875rem",
          textAlign: "right",
          wordBreak: "break-all",
          marginLeft: "0.5rem",
          fontWeight: 500,
        }}
      >
        {value}
      </span>
    </div>
  );
}
