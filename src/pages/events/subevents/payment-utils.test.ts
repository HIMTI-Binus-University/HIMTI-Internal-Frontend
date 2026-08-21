import { describe, expect, it } from "vitest";

import { majorIdrToMinor, readPaymentFilters } from "./payment-utils";

describe("payment utilities", () => {
  it("converts whole major IDR safely without Number precision loss", () => {
    expect(majorIdrToMinor("1.250.000")).toBe("1250000");
    expect(majorIdrToMinor("900719925474099312345")).toBe(
      "900719925474099312345",
    );
    expect(majorIdrToMinor("0")).toBe("0");
    expect(() => majorIdrToMinor("10.50,25")).toThrow("whole IDR");
  });

  it("reads only supported URL-persisted queue filters", () => {
    expect(
      readPaymentFilters(
        new URLSearchParams(
          "page=2&limit=50&status=PROOF_SUBMITTED&sort=expiresAt:desc&search=Alya",
        ),
      ),
    ).toEqual({
      page: 2,
      limit: 50,
      status: "PROOF_SUBMITTED",
      sort: "expiresAt:desc",
      search: "Alya",
    });
    expect(
      readPaymentFilters(
        new URLSearchParams("page=-1&status=INVALID&sort=amount:desc"),
      ),
    ).toMatchObject({ page: 1, limit: 20, sort: "submittedAt:asc" });
  });
});
