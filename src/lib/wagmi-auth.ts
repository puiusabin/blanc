import { createAuthClient } from "better-auth/client";
import { siweClient } from "better-auth/client/plugins";
import type { Address } from "viem";
import { SignatureCrypto, type UserKeys } from "./crypto";

const client = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [siweClient()],
});

interface EncryptedKeysData {
  encryptedPrivateKeys: string;
  encryptionNonce: string;
  masterKeySalt: string;
  encryptionKeySalt: string;
  publicKeys: {
    encryptionPublicKey: string;
    signingPublicKey: string;
  };
}

export class WagmiAuthManager {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private walletClient: any = null;
  private address: Address | null = null;
  private userKeys: UserKeys | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private session: any = null;
  private crypto: SignatureCrypto;

  constructor() {
    this.crypto = new SignatureCrypto();
  }

  async init() {
    await this.crypto.init();
  }

  /**
   * Initialize with wagmi wallet client
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setWalletClient(walletClient: any, address: Address) {
    this.walletClient = walletClient;
    this.address = address;
  }

  /**
   * Two-step authentication:
   * 1. SIWE authentication for session management (regular SIWE signature)
   * 2. Key derivation using deterministic challenge (separate signature for consistent keys)
   */
  async authenticate(
    chainId: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<{ session: any; keys: UserKeys }> {
    if (!this.walletClient || !this.address) {
      throw new Error("Wallet not set. Call setWalletClient first.");
    }

    console.log("Starting SIWE authentication...");

    // Initialize crypto
    await this.init();

    // Step 1: Get nonce for SIWE authentication
    const { data: nonceData, error: nonceError } = await client.siwe.nonce({
      walletAddress: this.address,
      chainId,
    });

    if (nonceError || !nonceData?.nonce) {
      throw new Error(
        `Failed to get SIWE nonce: ${nonceError?.message || "Unknown error"}`
      );
    }

    // Step 2: Create SIWE message (using exact format expected by better-auth)
    const domain = "localhost:3000"; // Match the domain in auth.ts
    const uri = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const issuedAt = new Date().toISOString();

    const siweMessage = `${domain} wants you to sign in with your Ethereum account:
${this.address}

I accept the Terms of Service: ${uri}

URI: ${uri}
Version: 1
Chain ID: ${chainId}
Nonce: ${nonceData.nonce}
Issued At: ${issuedAt}`;

    // Step 3: Sign the SIWE message
    const siweSignature = await this.walletClient.signMessage({
      account: this.address,
      message: siweMessage,
    });

    // Step 4: Verify the SIWE signature
    const { data: authData, error: authError } = await client.siwe.verify({
      message: siweMessage,
      signature: siweSignature,
      walletAddress: this.address,
      chainId,
    });

    if (authError || !authData?.user) {
      throw new Error(
        `SIWE authentication failed: ${authError?.message || "Unknown error"}`
      );
    }

    this.session = authData;
    console.log("SIWE authentication successful");

    // Step 2: Check if user needs key setup
    const requiresKeySetup = await this.checkRequiresKeySetup();

    // Step 3: Get deterministic challenge for key derivation (separate from SIWE auth)
    const challengeResponse = await fetch("/api/crypto/get-challenge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        walletAddress: this.address,
      }),
    });

    const responseData = (await challengeResponse.json()) as {
      challenge: string;
    };
    const { challenge } = responseData;

    // Step 4: Sign the key derivation challenge (different from SIWE signature)
    const keyDerivationSignature = await this.walletClient.signMessage({
      account: this.address,
      message: challenge,
    });

    // Step 5: Setup or load keys using the key derivation signature
    if (requiresKeySetup) {
      await this.setupNewUserKeys(keyDerivationSignature);
    } else {
      await this.loadExistingUserKeys(keyDerivationSignature);
    }

    return {
      session: this.session,
      keys: this.userKeys!,
    };
  }

  /**
   * Check if user needs key setup
   */
  private async checkRequiresKeySetup(): Promise<boolean> {
    try {
      const response = await fetch("/api/crypto/encrypted-keys", {
        credentials: "include", // Use session cookies instead of Bearer token
      });
      return response.status === 404; // Keys not found
    } catch {
      return true; // Assume needs setup on error
    }
  }

  /**
   * Setup encryption for new user
   */
  private async setupNewUserKeys(signature: string): Promise<void> {
    // Derive encryption key from signature
    const { keys, masterKeySalt, encryptionKeySalt } =
      await this.crypto.deriveKeysFromSignature(signature);

    // Generate keypairs
    const encryptionKeyPair = this.crypto.generateEncryptionKeyPair();
    const signingKeyPair = this.crypto.generateSigningKeyPair();

    this.userKeys = {
      encryptionKeyPair,
      signingKeyPair,
    };

    // Prepare private keys for encryption
    const privateKeysBundle = JSON.stringify({
      encryptionPrivateKey: encryptionKeyPair.privateKey,
      signingPrivateKey: signingKeyPair.privateKey,
      metadata: {
        createdAt: new Date().toISOString(),
        walletAddress: this.address,
      },
    });

    // Encrypt private keys with derived key
    const encrypted = this.crypto.encryptSymmetric(
      privateKeysBundle,
      keys.encryptionKey
    );

    // Send to server
    const response = await fetch("/api/crypto/setup-keys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Use session cookies
      body: JSON.stringify({
        encryptedPrivateKeys: encrypted.ciphertext,
        encryptionNonce: encrypted.nonce,
        masterKeySalt,
        encryptionKeySalt,
        encryptionPublicKey: encryptionKeyPair.publicKey,
        signingPublicKey: signingKeyPair.publicKey,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to setup keys");
    }
  }

  /**
   * Load existing user keys
   */
  private async loadExistingUserKeys(signature: string): Promise<void> {
    // Fetch encrypted keys and salts
    const response = await fetch("/api/crypto/encrypted-keys", {
      credentials: "include", // Use session cookies
    });

    if (!response.ok) {
      throw new Error("Failed to fetch keys");
    }

    const encryptedData = (await response.json()) as EncryptedKeysData;

    // Derive same encryption key using stored salts
    const { keys } = this.crypto.deriveKeysFromSignature(
      signature,
      encryptedData.masterKeySalt,
      encryptedData.encryptionKeySalt
    );

    // Decrypt private keys
    const decrypted = this.crypto.decryptSymmetric(
      {
        ciphertext: encryptedData.encryptedPrivateKeys,
        nonce: encryptedData.encryptionNonce,
      },
      keys.encryptionKey
    );

    const bundle = JSON.parse(decrypted);

    this.userKeys = {
      encryptionKeyPair: {
        publicKey: encryptedData.publicKeys.encryptionPublicKey,
        privateKey: bundle.encryptionPrivateKey,
      },
      signingKeyPair: {
        publicKey: encryptedData.publicKeys.signingPublicKey,
        privateKey: bundle.signingPrivateKey,
      },
    };
  }

  /**
   * Sign out and clear keys
   */
  async signOut() {
    this.userKeys = null;
    this.session = null;
    this.walletClient = null;
    this.address = null;
    await client.signOut({
      fetchOptions: {
        onSuccess: () => {
          console.log("Successfully signed out");
        },
      },
    });
  }

  /**
   * Get current keys
   */
  getKeys(): UserKeys | null {
    return this.userKeys;
  }

  // Email encryption example
  async encryptMessage(
    message: string,
    recipientPublicKey: string
  ): Promise<string> {
    if (!this.userKeys) {
      throw new Error("Keys not loaded");
    }

    const encrypted = await this.crypto.encryptAsymmetric(
      message,
      recipientPublicKey,
      this.userKeys.encryptionKeyPair.privateKey
    );

    return JSON.stringify(encrypted);
  }
}
