import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/config/api-client";
import type { components, operations } from "@/generated/openapi";

export type RegistrationQueue =
  components["schemas"]["InternalRegistrationQueueV1"];
export type RegistrationQueueItem = RegistrationQueue["data"][number];
export type RegistrationDetail =
  components["schemas"]["InternalRegistrationDetailV1"]["data"];
export type RegistrationCapacity =
  components["schemas"]["InternalRegistrationCapacityV1"]["data"];
export type RegistrationNeighbors =
  components["schemas"]["InternalRegistrationQueueNeighborsV1"]["data"];
export type RegistrationQueueFilters = NonNullable<
  operations["listInternalEventRegistrationsV1"]["parameters"]["query"]
>;
export type RegistrationStatus = NonNullable<
  RegistrationQueueFilters["status"]
>;
export type ResponseStatus = NonNullable<
  RegistrationQueueFilters["responseStatus"]
>;
export type PaymentStatus = NonNullable<
  RegistrationQueueFilters["paymentStatus"]
>;
export type RegistrationSort = NonNullable<RegistrationQueueFilters["sort"]>;
export type ReviewAction =
  "approve" | "reject" | "request-correction" | "admin-cancel";
export type BulkReviewAction = "approve" | "reject" | "cancel";

const internalRoot = "/api/internal";
const subEventPath = (subEventId: string, suffix: string) =>
  `${internalRoot}/sub-events/${encodeURIComponent(subEventId)}/registrations${suffix}`;
const registrationPath = (registrationId: string, action?: string) =>
  `${internalRoot}/event-registrations/${encodeURIComponent(registrationId)}${action ? `/${action}` : ""}`;

export const registrationQueueKeys = {
  all: ["internal-event-registrations"] as const,
  queue: (subEventId: string, filters: RegistrationQueueFilters) =>
    [...registrationQueueKeys.all, "queue", subEventId, filters] as const,
  capacity: (subEventId: string) =>
    [...registrationQueueKeys.all, "capacity", subEventId] as const,
  detail: (registrationId: string) =>
    [...registrationQueueKeys.all, "detail", registrationId] as const,
  neighbors: (
    subEventId: string,
    registrationId: string,
    filters: RegistrationQueueFilters,
  ) =>
    [
      ...registrationQueueKeys.all,
      "neighbors",
      subEventId,
      registrationId,
      filters,
    ] as const,
};

export const useRegistrationQueue = (
  subEventId: string,
  filters: RegistrationQueueFilters,
) =>
  useQuery({
    queryKey: registrationQueueKeys.queue(subEventId, filters),
    queryFn: () =>
      apiClient
        .get<RegistrationQueue>(subEventPath(subEventId, ""), {
          params: filters,
        })
        .then((response) => response.data),
    enabled: Boolean(subEventId),
    placeholderData: (previous) => previous,
  });

export const useRegistrationCapacity = (subEventId: string) =>
  useQuery({
    queryKey: registrationQueueKeys.capacity(subEventId),
    queryFn: () =>
      apiClient
        .get<components["schemas"]["InternalRegistrationCapacityV1"]>(
          subEventPath(subEventId, "/capacity"),
        )
        .then((response) => response.data.data),
    enabled: Boolean(subEventId),
  });

export const useRegistrationDetail = (registrationId: string) =>
  useQuery({
    queryKey: registrationQueueKeys.detail(registrationId),
    queryFn: () =>
      apiClient
        .get<components["schemas"]["InternalRegistrationDetailV1"]>(
          registrationPath(registrationId),
        )
        .then((response) => response.data.data),
    enabled: Boolean(registrationId),
  });

type NeighborFilters = Omit<RegistrationQueueFilters, "page" | "limit">;

export const useRegistrationNeighbors = (
  subEventId: string,
  registrationId: string,
  filters: NeighborFilters,
) =>
  useQuery({
    queryKey: registrationQueueKeys.neighbors(
      subEventId,
      registrationId,
      filters,
    ),
    queryFn: () =>
      apiClient
        .get<components["schemas"]["InternalRegistrationQueueNeighborsV1"]>(
          subEventPath(
            subEventId,
            `/${encodeURIComponent(registrationId)}/neighbors`,
          ),
          { params: filters },
        )
        .then((response) => response.data.data),
    enabled: Boolean(subEventId && registrationId),
  });

type ReviewPayload = {
  registrationId: string;
  revision: number;
  reason?: string;
};

const invalidateReview = (
  client: ReturnType<typeof useQueryClient>,
  registrationId?: string,
) => {
  client.invalidateQueries({ queryKey: registrationQueueKeys.all });
  if (registrationId)
    client.invalidateQueries({
      queryKey: registrationQueueKeys.detail(registrationId),
    });
};

export const useReviewRegistration = (action: ReviewAction) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ registrationId, revision, reason }: ReviewPayload) =>
      apiClient
        .post<components["schemas"]["InternalRegistrationReviewResultV1"]>(
          registrationPath(registrationId, action),
          reason ? { revision, reason } : { revision },
        )
        .then((response) => response.data.data),
    onSuccess: (_, variables) =>
      invalidateReview(client, variables.registrationId),
  });
};

export type BulkReviewItem = { registrationId: string; revision: number };

export const useBulkReviewRegistrations = (
  subEventId: string,
  action: BulkReviewAction,
) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      items,
      reason,
    }: {
      items: BulkReviewItem[];
      reason?: string;
    }) => {
      if (!items.length || items.length > 50)
        throw new Error("Select between 1 and 50 registrations.");
      return apiClient
        .post<components["schemas"]["InternalRegistrationBulkReviewResultV1"]>(
          subEventPath(subEventId, `/bulk-${action}`),
          reason ? { items, reason } : { items },
        )
        .then((response) => response.data.data);
    },
    onSuccess: () => invalidateReview(client),
  });
};
