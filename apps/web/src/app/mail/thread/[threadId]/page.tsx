"use client";

import { use, useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/schema";
import { syncThreadMessages } from "@/lib/email/sync";
import { EmailCard } from "@/components/mail/email-card";
import type { EmailFolder } from "@/types/email";

export default function ThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = use(params);
  // TODO: Replace with actual session logic
  const [userId] = useState<string>("test-user-id");

  // Live query for emails in this thread
  const emails = useLiveQuery(
    () => db.emails.where("threadId").equals(threadId).sortBy("dateReceived"),
    [threadId]
  );

  // Sync thread messages
  useEffect(() => {
    if (!userId) return;

    syncThreadMessages(userId, threadId).catch((error) => {
      console.error("Failed to sync thread messages:", error);
    });
  }, [threadId, userId]);

  if (!emails) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading conversation...</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No messages in this thread</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6 max-w-4xl mx-auto">
      {emails.map((email) => (
        <EmailCard
          key={email.id}
          email={{
            id: email.id,
            from: email.from
              ? { email: email.from.email, name: email.from.name || email.from.email }
              : { email: "unknown@example.com", name: "Unknown" },
            to: [], // TODO: Add to field to DbEmail
            subject: email.subject,
            preview: "", // Not needed for conversation view
            bodyText: email.bodyText || "",
            bodyHtml: email.bodyHtml || undefined,
            timestamp: email.dateReceived,
            isRead: email.isRead,
            folder: email.folder as EmailFolder,
            hasAttachments: false, // TODO: Add attachments support
            attachments: [],
          }}
        />
      ))}
    </div>
  );
}
