import React, { createContext, useContext, useState, useEffect } from "react";
import { type TokenInfo } from "../config/tokens";

const STORAGE_KEY = "better-wallet-custom-tokens";

interface TokensByChain {
  [chainId: number]: TokenInfo[];
}

interface TokenContextType {
  addCustomToken: (chainId: number, token: TokenInfo) => void;
  removeCustomToken: (chainId: number, tokenAddress: string) => void;
  getTokensForChain: (chainId: number) => TokenInfo[];
  hasToken: (chainId: number, tokenAddress: string) => boolean;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const [tokensByChain, setTokensByChain] = useState<TokensByChain>(() => {
    // Try to load from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error loading tokens from localStorage:", error);
    }
    return {};
  });

  // Persist to localStorage whenever tokens change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tokensByChain));
    } catch (error) {
      console.error("Error saving tokens to localStorage:", error);
    }
  }, [tokensByChain]);

  const addCustomToken = (chainId: number, token: TokenInfo) => {
    setTokensByChain((prev) => {
      const chainTokens = prev[chainId] || [];

      // Check if token already exists
      const exists = chainTokens.some(
        (t) => t.address.toLowerCase() === token.address.toLowerCase()
      );

      if (exists) {
        console.warn("Token already exists for this chain");
        return prev;
      }

      return {
        ...prev,
        [chainId]: [...chainTokens, token],
      };
    });
  };

  const removeCustomToken = (chainId: number, tokenAddress: string) => {
    setTokensByChain((prev) => {
      const chainTokens = prev[chainId] || [];
      const filtered = chainTokens.filter(
        (t) => t.address.toLowerCase() !== tokenAddress.toLowerCase()
      );

      if (filtered.length === 0) {
        // Remove the chain entry if no tokens left
        const newState = { ...prev };
        delete newState[chainId];
        return newState;
      }

      return {
        ...prev,
        [chainId]: filtered,
      };
    });
  };

  const getTokensForChain = (chainId: number): TokenInfo[] => {
    return tokensByChain[chainId] || [];
  };

  const hasToken = (chainId: number, tokenAddress: string): boolean => {
    const chainTokens = tokensByChain[chainId] || [];
    return chainTokens.some(
      (t) => t.address.toLowerCase() === tokenAddress.toLowerCase()
    );
  };

  const value: TokenContextType = {
    addCustomToken,
    removeCustomToken,
    getTokensForChain,
    hasToken,
  };

  return (
    <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
  );
}

export function useTokens() {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error("useTokens must be used within TokenProvider");
  }
  return context;
}
