import { ethers } from "ethers";

export interface ERC20Transfer {
  type: "transfer" | "approve" | "unknown";
  tokenAddress: string;
  to: string;
  amount: string;
  spender?: string; // For approve transactions
}

export interface ContractDataBreakdown {
  functionSelector: string;
  functionName: string;
  parameterCount: number;
  parameters: string[];
  rawData: string;
  dataSize: number;
}

/**
 * Detect ERC-20 token transfers from transaction data
 */
export function detectERC20Transfer(data: string): ERC20Transfer | null {
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
        return parseTransferData(data);
      case APPROVE_SIGNATURE:
        return parseApproveData(data);
      case TRANSFER_FROM_SIGNATURE:
        return parseTransferFromData(data);
      default:
        return {
          type: "unknown",
          tokenAddress: "Unknown",
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
function parseTransferData(data: string): ERC20Transfer {
  try {
    // Remove function signature (first 10 chars)
    const params = data.substring(10);

    // Each parameter is 32 bytes (64 hex chars)
    const toAddress = "0x" + params.substring(24, 64); // Remove padding
    const amountHex = params.substring(64, 128);
    const amount = BigInt("0x" + amountHex).toString();

    return {
      type: "transfer",
      tokenAddress: "Contract Address", // We don't have the contract address in the data
      to: toAddress,
      amount: amount,
    };
  } catch (error) {
    console.error("Error parsing transfer data:", error);
    return {
      type: "unknown",
      tokenAddress: "Unknown",
      to: "Unknown",
      amount: "Unknown",
    };
  }
}

/**
 * Parse approve(address,uint256) data
 */
function parseApproveData(data: string): ERC20Transfer {
  try {
    const params = data.substring(10);

    const spenderAddress = "0x" + params.substring(24, 64);
    const amountHex = params.substring(64, 128);
    const amount = BigInt("0x" + amountHex).toString();

    return {
      type: "approve",
      tokenAddress: "Contract Address",
      to: spenderAddress,
      amount: amount,
      spender: spenderAddress,
    };
  } catch (error) {
    console.error("Error parsing approve data:", error);
    return {
      type: "unknown",
      tokenAddress: "Unknown",
      to: "Unknown",
      amount: "Unknown",
    };
  }
}

/**
 * Parse transferFrom(address,address,uint256) data
 */
function parseTransferFromData(data: string): ERC20Transfer {
  try {
    const params = data.substring(10);

    const toAddress = "0x" + params.substring(88, 128);
    const amountHex = params.substring(128, 192);
    const amount = BigInt("0x" + amountHex).toString();

    return {
      type: "transfer",
      tokenAddress: "Contract Address",
      to: toAddress,
      amount: amount,
    };
  } catch (error) {
    console.error("Error parsing transferFrom data:", error);
    return {
      type: "unknown",
      tokenAddress: "Unknown",
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
    // ERC-20 Standard
    "0xa9059cbb": "transfer",
    "0x095ea7b3": "approve",
    "0x23b872dd": "transferFrom",
    "0x70a08231": "balanceOf",
    "0x18160ddd": "totalSupply",
    "0x06fdde03": "name",
    "0x95d89b41": "symbol",
    "0x313ce567": "decimals",
    // ERC-20 Extensions
    "0x39509351": "increaseAllowance",
    "0xa457c2d7": "decreaseAllowance",
    "0x40c10f19": "mint",
    "0x42966c68": "burn",
    "0xd505accf": "permit", // EIP-2612
    // Common DeFi
    "0x7ff36ab5": "swapExactETHForTokens", // Uniswap V2
    "0x38ed1739": "swapExactTokensForTokens", // Uniswap V2
    "0xb6f9de95": "swapExactETHForTokensSupportingFeeOnTransferTokens",
    "0x5c11d795": "swapExactTokensForTokensSupportingFeeOnTransferTokens",
    "0xd0e30db0": "deposit", // WETH
    "0x2e1a7d4d": "withdraw", // WETH
    // ERC-721
    "0x42842e0e": "safeTransferFrom", // ERC-721
    "0xb88d4fde": "safeTransferFrom", // ERC-721 with data
    // ERC-1155
    "0xf242432a": "safeTransferFrom", // ERC-1155
    "0x2eb2c2d6": "safeBatchTransferFrom", // ERC-1155
  };

  return functionNames[signature] || "unknown";
}

/**
 * Break down contract call data into readable components
 */
export function breakdownContractData(data: string): ContractDataBreakdown {
  if (!data || data === "0x") {
    return {
      functionSelector: "0x",
      functionName: "none",
      parameterCount: 0,
      parameters: [],
      rawData: data,
      dataSize: 0,
    };
  }

  const functionSelector = data.substring(0, 10);
  const functionName = getFunctionName(functionSelector);
  const parameterData = data.substring(10);

  // Each parameter is 32 bytes (64 hex characters)
  const parameterCount = Math.floor(parameterData.length / 64);
  const parameters: string[] = [];

  for (let i = 0; i < parameterCount; i++) {
    const paramHex = parameterData.substring(i * 64, (i + 1) * 64);
    parameters.push("0x" + paramHex);
  }

  // Handle remaining data that doesn't fit in 32-byte chunks
  const remainingData = parameterData.substring(parameterCount * 64);
  if (remainingData.length > 0) {
    parameters.push("0x" + remainingData + " (partial)");
  }

  return {
    functionSelector,
    functionName,
    parameterCount,
    parameters,
    rawData: data,
    dataSize: (data.length - 2) / 2, // Convert hex length to bytes
  };
}

/**
 * Format parameter for display with type detection
 */
export function formatParameter(param: string, index: number): string {
  try {
    // Remove 0x prefix for processing
    const hex = param.startsWith("0x") ? param.substring(2) : param;

    // Try to detect if it's an address (20 bytes with leading zeros)
    if (hex.length === 64 && hex.substring(0, 24) === "0".repeat(24)) {
      const address = "0x" + hex.substring(24);
      return `Address: ${address}`;
    }

    // Try to detect if it's a number
    try {
      const value = BigInt("0x" + hex);
      if (value < BigInt(10 ** 15)) {
        // Small numbers, show as decimal
        return `Number: ${value.toString()}`;
      } else {
        // Large numbers, show both decimal and hex
        return `Number: ${value.toString()} (0x${hex})`;
      }
    } catch {
      // Not a valid number, show as hex
      return `Hex: 0x${hex}`;
    }
  } catch (error: unknown) {
    console.error("Error formatting parameter:", error);
    return param;
  }
}
