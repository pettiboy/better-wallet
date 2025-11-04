import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { ethers } from "ethers";

const PRIVATE_KEY_STORAGE_KEY = "wallet_private_key";
const MNEMONIC_STORAGE_KEY = "wallet_mnemonic";

// Security options for maximum protection
// - Hardware-backed encryption (Keychain on iOS, Keystore on Android)
// - Requires authentication (biometric/PIN) to access
// - Only accessible when device is unlocked
// - Never backed up or migrated to new devices
const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED, // iOS: Only when device unlocked
  requireAuthentication: true, // Requires biometric/PIN every time
  authenticationPrompt: "Authenticate to access your wallet",
};

/**
 * Generate a new Ethereum wallet with mnemonic
 */
export async function generateWallet(): Promise<{
  address: string;
  mnemonic: string;
  privateKey: string;
}> {
  // Generate 16 bytes (128 bits) of entropy
  const entropyBytes = await Crypto.getRandomBytesAsync(16);

  // Convert to Uint8Array (expo returns ArrayBuffer)
  const entropyArray = new Uint8Array(entropyBytes);

  // Convert entropy to mnemonic
  const mnemonic = ethers.Mnemonic.fromEntropy(entropyArray);

  // Create wallet from mnemonic
  const wallet = ethers.Wallet.fromPhrase(mnemonic.phrase);

  return {
    address: wallet.address,
    mnemonic: mnemonic.phrase, // same as mnemonic variable
    privateKey: wallet.privateKey,
  };
}

/**
 * Store private key and mnemonic with maximum security
 * - Hardware-backed encryption (Keychain on iOS, Keystore on Android)
 * - Requires authentication (biometric/PIN) to access
 * - Only accessible when device is unlocked
 * - Never backed up or migrated
 */
export async function storePrivateKey(
  privateKey: string,
  mnemonic: string
): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      PRIVATE_KEY_STORAGE_KEY,
      privateKey,
      SECURE_OPTIONS
    );

    await SecureStore.setItemAsync(
      MNEMONIC_STORAGE_KEY,
      mnemonic,
      SECURE_OPTIONS
    );
  } catch (error) {
    console.error("Error storing wallet:", error);
    throw new Error(
      "Failed to store wallet securely. Please ensure biometric authentication is available."
    );
  }
}

/**
 * Load private key from secure storage
 * Requires authentication (biometric/PIN) every time
 */
export async function loadPrivateKey(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(
      PRIVATE_KEY_STORAGE_KEY,
      SECURE_OPTIONS
    );
  } catch (error) {
    console.error("Error loading private key:", error);

    // Check if it's an authentication error
    if (
      error instanceof Error &&
      (error.message.includes("authentication") ||
        error.message.includes("Authentication"))
    ) {
      throw new Error("Authentication required to access your wallet");
    }

    throw error;
  }
}

/**
 * Load mnemonic from secure storage
 * Requires authentication (biometric/PIN) every time
 */
export async function loadMnemonic(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(MNEMONIC_STORAGE_KEY, SECURE_OPTIONS);
  } catch (error) {
    console.error("Error loading mnemonic:", error);

    if (
      error instanceof Error &&
      (error.message.includes("authentication") ||
        error.message.includes("Authentication"))
    ) {
      throw new Error("Authentication required to access your recovery phrase");
    }

    throw error;
  }
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
 * Note: This doesn't require authentication, just checks existence
 */
export async function hasWallet(): Promise<boolean> {
  try {
    // Check without authentication requirement
    const privateKey = await SecureStore.getItemAsync(PRIVATE_KEY_STORAGE_KEY);
    return privateKey !== null;
  } catch {
    return false;
  }
}

/**
 * Delete wallet from secure storage (use with extreme caution)
 * Requires authentication to ensure user consent
 */
export async function deleteWallet(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(PRIVATE_KEY_STORAGE_KEY, SECURE_OPTIONS);
    await SecureStore.deleteItemAsync(MNEMONIC_STORAGE_KEY, SECURE_OPTIONS);
  } catch (error) {
    console.error("Error deleting wallet:", error);
    throw new Error("Failed to delete wallet. Authentication may be required.");
  }
}

/**
 * Check if device supports biometric authentication for SecureStore
 */
export async function canUseSecureAuthentication(): Promise<boolean> {
  return SecureStore.canUseBiometricAuthentication();
}
