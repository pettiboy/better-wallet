import { ethers } from "ethers";

// Using public Ethereum RPC endpoints
// const MAINNET_RPC = 'https://eth.llamarpc.com';
const SEPOLIA_RPC = "https://1rpc.io/sepolia";

// Default to Sepolia testnet for safety
const DEFAULT_RPC = SEPOLIA_RPC;
const DEFAULT_CHAIN_ID = 11155111; // Sepolia

let provider: ethers.JsonRpcProvider;

/**
 * Get or create provider instance
 */
export function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(DEFAULT_RPC);
  }
  return provider;
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
      chainId: DEFAULT_CHAIN_ID,
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
