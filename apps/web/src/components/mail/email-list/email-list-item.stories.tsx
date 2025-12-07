import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmailListItem } from "./email-list-item";
import type { Email } from "@/types/email";

const meta: Meta<typeof EmailListItem> = {
  title: "Mail/EmailListItem",
  component: EmailListItem,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    isSelected: {
      control: "boolean",
    },
    isHovered: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmailListItem>;

const baseMockEmail: Email = {
  id: "email-1",
  from: { name: "Alice Johnson", email: "alice@example.com" },
  to: [{ name: "You", email: "you@blanc.is" }],
  subject: "Meeting Tomorrow",
  preview: "Hi, just wanted to confirm our meeting...",
  bodyText: "Meeting content",
  timestamp: new Date().toISOString(),
  isRead: false,
  isStarred: false,
  folder: "INBOX",
  hasAttachments: false,
};

const mockEmail = baseMockEmail;
const readEmail: Email = { ...baseMockEmail, id: "email-2", isRead: true };
const emailWithAttachment: Email = {
  ...baseMockEmail,
  id: "email-3",
  hasAttachments: true,
};

const shortSubjectEmail: Email = {
  ...baseMockEmail,
  id: "email-4",
  subject: "Hi",
  preview:
    "This is a very long preview text that should take up most of the available space since the subject is extremely short",
};

const longSubjectEmail: Email = {
  ...baseMockEmail,
  id: "email-5",
  subject: "Re: Q4 Budget Proposal Review Meeting Follow-up Discussion Points and Action Items",
  preview: "Let's discuss the key points from yesterday's meeting and plan next steps",
};

const mediumSubjectEmail: Email = {
  ...baseMockEmail,
  id: "email-6",
  subject: "Project Update",
  preview: "The latest updates on the project are looking great and we're ahead of schedule",
};

export const Unread: Story = {
  args: {
    email: mockEmail,
    isSelected: false,
    onSelect: () => {},
    onClick: () => {},
  },
};

export const Read: Story = {
  args: {
    email: readEmail,
    isSelected: false,
    onSelect: () => {},
    onClick: () => {},
  },
};

export const Selected: Story = {
  args: {
    email: mockEmail,
    isSelected: true,
    onSelect: () => {},
    onClick: () => {},
  },
};

export const Hovered: Story = {
  args: {
    email: mockEmail,
    isSelected: false,
    isHovered: true,
    onSelect: () => {},
    onClick: () => {},
  },
};

export const WithAttachment: Story = {
  args: {
    email: emailWithAttachment,
    isSelected: false,
    onSelect: () => {},
    onClick: () => {},
  },
};

export const SelectedAndRead: Story = {
  args: {
    email: readEmail,
    isSelected: true,
    onSelect: () => {},
    onClick: () => {},
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="max-w-4xl">
      <EmailListItem email={mockEmail} isSelected={false} onSelect={() => {}} onClick={() => {}} />
      <EmailListItem email={readEmail} isSelected={false} onSelect={() => {}} onClick={() => {}} />
      <EmailListItem email={mockEmail} isSelected={true} onSelect={() => {}} onClick={() => {}} />
      <EmailListItem
        email={emailWithAttachment}
        isSelected={false}
        onSelect={() => {}}
        onClick={() => {}}
      />
    </div>
  ),
};

export const ShortSubject: Story = {
  args: {
    email: shortSubjectEmail,
    isSelected: false,
    onSelect: () => {},
    onClick: () => {},
  },
};

export const LongSubject: Story = {
  args: {
    email: longSubjectEmail,
    isSelected: false,
    onSelect: () => {},
    onClick: () => {},
  },
};

export const ReadAndUnread: Story = {
  render: () => (
    <div className="max-w-4xl">
      <div>
        <h2 className="text-lg font-semibold mb-4">Read vs Unread States</h2>
        <p className="text-sm text-muted-foreground mb-6">Compare read and unread email styling</p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <EmailListItem
          email={mediumSubjectEmail}
          isSelected={false}
          onSelect={() => {}}
          onClick={() => {}}
        />
        <EmailListItem
          email={{ ...mediumSubjectEmail, isRead: true }}
          isSelected={false}
          onSelect={() => {}}
          onClick={() => {}}
        />
      </div>
    </div>
  ),
};

export const TruncationTest: Story = {
  render: () => (
    <div className="max-w-4xl space-y-0">
      <div className="border-b px-4 py-2 bg-muted/30 text-xs font-mono">
        Short subject (preview expands)
      </div>
      <EmailListItem
        email={shortSubjectEmail}
        isSelected={false}
        onSelect={() => {}}
        onClick={() => {}}
      />

      <div className="border-b px-4 py-2 bg-muted/30 text-xs font-mono">
        Medium subject (balanced)
      </div>
      <EmailListItem
        email={mediumSubjectEmail}
        isSelected={false}
        onSelect={() => {}}
        onClick={() => {}}
      />

      <div className="border-b px-4 py-2 bg-muted/30 text-xs font-mono">
        Long subject (both truncate at 70/30)
      </div>
      <EmailListItem
        email={longSubjectEmail}
        isSelected={false}
        onSelect={() => {}}
        onClick={() => {}}
      />
    </div>
  ),
};
