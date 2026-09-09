import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, test, expect } from "vitest";
import { EventRegistrations } from "./EventBundles";

const remove = vi.fn();
vi.mock("@/api/event-registration/queries", () => ({
  useInternalEventRegistrations: () => ({
    data: {
      data: [
        {
          id: "order",
          orderNumber: "EV-001",
          kind: "BUNDLE",
          status: "ASSEMBLING",
          revision: 2,
          seatCount: 3,
          memberCount: 1,
          totalMinor: "100000",
          currency: "IDR",
          paymentDeadlineAt: null,
          confirmedAt: null,
          createdAt: "2026-01-01T00:00:00Z",
          ticketPackage: { id: "package", name: "Team" },
        },
      ],
      meta: { page: 1, limit: 20, totalRecords: 1, totalPages: 1 },
    },
    isPending: false,
    isError: false,
  }),
  useInternalEventRegistration: () => ({
    data: {
      id: "order",
      orderNumber: "EV-001",
      eventId: "event",
      ticketPackageId: "package",
      kind: "BUNDLE",
      status: "ASSEMBLING",
      revision: 2,
      seatCount: 3,
      currency: "IDR",
      subtotalMinor: "100000",
      totalMinor: "100000",
      paymentDeadlineAt: null,
      confirmedAt: null,
      cancelledAt: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: null,
      event: {
        id: "event",
        name: "Event",
        startsAt: null,
        endsAt: null,
        cancellationClosesAt: null,
      },
      ticketPackage: {
        id: "package",
        code: "TEAM",
        name: "Team",
        seatCount: 3,
      },
      capacityHold: null,
      members: [
        {
          id: "member",
          userId: "user",
          position: 1,
          status: "ACTIVE",
          name: "Member One",
          email: "one@example.com",
          supplementalRevision: 1,
          additionalAnswersReady: false,
          snapshotName: null,
          snapshotNim: null,
          snapshotOutlookEmail: null,
          snapshotEmail: null,
          snapshotUniversity: null,
          snapshotStudyProgram: null,
          snapshotRegion: null,
          snapshotPhoneNumber: null,
          snapshotAt: null,
          submissions: [],
          supplementalRequests: [],
          ticket: null,
        },
      ],
    },
    isPending: false,
    isError: false,
  }),
  useRemoveBundleMember: () => ({ mutate: remove, isPending: false }),
  useInternalRegistrationPayment: () => ({ isPending: false }),
}));
vi.mock("./EventPayments", () => ({
  PaymentReview: () => <div>Payment review</div>,
}));
vi.mock("@/components/notification", () => ({
  backendMessage: (_error: unknown, fallback: string) => fallback,
  useNotification: () => vi.fn(),
}));

test("lists individual and Bundle orders with clean filters", () => {
  render(
    <MemoryRouter>
      <EventRegistrations
        eventId="event"
        canReviewPayments={false}
        canViewProofs={false}
      />
    </MemoryRouter>,
  );
  expect(screen.getByText("EV-001")).toBeInTheDocument();
  expect(screen.getByText(/1\/3 participants/)).toBeInTheDocument();
  expect(screen.getByLabelText("Order type")).toBeInTheDocument();
  expect(screen.getByLabelText("Status")).toBeInTheDocument();
});

test("shows cohesive Bundle detail and preserves assembling member removal", () => {
  render(
    <MemoryRouter initialEntries={["/?registration=order"]}>
      <EventRegistrations
        eventId="event"
        canReviewPayments={false}
        canViewProofs={false}
      />
    </MemoryRouter>,
  );
  expect(
    screen.getByRole("button", { name: /Back to registrations/ }),
  ).toBeInTheDocument();
  expect(screen.getByText("Member One")).toBeInTheDocument();
  expect(
    screen.getByText(/Additional answers outstanding/),
  ).toBeInTheDocument();
  const button = screen.getByRole("button", { name: "Remove" });
  expect(button).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Removal reason for Member One"), {
    target: { value: "Duplicate seat" },
  });
  expect(button).toBeEnabled();
});
