import { db } from "@/lib/db/schema";
import { fetchEmailMetadata, fetchAndTransformEmails, findNewestTimestamp } from "./sync-helpers";

export async function performInitialSync(userId: string): Promise<void> {
  try {
    console.log("[sync] Starting initial sync for userId:", userId);
    const localCount = await db.emails.count();
    if (localCount > 0) {
      return performIncrementalSync(userId);
    }

    const metadata = await fetchEmailMetadata();

    if (metadata.length === 0) {
      await db.syncCursor.put({
        id: "lastSync",
        userId,
        lastSyncDate: new Date().toISOString(),
        lastSyncTime: Date.now(),
      });
      return;
    }

    const emailsToCache = await fetchAndTransformEmails(metadata);

    if (emailsToCache.length === 0) {
      console.warn("[sync] No emails to cache - all R2 fetches may have failed");
      await db.syncCursor.put({
        id: "lastSync",
        userId,
        lastSyncDate: new Date().toISOString(),
        lastSyncTime: Date.now(),
      });
      return;
    }

    await db.transaction("rw", db.emails, db.syncCursor, async () => {
      await db.emails.bulkPut(emailsToCache);

      const newest = findNewestTimestamp(emailsToCache, emailsToCache[0].timestamp);

      await db.syncCursor.put({
        id: "lastSync",
        userId,
        lastSyncDate: newest,
        lastSyncTime: Date.now(),
      });
    });
    console.log("[sync] Successfully wrote to IndexedDB");
  } catch (error) {
    console.error("Error performing initial sync:", error);
    throw error;
  }
}

export async function performIncrementalSync(userId: string): Promise<void> {
  try {
    const cursor = await db.syncCursor.get("lastSync");
    if (!cursor) {
      return performInitialSync(userId);
    }

    const metadata = await fetchEmailMetadata(cursor.lastSyncDate);

    if (metadata.length === 0) {
      await db.syncCursor.update("lastSync", { lastSyncTime: Date.now() });
      return;
    }

    const emailsToCache = await fetchAndTransformEmails(metadata);

    if (emailsToCache.length === 0) {
      console.warn("[sync] No new emails to cache - all R2 fetches may have failed");
      await db.syncCursor.update("lastSync", { lastSyncTime: Date.now() });
      return;
    }

    await db.transaction("rw", db.emails, db.syncCursor, async () => {
      await db.emails.bulkPut(emailsToCache);

      const newest = findNewestTimestamp(emailsToCache, cursor.lastSyncDate);

      await db.syncCursor.put({
        id: "lastSync",
        userId,
        lastSyncDate: newest,
        lastSyncTime: Date.now(),
      });
    });
  } catch (error) {
    console.error("Error performing incremental sync:", error);
    throw error;
  }
}
