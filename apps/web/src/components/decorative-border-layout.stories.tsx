import type { Meta, StoryObj } from "@storybook/react"
import { DecorativeBorderLayout } from "./decorative-border-layout"
import { useState } from "react"

const meta: Meta<typeof DecorativeBorderLayout> = {
  title: "App/DecorativeBorderLayout",
  component: DecorativeBorderLayout,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof DecorativeBorderLayout>

export const Default: Story = {
  render: () => (
    <div className="h-screen">
      <DecorativeBorderLayout>
        <div className="flex items-center justify-center flex-1">
          <p className="text-muted-foreground">Content goes here</p>
        </div>
      </DecorativeBorderLayout>
    </div>
  ),
}

export const WithCloseButton: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true)

    if (!isOpen) {
      return (
        <div className="flex items-center justify-center h-screen">
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 rounded-md border hover:bg-accent"
          >
            Open Layout
          </button>
        </div>
      )
    }

    return (
      <div className="h-screen">
        <DecorativeBorderLayout onClose={() => setIsOpen(false)}>
          <div className="flex items-center justify-center flex-1">
            <p className="text-muted-foreground">
              Click the X button in the top-right to close
            </p>
          </div>
        </DecorativeBorderLayout>
      </div>
    )
  },
}

export const WithContent: Story = {
  render: () => (
    <div className="h-screen">
      <DecorativeBorderLayout onClose={() => console.log("Close clicked")}>
        <div className="flex-1 overflow-auto p-6">
          <h1 className="text-2xl font-semibold mb-4">Page Title</h1>
          <div className="space-y-4">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Section {i + 1}</h3>
                <p className="text-sm text-muted-foreground">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            ))}
          </div>
        </div>
      </DecorativeBorderLayout>
    </div>
  ),
}

export const WithSidebar: Story = {
  render: () => (
    <div className="h-screen">
      <DecorativeBorderLayout onClose={() => console.log("Close clicked")}>
        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-56 shrink-0 bg-sidebar border-r flex flex-col">
            <div className="flex-1 overflow-auto p-2">
              <div className="mb-4">
                <div className="px-2 py-1.5 text-xs font-medium text-sidebar-foreground/70 mb-1">
                  Navigation
                </div>
                <div className="space-y-0.5">
                  {["Dashboard", "Projects", "Team", "Settings"].map((item) => (
                    <button
                      key={item}
                      className="w-full flex items-center gap-2 text-left px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto p-6">
              <h1 className="text-2xl font-semibold mb-4">Content Area</h1>
              <p className="text-muted-foreground">
                This demonstrates the decorative border layout with a sidebar
                and content area, similar to the settings dialog.
              </p>
            </div>
          </div>
        </div>
      </DecorativeBorderLayout>
    </div>
  ),
}

export const SettingsExample: Story = {
  render: () => (
    <div className="h-screen">
      <DecorativeBorderLayout onClose={() => console.log("Close clicked")}>
        <div className="flex flex-1 min-h-0">
          {/* Settings Sidebar */}
          <div className="w-56 shrink-0 bg-sidebar border-r flex flex-col">
            <div className="flex-1 overflow-auto p-2">
              <div className="mb-4">
                <div className="px-2 py-1.5 text-xs font-medium text-sidebar-foreground/70 mb-1">
                  General
                </div>
                <div className="space-y-0.5">
                  {["Account", "Plans", "Appearance", "Security"].map((item) => (
                    <button
                      key={item}
                      className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="px-2 py-1.5 text-xs font-medium text-sidebar-foreground/70 mb-1">
                  Application
                </div>
                <div className="space-y-0.5">
                  {["Custom domains", "Import", "Notifications", "Signature"].map(
                    (item) => (
                      <button
                        key={item}
                        className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto p-6">
              <h1 className="text-2xl font-semibold mb-2">Account Settings</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Manage your account settings and preferences
              </p>

              <div className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-md border bg-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 rounded-md border bg-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>

                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground">
                    Save changes
                  </button>
                  <button className="px-4 py-2 rounded-md border">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DecorativeBorderLayout>
    </div>
  ),
}

export const MinimalContent: Story = {
  render: () => (
    <div className="h-[600px]">
      <DecorativeBorderLayout>
        <div className="flex items-center justify-center flex-1 p-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">Empty State</h2>
            <p className="text-sm text-muted-foreground">
              No content to display
            </p>
          </div>
        </div>
      </DecorativeBorderLayout>
    </div>
  ),
}

export const WithScrollableContent: Story = {
  render: () => (
    <div className="h-[600px]">
      <DecorativeBorderLayout onClose={() => console.log("Close clicked")}>
        <div className="flex-1 overflow-auto p-6">
          <h1 className="text-2xl font-semibold mb-4">Scrollable Content</h1>
          <div className="space-y-4 pb-6">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <h3 className="font-medium mb-1">Item {i + 1}</h3>
                <p className="text-sm text-muted-foreground">
                  This content demonstrates scrolling within the decorative
                  border layout.
                </p>
              </div>
            ))}
          </div>
        </div>
      </DecorativeBorderLayout>
    </div>
  ),
}
