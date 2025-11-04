import { ethers } from "ethers";

/**
 * Ethereum transaction types
 */
export enum TransactionType {
  LEGACY = 0,
  EIP2930 = 1,
  EIP1559 = 2,
}

/**
 * Transaction type information for display
 */
export interface TransactionTypeInfo {
  type: TransactionType | "UNKNOWN";
  name: string;
  description: string;
  gasFields: string[];
}

/**
 * Detect transaction type from transaction request
 */
export function detectTransactionType(
  tx: ethers.TransactionRequest
): TransactionTypeInfo {
  // Check if type field is explicitly set
  if (tx.type !== undefined && tx.type !== null) {
    switch (tx.type) {
      case 0:
        return {
          type: TransactionType.LEGACY,
          name: "Legacy (Type 0)",
          description:
            "Traditional Ethereum transaction using gasPrice. Common on L2s and older dApps.",
          gasFields: ["gasPrice", "gasLimit"],
        };
      case 1:
        return {
          type: TransactionType.EIP2930,
          name: "EIP-2930 (Type 1)",
          description:
            "Transaction with access list. Introduced in Berlin hard fork.",
          gasFields: ["gasPrice", "gasLimit", "accessList"],
        };
      case 2:
        return {
          type: TransactionType.EIP1559,
          name: "EIP-1559 (Type 2)",
          description:
            "Modern transaction with dynamic fees. Recommended for Ethereum mainnet.",
          gasFields: ["maxFeePerGas", "maxPriorityFeePerGas", "gasLimit"],
        };
      default:
        return {
          type: "UNKNOWN",
          name: `Unknown (Type ${tx.type})`,
          description: "Unknown transaction type. Verify before signing.",
          gasFields: [],
        };
    }
  }

  // Infer type from gas fields if type is not set
  if (tx.maxFeePerGas !== undefined || tx.maxPriorityFeePerGas !== undefined) {
    return {
      type: TransactionType.EIP1559,
      name: "EIP-1559 (Type 2)",
      description:
        "Modern transaction with dynamic fees. Recommended for Ethereum mainnet.",
      gasFields: ["maxFeePerGas", "maxPriorityFeePerGas", "gasLimit"],
    };
  }

  if (tx.gasPrice !== undefined) {
    return {
      type: TransactionType.LEGACY,
      name: "Legacy (Type 0)",
      description:
        "Traditional Ethereum transaction using gasPrice. Common on L2s and older dApps.",
      gasFields: ["gasPrice", "gasLimit"],
    };
  }

  // Default to unknown if no gas fields are set
  return {
    type: "UNKNOWN",
    name: "Unknown",
    description: "Cannot determine transaction type. Verify before signing.",
    gasFields: [],
  };
}

/**
 * Calculate total gas cost for legacy transactions
 */
export function calculateLegacyGasCost(
  gasPrice: bigint | undefined,
  gasLimit: bigint | undefined
): string {
  if (!gasPrice || !gasLimit) {
    return "N/A";
  }

  try {
    const totalCost = gasPrice * gasLimit;
    return ethers.formatEther(totalCost);
  } catch (error) {
    console.error("Error calculating legacy gas cost:", error);
    return "Error";
  }
}

/**
 * Calculate total gas cost for EIP-1559 transactions
 */
export function calculateEIP1559GasCost(
  maxFeePerGas: bigint | undefined,
  gasLimit: bigint | undefined
): string {
  if (!maxFeePerGas || !gasLimit) {
    return "N/A";
  }

  try {
    const totalCost = maxFeePerGas * gasLimit;
    return ethers.formatEther(totalCost);
  } catch (error) {
    console.error("Error calculating EIP-1559 gas cost:", error);
    return "Error";
  }
}

/**
 * Format gas price for display
 */
export function formatGasPrice(
  gasPrice: bigint | undefined,
  unit: "gwei" | "wei" = "gwei"
): string {
  if (!gasPrice) {
    return "N/A";
  }

  try {
    return ethers.formatUnits(gasPrice, unit);
  } catch (error) {
    console.error("Error formatting gas price:", error);
    return "Error";
  }
}

/**
 * Check if transaction is a contract deployment
 */
export function isContractDeployment(tx: ethers.TransactionRequest): boolean {
  return !tx.to || tx.to === "0x" || tx.to === "";
}

/**
 * Check if transaction has contract interaction data
 */
export function hasContractData(tx: ethers.TransactionRequest): boolean {
  return !!(tx.data && tx.data !== "0x");
}

/**
 * Get transaction category for display
 */
export function getTransactionCategory(tx: ethers.TransactionRequest): {
  category: string;
  description: string;
  riskLevel: "low" | "medium" | "high";
} {
  if (isContractDeployment(tx)) {
    return {
      category: "Contract Deployment",
      description:
        "This transaction will deploy a new smart contract to the blockchain.",
      riskLevel: "high",
    };
  }

  if (hasContractData(tx)) {
    const value = tx.value ? BigInt(tx.value.toString()) : BigInt(0);
    if (value > BigInt(0)) {
      return {
        category: "Contract Interaction with Value",
        description:
          "This transaction calls a smart contract function and sends ETH.",
        riskLevel: "high",
      };
    }
    return {
      category: "Contract Interaction",
      description:
        "This transaction calls a smart contract function without sending ETH.",
      riskLevel: "medium",
    };
  }

  return {
    category: "Simple Transfer",
    description: "This is a basic ETH transfer to an address.",
    riskLevel: "low",
  };
}
