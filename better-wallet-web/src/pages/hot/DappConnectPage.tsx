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
      const { signedTransaction } =
        deserializeSignedTransaction(data);

      // Broadcast to network FIRST to get the transaction hash
      const hash = await broadcastTransaction(signedTransaction);
      console.log("Transaction broadcasted with hash:", hash);

      // Respond to dApp with the transaction HASH (not the raw tx)
      // This is what eth_sendTransaction expects as a return value
      await respondTransaction(hash);

      alert(
        `Transaction sent to dApp!\nHash: ${hash.substring(0, 10)}...`
      );

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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Initializing WalletConnect...
            </h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">
              dApp Transaction Request
            </h1>

            {dappMetadata && (
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                  {dappMetadata.name}
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  {dappMetadata.url}
                </p>
              </div>
            )}

            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
              Show this QR code to your cold wallet for signing
            </p>

            <QRDisplay
              data={serializedTx}
              title="Transaction from dApp"
              size={280}
            />

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
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

            <div className="space-y-3">
              <Button
                title="Scan Signed Transaction"
                variant="primary"
                onClick={() => setStep("scan-signed")}
                className="w-full"
              />

              <Button
                title="Reject Transaction"
                variant="danger"
                onClick={handleRejectTransaction}
                className="w-full"
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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Broadcasting...
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Sending transaction to dApp
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              Connected dApps
            </h1>

            <div className="space-y-3 mb-6">
              {sessions.map((session) => (
                <div
                  key={session.topic}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex justify-between items-center"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {session.peer.metadata.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {session.peer.metadata.url}
                    </p>
                  </div>
                  <Button
                    title="Disconnect"
                    variant="danger"
                    onClick={() => handleDisconnect(session.topic)}
                    className="ml-4"
                  />
                </div>
              ))}
            </div>

            <Button
              title="Connect New dApp"
              variant="primary"
              onClick={() => setStep("connect")}
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  }

  // Connect screen (default)
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            Connect to dApp
          </h1>

          {sessions.length > 0 && (
            <Button
              title={`View Connected dApps (${sessions.length})`}
              variant="secondary"
              onClick={() => setStep("sessions")}
              className="w-full mb-4"
            />
          )}

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              WalletConnect URI
            </label>
            <textarea
              value={wcUri}
              onChange={(e) => setWcUri(e.target.value)}
              placeholder="wc:..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Button
              title="Connect"
              variant="primary"
              onClick={handlePairWithUri}
              className="w-full"
            />

            <Button
              title="Scan QR Code"
              variant="secondary"
              onClick={() => setStep("scan-uri")}
              className="w-full"
            />
          </div>

          <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4 mt-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
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
    <div className="flex justify-between items-start mb-2">
      <span className="font-semibold text-gray-600 dark:text-gray-300">{label}:</span>
      <span className="font-mono text-sm text-gray-900 dark:text-white text-right break-all ml-2">
        {value}
      </span>
    </div>
  );
}
