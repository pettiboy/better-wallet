import "@walletconnect/react-native-compat";
import { Core } from "@walletconnect/core";
import { WalletKit, WalletKitTypes } from "@reown/walletkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

// WalletConnect Project ID - replace with your actual project ID
const PROJECT_ID =
  process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID_HERE";

const ACTIVE_SESSIONS_KEY = "walletconnect_sessions";

let walletKit: WalletKit | null = null;

/**
 * Initialize WalletKit instance
 */
export async function initWalletConnect(): Promise<WalletKit> {
  if (walletKit) {
    return walletKit;
  }

  try {
    const core = new Core({
      projectId: PROJECT_ID,
    });

    walletKit = await WalletKit.init({
      core,
      metadata: {
        name: "BetterWallet",
        description: "Secure 2-device wallet with offline signing",
        url: "https://betterwallet.app",
        icons: ["https://betterwallet.app/icon.png"],
        redirect: {
          native: "betterwallet://",
        },
      },
    });

    console.log("WalletKit initialized successfully");
    return walletKit;
  } catch (error) {
    console.error("Failed to initialize WalletKit:", error);
    throw error;
  }
}

/**
 * Get WalletKit instance (must be initialized first)
 */
export function getWalletKit(): WalletKit | null {
  return walletKit;
}

/**
 * Pair with a dApp using WalletConnect URI
 */
export async function pair(uri: string): Promise<void> {
  const kit = getWalletKit();
  if (!kit) {
    throw new Error("WalletKit not initialized");
  }

  try {
    await kit.pair({ uri });
    console.log("Pairing initiated with URI:", uri);
  } catch (error) {
    console.error("Pairing failed:", error);
    throw error;
  }
}

/**
 * Approve a session proposal
 */
export async function approveSession(
  proposal: WalletKitTypes.SessionProposal,
  walletAddress: string
): Promise<void> {
  const kit = getWalletKit();
  if (!kit) {
    throw new Error("WalletKit not initialized");
  }

  try {
    // Extract required and optional chains
    const { id, params } = proposal;
    const { requiredNamespaces, optionalNamespaces } = params;

    // Build namespaces for approval
    const namespaces: Record<string, any> = {};

    // Handle required namespaces
    if (requiredNamespaces) {
      for (const [key, namespace] of Object.entries(requiredNamespaces)) {
        namespaces[key] = {
          accounts:
            namespace.chains?.map((chain) => `${chain}:${walletAddress}`) || [],
          methods: namespace.methods || [],
          events: namespace.events || [],
        };
      }
    }

    // Handle optional namespaces (if any)
    if (optionalNamespaces) {
      for (const [key, namespace] of Object.entries(optionalNamespaces)) {
        if (!namespaces[key]) {
          namespaces[key] = {
            accounts:
              namespace.chains?.map((chain) => `${chain}:${walletAddress}`) ||
              [],
            methods: namespace.methods || [],
            events: namespace.events || [],
          };
        }
      }
    }

    await kit.approveSession({
      id,
      namespaces,
    });

    console.log("Session approved:", id);
    await saveActiveSessions();
  } catch (error) {
    console.error("Failed to approve session:", error);
    throw error;
  }
}

/**
 * Reject a session proposal
 */
export async function rejectSession(
  proposal: WalletKitTypes.SessionProposal
): Promise<void> {
  const kit = getWalletKit();
  if (!kit) {
    throw new Error("WalletKit not initialized");
  }

  try {
    await kit.rejectSession({
      id: proposal.id,
      reason: {
        code: 5000,
        message: "User rejected session",
      },
    });

    console.log("Session rejected:", proposal.id);
  } catch (error) {
    console.error("Failed to reject session:", error);
    throw error;
  }
}

/**
 * Respond to a transaction request with signed transaction
 */
export async function respondTransaction(
  topic: string,
  requestId: number,
  signedTransaction: string
): Promise<void> {
  const kit = getWalletKit();
  if (!kit) {
    throw new Error("WalletKit not initialized");
  }

  try {
    await kit.respondSessionRequest({
      topic,
      response: {
        id: requestId,
        jsonrpc: "2.0",
        result: signedTransaction,
      },
    });

    console.log("Transaction response sent:", requestId);
  } catch (error) {
    console.error("Failed to respond to transaction:", error);
    throw error;
  }
}

/**
 * Reject a transaction request
 */
export async function rejectTransaction(
  topic: string,
  requestId: number,
  reason: string = "User rejected transaction"
): Promise<void> {
  const kit = getWalletKit();
  if (!kit) {
    throw new Error("WalletKit not initialized");
  }

  try {
    await kit.respondSessionRequest({
      topic,
      response: {
        id: requestId,
        jsonrpc: "2.0",
        error: {
          code: 5000,
          message: reason,
        },
      },
    });

    console.log("Transaction rejected:", requestId);
  } catch (error) {
    console.error("Failed to reject transaction:", error);
    throw error;
  }
}

/**
 * Disconnect a session
 */
export async function disconnectSession(topic: string): Promise<void> {
  const kit = getWalletKit();
  if (!kit) {
    throw new Error("WalletKit not initialized");
  }

  try {
    await kit.disconnectSession({
      topic,
      reason: {
        code: 6000,
        message: "User disconnected",
      },
    });

    console.log("Session disconnected:", topic);
    await saveActiveSessions();
  } catch (error) {
    console.error("Failed to disconnect session:", error);
    throw error;
  }
}

/**
 * Get all active sessions
 */
export function getActiveSessions(): WalletKitTypes.SessionTypes.Struct[] {
  const kit = getWalletKit();
  if (!kit) {
    return [];
  }

  return Object.values(kit.getActiveSessions());
}

/**
 * Save active sessions to storage
 */
async function saveActiveSessions(): Promise<void> {
  try {
    const sessions = getActiveSessions();
    await AsyncStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Failed to save sessions:", error);
  }
}

/**
 * Parse transaction request from WalletConnect
 */
export function parseTransactionRequest(
  request: WalletKitTypes.SessionRequest
): {
  method: string;
  transaction: any;
  chainId: string;
} {
  const { method, params } = request.params.request;
  const chainId = request.params.chainId;

  // Handle different RPC methods
  if (method === "eth_sendTransaction") {
    return {
      method,
      transaction: params[0],
      chainId,
    };
  } else if (method === "eth_signTransaction") {
    return {
      method,
      transaction: params[0],
      chainId,
    };
  }

  throw new Error(`Unsupported method: ${method}`);
}

/**
 * Get session by topic
 */
export function getSessionByTopic(
  topic: string
): WalletKitTypes.SessionTypes.Struct | null {
  const sessions = getActiveSessions();
  return sessions.find((session) => session.topic === topic) || null;
}
