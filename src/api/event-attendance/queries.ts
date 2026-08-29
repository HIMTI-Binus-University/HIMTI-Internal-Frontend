import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/config/api-client";
import type { operations } from "@/generated/openapi";

type Success<Operation extends keyof operations> =
  operations[Operation]["responses"] extends {
    200: { content: { "application/json": infer Response } };
  }
    ? Response
    : never;

export type AttendanceResponse = Success<"listEventAttendanceV1">;
export type AttendanceRecord = AttendanceResponse["data"][number];
export type TicketSearchResponse = Success<"searchEventTicketsV1">;
export type TicketSearchResult = TicketSearchResponse["data"][number];
export type ResolveResult = Success<"resolveEventTicketV1">["data"];
export type CheckInResult = Success<"checkInEventTicketCredentialV1">["data"];
type AttendanceQuery = NonNullable<
  operations["listEventAttendanceV1"]["parameters"]["query"]
>;
type ResolvePayload =
  operations["resolveEventTicketV1"]["requestBody"]["content"]["application/json"];
type CredentialCheckInPayload =
  operations["checkInEventTicketCredentialV1"]["requestBody"]["content"]["application/json"];
type ManualCheckInPayload =
  operations["checkInEventTicketManuallyV1"]["requestBody"]["content"]["application/json"];
type CorrectionPayload =
  operations["checkoutEventAttendanceV1"]["requestBody"]["content"]["application/json"];

const root = (subeventId: string) =>
  `/api/internal/sub-events/${encodeURIComponent(subeventId)}`;

export const attendanceKeys = {
  all: ["internal-event-attendance"] as const,
  subevent: (subeventId: string) =>
    [...attendanceKeys.all, subeventId] as const,
  list: (subeventId: string, query: AttendanceQuery) =>
    [...attendanceKeys.subevent(subeventId), "list", query] as const,
  search: (subeventId: string, search: string) =>
    [...attendanceKeys.subevent(subeventId), "tickets", search] as const,
};

export const useAttendance = (
  subeventId: string,
  page: number,
  search: string,
) => {
  const query: AttendanceQuery = {
    page,
    limit: 25,
    ...(search ? { search } : {}),
  };
  return useQuery({
    queryKey: attendanceKeys.list(subeventId, query),
    queryFn: () =>
      apiClient
        .get<AttendanceResponse>(`${root(subeventId)}/attendance`, {
          params: query,
        })
        .then((response) => response.data),
    enabled: Boolean(subeventId),
    placeholderData: (previous) => previous,
  });
};

export const useTicketSearch = (subeventId: string, search: string) =>
  useQuery({
    queryKey: attendanceKeys.search(subeventId, search),
    queryFn: () =>
      apiClient
        .get<TicketSearchResponse>(`${root(subeventId)}/tickets/search`, {
          params: { search, page: 1, limit: 20 },
        })
        .then((response) => response.data),
    enabled: Boolean(subeventId) && search.trim().length >= 2,
  });

export const useResolveTicket = (subeventId: string) =>
  useMutation({
    mutationFn: (credential: string) => {
      const payload: ResolvePayload = { credential };
      return apiClient
        .post<Success<"resolveEventTicketV1">>(
          `${root(subeventId)}/tickets/resolve`,
          payload,
        )
        .then((response) => response.data.data);
    },
  });

export const useCheckInTicket = (subeventId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (credential: string) => {
      const payload: CredentialCheckInPayload = { credential };
      return apiClient
        .post<Success<"checkInEventTicketCredentialV1">>(
          `${root(subeventId)}/tickets/check-in`,
          payload,
        )
        .then((response) => response.data.data);
    },
    onSuccess: () =>
      client.invalidateQueries({
        queryKey: attendanceKeys.subevent(subeventId),
      }),
  });
};

export const useManualCheckIn = (subeventId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) => {
      const payload: ManualCheckInPayload = { ticketId };
      return apiClient
        .post<Success<"checkInEventTicketManuallyV1">>(
          `${root(subeventId)}/tickets/manual-check-in`,
          payload,
        )
        .then((response) => response.data.data);
    },
    onSuccess: () =>
      client.invalidateQueries({
        queryKey: attendanceKeys.subevent(subeventId),
      }),
  });
};

export const useCorrectAttendance = (subeventId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      attendanceId,
      action,
      revision,
      reason,
    }: {
      attendanceId: string;
      action: "checkout" | "void";
      revision: number;
      reason: string;
    }) => {
      const payload: CorrectionPayload = { revision, reason };
      return apiClient.post(
        `${root(subeventId)}/attendance/${encodeURIComponent(attendanceId)}/${action}`,
        payload,
      );
    },
    onSuccess: () =>
      client.invalidateQueries({
        queryKey: attendanceKeys.subevent(subeventId),
      }),
  });
};
