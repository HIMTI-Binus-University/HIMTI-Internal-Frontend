import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { Api } from "@/constants/api";
import type { operations } from "@/generated/openapi";
import type {
  PackagePayload,
  PackageUpdatePayload,
  RegistrationFormPayload,
  RegistrationSettingsPayload,
} from "@/types/event-registration";

type SettingsResponse =
  operations["getEventRegistrationSettings"]["responses"][200]["content"]["application/json"];
type PackageListResponse =
  operations["listEventPackages"]["responses"][200]["content"]["application/json"];
type CreatePackageResponse =
  operations["createEventPackage"]["responses"][201]["content"]["application/json"];
type UpdatePackageResponse =
  operations["updateEventPackage"]["responses"][200]["content"]["application/json"];
type ActivatePackageResponse =
  operations["activateEventPackage"]["responses"][200]["content"]["application/json"];
type DeactivatePackageResponse =
  operations["deactivateEventPackage"]["responses"][200]["content"]["application/json"];
type FormResponse =
  operations["getEventRegistrationForm"]["responses"][200]["content"]["application/json"];
type FormPreviewResponse =
  operations["previewEventRegistrationForm"]["responses"][200]["content"]["application/json"];
type FormValidateResponse =
  operations["validateEventRegistrationForm"]["responses"][200]["content"]["application/json"];
type PublishFormResponse =
  operations["publishEventRegistrationForm"]["responses"][200]["content"]["application/json"];
type CloseFormResponse =
  operations["closeEventRegistrationForm"]["responses"][200]["content"]["application/json"];
type FormActionResponse =
  | FormResponse
  | FormPreviewResponse
  | FormValidateResponse
  | PublishFormResponse
  | CloseFormResponse;
export type InternalRegistrationListResponse =
  operations["listInternalEventRegistrations"]["responses"][200]["content"]["application/json"];
export type InternalRegistration =
  operations["getInternalEventRegistration"]["responses"][200]["content"]["application/json"]["data"];

const eventUrl = (template: string, eventId: string) =>
  template.replace(":id", encodeURIComponent(eventId));
const packageUrl = (template: string, eventId: string, packageId: string) =>
  eventUrl(template, eventId).replace(
    ":packageId",
    encodeURIComponent(packageId),
  );
const keys = {
  settings: (eventId: string) => ["events", eventId, "registration-settings"],
  packages: (eventId: string) => ["events", eventId, "packages"],
  form: (eventId: string) => ["events", eventId, "registration-form"],
  bundles: (eventId: string) => ["events", eventId, "registration-bundles"],
  registrations: (eventId: string) => ["events", eventId, "registrations"],
};

export const useInternalEventRegistrations = (
  eventId: string,
  filters: {
    page: number;
    status?: InternalRegistration["status"];
    kind?: InternalRegistration["kind"];
  },
) =>
  useQuery({
    queryKey: [...keys.registrations(eventId), filters],
    queryFn: () =>
      apiClient
        .get<InternalRegistrationListResponse>(
          `/api/internal/events/${encodeURIComponent(eventId)}/registrations`,
          { params: { ...filters, limit: 20 } },
        )
        .then(({ data }) => data),
    enabled: Boolean(eventId),
  });

export const useInternalEventRegistration = (
  eventId: string,
  registrationId: string,
) =>
  useQuery({
    queryKey: [...keys.registrations(eventId), registrationId],
    queryFn: () =>
      apiClient
        .get<
          operations["getInternalEventRegistration"]["responses"][200]["content"]["application/json"]
        >(
          `/api/internal/events/${encodeURIComponent(eventId)}/registrations/${encodeURIComponent(registrationId)}`,
        )
        .then(({ data }) => data.data),
    enabled: Boolean(eventId && registrationId),
  });

export const useInternalRegistrationPayment = (
  eventId: string,
  registrationId: string,
  enabled: boolean,
) =>
  useQuery({
    queryKey: ["event-registration-payment", eventId, registrationId],
    queryFn: () =>
      apiClient
        .get<
          operations["getInternalEventRegistrationPayment"]["responses"][200]["content"]["application/json"]
        >(
          `/api/internal/events/${encodeURIComponent(eventId)}/registrations/${encodeURIComponent(registrationId)}/payment`,
        )
        .then(({ data }) => data.data),
    enabled: enabled && Boolean(eventId && registrationId),
    refetchInterval: 10000,
  });

export const useEventBundles = (eventId: string, enabled = true) =>
  useQuery({
    queryKey: keys.bundles(eventId),
    queryFn: () =>
      apiClient
        .get(
          `/api/internal/events/${encodeURIComponent(eventId)}/registrations/bundles`,
        )
        .then(({ data }) => data.data as BundleOrder[]),
    enabled: Boolean(eventId) && enabled,
  });

