import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ThemeToggle } from "./theme-toggle";
import { useTheme } from "next-themes";
import { useEffect } from "react";

const meta: Meta<typeof ThemeToggle> = {
  title: "Components/ThemeToggle",
  component: ThemeToggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

export const Default: Story = {
  render: () => <ThemeToggle />,
};

export const WithCurrentTheme: Story = {
  render: () => {
    const { theme } = useTheme();
    return (
      <div className="space-y-4">
        <ThemeToggle />
        <p className="text-sm text-muted-foreground">
          Current theme: <span className="font-medium">{theme}</span>
        </p>
      </div>
    );
  },
};

export const DarkMode: Story = {
  render: () => {
    const { setTheme } = useTheme();

    useEffect(() => {
      setTheme("dark");
    }, [setTheme]);

    return (
      <div className="space-y-4">
        <ThemeToggle />
        <p className="text-sm text-muted-foreground">Theme set to dark</p>
      </div>
    );
  },
};

export const LightMode: Story = {
  render: () => {
    const { setTheme } = useTheme();

    useEffect(() => {
      setTheme("light");
    }, [setTheme]);

    return (
      <div className="space-y-4">
        <ThemeToggle />
        <p className="text-sm text-muted-foreground">Theme set to light</p>
      </div>
    );
  },
};
