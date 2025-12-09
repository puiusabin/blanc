"use client";

import { useState } from "react";
import type { DbThread } from "@/lib/db";
import { ThreadListItem } from "./thread-list-item";

export interface ThreadListProps {
  threads: DbThread[];
  selectedThreadId?: string | null;
  onThreadSelect: (threadId: string) => void;
}

export function ThreadList({ threads, selectedThreadId, onThreadSelect }: ThreadListProps) {
  const [hoveredThreadId, setHoveredThreadId] = useState<string | null>(null);

  if (threads.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">No threads found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {threads.map((thread) => (
          <ThreadListItem
            key={thread.threadId}
            thread={thread}
            isSelected={thread.threadId === selectedThreadId}
            isHovered={thread.threadId === hoveredThreadId}
            onSelect={() => onThreadSelect(thread.threadId)}
            onMouseEnter={() => setHoveredThreadId(thread.threadId)}
            onMouseLeave={() => setHoveredThreadId(null)}
          />
        ))}
      </div>
    </div>
  );
}
