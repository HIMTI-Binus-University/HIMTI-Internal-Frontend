import { describe, expect, it } from "vitest";

import {
  canEditWorkspaceLinks,
  canManageWorkspace,
  getWorkspaceRole,
  type LinkWorkspace,
} from "./link-workspace";

const workspace = {
  members: [
    { userId: "owner", role: "OWNER" },
    { userId: "editor", role: "EDITOR" },
    { userId: "viewer", role: "VIEWER" },
  ],
} as LinkWorkspace;

describe("link workspace UI authorization", () => {
  it("derives the current role from backend membership DTOs", () => {
    expect(getWorkspaceRole(workspace, "editor")).toBe("EDITOR");
    expect(getWorkspaceRole(workspace, "missing")).toBeUndefined();
  });

  it("matches backend owner/editor/viewer policy", () => {
    expect(canManageWorkspace("OWNER")).toBe(true);
    expect(canManageWorkspace("EDITOR")).toBe(false);
    expect(canEditWorkspaceLinks("OWNER")).toBe(true);
    expect(canEditWorkspaceLinks("EDITOR")).toBe(true);
    expect(canEditWorkspaceLinks("VIEWER")).toBe(false);
  });

  it("allows backend admin bypass capabilities", () => {
    expect(canManageWorkspace(undefined, true)).toBe(true);
    expect(canEditWorkspaceLinks(undefined, true)).toBe(true);
  });
});
