"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Dexie from "dexie";
import { db } from "@/lib/db/schema";
import { syncThreads } from "@/lib/email/sync";
import { ThreadListItem } from "./thread-list-item";

export interface ThreadListProps {
  folder: string;
  userId: string;
}

export function ThreadList({ folder, userId }: ThreadListProps) {
  const router = useRouter();

  // Live query - automatically updates when Dexie data changes
  const threads = useLiveQuery(
    () =>
      db.threads
        .where("[folder+lastMessageAt]")
        .between([folder, Dexie.minKey], [folder, Dexie.maxKey], true, true)
        .reverse()
        .toArray(),
    [folder]
  );

  // Background sync on mount and every 60s
  useEffect(() => {
    syncThreads(userId, folder);

    const interval = setInterval(() => {
      syncThreads(userId, folder);
    }, 60000);

    return () => clearInterval(interval);
  }, [folder, userId]);

  if (!threads) {
    return (
      <div className="flex items-center justify-center text-muted-foreground py-12">
        <p>Loading...</p>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground py-12">
        <p>No threads in {folder}</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {threads.map((thread) => (
        <ThreadListItem
          key={thread.id}
          thread={thread}
          onClick={() => router.push(`/mail/thread/${thread.id}`)}
        />
      ))}
    </div>
  );
}
