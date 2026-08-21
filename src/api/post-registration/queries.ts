import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/config/api-client";
import type { components, operations } from "@/generated/openapi";

export type PostRegistrationQueue =
  components["schemas"]["InternalPostRegistrationAssignmentListResponseV1"];
export type PostRegistrationAssignment =
  components["schemas"]["PostRegistrationAssignmentV1"];
export type PostRegistrationFilters = NonNullable<
  operations["listInternalPostRegistrationAssignmentsV1"]["parameters"]["query"]
>;
type TransitionPayload =
  operations["requestPostRegistrationCorrectionV1"]["requestBody"]["content"]["application/json"];

const root = "/api/v1/internal";
const assignmentPath = (id: string, action?: string) =>
  `${root}/post-registration-assignments/${encodeURIComponent(id)}${action ? `/${action}` : ""}`;

export const postRegistrationKeys = {
  all: ["internal-post-registration"] as const,
  list: (subEventId: string, filters: PostRegistrationFilters) =>
    [...postRegistrationKeys.all, "list", subEventId, filters] as const,
  detail: (assignmentId: string) =>
    [...postRegistrationKeys.all, "detail", assignmentId] as const,
};

export const usePostRegistrationAssignments = (
  subEventId: string,
  filters: PostRegistrationFilters,
) =>
  useQuery({
    queryKey: postRegistrationKeys.list(subEventId, filters),
    queryFn: () =>
      apiClient
        .get<PostRegistrationQueue>(
          `${root}/sub-events/${encodeURIComponent(subEventId)}/post-registration-assignments`,
          { params: filters },
        )
        .then((response) => response.data),
    enabled: Boolean(subEventId),
    placeholderData: (previous) => previous,
  });

export const usePostRegistrationAssignment = (assignmentId: string) =>
  useQuery({
    queryKey: postRegistrationKeys.detail(assignmentId),
    queryFn: () =>
      apiClient
        .get<components["schemas"]["PostRegistrationAssignmentResponseV1"]>(
          assignmentPath(assignmentId),
        )
        .then((response) => response.data.data),
    enabled: Boolean(assignmentId),
  });

const useTransition = (action: "request-correction" | "reopen") => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      assignmentId,
      ...payload
    }: TransitionPayload & { assignmentId: string }) =>
      apiClient
        .post<components["schemas"]["PostRegistrationAssignmentResponseV1"]>(
          assignmentPath(assignmentId, action),
          payload,
        )
        .then((response) => response.data.data),
    onSuccess: (assignment) => {
      client.setQueryData(
        postRegistrationKeys.detail(assignment.id),
        assignment,
      );
      client.invalidateQueries({ queryKey: postRegistrationKeys.all });
    },
  });
};

export const useRequestPostRegistrationCorrection = () =>
  useTransition("request-correction");
export const useReopenPostRegistrationAssignment = () =>
  useTransition("reopen");
