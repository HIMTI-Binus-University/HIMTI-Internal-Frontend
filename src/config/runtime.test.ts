import { describe, expect, it } from "vitest";

import { joinUrlPath, runtimeConfig, shortLinkConfig } from "./runtime";

describe("runtime configuration", () => {
  it("targets initial registration directly", () => {
    expect(runtimeConfig.registrationAppUrl).toBe(
      "http://localhost:3001/register",
    );
  });

  it("joins URL paths without duplicate slashes", () => {
    expect(joinUrlPath("https://registration.example.com/", "/register")).toBe(
      "https://registration.example.com/register",
    );
  });

  it("uses the configured link domain and extracts editable short codes", () => {
    expect(shortLinkConfig.displayPrefix).toBe("http://localhost:3000/link/");
    expect(
      shortLinkConfig.toEditableShortCode(
        "http://localhost:3000/link/workspace2026",
      ),
    ).toBe("workspace2026");
  });
});
