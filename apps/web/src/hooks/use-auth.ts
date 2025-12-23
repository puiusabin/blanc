"use client";

import { useEffect, useState } from "react";

export interface UseAuthResult {
  userId: string | null;
  isLoading: boolean;
  error: Error | null;
}

export function useAuth(): UseAuthResult {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initializeSession() {
      try {
        const userResponse = await fetch("/api/mail/user");
        if (!userResponse.ok) {
          throw new Error("Failed to get user");
        }

        const { userId: fetchedUserId } = await userResponse.json();

        const sessionResponse = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: fetchedUserId }),
        });

        if (!sessionResponse.ok) {
          throw new Error("Failed to create session");
        }

        setUserId(fetchedUserId);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    }

    initializeSession();
  }, []);

  return { userId, isLoading, error };
}
