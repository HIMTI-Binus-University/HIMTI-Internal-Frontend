import { expect, it } from "vitest";
import { usersCsv } from "./csv";
import type { RbacUser } from "@/types/rbac";

it("exports visible user values as valid escaped CSV", () => {
  const user = { id: "1", name: 'Doe, "Jane"', email: "jane@example.com", status: "ACTIVE", createdAt: "2026-07-20T00:00:00Z", roles: [] } as unknown as RbacUser;
  expect(usersCsv([user])).toContain('"Doe, ""Jane"""');
});
