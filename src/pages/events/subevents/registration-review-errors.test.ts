import { describe, expect, it } from "vitest";

import { registrationReviewError } from "./registration-review-errors";

describe("registration review errors", () => {
  it("turns revision conflicts into an actionable stale-data message", () => {
    expect(
      registrationReviewError({ response: { status: 409, data: {} } }),
    ).toMatch(/changed after you opened it/i);
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
