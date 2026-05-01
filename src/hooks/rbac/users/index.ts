import {
  useMutationAssignUserRole,
  useMutationRemoveUserRole,
} from "@/api/rbac/queries";

export const useAssignUserRole = () => {
  return useMutationAssignUserRole({
    onError: (error) => {
      console.error("Error (useAssignUserRole):", error);
    },
  });
};

export const useRemoveUserRole = () => {
  return useMutationRemoveUserRole({
    onError: (error) => {
      console.error("Error (useRemoveUserRole):", error);
    },
  });
};
