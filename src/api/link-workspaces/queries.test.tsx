import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient from "@/config/api-client";
import { Api } from "@/constants/api";
import {
  useAddWorkspaceMember,
  useArchiveWorkspace,
  useAttachWorkspaceLink,
  useDeactivateWorkspaceLink,
  useLinkWorkspaces,
  useUpdateWorkspace,
  useUpdateWorkspaceLink,
  useUpdateWorkspaceMember,
  useWorkspaceLinks,
} from "./queries";

vi.mock("@/config/api-client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedClient = vi.mocked(apiClient);
const response = (data: unknown) => Promise.resolve({ data });

describe("link workspace backend contract", () => {
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

  it("preserves the paginated workspace list envelope", async () => {
    const envelope = {
      msg: "success",
      data: [{ id: "workspace-1", name: "KOMTIG" }],
      meta: { page: 1, limit: 100, totalRecords: 1, totalPages: 1 },
    };
    mockedClient.get.mockImplementation(() => response(envelope));
    const { result } = renderHook(() => useLinkWorkspaces(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(envelope);
    expect(mockedClient.get).toHaveBeenCalledWith(Api.linkWorkspaces, {
      params: { page: 1, limit: 100, status: "ACTIVE" },
    });
  });

  it("unwraps the non-paginated workspace link array", async () => {
    mockedClient.get.mockImplementation(() =>
      response({
        msg: "success",
        data: [{ id: "link-1", url: { id: "url-1" } }],
      }),
    );
    const { result } = renderHook(() => useWorkspaceLinks("workspace/1"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([
      { id: "link-1", url: { id: "url-1" } },
    ]);
    expect(mockedClient.get).toHaveBeenCalledWith(
      expect.stringContaining("link-workspaces/workspace%2F1/links"),
    );
  });

  it("uses PUT for workspace and link updates", async () => {
    mockedClient.put.mockImplementation(() =>
      response({ msg: "success", data: {} }),
    );
    const workspace = renderHook(() => useUpdateWorkspace("workspace-1"), {
      wrapper,
    });
    await act(() => workspace.result.current.mutateAsync({ name: "Updated" }));
    expect(mockedClient.put).toHaveBeenCalledWith(
      expect.stringContaining("link-workspaces/workspace-1"),
      { name: "Updated" },
    );

    const link = renderHook(() => useUpdateWorkspaceLink("workspace-1"), {
      wrapper,
    });
    await act(() =>
      link.result.current.mutateAsync({
        id: "link-1",
        originalUrl: "https://himti.or.id",
        shortCode: "himti2026",
      }),
    );
    expect(mockedClient.put).toHaveBeenCalledWith(
      expect.stringContaining("workspace-1/links/link-1"),
      { originalUrl: "https://himti.or.id", shortCode: "himti2026" },
    );
  });

  it("uses PATCH with an empty body for archive and deactivate", async () => {
    mockedClient.patch.mockImplementation(() =>
      response({ msg: "success", data: {} }),
    );
    const archive = renderHook(() => useArchiveWorkspace("workspace-1"), {
      wrapper,
    });
    await act(() => archive.result.current.mutateAsync());
    expect(mockedClient.patch).toHaveBeenCalledWith(
      expect.stringContaining("workspace-1/archive"),
      {},
    );

    const deactivate = renderHook(
      () => useDeactivateWorkspaceLink("workspace-1"),
      { wrapper },
    );
    await act(() => deactivate.result.current.mutateAsync("link-1"));
    expect(mockedClient.patch).toHaveBeenCalledWith(
      expect.stringContaining("workspace-1/links/link-1/deactivate"),
      {},
    );
  });

  it("uses urlId for attach and a non-owner role for member addition", async () => {
    mockedClient.post.mockImplementation(() =>
      response({ msg: "success", data: {} }),
    );
    const attach = renderHook(() => useAttachWorkspaceLink("workspace-1"), {
      wrapper,
    });
    await act(() => attach.result.current.mutateAsync("url-1"));
    expect(mockedClient.post).toHaveBeenCalledWith(
      expect.stringContaining("workspace-1/links/attach"),
      { urlId: "url-1" },
    );

    const member = renderHook(() => useAddWorkspaceMember("workspace-1"), {
      wrapper,
    });
    await act(() =>
      member.result.current.mutateAsync({ userId: "user-1", role: "VIEWER" }),
    );
    expect(mockedClient.post).toHaveBeenCalledWith(
      expect.stringContaining("workspace-1/members"),
      { userId: "user-1", role: "VIEWER" },
    );
  });

  it("invalidates personal links after attaching one to a workspace", async () => {
    mockedClient.post.mockImplementation(() =>
      response({ msg: "success", data: {} }),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const attach = renderHook(() => useAttachWorkspaceLink("workspace-1"), {
      wrapper,
    });

    await act(() => attach.result.current.mutateAsync("url-1"));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["urls"] });
  });

  it("updates both member and workspace caches after ownership transfer", async () => {
    const members = [
      { userId: "old-owner", role: "OWNER" as const },
      { userId: "new-owner", role: "EDITOR" as const },
    ];
    queryClient.setQueryData(
      ["link-workspaces", "members", "workspace-1"],
      members,
    );
    queryClient.setQueryData(["link-workspaces", "detail", "workspace-1"], {
      id: "workspace-1",
      members,
    });
    mockedClient.patch.mockImplementation(() =>
      response({
        msg: "success",
        data: { userId: "new-owner", role: "OWNER" },
      }),
    );
    const update = renderHook(() => useUpdateWorkspaceMember("workspace-1"), {
      wrapper,
    });

    await act(() =>
      update.result.current.mutateAsync({
        userId: "new-owner",
        role: "OWNER",
      }),
    );

    expect(
      queryClient.getQueryData(["link-workspaces", "members", "workspace-1"]),
    ).toEqual([
      { userId: "old-owner", role: "EDITOR" },
      { userId: "new-owner", role: "OWNER" },
    ]);
    expect(
      queryClient.getQueryData<{ members: typeof members }>([
        "link-workspaces",
        "detail",
        "workspace-1",
      ])?.members,
    ).toEqual([
      { userId: "old-owner", role: "EDITOR" },
      { userId: "new-owner", role: "OWNER" },
    ]);
  });
});
