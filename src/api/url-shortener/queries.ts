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
  UrlItem,
  CreateUrlPayload,
  UpdateUrlPayload,
  UrlListResponse,
} from "@/types/url-shortener";

export const useGetUrlList = () => {
  return useQuery({
    queryKey: ["urls"],
    queryFn: () =>
      apiClient
        .get<UrlListResponse>(`${Api.urlList}?status=a`)
        .then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMutationCreateUrl = (
  options?: UseMutationOptions<UrlItem, AxiosError, CreateUrlPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUrlPayload) =>
      apiClient.post<UrlItem>(Api.urlCreate, payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
    },
    ...options,
  });
};

export const useMutationUpdateUrl = (
  options?: UseMutationOptions<UrlItem, AxiosError, UpdateUrlPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUrlPayload) => {
      const { id, ...data } = payload;
      // Set status 'a' (active) as default when updating
      const finalPayload = {
        status: "a",
        ...data,
      };
      return apiClient
        .put<UrlItem>(Api.urlUpdate.replace(":id", id), finalPayload)
        .then((res) => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
    },
    ...options,
  });
};

// Soft delete - sets status to 'd' (deleted)
export const useMutationDeleteUrl = (
  options?: UseMutationOptions<UrlItem, AxiosError, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient
        .put<UrlItem>(Api.urlUpdate.replace(":id", id), { status: "d" })
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
    },
    ...options,
  });
};
