import { useMutationUpdateUrl } from "@/api/url-shortener/queries";

export const useUpdateUrl = () => {
  const updateUrl = useMutationUpdateUrl({
    onSuccess: (resp) => {
      return resp;
    },
    onError: (error) => {
      console.error("Error (useUpdateUrl):", error);
    },
  });

  return updateUrl;
};
