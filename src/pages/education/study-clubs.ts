import type { operations } from "@/generated/openapi";
import { getSafeHttpUrl } from "@/utils/http-url";

export type StudyClubSession =
  operations["getStudyClub"]["responses"][200]["content"]["application/json"]["data"];
export type StudyClubPayload =
  operations["createStudyClub"]["requestBody"]["content"]["application/json"];

export function studyClubLinkError(value: string) {
  const link = value.trim();
  return !link ||
    (/^https?:\/\/[^/\s\\]/i.test(link) &&
      !/[\s\\]/.test(link) &&
      getSafeHttpUrl(link))
    ? ""
    : "Enter a complete link starting with http:// or https://.";
}

export function sessionStatus(session: StudyClubSession, now = Date.now()) {
  if (Date.parse(session.endsAt) <= now) return "Past";
  if (Date.parse(session.startsAt) <= now) return "Ongoing";
  return "Upcoming";
}

export const formatSessionDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));

export const formatSessionTime = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));

export const toWibInput = (value: string) =>
  new Date(Date.parse(value) + 7 * 60 * 60 * 1000).toISOString().slice(0, 16);
