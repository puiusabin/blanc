import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const meta: Meta<typeof AppSidebar> = {
  title: "App/AppSidebar",
  component: AppSidebar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <SidebarProvider>
        <Story />
      </SidebarProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AppSidebar>;

export const Default: Story = {
  render: () => (
    <>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <h1 className="font-semibold">Mail</h1>
        </header>
        <div className="flex-1 p-4">
          <p className="text-muted-foreground">
            This is the main mail sidebar with navigation, search, and settings.
          </p>
        </div>
      </SidebarInset>
    </>
  ),
};

export const WithInbox: Story = {
  render: () => (
    <>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <h1 className="font-semibold">Inbox</h1>
        </header>
        <div className="flex-1 p-4">
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium">Welcome to Blanc Mail</p>
                  <p className="text-sm text-muted-foreground">hello@blanc.is</p>
                </div>
                <span className="text-xs text-muted-foreground">2m ago</span>
              </div>
              <p className="text-sm">
                Thank you for signing up! Get started by composing your first email.
              </p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  ),
};

export const CollapsibleNone: Story = {
  render: () => (
    <>
      <AppSidebar collapsible="none" />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <h1 className="font-semibold">Non-Collapsible Sidebar</h1>
        </header>
        <div className="flex-1 p-4">
          <p className="text-muted-foreground">
            This sidebar cannot be collapsed (collapsible=&quot;none&quot;)
          </p>
        </div>
      </SidebarInset>
    </>
  ),
};

export const FloatingVariant: Story = {
  render: () => (
    <>
      <AppSidebar variant="floating" />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <h1 className="font-semibold">Floating Sidebar Variant</h1>
        </header>
        <div className="flex-1 p-4">
          <p className="text-muted-foreground">
            The sidebar has a floating style with rounded corners and shadow
          </p>
        </div>
      </SidebarInset>
    </>
  ),
};

export const InsetVariant: Story = {
  render: () => (
    <>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <h1 className="font-semibold">Inset Sidebar Variant</h1>
        </header>
        <div className="flex-1 p-4">
          <p className="text-muted-foreground">
            The content area has rounded corners when sidebar is expanded
          </p>
        </div>
      </SidebarInset>
    </>
  ),
};

export const FocusOnSearch: Story = {
  render: () => (
    <>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <h1 className="font-semibold">Search Feature</h1>
        </header>
        <div className="flex-1 p-4">
          <div className="max-w-md space-y-4">
            <p className="text-muted-foreground">
              Click the Search button in the sidebar or press{" "}
              <kbd className="px-2 py-1 text-xs rounded border bg-muted">⌘K</kbd> to open the search
              dialog.
            </p>
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-medium mb-2">Keyboard Shortcuts</h3>
              <ul className="text-sm space-y-1">
                <li>
                  <kbd className="px-2 py-1 text-xs rounded border bg-background mr-2">⌘K</kbd>
                  Open search
                </li>
                <li>
                  <kbd className="px-2 py-1 text-xs rounded border bg-background mr-2">⌘B</kbd>
                  Toggle sidebar
                </li>
              </ul>
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  ),
};

export const FocusOnSettings: Story = {
  render: () => (
    <>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <h1 className="font-semibold">Settings Dialog</h1>
        </header>
        <div className="flex-1 p-4">
          <p className="text-muted-foreground">
            Click the Settings button in the sidebar to open the settings dialog with the decorative
            border layout.
          </p>
        </div>
      </SidebarInset>
    </>
  ),
};
