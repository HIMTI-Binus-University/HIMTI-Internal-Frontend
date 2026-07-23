import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient from "@/config/api-client";
import { Api } from "@/constants/api";
import type { SubeventPayload } from "@/types/events";
import {
  useCreateEvent,
  useCreateSubevent,
  useGetEvents,
  useOrderSubevents,
} from "./queries";

vi.mock("@/config/api-client", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn() },
}));

const mockedClient = vi.mocked(apiClient);
const response = (data: unknown) => Promise.resolve({ data });

describe("event persistence hooks", () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  });

  it("creates draft events with nullable optional covers", async () => {
    mockedClient.post.mockImplementation(() =>
      response({ data: { id: "event-1" } }),
    );
    const { result } = renderHook(() => useCreateEvent(), { wrapper });
    await act(() =>
      result.current.mutateAsync({
        name: "Expo",
        publicDescription: "Public",
        coverImageUrl: null,
      }),
    );
    expect(mockedClient.post).toHaveBeenCalledWith(Api.eventCreate, {
      name: "Expo",
      publicDescription: "Public",
      coverImageUrl: null,
      status: "DRAFT",
    });
  });

  it("sends event search and status filters to the backend", async () => {
    mockedClient.get.mockImplementation(() =>
      response({ data: [], meta: { totalRecords: 0 } }),
    );
    const { result } = renderHook(() => useGetEvents("techno", "PUBLISHED"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedClient.get).toHaveBeenCalledWith(Api.eventList, {
      params: {
        page: 1,
        limit: 100,
        search: "techno",
        status: "PUBLISHED",
      },
    });
  });

  it("persists visibility and optional hub links on subevent creation", async () => {
    mockedClient.post.mockImplementation(() =>
      response({ data: { id: "sub-1" } }),
    );
    const payload: SubeventPayload = {
      eventId: "event-1",
      name: "Internal Expo",
      publicDescription: "Members",
      date: "2026-08-01T02:00:00.000Z",
      type: "OTHER",
      locationUrl: null,
      posterUrl: "https://cdn.example.com/poster.jpg",
      destinationUrl: null,
      price: 0,
      paid: false,
      visibility: "INTERNAL",
    };
    const { result } = renderHook(() => useCreateSubevent("event-1"), {
      wrapper,
    });
    await act(() => result.current.mutateAsync(payload));
    expect(mockedClient.post).toHaveBeenCalledWith(Api.subeventCreate, payload);
  });

  it("sends the complete ordered subevent id list and invalidates persisted content", async () => {
    mockedClient.put.mockImplementation(() => response({ data: [] }));
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useOrderSubevents("event/1"), {
      wrapper,
    });
    await act(() => result.current.mutateAsync(["sub-2", "sub-1"]));
    expect(mockedClient.put).toHaveBeenCalledWith(
      expect.stringContaining("event%2F1/sub-events/order"),
      { subEventIds: ["sub-2", "sub-1"] },
    );
    await waitFor(() => expect(invalidate).toHaveBeenCalled());
  });
});
