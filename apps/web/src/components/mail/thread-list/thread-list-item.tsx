import type { DbThread } from "@/lib/db/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface ThreadListItemProps {
  thread: DbThread;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: (selected: boolean) => void;
  onClick: () => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: () => void;
}

export function ThreadListItem({
  thread,
  isSelected,
  isHovered,
  onSelect,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: ThreadListItemProps) {
  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    onSelect(checked === true);
  };

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

  const isRead = thread.unreadCount === 0;
  const participantNames = thread.participants
    .slice(0, 3)
    .map((p) => p.name || p.email)
    .join(", ");

  const preview =
    thread.messageCount > 1
      ? `${thread.messageCount} messages`
      : thread.participants.map((p) => p.email).join(", ");

  return (
    <div
      className={cn(
        "w-full min-w-0 flex items-center border-b px-4 py-3 cursor-pointer relative transition-colors overflow-hidden",
        isHovered && "bg-muted/50",
        isSelected && "bg-accent/70"
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Checkbox */}
      <div
        className="-my-3 py-3 -mx-2 px-2 cursor-pointer flex items-center"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(!isSelected);
        }}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          className={cn(!isSelected && !isHovered && "invisible")}
        />
      </div>

      {/* Unread indicator */}
      <div className="w-6 shrink-0 flex items-center justify-center">
        {!isRead && <div className="size-1.5 rounded-full bg-primary" />}
      </div>

      {/* Participants */}
      <div className="w-40 shrink-0">
        <span className={cn(isRead ? "text-sm text-muted-foreground" : "text-sm font-medium")}>
          {participantNames}
        </span>
      </div>

      {/* Subject and Preview */}
      <div className="flex-1 min-w-0 ml-4">
        <div className="flex min-w-0 overflow-hidden gap-1.5">
          <div
            className={cn(
              "shrink-0 min-w-0 truncate text-sm max-w-[70%]",
              isRead ? "text-muted-foreground" : "font-medium"
            )}
          >
            {thread.subject}
          </div>
          <div className="shrink-0 text-sm text-muted-foreground/60">|</div>
          <div
            className={cn(
              "flex-1 min-w-0 truncate text-sm",
              isRead ? "text-muted-foreground/80" : "text-muted-foreground"
            )}
          >
            {preview}
          </div>
        </div>
      </div>

      {/* Timestamp */}
      <div className="w-24 shrink-0 text-right ml-4">
        <span
          className={cn(
            isRead ? "text-xs text-muted-foreground/70" : "text-xs text-muted-foreground"
          )}
        >
          {formatTimestamp(thread.lastMessageAt)}
        </span>
      </div>
    </div>
  );
}
