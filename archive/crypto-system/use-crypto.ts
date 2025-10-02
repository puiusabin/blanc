"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SetupKeysData {
  encryptedPrivateKeys: string;
  encryptionNonce: string;
  masterKeySalt: string;
  encryptionKeySalt: string;
  encryptionPublicKey: string;
  signingPublicKey: string;
}

interface EncryptedKeysResponse {
  encryptedPrivateKeys: string;
  encryptionNonce: string;
  masterKeySalt: string;
  encryptionKeySalt: string;
  publicKeys: {
    encryptionPublicKey: string;
    signingPublicKey: string;
  };
}

interface ChallengeResponse {
  challenge: string;
  salt: string;
}

const CRYPTO_KEYS = {
  encryptedKeys: ["crypto", "encrypted-keys"] as const,
  challenge: (userId: string) => ["crypto", "challenge", userId] as const,
} as const;

export function useEncryptedKeys() {
  return useQuery({
    queryKey: CRYPTO_KEYS.encryptedKeys,
    queryFn: async (): Promise<EncryptedKeysResponse> => {
      const response = await fetch("/api/crypto/encrypted-keys");

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(errorData.error || "Failed to fetch encrypted keys");
      }

      return response.json();
    },
    retry: (failureCount, error: Error) => {
      // Don't retry on 404 (keys not found) or 401
      if (
        error?.message?.includes("not found") ||
        error?.message?.includes("Unauthorized")
      ) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

export function useSetupKeys() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SetupKeysData) => {
      const response = await fetch("/api/crypto/setup-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(errorData.error || "Failed to setup keys");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate encrypted keys query to refetch the new keys
      queryClient.invalidateQueries({ queryKey: CRYPTO_KEYS.encryptedKeys });
    },
  });
}

export function useGetChallenge(userId: string) {
  return useQuery({
    queryKey: CRYPTO_KEYS.challenge(userId),
    queryFn: async (): Promise<ChallengeResponse> => {
      const response = await fetch("/api/crypto/get-challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(errorData.error || "Failed to get challenge");
      }

      return response.json();
    },
    enabled: !!userId,
    staleTime: 0, // Always fetch fresh challenge
    gcTime: 0, // Don't cache challenges
  });
}
