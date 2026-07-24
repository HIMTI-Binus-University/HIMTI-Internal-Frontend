import { describe, expect, it } from "vitest";

import {
  getAccessibleInternalRoutes,
  getFirstAccessibleInternalRoute,
} from "./routes";

describe("internal route access helpers", () => {
  it("returns protected internal routes matching user permissions", () => {
    const routes = getAccessibleInternalRoutes(["manage_events"]);

    expect(routes.map((route) => route.path)).toEqual(["/events"]);
  });

  it("returns the first accessible route using configured route order", () => {
    const route = getFirstAccessibleInternalRoute([
      "manage_events",
      "manage_urls",
    ]);

    expect(route?.path).toBe("/url-shortener");
  });

  it("exposes batch management only with the manage_batch permission", () => {
    expect(getAccessibleInternalRoutes(["manage_batch"]).map((route) => route.path)).toEqual([
      "/batches",
    ]);
  });

  it("returns undefined when the user has no internal tool permissions", () => {
    expect(getFirstAccessibleInternalRoute([])).toBeUndefined();
    expect(getFirstAccessibleInternalRoute(["view_dashboard"])).toBeUndefined();
  });
});
