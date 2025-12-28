import { useMutationDeleteUrl } from "@/api/url-shortener/queries";

export const useDeleteUrl = () => {
  const deleteUrl = useMutationDeleteUrl({
    onSuccess: (resp) => {
      return resp;
    },
    onError: (error) => {
      console.error("Error (useDeleteUrl):", error);
    },
  });

  return deleteUrl;
};
