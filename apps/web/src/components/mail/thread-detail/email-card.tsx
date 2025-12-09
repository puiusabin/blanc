"use client";

import type { DbEmail } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SafeEmailRenderer } from "@/components/mail/safe-email-renderer";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
                <span className="font-medium">{email.from.name || email.from.email}</span>
                <span className="text-muted-foreground">&lt;{email.from.email}&gt;</span>
              </div>

              {/* Preview when collapsed */}
              {!isExpanded && email.preview && (
                <div className="text-muted-foreground line-clamp-2">{email.preview}</div>
              )}
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-sm text-muted-foreground shrink-0">{formatDate(email.timestamp)}</div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <>
          {/* Recipients */}
          <div className="px-6 pb-4">
            <div className="text-sm text-muted-foreground">
              To: {email.to.map((addr) => addr.email).join(", ")}
            </div>
            {email.cc && email.cc.length > 0 && (
              <div className="text-sm text-muted-foreground">
                CC: {email.cc.map((addr) => addr.email).join(", ")}
              </div>
            )}
          </div>

          <Separator />

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

          {/* Attachments */}
          {email.hasAttachments && email.attachments && email.attachments.length > 0 && (
            <>
              <Separator />
              <div className="p-6 pt-4">
                <h3 className="text-sm font-medium mb-3">
                  Attachments ({email.attachments.length})
                </h3>
                <div className="flex flex-col gap-2">
                  {email.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-3 p-3 border rounded-md hover:bg-accent transition-colors cursor-pointer"
                    >
                      <svg
                        className="size-5 text-muted-foreground shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attachment.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {(attachment.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </Card>
  );
}
