import {
  pgTable,
  text,
  bigint,
  boolean,
  timestamp,
  varchar,
  uuid,
  pgEnum,
  json,
  index,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const planTypeEnum = pgEnum("PlanType", ["FREE", "PREMIUM"]);
export const emailStatusEnum = pgEnum("EmailStatus", ["STORED", "DELETED", "QUARANTINED"]);
export const emailFolderEnum = pgEnum("EmailFolder", [
  "INBOX",
  "SENT",
  "DRAFTS",
  "SPAM",
  "TRASH",
  "ARCHIVE",
]);

// Users table
export const users = pgTable(
  "User",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    planType: planTypeEnum("planType").notNull().default("FREE"),
    quotaBytes: bigint("quotaBytes", { mode: "bigint" }).notNull(),
    usedBytes: bigint("usedBytes", { mode: "bigint" }).notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    emailIdx: index("User_email_idx").on(table.email),
    activeIdx: index("User_active_idx").on(table.active),
  })
);

// Threads table
export const threads = pgTable(
  "Thread",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subject: varchar("subject", { length: 998 }).notNull(),
    rootMessageId: text("rootMessageId"),
    messageCount: integer("messageCount").notNull().default(1),
    unreadCount: integer("unreadCount").notNull().default(1),
    folder: emailFolderEnum("folder").notNull().default("INBOX"),
    hasAttachments: boolean("hasAttachments").notNull().default(false),
    isStarred: boolean("isStarred").notNull().default(false),
    participants: json("participants")
      .$type<Array<{ email: string; name: string | null }>>()
      .notNull()
      .default([]),
    lastMessageAt: timestamp("lastMessageAt").notNull().defaultNow(),
    firstMessageAt: timestamp("firstMessageAt").notNull().defaultNow(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userFolderDateIdx: index("Thread_userId_folder_lastMessageAt_idx").on(
      table.userId,
      table.folder,
      table.lastMessageAt.desc()
    ),
    rootMessageIdx: index("Thread_rootMessageId_idx").on(table.rootMessageId),
  })
);

// Emails table
export const emails = pgTable(
  "Email",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    messageId: text("messageId"),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    threadId: uuid("threadId").references(() => threads.id, { onDelete: "set null" }),
    dateReceived: timestamp("dateReceived").notNull().defaultNow(),
    dateSent: timestamp("dateSent"),
    sizeBytes: bigint("sizeBytes", { mode: "bigint" }).notNull(),
    r2DatagramPath: text("r2DatagramPath").notNull(),
    hasHtml: boolean("hasHtml").notNull().default(false),
    hasPlainText: boolean("hasPlainText").notNull().default(false),
    hasAttachments: boolean("hasAttachments").notNull().default(false),
    attachmentCount: integer("attachmentCount").notNull().default(0),
    encrypted: boolean("encrypted").notNull().default(false),
    isRead: boolean("isRead").notNull().default(false),
    isStarred: boolean("isStarred").notNull().default(false),
    folder: emailFolderEnum("folder").notNull().default("INBOX"),
    status: emailStatusEnum("status").notNull().default("STORED"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userDateIdx: index("Email_userId_dateReceived_idx").on(table.userId, table.dateReceived.desc()),
    userFolderReadIdx: index("Email_userId_folder_isRead_idx").on(
      table.userId,
      table.folder,
      table.isRead
    ),
    userFolderDateIdx: index("Email_userId_folder_dateReceived_idx").on(
      table.userId,
      table.folder,
      table.dateReceived.desc()
    ),
    messageIdIdx: index("Email_messageId_idx").on(table.messageId),
    threadDateIdx: index("Email_threadId_dateReceived_idx").on(
      table.threadId,
      table.dateReceived.desc()
    ),
  })
);

// Attachments table
export const attachments = pgTable(
  "Attachment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    emailId: uuid("emailId")
      .notNull()
      .references(() => emails.id, { onDelete: "cascade" }),
    userId: uuid("userId").notNull(),
    filename: varchar("filename", { length: 255 }).notNull(),
    mimeType: varchar("mimeType", { length: 100 }).notNull(),
    sizeBytes: bigint("sizeBytes", { mode: "bigint" }).notNull(),
    contentId: text("contentId"),
    r2Path: text("r2Path").notNull(),
    isInline: boolean("isInline").notNull().default(false),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    emailIdIdx: index("Attachment_emailId_idx").on(table.emailId),
    userIdIdx: index("Attachment_userId_idx").on(table.userId),
    contentIdIdx: index("Attachment_contentId_idx").on(table.contentId),
  })
);

// Aliases table
export const aliases = pgTable(
  "Alias",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    aliasAddress: text("aliasAddress").notNull().unique(),
    targetUserId: uuid("targetUserId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    aliasIdx: index("Alias_aliasAddress_idx").on(table.aliasAddress),
    targetIdx: index("Alias_targetUserId_idx").on(table.targetUserId),
  })
);

// PGP Keys table
export const pgpKeys = pgTable(
  "PGPKey",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    publicKey: text("publicKey").notNull(),
    privateKey: text("privateKey"),
    fingerprint: text("fingerprint").notNull(),
    algorithm: text("algorithm").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    expiresAt: timestamp("expiresAt"),
  },
  (table) => ({
    userActiveIdx: index("PGPKey_userId_active_idx").on(table.userId, table.active),
    fingerprintIdx: index("PGPKey_fingerprint_idx").on(table.fingerprint),
  })
);

// Relations (for joins)
export const usersRelations = relations(users, ({ many }) => ({
  emails: many(emails),
  threads: many(threads),
  aliases: many(aliases),
  pgpKeys: many(pgpKeys),
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
  user: one(users, {
    fields: [threads.userId],
    references: [users.id],
  }),
  emails: many(emails),
}));

export const emailsRelations = relations(emails, ({ one, many }) => ({
  user: one(users, {
    fields: [emails.userId],
    references: [users.id],
  }),
  thread: one(threads, {
    fields: [emails.threadId],
    references: [threads.id],
  }),
  attachments: many(attachments),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  email: one(emails, {
    fields: [attachments.emailId],
    references: [emails.id],
  }),
}));

export const aliasesRelations = relations(aliases, ({ one }) => ({
  targetUser: one(users, {
    fields: [aliases.targetUserId],
    references: [users.id],
  }),
}));

export const pgpKeysRelations = relations(pgpKeys, ({ one }) => ({
  user: one(users, {
    fields: [pgpKeys.userId],
    references: [users.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Thread = typeof threads.$inferSelect;
export type NewThread = typeof threads.$inferInsert;
export type Email = typeof emails.$inferSelect;
export type NewEmail = typeof emails.$inferInsert;
export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;
export type Alias = typeof aliases.$inferSelect;
export type NewAlias = typeof aliases.$inferInsert;
export type PGPKey = typeof pgpKeys.$inferSelect;
export type NewPGPKey = typeof pgpKeys.$inferInsert;
