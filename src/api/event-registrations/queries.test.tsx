import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient from "@/config/api-client";
import {
  useBulkReviewRegistrations,
  useRegistrationNeighbors,
  useRegistrationQueue,
  useReviewRegistration,
} from "./queries";

vi.mock("@/config/api-client", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const mockedClient = vi.mocked(apiClient);
const response = (data: unknown) => Promise.resolve({ data });

describe("internal registration hooks", () => {
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

  it("sends strict queue filters and encodes the sub-event ID", async () => {
    mockedClient.get.mockImplementation(() =>
      response({
        data: [],
        meta: { page: 2, limit: 25, totalPages: 0, totalRecords: 0 },
      }),
    );
    const filters = {
      page: 2,
      limit: 25,
      search: "Ada",
      status: "PENDING_APPROVAL" as const,
      responseStatus: "SUBMITTED" as const,
      paymentStatus: "NOT_REQUIRED" as const,
      sort: "submittedAt:asc" as const,
    };
    const { result } = renderHook(
      () => useRegistrationQueue("sub/event", filters),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedClient.get).toHaveBeenCalledWith(
      "/api/v1/internal/sub-events/sub%2Fevent/registrations",
      { params: filters },
    );
  });

  it("uses the same stable filters for neighbors without pagination", async () => {
    mockedClient.get.mockImplementation(() =>
      response({ data: { previous: null, next: null } }),
    );
    const filters = { search: "Ada", sort: "createdAt:desc" as const };
    const { result } = renderHook(
      () => useRegistrationNeighbors("sub-1", "reg/1", filters),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedClient.get).toHaveBeenCalledWith(
      "/api/v1/internal/sub-events/sub-1/registrations/reg%2F1/neighbors",
      { params: filters },
    );
  });

  it("sends revision and required action reasons", async () => {
    mockedClient.post.mockImplementation(() =>
      response({ data: { id: "reg-1", revision: 4, status: "REJECTED" } }),
    );
    const { result } = renderHook(() => useReviewRegistration("reject"), {
      wrapper,
    });
    await act(() =>
      result.current.mutateAsync({
        registrationId: "reg-1",
        revision: 3,
        reason: "Eligibility could not be verified.",
      }),
    );
    expect(mockedClient.post).toHaveBeenCalledWith(
      "/api/v1/internal/event-registrations/reg-1/reject",
      { revision: 3, reason: "Eligibility could not be verified." },
    );
  });

  it("rejects more than 50 bulk items before calling the API", async () => {
    const { result } = renderHook(
      () => useBulkReviewRegistrations("sub-1", "approve"),
      { wrapper },
    );
    await expect(
      result.current.mutateAsync({
        items: Array.from({ length: 51 }, (_, index) => ({
          registrationId: `reg-${index}`,
          revision: 1,
        })),
      }),
    ).rejects.toThrow("between 1 and 50");
    expect(mockedClient.post).not.toHaveBeenCalled();
  });
});
