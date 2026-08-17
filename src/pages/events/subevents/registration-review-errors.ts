import type { AxiosError } from "axios";

export const registrationReviewError = (error: unknown) => {
  const response = (error as AxiosError<{ message?: string; msg?: string }>)
    .response;
  if (response?.status === 409)
    return "This registration changed after you opened it. The latest revision has been loaded; review it before trying again.";
  return (
    response?.data?.message ??
    response?.data?.msg ??
    "The review action could not be completed."
  );
};
