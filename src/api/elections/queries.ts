import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/config/api-client";
import { Api } from "@/constants/api";
import type {
  CandidatePayload,
  Election,
  ElectionCandidate,
  ElectionPayload,
  ElectionPublicDetailsPayload,
  ElectionResponse,
  ElectionTally,
  ElectionTurnout,
} from "@/types/elections";

const path = (template: string, key: string, value: string) =>
  template.replace(`:${key}`, encodeURIComponent(value));
const electionPath = (template: string, id: string) =>
  path(template, "electionId", id);

export const electionKeys = {
  all: ["elections"] as const,
  list: ["elections", "list"] as const,
  detail: (id: string) => ["elections", id] as const,
  turnout: (id: string) => ["elections", id, "turnout"] as const,
  tally: (id: string) => ["elections", id, "tally"] as const,
};

export const useGetElections = () =>
  useQuery({
    queryKey: electionKeys.list,
    queryFn: () =>
      apiClient
        .get<ElectionResponse<Election[]>>(Api.elections)
        .then((response) => response.data.data),
  });

export const useGetElection = (id: string) =>
  useQuery({
    queryKey: electionKeys.detail(id),
    queryFn: () =>
      apiClient
        .get<ElectionResponse<Election>>(electionPath(Api.election, id))
        .then((response) => response.data.data),
    enabled: !!id,
  });

const useElectionMutation = <T>(
  mutationFn: (payload: T) => Promise<unknown>,
  id?: string,
) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: electionKeys.all });
      if (id) client.invalidateQueries({ queryKey: electionKeys.detail(id) });
    },
  });
};

export const useCreateElection = () =>
  useElectionMutation((payload: ElectionPayload) =>
    apiClient
      .post<ElectionResponse<Election>>(Api.elections, payload)
      .then((response) => response.data.data),
  );

export const useUpdateElection = (id: string) =>
  useElectionMutation(
    (payload: Partial<ElectionPayload>) =>
      apiClient
        .put<ElectionResponse<Election>>(
          electionPath(Api.election, id),
          payload,
        )
        .then((response) => response.data.data),
    id,
  );

export const useUpdateElectionDebateSchedule = (id: string) =>
  useElectionMutation(
    (payload: { debateAt: string | null }) =>
      apiClient
        .patch<ElectionResponse<Election>>(
          electionPath(Api.electionDebateSchedule, id),
          payload,
        )
        .then((response) => response.data.data),
    id,
  );

export const useUpdateElectionPublicDetails = (id: string) =>
  useElectionMutation(
    (payload: ElectionPublicDetailsPayload) =>
      apiClient
        .patch<ElectionResponse<Election>>(
          electionPath(Api.electionPublicDetails, id),
          payload,
        )
        .then((response) => response.data.data),
    id,
  );

export const useCreateCandidate = (id: string) =>
  useElectionMutation(
    (payload: CandidatePayload) =>
      apiClient
        .post<ElectionResponse<ElectionCandidate>>(
          electionPath(Api.electionCandidates, id),
          payload,
        )
        .then((response) => response.data.data),
    id,
  );

export const useUpdateCandidate = (electionId: string) =>
  useElectionMutation(
    ({ id, ...payload }: Partial<CandidatePayload> & { id: string }) =>
      apiClient
        .put<ElectionResponse<ElectionCandidate>>(
          path(Api.electionCandidate, "candidateId", id),
          payload,
        )
        .then((response) => response.data.data),
    electionId,
  );

export const useTransitionElection = (
  id: string,
  action: "open" | "close" | "publish",
) =>
  useElectionMutation(
    () =>
      apiClient
        .post<ElectionResponse<Election>>(
          electionPath(
            action === "open"
              ? Api.electionOpen
              : action === "close"
                ? Api.electionClose
                : Api.electionPublish,
            id,
          ),
          {},
        )
        .then((response) => response.data.data),
    id,
  );

export const useGetElectionTurnout = (id: string) =>
  useQuery({
    queryKey: electionKeys.turnout(id),
    queryFn: () =>
      apiClient
        .get<ElectionResponse<ElectionTurnout>>(
          electionPath(Api.electionTurnout, id),
        )
        .then((response) => response.data.data),
    enabled: !!id,
  });

export const useGetElectionTally = (id: string, enabled: boolean) =>
  useQuery({
    queryKey: electionKeys.tally(id),
    queryFn: () =>
      apiClient
        .get<ElectionResponse<ElectionTally>>(
          electionPath(Api.electionTally, id),
        )
        .then((response) => response.data.data),
    enabled: !!id && enabled,
  });
