import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmailListItem } from "./email-list-item";
import { generateMockEmail } from "@/lib/mock-emails";

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
    separatorVariant: {
      control: "select",
      options: ["none", "bullet", "em-dash", "pipe"],
      description: "Separator variant to use",
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmailListItem>;

const mockEmail = generateMockEmail(0, "inbox");
const readEmail = { ...generateMockEmail(1, "inbox"), isRead: true };
const emailWithAttachment = {
  ...generateMockEmail(2, "inbox"),
  hasAttachments: true,
};

const shortSubjectEmail = {
  ...generateMockEmail(3, "inbox"),
  subject: "Hi",
  preview:
    "This is a very long preview text that should take up most of the available space since the subject is extremely short",
};

const longSubjectEmail = {
  ...generateMockEmail(4, "inbox"),
  subject: "Re: Q4 Budget Proposal Review Meeting Follow-up Discussion Points and Action Items",
  preview: "Let's discuss the key points from yesterday's meeting and plan next steps",
};

const mediumSubjectEmail = {
  ...generateMockEmail(5, "inbox"),
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

export const SeparatorComparison: Story = {
  render: () => (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">Separator Variants Comparison</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Compare all separator styles with medium-length subject/preview
        </p>
      </div>

      {(["none", "bullet", "em-dash", "pipe"] as const).map((variant) => (
        <div key={variant} className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground capitalize">
            {variant === "none"
              ? "No Separator"
              : variant === "em-dash"
                ? "Em Dash (—)"
                : variant === "bullet"
                  ? "Bullet (•)"
                  : "Pipe (|)"}
          </h3>
          <div className="border rounded-lg overflow-hidden">
            <EmailListItem
              email={mediumSubjectEmail}
              isSelected={false}
              onSelect={() => {}}
              onClick={() => {}}
              separatorVariant={variant}
            />
            <EmailListItem
              email={{ ...mediumSubjectEmail, isRead: true }}
              isSelected={false}
              onSelect={() => {}}
              onClick={() => {}}
              separatorVariant={variant}
            />
          </div>
        </div>
      ))}
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
        separatorVariant="bullet"
      />

      <div className="border-b px-4 py-2 bg-muted/30 text-xs font-mono">
        Medium subject (balanced)
      </div>
      <EmailListItem
        email={mediumSubjectEmail}
        isSelected={false}
        onSelect={() => {}}
        onClick={() => {}}
        separatorVariant="bullet"
      />

      <div className="border-b px-4 py-2 bg-muted/30 text-xs font-mono">
        Long subject (both truncate at 70/30)
      </div>
      <EmailListItem
        email={longSubjectEmail}
        isSelected={false}
        onSelect={() => {}}
        onClick={() => {}}
        separatorVariant="bullet"
      />
    </div>
  ),
};
