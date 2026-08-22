import type { AxiosError } from "axios";

export const ticketStatus = (status: string) => {
  if (status === "ACTIVE") return "Ready to check in";
  if (status === "USED") return "Already checked in";
  if (status === "REVOKED") return "Cannot be used";
  return "Not available for check-in";
};

export const attendanceState = (record: {
  checkedOutAt: string | null;
  voidedAt?: string | null;
}) =>
  record.voidedAt
    ? "Check-in cancelled"
    : record.checkedOutAt
      ? "Checked out"
      : "Currently attending";

export const attendanceError = (error: unknown) => {
  const response = (error as AxiosError<{ message?: string; msg?: string }>).response;
  if (response?.status === 403) return "You do not have access to manage attendance for this event.";
  if (response?.status === 404) return "This ticket was not found for this subevent.";
  if (response?.status === 409)
    return response.data?.message === "Required participant information is incomplete"
      ? "Check-in is blocked because required participant information is incomplete."
      : "This ticket cannot be checked in, or the attendance record has just changed. Refresh and try again.";
  return response?.data?.message ?? response?.data?.msg ?? "Attendance could not be updated. Try again.";
};

export const normalizeCredential = (value: string) => value.trim();

export const eligibilityCopy = (eligibility: {
  eligible: boolean;
  reason: "TICKET_INELIGIBLE" | "REQUIRED_ATTENDEE_FORM_INCOMPLETE" | null;
}) => {
  if (eligibility.eligible) return "Ready to check in.";
  if (eligibility.reason === "REQUIRED_ATTENDEE_FORM_INCOMPLETE")
    return "Check-in is blocked until the participant completes the required information.";
  return "This ticket cannot be used for check-in.";
};

export const resultCopy = (result: {
  participant: { name: string };
  replay: boolean;
  state: "CHECKED_IN" | "CHECKED_OUT";
}) => {
  if (result.state === "CHECKED_OUT")
    return `${result.participant.name} was already checked in and has checked out. No duplicate was added.`;
  if (result.replay)
    return `${result.participant.name} was already checked in. No duplicate was added.`;
  return `${result.participant.name} is checked in.`;
};
