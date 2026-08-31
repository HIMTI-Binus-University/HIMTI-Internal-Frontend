import { describe, expect, it } from "vitest";

import { packageOptionLabel, packagePayload } from "./package-utils";

describe("package helpers", () => {
  it("serializes local sales windows and whole-order values", () => {
    const values = new FormData();
    values.set("name", "Team of four");
    values.set("wholeOrderTotalIdr", "150000");
    values.set("seatCount", "4");
    values.set("salesStartAt", "2026-08-22T09:00");
    values.set("salesEndAt", "2026-08-23T09:00");
    expect(packagePayload(values)).toEqual(expect.objectContaining({
      code: "TEAM-OF-FOUR",
      currency: "IDR",
      priceMinor: "150000",
      seatCount: 4,
      status: "DRAFT",
    }));
  });

  it("preserves an existing package code when its name changes", () => {
    const values = new FormData();
    values.set("name", "Renamed package");
    values.set("wholeOrderTotalIdr", "0");
    values.set("seatCount", "1");
    expect(packagePayload(values, "ORIGINAL").code).toBe("ORIGINAL");
  });

  it("rejects fractional seats and labels inactive historical choices", () => {
    const values = new FormData();
    values.set("seatCount", "2.5");
    values.set("wholeOrderTotalIdr", "100");
    expect(() => packagePayload(values)).toThrow("positive whole number");
    expect(packageOptionLabel({ name: "Legacy", code: "OLD", status: "INACTIVE" } as never)).toBe("Legacy (OLD) - inactive");
  });

  it("always emits IDR and rejects fractional or signed package totals", () => {
    const values = new FormData();
    values.set("seatCount", "1");
    values.set("currency", "USD");
    values.set("wholeOrderTotalIdr", "12.50");
    expect(() => packagePayload(values)).toThrow("whole IDR");
    values.set("wholeOrderTotalIdr", "-1");
    expect(() => packagePayload(values)).toThrow("whole IDR");
  });
});
