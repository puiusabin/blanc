import type { DbThread } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface ThreadListItemProps {
  thread: DbThread;
  onClick: () => void;
}

export function ThreadListItem({ thread, onClick }: ThreadListItemProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      return date
        .toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
        .toLowerCase();
    }
  };

  const participantNames = thread.participants.map((p) => p.name || p.email).join(", ");

  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3 p-3 hover:bg-accent/50 cursor-pointer border-b transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <div className={cn("font-medium truncate", thread.unreadCount > 0 && "text-foreground")}>
            {participantNames}
          </div>
          <div className="text-xs text-muted-foreground shrink-0">
            {formatTimestamp(thread.lastMessageAt)}
          </div>
        </div>

        <div
          className={cn(
            "truncate text-sm mb-1",
            thread.unreadCount > 0 ? "font-semibold" : "text-muted-foreground"
          )}
        >
          {thread.subject}
        </div>

        <div className="flex items-center gap-2">
          {thread.messageCount > 1 && (
            <Badge variant="secondary" className="text-xs">
              {thread.messageCount}
            </Badge>
          )}

          {thread.unreadCount > 0 && <div className="size-2 rounded-full bg-blue-600" />}
        </div>
      </div>
    </div>
  );
}
