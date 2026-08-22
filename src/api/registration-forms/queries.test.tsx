import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient from "@/config/api-client";
import {
  registrationFormKeys,
  usePublishRegistrationForm,
  useRegistrationForms,
  useSaveRegistrationFormDraft,
} from "./queries";

vi.mock("@/config/api-client", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

const mockedClient = vi.mocked(apiClient);
const response = (data: unknown) => Promise.resolve({ data });

describe("registration form V1 hooks", () => {
  let client: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    wrapper = ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  });

  it("lists forms with the exact sub-event query", async () => {
    mockedClient.get.mockImplementation(() => response({ data: [] }));
    const { result } = renderHook(() => useRegistrationForms("sub/event"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedClient.get).toHaveBeenCalledWith("/api/v1/registration-form", {
      params: { subEventId: "sub/event" },
    });
  });

  it("encodes IDs and invalidates only the owning list after save", async () => {
    mockedClient.put.mockImplementation(() =>
      response({ data: { id: "form/1", subEventId: "sub-1", revision: 2 } }),
    );
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useSaveRegistrationFormDraft(), {
      wrapper,
    });
    await act(() =>
      result.current.mutateAsync({
        id: "form/1",
        draft: {
          name: "Form",
          revision: 1,
          stage: "REGISTRATION",
          audience: "BUYER",
          isRequired: true,
          opensAt: null,
          closesAt: null,
          blocksCheckIn: false,
          orderIndex: 0,
          sections: [],
        },
      }),
    );
    expect(mockedClient.put).toHaveBeenCalledWith(
      "/api/v1/registration-form/form%2F1/draft",
      expect.objectContaining({ revision: 1 }),
    );
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: registrationFormKeys.list("sub-1"),
    });
  });

  it("sends the loaded revision when publishing", async () => {
    mockedClient.post.mockImplementation(() =>
      response({ data: { id: "form/1", subEventId: "sub-1", revision: 3 } }),
    );
    const { result } = renderHook(() => usePublishRegistrationForm(), {
      wrapper,
    });

    await act(() => result.current.mutateAsync({ id: "form/1", revision: 2 }));

    expect(mockedClient.post).toHaveBeenCalledWith(
      "/api/v1/registration-form/form%2F1/publish",
      { revision: 2 },
    );
  });
});
