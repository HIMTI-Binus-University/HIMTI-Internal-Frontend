import { describe, expect, it } from "vitest";

import { joinUrlPath, runtimeConfig } from "./runtime";

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
});
