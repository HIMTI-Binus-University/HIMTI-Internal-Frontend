import type {
  ApprovalMode,
  RegistrationMode,
  SubeventPayload,
  SubeventType,
  SubeventVisibility,
} from "@/types/events";
import { combineEventDateTime, normalizeOptionalEventUrl } from "../event-form";

export function buildSubeventCreatePayload(
  values: FormData,
  eventId: string,
): SubeventPayload {
  const name = String(values.get("name") ?? "").trim();
  if (!name) throw new Error("Subevent name is required.");
  const registrationMode = String(
    values.get("registrationMode") ?? "INTERNAL",
  ) as RegistrationMode;
  const destinationUrl = normalizeOptionalEventUrl(
    values.get("destinationUrl"),
    "destination",
  );
  if (registrationMode === "EXTERNAL" && !destinationUrl)
    throw new Error("External registration requires a destination URL.");

  const capacity = String(values.get("maxParticipants") ?? "").trim();
  const paid =
    registrationMode === "INTERNAL" && values.get("pricing") === "PAID";
  const priceText = String(values.get("individualPrice") ?? "").trim();
  if (paid && (!/^\d+$/.test(priceText) || Number(priceText) < 1))
    throw new Error("Enter an individual ticket price greater than 0.");
  return {
    eventId,
    name,
    publicDescription: String(values.get("publicDescription") ?? "").trim(),
    privateDescription: String(values.get("privateDescription") ?? "").trim(),
    date: combineEventDateTime(values.get("date"), values.get("time")),
    type: String(values.get("type")) as SubeventType,
    locationName: String(values.get("locationName") ?? "").trim(),
    locationUrl: normalizeOptionalEventUrl(
      values.get("locationUrl"),
      "location",
    ),
    posterUrl: normalizeOptionalEventUrl(values.get("posterUrl"), "poster"),
    destinationUrl: registrationMode === "EXTERNAL" ? destinationUrl : null,
    price: paid ? Number(priceText) : 0,
    paid,
    maxParticipants: capacity ? Number(capacity) : null,
    maxTicketsPerUser: 1,
    visibility: String(values.get("visibility")) as SubeventVisibility,
    registrationMode,
    approvalMode: String(
      values.get("approvalMode") ?? "AUTO_APPROVE",
    ) as ApprovalMode,
    isRegistrationOpen: false,
  };
}
