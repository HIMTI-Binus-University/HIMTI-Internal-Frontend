import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import CreateEventPage from ".";

vi.mock("@/components/Utils/Sidebar", () => ({
  default: () => <div data-testid="sidebar" />,
}));

const LocationDisplay = () => {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
};

const renderCreateEventPage = () =>
  render(
    <MemoryRouter initialEntries={["/events/create"]}>
      <CreateEventPage />
      <LocationDisplay />
    </MemoryRouter>,
  );

const renderEditEventPage = () =>
  render(
    <MemoryRouter initialEntries={["/events/evt-techno-2026/edit"]}>
      <Routes>
        <Route path="/events/:eventId/edit" element={<CreateEventPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe("CreateEventPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders event breadcrumbs and the client-side form fields", () => {
    renderCreateEventPage();

    const breadcrumbs = screen.getByLabelText("Breadcrumb");
    expect(within(breadcrumbs).getByText("Tools")).toBeInTheDocument();
    expect(within(breadcrumbs).getByText("Events")).toBeInTheDocument();
    expect(within(breadcrumbs).getByText("Create event")).toBeInTheDocument();
    expect(screen.getByLabelText("Event name")).toBeRequired();
    expect(screen.getByLabelText("Public description")).toBeInTheDocument();
    expect(screen.getByLabelText("Cover image URL")).toBeInTheDocument();
  });

  it("returns to events when cancelled", () => {
    renderCreateEventPage();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByTestId("location")).toHaveTextContent("/events");
  });

  it("does not make a request when creating an event", () => {
    renderCreateEventPage();

    fireEvent.change(screen.getByLabelText("Event name"), {
      target: { value: "TECHNO 2027" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create event" }));

    expect(screen.getByText("Event creation will be available when the events API is connected.")).toBeVisible();
  });

  it("prefills the edit form from the selected event", () => {
    renderEditEventPage();

    expect(screen.getByRole("heading", { name: "Edit event" })).toBeInTheDocument();
    expect(screen.getByLabelText("Event name")).toHaveValue("TECHNO 2026: Wondrous Wonderland");
    expect(screen.getByLabelText("Public description")).toHaveValue(
      "A welcoming party for new School of Computer Science students to connect, explore, and begin their BINUS journey together.",
    );
    expect(screen.getByLabelText("Cover image URL")).toHaveValue("/himti-icon.svg");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });
});
