import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./command";
import { Calendar, User, Settings, CreditCard, Smile } from "lucide-react";

const meta: Meta<typeof Command> = {
  title: "UI/Command",
  component: Command,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Command>;

export const Default: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[450px]">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Calendar />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <Smile />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem>
            <User />
            <span>Profile</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <User />
            <span>Profile</span>
          </CommandItem>
          <CommandItem>
            <CreditCard />
            <span>Billing</span>
          </CommandItem>
          <CommandItem>
            <Settings />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const Simple: Story = {
  render: () => (
    <Command className="rounded-lg border w-[350px]">
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          <CommandItem>Apple</CommandItem>
          <CommandItem>Banana</CommandItem>
          <CommandItem>Orange</CommandItem>
          <CommandItem>Pear</CommandItem>
          <CommandItem>Strawberry</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[400px]">
      <CommandInput placeholder="Search commands..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem>
            <Calendar />
            <span>Open Calendar</span>
          </CommandItem>
          <CommandItem>
            <User />
            <span>View Profile</span>
          </CommandItem>
          <CommandItem>
            <Settings />
            <span>Open Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
