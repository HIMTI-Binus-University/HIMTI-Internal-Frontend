import { describe, expect, it } from "vitest";

import { registrationReviewError } from "./registration-review-errors";

describe("registration review errors", () => {
  it("turns revision conflicts into an actionable stale-data message", () => {
    expect(
      registrationReviewError({
        response: {
          status: 409,
          data: { code: "REGISTRATION_REVISION_CONFLICT" },
        },
      }),
    ).toMatch(/changed after you opened it/i);
  });

  it("does not mislabel a lifecycle conflict as a concurrent update", () => {
    expect(
      registrationReviewError({
        response: {
          status: 409,
          data: {
            code: "REGISTRATION_ACTION_UNAVAILABLE",
            message: "Request correction is unavailable for SUBMITTED.",
          },
        },
      }),
    ).toBe("Request correction is unavailable for SUBMITTED.");
  });

  it("preserves a backend validation reason", () => {
    expect(
      registrationReviewError({
        response: {
          status: 400,
          data: { message: "A reason is required for this transition." },
        },
      }),
    ).toBe("A reason is required for this transition.");
  });
});
