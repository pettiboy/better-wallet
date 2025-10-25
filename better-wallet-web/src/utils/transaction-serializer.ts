import { ethers } from "ethers";

export interface DappMetadata {
  name: string;
  url: string;
  icon?: string;
  description?: string;
}

export interface TransactionMetadata {
  source: "manual" | "walletconnect";
  dappMetadata?: DappMetadata;
  requestId?: number;
  topic?: string;
}

export interface SerializedTransaction {
  transaction: ethers.TransactionRequest;
  metadata: TransactionMetadata;
}

/**
 * Serialize a transaction for QR code transmission
 * Converts BigInt values to strings for JSON compatibility
 */
export function serializeTransaction(
  tx: ethers.TransactionRequest,
  metadata?: TransactionMetadata
): string {
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
    data: tx.data,
  };

  const payload: SerializedTransaction = {
    transaction: serializable as any,
    metadata: metadata || { source: "manual" },
  };

  return JSON.stringify(payload);
}

/**
 * Deserialize a transaction from QR code data
 * Converts string values back to BigInt where needed
 * Returns both transaction and metadata
 */
export function deserializeTransaction(data: string): SerializedTransaction {
  const parsed = JSON.parse(data);

  // Handle legacy format (without metadata wrapper)
  if (!parsed.transaction && !parsed.metadata) {
    const tx: ethers.TransactionRequest = {
      from: parsed.from,
      to: parsed.to,
      value: parsed.value ? BigInt(parsed.value) : undefined,
      nonce: parsed.nonce,
      gasLimit: parsed.gasLimit ? BigInt(parsed.gasLimit) : undefined,
      chainId: parsed.chainId,
      type: parsed.type,
      maxFeePerGas: parsed.maxFeePerGas
        ? BigInt(parsed.maxFeePerGas)
        : undefined,
      maxPriorityFeePerGas: parsed.maxPriorityFeePerGas
        ? BigInt(parsed.maxPriorityFeePerGas)
        : undefined,
      data: parsed.data,
    };

    return {
      transaction: tx,
      metadata: { source: "manual" },
    };
  }

  // Handle new format with metadata
  const tx: ethers.TransactionRequest = {
    from: parsed.transaction.from,
    to: parsed.transaction.to,
    value: parsed.transaction.value
      ? BigInt(parsed.transaction.value)
      : undefined,
    nonce: parsed.transaction.nonce,
    gasLimit: parsed.transaction.gasLimit
      ? BigInt(parsed.transaction.gasLimit)
      : undefined,
    chainId: parsed.transaction.chainId,
    type: parsed.transaction.type,
    maxFeePerGas: parsed.transaction.maxFeePerGas
      ? BigInt(parsed.transaction.maxFeePerGas)
      : undefined,
    maxPriorityFeePerGas: parsed.transaction.maxPriorityFeePerGas
      ? BigInt(parsed.transaction.maxPriorityFeePerGas)
      : undefined,
    data: parsed.transaction.data,
  };

  return {
    transaction: tx,
    metadata: parsed.metadata,
  };
}

/**
 * Serialize a signed transaction with its metadata for QR code transmission
 */
export function serializeSignedTransaction(
  signedTx: string,
  metadata?: TransactionMetadata
): string {
  return JSON.stringify({
    signedTransaction: signedTx,
    metadata: metadata || { source: "manual" },
  });
}

/**
 * Deserialize a signed transaction from QR code data
 */
export function deserializeSignedTransaction(data: string): {
  signedTransaction: string;
  metadata: TransactionMetadata;
} {
  const parsed = JSON.parse(data);

  // Handle legacy format (just the signed transaction string)
  if (typeof parsed === "string") {
    return {
      signedTransaction: parsed,
      metadata: { source: "manual" },
    };
  }

  // Handle new format with metadata
  return {
    signedTransaction: parsed.signedTransaction,
    metadata: parsed.metadata || { source: "manual" },
  };
}
