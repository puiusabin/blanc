import { db } from "@/lib/db";
import { transformDatagramToEmail } from "./transform";
import type { R2EmailDatagram } from "@/types/r2-datagram";

export async function performInitialSync(userId: string): Promise<void> {
  try {
    console.log("[sync] Starting initial sync for userId:", userId);
    const localCount = await db.emails.count();
    if (localCount > 0) {
      return performIncrementalSync(userId);
    }

    const response = await fetch(`/api/mail/emails?userId=${userId}&limit=100`);

    if (!response.ok) {
      throw new Error(`Failed to fetch emails: ${response.statusText}`);
    }

    const { emails: metadata } = (await response.json()) as { emails: any[] };
    console.log("[sync] Fetched metadata:", metadata.length, "emails");

    if (metadata.length === 0) {
      await db.syncCursor.put({
        id: "lastSync",
        userId,
        lastSyncDate: new Date().toISOString(),
        lastSyncTime: Date.now(),
      });
      return;
    }

    const emailIds = metadata.map((m: any) => m.id);
    const batchResponse = await fetch("/api/mail/emails/batch-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailIds }),
    });

    if (!batchResponse.ok) {
      throw new Error(`Failed to fetch batch content: ${batchResponse.statusText}`);
    }

    const { emails: datagrams } = (await batchResponse.json()) as {
      emails: Record<string, R2EmailDatagram>;
    };
    console.log("[sync] Fetched datagrams for", Object.keys(datagrams).length, "emails");

    const emailsToCache = (
      await Promise.all(
        metadata.map(async (meta: any) => {
          const datagram = datagrams[meta.id];
          if (!datagram) return null;
          return await transformDatagramToEmail(datagram, meta);
        })
      )
    ).filter((email: any) => email !== null);
    console.log("[sync] Transformed", emailsToCache.length, "emails for caching");

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

      const newest = emailsToCache.reduce(
        (latest: string, email: any) => (email.timestamp > latest ? email.timestamp : latest),
        emailsToCache[0].timestamp
      );

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

    const response = await fetch(
      `/api/mail/emails?userId=${userId}&since=${cursor.lastSyncDate}&limit=100`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch emails: ${response.statusText}`);
    }

    const { emails: metadata } = (await response.json()) as { emails: any[] };

    if (metadata.length === 0) {
      await db.syncCursor.update("lastSync", { lastSyncTime: Date.now() });
      return;
    }

    const emailIds = metadata.map((m: any) => m.id);
    const batchResponse = await fetch("/api/mail/emails/batch-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailIds }),
    });

    if (!batchResponse.ok) {
      throw new Error(`Failed to fetch batch content: ${batchResponse.statusText}`);
    }

    const { emails: datagrams } = (await batchResponse.json()) as {
      emails: Record<string, R2EmailDatagram>;
    };
    console.log("[sync] Fetched datagrams for", Object.keys(datagrams).length, "emails");

    const emailsToCache = (
      await Promise.all(
        metadata.map(async (meta: any) => {
          const datagram = datagrams[meta.id];
          if (!datagram) return null;
          return await transformDatagramToEmail(datagram, meta);
        })
      )
    ).filter((email: any) => email !== null);
    console.log("[sync] Transformed", emailsToCache.length, "emails for caching");

    if (emailsToCache.length === 0) {
      console.warn("[sync] No new emails to cache - all R2 fetches may have failed");
      await db.syncCursor.update("lastSync", { lastSyncTime: Date.now() });
      return;
    }

    await db.transaction("rw", db.emails, db.syncCursor, async () => {
      await db.emails.bulkPut(emailsToCache);

      const newest = emailsToCache.reduce(
        (latest: string, email: any) => (email.timestamp > latest ? email.timestamp : latest),
        cursor.lastSyncDate
      );

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
