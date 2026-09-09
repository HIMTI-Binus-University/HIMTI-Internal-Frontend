import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { Api } from "@/constants/api";
import type { operations } from "@/generated/openapi";
import type {
  DataResponse,
  CreateEventPayload,
  EventItem,
  EventPayload,
  Organizer,
  OrganizerRole,
} from "@/types/events";

const url = (template: string, id: string) =>
  template.replace(":id", encodeURIComponent(id));
const keys = {
  all: ["events"] as const,
  detail: (id: string) => ["events", id] as const,
};
type EventGroupOptionsResponse =
  operations["getEventGroupOptions"]["responses"][200]["content"]["application/json"];

export const useGetEvents = (search = "", status = "") =>
  useQuery({
    queryKey: [...keys.all, search, status],
    queryFn: () =>
      apiClient
        .get<DataResponse<EventItem[]>>(Api.events, {
          params: {
            page: 1,
            limit: 100,
            search: search || undefined,
            status: status || undefined,
          },
        })
        .then((r) => r.data.data),
  });
export const useGetEvent = (id: string) =>
  useQuery({
    queryKey: keys.detail(id),
    queryFn: () =>
      apiClient
        .get<DataResponse<EventItem>>(url(Api.event, id))
        .then((r) => r.data.data),
    enabled: !!id,
  });
export const useEventGroupOptions = () =>
  useQuery({
    queryKey: [...keys.all, "event-group-options"],
    queryFn: () =>
      apiClient
        .get<EventGroupOptionsResponse>(Api.eventGroupOptions)
        .then((r) => r.data.data),
  });
export const useCreateEvent = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateEventPayload) =>
      apiClient
        .post<DataResponse<EventItem>>(Api.events, body)
        .then((r) => r.data.data),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.all }),
  });
};
export const useUpdateEvent = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<EventPayload> & { id: string }) =>
      apiClient
        .patch<DataResponse<EventItem>>(url(Api.event, id), body)
        .then((r) => r.data.data),
    onSuccess: (event) => {
      client.invalidateQueries({ queryKey: keys.all });
      client.setQueryData(keys.detail(event.id), event);
    },
  });
};
export const useTransitionEvent = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: "publish" | "close" | "cancel";
    }) =>
      apiClient
        .post<DataResponse<EventItem>>(
          url(
            {
              publish: Api.eventPublish,
              close: Api.eventClose,
              cancel: Api.eventCancel,
            }[action],
            id,
          ),
        )
        .then((r) => r.data.data),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.all }),
  });
};
export const useEventOrganizers = (id: string) =>
  useQuery({
    queryKey: [...keys.detail(id), "organizers"],
    queryFn: () =>
      apiClient
        .get<DataResponse<Organizer[]>>(url(Api.eventOrganizers, id))
        .then((r) => r.data.data),
    enabled: !!id,
  });
export const useAddEventOrganizer = (id: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: { userId: string; role: OrganizerRole }) =>
      apiClient.post(url(Api.eventOrganizers, id), body),
    onSuccess: () =>
      client.invalidateQueries({
        queryKey: [...keys.detail(id), "organizers"],
      }),
  });
};
