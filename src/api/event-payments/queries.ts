import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/config/api-client";
import type { components, operations } from "@/generated/openapi";

export type PaymentSettings = components["schemas"]["EventPaymentSettingsV1"];
export type PaymentSettingsPayload =
  operations["updateSubEventPaymentSettingsV1"]["requestBody"]["content"]["application/json"];
export type PaymentQueueFilters = NonNullable<
  operations["listSubEventPaymentsV1"]["parameters"]["query"]
>;
export type PaymentQueueRow =
  components["schemas"]["InternalEventPaymentQueueRowV1"];
export type PaymentDetail =
  components["schemas"]["InternalEventPaymentDetailV1"];

type PaymentQueueResponse =
  operations["listSubEventPaymentsV1"]["responses"][200]["content"]["application/json"];
type SettingsResponse =
  operations["getSubEventPaymentSettingsV1"]["responses"][200]["content"]["application/json"];
type DetailResponse =
  operations["getInternalEventPaymentDetailV1"]["responses"][200]["content"]["application/json"];

const subEventRoot = (subEventId: string) =>
  `/api/internal/sub-events/${encodeURIComponent(subEventId)}`;
const paymentRoot = (paymentId: string) =>
  `/api/internal/event-payments/${encodeURIComponent(paymentId)}`;

export const paymentKeys = {
  all: ["internal-event-payments"] as const,
  settings: (subEventId: string) =>
    [...paymentKeys.all, "settings", subEventId] as const,
  queue: (subEventId: string, filters: PaymentQueueFilters) =>
    [...paymentKeys.all, "queue", subEventId, filters] as const,
  detail: (paymentId: string) =>
    [...paymentKeys.all, "detail", paymentId] as const,
};

export const usePaymentSettings = (subEventId: string) =>
  useQuery({
    queryKey: paymentKeys.settings(subEventId),
    queryFn: () =>
      apiClient
        .get<SettingsResponse>(`${subEventRoot(subEventId)}/payment-settings`)
        .then((response) => response.data.data),
    enabled: Boolean(subEventId),
  });

export const useUpdatePaymentSettings = (subEventId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentSettingsPayload) =>
      apiClient
        .put<SettingsResponse>(
          `${subEventRoot(subEventId)}/payment-settings`,
          payload,
        )
        .then((response) => response.data.data),
    onSuccess: (settings) => {
      client.setQueryData(paymentKeys.settings(subEventId), settings);
      client.invalidateQueries({ queryKey: paymentKeys.all });
    },
  });
};

export const usePaymentQueue = (
  subEventId: string,
  filters: PaymentQueueFilters,
) =>
  useQuery({
    queryKey: paymentKeys.queue(subEventId, filters),
    queryFn: () =>
      apiClient
        .get<PaymentQueueResponse>(`${subEventRoot(subEventId)}/payments`, {
          params: filters,
        })
        .then((response) => response.data),
    enabled: Boolean(subEventId),
    placeholderData: (previous) => previous,
  });

export const usePaymentDetail = (paymentId: string) =>
  useQuery({
    queryKey: paymentKeys.detail(paymentId),
    queryFn: () =>
      apiClient
        .get<DetailResponse>(paymentRoot(paymentId))
        .then((response) => response.data.data),
    enabled: Boolean(paymentId),
  });

export const useReviewPayment = (action: "verify" | "reject") => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      paymentId,
      revision,
      reason,
    }: {
      paymentId: string;
      revision: number;
      reason?: string;
    }) =>
      apiClient
        .post(`${paymentRoot(paymentId)}/${action}`, {
          revision,
          ...(reason ? { reason } : {}),
        })
        .then((response) => response.data.data),
    onSuccess: (_, variables) => {
      client.invalidateQueries({ queryKey: paymentKeys.all });
      client.invalidateQueries({
        queryKey: paymentKeys.detail(variables.paymentId),
      });
    },
  });
};

export const getPaymentProofBlob = (contentPath: string) =>
  apiClient
    .get<Blob>(contentPath, { responseType: "blob" })
    .then((response) => response.data);
