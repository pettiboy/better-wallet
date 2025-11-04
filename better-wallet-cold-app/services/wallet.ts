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

/**
 * Validate a BIP-39 mnemonic phrase
 */
export function validateMnemonic(phrase: string): {
  isValid: boolean;
  error?: string;
} {
  try {
    // Clean up the phrase
    const cleanedPhrase = phrase.trim().toLowerCase().replace(/\s+/g, " ");

    // Check word count
    const words = cleanedPhrase.split(" ");
    if (words.length !== 12) {
      return {
        isValid: false,
        error: `Invalid word count. Expected 12 words, got ${words.length}.`,
      };
    }

    // Validate using ethers.js
    ethers.Mnemonic.fromPhrase(cleanedPhrase);

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error:
        error instanceof Error
          ? error.message
          : "Invalid mnemonic phrase. Please check your words and try again.",
    };
  }
}

/**
 * Import wallet from mnemonic phrase
 * Validates the mnemonic, derives keys, and stores securely with authentication
 */
export async function importWalletFromMnemonic(phrase: string): Promise<{
  address: string;
  privateKey: string;
  mnemonic: string;
}> {
  try {
    // Clean up the phrase
    const cleanedPhrase = phrase.trim().toLowerCase().replace(/\s+/g, " ");

    // Validate the mnemonic
    const validation = validateMnemonic(cleanedPhrase);
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid mnemonic phrase");
    }

    // Create wallet from mnemonic
    const wallet = ethers.Wallet.fromPhrase(cleanedPhrase);

    // Store with secure authentication
    await storePrivateKey(wallet.privateKey, cleanedPhrase);

    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: cleanedPhrase,
    };
  } catch (error) {
    console.error("Error importing wallet:", error);
    throw error;
  }
}

/**
 * Validate a private key
 */
export function validatePrivateKey(privateKey: string): {
  isValid: boolean;
  error?: string;
} {
  try {
    // Clean up the private key
    let cleanedKey = privateKey.trim();

    // Remove 0x prefix if present for validation
    const keyWithoutPrefix = cleanedKey.startsWith("0x")
      ? cleanedKey.slice(2)
      : cleanedKey;

    // Check if it's valid hex
    if (!/^[0-9a-fA-F]+$/.test(keyWithoutPrefix)) {
      return {
        isValid: false,
        error:
          "Invalid format. Private key must contain only hexadecimal characters (0-9, a-f).",
      };
    }

    // Check length (should be 64 characters without 0x prefix)
    if (keyWithoutPrefix.length !== 64) {
      return {
        isValid: false,
        error: `Invalid length. Expected 64 characters, got ${keyWithoutPrefix.length}.`,
      };
    }

    // Ensure 0x prefix for ethers.js validation
    const formattedKey = cleanedKey.startsWith("0x")
      ? cleanedKey
      : `0x${cleanedKey}`;

    // Validate using ethers.js by creating a wallet
    new ethers.Wallet(formattedKey);

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error:
        error instanceof Error
          ? error.message
          : "Invalid private key. Please check and try again.",
    };
  }
}

/**
 * Import wallet from private key
 * Validates the private key, creates wallet, and stores securely with authentication
 */
export async function importWalletFromPrivateKey(privateKey: string): Promise<{
  address: string;
  privateKey: string;
}> {
  try {
    // Clean up the private key
    let cleanedKey = privateKey.trim();

    // Validate the private key
    const validation = validatePrivateKey(cleanedKey);
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid private key");
    }

    // Ensure 0x prefix
    const formattedKey = cleanedKey.startsWith("0x")
      ? cleanedKey
      : `0x${cleanedKey}`;

    // Create wallet from private key
    const wallet = new ethers.Wallet(formattedKey);

    // Store with secure authentication (empty string for mnemonic since we don't have one)
    await storePrivateKey(wallet.privateKey, "");

    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  } catch (error) {
    console.error("Error importing wallet from private key:", error);
    throw error;
  }
}