export const useRemoveBundleMember = (eventId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      registrationId,
      userId,
      expectedRevision,
      reason,
    }: {
      registrationId: string;
      userId: string;
      expectedRevision: number;
      reason: string;
    }) =>
      apiClient.delete(
        `/api/internal/events/${encodeURIComponent(eventId)}/registrations/${encodeURIComponent(registrationId)}/members/${encodeURIComponent(userId)}`,
        { data: { expectedRevision, reason } },
      ),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: keys.bundles(eventId) }),
        client.invalidateQueries({ queryKey: keys.registrations(eventId) }),
      ]),
  });
};

export type BundleOrder = {
  id: string;
  orderNumber: string;
  status: string;
  revision: number;
  seatCount: number;
  totalMinor: string;
  currency: string;
  ticketPackage: { id: string; name: string };
  members: {
    id: string;
    userId: string;
    position: number;
    status: string;
    user: { name: string | null; email: string };
  }[];
};

export const useOutstandingAnswers = (eventId: string, page: number) =>
  useQuery({
    queryKey: ["events", eventId, "outstanding-answers", page],
    queryFn: () =>
      apiClient
        .get<
          operations["supplementalTracking"]["responses"][200]["content"]["application/json"]
        >(
          `/api/internal/events/${encodeURIComponent(eventId)}/registrations/outstanding-answers`,
          { params: { page, limit: 25 } },
        )
        .then(({ data }) => data.data),
  });

export const useRegistrationSettings = (eventId: string, enabled = true) =>
  useQuery({
    queryKey: keys.settings(eventId),
    queryFn: () =>
      apiClient
        .get<SettingsResponse>(eventUrl(Api.eventRegistrationSettings, eventId))
        .then((response) => response.data.data),
    enabled: !!eventId && enabled,
  });

export const useUpdateRegistrationSettings = (eventId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: RegistrationSettingsPayload) =>
      apiClient
        .put<
          operations["updateEventRegistrationSettings"]["responses"][200]["content"]["application/json"]
        >(eventUrl(Api.eventRegistrationSettings, eventId), body)
        .then(({ data }) => data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: keys.settings(eventId) }),
  });
};

export const useEventPackages = (eventId: string, enabled = true) =>
  useQuery({
    queryKey: keys.packages(eventId),
    queryFn: () =>
      apiClient
        .get<PackageListResponse>(eventUrl(Api.eventPackages, eventId))
        .then((response) => response.data.data),
    enabled: !!eventId && enabled,
  });

export const useSaveEventPackage = (eventId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: PackagePayload }) => {
      if (id) {
        const updateBody: PackageUpdatePayload = body;
        return apiClient
          .patch<UpdatePackageResponse>(
            packageUrl(Api.eventPackage, eventId, id),
            updateBody,
          )
          .then(({ data }) => data.data);
      }
      return apiClient
        .post<CreatePackageResponse>(eventUrl(Api.eventPackages, eventId), body)
        .then(({ data }) => data.data);
    },
    onSuccess: () =>
      client.invalidateQueries({ queryKey: keys.packages(eventId) }),
  });
};

export const useSetEventPackageActive = (eventId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => {
      const url = packageUrl(
        active ? Api.eventPackageActivate : Api.eventPackageDeactivate,
        eventId,
        id,
      );
      return active
        ? apiClient
            .post<ActivatePackageResponse>(url)
            .then(({ data }) => data.data)
        : apiClient
            .post<DeactivatePackageResponse>(url)
            .then(({ data }) => data.data);
    },
    onSuccess: () =>
      client.invalidateQueries({ queryKey: keys.packages(eventId) }),
  });
};

export const useRegistrationForm = (eventId: string, enabled = true) =>
  useQuery({
    queryKey: keys.form(eventId),
    queryFn: async () => {
      try {
        return await apiClient
          .get<FormResponse>(eventUrl(Api.eventRegistrationForm, eventId))
          .then((response) => response.data.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404)
          return null;
        throw error;
      }
    },
    enabled: !!eventId && enabled,
  });

export const useSaveRegistrationForm = (eventId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: RegistrationFormPayload) =>
      apiClient
        .put<
          operations["putEventRegistrationForm"]["responses"][200]["content"]["application/json"]
        >(eventUrl(Api.eventRegistrationForm, eventId), body)
        .then(({ data }) => data.data),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.form(eventId) }),
  });
};

export const useRegistrationFormAction = (eventId: string) => {
  const client = useQueryClient();
  return useMutation<FormActionResponse, Error, FormAction>({
    mutationFn: (action: FormAction) => {
      const url = eventUrl(Api.eventRegistrationFormAction, eventId).replace(
        ":action",
        action,
      );
      if (action === "validate")
        return apiClient
          .post<FormValidateResponse>(url)
          .then(({ data }) => data);
      if (action === "preview")
        return apiClient
          .post<FormPreviewResponse>(url)
          .then(({ data }) => data);
      if (action === "publish")
        return apiClient
          .post<PublishFormResponse>(url)
          .then(({ data }) => data);
      return apiClient.post<CloseFormResponse>(url).then(({ data }) => data);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: keys.form(eventId) }),
  });
};

type FormAction = "validate" | "preview" | "publish" | "close";
