"use client";

import { useState } from "react";
import { useThreads } from "@/hooks/use-threads";
import { ThreadList } from "@/components/mail/thread-list/thread-list";
import { ThreadDetail } from "@/components/mail/thread-detail/thread-detail";
import { ResizableEmailPanel } from "@/components/mail/email-panel/resizable-email-panel";

export default function InboxPage() {
  const { threads, isLoading } = useThreads({ folder: "INBOX" });
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const handleThreadSelect = (threadId: string) => {
    setSelectedThreadId(threadId);
  };

  const handleClosePanel = () => {
    setSelectedThreadId(null);
  };

  const handleNavigatePrevious = () => {
    if (!selectedThreadId) return;
    const currentIndex = threads.findIndex((t) => t.threadId === selectedThreadId);
    if (currentIndex > 0) {
      setSelectedThreadId(threads[currentIndex - 1].threadId);
    }
  };

  const handleNavigateNext = () => {
    if (!selectedThreadId) return;
    const currentIndex = threads.findIndex((t) => t.threadId === selectedThreadId);
    if (currentIndex < threads.length - 1) {
      setSelectedThreadId(threads[currentIndex + 1].threadId);
    }
  };

  const currentThreadIndex = selectedThreadId
    ? threads.findIndex((t) => t.threadId === selectedThreadId)
    : -1;

  const hasPrevious = currentThreadIndex > 0;
  const hasNext = currentThreadIndex >= 0 && currentThreadIndex < threads.length - 1;

  return (
    <div className="w-full flex flex-col h-svh">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <h1 className="text-lg font-semibold">Inbox</h1>
      </div>

      {/* Thread list */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <ThreadList
          threads={threads}
          selectedThreadId={selectedThreadId}
          onThreadSelect={handleThreadSelect}
        />
      </div>

      {/* Thread detail panel */}
      <ResizableEmailPanel
        isOpen={!!selectedThreadId}
        onClose={handleClosePanel}
        contentKey={selectedThreadId}
        onNavigatePrevious={handleNavigatePrevious}
        onNavigateNext={handleNavigateNext}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
      >
        {selectedThreadId && <ThreadDetail threadId={selectedThreadId} />}
      </ResizableEmailPanel>
    </div>
  );
}
