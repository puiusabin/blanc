import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { EmailFolder } from "@/types/email";
import { useEffect } from "react";

interface ApiEmail {
  id: string;
  threadId: string | null;
  messageId: string | null;
  userId: string;
  folder: string;
  isRead: boolean;
  isStarred: boolean;
  dateReceived: string;
  from: { email: string; name: string | null } | null;
  subject: string;
  bodyText: string | null;
  bodyHtml: string | null;
}

interface ApiThread {
  id: string;
  userId: string;
  subject: string;
  participants: { email: string; name: string | null }[];
  messageCount: number;
  unreadCount: number;
  hasAttachments: boolean;
  isStarred: boolean;
  folder: string;
  lastMessageAt: string;
  firstMessageAt: string;
  lastMessageDate: string;
}

interface SyncResponse {
  newEmails: ApiEmail[];
  newThreads: ApiThread[];
  updatedThreads: ApiThread[];
  cursor: number;
}

export interface UseThreadsOptions {
  folder: EmailFolder;
  search?: string;
}

export function useThreads({ folder, search }: UseThreadsOptions) {
  // Live query from IndexedDB
  const threads = useLiveQuery(async () => {
    const userId = "testuser"; // TODO: Get from auth context

    const query = db.threads
      .where("[userId+folder+lastMessageDate]")
      .between([userId, folder, 0], [userId, folder, Date.now()], true, true)
      .reverse(); // Latest first

    const results = await query.toArray();

    // Client-side search filtering
    if (search) {
      const searchLower = search.toLowerCase();
      return results.filter(
        (t) =>
          t.subject.toLowerCase().includes(searchLower) ||
          t.participants.some((p) => p.email.toLowerCase().includes(searchLower))
      );
    }

    return results;
  }, [folder, search]);

  // Background sync every 60 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await syncThreads();
    }, 60_000);

    // Initial sync
    syncThreads();

    return () => clearInterval(interval);
  }, []);

  return { threads: threads || [], isLoading: !threads };
}

async function syncThreads() {
  const userId = "testuser"; // TODO: Get from auth context

  try {
    const cursor = await db.syncCursor.get("threads");
    const response = await fetch(`/api/mail/sync?since=${cursor?.lastSyncTime || 0}`, {
      headers: {
        "x-user-id": userId,
      },
    });

    if (!response.ok) {
      console.error("Sync failed:", response.statusText);
      return;
    }

    const {
      newEmails,
      newThreads,
      updatedThreads,
      cursor: newCursor,
    } = (await response.json()) as SyncResponse;

    await db.transaction("rw", [db.emails, db.threads, db.syncCursor], async () => {
      // Insert new emails
      if (newEmails && newEmails.length > 0) {
        await db.emails.bulkPut(
          newEmails.map((email) => ({
            ...email,
            syncedAt: Date.now(),
          }))
        );
      }

      // Insert new threads
      if (newThreads && newThreads.length > 0) {
        await db.threads.bulkPut(
          newThreads.map((thread) => ({
            ...thread,
            lastMessageDate: new Date(thread.lastMessageDate).getTime(),
          }))
        );
      }

      // Update existing threads
      if (updatedThreads && updatedThreads.length > 0) {
        await db.threads.bulkPut(
          updatedThreads.map((thread) => ({
            ...thread,
            lastMessageDate: new Date(thread.lastMessageDate).getTime(),
          }))
        );
      }

      // Update cursor
      await db.syncCursor.put({
        id: "threads",
        userId: "testuser",
        lastSyncDate: new Date().toISOString(),
        lastSyncTime: newCursor,
      });
    });
  } catch (error) {
    console.error("Error syncing threads:", error);
  }
}
