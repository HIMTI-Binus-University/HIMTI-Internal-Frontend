import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/config/api-client";
import { Api } from "@/constants/api";
import type {
  ApiEnvelope,
  LinkWorkspace,
  PaginatedEnvelope,
  WorkspaceLink,
  WorkspaceLinkInput,
  WorkspaceMember,
  WorkspaceRole,
  WorkspaceStatus,
} from "@/types/link-workspace";

export const workspacePath = (
  template: string,
  values: Record<string, string>,
) =>
  Object.entries(values).reduce(
    (url, [key, value]) => url.replace(`:${key}`, encodeURIComponent(value)),
    template,
  );

export const linkWorkspaceKeys = {
  all: ["link-workspaces"] as const,
  lists: () => ["link-workspaces", "list"] as const,
  list: (status: WorkspaceStatus) =>
    ["link-workspaces", "list", status] as const,
  detail: (id: string) => ["link-workspaces", "detail", id] as const,
  members: (id: string) => ["link-workspaces", "members", id] as const,
  links: (id: string) => ["link-workspaces", "links", id] as const,
};

export const useLinkWorkspaces = (status: WorkspaceStatus = "ACTIVE") =>
  useQuery({
    queryKey: linkWorkspaceKeys.list(status),
    queryFn: () =>
      apiClient
        .get<PaginatedEnvelope<LinkWorkspace>>(Api.linkWorkspaces, {
          params: { page: 1, limit: 100, status },
        })
        .then((response) => response.data),
  });

export const useLinkWorkspace = (workspaceId: string) =>
  useQuery({
    queryKey: linkWorkspaceKeys.detail(workspaceId),
    queryFn: () =>
      apiClient
        .get<ApiEnvelope<LinkWorkspace>>(
          workspacePath(Api.linkWorkspace, { workspaceId }),
        )
        .then((response) => response.data.data),
    enabled: !!workspaceId,
  });

export const useWorkspaceMembers = (workspaceId: string, enabled = true) =>
  useQuery({
    queryKey: linkWorkspaceKeys.members(workspaceId),
    queryFn: () =>
      apiClient
        .get<ApiEnvelope<WorkspaceMember[]>>(
          workspacePath(Api.linkWorkspaceMembers, { workspaceId }),
        )
        .then((response) => response.data.data),
    enabled: !!workspaceId && enabled,
  });

export const useWorkspaceLinks = (workspaceId: string) =>
  useQuery({
    queryKey: linkWorkspaceKeys.links(workspaceId),
    queryFn: () =>
      apiClient
        .get<ApiEnvelope<WorkspaceLink[]>>(
          workspacePath(Api.linkWorkspaceLinks, { workspaceId }),
        )
        .then((response) => response.data.data),
    enabled: !!workspaceId,
  });

const useInvalidateWorkspace = (workspaceId?: string) => {
  const client = useQueryClient();
  return () => {
    client.invalidateQueries({ queryKey: linkWorkspaceKeys.all });
    if (workspaceId) {
      client.invalidateQueries({
        queryKey: linkWorkspaceKeys.detail(workspaceId),
      });
      client.invalidateQueries({
        queryKey: linkWorkspaceKeys.members(workspaceId),
      });
      client.invalidateQueries({
        queryKey: linkWorkspaceKeys.links(workspaceId),
      });
    }
  };
};

export const useCreateWorkspace = () => {
  const invalidate = useInvalidateWorkspace();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string | null }) =>
      apiClient
        .post<ApiEnvelope<LinkWorkspace>>(Api.linkWorkspaces, payload)
        .then((response) => response.data.data),
    onSuccess: invalidate,
  });
};

export const useUpdateWorkspace = (workspaceId: string) => {
  const invalidate = useInvalidateWorkspace(workspaceId);
  return useMutation({
    mutationFn: (payload: { name?: string; description?: string | null }) =>
      apiClient
        .put<ApiEnvelope<LinkWorkspace>>(
          workspacePath(Api.linkWorkspace, { workspaceId }),
          payload,
        )
        .then((response) => response.data.data),
    onSuccess: invalidate,
  });
};

export const useArchiveWorkspace = (workspaceId: string) => {
  const invalidate = useInvalidateWorkspace(workspaceId);
  return useMutation({
    mutationFn: () =>
      apiClient
        .patch<ApiEnvelope<LinkWorkspace>>(
          workspacePath(Api.linkWorkspaceArchive, { workspaceId }),
          {},
        )
        .then((response) => response.data.data),
    onSuccess: invalidate,
  });
};

