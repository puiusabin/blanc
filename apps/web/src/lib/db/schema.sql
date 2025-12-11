-- SQLite Schema for Email Threading (Client-Side Cache)
-- Stores thread and email metadata for offline-first experience
-- Inspired by Notion's WASM SQLite architecture

-- Threads table
CREATE TABLE IF NOT EXISTS threads (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  subject TEXT NOT NULL,
  participants TEXT NOT NULL,  -- JSON array: [{"email":"...","name":"..."}]
  messageCount INTEGER NOT NULL DEFAULT 1,
  unreadCount INTEGER NOT NULL DEFAULT 1,
  hasAttachments INTEGER NOT NULL DEFAULT 0,  -- SQLite uses 0/1 for boolean
  isStarred INTEGER NOT NULL DEFAULT 0,
  folder TEXT NOT NULL DEFAULT 'INBOX',
  lastMessageAt TEXT NOT NULL,  -- ISO timestamp
  firstMessageAt TEXT NOT NULL,
  syncedAt INTEGER NOT NULL  -- Unix timestamp
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_threads_folder_lastMessageAt
  ON threads(folder, lastMessageAt DESC);
CREATE INDEX IF NOT EXISTS idx_threads_userId
  ON threads(userId);

-- Emails table
CREATE TABLE IF NOT EXISTS emails (
  id TEXT PRIMARY KEY,
  threadId TEXT,
  messageId TEXT,
  userId TEXT NOT NULL,
  folder TEXT NOT NULL,
  isRead INTEGER NOT NULL DEFAULT 0,
  isStarred INTEGER NOT NULL DEFAULT 0,
  dateReceived TEXT NOT NULL,  -- ISO timestamp
  fromEmail TEXT,
  fromName TEXT,
  subject TEXT,
  bodyText TEXT,
  bodyHtml TEXT,
  syncedAt INTEGER NOT NULL,
  FOREIGN KEY (threadId) REFERENCES threads(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_emails_threadId_dateReceived
  ON emails(threadId, dateReceived ASC);
CREATE INDEX IF NOT EXISTS idx_emails_folder
  ON emails(folder);

-- Full-text search (for future use)
CREATE VIRTUAL TABLE IF NOT EXISTS emails_fts USING fts5(
  id UNINDEXED,
  subject,
  bodyText,
  fromEmail,
  fromName
);

-- Sync cursor
CREATE TABLE IF NOT EXISTS sync_cursor (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  lastSyncDate TEXT NOT NULL,
  lastSyncTime INTEGER NOT NULL
);
