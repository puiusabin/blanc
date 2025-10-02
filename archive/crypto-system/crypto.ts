// ============================================
// SIGNATURE-BASED KEY DERIVATION WITH TWEETNACL
// ============================================

import * as nacl from "tweetnacl";
import { encodeBase64, decodeBase64 } from "tweetnacl-util";
// Use built-in crypto for HKDF - compatible with both Node.js and Cloudflare Workers
import { fromByteArray } from "base64-js";

// Types
export interface KeyPair {
  publicKey: string; // base64
  privateKey: string; // base64
}

export interface EncryptedPayload {
  ciphertext: string; // base64
  nonce: string; // base64
}

export interface DerivedKeys {
  masterKey: string; // base64
  encryptionKey: string; // base64
}

export interface UserKeys {
  encryptionKeyPair: KeyPair;
  signingKeyPair: KeyPair;
}

// Legacy interfaces for backward compatibility
export interface GeneratePublicPrivateKeyPairResult {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedDataPayload {
  ciphertext: string;
  nonce: string;
  metadata: {
    nonce?: string;
    ephemeralPublicKey?: string;
  };
}

// Constants for native HKDF implementation
const HKDF_LENGTH = 32;

enum HkdfInfo {
  PRIVATE_KEYS = "PRIVATE_KEYS",
}

// Native HKDF implementation using Web Crypto API
async function nativeHkdf(
  ikm: string,
  length: number,
  salt: string,
  info: string,
): Promise<Uint8Array> {
  // Convert inputs to Uint8Array
  const ikmBytes = new TextEncoder().encode(ikm);
  const saltBytes = new TextEncoder().encode(salt);
  const infoBytes = new TextEncoder().encode(info);

  // Import the input key material
  const key = await crypto.subtle.importKey(
    "raw",
    ikmBytes,
    { name: "HKDF" },
    false,
    ["deriveBits"],
  );

  // Derive the key using HKDF
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: saltBytes,
      info: infoBytes,
    },
    key,
    length * 8, // bits
  );

  return new Uint8Array(derivedBits);
}

// ============================================
// SIGNATURE CRYPTO CLASS
// ============================================

export class SignatureCrypto {
  private initialized: boolean = false;

  /**
   * Initialize crypto
   */
  async init(): Promise<void> {
    this.initialized = true;
  }

  private ensureInit() {
    if (!this.initialized) {
      throw new Error("SignatureCrypto not initialized. Call init() first.");
    }
  }

  /**
   * Generate Curve25519 keypair for encryption
   */
  generateEncryptionKeyPair(): KeyPair {
    this.ensureInit();
    const keypair = nacl.box.keyPair();
    return {
      publicKey: encodeBase64(keypair.publicKey),
      privateKey: encodeBase64(keypair.secretKey),
    };
  }

  /**
   * Generate Ed25519 keypair for signing
   */
  generateSigningKeyPair(): KeyPair {
    this.ensureInit();
    const keypair = nacl.sign.keyPair();
    return {
      publicKey: encodeBase64(keypair.publicKey),
      privateKey: encodeBase64(keypair.secretKey),
    };
  }

  /**
   * Create key from signature using HKDF (adapted from Skiff)
   */
  async createKeyFromSignature(
    signature: string,
    salt: string,
  ): Promise<string> {
    this.ensureInit();

    const privateKey = await nativeHkdf(
      signature,
      HKDF_LENGTH,
      salt,
      "MASTER_KEY",
    );

    return fromByteArray(privateKey);
  }

  /**
   * Create signature-derived secret using HKDF (adapted from Skiff)
   */
  async createSignatureDerivedSecret(
    masterSecret: string,
    salt: string,
  ): Promise<string> {
    this.ensureInit();

    const privateKey = await nativeHkdf(
      masterSecret,
      HKDF_LENGTH,
      salt,
      HkdfInfo.PRIVATE_KEYS,
    );

    return fromByteArray(privateKey);
  }

