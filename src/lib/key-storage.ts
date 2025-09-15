import { SignatureCrypto, type UserKeys } from './crypto';

interface StoredKeys {
  keys: UserKeys;
  walletAddress: string;
  timestamp: number;
  expiresAt: number;
}

interface EncryptedStoredKeys {
  encryptedData: string;
  nonce: string;
  walletAddress: string;
  expiresAt: number;
}

export class KeyStorageManager {
  private static readonly STORAGE_KEY = 'blanc_encrypted_keys';
  private static readonly DEFAULT_EXPIRY_HOURS = 24; // 24 hours
  private crypto: SignatureCrypto;

  constructor() {
    this.crypto = new SignatureCrypto();
  }

  async init() {
    await this.crypto.init();
  }

  /**
   * Store encrypted keys in localStorage
   */
  async storeKeys(
    keys: UserKeys,
    walletAddress: string,
    sessionPassword: string,
    expiryHours: number = KeyStorageManager.DEFAULT_EXPIRY_HOURS
  ): Promise<void> {
    if (typeof window === 'undefined') return; // Server-side guard

    try {
      await this.init();

      const now = Date.now();
      const expiresAt = now + (expiryHours * 60 * 60 * 1000);

      const dataToStore: StoredKeys = {
        keys,
        walletAddress: walletAddress.toLowerCase(),
        timestamp: now,
        expiresAt,
      };

      // Derive encryption key from session password + wallet address
      const encryptionKey = await this.deriveStorageKey(sessionPassword, walletAddress);

      // Encrypt the keys
      const encrypted = this.crypto.encryptSymmetric(
        JSON.stringify(dataToStore),
        encryptionKey
      );

      const encryptedStorage: EncryptedStoredKeys = {
        encryptedData: encrypted.ciphertext,
        nonce: encrypted.nonce,
        walletAddress: walletAddress.toLowerCase(),
        expiresAt,
      };

      localStorage.setItem(KeyStorageManager.STORAGE_KEY, JSON.stringify(encryptedStorage));

      console.log(`Keys stored securely, expires in ${expiryHours} hours`);
    } catch (error) {
      console.error('Failed to store keys:', error);
      throw new Error('Failed to store encryption keys securely');
    }
  }

  /**
   * Retrieve and decrypt keys from localStorage
   */
  async retrieveKeys(walletAddress: string, sessionPassword: string): Promise<UserKeys | null> {
    if (typeof window === 'undefined') return null; // Server-side guard

    try {
      await this.init();

      const stored = localStorage.getItem(KeyStorageManager.STORAGE_KEY);
      if (!stored) {
        console.log('No stored keys found');
        return null;
      }

      const encryptedStorage: EncryptedStoredKeys = JSON.parse(stored);

      // Check if keys are for the current wallet
      if (encryptedStorage.walletAddress !== walletAddress.toLowerCase()) {
        console.log('Stored keys are for different wallet, clearing storage');
        this.clearStoredKeys();
        return null;
      }

      // Check if keys have expired
      if (Date.now() > encryptedStorage.expiresAt) {
        console.log('Stored keys have expired, clearing storage');
        this.clearStoredKeys();
        return null;
      }

      // Derive the same encryption key
      const encryptionKey = await this.deriveStorageKey(sessionPassword, walletAddress);

      // Decrypt the keys
      const decrypted = this.crypto.decryptSymmetric(
        {
          ciphertext: encryptedStorage.encryptedData,
          nonce: encryptedStorage.nonce,
        },
        encryptionKey
      );

      const storedData: StoredKeys = JSON.parse(decrypted);

      console.log('Successfully retrieved stored keys');
      return storedData.keys;

    } catch (error) {
      console.error('Failed to retrieve stored keys:', error);
      // Clear corrupted storage
      this.clearStoredKeys();
      return null;
    }
  }

  /**
   * Check if valid keys exist for the given wallet
   */
  hasValidKeys(walletAddress: string): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const stored = localStorage.getItem(KeyStorageManager.STORAGE_KEY);
      if (!stored) return false;

      const encryptedStorage: EncryptedStoredKeys = JSON.parse(stored);

      // Check wallet match and expiration
      return encryptedStorage.walletAddress === walletAddress.toLowerCase() &&
             Date.now() < encryptedStorage.expiresAt;
    } catch {
      return false;
    }
  }

  /**
   * Clear stored keys
   */
  clearStoredKeys(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KeyStorageManager.STORAGE_KEY);
    console.log('Stored keys cleared');
  }

  /**
   * Get expiration info for stored keys
   */
  getKeyInfo(walletAddress: string): { expiresAt: number; hoursRemaining: number } | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(KeyStorageManager.STORAGE_KEY);
      if (!stored) return null;

      const encryptedStorage: EncryptedStoredKeys = JSON.parse(stored);

      if (encryptedStorage.walletAddress !== walletAddress.toLowerCase()) {
        return null;
      }

      const hoursRemaining = Math.max(0, (encryptedStorage.expiresAt - Date.now()) / (1000 * 60 * 60));

      return {
        expiresAt: encryptedStorage.expiresAt,
        hoursRemaining: Math.round(hoursRemaining * 10) / 10, // Round to 1 decimal
      };
    } catch {
      return null;
    }
  }

  /**
   * Extend the expiration of stored keys
   */
  async extendKeyExpiration(
    walletAddress: string,
    sessionPassword: string,
    additionalHours: number = 24
  ): Promise<boolean> {
    try {
      const keys = await this.retrieveKeys(walletAddress, sessionPassword);
      if (!keys) return false;

      // Re-store with extended expiration
      await this.storeKeys(keys, walletAddress, sessionPassword, additionalHours);
      return true;
    } catch (error) {
      console.error('Failed to extend key expiration:', error);
      return false;
    }
  }

  /**
   * Derive a storage encryption key from session password and wallet address
   */
  private async deriveStorageKey(sessionPassword: string, walletAddress: string): Promise<string> {
    // Use HKDF to derive a key from session password + wallet address
    const salt = `blanc_storage_${walletAddress.toLowerCase()}`;
    const info = 'key_storage_encryption';

    // Create a consistent input for key derivation
    const input = sessionPassword + walletAddress.toLowerCase() + salt;

    // Use the existing HKDF method from SignatureCrypto
    const { keys } = await this.crypto.deriveKeysFromSignature(input, salt, info);
    return keys.encryptionKey;
  }
}
