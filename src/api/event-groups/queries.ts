import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { Api } from "@/constants/api";
import type {
  DataResponse,
  EventGroup,
  EventGroupPayload,
  Organizer,
  OrganizerRole,
} from "@/types/events";

const url = (template: string, id: string) =>
  template.replace(":id", encodeURIComponent(id));
const keys = {
  all: ["event-groups"] as const,
  detail: (id: string) => ["event-groups", id] as const,
};
export const useEventGroups = (search = "", enabled = true) =>
  useQuery({
    queryKey: [...keys.all, search],
    queryFn: () =>
      apiClient
        .get<DataResponse<EventGroup[]>>(Api.eventGroups, {
          params: { page: 1, limit: 100, search: search || undefined },
        })
        .then((r) => r.data.data),
    enabled,
  });
export const useEventGroup = (id: string) =>
  useQuery({
    queryKey: keys.detail(id),
    queryFn: () =>
      apiClient
        .get<DataResponse<EventGroup>>(url(Api.eventGroup, id))
        .then((r) => r.data.data),
    enabled: !!id,
  });
export const useCreateEventGroup = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: EventGroupPayload) =>
      apiClient
        .post<DataResponse<EventGroup>>(Api.eventGroups, body)
        .then((r) => r.data.data),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.all }),
  });
};
export const useUpdateEventGroup = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: Partial<EventGroupPayload> & { id: string }) =>
      apiClient
        .patch<DataResponse<EventGroup>>(url(Api.eventGroup, id), body)
        .then((r) => r.data.data),
    onSuccess: (group) => {
      client.invalidateQueries({ queryKey: keys.all });
      client.setQueryData(keys.detail(group.id), group);
    },
  });
};
export const useTransitionEventGroup = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: "publish" | "archive";
    }) =>
      apiClient
        .post<DataResponse<EventGroup>>(
          url(
            action === "publish"
              ? Api.eventGroupPublish
              : Api.eventGroupArchive,
            id,
          ),
        )
        .then((r) => r.data.data),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.all }),
  });
};
export const useEventGroupOrganizers = (id: string) =>
  useQuery({
    queryKey: [...keys.detail(id), "organizers"],
    queryFn: () =>
      apiClient
        .get<DataResponse<Organizer[]>>(url(Api.eventGroupOrganizers, id))
        .then((r) => r.data.data),
    enabled: !!id,
  });
export const useAddEventGroupOrganizer = (id: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: { userId: string; role: OrganizerRole }) =>
      apiClient.post(url(Api.eventGroupOrganizers, id), body),
    onSuccess: () =>
      client.invalidateQueries({
        queryKey: [...keys.detail(id), "organizers"],
      }),
  });
};