  /**
   * Derive encryption keys from wallet signature using HKDF
   */
  async deriveKeysFromSignature(
    signature: string,
    masterKeySalt?: string,
    encryptionKeySalt?: string,
  ): Promise<{
    keys: DerivedKeys;
    masterKeySalt: string;
    encryptionKeySalt: string;
  }> {
    this.ensureInit();

    // Generate or use provided salts
    const masterSaltString =
      masterKeySalt || encodeBase64(nacl.randomBytes(16));
    const encryptionSaltString =
      encryptionKeySalt || encodeBase64(nacl.randomBytes(32));

    // Step 1: Create master key from signature using HKDF
    const masterKey = await this.createKeyFromSignature(
      signature,
      masterSaltString,
    );

    // Step 2: Derive encryption key using HKDF with different context
    const encryptionKey = await this.createSignatureDerivedSecret(
      masterKey,
      encryptionSaltString,
    );

    return {
      keys: {
        masterKey,
        encryptionKey,
      },
      masterKeySalt: masterSaltString,
      encryptionKeySalt: encryptionSaltString,
    };
  }

  /**
   * Generate random symmetric key (adapted from Skiff)
   */
  generateSymmetricKey(): string {
    this.ensureInit();
    const key = nacl.randomBytes(32);
    return encodeBase64(key);
  }

  /**
   * Encrypt with XSalsa20-Poly1305 (NaCl secretbox) - adapted from Skiff
   */
  encryptSymmetric(
    plaintext: string,
    key: string, // base64
  ): EncryptedPayload {
    this.ensureInit();

    const keyBytes = decodeBase64(key);
    const messageBytes = new TextEncoder().encode(plaintext);

    // Generate 24-byte nonce
    const nonce = nacl.randomBytes(24);

    // Encrypt using secretbox (XSalsa20-Poly1305)
    const ciphertext = nacl.secretbox(messageBytes, nonce, keyBytes);

    if (!ciphertext) {
      throw new Error("Failed to encrypt message");
    }

    return {
      ciphertext: encodeBase64(ciphertext),
      nonce: encodeBase64(nonce),
    };
  }

  /**
   * Decrypt with XSalsa20-Poly1305 - adapted from Skiff
   */
  decryptSymmetric(
    encrypted: EncryptedPayload,
    key: string, // base64
  ): string {
    this.ensureInit();

    const keyBytes = decodeBase64(key);
    const ciphertextBytes = decodeBase64(encrypted.ciphertext);
    const nonceBytes = decodeBase64(encrypted.nonce);

    // Decrypt using secretbox
    const decrypted = nacl.secretbox.open(
      ciphertextBytes,
      nonceBytes,
      keyBytes,
    );

    if (!decrypted) {
      throw new Error("Failed to decrypt message");
    }

    return new TextDecoder().decode(decrypted);
  }

  /**
   * Asymmetric encryption with Curve25519 (NaCl box) - adapted from Skiff
   */
  encryptAsymmetric(
    plaintext: string,
    recipientPublicKey: string, // base64
    senderPrivateKey: string, // base64
  ): EncryptedPayload {
    this.ensureInit();

    const messageBytes = new TextEncoder().encode(plaintext);
    const recipientPubBytes = decodeBase64(recipientPublicKey);
    const senderPrivBytes = decodeBase64(senderPrivateKey);

    // Generate nonce
    const nonce = nacl.randomBytes(24);

    // Encrypt using box (Curve25519 + XSalsa20-Poly1305)
    const ciphertext = nacl.box(
      messageBytes,
      nonce,
      recipientPubBytes,
      senderPrivBytes,
    );

    if (!ciphertext) {
      throw new Error("Failed to encrypt message asymmetrically");
    }

    return {
      ciphertext: encodeBase64(ciphertext),
      nonce: encodeBase64(nonce),
    };
  }

  /**
   * Asymmetric decryption - adapted from Skiff
   */
  decryptAsymmetric(
    encrypted: EncryptedPayload,
    senderPublicKey: string, // base64
    recipientPrivateKey: string, // base64
  ): string {
    this.ensureInit();

    const ciphertextBytes = decodeBase64(encrypted.ciphertext);
    const nonceBytes = decodeBase64(encrypted.nonce);
    const senderPubBytes = decodeBase64(senderPublicKey);
    const recipientPrivBytes = decodeBase64(recipientPrivateKey);

    const decrypted = nacl.box.open(
      ciphertextBytes,
      nonceBytes,
      senderPubBytes,
      recipientPrivBytes,
    );

    if (!decrypted) {
      throw new Error("Failed to decrypt message asymmetrically");
    }

    return new TextDecoder().decode(decrypted);
  }
}

