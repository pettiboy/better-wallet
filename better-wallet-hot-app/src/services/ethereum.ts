import { ethers } from "ethers";

// Provider instance management
let currentProvider: ethers.JsonRpcProvider | null = null;
let currentChainId: number | null = null;
let currentRpcUrl: string | null = null;

/**
 * Set the provider for a specific chain
 */
export function setProvider(chainId: number, rpcUrl: string): void {
  // Only create a new provider if chain or RPC changed
  if (chainId !== currentChainId || rpcUrl !== currentRpcUrl) {
    currentProvider = new ethers.JsonRpcProvider(rpcUrl);
    currentChainId = chainId;
    currentRpcUrl = rpcUrl;
  }
}

/**
 * Get the current provider instance
 * Note: Provider must be set using setProvider() before calling this
 */
export function getProvider(): ethers.JsonRpcProvider {
  if (!currentProvider) {
    throw new Error(
      "Provider not initialized. Call setProvider() with chain config first."
    );
  }
  return currentProvider;
}

/**
 * Get current chain ID
 */
export function getCurrentChainId(): number {
  if (currentChainId === null) {
    throw new Error("Chain ID not set. Call setProvider() first.");
  }
  return currentChainId;
}

/**
 * Get balance for an address in ETH
 */
export async function getBalance(address: string): Promise<string> {
  try {
    const provider = getProvider();
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw new Error("Failed to fetch balance");
  }
}

/**
 * Get current gas price
 */
export async function getGasPrice(): Promise<bigint> {
  try {
    const provider = getProvider();
    const feeData = await provider.getFeeData();
    return feeData.gasPrice || BigInt(0);
  } catch (error) {
    console.error("Error fetching gas price:", error);
    throw new Error("Failed to fetch gas price");
  }
}

/**
 * Estimate gas for a transaction
 */
export async function estimateGas(
  from: string,
  to: string,
  value: string
): Promise<bigint> {
  try {
    const provider = getProvider();
    const valueInWei = ethers.parseEther(value);

    const gasEstimate = await provider.estimateGas({
      from,
      to,
      value: valueInWei,
    });

    return gasEstimate;
  } catch (error) {
    console.error("Error estimating gas:", error);
    // Return a default safe gas limit
    return BigInt(21000);
  }
}

/**
 * Construct an unsigned transaction
 */
export async function constructTransaction(
  from: string,
  to: string,
  amount: string
): Promise<ethers.TransactionRequest> {
  try {
    const provider = getProvider();
    const chainId = getCurrentChainId();
    const nonce = await provider.getTransactionCount(from, "pending");
    const feeData = await provider.getFeeData();
    const valueInWei = ethers.parseEther(amount);

    // Estimate gas
    const gasLimit = await estimateGas(from, to, amount);

    const tx: ethers.TransactionRequest = {
      from,
      to,
      value: valueInWei,
      nonce,
      gasLimit,
      chainId,
      type: 2, // EIP-1559 transaction
      maxFeePerGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    };

    return tx;
  } catch (error) {
    console.error("Error constructing transaction:", error);
    throw new Error("Failed to construct transaction");
  }
}

/**
 * Broadcast a signed transaction to the network
 */
export async function broadcastTransaction(signedTx: string): Promise<string> {
  try {
    const provider = getProvider();
    const txResponse = await provider.broadcastTransaction(signedTx);
    return txResponse.hash;
  } catch (error) {
    console.error("Error broadcasting transaction:", error);
    throw new Error("Failed to broadcast transaction");
  }
}

/**
 * Get transaction receipt
 */
export async function getTransactionReceipt(
  txHash: string
): Promise<ethers.TransactionReceipt | null> {
  try {
    const provider = getProvider();
    return await provider.getTransactionReceipt(txHash);
  } catch (error) {
    console.error("Error fetching transaction receipt:", error);
    return null;
  }
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

/**
 * Format wei to ether
 */
export function formatEther(wei: bigint): string {
  return ethers.formatEther(wei);
}

/**
 * Parse ether to wei
 */
export function parseEther(ether: string): bigint {
  return ethers.parseEther(ether);
}

/**
 * ERC20 ABI for common functions
 */
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

/**
 * Get ERC20 token balance for an address
 */
export async function getERC20Balance(
  tokenAddress: string,
  walletAddress: string
): Promise<{ balance: string; decimals: number; symbol: string }> {
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    const [balance, decimals, symbol] = await Promise.all([
      contract.balanceOf(walletAddress),
      contract.decimals(),
      contract.symbol(),
    ]);

    const formattedBalance = ethers.formatUnits(balance, decimals);

    return {
      balance: formattedBalance,
      decimals: Number(decimals),
      symbol,
    };
  } catch (error) {
    console.error("Error fetching ERC20 balance:", error);
    throw new Error("Failed to fetch token balance");
  }
}

/**
 * Get ERC20 token information
 */
export async function getERC20Info(tokenAddress: string): Promise<{
  name: string;
  symbol: string;
  decimals: number;
}> {
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    const [name, symbol, decimals] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
    ]);

    return {
      name,
      symbol,
      decimals: Number(decimals),
    };
  } catch (error) {
    console.error("Error fetching token info:", error);
    throw new Error("Failed to fetch token information");
  }
}

/**
 * Construct an unsigned ERC20 token transfer transaction
 */
export async function constructERC20Transfer(
  tokenAddress: string,
  from: string,
  to: string,
  amount: string,
  decimals: number
): Promise<ethers.TransactionRequest> {
  try {
    const provider = getProvider();
    const chainId = getCurrentChainId();
    const nonce = await provider.getTransactionCount(from, "pending");
    const feeData = await provider.getFeeData();

    // Create the contract interface to encode the transfer function
    const iface = new ethers.Interface(ERC20_ABI);
    const amountInWei = ethers.parseUnits(amount, decimals);
    const data = iface.encodeFunctionData("transfer", [to, amountInWei]);

    // Estimate gas for the token transfer
    const gasLimit = await provider.estimateGas({
      from,
      to: tokenAddress,
      data,
    });

    const tx: ethers.TransactionRequest = {
      from,
      to: tokenAddress, // Token contract address
      value: BigInt(0), // No ETH value for token transfer
      data, // Encoded transfer function call
      nonce,
      gasLimit,
      chainId,
      type: 2, // EIP-1559 transaction
      maxFeePerGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    };

    return tx;
  } catch (error) {
    console.error("Error constructing ERC20 transfer:", error);
    throw new Error("Failed to construct token transfer");
  }
}

/**
 * Update transaction with current nonce and gas prices from the network
 * This fixes issues where dApps send transactions with stale nonces/gas prices
 */
export async function updateTransactionNonce(
  transaction: ethers.TransactionRequest,
  provider: ethers.JsonRpcProvider
): Promise<ethers.TransactionRequest> {
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

    const updates: Partial<ethers.TransactionRequest> = {};

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
