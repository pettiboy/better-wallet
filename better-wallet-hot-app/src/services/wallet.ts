import { ethers } from "ethers";

const PRIVATE_KEY_STORAGE_KEY = "wallet_private_key";
const MNEMONIC_STORAGE_KEY = "wallet_mnemonic";

/**
 * Encrypt data using Web Crypto API
 */
async function encryptData(data: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const passwordBuffer = encoder.encode(password);
  
  // Derive key from password
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    dataBuffer
  );
  
  // Combine salt + iv + encrypted data
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt data using Web Crypto API
 */
async function decryptData(encryptedData: string, password: string): Promise<string> {
  const decoder = new TextDecoder();
  const combined = new Uint8Array(
    atob(encryptedData).split('').map(char => char.charCodeAt(0))
  );
  
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const encrypted = combined.slice(28);
  
  const passwordBuffer = new TextEncoder().encode(password);
  
  // Derive key from password
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encrypted
  );
  
  return decoder.decode(decrypted);
}

/**
 * Generate a new Ethereum wallet with mnemonic
 */
export async function generateWallet(): Promise<{
  address: string;
  mnemonic: string;
  privateKey: string;
}> {
  try {
    // Use ethers' built-in random wallet generation
    const wallet = ethers.Wallet.createRandom();

    return {
      address: wallet.address,
      mnemonic: wallet.mnemonic?.phrase || "",
      privateKey: wallet.privateKey,
    };
  } catch (error) {
    // Fallback: Generate using crypto.getRandomValues
    console.log("Using crypto.getRandomValues fallback for wallet generation");
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const randomHex = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const privateKey = "0x" + randomHex;

    const wallet = new ethers.Wallet(privateKey);

    // Note: This fallback doesn't generate a mnemonic
    return {
      address: wallet.address,
      mnemonic: "Generated without mnemonic (using fallback method)",
      privateKey: wallet.privateKey,
    };
  }
}

/**
 * Store private key and mnemonic securely (cold device only)
 */
export async function storePrivateKey(
  privateKey: string,
  mnemonic: string
): Promise<void> {
  try {
    // Use a simple password derived from browser fingerprint
    const password = await getBrowserFingerprint();
    
    const encryptedPrivateKey = await encryptData(privateKey, password);
    const encryptedMnemonic = await encryptData(mnemonic, password);
    
    localStorage.setItem(PRIVATE_KEY_STORAGE_KEY, encryptedPrivateKey);
    localStorage.setItem(MNEMONIC_STORAGE_KEY, encryptedMnemonic);
  } catch (error) {
    console.error("Error storing private key:", error);
    throw new Error("Failed to store private key securely");
  }
}

/**
 * Load private key from secure storage
 */
export async function loadPrivateKey(): Promise<string | null> {
  try {
    const encryptedPrivateKey = localStorage.getItem(PRIVATE_KEY_STORAGE_KEY);
    if (!encryptedPrivateKey) return null;
    
    const password = await getBrowserFingerprint();
    return await decryptData(encryptedPrivateKey, password);
  } catch (error) {
    console.error("Error loading private key:", error);
    return null;
  }
}

/**
 * Load mnemonic from secure storage
 */
export async function loadMnemonic(): Promise<string | null> {
  try {
    const encryptedMnemonic = localStorage.getItem(MNEMONIC_STORAGE_KEY);
    if (!encryptedMnemonic) return null;
    
    const password = await getBrowserFingerprint();
    return await decryptData(encryptedMnemonic, password);
  } catch (error) {
    console.error("Error loading mnemonic:", error);
    return null;
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
 */
export async function hasWallet(): Promise<boolean> {
  const privateKey = await loadPrivateKey();
  return privateKey !== null;
}

/**
 * Delete wallet from secure storage (use with caution)
 */
export async function deleteWallet(): Promise<void> {
  localStorage.removeItem(PRIVATE_KEY_STORAGE_KEY);
  localStorage.removeItem(MNEMONIC_STORAGE_KEY);
}

/**
 * Generate a browser fingerprint for encryption key derivation
 */
async function getBrowserFingerprint(): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Hash the fingerprint
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprint);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
