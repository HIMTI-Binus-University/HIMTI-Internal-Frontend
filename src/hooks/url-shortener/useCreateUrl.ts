import { useMutationCreateUrl } from "@/api/url-shortener/queries";

export const useCreateUrl = () => {
  const createUrl = useMutationCreateUrl({
    onSuccess: (resp) => {
      return resp;
    },
    onError: (error) => {
      console.error("Error (useCreateUrl):", error);
    },
  });

  return createUrl;
};
