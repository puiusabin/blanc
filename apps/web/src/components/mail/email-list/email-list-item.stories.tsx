import type { Meta, StoryObj } from "@storybook/react"
import { EmailListItem } from "./email-list-item"
import { generateMockEmail } from "@/lib/mock-emails"

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
}

export default meta
type Story = StoryObj<typeof EmailListItem>

const mockEmail = generateMockEmail(0, "inbox")
const readEmail = { ...generateMockEmail(1, "inbox"), isRead: true }
const emailWithAttachment = {
  ...generateMockEmail(2, "inbox"),
  hasAttachments: true,
}

export const Unread: Story = {
  args: {
    email: mockEmail,
    isSelected: false,
    onSelect: () => {},
    onClick: () => {},
  },
}

export const Read: Story = {
  args: {
    email: readEmail,
    isSelected: false,
    onSelect: () => {},
    onClick: () => {},
  },
}

export const Selected: Story = {
  args: {
    email: mockEmail,
    isSelected: true,
    onSelect: () => {},
    onClick: () => {},
  },
}

export const Hovered: Story = {
  args: {
    email: mockEmail,
    isSelected: false,
    isHovered: true,
    onSelect: () => {},
    onClick: () => {},
  },
}

export const WithAttachment: Story = {
  args: {
    email: emailWithAttachment,
    isSelected: false,
    onSelect: () => {},
    onClick: () => {},
  },
}

export const SelectedAndRead: Story = {
  args: {
    email: readEmail,
    isSelected: true,
    onSelect: () => {},
    onClick: () => {},
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="max-w-4xl">
      <EmailListItem
        email={mockEmail}
        isSelected={false}
        onSelect={() => {}}
        onClick={() => {}}
      />
      <EmailListItem
        email={readEmail}
        isSelected={false}
        onSelect={() => {}}
        onClick={() => {}}
      />
      <EmailListItem
        email={mockEmail}
        isSelected={true}
        onSelect={() => {}}
        onClick={() => {}}
      />
      <EmailListItem
        email={emailWithAttachment}
        isSelected={false}
        onSelect={() => {}}
        onClick={() => {}}
      />
    </div>
  ),
}
