import { useState, useCallback, useEffect } from 'react';
import { useAccount, useWalletClient, useChainId } from 'wagmi';
import { WagmiAuthManager } from '@/lib/wagmi-auth';
import type { UserKeys } from '@/lib/crypto';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userKeys, setUserKeys] = useState<UserKeys | null>(null);

  // Update auth manager when wallet changes
  useEffect(() => {
    if (walletClient && address) {
      authManager.setWalletClient(walletClient, address);
    }
  }, [walletClient, address, authManager]);

  const authenticate = useCallback(async () => {
    if (!walletClient || !address || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { keys } = await authManager.authenticate(chainId);
      setUserKeys(keys);
      setIsAuthenticated(true);
      console.log('Authentication successful');
    } catch (err) {
      console.error('Authentication failed:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [authManager, walletClient, address, isConnected, chainId]);

  const signOut = useCallback(async () => {
    try {
      await authManager.signOut();
      setIsAuthenticated(false);
      setUserKeys(null);
      setError(null);
    } catch (err) {
      console.error('Sign out failed:', err);
      setError(err instanceof Error ? err.message : 'Sign out failed');
    }
  }, [authManager]);

  // Clear auth state when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setIsAuthenticated(false);
      setUserKeys(null);
    }
  }, [isConnected]);

  return {
    isAuthenticated,
    isLoading,
    error,
    userKeys,
    authenticate,
    signOut,
  };
}