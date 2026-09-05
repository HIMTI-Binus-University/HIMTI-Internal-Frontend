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
type DuplicateFormResponse =
  operations["duplicateEventRegistrationForm"]["responses"][201]["content"]["application/json"];
type FormActionResponse =
  | FormResponse
  | FormPreviewResponse
  | FormValidateResponse
  | PublishFormResponse
  | CloseFormResponse
  | DuplicateFormResponse;

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
};

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
      if (action === "close")
        return apiClient.post<CloseFormResponse>(url).then(({ data }) => data);
      return apiClient
        .post<DuplicateFormResponse>(url)
        .then(({ data }) => data);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: keys.form(eventId) }),
  });
};

type FormAction = "validate" | "preview" | "publish" | "close" | "duplicate";
