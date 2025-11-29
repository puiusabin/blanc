import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmailDetail } from "./email-detail";
import { generateMockEmail } from "@/lib/mock-emails";

const meta: Meta<typeof EmailDetail> = {
  title: "Mail/EmailDetail",
  component: EmailDetail,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof EmailDetail>;

const mockEmail = generateMockEmail(0, "inbox");
const emailWithAttachment = {
  ...generateMockEmail(1, "inbox"),
  hasAttachments: true,
};
const starredEmail = {
  ...generateMockEmail(2, "inbox"),
  isStarred: true,
};

export const Default: Story = {
  args: {
    email: mockEmail,
  },
  render: (args) => (
    <div className="h-screen">
      <EmailDetail {...args} />
    </div>
  ),
};

export const WithAttachments: Story = {
  args: {
    email: emailWithAttachment,
  },
  render: (args) => (
    <div className="h-screen">
      <EmailDetail {...args} />
    </div>
  ),
};

export const Starred: Story = {
  args: {
    email: starredEmail,
  },
  render: (args) => (
    <div className="h-screen">
      <EmailDetail {...args} />
    </div>
  ),
};

export const LongContent: Story = {
  args: {
    email: {
      ...mockEmail,
      bodyText: `Hi there,

This is a much longer email with multiple paragraphs to demonstrate how the component handles longer content.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Best regards,
The Team`,
    },
  },
  render: (args) => (
    <div className="h-screen">
      <EmailDetail {...args} />
    </div>
  ),
};
