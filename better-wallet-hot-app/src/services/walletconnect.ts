import { Core } from "@walletconnect/core";
import { WalletKit } from "@reown/walletkit";
import type { WalletKitTypes } from "@reown/walletkit";
import type { SessionTypes } from "@walletconnect/types";

// WalletConnect Project ID from environment
const PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID_HERE";

const ACTIVE_SESSIONS_KEY = "walletconnect_sessions";

let walletKit: InstanceType<typeof WalletKit> | null = null;

/**
 * Initialize WalletKit instance for web
 */
export async function initWalletConnect(): Promise<InstanceType<typeof WalletKit>> {
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
        icons: ["https://avatars.githubusercontent.com/u/37784886"],
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
export function getWalletKit(): InstanceType<typeof WalletKit> | null {
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
export function getActiveSessions(): SessionTypes.Struct[] {
  const kit = getWalletKit();
  if (!kit) {
    return [];
  }

  return Object.values(kit.getActiveSessions());
}

/**
 * Save active sessions to localStorage
 */
async function saveActiveSessions(): Promise<void> {
  try {
    const sessions = getActiveSessions();
    localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Failed to save sessions:", error);
  }
}

/**
 * Extract numeric chain ID from WalletConnect format
 * Converts "eip155:11155111" to 11155111
 */
function extractChainId(walletConnectChainId: string): number {
  const parts = walletConnectChainId.split(":");
  if (parts.length === 2 && parts[0] === "eip155") {
    return parseInt(parts[1], 10);
  }
  // Fallback: try to parse as number
  return parseInt(walletConnectChainId, 10);
}

/**
 * Update transaction with current nonce and gas prices from the network
 * This fixes issues where dApps send transactions with stale nonces/gas prices
 */
export async function updateTransactionNonce(
  transaction: any,
  provider: any
): Promise<any> {
  try {
    if (!transaction.from) {
      console.warn(
        "Transaction missing 'from' field, cannot update transaction"
      );
      return transaction;
    }

    // Get current nonce from network
    const currentNonce = await provider.getTransactionCount(
      transaction.from,
      "pending"
    );

    // Get current fee data (gas prices)
    const feeData = await provider.getFeeData();

    console.log(
      `Updating transaction: nonce ${transaction.nonce}->${currentNonce}, ` +
        `maxFee ${
          transaction.maxFeePerGas
        }->${feeData.maxFeePerGas?.toString()}`
    );

    const updates: any = {};

    // Update nonce if it's missing or outdated
    if (
      transaction.nonce === undefined ||
      transaction.nonce === null ||
      transaction.nonce < currentNonce
    ) {
      updates.nonce = currentNonce;
    }

    // Update gas prices if they're missing or too low
    // For EIP-1559 transactions (type 2)
    if (transaction.type === 2 || transaction.type === undefined) {
      if (feeData.maxFeePerGas) {
        // Only update if current fee is higher or missing
        const currentMaxFee = transaction.maxFeePerGas
          ? BigInt(transaction.maxFeePerGas)
          : BigInt(0);
        if (
          currentMaxFee === BigInt(0) ||
          feeData.maxFeePerGas > currentMaxFee
        ) {
          updates.maxFeePerGas = feeData.maxFeePerGas;
        }
      }

      if (feeData.maxPriorityFeePerGas) {
        const currentPriorityFee = transaction.maxPriorityFeePerGas
          ? BigInt(transaction.maxPriorityFeePerGas)
          : BigInt(0);
        if (
          currentPriorityFee === BigInt(0) ||
          feeData.maxPriorityFeePerGas > currentPriorityFee
        ) {
          updates.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
        }
      }

      // Remove legacy gasPrice if present (EIP-1559 uses maxFeePerGas)
      if ("gasPrice" in transaction) {
        updates.gasPrice = undefined;
      }
    }
    // For legacy transactions (type 0 or 1)
    else if (feeData.gasPrice) {
      const currentGasPrice = transaction.gasPrice
        ? BigInt(transaction.gasPrice)
        : BigInt(0);
      if (currentGasPrice === BigInt(0) || feeData.gasPrice > currentGasPrice) {
        updates.gasPrice = feeData.gasPrice;
      }
    }

    // Return updated transaction if there were any updates
    if (Object.keys(updates).length > 0) {
      return {
        ...transaction,
        ...updates,
      };
    }

    return transaction;
  } catch (error) {
    console.error("Failed to update transaction:", error);
    // Return original transaction if update fails
    return transaction;
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
  numericChainId: number;
} {
  const { method, params } = request.params.request;
  const chainId = request.params.chainId;
  const numericChainId = extractChainId(chainId);

  // Get transaction params
  const txParams = params[0];

  // Validate chain ID (currently only support Sepolia testnet)
  const SEPOLIA_CHAIN_ID = 11155111;
  if (numericChainId !== SEPOLIA_CHAIN_ID) {
    throw new Error(
      `Unsupported chain ID: ${numericChainId}. Only Sepolia testnet (11155111) is currently supported.`
    );
  }

  // Ensure chainId is included and convert gas to gasLimit if needed
  const transaction = {
    ...txParams,
    chainId: numericChainId,
    // Convert 'gas' to 'gasLimit' for ethers v6 compatibility
    gasLimit: txParams.gasLimit || txParams.gas,
  };

  // Remove 'gas' field if it exists (ethers v6 uses gasLimit)
  if ("gas" in transaction && !txParams.gasLimit) {
    delete transaction.gas;
  }

  console.log(
    "Parsed WC transaction with chainId:",
    transaction.chainId,
    typeof transaction.chainId
  );

  // Handle different RPC methods
  if (method === "eth_sendTransaction") {
    return {
      method,
      transaction,
      chainId,
      numericChainId,
    };
  } else if (method === "eth_signTransaction") {
    return {
      method,
      transaction,
      chainId,
      numericChainId,
    };
  }

  throw new Error(`Unsupported method: ${method}`);
}

/**
 * Check if a method requires user interaction (transaction signing)
 */
export function isTransactionMethod(method: string): boolean {
  const transactionMethods = ["eth_sendTransaction", "eth_signTransaction"];
  return transactionMethods.includes(method);
}

/**
 * Handle non-transaction methods automatically
 */
export async function handleNonTransactionMethod(
  request: WalletKitTypes.SessionRequest
): Promise<any> {
  const { method, params } = request.params.request;

  // Handle wallet capability queries
  if (method === "wallet_getCapabilities") {
    // Return empty capabilities for now
    return {};
  }

  // Handle chain switching requests
  if (method === "wallet_switchEthereumChain") {
    // For now, we only support Sepolia testnet
    // Return success if requesting Sepolia, error otherwise
    const chainId = params[0]?.chainId;
    if (chainId === "0xaa36a7" || chainId === "11155111") {
      return null; // Success
    }
    throw new Error("Unsupported chain");
  }

  // Handle add chain requests
  if (method === "wallet_addEthereumChain") {
    // We don't support adding custom chains
    throw new Error("Adding custom chains is not supported");
  }

  // Return null for other non-critical methods
  console.log(`Auto-handling method: ${method}`);
  return null;
}

/**
 * Get session by topic
 */
export function getSessionByTopic(topic: string): SessionTypes.Struct | null {
  const sessions = getActiveSessions();
  return sessions.find((session) => session.topic === topic) || null;
}
