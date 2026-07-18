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
  it("disables unavailable navigation and calls enabled handlers", async () => {
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    render(
      <PaginationFooter
        label="Showing 1-10 of 14 users"
        page={1}
        totalPages={2}
        onPrevious={onPrevious}
        onNext={onNext}
      />,
    );

    expect(screen.getByText("Showing 1-10 of 14 users")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(onPrevious).not.toHaveBeenCalled();
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
