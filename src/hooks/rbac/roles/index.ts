import {
  useMutationCreateRole,
  useMutationUpdateRole,
  useMutationAssignRolePermission,
  useMutationRemoveRolePermission,
} from "@/api/rbac/queries";

export const useCreateRole = () => {
  return useMutationCreateRole({
    onError: (error) => {
      console.error("Error (useCreateRole):", error);
    },
  });
};

export const useUpdateRole = () => {
  return useMutationUpdateRole({
    onError: (error) => {
      console.error("Error (useUpdateRole):", error);
    },
  });
};

export const useAssignRolePermission = () => {
  return useMutationAssignRolePermission({
    onError: (error) => {
      console.error("Error (useAssignRolePermission):", error);
    },
  });
};

export const useRemoveRolePermission = () => {
  return useMutationRemoveRolePermission({
    onError: (error) => {
      console.error("Error (useRemoveRolePermission):", error);
    },
  });
};
