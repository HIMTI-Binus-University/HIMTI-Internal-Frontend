import type { PostRegistrationFilters } from "@/api/post-registration/queries";

export const completionOptions = [
  "NOT_STARTED",
  "DRAFT",
  "LOCKED",
  "NEEDS_CORRECTION",
] as const;

const positiveInteger = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const optionalBoolean = (value: string | null) =>
  value === "true" ? true : value === "false" ? false : undefined;

export const readPostRegistrationFilters = (
  params: URLSearchParams,
): PostRegistrationFilters => {
  const status = params.get("completion");
  return {
    page: positiveInteger(params.get("page"), 1),
    limit: Math.min(100, positiveInteger(params.get("limit"), 20)),
    ...(params.get("search")?.trim()
      ? { search: params.get("search")!.trim() }
      : {}),
    ...(completionOptions.includes(status as (typeof completionOptions)[number])
      ? { status: status as PostRegistrationFilters["status"] }
      : {}),
    ...(optionalBoolean(params.get("required")) !== undefined
      ? { required: optionalBoolean(params.get("required")) }
      : {}),
    ...(optionalBoolean(params.get("blocked")) !== undefined
      ? { blocksCheckIn: optionalBoolean(params.get("blocked")) }
      : {}),
  };
};

export const validateTransitionReason = (reason: string, deadline: string) => {
  if (reason.trim().length < 3)
    return "Give a reason of at least 3 characters.";
  if (!deadline) return "Choose a deadline.";
  if (new Date(deadline).getTime() <= Date.now())
    return "Deadline must be in the future.";
  return "";
};
