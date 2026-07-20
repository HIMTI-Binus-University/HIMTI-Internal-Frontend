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
  DeletePermissionPayload,
  DeleteRolePayload,
  AssignRolePermissionPayload,
  AssignUserRolePayload,
  RbacUser,
  RbacUserSummary,
  UpdateUserPayload,
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

export const useMutationDeletePermission = (
  options?: UseMutationOptions<Permission, AxiosError, DeletePermissionPayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: DeletePermissionPayload) =>
      apiClient
        .patch<Permission>(Api.permissionDelete.replace(":id", id))
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
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

export const useMutationDeleteRole = (
  options?: UseMutationOptions<Role, AxiosError, DeleteRolePayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: DeleteRolePayload) =>
      apiClient
        .patch<Role>(Api.roleDelete.replace(":id", id))
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["rbac-users"] });
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
  const cleanParams = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value != null));

  return useQuery({
    queryKey: ["rbac-users", cleanParams],
    queryFn: () =>
      apiClient
        .get<RbacUserListResponse>(Api.userList, { params: cleanParams })
        .then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetUserSummary = (params: RbacUserListParams) =>
  useQuery({
    queryKey: ["rbac-users", "summary", params],
    queryFn: () => apiClient.get<{ data: RbacUserSummary }>(Api.userSummary, { params }).then((res) => res.data.data),
  });

export const useGetUser = (id: string) =>
  useQuery({
    queryKey: ["rbac-users", id],
    queryFn: () => apiClient.get<{ data: RbacUser }>(Api.userDetail.replace(":id", id)).then((res) => res.data.data),
    enabled: !!id,
  });

export const useUpdateUser = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => apiClient.patch<{ data: RbacUser }>(Api.userDetail.replace(":id", id), payload).then((res) => res.data.data),
    onSuccess: (user) => {
      queryClient.setQueryData(["rbac-users", id], user);
      queryClient.invalidateQueries({ queryKey: ["rbac-users"] });
    },
  });
};

export const useResendUserVerification = (id: string) =>
  useMutation({ mutationFn: () => apiClient.post(Api.userResendVerification.replace(":id", id)) });

export const exportUsers = (params: RbacUserListParams) =>
  apiClient.get<Blob>(Api.userExport, { params, responseType: "blob" });

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
