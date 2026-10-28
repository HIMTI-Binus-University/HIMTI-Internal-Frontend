import { useQuery } from "@tanstack/react-query";

import apiClient from "@/config/api-client";
import { Api } from "@/constants/api";
import type { CourseGroupListResponse } from "@/types/education";

export const educationKeys = {
  courseGroups: ["education", "course-groups"] as const,
};

export const useGetCourseGroups = () =>
  useQuery({
    queryKey: educationKeys.courseGroups,
    queryFn: () =>
      apiClient
        .get<CourseGroupListResponse>(Api.courseGroups)
        .then((response) => response.data.data),
  });
