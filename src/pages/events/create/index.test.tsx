import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
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
});
