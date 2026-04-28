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
  DeleteUrlPayload,
  UrlListResponse,
} from "@/types/url-shortener";
import { Status } from "@/types/url-shortener";

export const useGetUrlByShortCode = (shortCode: string) => {
  return useQuery({
    queryKey: ["url", shortCode],
    queryFn: () =>
      apiClient
        .get<UrlItem>(Api.urlLink.replace(":shortCode", shortCode))
        .then((res) => res.data),
    enabled: !!shortCode,
    retry: false,
  });
};

export const useGetUrlList = () => {
  return useQuery({
    queryKey: ["urls"],
    queryFn: () =>
      apiClient
        .get<UrlListResponse>(`${Api.urlList}?status=${Status.ACTIVE}`)
        .then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMutationCreateUrl = (
  options?: UseMutationOptions<UrlItem, AxiosError, CreateUrlPayload>,
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
  options?: UseMutationOptions<UrlItem, AxiosError, UpdateUrlPayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUrlPayload) => {
      const { id, ...data } = payload;
      const finalPayload = {
        status: Status.ACTIVE,
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

export const useMutationDeleteUrl = (
  options?: UseMutationOptions<UrlItem, AxiosError, DeleteUrlPayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, shortCode }: DeleteUrlPayload) =>
      apiClient
        .patch<UrlItem>(Api.urlDelete.replace(":id", id), { shortCode, status: Status.INACTIVE })
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
    },
    ...options,
  });
};
