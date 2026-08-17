import { describe, expect, it } from "vitest";

import { readQueueFilters } from "./registration-queue-filters";

describe("registration queue URL filters", () => {
  it("restores valid server filters from the URL", () => {
    const filters = readQueueFilters(
      new URLSearchParams(
        "page=3&limit=50&search=Ada%20Lovelace&status=PENDING_APPROVAL&responseStatus=SUBMITTED&paymentStatus=NOT_REQUIRED&sort=createdAt%3Aasc",
      ),
    );
    expect(filters).toEqual({
      page: 3,
      limit: 50,
      search: "Ada Lovelace",
      status: "PENDING_APPROVAL",
      responseStatus: "SUBMITTED",
      paymentStatus: "NOT_REQUIRED",
      sort: "createdAt:asc",
    });
  });

  it("bounds pagination and discards unsupported contract values", () => {
    expect(
      readQueueFilters(
        new URLSearchParams(
          "page=-1&limit=1000&status=CONFIRMED&sort=name:asc",
        ),
      ),
    ).toEqual({
      page: 1,
      limit: 25,
      search: undefined,
      status: undefined,
      responseStatus: undefined,
      paymentStatus: undefined,
      sort: "submittedAt:desc",
    });
  });
});
