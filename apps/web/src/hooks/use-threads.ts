import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { EmailFolder } from "@/types/email";
import { useEffect } from "react";

export interface UseThreadsOptions {
  folder: EmailFolder;
  search?: string;
}

export function useThreads({ folder, search }: UseThreadsOptions) {
  // Live query from IndexedDB
  const threads = useLiveQuery(async () => {
    const userId = "testuser"; // TODO: Get from auth context

    let query = db.threads
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
    const response = await fetch(`/api/mail/sync?since=${cursor?.value || 0}`, {
      headers: {
        "x-user-id": userId,
      },
    });

    if (!response.ok) {
      console.error("Sync failed:", response.statusText);
      return;
    }

    const { newEmails, newThreads, updatedThreads, cursor: newCursor } = await response.json();

    await db.transaction("rw", [db.emails, db.threads, db.syncCursor], async () => {
      // Insert new emails
      if (newEmails && newEmails.length > 0) {
        await db.emails.bulkPut(
          newEmails.map((email: any) => ({
            ...email,
            syncedAt: Date.now(),
          }))
        );
      }

      // Insert new threads
      if (newThreads && newThreads.length > 0) {
        await db.threads.bulkPut(
          newThreads.map((thread: any) => ({
            ...thread,
            lastMessageDate: new Date(thread.lastMessageDate).getTime(),
          }))
        );
      }

      // Update existing threads
      if (updatedThreads && updatedThreads.length > 0) {
        await db.threads.bulkPut(
          updatedThreads.map((thread: any) => ({
            ...thread,
            lastMessageDate: new Date(thread.lastMessageDate).getTime(),
          }))
        );
      }

      // Update cursor
      await db.syncCursor.put({ id: "threads", value: newCursor });
    });
  } catch (error) {
    console.error("Error syncing threads:", error);
  }
}
