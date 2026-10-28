import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/config/api-client";
import { Api } from "@/constants/api";
import type {
  CourseGroup,
  CourseGroupListResponse,
  CreateCourseGroupPayload,
  CreateResponsiPayload,
  ResponsiDetail,
  ResponsiDetailResponse,
  ResponsiListResponse,
  ResponsiQueryParams,
  ResponsiVersionsResponse,
  UpdateCourseGroupPayload,
  UpdateResponsiPayload,
} from "@/types/education";

export const educationKeys = {
  courseGroups: ["education", "course-groups"] as const,
  responsies: ["education", "responsies"] as const,
  responsi: (id: string) => ["education", "responsies", id] as const,
  responsiVersions: (id: string) =>
    ["education", "responsies", id, "versions"] as const,
};

export const useGetCourseGroups = (search?: string) =>
  useQuery({
    queryKey: [...educationKeys.courseGroups, search ?? ""],
    queryFn: () =>
      apiClient
        .get<CourseGroupListResponse>(Api.courseGroups, {
          params: search ? { search } : undefined,
        })
        .then((response) => response.data.data),
  });

export const useCreateCourseGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCourseGroupPayload) =>
      apiClient
        .post<{ data: CourseGroup }>(Api.courseGroups, payload)
        .then((response) => response.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: educationKeys.courseGroups });
    },
  });
};

export const useUpdateCourseGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: UpdateCourseGroupPayload & { id: string }) =>
      apiClient
        .patch<{ data: CourseGroup }>(`${Api.courseGroups}/${id}`, payload)
        .then((response) => response.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: educationKeys.courseGroups });
    },
  });
};

export const useGetResponsies = (params?: ResponsiQueryParams) =>
  useQuery({
    queryKey: [...educationKeys.responsies, params],
    queryFn: () =>
      apiClient
        .get<ResponsiListResponse>(Api.responsi, {
          params,
        })
        .then((response) => response.data),
  });

export const useGetResponsi = (id?: string) =>
  useQuery({
    queryKey: educationKeys.responsi(id ?? ""),
    queryFn: () =>
      apiClient
        .get<ResponsiDetailResponse>(`${Api.responsi}/${id}`)
        .then((response) => response.data.data),
    enabled: Boolean(id && !id.startsWith("draft-")),
  });

export const useGetResponsiVersions = (id?: string) =>
  useQuery({
    queryKey: educationKeys.responsiVersions(id ?? ""),
    queryFn: () =>
      apiClient
        .get<ResponsiVersionsResponse>(`${Api.responsi}/${id}/versions`)
        .then((response) => response.data.data),
    enabled: Boolean(id && !id.startsWith("draft-")),
  });

export const useCreateResponsi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateResponsiPayload) =>
      apiClient
        .post<ResponsiDetailResponse>(Api.responsi, payload)
        .then((response) => response.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: educationKeys.responsies });
    },
  });
};

export const useUpdateResponsi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: UpdateResponsiPayload & { id: string }) =>
      apiClient
        .patch<ResponsiDetailResponse>(`${Api.responsi}/${id}`, payload)
        .then((response) => response.data.data),
    onSuccess: (data: ResponsiDetail) => {
      queryClient.invalidateQueries({ queryKey: educationKeys.responsies });
      if (data?.id) {
        queryClient.invalidateQueries({
          queryKey: educationKeys.responsi(data.id),
        });
        queryClient.invalidateQueries({
          queryKey: educationKeys.responsiVersions(data.id),
        });
      }
    },
  });
};

export const useDeleteResponsi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient
        .delete(`${Api.responsi}/${id}`)
        .then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: educationKeys.responsies });
    },
  });
};
