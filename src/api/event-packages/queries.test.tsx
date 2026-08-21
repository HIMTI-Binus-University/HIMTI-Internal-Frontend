import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient from "@/config/api-client";
import { useCreateEventPackage, useEventPackages, useUpdateEventPackage } from "./queries";

vi.mock("@/config/api-client", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

const mockedClient = vi.mocked(apiClient);

describe("event package hooks", () => {
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;
  beforeEach(() => {
    vi.clearAllMocks();
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    wrapper = ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  });

  it("lists packages with an encoded sub-event ID", async () => {
    mockedClient.get.mockResolvedValue({ data: { msg: "success", data: [] } });
    const { result } = renderHook(() => useEventPackages("sub/event"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedClient.get).toHaveBeenCalledWith("/api/v1/internal/sub-events/sub%2Fevent/packages");
  });

  it("creates and revision-updates packages through contract paths", async () => {
    mockedClient.post.mockResolvedValue({ data: {} });
    mockedClient.put.mockResolvedValue({ data: {} });
    const create = renderHook(() => useCreateEventPackage("sub-1"), { wrapper });
    const update = renderHook(() => useUpdateEventPackage("sub-1"), { wrapper });
    const payload = { code: "TEAM", currency: "IDR", name: "Team", priceMinor: "150000", seatCount: 4 };
    await act(() => create.result.current.mutateAsync(payload));
    await act(() => update.result.current.mutateAsync({ packageId: "pkg/1", payload: { revision: 2, status: "INACTIVE" } }));
    expect(mockedClient.post).toHaveBeenCalledWith("/api/v1/internal/sub-events/sub-1/packages", payload);
    expect(mockedClient.put).toHaveBeenCalledWith("/api/v1/internal/event-packages/pkg%2F1", { revision: 2, status: "INACTIVE" });
  });
});
