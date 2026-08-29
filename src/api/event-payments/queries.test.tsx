import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient from "@/config/api-client";
import {
  getPaymentProofBlob,
  usePaymentQueue,
  useReviewPayment,
  useUpdatePaymentSettings,
} from "./queries";

vi.mock("@/config/api-client", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

const mockedClient = vi.mocked(apiClient);
const response = (data: unknown) => Promise.resolve({ data });

describe("internal payment hooks", () => {
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;

  beforeEach(() => {
    vi.clearAllMocks();
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    wrapper = ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  });

  it("passes generated queue filters to the encoded subevent endpoint", async () => {
    mockedClient.get.mockImplementation(() =>
      response({
        data: [],
        meta: { page: 1, limit: 20, totalPages: 0, totalRecords: 0 },
      }),
    );
    const filters = {
      page: 1,
      limit: 20,
      status: "PROOF_SUBMITTED" as const,
      sort: "expiresAt:asc" as const,
    };
    const { result } = renderHook(() => usePaymentQueue("sub/event", filters), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedClient.get).toHaveBeenCalledWith(
      "/api/internal/sub-events/sub%2Fevent/payments",
      { params: filters },
    );
  });

  it("sends exact settings schema fields and decimal string amount", async () => {
    mockedClient.put.mockImplementation(() =>
      response({ data: { amountMinor: "25000" } }),
    );
    const payload = {
      amountMinor: "25000",
      currency: "IDR",
      bankName: "BCA",
      accountHolder: "HIMTI",
      accountNumber: "001234",
      instructions: null,
      paymentDeadlineHours: 24,
      acceptedProofTypes: ["image/png" as const],
      maxProofBytes: 5 * 1024 * 1024,
    };
    const { result } = renderHook(() => useUpdatePaymentSettings("sub-1"), {
      wrapper,
    });
    await act(() => result.current.mutateAsync(payload));
    expect(mockedClient.put).toHaveBeenCalledWith(
      "/api/internal/sub-events/sub-1/payment-settings",
      payload,
    );
  });

  it("sends nullable bank fields and no proof types for free settings", async () => {
    mockedClient.put.mockImplementation(() =>
      response({ data: { amountMinor: "0" } }),
    );
    const payload = {
      amountMinor: "0",
      currency: "IDR",
      bankName: null,
      accountHolder: null,
      accountNumber: null,
      instructions: null,
      paymentDeadlineHours: 24,
      acceptedProofTypes: [],
      maxProofBytes: 5 * 1024 * 1024,
    };
    const { result } = renderHook(() => useUpdatePaymentSettings("sub-free"), {
      wrapper,
    });
    await act(() => result.current.mutateAsync(payload));
    expect(mockedClient.put).toHaveBeenCalledWith(
      "/api/internal/sub-events/sub-free/payment-settings",
      payload,
    );
  });

  it("uses payment IDs and revision CAS for review", async () => {
    mockedClient.post.mockImplementation(() => response({ data: {} }));
    const { result } = renderHook(() => useReviewPayment("reject"), {
      wrapper,
    });
    await act(() =>
      result.current.mutateAsync({
        paymentId: "pay/1",
        revision: 4,
        reason: "Unreadable proof",
      }),
    );
    expect(mockedClient.post).toHaveBeenCalledWith(
      "/api/internal/event-payments/pay%2F1/reject",
      { revision: 4, reason: "Unreadable proof" },
    );
  });

  it("requests proof content as an authenticated blob through apiClient", async () => {
    const blob = new Blob(["proof"], { type: "image/png" });
    mockedClient.get.mockImplementation(() => response(blob));
    await expect(
      getPaymentProofBlob("/api/private/payment-proofs/proof-1/content"),
    ).resolves.toBe(blob);
    expect(mockedClient.get).toHaveBeenCalledWith(
      "/api/private/payment-proofs/proof-1/content",
      { responseType: "blob" },
    );
  });
});
