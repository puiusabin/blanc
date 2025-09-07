"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/wagmi-auth";

export interface AuthSession {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    // Add any other user properties you need
  };
  session: {
    id: string;
    expiresAt: Date;
    token: string;
    // Add any other session properties you need
  };
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = async () => {
    try {
      setError(null);
      const { data: sessionData, error: sessionError } = await authClient.getSession();
      
      if (sessionError) {
        setError(sessionError.message || "Session error");
        setSession(null);
        return null;
      }
      
      setSession(sessionData);
      return sessionData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setSession(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setSession(null);
            console.log("Successfully signed out");
          },
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Sign out failed";
      setError(errorMessage);
    }
  };

  // Auto-refresh session periodically (every 5 minutes)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const setupAutoRefresh = () => {
      intervalId = setInterval(() => {
        if (session?.user) {
          refreshSession();
        }
      }, 5 * 60 * 1000); // 5 minutes
    };

    if (session?.user) {
      setupAutoRefresh();
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [session?.user]);

  // Initial session load
  useEffect(() => {
    refreshSession();
  }, []);

  return {
    session,
    user: session?.user,
    isLoading,
    error,
    isAuthenticated: !!session?.user,
    refreshSession,
    signOut,
  };
}