import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { hasWallet, loadPrivateKey, getAddress } from "@/services/wallet";

export interface WalletState {
  address: string | null;
  hasWallet: boolean;
  isLoading: boolean;
  isSetupComplete: boolean;
}

interface WalletContextType extends WalletState {
  setWalletAddress: (address: string) => void;
  markSetupComplete: () => void;
  resetWallet: () => void;
  reloadWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [hasWalletStored, setHasWalletStored] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  useEffect(() => {
    loadWalletInfo();
  }, []);

  const loadWalletInfo = async () => {
    try {
      setIsLoading(true);

      const walletExists = await hasWallet();
      setHasWalletStored(walletExists);

      if (walletExists) {
        const privateKey = await loadPrivateKey();
        if (privateKey) {
          const walletAddress = getAddress(privateKey);
          setAddress(walletAddress);
          setIsSetupComplete(true);
        }
      }
    } catch (error) {
      console.error("Error loading wallet info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setWalletAddress = (newAddress: string) => {
    setAddress(newAddress);
    setHasWalletStored(true);
  };

  const markSetupComplete = () => {
    setIsSetupComplete(true);
  };

  const resetWallet = () => {
    setAddress(null);
    setHasWalletStored(false);
    setIsSetupComplete(false);
  };

  const reloadWallet = () => {
    loadWalletInfo();
  };

  const value: WalletContextType = {
    address,
    hasWallet: hasWalletStored,
    isLoading,
    isSetupComplete,
    setWalletAddress,
    markSetupComplete,
    resetWallet,
    reloadWallet,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
