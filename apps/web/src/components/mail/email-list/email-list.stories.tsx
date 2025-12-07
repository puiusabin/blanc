import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmailList } from "./email-list";
import type { Email } from "@/types/email";
import { useState } from "react";

const meta: Meta<typeof EmailList> = {
  title: "Mail/EmailList",
  component: EmailList,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof EmailList>;

const generateMockEmails = (count: number): Email[] => {
  const senders = [
    { name: "Alice Johnson", email: "alice@example.com" },
    { name: "Bob Smith", email: "bob@company.com" },
    { name: "Carol White", email: "carol@startup.io" },
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `email-${i + 1}`,
    from: senders[i % senders.length],
    to: [{ name: "You", email: "you@blanc.is" }],
    subject: `Email ${i + 1}: Test Subject`,
    preview: `This is preview text for email ${i + 1}`,
    bodyText: `Body content for email ${i + 1}`,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    isRead: i % 3 === 0,
    isStarred: i % 5 === 0,
    folder: "INBOX" as const,
    hasAttachments: i % 4 === 0,
  }));
};

const mockEmails = generateMockEmails(10);

export const Default: Story = {
  render: () => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    return (
      <div className="h-screen">
        <EmailList
          emails={mockEmails}
          selectedIds={selectedIds}
          onSelect={(id, selected) => {
            const newSet = new Set(selectedIds);
            if (selected) {
              newSet.add(id);
            } else {
              newSet.delete(id);
            }
            setSelectedIds(newSet);
          }}
          onEmailClick={(email) => console.log("Clicked:", email.subject)}
        />
      </div>
    );
  },
};

export const WithSelection: Story = {
  render: () => {
    const [selectedIds] = useState<Set<string>>(new Set([mockEmails[0].id, mockEmails[2].id]));

    return (
      <div className="h-screen">
        <EmailList
          emails={mockEmails}
          selectedIds={selectedIds}
          onSelect={() => {}}
          onEmailClick={() => {}}
        />
      </div>
    );
  },
};

export const Empty: Story = {
  render: () => (
    <div className="h-screen">
      <EmailList emails={[]} selectedIds={new Set()} onSelect={() => {}} onEmailClick={() => {}} />
    </div>
  ),
};

export const LongList: Story = {
  render: () => {
    const longList = generateMockEmails(50);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    return (
      <div className="h-screen">
        <EmailList
          emails={longList}
          selectedIds={selectedIds}
          onSelect={(id, selected) => {
            const newSet = new Set(selectedIds);
            if (selected) {
              newSet.add(id);
            } else {
              newSet.delete(id);
            }
            setSelectedIds(newSet);
          }}
          onEmailClick={(email) => console.log("Clicked:", email.subject)}
        />
      </div>
    );
  },
};
