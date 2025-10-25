export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  isNative?: boolean;
}

/**
 * Supported tokens on Sepolia testnet
 */
export const SUPPORTED_TOKENS: TokenInfo[] = [
  {
    symbol: "PYUSD",
    name: "PayPal USD",
    address: "0xcac524bca292aaade2df8a05cc58f0a65b1b3bb9",
    decimals: 6, // PYUSD typically uses 6 decimals
    isNative: false,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x0", // Native ETH, not a contract
    decimals: 18,
    isNative: true,
  },
];

/**
 * Get token by symbol
 */
export function getTokenBySymbol(symbol: string): TokenInfo | undefined {
  return SUPPORTED_TOKENS.find(
    (token) => token.symbol.toLowerCase() === symbol.toLowerCase()
  );
}

/**
 * Get token by address
 */
export function getTokenByAddress(address: string): TokenInfo | undefined {
  return SUPPORTED_TOKENS.find(
    (token) => token.address.toLowerCase() === address.toLowerCase()
  );
}
