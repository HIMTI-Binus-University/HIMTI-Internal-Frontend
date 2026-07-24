import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/config/api-client";
import { Api } from "@/constants/api";
import type {
  ApiDataResponse,
  Period,
  Resource,
  ResourcePayload,
} from "@/types/batches";
import { pathUrl } from "./url";

const periodKey = ["membership-periods"] as const;
const resourceKey = (periodId: string) => ["membership-resources", periodId] as const;

export const useGetPeriods = () =>
  useQuery({
    queryKey: periodKey,
    queryFn: () =>
      apiClient
        .get<ApiDataResponse<Period[]>>(Api.membershipPeriods)
        .then((response) => response.data.data),
  });

export const useCreatePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Pick<Period, "id" | "label">) =>
      apiClient
        .post<ApiDataResponse<Omit<Period, "_count">>>(Api.membershipPeriods, payload)
        .then((response) => response.data),
    onSuccess: ({ data }) => {
      queryClient.setQueryData<Period[]>(periodKey, (periods) => {
        if (!periods) return periods;
        const createdPeriod: Period = {
          ...data,
          _count: { memberships: 0, resources: 0 },
        };
        return [createdPeriod, ...periods.filter((period) => period.id !== data.id)];
      });
      queryClient.invalidateQueries({ queryKey: periodKey });
    },
  });
};

export const useUpdatePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, label }: Pick<Period, "id" | "label">) =>
      apiClient
        .patch(pathUrl(Api.membershipPeriod, id), { label })
        .then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: periodKey }),
  });
};

export const useDeletePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(pathUrl(Api.membershipPeriod, id)).then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: periodKey }),
  });
};

export const useActivatePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient
        .post(pathUrl(Api.membershipPeriodActivate, id))
        .then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: periodKey }),
  });
};

export const useSetReregistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, open }: { id: string; open: boolean }) =>
      apiClient
        .patch(pathUrl(Api.membershipPeriodReregistration, id), { open })
        .then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: periodKey }),
  });
};

export const useGetResources = (periodId: string) =>
  useQuery({
    queryKey: resourceKey(periodId),
    queryFn: () =>
      apiClient
        .get<ApiDataResponse<Resource[]>>(
          pathUrl(Api.membershipPeriodResources, periodId),
        )
        .then((response) => response.data.data),
    enabled: !!periodId,
  });

export const useCreateResource = (periodId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ResourcePayload) =>
      apiClient
        .post(pathUrl(Api.membershipPeriodResources, periodId), payload)
        .then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKey(periodId) });
      queryClient.invalidateQueries({ queryKey: periodKey });
    },
  });
};

export const useUpdateResource = (periodId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<ResourcePayload> & { id: string }) =>
      apiClient
        .patch(pathUrl(Api.membershipResource, id), payload)
        .then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: resourceKey(periodId) }),
  });
};

export const useDeleteResource = (periodId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(pathUrl(Api.membershipResource, id)).then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKey(periodId) });
      queryClient.invalidateQueries({ queryKey: periodKey });
    },
  });
};

export const useOrderResources = (periodId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resourceIds: string[]) =>
      apiClient
        .put(pathUrl(Api.membershipResourceOrder, periodId), { resourceIds })
        .then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: resourceKey(periodId) }),
  });
};
