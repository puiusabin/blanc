import { db } from "@/lib/db/schema";

/**
 * Sync threads from API to local Dexie database
 * No race pattern needed - Dexie live queries handle reactivity
 */
export async function syncThreads(userId: string, folder: string = "INBOX") {
  try {
    const response = await fetch(`/api/mail/threads?folder=${folder}&limit=50`, {
      headers: { "x-user-id": userId },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch threads: ${response.statusText}`);
    }

    const { threads } = (await response.json()) as { threads: any[] };

    // Bulk upsert into Dexie
    await db.threads.bulkPut(
      threads.map((t: any) => ({
        ...t,
        syncedAt: Date.now(),
      }))
    );

    return threads;
  } catch (error) {
    console.error("Failed to sync threads:", error);
    throw error;
  }
}

/**
 * Sync messages for a specific thread
 */
export async function syncThreadMessages(userId: string, threadId: string) {
  try {
    const response = await fetch(`/api/mail/threads/${threadId}`, {
      headers: { "x-user-id": userId },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch thread: ${response.statusText}`);
    }

    const { emails } = (await response.json()) as { emails: any[] };

    // Bulk upsert emails
    await db.emails.bulkPut(
      emails.map((e: any) => ({
        ...e,
        from: e.from || null,
        syncedAt: Date.now(),
      }))
    );

    return emails;
  } catch (error) {
    console.error("Failed to sync thread messages:", error);
    throw error;
  }
}

/**
 * Mark email as read (optimistic update)
 */
export async function markEmailRead(emailId: string, isRead: boolean) {
  await db.emails.update(emailId, { isRead });
}

/**
 * Update thread folder (optimistic update)
 */
export async function updateThreadFolder(threadId: string, folder: string) {
  await db.threads.update(threadId, { folder });
}
