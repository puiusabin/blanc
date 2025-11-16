import type { Meta, StoryObj } from "@storybook/react"
import { Popover, PopoverTrigger, PopoverContent } from "./popover"
import { Button } from "./button"
import { Label } from "./label"
import { Input } from "./input"
import { Settings, User, Calendar } from "lucide-react"

const meta: Meta<typeof Popover> = {
  title: "UI/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Popover>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Popover</h4>
          <p className="text-sm text-muted-foreground">
            This is a popover with some content.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Update dimensions</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="width">Width</Label>
              <Input id="width" defaultValue="100%" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="height">Height</Label>
              <Input id="height" defaultValue="25px" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

export const UserProfile: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">john@example.com</p>
            </div>
          </div>
          <div className="space-y-1">
            <button className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-accent">
              Profile
            </button>
            <button className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-accent">
              Settings
            </button>
            <button className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-accent text-destructive">
              Logout
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

export const SettingsMenu: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-4">
          <h4 className="font-medium leading-none">Quick Settings</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Notifications</Label>
              <input id="notifications" type="checkbox" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-save">Auto-save</Label>
              <input id="auto-save" type="checkbox" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark mode</Label>
              <input id="dark-mode" type="checkbox" defaultChecked />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

export const DatePicker: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Calendar className="mr-2 size-4" />
          Pick a date
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-3">
          <h4 className="font-medium leading-none">Select Date</h4>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              Cancel
            </Button>
            <Button size="sm" className="flex-1">
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

export const Alignments: Story = {
  render: () => (
    <div className="flex gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Align Start</Button>
        </PopoverTrigger>
        <PopoverContent align="start">
          <p className="text-sm">Aligned to start</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Align Center</Button>
        </PopoverTrigger>
        <PopoverContent align="center">
          <p className="text-sm">Aligned to center</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Align End</Button>
        </PopoverTrigger>
        <PopoverContent align="end">
          <p className="text-sm">Aligned to end</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
}

export const Sides: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Top</Button>
        </PopoverTrigger>
        <PopoverContent side="top">
          <p className="text-sm">Positioned on top</p>
        </PopoverContent>
      </Popover>

      <div className="flex gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Left</Button>
          </PopoverTrigger>
          <PopoverContent side="left">
            <p className="text-sm">Left</p>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Right</Button>
          </PopoverTrigger>
          <PopoverContent side="right">
            <p className="text-sm">Right</p>
          </PopoverContent>
        </Popover>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </PopoverTrigger>
        <PopoverContent side="bottom">
          <p className="text-sm">Positioned on bottom</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
}

export const CustomWidth: Story = {
  render: () => (
    <div className="flex gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Small</Button>
        </PopoverTrigger>
        <PopoverContent className="w-48">
          <p className="text-sm">Small width popover</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Default</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p className="text-sm">Default width (w-72)</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Large</Button>
        </PopoverTrigger>
        <PopoverContent className="w-96">
          <p className="text-sm">Large width popover with more content space</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
}

export const WithScrollableContent: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">View list</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Items</h4>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="px-2 py-1.5 text-sm rounded-md hover:bg-accent cursor-pointer"
              >
                Item {i + 1}
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}
