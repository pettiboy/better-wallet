export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  isNative?: boolean;
}

/**
 * Default supported tokens (native currency for each chain)
 */
export const SUPPORTED_TOKENS: TokenInfo[] = [
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
