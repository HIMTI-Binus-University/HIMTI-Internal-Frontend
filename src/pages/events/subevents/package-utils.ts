import type {
  CreateEventPackagePayload,
  EventPackage,
} from "@/api/event-packages/queries";

export const packagePayload = (values: FormData): CreateEventPackagePayload => {
  const start = String(values.get("salesStartAt") ?? "").trim();
  const end = String(values.get("salesEndAt") ?? "").trim();
  if (start && end && new Date(start).getTime() >= new Date(end).getTime())
    throw new Error("Sales end must be after sales start.");
  const seatCount = Number(values.get("seatCount"));
  if (!Number.isInteger(seatCount) || seatCount < 1)
    throw new Error("Seat count must be a positive whole number.");
  const priceMinor = String(values.get("wholeOrderTotalIdr") ?? "").trim();
  if (!/^\d+$/.test(priceMinor))
    throw new Error("Whole-order total must contain whole IDR digits only.");
  return {
    code: String(values.get("code") ?? "").trim().toUpperCase(),
    currency: "IDR",
    description: String(values.get("description") ?? "").trim() || null,
    name: String(values.get("name") ?? "").trim(),
    priceMinor,
    salesStartAt: start ? new Date(start).toISOString() : null,
    salesEndAt: end ? new Date(end).toISOString() : null,
    seatCount,
    status: String(values.get("status") ?? "DRAFT") as EventPackage["status"],
  };
};

export const packageOptionLabel = (item: EventPackage) =>
  `${item.name} (${item.code})${item.status === "ACTIVE" ? "" : ` - ${item.status.toLowerCase()}`}`;
