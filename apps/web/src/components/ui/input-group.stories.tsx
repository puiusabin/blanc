import type { Meta, StoryObj } from "@storybook/react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
} from "./input-group"
import { Kbd } from "./kbd"
import {
  Search,
  Mail,
  Send,
  DollarSign,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  X,
} from "lucide-react"
import { useState } from "react"

const meta: Meta<typeof InputGroup> = {
  title: "UI/InputGroup",
  component: InputGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof InputGroup>

export const WithIcon: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search..." />
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>
          <Mail />
        </InputGroupAddon>
        <InputGroupInput type="email" placeholder="Email address" />
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>
          <DollarSign />
        </InputGroupAddon>
        <InputGroupInput type="number" placeholder="0.00" />
      </InputGroup>
    </div>
  ),
}

export const WithButton: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <InputGroup>
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs">
            <Search />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupInput type="email" placeholder="Enter email" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="xs">
            <Send />
            Send
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupInput placeholder="Type something..." />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" variant="ghost">
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
}

export const WithText: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="example.com" />
      </InputGroup>

      <InputGroup>
        <InputGroupInput placeholder="username" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>@example.com</InputGroupText>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>$</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput type="number" placeholder="0.00" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>USD</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
}

export const WithKbd: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon align="inline-end">
          <Kbd>⌘K</Kbd>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupInput placeholder="Quick search" />
        <InputGroupAddon align="inline-end">
          <Kbd>/</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
}

export const BlockAlignment: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <InputGroup>
        <InputGroupAddon align="block-start">
          <InputGroupText>Email address</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput type="email" placeholder="you@example.com" />
      </InputGroup>

      <InputGroup>
        <InputGroupInput placeholder="Add a comment" />
        <InputGroupAddon align="block-end">
          <InputGroupText className="text-xs">
            You can use Markdown
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupAddon align="block-start">
          <InputGroupText>Description</InputGroupText>
        </InputGroupAddon>
        <InputGroupTextarea placeholder="Enter description here..." rows={3} />
        <InputGroupAddon align="block-end">
          <InputGroupText className="text-xs text-muted-foreground">
            0 / 500 characters
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
}

export const MultipleAddons: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" variant="ghost">
            <X />
          </InputGroupButton>
          <Kbd>Esc</Kbd>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>
          <DollarSign />
        </InputGroupAddon>
        <InputGroupInput type="number" placeholder="0.00" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>USD</InputGroupText>
          <InputGroupButton size="xs">Convert</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
}

export const WithError: Story = {
  render: () => (
    <div className="w-96 space-y-2">
      <InputGroup>
        <InputGroupAddon>
          <Mail />
        </InputGroupAddon>
        <InputGroupInput
          type="email"
          placeholder="Email address"
          aria-invalid="true"
          defaultValue="invalid-email"
        />
      </InputGroup>
      <p className="text-sm text-destructive">Please enter a valid email</p>
    </div>
  ),
}

export const SearchInput: Story = {
  render: () => {
    const [value, setValue] = useState("")

    return (
      <div className="w-96">
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          {value && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                onClick={() => setValue("")}
              >
                <X />
              </InputGroupButton>
              <Kbd>Esc</Kbd>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>
    )
  },
}

export const EmailComposer: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <InputGroup>
        <InputGroupAddon align="block-start">
          <InputGroupText>To</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput type="email" placeholder="recipient@example.com" />
      </InputGroup>

      <InputGroup>
        <InputGroupAddon align="block-start">
          <InputGroupText>Subject</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="Email subject" />
      </InputGroup>

      <InputGroup>
        <InputGroupAddon align="block-start">
          <InputGroupText>Message</InputGroupText>
        </InputGroupAddon>
        <InputGroupTextarea placeholder="Type your message..." rows={5} />
        <InputGroupAddon align="block-end">
          <InputGroupButton size="sm">
            <Send />
            Send
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
}

export const PasswordInput: Story = {
  render: () => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <div className="w-96">
        <InputGroup>
          <InputGroupAddon>
            <Lock />
          </InputGroupAddon>
          <InputGroupInput
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    )
  },
}

export const DateInput: Story = {
  render: () => (
    <div className="w-96">
      <InputGroup>
        <InputGroupAddon>
          <Calendar />
        </InputGroupAddon>
        <InputGroupInput type="date" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="xs">Today</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
}

export const UrlInput: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="example.com" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="xs">Go</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupAddon align="block-start">
          <InputGroupText>Website URL</InputGroupText>
        </InputGroupAddon>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="your-site.com" />
      </InputGroup>
    </div>
  ),
}

export const CharacterCount: Story = {
  render: () => {
    const maxLength = 280
    const [value, setValue] = useState("")

    return (
      <div className="w-96">
        <InputGroup>
          <InputGroupAddon align="block-start">
            <InputGroupText>Tweet</InputGroupText>
          </InputGroupAddon>
          <InputGroupTextarea
            placeholder="What's happening?"
            rows={4}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={maxLength}
          />
          <InputGroupAddon align="block-end">
            <InputGroupText className="text-xs">
              {value.length} / {maxLength}
            </InputGroupText>
            <InputGroupButton size="sm">Tweet</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    )
  },
}
