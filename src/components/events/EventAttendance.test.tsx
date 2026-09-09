import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EventAttendance } from "./EventAttendance";

vi.mock("@/api/event-registration/queries", () => ({
  useEventAttendance: () => ({
    data: {
      data: [
        {
          id: "ticket-1",
          status: "ACTIVE",
          issuedAt: "2026-09-09T00:00:00.000Z",
          name: "Participant",
          email: "participant@example.com",
          nim: null,
          orderNumber: "ORDER-1",
          attendance: null,
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useCheckInEventTicket: () => ({ mutate: vi.fn(), isPending: false }),
  useCheckoutEventAttendance: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("@/components/notification", () => ({
  backendMessage: (_cause: unknown, fallback: string) => fallback,
  useNotification: () => vi.fn(),
}));

describe("EventAttendance", () => {
  it("keeps credential and manual check-in controls hidden without scan permission", () => {
    render(
      <EventAttendance
        eventId="event"
        checkoutEnabled={false}
        canCheckIn={false}
        canView
      />,
    );
    expect(screen.queryByLabelText("Ticket code")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Manual check-in" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Participant")).toBeInTheDocument();
    expect(screen.getByText("Not checked in")).toBeInTheDocument();
  });

  it("shows keyboard-accessible credential and manual controls to scanners", () => {
    render(
      <EventAttendance
        eventId="event"
        checkoutEnabled={false}
        canCheckIn
        canView
      />,
    );
    expect(screen.getByLabelText("Ticket code")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Manual check-in" }),
    ).toBeInTheDocument();
  });
});
