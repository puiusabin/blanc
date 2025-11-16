import type { Meta, StoryObj } from "@storybook/react"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet"
import { Button } from "./button"
import { Label } from "./label"
import { Input } from "./input"
import { Textarea } from "./textarea"

const meta: Meta<typeof Sheet> = {
  title: "UI/Sheet",
  component: Sheet,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Sheet>

export const Right: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="john@example.com" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open from Left</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>
            Browse different sections
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <nav className="space-y-2">
            <a href="#" className="block px-3 py-2 rounded-md hover:bg-accent">
              Dashboard
            </a>
            <a href="#" className="block px-3 py-2 rounded-md hover:bg-accent">
              Projects
            </a>
            <a href="#" className="block px-3 py-2 rounded-md hover:bg-accent">
              Team
            </a>
            <a href="#" className="block px-3 py-2 rounded-md hover:bg-accent">
              Settings
            </a>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  ),
}

export const Top: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open from Top</Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Announcement</SheetTitle>
          <SheetDescription>
            Important updates and news
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <p className="text-sm">
            We've just released a new version with exciting features! Check out
            the changelog to see what's new.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  ),
}

export const Bottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open from Bottom</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Quick Actions</SheetTitle>
          <SheetDescription>
            Choose an action to perform
          </SheetDescription>
        </SheetHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-accent">
            <div className="size-12 rounded-full bg-primary/10" />
            <span className="text-sm">Share</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-accent">
            <div className="size-12 rounded-full bg-primary/10" />
            <span className="text-sm">Edit</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-accent">
            <div className="size-12 rounded-full bg-primary/10" />
            <span className="text-sm">Delete</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  ),
}

export const WithForm: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>New Project</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create Project</SheetTitle>
          <SheetDescription>
            Add a new project to your workspace
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">
              Project Name
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input id="project-name" placeholder="My Awesome Project" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              placeholder="Brief description of your project"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-url">Repository URL</Label>
            <Input
              id="project-url"
              type="url"
              placeholder="https://github.com/..."
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button type="submit">Create Project</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

export const NonModal: Story = {
  render: () => (
    <Sheet modal={false}>
      <SheetTrigger asChild>
        <Button variant="outline">Non-modal Sheet</Button>
      </SheetTrigger>
      <SheetContent modal={false}>
        <SheetHeader>
          <SheetTitle>Non-modal Sheet</SheetTitle>
          <SheetDescription>
            You can still interact with the page while this is open
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            This sheet does not block interaction with the rest of the page. Try
            clicking outside to see it stay open.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  ),
}

export const WithoutOverlay: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">No Overlay</Button>
      </SheetTrigger>
      <SheetContent showOverlay={false}>
        <SheetHeader>
          <SheetTitle>No Backdrop</SheetTitle>
          <SheetDescription>
            This sheet has no overlay backdrop
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Notice there's no dark overlay behind this sheet.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  ),
}

export const WithScrollableContent: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">View Details</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Product Details</SheetTitle>
          <SheetDescription>
            Complete information about this product
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          <div>
            <h4 className="font-medium mb-2">Overview</h4>
            <p className="text-sm text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i}>
              <h4 className="font-medium mb-2">Section {i + 1}</h4>
              <p className="text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
          ))}
        </div>
        <SheetFooter>
          <Button>Purchase</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

export const SettingsPanel: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Settings</Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Manage your account settings and preferences
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h4 className="font-medium">Profile</h4>
            <div className="space-y-2">
              <Label htmlFor="settings-name">Name</Label>
              <Input id="settings-name" defaultValue="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-email">Email</Label>
              <Input
                id="settings-email"
                type="email"
                defaultValue="john@example.com"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Preferences</h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="settings-notifications">Email notifications</Label>
              <input
                id="settings-notifications"
                type="checkbox"
                defaultChecked
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="settings-marketing">Marketing emails</Label>
              <input id="settings-marketing" type="checkbox" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="settings-updates">Product updates</Label>
              <input id="settings-updates" type="checkbox" defaultChecked />
            </div>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

export const ContactForm: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Contact Us</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Get in Touch</SheetTitle>
          <SheetDescription>
            We'd love to hear from you. Send us a message!
          </SheetDescription>
        </SheetHeader>
        <form className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="contact-name">
              Name
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input id="contact-name" placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email">
              Email
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="contact-email"
              type="email"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-message">
              Message
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Textarea
              id="contact-message"
              placeholder="Your message here..."
              className="min-h-32"
            />
          </div>
        </form>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button type="submit">Send Message</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}
