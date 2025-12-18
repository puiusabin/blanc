"use client";

import type { DbEmail } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { SafeEmailRenderer } from "@/components/mail/safe-email-renderer";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface EmailCardProps {
  email: DbEmail;
  isExpanded: boolean;
  onToggle: () => void;
}

export function EmailCard({ email, isExpanded, onToggle }: EmailCardProps) {
  const formatDate = (timestamp: string | number) => {
    const date = typeof timestamp === "string" ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card className="w-full">
      {/* Email header - always visible, clickable to toggle */}
      <div
        className="flex items-start justify-between gap-4 px-6 py-4 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Expand/collapse icon */}
          <div className="pt-0.5">
            {isExpanded ? (
              <ChevronDown className="size-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-4 text-muted-foreground" />
            )}
          </div>

          {/* Sender info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {email.from?.name || email.from?.email || "Unknown"}
                </span>
                {email.from?.email && (
                  <span className="text-muted-foreground">&lt;{email.from.email}&gt;</span>
                )}
              </div>

              {/* Preview when collapsed */}
              {!isExpanded && email.bodyText && (
                <div className="text-muted-foreground line-clamp-2">
                  {email.bodyText.substring(0, 150)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-sm text-muted-foreground shrink-0">
          {formatDate(email.dateReceived)}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <>
          {/* Email body */}
          <div className="p-6">
            {email.bodyHtml ? (
              <SafeEmailRenderer
                html={email.bodyHtml}
                onLinkClick={(url) => {
                  window.open(url, "_blank", "noopener,noreferrer");
                }}
              />
            ) : (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{email.bodyText}</div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
