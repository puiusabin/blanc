import type { Meta, StoryObj } from "@storybook/react";
import { SafeEmailRenderer } from "./safe-email-renderer";

const meta: Meta<typeof SafeEmailRenderer> = {
  title: "Mail/SafeEmailRenderer",
  component: SafeEmailRenderer,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SafeEmailRenderer>;

export const SimpleHTML: Story = {
  args: {
    html: "<p>Hello <strong>World</strong>!</p>",
    plainText: "Hello World!",
  },
};

export const RichContent: Story = {
  args: {
    html: `
      <h2>Project Update</h2>
      <p>Here's the latest status:</p>
      <ul>
        <li>Phase 1: Complete</li>
        <li>Phase 2: In Progress</li>
      </ul>
      <img src="https://via.placeholder.com/400x200/3b82f6/ffffff?text=Project+Status" alt="Chart" />
    `,
    plainText: "Project Update\n\nPhase 1: Complete\nPhase 2: In Progress",
  },
};

export const WithTable: Story = {
  args: {
    html: `
      <h3>Weekly Schedule</h3>
      <table border="1" cellpadding="8">
        <thead>
          <tr>
            <th>Day</th>
            <th>Activity</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Monday</td><td>Orientation</td></tr>
          <tr><td>Tuesday</td><td>Team Introductions</td></tr>
          <tr><td>Wednesday</td><td>Project Overview</td></tr>
        </tbody>
      </table>
    `,
    plainText:
      "Weekly Schedule\n\nMonday: Orientation\nTuesday: Team Introductions\nWednesday: Project Overview",
  },
};

export const XSSAttempt: Story = {
  args: {
    html: `
      <p>This should be safe:</p>
      <script>alert('XSS')</script>
      <img src="x" onerror="alert('XSS')">
      <a href="javascript:alert('XSS')">Click me</a>
      <iframe src="https://evil.com"></iframe>
      <p>No alerts should appear!</p>
    `,
    plainText: "Safe plain text",
  },
};

export const WithExternalImages: Story = {
  args: {
    html: `
      <p>External images loading:</p>
      <img src="https://picsum.photos/600/400" alt="Random" />
      <p>External image should load automatically</p>
    `,
    plainText: "External image example",
    allowExternalImages: true,
  },
};

export const BlockedExternalImages: Story = {
  args: {
    html: `
      <p>External images blocked:</p>
      <img src="https://picsum.photos/600/400" alt="Random" />
      <p>External image should be blocked</p>
    `,
    plainText: "Blocked image example",
    allowExternalImages: false,
  },
};

export const ErrorFallback: Story = {
  args: {
    html: "",
    plainText: "This is the plain text fallback when HTML fails to render.",
  },
};

export const ComplexFormatting: Story = {
  args: {
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h1>Welcome to Blanc! 🎉</h1>
        <p>We're excited to have you on board.</p>
        <blockquote>
          "The best way to predict the future is to create it."
        </blockquote>
        <p>Here's what you need to know:</p>
        <ul>
          <li><strong>Phase 1</strong>: Setup complete ✅</li>
          <li><strong>Phase 2</strong>: In progress 🚧</li>
          <li><strong>Phase 3</strong>: Pending ⏳</li>
        </ul>
        <p>For more details, visit our <a href="https://blanc.is">website</a>.</p>
      </div>
    `,
    plainText: "Welcome to Blanc! We're excited to have you on board.",
  },
};
