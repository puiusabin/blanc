import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Label } from "./label";
import { Input } from "./input";

const meta: Meta<typeof Label> = {
  title: "UI/Label",
  component: Label,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    htmlFor: {
      control: "text",
      description: "ID of the form element this label is for",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: "Label text",
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email">Email address</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="username">
        Username
        <span className="text-destructive ml-1">*</span>
      </Label>
      <Input id="username" placeholder="Enter username" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="disabled-input">Disabled field</Label>
      <Input id="disabled-input" disabled placeholder="Cannot edit this" />
    </div>
  ),
};

export const WithHelperText: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <Input id="password" type="password" placeholder="Enter password" />
      <p className="text-sm text-muted-foreground">Must be at least 8 characters long</p>
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="error-input">
        Email address
        <span className="text-destructive ml-1">*</span>
      </Label>
      <Input id="error-input" type="email" placeholder="you@example.com" aria-invalid="true" />
      <p className="text-sm text-destructive">Please enter a valid email</p>
    </div>
  ),
};

export const MultipleFields: Story = {
  render: () => (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="first-name">
          First name
          <span className="text-destructive ml-1">*</span>
        </Label>
        <Input id="first-name" placeholder="John" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="last-name">
          Last name
          <span className="text-destructive ml-1">*</span>
        </Label>
        <Input id="last-name" placeholder="Doe" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Input id="bio" placeholder="Tell us about yourself" />
        <p className="text-sm text-muted-foreground">Optional field</p>
      </div>
    </form>
  ),
};

export const LongText: Story = {
  render: () => (
    <div className="max-w-md space-y-2">
      <Label htmlFor="terms">
        I agree to the terms and conditions, privacy policy, and data processing agreement as
        outlined in the documentation
      </Label>
      <Input id="terms" type="checkbox" className="size-4" />
    </div>
  ),
};