// ============================================
// LEGACY COMPATIBILITY FUNCTIONS
// ============================================

const cryptoInstance = new SignatureCrypto();

/**
 * Generate symmetric key - adapted from Skiff
 */
export async function generateSymmetricKey(): Promise<string> {
  await cryptoInstance.init();
  return cryptoInstance.generateSymmetricKey();
}

/**
 * Legacy function for backward compatibility
 */
export async function generatePublicPrivateKeyPair(): Promise<GeneratePublicPrivateKeyPairResult> {
  await cryptoInstance.init();
  const keyPair = cryptoInstance.generateEncryptionKeyPair();
  return keyPair;
}

/**
 * Legacy function for backward compatibility
 */
export async function generateSigningKeyPair(): Promise<GeneratePublicPrivateKeyPairResult> {
  await cryptoInstance.init();
  const keyPair = cryptoInstance.generateSigningKeyPair();
  return keyPair;
}

/**
 * Legacy symmetric encryption - adapted from Skiff
 */
export async function encryptSymmetric(
  plaintext: string,
  key: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _additionalData?: string, // Additional authenticated data (not used in TweetNaCl)
): Promise<EncryptedDataPayload> {
  await cryptoInstance.init();
  const result = cryptoInstance.encryptSymmetric(plaintext, key);
  return {
    ciphertext: result.ciphertext,
    nonce: result.nonce,
    metadata: {
      nonce: result.nonce,
    },
  };
}

/**
 * Legacy symmetric decryption - adapted from Skiff
 */
export async function decryptSymmetric(
  encrypted: EncryptedDataPayload,
  key: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _additionalData?: string, // Additional authenticated data (not used in TweetNaCl)
): Promise<string> {
  await cryptoInstance.init();
  return cryptoInstance.decryptSymmetric(
    {
      ciphertext: encrypted.ciphertext,
      nonce: encrypted.nonce,
    },
    key,
  );
}

/**
 * Create key from signature (adapted from Skiff's createKeyFromSecret)
 */
export async function createKeyFromSignature(
  signature: string,
  salt: string,
): Promise<string> {
  await cryptoInstance.init();
  return cryptoInstance.createKeyFromSignature(signature, salt);
}

/**
 * Create signature-derived secret (adapted from Skiff's createPasswordDerivedSecret)
 */
export async function createSignatureDerivedSecret(
  masterSecret: string,
  salt: string,
): Promise<string> {
  await cryptoInstance.init();
  return cryptoInstance.createSignatureDerivedSecret(masterSecret, salt);
}

/**
 * Legacy key derivation placeholder
 */
export async function createKeyFromSecret(
  secret: string,
  salt: string,
): Promise<string> {
  // Redirect to signature-based implementation
  return createKeyFromSignature(secret, salt);
}

/**
 * Legacy key derivation placeholder
 */
export async function createPasswordDerivedSecret(
  masterSecret: string,
  context: string,
): Promise<string> {
  // Redirect to signature-based implementation
  return createSignatureDerivedSecret(masterSecret, context);
}

/**
 * Convert string to encrypted payload
 */
export function stringToEncryptedDataPayload(
  str: string,
): EncryptedDataPayload {
  const parsed = JSON.parse(str);
  return {
    ciphertext: parsed.ciphertext,
    nonce: parsed.nonce,
    metadata: parsed.metadata || { nonce: parsed.nonce },
  };
}

/**
 * Convert encrypted payload to string
 */
export function encryptedDataPayloadToString(
  payload: EncryptedDataPayload,
): string {
  return JSON.stringify({
    ciphertext: payload.ciphertext,
    nonce: payload.nonce,
    metadata: payload.metadata,
  });
}

// Export the crypto instance for direct use
export { cryptoInstance as crypto };
