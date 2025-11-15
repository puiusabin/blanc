import type { Meta, StoryObj } from "@storybook/react"
import { ResizableEmailPanel } from "./resizable-email-panel"
import { EmailDetail } from "../email-detail/email-detail"
import { generateMockEmail } from "@/lib/mock-emails"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const meta: Meta<typeof ResizableEmailPanel> = {
  title: "Mail/ResizableEmailPanel",
  component: ResizableEmailPanel,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof ResizableEmailPanel>

const mockEmail = generateMockEmail(0, "inbox")

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true)

    return (
      <div className="h-screen flex items-center justify-center bg-accent/20">
        <Button onClick={() => setIsOpen(true)}>Open Email Panel</Button>
        <ResizableEmailPanel isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <EmailDetail email={mockEmail} />
        </ResizableEmailPanel>
      </div>
    )
  },
}

export const WithCustomWidth: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true)

    return (
      <div className="h-screen flex items-center justify-center bg-accent/20">
        <Button onClick={() => setIsOpen(true)}>Open Email Panel</Button>
        <ResizableEmailPanel
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          defaultWidth={800}
        >
          <EmailDetail email={mockEmail} />
        </ResizableEmailPanel>
      </div>
    )
  },
}

export const NarrowPanel: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true)

    return (
      <div className="h-screen flex items-center justify-center bg-accent/20">
        <Button onClick={() => setIsOpen(true)}>Open Email Panel</Button>
        <ResizableEmailPanel
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          defaultWidth={400}
          minWidth={300}
        >
          <EmailDetail email={mockEmail} />
        </ResizableEmailPanel>
      </div>
    )
  },
}

export const CustomContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true)

    return (
      <div className="h-screen flex items-center justify-center bg-accent/20">
        <Button onClick={() => setIsOpen(true)}>Open Panel</Button>
        <ResizableEmailPanel isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Custom Content</h2>
            <p className="text-muted-foreground">
              This panel can contain any content, not just emails. Try resizing it
              by dragging the left edge!
            </p>
          </div>
        </ResizableEmailPanel>
      </div>
    )
  },
}
