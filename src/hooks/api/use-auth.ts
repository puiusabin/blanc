"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/wagmi-auth";

export interface AuthSession {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string | null;
  };
  session: {
    id: string;
    expiresAt: Date;
    token: string;
  };
}

const AUTH_KEYS = {
  session: ["auth", "session"] as const,
} as const;

export function useAuthSession() {
  return useQuery({
    queryKey: AUTH_KEYS.session,
    queryFn: async (): Promise<AuthSession | null> => {
      const { data: sessionData, error: sessionError } =
        await authClient.getSession();

      if (sessionError) {
        throw new Error(sessionError.message || "Session error");
      }

      return sessionData;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: (failureCount, error: Error) => {
      // Don't retry on auth errors
      if (error?.message?.includes("Unauthorized")) return false;
      return failureCount < 1;
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authClient.signOut();
    },
    onSuccess: () => {
      // Clear all cached data on sign out
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Sign out failed:", error);
    },
  });
}

export function useAuth() {
  const sessionQuery = useAuthSession();
  const signOutMutation = useSignOut();

  return {
    session: sessionQuery.data,
    user: sessionQuery.data?.user,
    isLoading: sessionQuery.isLoading,
    error: sessionQuery.error as Error | null,
    isAuthenticated: !!sessionQuery.data?.user,
    refetchSession: sessionQuery.refetch,
    signOut: signOutMutation.mutate,
    isSigningOut: signOutMutation.isPending,
  };
}
