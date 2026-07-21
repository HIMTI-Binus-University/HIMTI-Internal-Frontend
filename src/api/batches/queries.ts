import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/config/api-client";
import { Api } from "@/constants/api";
import type {
  ApiDataResponse,
  Period,
  Resource,
  ResourcePayload,
} from "@/types/batches";

const periodKey = ["membership-periods"] as const;
const resourceKey = (periodId: string) => ["membership-resources", periodId] as const;

const periodUrl = (template: string, id: string) => template.replace(":id", id);

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
      apiClient.post(Api.membershipPeriods, payload).then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: periodKey }),
  });
};

export const useUpdatePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, label }: Pick<Period, "id" | "label">) =>
      apiClient
        .patch(periodUrl(Api.membershipPeriod, id), { label })
        .then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: periodKey }),
  });
};

export const useDeletePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(periodUrl(Api.membershipPeriod, id)).then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: periodKey }),
  });
};

export const useActivatePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient
        .post(periodUrl(Api.membershipPeriodActivate, id))
        .then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: periodKey }),
  });
};

export const useSetReregistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, open }: { id: string; open: boolean }) =>
      apiClient
        .patch(periodUrl(Api.membershipPeriodReregistration, id), { open })
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
          periodUrl(Api.membershipPeriodResources, periodId),
        )
        .then((response) => response.data.data),
    enabled: !!periodId,
  });

export const useCreateResource = (periodId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ResourcePayload) =>
      apiClient
        .post(periodUrl(Api.membershipPeriodResources, periodId), payload)
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
        .patch(periodUrl(Api.membershipResource, id), payload)
        .then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: resourceKey(periodId) }),
  });
};

export const useDeleteResource = (periodId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(periodUrl(Api.membershipResource, id)).then((response) => response.data),
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
        .put(periodUrl(Api.membershipResourceOrder, periodId), { resourceIds })
        .then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: resourceKey(periodId) }),
  });
};
