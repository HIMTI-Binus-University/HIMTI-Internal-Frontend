import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/config/api-client";
import { Api } from "@/constants/api";
import type {
  CourseGroup,
  CourseGroupListResponse,
  CreateCourseGroupPayload,
  UpdateCourseGroupPayload,
} from "@/types/education";

export const educationKeys = {
  courseGroups: ["education", "course-groups"] as const,
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