export const useCreateWorkspaceLink = (workspaceId: string) => {
  const invalidate = useInvalidateWorkspace(workspaceId);
  return useMutation({
    mutationFn: (payload: WorkspaceLinkInput) =>
      apiClient
        .post<ApiEnvelope<WorkspaceLink>>(
          workspacePath(Api.linkWorkspaceLinks, { workspaceId }),
          payload,
        )
        .then((response) => response.data.data),
    onSuccess: invalidate,
  });
};

export const useUpdateWorkspaceLink = (workspaceId: string) => {
  const invalidate = useInvalidateWorkspace(workspaceId);
  return useMutation({
    mutationFn: ({ id, ...payload }: WorkspaceLinkInput & { id: string }) =>
      apiClient
        .put<ApiEnvelope<WorkspaceLink>>(
          workspacePath(Api.linkWorkspaceLink, { workspaceId, linkId: id }),
          payload,
        )
        .then((response) => response.data.data),
    onSuccess: invalidate,
  });
};

export const useDeactivateWorkspaceLink = (workspaceId: string) => {
  const invalidate = useInvalidateWorkspace(workspaceId);
  return useMutation({
    mutationFn: (linkId: string) =>
      apiClient
        .patch<ApiEnvelope<WorkspaceLink>>(
          workspacePath(Api.linkWorkspaceLinkDeactivate, {
            workspaceId,
            linkId,
          }),
          {},
        )
        .then((response) => response.data.data),
    onSuccess: invalidate,
  });
};

export const useAttachWorkspaceLink = (workspaceId: string) => {
  const client = useQueryClient();
  const invalidate = useInvalidateWorkspace(workspaceId);
  return useMutation({
    mutationFn: (urlId: string) =>
      apiClient
        .post<ApiEnvelope<WorkspaceLink>>(
          workspacePath(Api.linkWorkspaceAttach, { workspaceId }),
          { urlId },
        )
        .then((response) => response.data.data),
    onSuccess: () => {
      invalidate();
      client.invalidateQueries({ queryKey: ["urls"] });
    },
  });
};

export const useAddWorkspaceMember = (workspaceId: string) => {
  const invalidate = useInvalidateWorkspace(workspaceId);
  return useMutation({
    mutationFn: (payload: {
      userId: string;
      role: Exclude<WorkspaceRole, "OWNER">;
    }) =>
      apiClient
        .post<ApiEnvelope<WorkspaceMember>>(
          workspacePath(Api.linkWorkspaceMembers, { workspaceId }),
          payload,
        )
        .then((response) => response.data.data),
    onSuccess: invalidate,
  });
};

export const useUpdateWorkspaceMember = (workspaceId: string) => {
  const client = useQueryClient();
  const invalidate = useInvalidateWorkspace(workspaceId);
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: WorkspaceRole }) =>
      apiClient
        .patch<ApiEnvelope<WorkspaceMember>>(
          workspacePath(Api.linkWorkspaceMember, { workspaceId, userId }),
          { role },
        )
        .then((response) => response.data.data),
    onSuccess: (updatedMember) => {
      const applyRoleChange = (members: WorkspaceMember[]) =>
        members.map((member) => ({
          ...member,
          role:
            member.userId === updatedMember.userId
              ? updatedMember.role
              : updatedMember.role === "OWNER" && member.role === "OWNER"
                ? "EDITOR"
                : member.role,
        }));

      client.setQueryData<WorkspaceMember[]>(
        linkWorkspaceKeys.members(workspaceId),
        (members) => (members ? applyRoleChange(members) : members),
      );
      client.setQueryData<LinkWorkspace>(
        linkWorkspaceKeys.detail(workspaceId),
        (workspace) =>
          workspace
            ? { ...workspace, members: applyRoleChange(workspace.members) }
            : workspace,
      );
      invalidate();
    },
  });
};

export const useRemoveWorkspaceMember = (workspaceId: string) => {
  const invalidate = useInvalidateWorkspace(workspaceId);
  return useMutation({
    mutationFn: (userId: string) =>
      apiClient
        .delete<ApiEnvelope<WorkspaceMember>>(
          workspacePath(Api.linkWorkspaceMember, { workspaceId, userId }),
        )
        .then((response) => response.data.data),
    onSuccess: invalidate,
  });
};
