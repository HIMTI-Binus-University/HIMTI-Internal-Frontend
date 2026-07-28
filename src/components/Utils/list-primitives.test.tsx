import { fireEvent, render, screen } from "@testing-library/react";
import { Users } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { EmptyState, PaginationFooter, SearchField } from "./list-primitives";

describe("SearchField", () => {
  it("renders an accessible search input and reports changes", async () => {
    const onChange = vi.fn();
    render(
      <SearchField
        id="memberSearch"
        label="Search members"
        placeholder="Search by name..."
        value=""
        onChange={onChange}
      />,
    );

    fireEvent.change(
      screen.getByRole("textbox", { name: "Search members" }),
      { target: { value: "ana" } },
    );

    expect(onChange).toHaveBeenCalledWith("ana");
    expect(screen.getByRole("textbox")).toHaveClass("pl-10");
  });
});

describe("EmptyState", () => {
  it("shows a consistent icon, title, and description", () => {
    render(
      <EmptyState
        icon={Users}
        title="No users found"
        description="Invite a member or adjust your search."
      />,
    );

    expect(screen.getByRole("heading", { name: "No users found" })).toBeInTheDocument();
    expect(screen.getByText("Invite a member or adjust your search.")).toBeInTheDocument();
  });
});

describe("PaginationFooter", () => {
  it("supports arrow, page, first, and last navigation", () => {
    const onPageChange = vi.fn();
    render(
      <PaginationFooter
        label="Showing 1-10 of 42 users"
        page={3}
        totalPages={5}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute("aria-current", "page");
    fireEvent.click(screen.getByRole("button", { name: "First page" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    fireEvent.click(screen.getByRole("button", { name: "Page 4" }));
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    fireEvent.click(screen.getByRole("button", { name: "Last page" }));

    expect(onPageChange.mock.calls).toEqual([[1], [2], [4], [4], [5]]);
  });

  it("disables arrows at the boundaries", () => {
    render(
      <PaginationFooter label="Showing 1-10 of 10 users" page={1} totalPages={1} onPageChange={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "First page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Last page" })).toBeDisabled();
  });
});
