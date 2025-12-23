"use client";

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import Dexie from "dexie";
import { db } from "@/lib/db/schema";
import { syncThreads } from "@/lib/email/sync";
import { useThreadSelection } from "@/hooks/use-thread-selection";
import { ThreadListHeader } from "@/components/mail/thread-list/thread-list-header";
import { ThreadList } from "@/components/mail/thread-list/thread-list";

export default function InboxPage() {
  const selection = useThreadSelection();

  // Live query for threads
  const threads = useLiveQuery(
    () =>
      db.threads
        .where("[folder+lastMessageAt]")
        .between(["INBOX", Dexie.minKey], ["INBOX", Dexie.maxKey], true, true)
        .reverse()
        .toArray(),
    []
  );

  // Background sync on mount and every 60s
  useEffect(() => {
    syncThreads("INBOX");

    const interval = setInterval(() => {
      syncThreads("INBOX");
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleSelectAll = (selected: boolean) => {
    selection.selectAll(selected);
    if (selected && threads) {
      threads.forEach((thread) => selection.selectOne(thread.id, true));
    } else {
      selection.clearSelection();
    }
  };

  const handleRefresh = () => {
    syncThreads("INBOX");
  };

  return (
    <div className="w-full flex flex-col h-svh">
      <ThreadListHeader
        title="Inbox"
        selectedCount={selection.selectedIds.size}
        totalCount={threads?.length || 0}
        allSelected={selection.isAllSelected}
        onSelectAll={handleSelectAll}
        onRefresh={handleRefresh}
      />

      {/* Thread list */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {threads ? (
          <ThreadList
            threads={threads}
            selectedIds={selection.selectedIds}
            onSelect={selection.selectOne}
          />
        ) : (
          <div className="flex items-center justify-center text-muted-foreground py-12">
            <p>Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
}
