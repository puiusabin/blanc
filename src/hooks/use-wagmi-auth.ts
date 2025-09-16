import { useState, useCallback, useEffect } from "react";
import { useAccount, useWalletClient, useChainId } from "wagmi";
import { WagmiAuthManager } from "@/lib/wagmi-auth";
import { KeyStorageManager } from "@/lib/key-storage";
import type { UserKeys } from "@/lib/crypto";

interface UseWagmiAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  userKeys: UserKeys | null;
  authenticate: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useWagmiAuth(): UseWagmiAuthReturn {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  const [authManager] = useState(() => new WagmiAuthManager());
  const [keyStorage] = useState(() => new KeyStorageManager());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true to check existing session
  const [error, setError] = useState<string | null>(null);
  const [userKeys, setUserKeys] = useState<UserKeys | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Update auth manager when wallet changes
  useEffect(() => {
    if (walletClient && address) {
      authManager.setWalletClient(walletClient, address);
    }
  }, [walletClient, address, authManager]);

  // Check for existing session and keys on initialization
  useEffect(() => {
    const checkExistingAuth = async () => {
      // Add a small delay to let wallet connection stabilize
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!isConnected || !address) {
        setIsLoading(false);
        setHasInitialized(true);
        return;
      }

      // Skip if already authenticated to prevent redundant calls
      if (isAuthenticated && userKeys) {
        console.log("🚀 useWagmiAuth: Already authenticated, skipping check");
        setIsLoading(false);
        setHasInitialized(true);
        return;
      }

      try {
        // ALWAYS check better-auth session first - this is critical for /mail page auth
        const session = await authManager.getSession();

        if (session?.user) {
          console.log("Found valid better-auth session:", session.user);

          // Session is valid, now try to load stored keys for speed
          if (keyStorage.hasValidKeys(address)) {
            console.log("Found stored keys for wallet, attempting to load...");

            const storedKeys = await keyStorage.retrieveKeys(
              address,
              address.toLowerCase(),
            );
            if (storedKeys) {
              setUserKeys(storedKeys);
              setIsAuthenticated(true);
              console.log(
                "Successfully loaded keys from storage with valid session",
              );
              setIsLoading(false);
              return;
            }
          }

          // No stored keys but session is valid, load from server
          if (walletClient) {
            authManager.setWalletClient(walletClient, address);

            // Get challenge and signature to decrypt existing keys
            const challengeResponse = await fetch("/api/crypto/get-challenge", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ walletAddress: address }),
            });

            if (challengeResponse.ok) {
              const responseData = (await challengeResponse.json()) as {
                challenge: string;
              };
              const { challenge } = responseData;

              // Sign the challenge to decrypt keys
              const signature = await walletClient.signMessage({
                account: address,
                message: challenge,
              });

              // Load existing keys
              await authManager.init();
              const requiresKeySetup =
                await authManager.checkRequiresKeySetup();

              if (!requiresKeySetup) {
                await authManager.loadExistingUserKeys(signature);
                const keys = authManager.getKeys();
                if (keys) {
                  setUserKeys(keys);
                  setIsAuthenticated(true);
                  console.log("Successfully loaded existing keys from server");

                  // Store keys for future sessions
                  await keyStorage.storeKeys(
                    keys,
                    address,
                    address.toLowerCase(),
                    24,
                  );
                }
              }
            }
          }
        } else {
          // No valid session, clear any stored keys to be safe
          console.log(
            "No valid better-auth session found, clearing stored keys",
          );
          keyStorage.clearStoredKeys();
        }
      } catch (error) {
        console.error("Failed to check existing auth:", error);
        // Clear stored keys on error to be safe
        keyStorage.clearStoredKeys();
      } finally {
        setIsLoading(false);
        setHasInitialized(true);
      }
    };

    checkExistingAuth();
  }, [
    isConnected,
    address,
    walletClient,
    authManager,
    keyStorage,
    isAuthenticated,
    userKeys,
    hasInitialized,
  ]);

  const authenticate = useCallback(async () => {
    if (!walletClient || !address || !isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { keys } = await authManager.authenticate(chainId);
      setUserKeys(keys);
      setIsAuthenticated(true);
      console.log("Authentication successful");

      // Store keys for future sessions (24 hour expiry)
      if (address) {
        await keyStorage.storeKeys(keys, address, address.toLowerCase(), 24);
        console.log("Keys stored for future sessions");
      }
    } catch (err) {
      console.error("Authentication failed:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [authManager, walletClient, address, isConnected, chainId, keyStorage]);

  const signOut = useCallback(async () => {
    try {
      await authManager.signOut();
      setIsAuthenticated(false);
      setUserKeys(null);
      setError(null);

      // Clear stored keys
      keyStorage.clearStoredKeys();
      console.log("Signed out and cleared stored keys");
    } catch (err) {
      console.error("Sign out failed:", err);
      setError(err instanceof Error ? err.message : "Sign out failed");
    }
  }, [authManager, keyStorage]);

  // Clear auth state when wallet disconnects (but not on initial load)
  useEffect(() => {
    // Only trigger cleanup if we've initialized and were previously connected
    if (hasInitialized && !isConnected && (isAuthenticated || userKeys)) {
      console.log(
        "Wallet actually disconnected (not initial load), clearing stored keys",
      );
      setIsAuthenticated(false);
      setUserKeys(null);
      keyStorage.clearStoredKeys();
    }
  }, [isConnected, keyStorage, hasInitialized, isAuthenticated, userKeys]);

  return {
    isAuthenticated,
    isLoading,
    error,
    userKeys,
    authenticate,
    signOut,
  };
}
