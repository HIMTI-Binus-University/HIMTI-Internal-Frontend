import { describe, expect, it } from "vitest";

import { pathUrl } from "./url";

describe("pathUrl", () => {
  it("keeps dynamic IDs within one URL path segment", () => {
    const template = "/api/membership/periods/:id/resources";

    expect(pathUrl(template, "2026-2027")).toBe(
      "/api/membership/periods/2026-2027/resources",
    );
    expect(pathUrl(template, "2027/2028")).toBe(
      "/api/membership/periods/2027%2F2028/resources",
    );
    expect(pathUrl(template, "Period 2027/2028?#%")).toBe(
      "/api/membership/periods/Period%202027%2F2028%3F%23%25/resources",
    );
  });
});
