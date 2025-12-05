"use client";

import { useState } from "react";
import type { Email } from "@/types/email";
import { useEmails } from "@/hooks/use-emails";
import { useEmailSelection } from "@/hooks/use-email-selection";
import { EmailListHeader } from "@/components/mail/email-list/email-list-header";
import { EmailList } from "@/components/mail/email-list/email-list";
import { EmailDetail } from "@/components/mail/email-detail/email-detail";
import { ResizableEmailPanel } from "@/components/mail/email-panel/resizable-email-panel";

export default function InboxPage() {
  const { emails, refetch } = useEmails({ folder: "INBOX" });
  const selection = useEmailSelection();
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const handleSelectAll = (selected: boolean) => {
    selection.selectAll(selected);
    if (selected) {
      emails.forEach((email) => selection.selectOne(email.id, true));
    } else {
      selection.clearSelection();
    }
  };

  const handleEmailClick = (email: Email) => {
    // Mark as read (TODO: API call)
    setSelectedEmail(email);
  };

  const handleClosePanel = () => {
    setSelectedEmail(null);
  };

  const handleNavigatePrevious = () => {
    if (!selectedEmail) return;
    const currentIndex = emails.findIndex((e) => e.id === selectedEmail.id);
    if (currentIndex > 0) {
      setSelectedEmail(emails[currentIndex - 1]);
    }
  };

  const handleNavigateNext = () => {
    if (!selectedEmail) return;
    const currentIndex = emails.findIndex((e) => e.id === selectedEmail.id);
    if (currentIndex < emails.length - 1) {
      setSelectedEmail(emails[currentIndex + 1]);
    }
  };

  const currentEmailIndex = selectedEmail ? emails.findIndex((e) => e.id === selectedEmail.id) : -1;

  const hasPrevious = currentEmailIndex > 0;
  const hasNext = currentEmailIndex >= 0 && currentEmailIndex < emails.length - 1;

  return (
    <div className="w-full flex flex-col h-svh">
      <EmailListHeader
        title="Inbox"
        selectedCount={selection.selectedIds.size}
        totalCount={emails.length}
        allSelected={selection.isAllSelected}
        onSelectAll={handleSelectAll}
        onRefresh={refetch}
      />

      <div className="flex-1 min-h-0 overflow-y-auto">
        <EmailList
          emails={emails}
          selectedIds={selection.selectedIds}
          onSelect={selection.selectOne}
          onEmailClick={handleEmailClick}
        />
      </div>

      <ResizableEmailPanel
        isOpen={!!selectedEmail}
        onClose={handleClosePanel}
        contentKey={selectedEmail?.id}
        onNavigatePrevious={handleNavigatePrevious}
        onNavigateNext={handleNavigateNext}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
      >
        {selectedEmail && <EmailDetail email={selectedEmail} />}
      </ResizableEmailPanel>
    </div>
  );
}
