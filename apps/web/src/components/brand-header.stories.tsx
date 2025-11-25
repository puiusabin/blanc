import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BrandHeader } from "./brand-header";

const meta: Meta<typeof BrandHeader> = {
  title: "App/BrandHeader",
  component: BrandHeader,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    showName: {
      control: "boolean",
      description: "Whether to show the 'blanc' text",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size variant",
    },
  },
};

export default meta;
type Story = StoryObj<typeof BrandHeader>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  args: {
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    size: "md",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
  },
};

export const LogoOnly: Story = {
  args: {
    showName: false,
  },
};

export const LogoOnlySmall: Story = {
  args: {
    showName: false,
    size: "sm",
  },
};

export const LogoOnlyLarge: Story = {
  args: {
    showName: false,
    size: "lg",
  },
};

export const InHeader: Story = {
  render: () => (
    <header className="flex h-14 w-96 items-center gap-2 border-b px-4">
      <BrandHeader />
      <div className="ml-auto">
        <button className="px-3 py-1.5 text-sm rounded-md border hover:bg-accent">Sign In</button>
      </div>
    </header>
  ),
};

export const InSidebarHeader: Story = {
  render: () => (
    <div className="w-56 border-b h-14 flex items-center px-4 bg-sidebar">
      <BrandHeader />
    </div>
  ),
};

export const WithCustomSpacing: Story = {
  render: () => (
    <div className="space-y-4">
      <BrandHeader className="gap-1" size="sm" />
      <BrandHeader className="gap-2" size="md" />
      <BrandHeader className="gap-4" size="lg" />
    </div>
  ),
};
