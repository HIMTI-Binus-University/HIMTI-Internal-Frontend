import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EventsPage from ".";

const queries = vi.hoisted(() => ({
  useGetMe: vi.fn(),
  useEventGroups: vi.fn(),
  useGetEvents: vi.fn(),
}));

vi.mock("@/api/auth/queries", () => ({ useGetMe: queries.useGetMe }));
vi.mock("@/api/event-groups/queries", () => ({
  useEventGroups: queries.useEventGroups,
}));
vi.mock("@/api/events/queries", () => ({
  useGetEvents: queries.useGetEvents,
}));
vi.mock("@/components/Utils", () => ({
  Container: ({ children }: { children: React.ReactNode }) => children,
  PageLayout: ({ children }: { children: React.ReactNode }) => children,
}));

describe("EventsPage thumbnails", () => {
  beforeEach(() => {
    queries.useGetMe.mockReturnValue({
      data: { permissions: ["manage_event_groups"] },
    });
    queries.useEventGroups.mockReturnValue({
      data: [
        {
          id: "group-1",
          name: "TECHFEST 2026",
          status: "DRAFT",
          publicDescription: "Technology festival",
          coverImageUrl: "https://example.com/techfest.jpg",
        },
      ],
      isLoading: false,
      isError: false,
    });
    queries.useGetEvents.mockReturnValue({
      data: [
        {
          id: "event-1",
          name: "Tech Conference",
          status: "PUBLISHED",
          locationName: "BINUS",
          startsAt: null,
          coverImageUrl: null,
        },
      ],
      isLoading: false,
      isError: false,
    });
  });

  it("shows cover thumbnails and keeps a fallback when an image fails", () => {
    const { container } = render(
      <MemoryRouter>
        <EventsPage />
      </MemoryRouter>,
    );

    const image = screen.getByRole("img", {
      name: "TECHFEST 2026 thumbnail",
    });
    expect(image).toHaveAttribute("loading", "lazy");
    expect(image).toHaveAttribute("src", "https://example.com/techfest.jpg");
    expect(container.querySelectorAll("svg.lucide-image-off")).toHaveLength(1);

    fireEvent.error(image);
    expect(
      screen.queryByRole("img", { name: "TECHFEST 2026 thumbnail" }),
    ).not.toBeInTheDocument();
    expect(container.querySelectorAll("svg.lucide-image-off")).toHaveLength(2);
  });
});
