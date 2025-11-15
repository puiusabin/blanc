import type { Meta, StoryObj } from "@storybook/react"
import { EmailListHeader } from "./email-list-header"

const meta: Meta<typeof EmailListHeader> = {
  title: "Mail/EmailListHeader",
  component: EmailListHeader,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    showRefresh: {
      control: "boolean",
    },
    allSelected: {
      control: "boolean",
    },
  },
}

export default meta
type Story = StoryObj<typeof EmailListHeader>

export const Default: Story = {
  args: {
    title: "Inbox",
    totalCount: 20,
    selectedCount: 0,
    allSelected: false,
    onSelectAll: () => {},
    onRefresh: () => {},
  },
}

export const WithSelection: Story = {
  args: {
    title: "Inbox",
    totalCount: 20,
    selectedCount: 5,
    allSelected: false,
    onSelectAll: () => {},
    onRefresh: () => {},
  },
}

export const AllSelected: Story = {
  args: {
    title: "Inbox",
    totalCount: 20,
    selectedCount: 20,
    allSelected: true,
    onSelectAll: () => {},
    onRefresh: () => {},
  },
}

export const Sent: Story = {
  args: {
    title: "Sent",
    totalCount: 15,
    selectedCount: 0,
    allSelected: false,
    onSelectAll: () => {},
    onRefresh: () => {},
  },
}

export const Drafts: Story = {
  args: {
    title: "Drafts",
    totalCount: 5,
    selectedCount: 0,
    allSelected: false,
    onSelectAll: () => {},
    onRefresh: () => {},
  },
}

export const NoRefresh: Story = {
  args: {
    title: "Archive",
    totalCount: 100,
    selectedCount: 0,
    allSelected: false,
    showRefresh: false,
    onSelectAll: () => {},
  },
}
