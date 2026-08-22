import type { AxiosError } from "axios";

type ReviewFailure = {
  code?: string;
  message?: string;
  msg?: string;
  details?: { currentStatus?: string };
};

export const registrationReviewConflict = (error: unknown) => {
  const response = (error as AxiosError<ReviewFailure>).response;
  if (response?.status !== 409) return undefined;
  if (response.data?.code === "REGISTRATION_REVISION_CONFLICT")
    return "revision";
  if (response.data?.code === "REGISTRATION_ACTION_UNAVAILABLE")
    return "lifecycle";
  return "unknown";
};

export const registrationReviewError = (error: unknown) => {
  const response = (error as AxiosError<ReviewFailure>).response;
  const conflict = registrationReviewConflict(error);
  if (conflict === "revision")
    return "This registration changed after you opened it. Loading latest details...";
  if (conflict === "lifecycle")
    return response?.data?.message ?? "This action is no longer available.";
  if (conflict === "unknown")
    return response?.data?.message ?? "The review action conflicts with the current registration state.";
  return (
    response?.data?.message ??
    response?.data?.msg ??
    "The review action could not be completed."
  );
};
