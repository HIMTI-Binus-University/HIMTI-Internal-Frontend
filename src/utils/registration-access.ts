import type { UserMeResponse } from "@/types/auth";

type RegistrationAccessUser = Pick<
  UserMeResponse,
  "institutionType" | "outlookEmailVerified" | "registrationCompleted"
>;

export const needsRegistrationCompletion = (user: RegistrationAccessUser) =>
  !user.registrationCompleted ||
  (user.institutionType === "BINUS" && !user.outlookEmailVerified);
