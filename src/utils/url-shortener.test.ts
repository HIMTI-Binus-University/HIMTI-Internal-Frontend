import { describe, expect, it } from "vitest";

import { formatUrlCreatedAt } from "./url-shortener";

describe("formatUrlCreatedAt", () => {
  it("formats UTC timestamps in Jakarta time", () => {
    expect(formatUrlCreatedAt("2026-07-10T18:46:51.887Z")).toBe(
      "11 Jul 2026, 01.46 WIB",
    );
  });

  it("returns a safe fallback for missing or invalid timestamps", () => {
    expect(formatUrlCreatedAt()).toBe("Date unavailable");
    expect(formatUrlCreatedAt("not-a-date")).toBe("Date unavailable");
  });
});
