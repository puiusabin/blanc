"use client";

import { useState } from "react";
import type { Email } from "@/types/email";
import { EmailListItem } from "./email-list-item";

export interface EmailListProps {
  emails: Email[];
  selectedIds: Set<string>;
  onSelect: (id: string, selected: boolean) => void;
  onEmailClick: (email: Email) => void;
  className?: string;
}

export function EmailList({
  emails,
  selectedIds,
  onSelect,
  onEmailClick,
  className,
}: EmailListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (emails.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground py-12">
        <p>No emails to display</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col relative ${className || ""}`}>
      {emails.map((email) => (
        <EmailListItem
          key={email.id}
          email={email}
          isSelected={selectedIds.has(email.id)}
          isHovered={hoveredId === email.id}
          onSelect={(selected) => onSelect(email.id, selected)}
          onClick={() => onEmailClick(email)}
          onMouseEnter={() => setHoveredId(email.id)}
          onMouseLeave={() => setHoveredId(null)}
        />
      ))}
    </div>
  );
}
