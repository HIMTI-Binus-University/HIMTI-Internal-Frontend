import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import EventsPage from ".";

vi.mock("@/components/Utils/Sidebar", () => ({
  default: () => <div data-testid="sidebar" />,
}));

const LocationDisplay = () => {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
};

const renderEventsPage = () =>
  render(
    <MemoryRouter initialEntries={["/events"]}>
      <EventsPage />
      <LocationDisplay />
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

  it("opens the create event page from the primary action", () => {
    renderEventsPage();

    fireEvent.click(screen.getByRole("button", { name: "Create event" }));

    expect(screen.getByTestId("location")).toHaveTextContent("/events/create");
  });

  it("opens a parent event's sub-event page from its action", () => {
    renderEventsPage();

    fireEvent.click(screen.getAllByRole("button", { name: "Add Sub-Event" })[0]);

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/events/evt-techno-2026/subevents/create",
    );
  });

  it("uses a sub-event card grid instead of table headers", () => {
    renderEventsPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Expand TECHNO 2026: Wondrous Wonderland",
      }),
    );

    const subeventsSection = screen.getByRole("region", { name: "Sub-events" });
    expect(within(subeventsSection).getByText("3 sub-events")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Actions" })).not.toBeInTheDocument();
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

  it("opens the event edit form from the actions menu", () => {
    renderEventsPage();

    fireEvent.pointerDown(screen.getAllByRole("button", { name: "Open event actions" })[0]);
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));

    expect(screen.getByTestId("location")).toHaveTextContent("/events/evt-techno-2026/edit");
  });

  it("keeps registration and participants visible in each sub-event card", () => {
    renderEventsPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Expand TECHNO 2026: Wondrous Wonderland",
      }),
    );

    const subeventCard = screen.getByRole("article", {
      name: /TECHNO 2026 — Greater Jakarta/,
    });

    expect(
      within(subeventCard).getByRole("button", {
        name: "Registration for TECHNO 2026 — Greater Jakarta",
      }),
    ).toBeInTheDocument();
    expect(
      within(subeventCard).getByRole("button", {
        name: "Participants for TECHNO 2026 — Greater Jakarta",
      }),
    ).toBeInTheDocument();
    expect(
      within(subeventCard).getByRole("button", {
        name: "View details for TECHNO 2026 — Greater Jakarta",
      }),
    ).toBeInTheDocument();
  });

  it("shows sub-event details and its parent event in the dialog", () => {
    renderEventsPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Expand TECHNO 2026: Wondrous Wonderland",
      }),
    );
    fireEvent.click(
      screen.getAllByRole("button", {
        name: "View details for TECHNO 2026 — Greater Jakarta",
      })[0],
    );
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByText("TECHNO 2026: Wondrous Wonderland")).toBeInTheDocument();
    expect(within(dialog).getByText("BINUS @Kemanggisan, Anggrek Campus")).toBeInTheDocument();
    expect(within(dialog).getByText(/25\.000/)).toBeInTheDocument();
    expect(within(dialog).getByText("Registration form")).toBeInTheDocument();
    expect(within(dialog).getByText("published")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Registration" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Participants" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(dialog).not.toHaveTextContent("checkout-techno-jakarta-2026");
  });

  it("opens the sub-event edit form from the details dialog", () => {
    renderEventsPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Expand TECHNO 2026: Wondrous Wonderland",
      }),
    );
    fireEvent.click(
      screen.getAllByRole("button", {
        name: "View details for TECHNO 2026 — Greater Jakarta",
      })[0],
    );
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Edit" }));

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/events/evt-techno-2026/subevents/sub-techno-jakarta/edit",
    );
  });
});
