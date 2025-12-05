"use client";

import { useLiveQuery } from "dexie-react-hooks";
import type { Email, EmailFolder } from "@/types/email";
import { db } from "@/lib/db";
import { useEmailSync } from "./use-email-sync";
import { performIncrementalSync } from "@/lib/email/sync";

export interface UseEmailsOptions {
  folder: EmailFolder;
  search?: string;
  isRead?: boolean;
}

export interface UseEmailsResult {
  emails: Email[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useEmails({ folder, search, isRead }: UseEmailsOptions): UseEmailsResult {
  const { isSyncing, error: syncError, userId } = useEmailSync();

  const emails = useLiveQuery(async () => {
    let query = db.emails.where("folder").equals(folder);

    if (isRead !== undefined) {
      query = query.filter((e) => e.isRead === isRead);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      query = query.filter(
        (e) =>
          e.subject.toLowerCase().includes(searchLower) ||
          e.from.name.toLowerCase().includes(searchLower) ||
          e.from.email.toLowerCase().includes(searchLower)
      );
    }

    const results = await query.toArray();

    return results.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [folder, search, isRead]);

  const refetch = () => {
    if (userId) {
      performIncrementalSync(userId).catch((err) => {
        console.error("Error during manual refetch:", err);
      });
    }
  };

  return {
    emails: emails || [],
    isLoading: emails === undefined || isSyncing,
    error: syncError,
    refetch,
  };
}
