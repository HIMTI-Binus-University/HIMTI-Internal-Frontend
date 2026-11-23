import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { Api } from "@/constants/api";
import type { operations } from "@/generated/openapi";
type StudyClubPayload =
  operations["createStudyClub"]["requestBody"]["content"]["application/json"];

type ListQuery = NonNullable<
  operations["listStudyClubs"]["parameters"]["query"]
>;
type ListResponse =
  operations["listStudyClubs"]["responses"][200]["content"]["application/json"];
type SessionResponse =
  operations["getStudyClub"]["responses"][200]["content"]["application/json"];
const keys = ["education", "study-clubs"] as const;

export const useGetStudyClubs = (params: ListQuery) =>
  useQuery({
    queryKey: [...keys, params],
    queryFn: () =>
      apiClient
        .get<ListResponse>(Api.studyClubs, { params })
        .then((response) => response.data),
    refetchInterval: 30_000,
  });

export const useCreateStudyClub = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: StudyClubPayload) =>
      apiClient
        .post<SessionResponse>(Api.studyClubs, payload)
        .then((response) => response.data.data),
    onSuccess: () => client.invalidateQueries({ queryKey: keys }),
  });
};

export const useUpdateStudyClub = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: StudyClubPayload }) =>
      apiClient
        .patch<SessionResponse>(
          `${Api.studyClubs}/${encodeURIComponent(id)}`,
          payload,
        )
        .then((response) => response.data.data),
    onSuccess: () => client.invalidateQueries({ queryKey: keys }),
  });
};
