import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Kbd, KbdGroup } from "./kbd";
import { Command, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

const meta: Meta<typeof Kbd> = {
  title: "UI/Kbd",
  component: Kbd,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Kbd>;

export const SingleKey: Story = {
  args: {
    children: "K",
  },
};

export const ModifierKeys: Story = {
  render: () => (
    <div className="flex gap-2">
      <Kbd>⌘</Kbd>
      <Kbd>⇧</Kbd>
      <Kbd>⌥</Kbd>
      <Kbd>⌃</Kbd>
    </div>
  ),
};

export const KeyCombination: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  ),
};

export const ComplexCombination: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>⇧</Kbd>
        <Kbd>P</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>Alt</Kbd>
        <Kbd>Delete</Kbd>
      </KbdGroup>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <KbdGroup>
        <Kbd>
          <Command />
        </Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>
          <ArrowUp />
        </Kbd>
        <Kbd>
          <ArrowDown />
        </Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>
          <ArrowLeft />
        </Kbd>
        <Kbd>
          <ArrowRight />
        </Kbd>
      </KbdGroup>
    </div>
  ),
};

export const InText: Story = {
  render: () => (
    <p className="text-sm">
      Press{" "}
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>{" "}
      to open the command palette
    </p>
  ),
};

export const ShortcutList: Story = {
  render: () => (
    <div className="w-96 space-y-3 rounded-lg border p-4">
      <h3 className="font-semibold">Keyboard Shortcuts</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">Open command palette</span>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Quick search</span>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>F</Kbd>
          </KbdGroup>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">New file</span>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>N</Kbd>
          </KbdGroup>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Save</span>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>S</Kbd>
          </KbdGroup>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Close tab</span>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>W</Kbd>
          </KbdGroup>
        </div>
      </div>
    </div>
  ),
};

export const FunctionKeys: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Kbd>F1</Kbd>
      <Kbd>F2</Kbd>
      <Kbd>F3</Kbd>
      <Kbd>F4</Kbd>
      <Kbd>F5</Kbd>
      <Kbd>F6</Kbd>
      <Kbd>F7</Kbd>
      <Kbd>F8</Kbd>
      <Kbd>F9</Kbd>
      <Kbd>F10</Kbd>
      <Kbd>F11</Kbd>
      <Kbd>F12</Kbd>
    </div>
  ),
};

export const SpecialKeys: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Kbd>Esc</Kbd>
      <Kbd>Tab</Kbd>
      <Kbd>Enter</Kbd>
      <Kbd>Space</Kbd>
      <Kbd>Delete</Kbd>
      <Kbd>Backspace</Kbd>
    </div>
  ),
};

export const NavigationKeys: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Kbd>Home</Kbd>
        <Kbd>End</Kbd>
        <Kbd>PgUp</Kbd>
        <Kbd>PgDn</Kbd>
      </div>
      <div className="grid grid-cols-3 w-fit gap-1">
        <div />
        <Kbd>
          <ArrowUp />
        </Kbd>
        <div />
        <Kbd>
          <ArrowLeft />
        </Kbd>
        <Kbd>
          <ArrowDown />
        </Kbd>
        <Kbd>
          <ArrowRight />
        </Kbd>
      </div>
    </div>
  ),
};

export const CrossPlatform: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">macOS</p>
        <div className="flex items-center justify-between">
          <span className="text-sm">Copy</span>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>C</Kbd>
          </KbdGroup>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Windows/Linux</p>
        <div className="flex items-center justify-between">
          <span className="text-sm">Copy</span>
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>C</Kbd>
          </KbdGroup>
        </div>
      </div>
    </div>
  ),
};
