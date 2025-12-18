"use client";

import { useState } from "react";
import { useThreadMessages } from "@/hooks/use-thread-messages";
import { EmailCard } from "./email-card";

export interface ThreadDetailProps {
  threadId: string;
}

export function ThreadDetail({ threadId }: ThreadDetailProps) {
  const { messages, isLoading } = useThreadMessages(threadId);
  // Expand the most recent message by default
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    if (messages.length > 0) {
      return new Set([messages[messages.length - 1].id]);
    }
    return new Set();
  });

  const toggleExpanded = (emailId: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
      } else {
        newSet.add(emailId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Loading thread...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">No messages in this thread</p>
      </div>
    );
  }

  const threadSubject = messages[0]?.subject || "(no subject)";

  return (
    <div className="animate-in fade-in-0 duration-100 flex flex-col h-full overflow-hidden">
      {/* Thread subject header */}
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold">{threadSubject}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {messages.length} {messages.length === 1 ? "message" : "messages"}
        </p>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <EmailCard
            key={message.id}
            email={message}
            isExpanded={expandedIds.has(message.id)}
            onToggle={() => toggleExpanded(message.id)}
          />
        ))}
      </div>
    </div>
  );
}
