import { createAuthClient } from "better-auth/client";
import { siweClient } from "better-auth/client/plugins";
import type { Address } from "viem";
import naclUtil from "tweetnacl-util";
import * as crypto from "./crypto";

const client = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [siweClient()],
});

interface UserKeys {
  encryptionPublicKey: string;
  encryptionPrivateKey: string;
  signingPublicKey: string;
  signingPrivateKey: string;
}

interface EncryptedKeysData {
  encryptedPrivateKeys: string;
  walletEncryptedSecret: string;
  salt: string;
  nonce: string;
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

  /**
   * Initialize with wagmi wallet client
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setWalletClient(walletClient: any, address: Address) {
    this.walletClient = walletClient;
    this.address = address;
  }

  /**
   * Authenticate with SIWE and setup/load keys
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async authenticate(
    chainId: number
  ): Promise<{ session: any; keys: UserKeys }> {
    if (!this.walletClient || !this.address) {
      throw new Error("Wallet not set. Call setWalletClient first.");
    }

    console.log("Starting SIWE authentication...");

    // Generate SIWE nonce
    const { data: nonceData } = await client.siwe.nonce({
      walletAddress: this.address,
      chainId: 1,
    });
    if (!nonceData?.nonce) {
      throw new Error("Failed to get nonce for SIWE");
    }

    // Create SIWE message
    const domain = window.location.host;
    const origin = window.location.origin;
    const message = `${domain} wants you to sign in with your Ethereum account:
${this.address}

I accept the Terms of Service: ${origin}

URI: ${origin}
Version: 1
Chain ID: ${chainId}
Nonce: ${nonceData.nonce}
Issued At: ${new Date().toISOString()}`;

    // Sign the message with the wallet
    const signature = await this.walletClient.signMessage({
      account: this.address,
      message,
    });
    console.log({ message, signature, address: this.address });
    // Verify with better-auth
    const { data: authData, error } = await client.siwe.verify({
      message,
      signature,
      walletAddress: this.address,
      chainId,
    });
    console.log("SIWE verification result:", { authData, error });
    if (error || !authData) {
      throw new Error(
        `SIWE authentication failed: ${error?.message || "Unknown error"}`
      );
    }

    this.session = authData;
    console.log("SIWE authentication successful");

    // Check if user needs key setup
    const requiresKeySetup = await this.checkRequiresKeySetup();

    if (requiresKeySetup) {
      console.log("New user - setting up encryption keys...");
      await this.setupNewUserKeys();
    } else {
      console.log("Existing user - loading keys...");
      await this.loadExistingUserKeys();
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
      const response = await fetch("/api/auth/encrypted-keys", {
        headers: {
          Authorization: `Bearer ${this.session?.token}`,
        },
      });
      return response.status === 404; // Keys not found
    } catch {
      return true; // Assume needs setup on error
    }
  }

  /**
   * Setup encryption for new user
   */
  private async setupNewUserKeys(): Promise<void> {
    if (!this.walletClient || !this.address) {
      throw new Error("Wallet not connected");
    }

    // Generate keypairs using our replacement crypto
    const encryptionKeypair = crypto.generatePublicPrivateKeyPair();
    const signingKeypair = crypto.generateSigningKeyPair();

    this.userKeys = {
      encryptionPublicKey: encryptionKeypair.publicKey,
      encryptionPrivateKey: encryptionKeypair.privateKey,
      signingPublicKey: signingKeypair.publicKey,
      signingPrivateKey: signingKeypair.privateKey,
    };

    // Generate and encrypt root secret
    const rootSecret = this.generateRootSecret();
    const salt = this.generateSalt();
    const derivedKey = await this.deriveSymmetricKey(rootSecret, salt);

    // Encrypt private keys
    const privateKeyBundle = JSON.stringify({
      encryptionPrivateKey: this.userKeys.encryptionPrivateKey,
      signingPrivateKey: this.userKeys.signingPrivateKey,
      metadata: {
        createdAt: new Date().toISOString(),
        walletAddress: this.address,
      },
    });

    const encryptedKeys = crypto.encryptSymmetric(
      privateKeyBundle,
      derivedKey,
      "UserPrivateKeys"
    );

    // Encrypt root secret with wallet
    const walletEncryptedSecret = await this.encryptWithWallet(rootSecret);

    // Send to server
    const response = await fetch("/api/auth/setup-keys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.session?.token}`,
      },
      body: JSON.stringify({
        encryptedPrivateKeys:
          crypto.encryptedDataPayloadToString(encryptedKeys),
        walletEncryptedSecret,
        salt,
        nonce: encryptedKeys.metadata.nonce || "",
        encryptionPublicKey: this.userKeys.encryptionPublicKey,
        signingPublicKey: this.userKeys.signingPublicKey,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to setup keys");
    }

    console.log("Keys successfully stored");
  }

  /**
   * Load existing user keys
   */
  private async loadExistingUserKeys(): Promise<void> {
    if (!this.walletClient || !this.address) {
      throw new Error("Wallet not connected");
    }

    const response = await fetch("/api/auth/encrypted-keys", {
      headers: {
        Authorization: `Bearer ${this.session?.token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch keys");
    }

    const encryptedData: EncryptedKeysData = await response.json();

    // Decrypt with wallet
    const rootSecret = await this.decryptWithWallet(
      encryptedData.walletEncryptedSecret
    );
    const derivedKey = await this.deriveSymmetricKey(
      rootSecret,
      encryptedData.salt
    );

    const decryptedBundle = crypto.decryptSymmetric(
      crypto.stringToEncryptedDataPayload(encryptedData.encryptedPrivateKeys),
      derivedKey,
      "UserPrivateKeys"
    );

    const bundle = JSON.parse(decryptedBundle);

    this.userKeys = {
      encryptionPublicKey: encryptedData.publicKeys.encryptionPublicKey,
      encryptionPrivateKey: bundle.encryptionPrivateKey,
      signingPublicKey: encryptedData.publicKeys.signingPublicKey,
      signingPrivateKey: bundle.signingPrivateKey,
    };

    console.log("Keys loaded successfully");
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

  // Helper methods
  private generateRootSecret(): string {
    const array = new Uint8Array(32);
    globalThis.crypto.getRandomValues(array);
    return naclUtil.encodeBase64(array);
  }

  private generateSalt(): string {
    const array = new Uint8Array(16);
    globalThis.crypto.getRandomValues(array);
    return Buffer.from(array).toString("hex");
  }

  private async deriveSymmetricKey(
    secret: string,
    salt: string
  ): Promise<string> {
    const masterSecret = await crypto.createKeyFromSecret(secret, salt);
    return await crypto.createPasswordDerivedSecret(
      masterSecret,
      "user-keys-encryption"
    );
  }

  private async encryptWithWallet(data: string): Promise<string> {
    if (!this.walletClient || !this.address) {
      throw new Error("Wallet not connected");
    }

    const dailyEpoch = Math.floor(Date.now() / 86400000);
    const message = `Encrypt Keys\nAddress: ${this.address}\nEpoch: ${dailyEpoch}`;

    const signature = await this.walletClient.signMessage({
      account: this.address,
      message,
    });

    // Use first 32 bytes of signature as key
    const signatureBytes = naclUtil.decodeBase64(signature.slice(2)); // Remove 0x
    const encryptionKey = naclUtil.encodeBase64(signatureBytes.slice(0, 32));

    const encrypted = crypto.encryptSymmetric(
      data,
      encryptionKey,
      "WalletSecret"
    );

    return JSON.stringify({
      encrypted: crypto.encryptedDataPayloadToString(encrypted),
      message,
    });
  }

  private async decryptWithWallet(encryptedData: string): Promise<string> {
    if (!this.walletClient || !this.address) {
      throw new Error("Wallet not connected");
    }

    const { encrypted, message } = JSON.parse(encryptedData);

    const signature = await this.walletClient.signMessage({
      account: this.address,
      message,
    });

    const signatureBytes = naclUtil.decodeBase64(signature.slice(2));
    const decryptionKey = naclUtil.encodeBase64(signatureBytes.slice(0, 32));

    return crypto.decryptSymmetric(
      crypto.stringToEncryptedDataPayload(encrypted),
      decryptionKey,
      "WalletSecret"
    );
  }
}
