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

const renderLayout = (path: string, title = "Events") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <PageLayout icon={CalendarDays} title={title}>
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

  it("uses browser history for the universal back button", () => {
    renderLayout("/events");

    fireEvent.click(screen.getByRole("button", { name: "Go back" }));

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});
