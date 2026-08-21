import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/config/api-client";
import type { operations } from "@/generated/openapi";

type ListResponse =
  operations["listEventPackagesV1"]["responses"][200]["content"]["application/json"];
type CreateBody =
  operations["createEventPackageV1"]["requestBody"]["content"]["application/json"];
type UpdateBody =
  operations["updateEventPackageV1"]["requestBody"]["content"]["application/json"];

export type EventPackage = ListResponse["data"][number];
export type CreateEventPackagePayload = CreateBody;
export type UpdateEventPackagePayload = UpdateBody;

const root = "/api/v1/internal";
const listPath = (subEventId: string) =>
  `${root}/sub-events/${encodeURIComponent(subEventId)}/packages`;
const detailPath = (packageId: string) =>
  `${root}/event-packages/${encodeURIComponent(packageId)}`;

export const eventPackageKeys = {
  all: ["internal-event-packages"] as const,
  list: (subEventId: string) =>
    [...eventPackageKeys.all, "list", subEventId] as const,
};

export const useEventPackages = (subEventId: string) =>
  useQuery({
    queryKey: eventPackageKeys.list(subEventId),
    queryFn: () =>
      apiClient
        .get<ListResponse>(listPath(subEventId))
        .then((response) => response.data.data),
    enabled: Boolean(subEventId),
  });

export const useCreateEventPackage = (subEventId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEventPackagePayload) =>
      apiClient.post(listPath(subEventId), payload),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: eventPackageKeys.list(subEventId) }),
  });
};

export const useUpdateEventPackage = (subEventId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      packageId,
      payload,
    }: {
      packageId: string;
      payload: UpdateEventPackagePayload;
    }) => apiClient.put(detailPath(packageId), payload),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: eventPackageKeys.list(subEventId) }),
  });
};
