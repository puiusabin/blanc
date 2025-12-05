// Email types for Prisma Postgres + Cloudflare R2 architecture

export interface EmailAddress {
  name: string;
  email: string;
}

export interface Email {
  id: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  preview: string;
  bodyText: string;
  bodyHtml?: string;
  timestamp: string;
  isRead: boolean;
  isStarred?: boolean;
  labels?: string[];
  folder: EmailFolder;
  hasAttachments: boolean;
  attachments?: EmailAttachment[];
  inReplyTo?: string;
  threadId?: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  r2Key: string;
  url?: string;
}

export type EmailFolder = "INBOX" | "SENT" | "DRAFTS" | "SPAM" | "TRASH" | "ARCHIVE";

export interface EmailFilters {
  folder: EmailFolder;
  isRead?: boolean;
  isStarred?: boolean;
  search?: string;
  labels?: string[];
  from?: string;
  to?: string;
  hasAttachments?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface EmailThread {
  id: string;
  subject: string;
  participants: EmailAddress[];
  emailCount: number;
  lastEmailTimestamp: string;
  isRead: boolean;
  labels?: string[];
  emails: Email[];
}

export interface DraftEmail {
  id?: string;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  attachments?: File[];
  inReplyTo?: string;
  scheduledAt?: string;
}

export interface SendEmailRequest {
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  attachments?: File[];
  inReplyTo?: string;
  scheduledAt?: string;
}

export interface EmailListResponse {
  emails: Email[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface EmailStats {
  total: number;
  unread: number;
  starred: number;
  folders: Record<EmailFolder, number>;
}

// Selection state for email list
export interface EmailSelection {
  selectedIds: Set<string>;
  isAllSelected: boolean;
  selectOne: (id: string, selected: boolean) => void;
  selectAll: (selected: boolean) => void;
  clearSelection: () => void;
  toggleSelection: (id: string) => void;
}
