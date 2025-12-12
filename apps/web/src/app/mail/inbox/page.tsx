"use client";

import { useState, useEffect } from "react";
import { ThreadList } from "@/components/mail/thread-list/thread-list";

export default function InboxPage() {
  const [userId, setUserId] = useState<string | null>(null);

  // Get userId from session/cookie (placeholder)
  useEffect(() => {
    // TODO: Replace with actual session logic
    // For now, using a placeholder userId
    setUserId("test-user-id");
  }, []);

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-svh">
      <div className="border-b px-6 py-4">
        <h1 className="text-2xl font-semibold">Inbox</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <ThreadList folder="INBOX" userId={userId} />
      </div>
    </div>
  );
}
