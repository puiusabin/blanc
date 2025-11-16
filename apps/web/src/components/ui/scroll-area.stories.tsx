import type { Meta, StoryObj } from "@storybook/react"
import { ScrollArea, ScrollBar } from "./scroll-area"
import { Separator } from "./separator"

const meta: Meta<typeof ScrollArea> = {
  title: "UI/ScrollArea",
  component: ScrollArea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof ScrollArea>

export const VerticalScroll: Story = {
  render: () => (
    <ScrollArea className="h-72 w-96 rounded-md border p-4">
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Vertical Scrolling</h4>
        {Array.from({ length: 50 }, (_, i) => (
          <div key={i} className="text-sm">
            Item {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const HorizontalScroll: Story = {
  render: () => (
    <ScrollArea className="w-96 rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="shrink-0 w-32 h-32 rounded-md bg-muted flex items-center justify-center"
          >
            {i + 1}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
}

export const BothScrollbars: Story = {
  render: () => (
    <ScrollArea className="h-72 w-96 rounded-md border">
      <div className="w-max p-4">
        <table className="min-w-max">
          <thead>
            <tr>
              {Array.from({ length: 10 }, (_, i) => (
                <th key={i} className="px-4 py-2 text-left text-sm font-medium">
                  Column {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 50 }, (_, i) => (
              <tr key={i} className="border-t">
                {Array.from({ length: 10 }, (_, j) => (
                  <td key={j} className="px-4 py-2 text-sm">
                    Cell {i + 1}-{j + 1}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
}

export const TagsList: Story = {
  render: () => {
    const tags = [
      "React",
      "TypeScript",
      "Next.js",
      "Tailwind CSS",
      "Radix UI",
      "Storybook",
      "Prisma",
      "PostgreSQL",
      "Cloudflare",
      "R2",
      "Workers",
      "Web3",
      "wagmi",
      "viem",
      "TanStack Query",
      "shadcn/ui",
      "Vercel",
      "Git",
      "GitHub",
      "Node.js",
    ]

    return (
      <ScrollArea className="h-48 w-96 rounded-md border p-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div
                key={tag}
                className="px-2 py-1 text-xs rounded-md bg-secondary"
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    )
  },
}

export const CodeBlock: Story = {
  render: () => (
    <ScrollArea className="h-72 w-96 rounded-md border">
      <pre className="p-4 text-sm">
        <code>{`function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Memoized version
const fibMemo = (() => {
  const cache: Record<number, number> = {};

  return function fib(n: number): number {
    if (n in cache) return cache[n];
    if (n <= 1) return n;

    cache[n] = fib(n - 1) + fib(n - 2);
    return cache[n];
  };
})();

// Usage
console.log(fibonacci(10)); // 55
console.log(fibMemo(10));   // 55

// Test with larger numbers
for (let i = 0; i < 20; i++) {
  console.log(\`fibonacci(\${i}) = \${fibMemo(i)}\`);
}`}</code>
      </pre>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
}

export const ChatMessages: Story = {
  render: () => {
    const messages = [
      { sender: "Alice", text: "Hey, how are you doing?" },
      { sender: "Bob", text: "I'm good, thanks! How about you?" },
      { sender: "Alice", text: "Doing great! Working on this new project." },
      { sender: "Bob", text: "That sounds exciting! What's it about?" },
      {
        sender: "Alice",
        text: "It's a web app with Next.js and Cloudflare Workers.",
      },
      { sender: "Bob", text: "Nice! Are you using any UI library?" },
      { sender: "Alice", text: "Yeah, shadcn/ui with Radix primitives." },
      { sender: "Bob", text: "Great choice! Very flexible." },
      {
        sender: "Alice",
        text: "Totally agree. The components are so customizable.",
      },
      { sender: "Bob", text: "Let me know if you need any help!" },
    ]

    return (
      <ScrollArea className="h-72 w-96 rounded-md border">
        <div className="p-4 space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${message.sender === "Alice" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                  message.sender === "Alice"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="font-medium text-xs mb-1">{message.sender}</p>
                <p>{message.text}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    )
  },
}

export const MenuList: Story = {
  render: () => {
    const items = [
      { title: "Dashboard", description: "View your dashboard" },
      { title: "Inbox", description: "Check your messages" },
      { title: "Sent", description: "View sent emails" },
      { title: "Drafts", description: "Continue drafts" },
      { title: "Spam", description: "Review spam" },
      { title: "Trash", description: "Deleted items" },
      { title: "Archive", description: "Archived messages" },
      { title: "Settings", description: "Manage preferences" },
      { title: "Profile", description: "Edit your profile" },
      { title: "Help", description: "Get support" },
    ]

    return (
      <ScrollArea className="h-72 w-96 rounded-md border">
        <div className="p-2">
          {items.map((item, i) => (
            <div key={i}>
              <button className="w-full text-left px-3 py-2 rounded-md hover:bg-accent">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </button>
              {i < items.length - 1 && <Separator className="my-1" />}
            </div>
          ))}
        </div>
      </ScrollArea>
    )
  },
}

export const CustomHeight: Story = {
  render: () => (
    <div className="space-y-4">
      <ScrollArea className="h-32 w-96 rounded-md border p-4">
        <h4 className="text-sm font-medium mb-2">Small (h-32)</h4>
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i} className="text-sm">
            Line {i + 1}
          </p>
        ))}
      </ScrollArea>

      <ScrollArea className="h-64 w-96 rounded-md border p-4">
        <h4 className="text-sm font-medium mb-2">Medium (h-64)</h4>
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i} className="text-sm">
            Line {i + 1}
          </p>
        ))}
      </ScrollArea>
    </div>
  ),
}

export const ImageGallery: Story = {
  render: () => (
    <ScrollArea className="h-96 w-96 rounded-md border p-4">
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="aspect-square rounded-md bg-muted flex items-center justify-center"
          >
            <p className="text-sm text-muted-foreground">Image {i + 1}</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}
