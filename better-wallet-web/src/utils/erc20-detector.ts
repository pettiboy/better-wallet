import { ethers } from "ethers";

export interface ERC20Transfer {
  type: "transfer" | "approve" | "unknown";
  tokenAddress: string;
  to: string;
  amount: string;
  spender?: string; // For approve transactions
}

/**
 * Detect ERC-20 token transfers from transaction data
 */
export function detectERC20Transfer(
  data: string,
  contractAddress: string
): ERC20Transfer | null {
  if (!data || data === "0x") {
    return null;
  }

  try {
    // Common ERC-20 function signatures
    const TRANSFER_SIGNATURE = "0xa9059cbb"; // transfer(address,uint256)
    const APPROVE_SIGNATURE = "0x095ea7b3"; // approve(address,uint256)
    const TRANSFER_FROM_SIGNATURE = "0x23b872dd"; // transferFrom(address,address,uint256)

    const functionSignature = data.substring(0, 10);

    switch (functionSignature) {
      case TRANSFER_SIGNATURE:
        return parseTransferData(data, contractAddress);
      case APPROVE_SIGNATURE:
        return parseApproveData(data, contractAddress);
      case TRANSFER_FROM_SIGNATURE:
        return parseTransferFromData(data, contractAddress);
      default:
        return {
          type: "unknown",
          tokenAddress: contractAddress,
          to: "Unknown",
          amount: "Unknown",
        };
    }
  } catch (error) {
    console.error("Error detecting ERC-20 transfer:", error);
    return null;
  }
}

/**
 * Parse transfer(address,uint256) data
 */
function parseTransferData(data: string, tokenAddress: string): ERC20Transfer {
  try {
    // Remove function signature (first 10 chars)
    const params = data.substring(10);

    // Each parameter is 32 bytes (64 hex chars)
    const toAddress = "0x" + params.substring(24, 64); // Remove padding
    const amountHex = params.substring(64, 128);
    const amount = BigInt("0x" + amountHex).toString();

    return {
      type: "transfer",
      tokenAddress,
      to: toAddress,
      amount: amount,
    };
  } catch (error) {
    console.error("Error parsing transfer data:", error);
    return {
      type: "unknown",
      tokenAddress,
      to: "Unknown",
      amount: "Unknown",
    };
  }
}

/**
 * Parse approve(address,uint256) data
 */
function parseApproveData(data: string, tokenAddress: string): ERC20Transfer {
  try {
    const params = data.substring(10);

    const spenderAddress = "0x" + params.substring(24, 64);
    const amountHex = params.substring(64, 128);
    const amount = BigInt("0x" + amountHex).toString();

    return {
      type: "approve",
      tokenAddress,
      to: spenderAddress,
      amount: amount,
      spender: spenderAddress,
    };
  } catch (error) {
    console.error("Error parsing approve data:", error);
    return {
      type: "unknown",
      tokenAddress,
      to: "Unknown",
      amount: "Unknown",
    };
  }
}

/**
 * Parse transferFrom(address,address,uint256) data
 */
function parseTransferFromData(
  data: string,
  tokenAddress: string
): ERC20Transfer {
  try {
    const params = data.substring(10);

    const toAddress = "0x" + params.substring(88, 128);
    const amountHex = params.substring(128, 192);
    const amount = BigInt("0x" + amountHex).toString();

    return {
      type: "transfer",
      tokenAddress,
      to: toAddress,
      amount: amount,
    };
  } catch (error) {
    console.error("Error parsing transferFrom data:", error);
    return {
      type: "unknown",
      tokenAddress,
      to: "Unknown",
      amount: "Unknown",
    };
  }
}

/**
 * Format token amount for display
 */
export function formatTokenAmount(
  amount: string,
  decimals: number = 18
): string {
  try {
    const formatted = ethers.formatUnits(amount, decimals);
    return formatted;
  } catch (error) {
    console.error("Error formatting token amount:", error);
    return amount;
  }
}

/**
 * Get function name from signature
 */
export function getFunctionName(signature: string): string {
  const functionNames: { [key: string]: string } = {
    "0xa9059cbb": "transfer",
    "0x095ea7b3": "approve",
    "0x23b872dd": "transferFrom",
    "0x70a08231": "balanceOf",
    "0x18160ddd": "totalSupply",
    "0x06fdde03": "name",
    "0x95d89b41": "symbol",
    "0x313ce567": "decimals",
  };

  return functionNames[signature] || "unknown";
}

/**
 * Check if transaction data is an ERC20 transaction
 */
export function isERC20Transaction(data: string | undefined): boolean {
  if (!data || data === "0x" || data === "0x0") {
    return false;
  }

  const signature = data.substring(0, 10);
  const knownSignatures = [
    "0xa9059cbb", // transfer
    "0x095ea7b3", // approve
    "0x23b872dd", // transferFrom
  ];

  return knownSignatures.includes(signature);
}
