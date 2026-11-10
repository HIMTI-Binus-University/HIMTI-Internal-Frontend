import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { expect, it, vi } from "vitest";

import apiClient from "@/config/api-client";
import { Api } from "@/constants/api";
import { educationKeys, useGetEducationVideos } from "./queries";

vi.mock("@/config/api-client", () => ({ default: { get: vi.fn() } }));

it("reloads the course from Schedules when reopening Videos with a fresh cache", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: false } },
  });
  const params = { page: 1, limit: 10 };
  const responseFor = (courseId: string) => ({
    data: [{ id: "video-1", session: { courseId } }],
    pagination: { ...params, total: 1, totalPages: 1 },
  });
  client.setQueryData([...educationKeys.videos, params], responseFor("old-course"));
  vi.mocked(apiClient.get).mockResolvedValueOnce({ data: responseFor("new-course") });

  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useGetEducationVideos(params), { wrapper });

  await waitFor(() => {
    expect(result.current.data?.data[0].session.courseId).toBe("new-course");
  });
  expect(apiClient.get).toHaveBeenCalledWith(Api.educationVideos, { params });
});
