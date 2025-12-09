import type { DbThread } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface ThreadListItemProps {
  thread: DbThread;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: () => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: () => void;
}

export function ThreadListItem({
  thread,
  isSelected,
  isHovered,
  onSelect,
  onMouseEnter,
  onMouseLeave,
}: ThreadListItemProps) {
  const formatTimestamp = (timestamp: number) => {
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

  const formatParticipants = () => {
    const names = thread.participants
      .slice(0, 3)
      .map((p) => p.name || p.email.split("@")[0])
      .join(", ");

    if (thread.participants.length > 3) {
      return `${names} +${thread.participants.length - 3}`;
    }

    return names;
  };

  const hasUnread = thread.unreadCount > 0;

  return (
    <div
      className={cn(
        "w-full min-w-0 flex items-center border-b px-4 py-3 cursor-pointer relative transition-colors overflow-hidden",
        isHovered && "bg-muted/50",
        isSelected && "bg-accent/70"
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onSelect}
    >
      {/* Unread indicator */}
      <div className="w-6 shrink-0 flex items-center justify-center">
        {hasUnread && <div className="size-1.5 rounded-full bg-primary" />}
      </div>

      {/* Participants */}
      <div className="w-40 shrink-0">
        <span className={cn(hasUnread ? "text-sm font-medium" : "text-sm text-muted-foreground")}>
          {formatParticipants()}
        </span>
      </div>

      {/* Subject and counts */}
      <div className="flex-1 min-w-0 ml-4">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={cn(
              "flex-1 min-w-0 truncate text-sm",
              hasUnread ? "font-medium" : "text-muted-foreground"
            )}
          >
            {thread.subject}
          </div>

          {/* Message count badge */}
          {thread.messageCount > 1 && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {thread.messageCount}
            </Badge>
          )}

          {/* Unread count badge */}
          {hasUnread && (
            <Badge variant="default" className="shrink-0 text-xs">
              {thread.unreadCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Timestamp */}
      <div className="w-24 shrink-0 text-right ml-4">
        <span
          className={cn(
            hasUnread ? "text-xs text-muted-foreground" : "text-xs text-muted-foreground/70"
          )}
        >
          {formatTimestamp(thread.lastMessageDate)}
        </span>
      </div>
    </div>
  );
}
