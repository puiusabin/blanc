import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Skeleton } from "./skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "UI/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    className: "h-12 w-12",
  },
};

export const Text: Story = {
  render: () => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
    </div>
  ),
};

export const Card: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  ),
};

export const ArticleList: Story = {
  render: () => (
    <div className="space-y-4 w-[400px]">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      ))}
    </div>
  ),
};

export const ProfileCard: Story = {
  render: () => (
    <div className="w-[350px] space-y-5">
      <div className="flex items-center space-x-4">
        <Skeleton className="size-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[180px]" />
          <Skeleton className="h-4 w-[120px]" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  ),
};
