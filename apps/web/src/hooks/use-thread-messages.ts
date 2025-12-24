import { useLiveQuery } from "dexie-react-hooks";
import Dexie from "dexie";
import { db } from "@/lib/db";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

interface ApiMessage {
  id: string;
  messageId: string | null;
  from: { email: string; name: string | null } | null;
  to: { email: string; name: string | null }[];
  cc?: { email: string; name: string | null }[];
  subject: string;
  timestamp: string;
  bodyText: string | null;
  bodyHtml: string | null;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  attachments?: any[];
}

export function useThreadMessages(threadId: string | null) {
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useAuth();

  // Live query for messages in thread
  const messages = useLiveQuery(async () => {
    if (!threadId) return [];

    return db.emails
      .where("[threadId+dateReceived]")
      .between([threadId, Dexie.minKey], [threadId, Dexie.maxKey], true, true)
      .toArray();
  }, [threadId]);

  // Fetch from API if not in IndexedDB
  useEffect(() => {
    if (!threadId || messages?.length || !userId) return;

    fetch(`/api/mail/threads/${threadId}`, {
      headers: {
        "x-user-id": userId,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch thread: ${res.statusText}`);
        }
        return res.json() as Promise<{ thread: any; emails: ApiMessage[] }>;
      })
      .then(async ({ emails }) => {
        if (emails && emails.length > 0) {
          await db.emails.bulkPut(
            emails.map((email) => ({
              id: email.id,
              threadId,
              messageId: email.messageId,
              userId,
              folder: "INBOX",
              isRead: email.isRead,
              isStarred: email.isStarred,
              dateReceived: email.timestamp,
              from: email.from,
              subject: email.subject,
              bodyText: email.bodyText,
              bodyHtml: email.bodyHtml,
              syncedAt: Date.now(),
            }))
          );
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch thread:", err);
        setIsLoading(false);
      });
  }, [threadId, messages?.length, userId]);

  return { messages: messages || [], isLoading };
}
