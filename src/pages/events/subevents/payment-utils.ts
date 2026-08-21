import type { AxiosError } from "axios";

import type { PaymentQueueFilters } from "@/api/event-payments/queries";

export const paymentApiError = (error: unknown) => {
  const response = (
    error as AxiosError<{ message?: string; msg?: string }> | null | undefined
  )?.response;
  if (response?.status === 409)
    return "This payment changed on the server. The latest detail has been reloaded; review it before trying again.";
  return (
    response?.data?.message ??
    response?.data?.msg ??
    (error instanceof Error ? error.message : undefined) ??
    "The payment operation failed."
  );
};

export const paymentStatuses = [
  "UNPAID",
  "PROOF_SUBMITTED",
  "VERIFIED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
] as const;
export const paymentSorts = [
  "submittedAt:asc",
  "submittedAt:desc",
  "createdAt:asc",
  "createdAt:desc",
  "expiresAt:asc",
  "expiresAt:desc",
] as const;

export const readPaymentFilters = (
  params: URLSearchParams,
): PaymentQueueFilters & { page: number; limit: number; sort: string } => {
  const page = Number(params.get("page"));
  const limit = Number(params.get("limit"));
  const status = params.get("status");
  const sort = params.get("sort");
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: [10, 20, 50, 100].includes(limit) ? limit : 20,
    search: params.get("search")?.trim() || undefined,
    status: paymentStatuses.includes(status as (typeof paymentStatuses)[number])
      ? (status as (typeof paymentStatuses)[number])
      : undefined,
    sort: paymentSorts.includes(sort as (typeof paymentSorts)[number])
      ? (sort as (typeof paymentSorts)[number])
      : "submittedAt:asc",
  };
};

export const majorIdrToMinor = (value: string) => {
  const normalized = value.replace(/[.\s]/g, "");
  if (!/^\d+$/.test(normalized))
    throw new Error("Amount must be a whole IDR value.");
  return BigInt(normalized).toString();
};

export const formatMinor = (amount: string, currency: string) => {
  if (currency === "IDR")
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(BigInt(amount));
  return `${currency} ${amount}`;
};
