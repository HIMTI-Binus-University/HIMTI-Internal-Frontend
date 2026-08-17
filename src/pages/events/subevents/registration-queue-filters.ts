import type {
  RegistrationQueueFilters,
  RegistrationSort,
  RegistrationStatus,
  ResponseStatus,
} from "@/api/event-registrations/queries";

export const registrationStatuses: RegistrationStatus[] = [
  "DRAFT",
  "AWAITING_MEMBERS",
  "HOLDING",
  "SUBMITTED",
  "PENDING_PAYMENT",
  "PAYMENT_REVIEW",
  "PENDING_APPROVAL",
  "APPROVED",
  "NEEDS_CORRECTION",
  "WAITLISTED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
];

export const responseStatuses: ResponseStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "LOCKED",
  "NEEDS_CORRECTION",
  "SUPERSEDED",
];

export const registrationSorts: { value: RegistrationSort; label: string }[] = [
  { value: "submittedAt:desc", label: "Submitted: newest" },
  { value: "submittedAt:asc", label: "Submitted: oldest" },
  { value: "createdAt:desc", label: "Created: newest" },
  { value: "createdAt:asc", label: "Created: oldest" },
];

export const readQueueFilters = (
  params: URLSearchParams,
): Required<Pick<RegistrationQueueFilters, "page" | "limit" | "sort">> &
  Omit<RegistrationQueueFilters, "page" | "limit" | "sort"> => {
  const page = Number(params.get("page"));
  const limit = Number(params.get("limit"));
  const status = params.get("status") as RegistrationStatus | null;
  const responseStatus = params.get("responseStatus") as ResponseStatus | null;
  const sort = params.get("sort") as RegistrationSort | null;
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: [10, 25, 50].includes(limit) ? limit : 25,
    search: params.get("search")?.trim() || undefined,
    status:
      status && registrationStatuses.includes(status) ? status : undefined,
    responseStatus:
      responseStatus && responseStatuses.includes(responseStatus)
        ? responseStatus
        : undefined,
    paymentStatus:
      params.get("paymentStatus") === "NOT_REQUIRED"
        ? "NOT_REQUIRED"
        : undefined,
    sort: registrationSorts.some((item) => item.value === sort)
      ? (sort as RegistrationSort)
      : "submittedAt:desc",
  };
};
