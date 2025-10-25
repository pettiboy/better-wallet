import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { WalletKitTypes } from "@reown/walletkit";
import type { SessionTypes } from "@walletconnect/types";
import {
  initWalletConnect,
  getWalletKit,
  pair as pairWithDapp,
  approveSession as approveSessionProposal,
  rejectSession as rejectSessionProposal,
  respondTransaction as respondTransactionRequest,
  rejectTransaction as rejectTransactionRequest,
  disconnectSession as disconnectSessionFromDapp,
  getActiveSessions,
  parseTransactionRequest,
  isTransactionMethod,
  handleNonTransactionMethod,
} from "../services/walletconnect";
import { useDeviceMode } from "./DeviceModeContext";

interface WalletConnectContextType {
  initialized: boolean;
  sessions: SessionTypes.Struct[];
  pendingProposal: WalletKitTypes.SessionProposal | null;
  pendingRequest: WalletKitTypes.SessionRequest | null;
  pair: (uri: string) => Promise<void>;
  approveSession: (proposal: WalletKitTypes.SessionProposal) => Promise<void>;
  rejectSession: (proposal: WalletKitTypes.SessionProposal) => Promise<void>;
  respondTransaction: (signedTx: string) => Promise<void>;
  rejectTransaction: (reason?: string) => Promise<void>;
  disconnectSession: (topic: string) => Promise<void>;
  clearPendingRequest: () => void;
}

const WalletConnectContext = createContext<
  WalletConnectContextType | undefined
>(undefined);

export function WalletConnectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { mode, walletAddress } = useDeviceMode();
  const [initialized, setInitialized] = useState(false);
  const [sessions, setSessions] = useState<SessionTypes.Struct[]>([]);
  const [pendingProposal, setPendingProposal] =
    useState<WalletKitTypes.SessionProposal | null>(null);
  const [pendingRequest, setPendingRequest] =
    useState<WalletKitTypes.SessionRequest | null>(null);

  const initializeWalletConnect = useCallback(async () => {
    try {
      const kit = await initWalletConnect();

      // Set up event listeners
      kit.on("session_proposal", handleSessionProposal);
      kit.on("session_request", handleSessionRequest);
      kit.on("session_delete", handleSessionDelete);

      // Load existing sessions
      const activeSessions = getActiveSessions();
      setSessions(activeSessions);

      setInitialized(true);
      console.log(
        "WalletConnect initialized with",
        activeSessions.length,
        "sessions"
      );
    } catch (error) {
      console.error("Failed to initialize WalletConnect:", error);
      alert("Failed to initialize WalletConnect");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  // Initialize WalletConnect only in hot wallet mode
  useEffect(() => {
    if (mode === "hot") {
      initializeWalletConnect();
    }
  }, [mode, initializeWalletConnect]);

  const handleSessionProposal = useCallback(
    (proposal: WalletKitTypes.SessionProposal) => {
      console.log("Session proposal received:", proposal);
      setPendingProposal(proposal);
    },
    []
  );

  const handleSessionRequest = useCallback(
    async (request: WalletKitTypes.SessionRequest) => {
      console.log("Session request received:", request);

      const method = request.params.request.method;

      // Check if this is a transaction that needs user approval
      if (isTransactionMethod(method)) {
        try {
          // Parse the transaction request
          const parsed = parseTransactionRequest(request);
          console.log("Transaction request parsed:", parsed);

          // Show to user for approval
          setPendingRequest(request);
        } catch (error) {
          console.error("Failed to parse transaction:", error);
          alert("Unable to parse the transaction request.");

          // Reject invalid transaction
          const kit = getWalletKit();
          if (kit) {
            kit.respondSessionRequest({
              topic: request.topic,
              response: {
                id: request.id,
                jsonrpc: "2.0",
                error: {
                  code: 5001,
                  message: "Invalid transaction request",
                },
              },
            });
          }
        }
      } else {
        // Auto-handle non-transaction methods
        console.log(`Auto-handling non-transaction method: ${method}`);
        const kit = getWalletKit();
        if (kit) {
          try {
            const result = await handleNonTransactionMethod(request);
            kit.respondSessionRequest({
              topic: request.topic,
              response: {
                id: request.id,
                jsonrpc: "2.0",
                result,
              },
            });
            console.log(`Successfully handled ${method}`);
          } catch (error) {
            console.error(`Error handling ${method}:`, error);
            kit.respondSessionRequest({
              topic: request.topic,
              response: {
                id: request.id,
                jsonrpc: "2.0",
                error: {
                  code: 5001,
                  message:
                    error instanceof Error
                      ? error.message
                      : "Method not supported",
                },
              },
            });
          }
        }
      }
    },
    []
  );

  const handleSessionDelete = useCallback(() => {
    console.log("Session deleted");
    // Refresh sessions list
    const activeSessions = getActiveSessions();
    setSessions(activeSessions);
  }, []);

  const pair = async (uri: string) => {
    try {
      await pairWithDapp(uri);
      // The session_proposal event will be triggered automatically
    } catch (error) {
      console.error("Pairing failed:", error);
      throw error;
    }
  };

  const approveSession = async (proposal: WalletKitTypes.SessionProposal) => {
    if (!walletAddress) {
      throw new Error("No wallet address available");
    }

    try {
      await approveSessionProposal(proposal, walletAddress);

      // Update sessions list
      const activeSessions = getActiveSessions();
      setSessions(activeSessions);

      // Clear pending proposal
      setPendingProposal(null);

      alert("Connected to dApp successfully!");
    } catch (error) {
      console.error("Failed to approve session:", error);
      throw error;
    }
  };

  const rejectSession = async (proposal: WalletKitTypes.SessionProposal) => {
    try {
      await rejectSessionProposal(proposal);
      setPendingProposal(null);
    } catch (error) {
      console.error("Failed to reject session:", error);
      throw error;
    }
  };

  const respondTransaction = async (signedTx: string) => {
    if (!pendingRequest) {
      throw new Error("No pending transaction request");
    }

    try {
      await respondTransactionRequest(
        pendingRequest.topic,
        pendingRequest.id,
        signedTx
      );

      setPendingRequest(null);
      alert("Transaction sent to dApp!");
    } catch (error) {
      console.error("Failed to respond to transaction:", error);
      throw error;
    }
  };

  const rejectTransaction = async (
    reason: string = "User rejected transaction"
  ) => {
    if (!pendingRequest) {
      throw new Error("No pending transaction request");
    }

    try {
      await rejectTransactionRequest(
        pendingRequest.topic,
        pendingRequest.id,
        reason
      );

      setPendingRequest(null);
    } catch (error) {
      console.error("Failed to reject transaction:", error);
      throw error;
    }
  };

  const disconnectSession = async (topic: string) => {
    try {
      await disconnectSessionFromDapp(topic);

      // Update sessions list
      const activeSessions = getActiveSessions();
      setSessions(activeSessions);

      alert("Disconnected from dApp");
    } catch (error) {
      console.error("Failed to disconnect session:", error);
      throw error;
    }
  };

  const clearPendingRequest = () => {
    setPendingRequest(null);
  };

  const value: WalletConnectContextType = {
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
  };

  return (
    <WalletConnectContext.Provider value={value}>
      {children}
    </WalletConnectContext.Provider>
  );
}

export function useWalletConnect() {
  const context = useContext(WalletConnectContext);
  if (context === undefined) {
    throw new Error(
      "useWalletConnect must be used within WalletConnectProvider"
    );
  }
  return context;
}
