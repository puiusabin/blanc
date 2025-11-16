import type { Meta, StoryObj } from "@storybook/react"
import { Separator } from "./separator"

const meta: Meta<typeof Separator> = {
  title: "UI/Separator",
  component: Separator,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    decorative: {
      control: "boolean",
    },
  },
}

export default meta
type Story = StoryObj<typeof Separator>

export const Horizontal: Story = {
  render: () => (
    <div className="w-96">
      <Separator />
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="h-24 flex items-center justify-center">
      <Separator orientation="vertical" />
    </div>
  ),
}

export const InContent: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Introduction</h3>
        <p className="text-sm text-muted-foreground">
          This is the first section of content.
        </p>
      </div>
      <Separator />
      <div>
        <h3 className="text-lg font-semibold">Details</h3>
        <p className="text-sm text-muted-foreground">
          This is the second section of content.
        </p>
      </div>
    </div>
  ),
}

export const InList: Story = {
  render: () => (
    <div className="w-64 rounded-lg border p-4">
      <div className="py-2">
        <p className="text-sm font-medium">Item One</p>
        <p className="text-sm text-muted-foreground">Description for item one</p>
      </div>
      <Separator />
      <div className="py-2">
        <p className="text-sm font-medium">Item Two</p>
        <p className="text-sm text-muted-foreground">Description for item two</p>
      </div>
      <Separator />
      <div className="py-2">
        <p className="text-sm font-medium">Item Three</p>
        <p className="text-sm text-muted-foreground">Description for item three</p>
      </div>
    </div>
  ),
}

export const WithText: Story = {
  render: () => (
    <div className="w-96">
      <div className="relative">
        <Separator />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-background px-2 text-xs text-muted-foreground">
            OR
          </span>
        </div>
      </div>
    </div>
  ),
}

export const InCard: Story = {
  render: () => (
    <div className="w-96 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Card Title
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Card description goes here
        </p>
      </div>
      <Separator />
      <div className="p-6">
        <p className="text-sm">
          This is the main content area of the card. The separator divides the
          header from the body content.
        </p>
      </div>
      <Separator />
      <div className="p-6 flex gap-2">
        <button className="px-4 py-2 text-sm rounded-md border">Cancel</button>
        <button className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground">
          Continue
        </button>
      </div>
    </div>
  ),
}

export const InSidebar: Story = {
  render: () => (
    <div className="flex h-64 w-96 rounded-lg border">
      <div className="w-48 space-y-4 p-4">
        <div>
          <p className="text-sm font-medium">Navigation</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-muted-foreground">Dashboard</p>
            <p className="text-sm text-muted-foreground">Settings</p>
            <p className="text-sm text-muted-foreground">Profile</p>
          </div>
        </div>
      </div>
      <Separator orientation="vertical" />
      <div className="flex-1 p-4">
        <p className="text-sm text-muted-foreground">
          Main content area goes here
        </p>
      </div>
    </div>
  ),
}

export const CustomColor: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <div>
        <Separator className="bg-primary" />
        <p className="text-xs text-muted-foreground mt-2">Primary color</p>
      </div>
      <div>
        <Separator className="bg-destructive" />
        <p className="text-xs text-muted-foreground mt-2">Destructive color</p>
      </div>
      <div>
        <Separator className="bg-green-500" />
        <p className="text-xs text-muted-foreground mt-2">Custom green</p>
      </div>
    </div>
  ),
}

export const ThickSeparator: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <Separator className="h-0.5" />
      <Separator className="h-1" />
      <Separator className="h-2" />
    </div>
  ),
}
