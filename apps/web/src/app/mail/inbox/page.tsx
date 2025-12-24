"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import Dexie from "dexie";
import { db } from "@/lib/db/schema";
import { syncThreads } from "@/lib/email/sync";
import { useThreadSelection } from "@/hooks/use-thread-selection";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThreadListHeader } from "@/components/mail/thread-list/thread-list-header";
import { ThreadList } from "@/components/mail/thread-list/thread-list";
import { ThreadDetail } from "@/components/mail/thread-detail/thread-detail";
import { ResizableEmailPanel } from "@/components/mail/email-panel/resizable-email-panel";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

export default function InboxPage() {
  const selection = useThreadSelection();
  const isMobile = useIsMobile();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

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

  const handleThreadClick = (threadId: string) => {
    setSelectedThreadId(threadId);
  };

  const handleClosePanel = () => {
    setSelectedThreadId(null);
  };

  const handleNavigateToThread = (direction: "prev" | "next") => {
    if (!threads || !selectedThreadId) return;

    const currentIndex = threads.findIndex((t) => t.id === selectedThreadId);
    if (currentIndex === -1) return;

    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < threads.length) {
      setSelectedThreadId(threads[newIndex].id);
    }
  };

  const selectedThreadIndex = threads?.findIndex((t) => t.id === selectedThreadId) ?? -1;
  const hasPrevious = selectedThreadIndex > 0;
  const hasNext = threads ? selectedThreadIndex < threads.length - 1 : false;

  // Close panel if selected thread is deleted
  useEffect(() => {
    if (selectedThreadId && threads && !threads.find((t) => t.id === selectedThreadId)) {
      setSelectedThreadId(null);
    }
  }, [threads, selectedThreadId]);

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
            onThreadClick={handleThreadClick}
          />
        ) : (
          <div className="flex items-center justify-center text-muted-foreground py-12">
            <p>Loading...</p>
          </div>
        )}
      </div>

      {/* Desktop: Resizable Panel */}
      {!isMobile && selectedThreadId && (
        <ResizableEmailPanel
          isOpen={selectedThreadId !== null}
          onClose={handleClosePanel}
          contentKey={selectedThreadId}
          onNavigatePrevious={() => handleNavigateToThread("prev")}
          onNavigateNext={() => handleNavigateToThread("next")}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
        >
          <ThreadDetail threadId={selectedThreadId} />
        </ResizableEmailPanel>
      )}

      {/* Mobile: Drawer */}
      {isMobile && (
        <Drawer
          open={selectedThreadId !== null}
          onOpenChange={(open) => {
            if (!open) handleClosePanel();
          }}
          direction="right"
        >
          <DrawerContent>
            {selectedThreadId && <ThreadDetail threadId={selectedThreadId} />}
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
