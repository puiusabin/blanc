import type { Email } from "@/types/email";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface EmailListItemProps {
  email: Email;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: (selected: boolean) => void;
  onClick: () => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: () => void;
}

export function EmailListItem({
  email,
  isSelected,
  isHovered,
  onSelect,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: EmailListItemProps) {
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
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else if (days < 14) {
      return "Last week";
    } else {
      return `${Math.floor(days / 7)} weeks ago`;
    }
  };

  return (
    <div
      className={cn(
        "flex items-center border-b px-4 py-3 cursor-pointer relative transition-colors",
        isHovered && "bg-muted/50",
        isSelected && "bg-blue-500/10"
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
          className={cn(
            "data-[state=checked]:!bg-blue-500 data-[state=checked]:!border-blue-500",
            !isSelected && !isHovered && "invisible"
          )}
        />
      </div>

      {/* Unread indicator */}
      <div className="w-6 shrink-0 flex items-center justify-center">
        {!email.isRead && <div className="size-1.5 rounded-full bg-blue-500" />}
      </div>

      {/* Sender */}
      <div className="w-40 shrink-0">
        <span
          className={cn(
            "text-sm",
            !email.isRead && "font-semibold",
            email.isRead && "text-muted-foreground"
          )}
        >
          {email.from.name}
        </span>
      </div>

      {/* Subject and Preview */}
      <div className="flex-1 min-w-0 text-sm truncate ml-4">
        <span
          className={cn(!email.isRead && "font-semibold", email.isRead && "text-muted-foreground")}
        >
          {email.subject}
        </span>
        <span
          className={cn(
            !email.isRead ? "text-muted-foreground" : "text-muted-foreground/70 font-light"
          )}
        >
          {" "}
          — {email.preview}
        </span>
      </div>

      {/* Timestamp */}
      <div className="w-24 shrink-0 text-right ml-4">
        <span
          className={cn(
            "text-xs",
            !email.isRead ? "text-muted-foreground" : "text-muted-foreground/70 font-light"
          )}
        >
          {formatTimestamp(email.timestamp)}
        </span>
      </div>
    </div>
  );
}
