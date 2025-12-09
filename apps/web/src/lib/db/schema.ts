import Dexie, { type EntityTable } from "dexie";
import type { Email, EmailFolder } from "@/types/email";

export interface DbThread {
  threadId: string;
  userId: string;
  subject: string;
  messageCount: number;
  unreadCount: number;
  lastMessageDate: number; // Unix timestamp
  participants: Array<{ email: string; name: string | null }>;
  folder: EmailFolder;
}

export interface DbEmail extends Email {
  threadId?: string | null; // Thread this email belongs to
  inReplyTo?: string | null; // Message-ID of parent email
  references?: string[]; // Full conversation chain
  syncedAt: number; // Unix timestamp when cached locally
}

export interface DbSyncCursor {
  id: "lastSync" | "threads"; // Support multiple cursors
  userId?: string;
  lastSyncDate?: string; // ISO timestamp of last synced email
  lastSyncTime?: number; // Unix timestamp of sync operation
  value?: any; // Generic value for flexible cursor data
}

export class EmailDatabase extends Dexie {
  threads!: EntityTable<DbThread, "threadId">;
  emails!: EntityTable<DbEmail, "id">;
  syncCursor!: EntityTable<DbSyncCursor, "id">;

  constructor() {
    super("BlancEmailDB");

    // Version 1: Original schema
    this.version(1).stores({
      emails: "id, folder, timestamp, isRead, isStarred, [folder+timestamp], [folder+isRead]",
      syncCursor: "id",
    });

    // Version 2: Add threads table and threading fields to emails
    this.version(2)
      .stores({
        threads: "&threadId, [userId+folder+lastMessageDate], userId",
        emails:
          "id, threadId, messageId, [threadId+timestamp], folder, timestamp, isRead, isStarred, [folder+timestamp], [folder+isRead]",
        syncCursor: "id",
      })
      .upgrade(async (tx) => {
        // Migrate existing emails: set threadId = id (standalone threads)
        const emails = await tx.table("emails").toArray();
        await tx.table("emails").bulkPut(
          emails.map((email: any) => ({
            ...email,
            threadId: email.threadId || email.id,
            inReplyTo: null,
            references: [],
          }))
        );

        // Create thread records for existing emails
        const threads: Record<string, DbThread> = {};
        emails.forEach((email: any) => {
          const threadId = email.threadId || email.id;
          if (!threads[threadId]) {
            threads[threadId] = {
              threadId,
              userId: "testuser", // TODO: Get from actual user context
              subject: email.subject || "(no subject)",
              messageCount: 1,
              unreadCount: email.isRead ? 0 : 1,
              lastMessageDate: email.timestamp,
              participants: [
                {
                  email: email.from?.address || email.from?.email || "unknown@example.com",
                  name: email.from?.name || null,
                },
              ],
              folder: email.folder,
            };
          }
        });

        await tx.table("threads").bulkPut(Object.values(threads));
      });
  }
}

export const db = new EmailDatabase();
