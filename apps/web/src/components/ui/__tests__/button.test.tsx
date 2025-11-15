import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { composeStories } from "@storybook/react"
import * as stories from "../button.stories"

const { Default, Destructive, Disabled, WithIcon } = composeStories(stories)

describe("Button Component", () => {
  it("renders default button", () => {
    render(<Default />)
    expect(screen.getByRole("button")).toBeInTheDocument()
    expect(screen.getByText("Button")).toBeInTheDocument()
  })

  it("renders destructive variant", () => {
    render(<Destructive />)
    const button = screen.getByRole("button")
    expect(button).toHaveTextContent("Delete")
  })

  it("is disabled when disabled prop is true", () => {
    render(<Disabled />)
    const button = screen.getByRole("button")
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute("disabled")
  })

  it("renders with icon", () => {
    render(<WithIcon />)
    const button = screen.getByRole("button")
    expect(button).toHaveTextContent("Login with Email")
    expect(button.querySelector("svg")).toBeInTheDocument()
  })

  it("has correct data-slot attribute", () => {
    render(<Default />)
    const button = screen.getByRole("button")
    expect(button).toHaveAttribute("data-slot", "button")
  })
})
