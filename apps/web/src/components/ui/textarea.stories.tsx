import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Textarea } from "./textarea";
import { Label } from "./label";
import { useState } from "react";

const meta: Meta<typeof Textarea> = {
  title: "UI/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
    },
    placeholder: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {},
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: "Type your message here...",
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="message">Message</Label>
      <Textarea id="message" placeholder="Type your message..." />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "This field is disabled",
    defaultValue: "You cannot edit this text",
  },
};

export const WithError: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="bio">
        Bio
        <span className="text-destructive ml-1">*</span>
      </Label>
      <Textarea id="bio" placeholder="Tell us about yourself" aria-invalid="true" />
      <p className="text-sm text-destructive">Bio is required</p>
    </div>
  ),
};

export const WithHelperText: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea id="description" placeholder="Enter a detailed description" />
      <p className="text-sm text-muted-foreground">Provide as much detail as possible</p>
    </div>
  ),
};

export const WithCharacterCount: Story = {
  render: () => {
    const maxLength = 200;
    const [value, setValue] = useState("");

    return (
      <div className="space-y-2">
        <Label htmlFor="feedback">Feedback</Label>
        <Textarea
          id="feedback"
          placeholder="Share your thoughts..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={maxLength}
        />
        <p className="text-sm text-muted-foreground text-right">
          {value.length} / {maxLength} characters
        </p>
      </div>
    );
  },
};

export const AutoResize: Story = {
  render: () => (
    <div className="w-96 space-y-2">
      <Label htmlFor="auto-resize">Auto-resizing textarea</Label>
      <Textarea
        id="auto-resize"
        placeholder="Start typing to see the textarea expand..."
        defaultValue="This textarea uses field-sizing: content, which means it will automatically grow as you type more content. Try adding multiple lines to see it expand vertically."
      />
      <p className="text-sm text-muted-foreground">
        Uses CSS field-sizing for automatic height adjustment
      </p>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => {
    const [feedback, setFeedback] = useState("");
    const maxLength = 500;

    return (
      <form className="w-96 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="form-name">
            Name
            <span className="text-destructive ml-1">*</span>
          </Label>
          <input
            id="form-name"
            type="text"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            placeholder="Your name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="form-feedback">
            Feedback
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Textarea
            id="form-feedback"
            placeholder="Tell us what you think..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            maxLength={maxLength}
          />
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              {feedback.length === 0 ? "Please provide feedback" : "Thank you!"}
            </p>
            <p className="text-sm text-muted-foreground">
              {feedback.length} / {maxLength}
            </p>
          </div>
        </div>
      </form>
    );
  },
};

export const LongContent: Story = {
  args: {
    defaultValue: `This is a longer piece of content that demonstrates how the textarea handles multiple lines of text.

You can include multiple paragraphs, and the textarea will automatically adjust its height thanks to the field-sizing: content CSS property.

This makes for a better user experience as users can see all of their content without having to scroll within the textarea itself.`,
  },
};
