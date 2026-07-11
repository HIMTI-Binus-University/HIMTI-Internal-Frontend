import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import CreateSubeventPage from ".";

vi.mock("@/components/Utils/Sidebar", () => ({
  default: () => <div data-testid="sidebar" />,
}));

const LocationDisplay = () => {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
};

const renderCreateSubeventPage = () =>
  render(
    <MemoryRouter initialEntries={["/events/evt-techno-2026/subevents/create"]}>
      <Routes>
        <Route path="/events/:eventId/subevents/create" element={<CreateSubeventPage />} />
        <Route path="/events" element={<div />} />
      </Routes>
      <LocationDisplay />
    </MemoryRouter>,
  );

describe("CreateSubeventPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("identifies the parent event in breadcrumbs and the form context", () => {
    renderCreateSubeventPage();

    const breadcrumbs = screen.getByLabelText("Breadcrumb");
    expect(within(breadcrumbs).getByText("Tools")).toBeInTheDocument();
    expect(within(breadcrumbs).getByText("Events")).toBeInTheDocument();
    expect(
      within(breadcrumbs).getByText("TECHNO 2026: Wondrous Wonderland"),
    ).toBeInTheDocument();
    expect(within(breadcrumbs).getByText("Create sub-event")).toBeInTheDocument();
    expect(screen.getByText("Creating a sub-event for", { exact: false })).toHaveTextContent(
      "TECHNO 2026: Wondrous Wonderland",
    );
  });

  it("renders the complete sub-event form", () => {
    renderCreateSubeventPage();

    expect(screen.getByLabelText("Sub-event name")).toBeRequired();
    expect(screen.getByLabelText("Public description")).toBeInTheDocument();
    expect(screen.getByLabelText("Private description")).toBeInTheDocument();
    expect(screen.getByLabelText("Date and time")).toBeRequired();
    expect(screen.getByLabelText("Sub-event type")).toBeRequired();
    expect(screen.getByLabelText("Location address")).toBeInTheDocument();
    expect(screen.getByLabelText("Location URL")).toBeInTheDocument();
    expect(screen.getByLabelText("Event price")).toBeInTheDocument();
    expect(screen.getByLabelText("Maximum participants")).toBeInTheDocument();
    expect(screen.getByLabelText("Maximum tickets per user")).toBeInTheDocument();
  });

  it("does not make a request when creating a sub-event", () => {
    renderCreateSubeventPage();

    fireEvent.submit(screen.getByRole("form", { name: "Create sub-event form" }));

    expect(
      screen.getByText("Sub-event creation will be available when the events API is connected."),
    ).toBeVisible();
  });

  it("returns to events when cancelled", () => {
    renderCreateSubeventPage();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByTestId("location")).toHaveTextContent("/events");
  });
});
