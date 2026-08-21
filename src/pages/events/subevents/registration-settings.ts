import type { ApprovalMode, RegistrationMode, Subevent } from "@/types/events";

export type RegistrationSettingsPayload = {
  status: Subevent["status"];
  registrationMode: RegistrationMode;
  approvalMode: ApprovalMode;
  isRegistrationOpen: boolean;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  cancellationClosesAt: string | null;
  maxParticipants: number | null;
  destinationUrl: string | null;
};

const optionalDate = (value: FormDataEntryValue | null) => {
  const text = String(value ?? "").trim();
  return text ? new Date(text).toISOString() : null;
};

export function registrationSettingsPayload(
  values: FormData,
  currentStatus: Subevent["status"],
): RegistrationSettingsPayload {
  const status = String(
    values.get("status") ?? currentStatus,
  ) as Subevent["status"];
  if (currentStatus === "CANCELLED" && status !== "CANCELLED")
    throw new Error("A cancelled subevent cannot be reopened.");
  const registrationMode = String(
    values.get("registrationMode"),
  ) as RegistrationMode;
  const isRegistrationOpen = values.get("isRegistrationOpen") === "on";
  if (isRegistrationOpen && status !== "OPEN")
    throw new Error(
      "Set the subevent status to OPEN before opening registration.",
    );
  const destination = String(values.get("destinationUrl") ?? "").trim();
  if (registrationMode === "EXTERNAL") {
    let url: URL;
    try {
      url = new URL(destination);
    } catch {
      throw new Error(
        "External registration requires a valid HTTP(S) destination URL.",
      );
    }
    if (!["http:", "https:"].includes(url.protocol))
      throw new Error(
        "External registration requires a valid HTTP(S) destination URL.",
      );
  }
  const capacity = String(values.get("maxParticipants") ?? "").trim();
  return {
    status,
    registrationMode,
    approvalMode: String(values.get("approvalMode")) as ApprovalMode,
    isRegistrationOpen: registrationMode === "INTERNAL" && isRegistrationOpen,
    registrationOpensAt: optionalDate(values.get("registrationOpensAt")),
    registrationClosesAt: optionalDate(values.get("registrationClosesAt")),
    cancellationClosesAt: optionalDate(values.get("cancellationClosesAt")),
    maxParticipants: capacity ? Number(capacity) : null,
    destinationUrl: registrationMode === "EXTERNAL" ? destination : null,
  };
}

export const localDateTime = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const part = (number: number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}T${part(date.getHours())}:${part(date.getMinutes())}`;
};
