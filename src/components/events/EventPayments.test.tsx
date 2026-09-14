import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, test, vi } from "vitest";
import apiClient from "@/config/api-client";
import type { components } from "@/generated/openapi";
import { PaymentReview } from "./EventPayments";

vi.mock("@/config/api-client", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));
vi.mock("@/components/notification", () => ({
  useNotification: () => vi.fn(),
  backendMessage: (_: unknown, fallback: string) => fallback,
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
const payment = {
  id: "payment",
  registrationId: "order",
  eventId: "event",
  eventName: "Event",
  packageName: "Pair",
  status: "REVIEW",
  orderStatus: "PAYMENT_REVIEW",
  revision: 4,
  currency: "IDR",
  amountMinor: "50000",
  bank: null,
  expiresAt: "2099-01-01T00:00:00Z",
  acknowledgementCount: 2,
  requiredCount: 2,
  allowedMediaTypes: ["image/png"],
  maxBytes: 1572864,
  members: ["Alice", "Bob"].map((name) => ({
    id: name,
    name,
    email: `${name}@example.com`,
    correction: null,
    proofs: [
      {
        id: name,
        status: "CURRENT",
        mediaType: "image/png",
        sizeBytes: 12,
        submittedAt: "2026-01-01T00:00:00Z",
        contentUrl: `/api/private/payment-proofs/${name}/content`,
      },
    ],
  })),
} as components["schemas"]["EventPayment"];

test("correction requires targets and reason, confirms then sends only selected members", async () => {
  vi.mocked(apiClient.post).mockResolvedValue({ data: {} });
  const client = new QueryClient();
  render(
    <QueryClientProvider client={client}>
      <PaymentReview payment={payment} canViewProofs={false} />
    </QueryClientProvider>,
  );
  expect(screen.queryByRole("button", { name: "View proof" })).toBeNull();
  expect(
    screen.getByRole("button", { name: "Request correction" }),
  ).toBeDisabled();
  fireEvent.click(screen.getByLabelText("Request correction for Alice"));
  fireEvent.change(
    screen.getByLabelText("Reason for correction or final rejection"),
    { target: { value: "Unreadable" } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Request correction" }));
  expect(apiClient.post).not.toHaveBeenCalled();
  const buttons = screen.getAllByRole("button", { name: "Request correction" });
  fireEvent.click(buttons[buttons.length - 1]);
  await waitFor(() =>
    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/internal/event-payments/payment/request-correction",
      { expectedRevision: 4, memberIds: ["Alice"], reason: "Unreadable" },
    ),
  );
  client.clear();
});

test("collecting payments cannot approve and terminal payments have no decision controls", () => {
  const client = new QueryClient();
  const view = render(
    <QueryClientProvider client={client}>
      <PaymentReview
        payment={{ ...payment, status: "COLLECTING", acknowledgementCount: 1 }}
        canViewProofs
      />
    </QueryClientProvider>,
  );
  expect(
    screen.getByRole("button", { name: "Approve payment" }),
  ).toBeDisabled();
  view.rerender(
    <QueryClientProvider client={client}>
      <PaymentReview
        payment={{ ...payment, status: "VERIFIED" }}
        canViewProofs
      />
    </QueryClientProvider>,
  );
  expect(screen.queryByRole("button", { name: "Approve payment" })).toBeNull();
  client.clear();
});
