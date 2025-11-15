import type { Email } from "@/types/email"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export interface EmailListItemProps {
  email: Email
  isSelected: boolean
  isHovered?: boolean
  onSelect: (selected: boolean) => void
  onClick: () => void
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void
  onMouseLeave?: () => void
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
    onSelect(checked === true)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } else if (days === 1) {
      return "Yesterday"
    } else if (days < 7) {
      return `${days} days ago`
    } else if (days < 14) {
      return "Last week"
    } else {
      return `${Math.floor(days / 7)} weeks ago`
    }
  }

  return (
    <div
      className={cn(
        "flex items-center border-b px-4 py-3 cursor-pointer relative transition-colors",
        isHovered && "bg-accent/50",
        isSelected && "bg-accent/30"
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Checkbox */}
      <Checkbox
        checked={isSelected}
        onCheckedChange={handleCheckboxChange}
        onClick={(e) => e.stopPropagation()}
        className="mr-2"
      />

      {/* Unread indicator */}
      <div className="w-6 shrink-0 flex items-center justify-center">
        {!email.isRead && <div className="size-2 rounded-full bg-blue-500" />}
      </div>

      {/* Sender */}
      <div className="w-40 shrink-0">
        <span className={cn("text-sm", !email.isRead && "font-medium")}>
          {email.from.name}
        </span>
      </div>

      {/* Subject and Preview */}
      <div className="flex-1 min-w-0 text-sm truncate ml-4">
        <span className={cn(!email.isRead && "font-semibold")}>
          {email.subject}
        </span>
        <span className="text-muted-foreground"> {email.preview}</span>
      </div>

      {/* Timestamp */}
      <div className="w-24 shrink-0 text-right ml-4">
        <span className="text-xs text-muted-foreground">
          {formatTimestamp(email.timestamp)}
        </span>
      </div>

      {/* Attachments indicator */}
      {email.hasAttachments && (
        <div className="ml-2 shrink-0">
          <svg
            className="size-4 text-muted-foreground"
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
        </div>
      )}
    </div>
  )
}
