import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
import { Button } from "./button";
import { Label } from "./label";
import { Input } from "./input";
import { Textarea } from "./textarea";

const meta: Meta<typeof Drawer> = {
  title: "UI/Drawer",
  component: Drawer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Bottom: Story = {
  render: () => (
    <Drawer direction="bottom">
      <DrawerTrigger asChild>
        <Button variant="outline">Open Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer Title</DrawerTitle>
          <DrawerDescription>This is a drawer that slides up from the bottom.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            Drawer content goes here. You can add any content you want.
          </p>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const Top: Story = {
  render: () => (
    <Drawer direction="top">
      <DrawerTrigger asChild>
        <Button variant="outline">Open from Top</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Notifications</DrawerTitle>
          <DrawerDescription>You have 3 unread notifications</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-3">
          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium">New message</p>
            <p className="text-xs text-muted-foreground">2 minutes ago</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium">System update</p>
            <p className="text-xs text-muted-foreground">1 hour ago</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium">Welcome aboard!</p>
            <p className="text-xs text-muted-foreground">Yesterday</p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  ),
};

export const Left: Story = {
  render: () => (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button variant="outline">Open from Left</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
          <DrawerDescription>Navigate to different sections</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-2">
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-accent">
            Dashboard
          </button>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-accent">Inbox</button>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-accent">
            Settings
          </button>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-accent">Profile</button>
        </div>
      </DrawerContent>
    </Drawer>
  ),
};

export const Right: Story = {
  render: () => (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline">Open from Right</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription>Configure your preferences</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="drawer-name">Name</Label>
            <Input id="drawer-name" defaultValue="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="drawer-email">Email</Label>
            <Input id="drawer-email" type="email" defaultValue="john@example.com" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="drawer-notifications">Notifications</Label>
            <input id="drawer-notifications" type="checkbox" defaultChecked />
          </div>
        </div>
        <DrawerFooter>
          <Button>Save changes</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Create Account</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create your account</DrawerTitle>
          <DrawerDescription>
            Fill in the information below to create your account.
          </DrawerDescription>
        </DrawerHeader>
        <form className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="form-name">
              Full Name
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input id="form-name" placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="form-email">
              Email
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input id="form-email" type="email" placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="form-password">
              Password
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input id="form-password" type="password" />
            <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="form-bio">Bio</Label>
            <Textarea id="form-bio" placeholder="Tell us about yourself" />
          </div>
        </form>
        <DrawerFooter>
          <Button type="submit">Create Account</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const WithScrollableContent: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">View Terms</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Terms and Conditions</DrawerTitle>
          <DrawerDescription>Please read our terms carefully</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-4 overflow-y-auto">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i}>
              <h4 className="font-medium mb-2">{i + 1}. Section Title</h4>
              <p className="text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris.
              </p>
            </div>
          ))}
        </div>
        <DrawerFooter>
          <Button>Accept</Button>
          <DrawerClose asChild>
            <Button variant="outline">Decline</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const ConfirmDialog: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Are you sure?</DrawerTitle>
          <DrawerDescription>
            This action cannot be undone. This will permanently delete your account and remove your
            data from our servers.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button variant="destructive">Delete Account</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const ProductDetails: Story = {
  render: () => (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline">View Product</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Premium Wireless Headphones</DrawerTitle>
          <DrawerDescription>$299.99</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">Product Image</span>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">
              Premium wireless headphones with active noise cancellation, 40-hour battery life, and
              premium sound quality.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Features</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Active Noise Cancellation</li>
              <li>• 40-hour battery life</li>
              <li>• Wireless charging</li>
              <li>• Premium audio drivers</li>
            </ul>
          </div>
        </div>
        <DrawerFooter>
          <Button>Add to Cart</Button>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};
