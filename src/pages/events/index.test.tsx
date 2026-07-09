import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import EventsPage from ".";

vi.mock("@/components/Utils/Sidebar", () => ({
  default: () => <div data-testid="sidebar" />,
}));

const renderEventsPage = () =>
  render(
    <MemoryRouter initialEntries={["/events"]}>
      <EventsPage />
    </MemoryRouter>,
  );

describe("EventsPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("starts event cards collapsed and expands them on request", () => {
    renderEventsPage();

    const expandTechno = screen.getByRole("button", {
      name: "Expand TECHNO 2026: Wondrous Wonderland",
    });

    expect(expandTechno).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("TECHNO 2026 — Greater Jakarta")).not.toBeInTheDocument();

    fireEvent.click(expandTechno);

    expect(
      screen.getByRole("button", {
        name: "Collapse TECHNO 2026: Wondrous Wonderland",
      }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByText("TECHNO 2026 — Greater Jakarta").length).toBeGreaterThan(0);
  });

  it("left-aligns the sub-event actions column header", () => {
    renderEventsPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Expand TECHNO 2026: Wondrous Wonderland",
      }),
    );

    expect(screen.getByRole("columnheader", { name: "Actions" })).not.toHaveClass(
      "text-right",
    );
  });

  it("uses concise event action labels", () => {
    renderEventsPage();

    fireEvent.pointerDown(screen.getAllByRole("button", { name: "Open event actions" })[0]);

    expect(screen.getByRole("menuitem", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Delete" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Archive event" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Edit event" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Delete event" })).not.toBeInTheDocument();
  });

  it("aligns sub-event row actions with the start of the actions column", () => {
    renderEventsPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Expand TECHNO 2026: Wondrous Wonderland",
      }),
    );

    const subeventRow = screen.getByRole("row", {
      name: /TECHNO 2026 — Greater Jakarta/,
    });

    expect(
      within(subeventRow).getByRole("button", {
        name: "Forms for TECHNO 2026 — Greater Jakarta",
      }),
    ).toBeInTheDocument();
    expect(
      within(subeventRow).getByRole("button", {
        name: "Participants for TECHNO 2026 — Greater Jakarta",
      }),
    ).toBeInTheDocument();
    expect(within(subeventRow).getByRole("cell", { name: "Forms Participants" })).not.toHaveClass(
      "text-right",
    );

    fireEvent.pointerDown(
      within(subeventRow).getByRole("button", {
        name: "More actions for TECHNO 2026 — Greater Jakarta",
      }),
    );

    expect(screen.getByRole("menuitem", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Delete" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Edit sub-event" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Delete sub-event" })).not.toBeInTheDocument();
  });
});
