import { describe, expect, it } from "vitest";

import {
  combineEventDateTime,
  normalizeOptionalEventUrl,
  splitEventDateTime,
} from "./event-form";

describe("normalizeOptionalEventUrl", () => {
  it("keeps optional links nullable", () => {
    expect(normalizeOptionalEventUrl("", "destination")).toBeNull();
    expect(normalizeOptionalEventUrl(null, "poster")).toBeNull();
  });

  it("normalizes schemeless links", () => {
    expect(
      normalizeOptionalEventUrl("events.himti.or.id/register", "destination"),
    ).toBe("https://events.himti.or.id/register");
  });

  it("rejects unsafe schemes with an existing-style message", () => {
    expect(() =>
      normalizeOptionalEventUrl("javascript:alert(1)", "poster"),
    ).toThrow(
      "Enter a valid poster link. Only HTTP and HTTPS links are allowed.",
    );
  });
});

describe("event date and time", () => {
  it("requires both date and time values", () => {
    expect(() => combineEventDateTime("2026-07-30", "")).toThrow(
      "Enter both an event date and time.",
    );
  });

  it("combines and splits local date and time values", () => {
    const combined = combineEventDateTime("2026-07-30", "14:30");
    expect(splitEventDateTime(combined)).toEqual({
      date: "2026-07-30",
      time: "14:30",
    });
  });
});
