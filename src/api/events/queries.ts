import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/config/api-client";
import { Api } from "@/constants/api";
import type {
  ApiItemResponse,
  EventListItem,
  EventPayload,
  EventStatus,
  PaginatedResponse,
  Subevent,
  SubeventPayload,
  SubeventStatus,
} from "@/types/events";

const pathUrl = (template: string, id: string) =>
  template.replace(":id", encodeURIComponent(id));

export const eventKeys = {
  all: ["events"] as const,
  list: (search = "", status = "") =>
    ["events", "list", search, status] as const,
  subevents: (eventId: string) => ["events", eventId, "subevents"] as const,
  subevent: (id: string) => ["subevents", id] as const,
};

export const useGetEvents = (search = "", status?: EventStatus) =>
  useQuery({
    queryKey: eventKeys.list(search, status ?? ""),
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<EventListItem>>(Api.eventList, {
          params: { page: 1, limit: 100, search: search || undefined, status },
        })
        .then((response) => response.data),
    staleTime: 5 * 60 * 1000,
  });

export const useCreateEvent = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: EventPayload) =>
      apiClient
        .post<ApiItemResponse<EventListItem>>(Api.eventCreate, {
          ...payload,
          status: "DRAFT",
        })
        .then((response) => response.data.data),
    onSuccess: () => client.invalidateQueries({ queryKey: eventKeys.all }),
  });
};

export const useUpdateEvent = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: Partial<EventPayload> & { id: string; status?: EventStatus }) =>
      apiClient
        .patch<ApiItemResponse<EventListItem>>(
          pathUrl(Api.eventUpdate, id),
          payload,
        )
        .then((response) => response.data.data),
    onSuccess: () => client.invalidateQueries({ queryKey: eventKeys.all }),
  });
};

export const useGetSubevents = (eventId: string) =>
  useQuery({
    queryKey: eventKeys.subevents(eventId),
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<Subevent>>(Api.subeventList, {
          params: { eventId, page: 1, limit: 100, sort: "position:asc" },
        })
        .then((response) => response.data.data),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  });

export const useGetSubevent = (id: string) =>
  useQuery({
    queryKey: eventKeys.subevent(id),
    queryFn: () =>
      apiClient
        .get<ApiItemResponse<Subevent>>(pathUrl(Api.subeventDetail, id))
        .then((response) => response.data.data),
    enabled: !!id,
  });

const invalidateSubevents = (
  client: ReturnType<typeof useQueryClient>,
  eventId: string,
  id?: string,
) => {
  client.invalidateQueries({ queryKey: eventKeys.subevents(eventId) });
  client.invalidateQueries({ queryKey: eventKeys.all });
  if (id) client.invalidateQueries({ queryKey: eventKeys.subevent(id) });
};

export const useCreateSubevent = (eventId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubeventPayload) =>
      apiClient
        .post<ApiItemResponse<Subevent>>(Api.subeventCreate, payload)
        .then((response) => response.data.data),
    onSuccess: () => invalidateSubevents(client, eventId),
  });
};

export const useUpdateSubevent = (eventId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: Partial<SubeventPayload> & { id: string; status?: SubeventStatus }) =>
      apiClient
        .patch<ApiItemResponse<Subevent>>(
          pathUrl(Api.subeventUpdate, id),
          payload,
        )
        .then((response) => response.data.data),
    onSuccess: (subevent) => invalidateSubevents(client, eventId, subevent.id),
  });
};

export const useOrderSubevents = (eventId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (subEventIds: string[]) =>
      apiClient
        .put(pathUrl(Api.eventSubeventOrder, eventId), { subEventIds })
        .then((response) => response.data),
    onSuccess: () => invalidateSubevents(client, eventId),
  });
};
