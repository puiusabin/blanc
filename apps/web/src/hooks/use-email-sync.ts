"use client";

import { useState, useEffect } from "react";
import { performInitialSync, performIncrementalSync } from "@/lib/email/sync";

export function useEmailSync(pollingInterval = 60000) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/mail/user");
        if (!response.ok) {
          throw new Error(`Failed to fetch user: ${response.statusText}`);
        }
        const data = (await response.json()) as { userId: string };
        console.log("[useEmailSync] Got userId:", data.userId);

        const sessionResponse = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: data.userId }),
        });

        if (!sessionResponse.ok) {
          throw new Error("Failed to create session");
        }

        setUserId(data.userId);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch user"));
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    async function sync() {
      setIsSyncing(true);
      setError(null);

      try {
        await performInitialSync(userId!);
        console.log("[useEmailSync] Initial sync completed");
      } catch (err) {
        console.error("Error during initial sync:", err);
        setError(err instanceof Error ? err : new Error("Sync failed"));
      } finally {
        setIsSyncing(false);
      }
    }

    sync();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(async () => {
      try {
        await performIncrementalSync(userId!);
      } catch (err) {
        console.error("Error during incremental sync:", err);
      }
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [userId, pollingInterval]);

  return { isSyncing, error, userId };
}
