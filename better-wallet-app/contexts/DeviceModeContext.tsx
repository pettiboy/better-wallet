import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DeviceMode = 'hot' | 'cold' | 'setup';

interface DeviceModeContextType {
  mode: DeviceMode;
  setMode: (mode: DeviceMode) => Promise<void>;
  walletAddress: string | null;
  setWalletAddress: (address: string | null) => void;
  isLoading: boolean;
}

const DeviceModeContext = createContext<DeviceModeContextType | undefined>(
  undefined
);

const DEVICE_MODE_KEY = 'device_mode';
const WALLET_ADDRESS_KEY = 'wallet_address';

export function DeviceModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<DeviceMode>('setup');
  const [walletAddress, setWalletAddressState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDeviceMode();
  }, []);

  const loadDeviceMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(DEVICE_MODE_KEY);
      const savedAddress = await AsyncStorage.getItem(WALLET_ADDRESS_KEY);
      
      if (savedMode) {
        setModeState(savedMode as DeviceMode);
      }
      
      if (savedAddress) {
        setWalletAddressState(savedAddress);
      }
    } catch (error) {
      console.error('Error loading device mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setMode = async (newMode: DeviceMode) => {
    try {
      await AsyncStorage.setItem(DEVICE_MODE_KEY, newMode);
      setModeState(newMode);
    } catch (error) {
      console.error('Error saving device mode:', error);
      throw error;
    }
  };

  const setWalletAddress = async (address: string | null) => {
    try {
      if (address) {
        await AsyncStorage.setItem(WALLET_ADDRESS_KEY, address);
      } else {
        await AsyncStorage.removeItem(WALLET_ADDRESS_KEY);
      }
      setWalletAddressState(address);
    } catch (error) {
      console.error('Error saving wallet address:', error);
    }
  };

  return (
    <DeviceModeContext.Provider
      value={{
        mode,
        setMode,
        walletAddress,
        setWalletAddress,
        isLoading,
      }}
    >
      {children}
    </DeviceModeContext.Provider>
  );
}

export function useDeviceMode() {
  const context = useContext(DeviceModeContext);
  if (context === undefined) {
    throw new Error('useDeviceMode must be used within DeviceModeProvider');
  }
  return context;
}

