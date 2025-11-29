import type { Email } from "@/types/email";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { SafeEmailRenderer } from "@/components/mail/safe-email-renderer";

export interface EmailDetailProps {
  email: Email;
}

export function EmailDetail({ email }: EmailDetailProps) {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
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
    <div className="animate-in fade-in-0 duration-100 p-6">
      {/* Subject header - outside card since threads share subject */}
      <div className="max-w-2xl mx-auto w-full mb-4">
        <h2 className="text-xl font-semibold">{email.subject}</h2>
      </div>

      <Card className="max-w-2xl mx-auto w-full block">
        {/* Email header */}
        <div className="flex flex-col gap-3 px-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{email.from.name}</span>
                  <span className="text-muted-foreground">&lt;{email.from.email}&gt;</span>
                </div>
                <div className="text-muted-foreground">
                  To: {email.to.map((addr) => addr.email).join(", ")}
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground shrink-0">
              {formatDate(email.timestamp)}
            </div>
          </div>
        </div>

        <Separator />

        {/* Email body */}
        <div className="p-6">
          {email.bodyHtml ? (
            <SafeEmailRenderer
              html={email.bodyHtml}
              onLinkClick={(url) => {
                // Open links in new tab with security restrictions
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
              <h3 className="text-sm font-medium mb-3">Attachments ({email.attachments.length})</h3>
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
      </Card>
    </div>
  );
}
