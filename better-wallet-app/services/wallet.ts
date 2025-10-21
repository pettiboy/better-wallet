import * as SecureStore from 'expo-secure-store';
import { ethers } from 'ethers';

const PRIVATE_KEY_STORAGE_KEY = 'wallet_private_key';
const MNEMONIC_STORAGE_KEY = 'wallet_mnemonic';

/**
 * Generate a new Ethereum wallet with mnemonic
 */
export async function generateWallet(): Promise<{
  address: string;
  mnemonic: string;
  privateKey: string;
}> {
  const wallet = ethers.Wallet.createRandom();
  
  return {
    address: wallet.address,
    mnemonic: wallet.mnemonic?.phrase || '',
    privateKey: wallet.privateKey,
  };
}

/**
 * Store private key and mnemonic securely (cold device only)
 */
export async function storePrivateKey(
  privateKey: string,
  mnemonic: string
): Promise<void> {
  await SecureStore.setItemAsync(PRIVATE_KEY_STORAGE_KEY, privateKey);
  await SecureStore.setItemAsync(MNEMONIC_STORAGE_KEY, mnemonic);
}

/**
 * Load private key from secure storage
 */
export async function loadPrivateKey(): Promise<string | null> {
  return await SecureStore.getItemAsync(PRIVATE_KEY_STORAGE_KEY);
}

/**
 * Load mnemonic from secure storage
 */
export async function loadMnemonic(): Promise<string | null> {
  return await SecureStore.getItemAsync(MNEMONIC_STORAGE_KEY);
}

/**
 * Get Ethereum address from private key
 */
export function getAddress(privateKey: string): string {
  const wallet = new ethers.Wallet(privateKey);
  return wallet.address;
}

/**
 * Sign a transaction with the stored private key
 */
export async function signTransaction(
  unsignedTx: ethers.TransactionRequest,
  privateKey: string
): Promise<string> {
  const wallet = new ethers.Wallet(privateKey);
  const signedTx = await wallet.signTransaction(unsignedTx);
  return signedTx;
}

/**
 * Check if a wallet exists in secure storage
 */
export async function hasWallet(): Promise<boolean> {
  const privateKey = await loadPrivateKey();
  return privateKey !== null;
}

/**
 * Delete wallet from secure storage (use with caution)
 */
export async function deleteWallet(): Promise<void> {
  await SecureStore.deleteItemAsync(PRIVATE_KEY_STORAGE_KEY);
  await SecureStore.deleteItemAsync(MNEMONIC_STORAGE_KEY);
}

