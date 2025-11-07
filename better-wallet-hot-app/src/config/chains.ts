export interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

export interface ChainConfig {
  id: number;
  name: string;
  network: string;
  rpcUrl: string;
  blockExplorer: string;
  blockscoutUrl?: string;
  nativeCurrency: NativeCurrency;
  testnet: boolean;
}

/**
 * Comprehensive list of EVM chains supported by Blockscout
 */
export const SUPPORTED_CHAINS: ChainConfig[] = [
  // Ethereum Mainnet
  {
    id: 1,
    name: "Ethereum",
    network: "mainnet",
    rpcUrl: "https://eth.llamarpc.com",
    blockExplorer: "https://etherscan.io",
    blockscoutUrl: "https://eth.blockscout.com",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    testnet: false,
  },
  // Ethereum Sepolia Testnet
  {
    id: 11155111,
    name: "Sepolia",
    network: "sepolia",
    rpcUrl:
      "https://eth-sepolia.g.alchemy.com/v2/QUIEJhuCFwaqG_DsrOIXeSqdCHmsYLXH",
    blockExplorer: "https://sepolia.etherscan.io",
    blockscoutUrl: "https://eth-sepolia.blockscout.com",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    testnet: true,
  },
  // Polygon Mainnet
  {
    id: 137,
    name: "Polygon",
    network: "polygon",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
    blockscoutUrl: "https://polygon.blockscout.com",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    testnet: false,
  },
  // Polygon Amoy Testnet
  {
    id: 80002,
    name: "Polygon Amoy",
    network: "amoy",
    rpcUrl: "https://rpc-amoy.polygon.technology",
    blockExplorer: "https://amoy.polygonscan.com",
    blockscoutUrl: "https://polygon-amoy.blockscout.com",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    testnet: true,
  },
  // Arbitrum One
  {
    id: 42161,
    name: "Arbitrum One",
    network: "arbitrum",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    blockExplorer: "https://arbiscan.io",
    blockscoutUrl: "https://arbitrum.blockscout.com",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    testnet: false,
  },
  // Arbitrum Sepolia
  {
    id: 421614,
    name: "Arbitrum Sepolia",
    network: "arbitrum-sepolia",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    blockExplorer: "https://sepolia.arbiscan.io",
    blockscoutUrl: "https://arbitrum-sepolia.blockscout.com",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    testnet: true,
  },
  // Optimism Mainnet
  {
    id: 10,
    name: "Optimism",
    network: "optimism",
    rpcUrl: "https://mainnet.optimism.io",
    blockExplorer: "https://optimistic.etherscan.io",
    blockscoutUrl: "https://optimism.blockscout.com",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    testnet: false,
  },
  // Optimism Sepolia
  {
    id: 11155420,
    name: "Optimism Sepolia",
    network: "optimism-sepolia",
    rpcUrl: "https://sepolia.optimism.io",
    blockExplorer: "https://sepolia-optimism.etherscan.io",
    blockscoutUrl: "https://optimism-sepolia.blockscout.com",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    testnet: true,
  },
  // Base Mainnet
  {
    id: 8453,
    name: "Base",
    network: "base",
    rpcUrl: "https://mainnet.base.org",
    blockExplorer: "https://basescan.org",
    blockscoutUrl: "https://base.blockscout.com",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    testnet: false,
  },
  // Base Sepolia
  {
    id: 84532,
    name: "Base Sepolia",
    network: "base-sepolia",
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
    blockscoutUrl: "https://base-sepolia.blockscout.com",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    testnet: true,
  },
  // BNB Smart Chain
  {
    id: 56,
    name: "BNB Smart Chain",
    network: "bsc",
    rpcUrl: "https://bsc-dataseed.binance.org",
    blockExplorer: "https://bscscan.com",
    blockscoutUrl: "https://bsc.blockscout.com",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    testnet: false,
  },
  // BNB Testnet
  {
    id: 97,
    name: "BNB Testnet",
    network: "bsc-testnet",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
    blockExplorer: "https://testnet.bscscan.com",
    blockscoutUrl: "https://bsc-testnet.blockscout.com",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    testnet: true,
  },
  // Avalanche C-Chain
  {
    id: 43114,
    name: "Avalanche C-Chain",
    network: "avalanche",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    blockExplorer: "https://snowtrace.io",
    blockscoutUrl: "https://avalanche.blockscout.com",
    nativeCurrency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18,
    },
    testnet: false,
  },
  // Avalanche Fuji Testnet
  {
    id: 43113,
    name: "Avalanche Fuji",
    network: "avalanche-fuji",
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    blockExplorer: "https://testnet.snowtrace.io",
    blockscoutUrl: "https://avalanche-fuji.blockscout.com",
    nativeCurrency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18,
    },
    testnet: true,
  },
  // Gnosis Chain
  {
    id: 100,
    name: "Gnosis",
    network: "gnosis",
    rpcUrl: "https://rpc.gnosischain.com",
    blockExplorer: "https://gnosisscan.io",
    blockscoutUrl: "https://gnosis.blockscout.com",
    nativeCurrency: {
      name: "xDAI",
      symbol: "xDAI",
      decimals: 18,
    },
    testnet: false,
  },
  // Fantom Opera
  {
    id: 250,
    name: "Fantom Opera",
    network: "fantom",
    rpcUrl: "https://rpc.ftm.tools",
    blockExplorer: "https://ftmscan.com",
    blockscoutUrl: "https://fantom.blockscout.com",
    nativeCurrency: {
      name: "FTM",
      symbol: "FTM",
      decimals: 18,
    },
    testnet: false,
  },
  // Celo Mainnet
  {
    id: 42220,
    name: "Celo",
    network: "celo",
    rpcUrl: "https://forno.celo.org",
    blockExplorer: "https://celoscan.io",
    blockscoutUrl: "https://celo.blockscout.com",
    nativeCurrency: {
      name: "CELO",
      symbol: "CELO",
      decimals: 18,
    },
    testnet: false,
  },
  // Moonbeam
  {
    id: 1284,
    name: "Moonbeam",
    network: "moonbeam",
    rpcUrl: "https://rpc.api.moonbeam.network",
    blockExplorer: "https://moonscan.io",
    blockscoutUrl: "https://moonbeam.blockscout.com",
    nativeCurrency: {
      name: "GLMR",
      symbol: "GLMR",
      decimals: 18,
    },
    testnet: false,
  },
  // Moonriver
  {
    id: 1285,
    name: "Moonriver",
    network: "moonriver",
    rpcUrl: "https://rpc.api.moonriver.moonbeam.network",
    blockExplorer: "https://moonriver.moonscan.io",
    blockscoutUrl: "https://moonriver.blockscout.com",
    nativeCurrency: {
      name: "MOVR",
      symbol: "MOVR",
      decimals: 18,
    },
    testnet: false,
  },
  // zkSync Era
  {
    id: 324,
    name: "zkSync Era",
    network: "zksync-era",
    rpcUrl: "https://mainnet.era.zksync.io",
    blockExplorer: "https://explorer.zksync.io",
    blockscoutUrl: "https://zksync.blockscout.com",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    testnet: false,
  },
  // zkSync Sepolia Testnet
  {
    id: 300,
    name: "zkSync Sepolia",
    network: "zksync-sepolia",
    rpcUrl: "https://sepolia.era.zksync.dev",
    blockExplorer: "https://sepolia.explorer.zksync.io",
    blockscoutUrl: "https://zksync-sepolia.blockscout.com",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    testnet: true,
  },
  // Linea
  {
    id: 59144,
    name: "Linea",
    network: "linea",
    rpcUrl: "https://rpc.linea.build",
    blockExplorer: "https://lineascan.build",
    blockscoutUrl: "https://linea.blockscout.com",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    testnet: false,
  },
  // Scroll
  {
    id: 534352,
    name: "Scroll",
    network: "scroll",
    rpcUrl: "https://rpc.scroll.io",
    blockExplorer: "https://scrollscan.com",
    blockscoutUrl: "https://scroll.blockscout.com",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    testnet: false,
  },
  // Scroll Sepolia
  {
    id: 534351,
    name: "Scroll Sepolia",
    network: "scroll-sepolia",
    rpcUrl: "https://sepolia-rpc.scroll.io",
    blockExplorer: "https://sepolia.scrollscan.com",
    blockscoutUrl: "https://scroll-sepolia.blockscout.com",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    testnet: true,
  },
];

/**
 * Get chain configuration by chain ID
 */
export function getChainById(chainId: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.id === chainId);
}

/**
 * Get chain configuration by network name
 */
export function getChainByName(name: string): ChainConfig | undefined {
  return SUPPORTED_CHAINS.find(
    (chain) =>
      chain.name.toLowerCase() === name.toLowerCase() ||
      chain.network.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get all mainnet chains
 */
export function getMainnetChains(): ChainConfig[] {
  return SUPPORTED_CHAINS.filter((chain) => !chain.testnet);
}

/**
 * Get all testnet chains
 */
export function getTestnetChains(): ChainConfig[] {
  return SUPPORTED_CHAINS.filter((chain) => chain.testnet);
}

/**
 * Default chain (Sepolia for safety)
 */
export const DEFAULT_CHAIN = SUPPORTED_CHAINS.find(
  (chain) => chain.id === 11155111
)!;
