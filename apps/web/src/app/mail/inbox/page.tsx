"use client"

import { useState } from "react"
import type { Email } from "@/types/email"
import { useEmails } from "@/hooks/use-emails"
import { useEmailSelection } from "@/hooks/use-email-selection"
import { EmailListHeader } from "@/components/mail/email-list/email-list-header"
import { EmailList } from "@/components/mail/email-list/email-list"
import { EmailDetail } from "@/components/mail/email-detail/email-detail"
import { ResizableEmailPanel } from "@/components/mail/email-panel/resizable-email-panel"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function InboxPage() {
  const { emails, refetch } = useEmails({ folder: "inbox" })
  const selection = useEmailSelection()
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)

  const handleSelectAll = (selected: boolean) => {
    selection.selectAll(selected)
    if (selected) {
      emails.forEach((email) => selection.selectOne(email.id, true))
    } else {
      selection.clearSelection()
    }
  }

  const handleEmailClick = (email: Email) => {
    // Mark as read (TODO: API call)
    setSelectedEmail(email)
  }

  const handleClosePanel = () => {
    setSelectedEmail(null)
  }

  return (
    <div className="flex flex-col h-svh">
      <EmailListHeader
        title="Inbox"
        selectedCount={selection.selectedIds.size}
        totalCount={emails.length}
        allSelected={selection.isAllSelected}
        onSelectAll={handleSelectAll}
        onRefresh={refetch}
      />

      <ScrollArea className="flex-1 min-h-0">
        <EmailList
          emails={emails}
          selectedIds={selection.selectedIds}
          onSelect={selection.selectOne}
          onEmailClick={handleEmailClick}
        />
      </ScrollArea>

      <ResizableEmailPanel isOpen={!!selectedEmail} onClose={handleClosePanel}>
        {selectedEmail && (
          <EmailDetail
            email={selectedEmail}
            onReply={() => console.log("Reply")}
            onReplyAll={() => console.log("Reply all")}
            onForward={() => console.log("Forward")}
            onDelete={() => console.log("Delete")}
            onArchive={() => console.log("Archive")}
            onStar={() => console.log("Star")}
          />
        )}
      </ResizableEmailPanel>
    </div>
  )
}
