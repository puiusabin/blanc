import type { Meta, StoryObj } from "@storybook/react"
import { Checkbox } from "./checkbox"
import { Label } from "./label"
import { useState } from "react"

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    checked: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
}

export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  args: {},
}

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
}

export const WithError: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox id="required" aria-invalid="true" />
        <Label htmlFor="required">This field is required</Label>
      </div>
      <p className="text-sm text-destructive">You must accept to continue</p>
    </div>
  ),
}

export const Indeterminate: Story = {
  render: () => {
    const [checked, setChecked] = useState<boolean | "indeterminate">("indeterminate")

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="parent"
            checked={checked}
            onCheckedChange={setChecked}
          />
          <Label htmlFor="parent">
            Parent checkbox (indeterminate)
          </Label>
        </div>
        <div className="ml-6 space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="child1" defaultChecked />
            <Label htmlFor="child1">Option 1</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="child2" />
            <Label htmlFor="child2">Option 2</Label>
          </div>
        </div>
      </div>
    )
  },
}

export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState(false)

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="interactive"
            checked={checked}
            onCheckedChange={(value) => setChecked(value === true)}
          />
          <Label htmlFor="interactive">
            {checked ? "Checked" : "Unchecked"}
          </Label>
        </div>
        <p className="text-sm text-muted-foreground">
          State: {checked ? "✓ Checked" : "○ Unchecked"}
        </p>
      </div>
    )
  },
}

export const FormExample: Story = {
  render: () => (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base">Notification preferences</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="email" defaultChecked />
            <Label htmlFor="email">Email notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="push" />
            <Label htmlFor="push">Push notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="sms" />
            <Label htmlFor="sms">SMS notifications</Label>
          </div>
        </div>
      </div>
    </form>
  ),
}
