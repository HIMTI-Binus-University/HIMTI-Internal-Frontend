import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { CalendarDays } from "lucide-react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PageLayout from "./PageLayout";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("./Sidebar", () => ({
  default: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="sidebar" data-open={String(isOpen)} />
  ),
}));

const renderLayout = (path: string, title = "Events", backTo?: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <PageLayout icon={CalendarDays} title={title} backTo={backTo}>
        <p>Page content</p>
      </PageLayout>
    </MemoryRouter>,
  );

describe("PageLayout", () => {
  beforeEach(() => {
    navigateMock.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders breadcrumbs from the matching sidebar group and page route", () => {
    renderLayout("/events");

    const breadcrumbs = screen.getByLabelText("Breadcrumb");
    expect(within(breadcrumbs).getByText("Tools")).toBeInTheDocument();
    expect(within(breadcrumbs).getByText("Events")).toBeInTheDocument();
  });

  it("appends the current page title for nested pages under a known route", () => {
    renderLayout("/events/subevent-a/form", "Subevent A Form");

    const breadcrumbs = screen.getByLabelText("Breadcrumb");
    expect(within(breadcrumbs).getByText("Tools")).toBeInTheDocument();
    expect(within(breadcrumbs).getByText("Events")).toBeInTheDocument();
    expect(within(breadcrumbs).getByText("Subevent A Form")).toBeInTheDocument();
  });

  it("navigates to the configured breadcrumb parent", () => {
    renderLayout("/rbac/users", "Users", "/rbac/roles");

    fireEvent.click(screen.getByRole("button", { name: "Go back" }));

    expect(navigateMock).toHaveBeenCalledWith("/rbac/roles");
  });

  it("derives the parent path for nested event breadcrumbs", () => {
    renderLayout("/events/event-a/subevents/subevent-a/forms/form-a", "Edit form");

    fireEvent.click(screen.getByRole("button", { name: "Go back" }));

    expect(navigateMock).toHaveBeenCalledWith(
      "/events/event-a/subevents/subevent-a/forms",
    );
  });

  it("disables back navigation when the breadcrumb has no routable parent", () => {
    renderLayout("/events");

    expect(screen.getByRole("button", { name: "Go back" })).toBeDisabled();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
