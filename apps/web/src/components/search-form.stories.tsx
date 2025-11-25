import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SearchForm } from "./search-form";
import { SidebarProvider } from "@/components/ui/sidebar";

const meta: Meta<typeof SearchForm> = {
  title: "Components/SearchForm",
  component: SearchForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <SidebarProvider>
        <div className="w-[300px]">
          <Story />
        </div>
      </SidebarProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SearchForm>;

export const Default: Story = {
  render: () => <SearchForm />,
};

export const WithOnSubmit: Story = {
  render: () => (
    <SearchForm
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const search = formData.get("search");
        alert(`Searching for: ${search}`);
      }}
    />
  ),
};
