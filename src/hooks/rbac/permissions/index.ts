import {
  useMutationCreatePermission,
  useMutationUpdatePermission,
} from "@/api/rbac/queries";

export const useCreatePermission = () => {
  return useMutationCreatePermission({
    onError: (error) => {
      console.error("Error (useCreatePermission):", error);
    },
  });
};

export const useUpdatePermission = () => {
  return useMutationUpdatePermission({
    onError: (error) => {
      console.error("Error (useUpdatePermission):", error);
    },
  });
};
