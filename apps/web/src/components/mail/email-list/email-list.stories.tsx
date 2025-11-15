import type { Meta, StoryObj } from "@storybook/react"
import { EmailList } from "./email-list"
import { generateMockEmails } from "@/lib/mock-emails"
import { useState } from "react"

const meta: Meta<typeof EmailList> = {
  title: "Mail/EmailList",
  component: EmailList,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof EmailList>

const mockEmails = generateMockEmails(10, "inbox")

export const Default: Story = {
  render: () => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    return (
      <div className="h-screen">
        <EmailList
          emails={mockEmails}
          selectedIds={selectedIds}
          onSelect={(id, selected) => {
            const newSet = new Set(selectedIds)
            if (selected) {
              newSet.add(id)
            } else {
              newSet.delete(id)
            }
            setSelectedIds(newSet)
          }}
          onEmailClick={(email) => console.log("Clicked:", email.subject)}
        />
      </div>
    )
  },
}

export const WithSelection: Story = {
  render: () => {
    const [selectedIds] = useState<Set<string>>(
      new Set([mockEmails[0].id, mockEmails[2].id])
    )

    return (
      <div className="h-screen">
        <EmailList
          emails={mockEmails}
          selectedIds={selectedIds}
          onSelect={() => {}}
          onEmailClick={() => {}}
        />
      </div>
    )
  },
}

export const Empty: Story = {
  render: () => (
    <div className="h-screen">
      <EmailList
        emails={[]}
        selectedIds={new Set()}
        onSelect={() => {}}
        onEmailClick={() => {}}
      />
    </div>
  ),
}

export const LongList: Story = {
  render: () => {
    const longList = generateMockEmails(50, "inbox")
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    return (
      <div className="h-screen">
        <EmailList
          emails={longList}
          selectedIds={selectedIds}
          onSelect={(id, selected) => {
            const newSet = new Set(selectedIds)
            if (selected) {
              newSet.add(id)
            } else {
              newSet.delete(id)
            }
            setSelectedIds(newSet)
          }}
          onEmailClick={(email) => console.log("Clicked:", email.subject)}
        />
      </div>
    )
  },
}
