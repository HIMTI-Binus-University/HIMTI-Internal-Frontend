import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

const Example = ({ onValueChange = vi.fn(), disabled = false }) => (
  <Select items={{ DRAFT: "Draft", PUBLISHED: "Published" }} defaultValue="DRAFT" onValueChange={onValueChange} disabled={disabled}>
    <SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger>
    <SelectContent>
      <SelectItem value="DRAFT">Draft</SelectItem>
      <SelectItem value="PUBLISHED">Published</SelectItem>
    </SelectContent>
  </Select>
)

afterEach(cleanup)

describe("Select", () => {
  it("shows the selected label and exposes listbox semantics", () => {
    render(<Example />)

    const trigger = screen.getByRole("combobox", { name: "Status" })
    expect(trigger).toHaveTextContent("Draft")

    fireEvent.click(trigger)
    expect(screen.getByRole("listbox")).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Draft" })).toHaveAttribute("aria-selected", "true")
  })

  it("supports keyboard dismissal", () => {
    render(<Example />)
    const trigger = screen.getByRole("combobox", { name: "Status" })
    fireEvent.click(trigger)
    expect(screen.getByRole("listbox")).toBeInTheDocument()

    fireEvent.keyDown(trigger, { key: "Escape" })
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })

  it("prevents interaction when disabled", () => {
    render(<Example disabled />)

    const trigger = screen.getByRole("combobox", { name: "Status" })
    expect(trigger).toBeDisabled()
    fireEvent.click(trigger)
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })
})
