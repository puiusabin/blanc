import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useEffect, useState } from "react";

interface ApiMessage {
  id: string;
  threadId: string | null;
  messageId: string | null;
  userId: string;
  folder: string;
  isRead: boolean;
  isStarred: boolean;
  dateReceived: string;
  from: { email: string; name: string | null } | null;
  subject: string;
  bodyText: string | null;
  bodyHtml: string | null;
}

export function useThreadMessages(threadId: string | null) {
  const [isLoading, setIsLoading] = useState(true);

  // Live query for messages in thread
  const messages = useLiveQuery(async () => {
    if (!threadId) return [];

    return db.emails
      .where("[threadId+timestamp]")
      .between([threadId, 0], [threadId, Date.now()], true, true)
      .toArray();
  }, [threadId]);

  // Fetch from API if not in IndexedDB
  useEffect(() => {
    if (!threadId || messages?.length) return;

    const userId = "testuser"; // TODO: Get from auth context

    fetch(`/api/mail/threads/${threadId}/messages`, {
      headers: {
        "x-user-id": userId,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch messages: ${res.statusText}`);
        }
        return res.json() as Promise<{ messages: ApiMessage[] }>;
      })
      .then(async ({ messages }) => {
        if (messages && messages.length > 0) {
          await db.emails.bulkPut(
            messages.map((msg) => ({
              ...msg,
              syncedAt: Date.now(),
              timestamp: new Date(msg.dateReceived).getTime(),
            }))
          );
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch thread messages:", err);
        setIsLoading(false);
      });
  }, [threadId, messages?.length]);

  return { messages: messages || [], isLoading };
}
