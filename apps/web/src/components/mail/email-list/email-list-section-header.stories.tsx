import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmailListSectionHeader } from "./email-list-section-header";

const meta: Meta<typeof EmailListSectionHeader> = {
  title: "Mail/EmailListSectionHeader",
  component: EmailListSectionHeader,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof EmailListSectionHeader>;

export const Today: Story = {
  args: {
    title: "today",
    count: 5,
  },
};

export const Yesterday: Story = {
  args: {
    title: "yesterday",
    count: 3,
  },
};

export const ThisWeek: Story = {
  args: {
    title: "this week",
    count: 12,
  },
};

export const Older: Story = {
  args: {
    title: "older",
    count: 27,
  },
};

export const AllSections: Story = {
  render: () => (
    <div className="max-w-4xl bg-background">
      <EmailListSectionHeader title="today" count={5} />
      <div className="h-20 border-b px-4 py-3 text-sm">Sample email content</div>
      <EmailListSectionHeader title="yesterday" count={3} />
      <div className="h-20 border-b px-4 py-3 text-sm">Sample email content</div>
      <EmailListSectionHeader title="this week" count={12} />
      <div className="h-20 border-b px-4 py-3 text-sm">Sample email content</div>
      <EmailListSectionHeader title="older" count={27} />
      <div className="h-20 border-b px-4 py-3 text-sm">Sample email content</div>
    </div>
  ),
};
