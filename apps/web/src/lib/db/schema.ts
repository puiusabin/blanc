import Dexie, { type EntityTable } from "dexie";
import type { Email } from "@/types/email";

export interface DbEmail extends Email {
  syncedAt: number; // Unix timestamp when cached locally
}

export interface DbSyncCursor {
  id: "lastSync"; // Singleton record
  userId: string;
  lastSyncDate: string; // ISO timestamp of last synced email
  lastSyncTime: number; // Unix timestamp of sync operation
}

export class EmailDatabase extends Dexie {
  emails!: EntityTable<DbEmail, "id">;
  syncCursor!: EntityTable<DbSyncCursor, "id">;

  constructor() {
    super("BlancEmailDB");

    this.version(1).stores({
      emails: "id, folder, timestamp, isRead, isStarred, [folder+timestamp], [folder+isRead]",
      syncCursor: "id",
    });
  }
}

export const db = new EmailDatabase();
