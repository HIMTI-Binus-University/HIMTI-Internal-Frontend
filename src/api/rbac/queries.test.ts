import { describe, expect, it } from "vitest";

import { cleanUserListParams } from "./queries";

describe("cleanUserListParams", () => {
  it("preserves canonical false filters and regionId", () => {
    expect(
      cleanUserListParams({
        page: 1,
        search: "",
        regionId: "region-1",
        verification: false,
        completed: false,
      }),
    ).toEqual({
      page: 1,
      regionId: "region-1",
      verification: false,
      completed: false,
    });
  });
});
