import { describe, expect, it } from "vitest";

import {
  getAccessibleInternalRoutes,
  getFirstAccessibleInternalRoute,
  publicRoutes,
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

  it("allows Admin users to open Education while manage_education is not seeded", () => {
    expect(
      getAccessibleInternalRoutes([], ["Admin"]).map((route) => route.path),
    ).toContain("/education");
  });

  it("protects the summary editor with the same access as Education", () => {
    const education = publicRoutes.find((route) => route.path === "/education");
    expect(publicRoutes.find((route) => route.path === "/education/summaries/:id"))
      .toMatchObject({
        isProtected: true,
        requiredPermission: education?.requiredPermission,
        allowedRoles: education?.allowedRoles,
      });
  });

  it("allows Admin users to access URL management without manage_urls", () => {
    expect(getAccessibleInternalRoutes([], ["Admin"]).map((route) => route.path)).toContain(
      "/url-shortener",
    );
    expect(getFirstAccessibleInternalRoute([], ["Admin"])?.path).toBe(
      "/url-shortener",
    );
  });

  it("exposes HIMTI KIT only with the manage_himti_kit permission", () => {
    expect(
      getAccessibleInternalRoutes(["manage_himti_kit"]).map((route) => route.path),
    ).toEqual(["/himti-kit"]);
  });

  it("does not let roles bypass manage_himti_kit", () => {
    for (const role of ["Admin", "General Manager", "Manager"]) {
      expect(
        getAccessibleInternalRoutes([], [role]).map((route) => route.path),
      ).not.toContain("/himti-kit");
    }
  });
});
