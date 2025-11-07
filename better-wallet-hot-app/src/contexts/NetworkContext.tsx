import React, { createContext, useContext, useState, useEffect } from "react";
import {
  SUPPORTED_CHAINS,
  DEFAULT_CHAIN,
  getChainById,
  type ChainConfig,
} from "../config/chains";

const STORAGE_KEY = "better-wallet-selected-chain";

interface NetworkContextType {
  selectedChain: ChainConfig;
  selectChain: (chainId: number) => void;
  getSupportedChains: () => ChainConfig[];
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [selectedChain, setSelectedChain] = useState<ChainConfig>(() => {
    // Try to load from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const chainId = parseInt(stored, 10);
        const chain = getChainById(chainId);
        if (chain) {
          return chain;
        }
      }
    } catch (error) {
      console.error("Error loading chain from localStorage:", error);
    }
    // Default to Sepolia for safety
    return DEFAULT_CHAIN;
  });

  // Persist to localStorage whenever selection changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, selectedChain.id.toString());
    } catch (error) {
      console.error("Error saving chain to localStorage:", error);
    }
  }, [selectedChain]);

  const selectChain = (chainId: number) => {
    const chain = getChainById(chainId);
    if (!chain) {
      console.error(`Chain with ID ${chainId} not found`);
      return;
    }
    setSelectedChain(chain);
  };

  const getSupportedChains = () => {
    return SUPPORTED_CHAINS;
  };

  const value: NetworkContextType = {
    selectedChain,
    selectChain,
    getSupportedChains,
  };

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error("useNetwork must be used within NetworkProvider");
  }
  return context;
}
