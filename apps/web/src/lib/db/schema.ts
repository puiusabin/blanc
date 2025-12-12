import Dexie, { type EntityTable } from "dexie";

export interface DbThread {
  id: string;
  userId: string;
  subject: string;
  participants: { email: string; name: string | null }[];
  messageCount: number;
  unreadCount: number;
  hasAttachments: boolean;
  isStarred: boolean;
  folder: string;
  lastMessageAt: string; // ISO timestamp
  firstMessageAt: string;
  syncedAt: number; // Unix timestamp
}

export interface DbEmail {
  id: string;
  threadId: string | null;
  messageId: string | null;
  userId: string;
  folder: string;
  isRead: boolean;
  isStarred: boolean;
  dateReceived: string; // ISO timestamp
  from: { email: string; name: string | null } | null;
  subject: string;
  bodyText: string | null;
  bodyHtml: string | null;
  syncedAt: number;
}

export interface DbSyncCursor {
  id: string;
  userId: string;
  lastSyncDate: string;
  lastSyncTime: number;
}

export class EmailDatabase extends Dexie {
  threads!: EntityTable<DbThread, "id">;
  emails!: EntityTable<DbEmail, "id">;
  syncCursor!: EntityTable<DbSyncCursor, "id">;

  constructor() {
    super("BlancEmailDB");

    // Version 2: Fixed compound index (removed redundant lastMessageAt)
    this.version(2).stores({
      threads: "id, userId, [folder+lastMessageAt]",
      emails: "id, threadId, userId, [folder+dateReceived]",
      syncCursor: "id",
    });
  }
}

export const db = new EmailDatabase();
