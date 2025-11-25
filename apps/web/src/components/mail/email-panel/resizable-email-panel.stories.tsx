import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ResizableEmailPanel } from "./resizable-email-panel";
import { EmailDetail } from "../email-detail/email-detail";
import { generateMockEmail } from "@/lib/mock-emails";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof ResizableEmailPanel> = {
  title: "Mail/ResizableEmailPanel",
  component: ResizableEmailPanel,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: {
      description: "Controls panel visibility",
    },
    onClose: {
      description:
        "Triggered only by Escape key or close button. Clicking outside does NOT close the panel.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ResizableEmailPanel>;

const mockEmail = generateMockEmail(0, "inbox");

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <div className="h-screen flex items-center justify-center bg-accent/20">
        <Button onClick={() => setIsOpen(true)}>Open Email Panel</Button>
        <ResizableEmailPanel isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <EmailDetail email={mockEmail} />
        </ResizableEmailPanel>
      </div>
    );
  },
};

export const WithCustomWidth: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <div className="h-screen flex items-center justify-center bg-accent/20">
        <Button onClick={() => setIsOpen(true)}>Open Email Panel</Button>
        <ResizableEmailPanel isOpen={isOpen} onClose={() => setIsOpen(false)} defaultWidth={800}>
          <EmailDetail email={mockEmail} />
        </ResizableEmailPanel>
      </div>
    );
  },
};

export const NarrowPanel: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

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
    );
  },
};

export const CustomContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <div className="h-screen flex items-center justify-center bg-accent/20">
        <Button onClick={() => setIsOpen(true)}>Open Panel</Button>
        <ResizableEmailPanel isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Custom Content</h2>
            <p className="text-muted-foreground">
              This panel can contain any content, not just emails. Try resizing it by dragging the
              left edge!
            </p>
          </div>
        </ResizableEmailPanel>
      </div>
    );
  },
};

export const PersistentPanel: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState(generateMockEmail(0, "inbox"));

    const mockEmails = [
      generateMockEmail(0, "inbox"),
      generateMockEmail(1, "inbox"),
      generateMockEmail(2, "inbox"),
    ];

    return (
      <div className="h-screen flex bg-accent/20">
        <div className="flex-1 p-8">
          <h2 className="text-xl font-bold mb-4">Email List</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Click emails to view. Panel stays open and content updates. Press Escape to close.
          </p>
          <div className="space-y-2">
            {mockEmails.map((email) => (
              <div
                key={email.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => {
                  setSelectedEmail(email);
                  setIsOpen(true);
                }}
              >
                <div className="font-medium">{email.from.name}</div>
                <div className="text-sm text-muted-foreground truncate">{email.subject}</div>
              </div>
            ))}
          </div>
        </div>
        <ResizableEmailPanel isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <EmailDetail email={selectedEmail} />
        </ResizableEmailPanel>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates the persistent panel behavior. Click different emails to switch content without closing the panel. The panel only closes when pressing Escape or clicking the X button.",
      },
    },
  },
};
