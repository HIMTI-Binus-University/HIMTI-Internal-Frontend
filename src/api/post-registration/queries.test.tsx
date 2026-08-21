import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient from "@/config/api-client";
import {
  usePostRegistrationAssignments,
  useRequestPostRegistrationCorrection,
} from "./queries";

vi.mock("@/config/api-client", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const mockedClient = vi.mocked(apiClient);
const response = (data: unknown) => Promise.resolve({ data });

describe("internal post-registration hooks", () => {
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

  it("passes generated filters to the encoded subevent endpoint", async () => {
    mockedClient.get.mockImplementation(() =>
      response({ data: [], meta: {}, summary: {} }),
    );
    const filters = { page: 2, limit: 20, status: "LOCKED" as const };
    const { result } = renderHook(
      () => usePostRegistrationAssignments("sub/event", filters),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedClient.get).toHaveBeenCalledWith(
      "/api/v1/internal/sub-events/sub%2Fevent/post-registration-assignments",
      { params: filters },
    );
  });

  it("uses exact response revision, reason, and deadline for correction", async () => {
    mockedClient.post.mockImplementation(() =>
      response({ data: { id: "assignment/1" } }),
    );
    const { result } = renderHook(useRequestPostRegistrationCorrection, {
      wrapper,
    });
    await act(() =>
      result.current.mutateAsync({
        assignmentId: "assignment/1",
        revision: 4,
        reason: "Signature is missing",
        deadlineAt: "2026-08-22T10:00:00.000Z",
      }),
    );
    expect(mockedClient.post).toHaveBeenCalledWith(
      "/api/v1/internal/post-registration-assignments/assignment%2F1/request-correction",
      {
        revision: 4,
        reason: "Signature is missing",
        deadlineAt: "2026-08-22T10:00:00.000Z",
      },
    );
  });
});
