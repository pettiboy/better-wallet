import { ethers } from "ethers";

/**
 * Serialize a transaction for QR code transmission
 * Converts BigInt values to strings for JSON compatibility
 */
export function serializeTransaction(tx: ethers.TransactionRequest): string {
  const serializable = {
    from: tx.from,
    to: tx.to,
    value: tx.value?.toString(),
    nonce: tx.nonce,
    gasLimit: tx.gasLimit?.toString(),
    chainId: tx.chainId,
    type: tx.type,
    maxFeePerGas: tx.maxFeePerGas?.toString(),
    maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toString(),
  };

  return JSON.stringify(serializable);
}

/**
 * Deserialize a transaction from QR code data
 * Converts string values back to BigInt where needed
 */
export function deserializeTransaction(
  data: string
): ethers.TransactionRequest {
  const parsed = JSON.parse(data);

  return {
    from: parsed.from,
    to: parsed.to,
    value: parsed.value ? BigInt(parsed.value) : undefined,
    nonce: parsed.nonce,
    gasLimit: parsed.gasLimit ? BigInt(parsed.gasLimit) : undefined,
    chainId: parsed.chainId,
    type: parsed.type,
    maxFeePerGas: parsed.maxFeePerGas ? BigInt(parsed.maxFeePerGas) : undefined,
    maxPriorityFeePerGas: parsed.maxPriorityFeePerGas
      ? BigInt(parsed.maxPriorityFeePerGas)
      : undefined,
  };
}
