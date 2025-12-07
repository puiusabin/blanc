import type { R2EmailDatagram } from "@/types/r2-datagram";
import type { DbEmail } from "@/lib/db/schema";
import { transformDatagramToEmail } from "./transform";

/**
 * Email metadata shape from API response
 * Matches EmailMetadata from route.ts
 */
export interface EmailMetadata {
  id: string;
  isRead: boolean;
  isStarred: boolean;
  folder: string;
}

/**
 * Fetch email metadata with optional cursor for incremental sync
 */
export async function fetchEmailMetadata(cursor?: string): Promise<EmailMetadata[]> {
  const url = cursor ? `/api/mail/emails?since=${cursor}&limit=100` : `/api/mail/emails?limit=100`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch emails: ${response.statusText}`);
  }

  const { emails } = (await response.json()) as { emails: EmailMetadata[] };
  console.log("[sync] Fetched metadata:", emails.length, "emails");

  return emails;
}

/**
 * Fetch batch content from R2 and transform to DbEmail format
 */
export async function fetchAndTransformEmails(metadata: EmailMetadata[]): Promise<DbEmail[]> {
  if (metadata.length === 0) {
    return [];
  }

  const emailIds = metadata.map((m) => m.id);
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
      metadata.map(async (meta) => {
        const datagram = datagrams[meta.id];
        if (!datagram) return null;
        return await transformDatagramToEmail(datagram, meta);
      })
    )
  ).filter((email): email is DbEmail => email !== null);

  console.log("[sync] Transformed", emailsToCache.length, "emails for caching");
  return emailsToCache;
}

/**
 * Calculate newest timestamp from email array
 */
export function findNewestTimestamp(emails: DbEmail[], fallback: string): string {
  if (emails.length === 0) {
    return fallback;
  }

  return emails.reduce(
    (latest: string, email: DbEmail) => (email.timestamp > latest ? email.timestamp : latest),
    emails[0].timestamp
  );
}
