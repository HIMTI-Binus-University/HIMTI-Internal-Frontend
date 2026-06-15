import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { Api } from "@/constants/api";
import { AxiosError } from "axios";
import type {
  Permission,
  Role,
  RbacUserListParams,
  RbacUserListResponse,
  UpdatePermissionPayload,
  UpdateRolePayload,
  AssignRolePermissionPayload,
  AssignUserRolePayload,
} from "@/types/rbac";

// ─── Permissions ─────────────────────────────────────────────────────────────

export const useGetPermissions = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: () =>
      apiClient
        .get<{ msg: string; data: Permission[]; total: number }>(`${Api.permissionList}?status=ACTIVE`)
        .then((res) => res.data.data),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMutationCreatePermission = (
  options?: UseMutationOptions<Permission, AxiosError, { name: string }>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string }) =>
      apiClient
        .post<Permission>(Api.permissionCreate, payload)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
    ...options,
  });
};

export const useMutationUpdatePermission = (
  options?: UseMutationOptions<Permission, AxiosError, UpdatePermissionPayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdatePermissionPayload) =>
      apiClient
        .patch<Permission>(
          Api.permissionUpdate.replace(":id", id),
          data,
        )
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
    ...options,
  });
};

// ─── Roles ────────────────────────────────────────────────────────────────────

export const useGetRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () =>
      apiClient
        .get<{ msg: string; data: Role[]; total: number }>(`${Api.roleList}?status=ACTIVE`)
        .then((res) => res.data.data),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMutationCreateRole = (
  options?: UseMutationOptions<Role, AxiosError, { roleName: string }>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { roleName: string }) =>
      apiClient
        .post<Role>(Api.roleCreate, payload)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    ...options,
  });
};

export const useMutationUpdateRole = (
  options?: UseMutationOptions<Role, AxiosError, UpdateRolePayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateRolePayload) =>
      apiClient
        .patch<Role>(Api.roleUpdate.replace(":id", id), data)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    ...options,
  });
};

export const useMutationAssignRolePermission = (
  options?: UseMutationOptions<unknown, AxiosError, AssignRolePermissionPayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignRolePermissionPayload) =>
      apiClient
        .post(Api.roleAssignPermission, payload)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    ...options,
  });
};

export const useMutationRemoveRolePermission = (
  options?: UseMutationOptions<unknown, AxiosError, AssignRolePermissionPayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignRolePermissionPayload) =>
      apiClient
        .delete(Api.roleRemovePermission, { data: payload })
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    ...options,
  });
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const useGetUsers = (params: RbacUserListParams = {}) => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const search = params.search?.trim() ?? "";
  const status = params.status ?? "ACTIVE";

  return useQuery({
    queryKey: ["rbac-users", { page, limit, search, status }],
    queryFn: () =>
      apiClient
        .get<RbacUserListResponse>(Api.userList, {
          params: {
            page,
            limit,
            status,
            ...(search ? { search } : {}),
          },
        })
        .then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMutationAssignUserRole = (
  options?: UseMutationOptions<unknown, AxiosError, AssignUserRolePayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignUserRolePayload) =>
      apiClient
        .post(Api.userAssignRole, payload)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-users"] });
    },
    ...options,
  });
};

export const useMutationRemoveUserRole = (
  options?: UseMutationOptions<unknown, AxiosError, AssignUserRolePayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignUserRolePayload) =>
      apiClient
        .delete(Api.userRemoveRole, { data: payload })
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-users"] });
    },
    ...options,
  });
};
