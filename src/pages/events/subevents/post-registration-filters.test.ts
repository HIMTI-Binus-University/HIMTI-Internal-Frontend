import { describe, expect, it, vi } from "vitest";

import {
  readPostRegistrationFilters,
  validateTransitionReason,
} from "./post-registration-filters";

describe("post-registration operations helpers", () => {
  it("parses supported URL filters and ignores invalid values", () => {
    expect(
      readPostRegistrationFilters(
        new URLSearchParams(
          "page=2&limit=500&search=%20Ada%20&completion=LOCKED&required=true&blocked=false",
        ),
      ),
    ).toEqual({
      page: 2,
      limit: 100,
      search: "Ada",
      status: "LOCKED",
      required: true,
      blocksCheckIn: false,
    });
    expect(
      readPostRegistrationFilters(
        new URLSearchParams("page=nope&completion=UNKNOWN&required=maybe"),
      ),
    ).toEqual({ page: 1, limit: 20 });
  });

  it("requires practical audited transition reasons and future deadlines", () => {
    vi.setSystemTime(new Date("2026-08-21T10:00:00.000Z"));
    expect(validateTransitionReason("", "2026-08-22T10:00")).toMatch(/reason/i);
    expect(validateTransitionReason("Missing", "")).toMatch(/deadline/i);
    expect(validateTransitionReason("Missing", "2026-08-20T10:00")).toMatch(
      /future/i,
    );
    expect(
      validateTransitionReason("Missing signature", "2026-08-22T10:00"),
    ).toBe("");
    vi.useRealTimers();
  });
});
