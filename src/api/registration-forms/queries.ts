import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/config/api-client";
import type { components, operations } from "@/generated/openapi";

type Builder = components["schemas"]["RegistrationFormBuilderV1"];
type BuilderResponse =
  components["schemas"]["RegistrationFormBuilderV1Response"];
type BuilderListResponse =
  components["schemas"]["RegistrationFormBuilderV1ListResponse"];
type CreatePayload = components["schemas"]["CreateRegistrationFormV1"];
type ClonePayload = components["schemas"]["CloneRegistrationFormV1"];
type LifecyclePayload =
  components["schemas"]["RegistrationFormLifecycleRequestV1"];
export type RegistrationFormDraft =
  components["schemas"]["RegistrationFormDraftV1"];
export type RegistrationFormPreview =
  components["schemas"]["RegistrationFormPreviewV1"];
export type RegistrationFormValidation =
  components["schemas"]["RegistrationFormValidationResultV1"];

const root = "/api/v1/registration-form";
const formPath = (id: string, action?: string) =>
  `${root}/${encodeURIComponent(id)}${action ? `/${action}` : ""}`;

export const registrationFormKeys = {
  all: ["registration-forms-v1"] as const,
  lists: () => [...registrationFormKeys.all, "list"] as const,
  list: (subEventId: string) =>
    [...registrationFormKeys.lists(), subEventId] as const,
  details: () => [...registrationFormKeys.all, "detail"] as const,
  detail: (id: string) => [...registrationFormKeys.details(), id] as const,
};

export const useRegistrationForms = (subEventId: string) =>
  useQuery({
    queryKey: registrationFormKeys.list(subEventId),
    queryFn: () =>
      apiClient
        .get<BuilderListResponse>(root, { params: { subEventId } })
        .then((response) => response.data.data),
    enabled: Boolean(subEventId),
  });

export const useRegistrationForm = (id: string) =>
  useQuery({
    queryKey: registrationFormKeys.detail(id),
    queryFn: () =>
      apiClient
        .get<BuilderResponse>(formPath(id))
        .then((response) => response.data.data),
    enabled: Boolean(id) && id !== "new",
  });

const useBuilderMutation = <TVariables, TData = Builder>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  updateCache = true,
) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      if (!updateCache) return;
      const builder = data as Builder;
      if (builder?.id) {
        client.setQueryData(registrationFormKeys.detail(builder.id), builder);
        client.invalidateQueries({
          queryKey: registrationFormKeys.list(builder.subEventId),
        });
      }
    },
  });
};

export const useCreateRegistrationForm = (options?: {
  updateCache?: boolean;
}) =>
  useBuilderMutation(
    (payload: CreatePayload) =>
      apiClient
        .post<BuilderResponse>(root, payload)
        .then((response) => response.data.data),
    options?.updateCache ?? true,
  );

export const useSaveRegistrationFormDraft = () =>
  useBuilderMutation(
    ({ id, draft }: { id: string; draft: RegistrationFormDraft }) =>
      apiClient
        .put<BuilderResponse>(formPath(id, "draft"), draft)
        .then((response) => response.data.data),
  );

export const useCloneRegistrationForm = () =>
  useBuilderMutation(
    ({ id, payload }: { id: string; payload?: ClonePayload }) =>
      apiClient
        .post<BuilderResponse>(formPath(id, "clone"), payload ?? {})
        .then((response) => response.data.data),
  );

export const usePublishRegistrationForm = () =>
  useBuilderMutation(({ id, revision }: { id: string; revision: number }) =>
    apiClient
      .post<BuilderResponse>(formPath(id, "publish"), {
        revision,
      } satisfies LifecyclePayload)
      .then((response) => response.data.data),
  );

export const useCloseRegistrationForm = () =>
  useBuilderMutation(({ id, revision }: { id: string; revision: number }) =>
    apiClient
      .post<BuilderResponse>(formPath(id, "close"), {
        revision,
      } satisfies LifecyclePayload)
      .then((response) => response.data.data),
  );

export const useValidateRegistrationForm = () =>
  useMutation({
    mutationFn: ({ id, draft }: { id: string; draft: RegistrationFormDraft }) =>
      apiClient
        .post<
          operations["validateRegistrationFormV1"]["responses"][200]["content"]["application/json"]
        >(formPath(id, "validate"), draft)
        .then((response) => response.data.data),
  });

export const usePreviewRegistrationForm = () =>
  useMutation({
    mutationFn: ({ id, draft }: { id: string; draft: RegistrationFormDraft }) =>
      apiClient
        .post<
          operations["previewRegistrationFormV1"]["responses"][200]["content"]["application/json"]
        >(formPath(id, "preview"), draft)
        .then((response) => response.data.data),
  });
