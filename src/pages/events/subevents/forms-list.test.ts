import { describe, expect, it } from "vitest";

import { newestFormsFirst } from "./forms-list-order";

describe("registration form ordering", () => {
  it("sorts by the latest update and falls back to creation time", () => {
    const forms = [
      { id: "older", createdAt: "2026-08-20T10:00:00Z", updatedAt: null },
      {
        id: "newest",
        createdAt: "2026-08-19T10:00:00Z",
        updatedAt: "2026-08-22T10:00:00Z",
      },
      { id: "newer", createdAt: "2026-08-21T10:00:00Z", updatedAt: null },
    ];

    expect(newestFormsFirst(forms).map((form) => form.id)).toEqual([
      "newest",
      "newer",
      "older",
    ]);
    expect(forms.map((form) => form.id)).toEqual(["older", "newest", "newer"]);
  });
});
