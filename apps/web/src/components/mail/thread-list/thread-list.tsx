"use client";

import { useState } from "react";
import type { DbThread } from "@/lib/db/schema";
import { ThreadListItem } from "./thread-list-item";

export interface ThreadListProps {
  threads: DbThread[];
  selectedIds: Set<string>;
  onSelect: (id: string, selected: boolean) => void;
  onThreadClick: (threadId: string) => void;
  className?: string;
}

export function ThreadList({
  threads,
  selectedIds,
  onSelect,
  onThreadClick,
  className,
}: ThreadListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (threads.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground py-12">
        <p>No threads to display</p>
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col relative ${className || ""}`}>
      {threads.map((thread) => (
        <ThreadListItem
          key={thread.id}
          thread={thread}
          isSelected={selectedIds.has(thread.id)}
          isHovered={hoveredId === thread.id}
          onSelect={(selected) => onSelect(thread.id, selected)}
          onClick={() => onThreadClick(thread.id)}
          onMouseEnter={() => setHoveredId(thread.id)}
          onMouseLeave={() => setHoveredId(null)}
        />
      ))}
    </div>
  );
}
