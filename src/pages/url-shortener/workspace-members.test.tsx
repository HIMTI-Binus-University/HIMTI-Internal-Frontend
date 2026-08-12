import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { LinkWorkspace } from "@/types/link-workspace";
import { WorkspaceMembers } from "./workspace-members";

const mutate = vi.fn();
const updateMutate = vi.fn();
const removeMutate = vi.fn();

vi.mock("@/api/link-workspaces/queries", () => ({
  useWorkspaceMembers: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
  }),
  useAddWorkspaceMember: () => ({ mutate, isPending: false, isError: false }),
  useUpdateWorkspaceMember: () => ({
    mutate: updateMutate,
    isPending: false,
    isError: false,
  }),
  useRemoveWorkspaceMember: () => ({ mutate: removeMutate }),
}));

vi.mock("@/api/rbac/queries", () => ({
  useGetUsers: () => ({
    data: {
      data: [
        {
          id: "active-user",
          name: "Active Member",
          email: "member@binus.ac.id",
          status: "ACTIVE",
        },
      ],
    },
    isLoading: false,
  }),
}));

const workspace = {
  id: "workspace-1",
  members: [],
} as unknown as LinkWorkspace;

const ownerWorkspace = {
  id: "workspace-1",
  members: [
    {
      workspaceId: "workspace-1",
      userId: "owner-user",
      role: "OWNER",
      createdAt: "2026-08-11T00:00:00.000Z",
      user: {
        id: "owner-user",
        name: "Workspace Owner",
        email: "owner@binus.ac.id",
        status: "ACTIVE",
      },
    },
    {
      workspaceId: "workspace-1",
      userId: "editor-user",
      role: "EDITOR",
      createdAt: "2026-08-11T00:00:00.000Z",
      user: {
        id: "editor-user",
        name: "Workspace Editor",
        email: "editor@binus.ac.id",
        status: "ACTIVE",
      },
    },
  ],
} as LinkWorkspace;

describe("WorkspaceMembers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("selects an active user by backend user ID instead of accepting an email payload", () => {
    render(<WorkspaceMembers workspace={workspace} canManage canSearchUsers />);
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    fireEvent.click(screen.getByRole("button", { name: /Active Member/ }));
    fireEvent.click(screen.getByRole("button", { name: "Add member" }));
    expect(mutate).toHaveBeenCalledWith(
      { userId: "active-user", role: "VIEWER" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("selects the role for a new member", () => {
    render(<WorkspaceMembers workspace={workspace} canManage canSearchUsers />);
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    fireEvent.click(screen.getByRole("button", { name: /Active Member/ }));
    fireEvent.click(screen.getByRole("radio", { name: /Editor/ }));

    expect(screen.getByRole("radio", { name: /Editor/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: "Add member" }));
    expect(mutate).toHaveBeenCalledWith(
      { userId: "active-user", role: "EDITOR" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("does not offer member addition without user-directory permission", () => {
    render(
      <WorkspaceMembers
        workspace={workspace}
        canManage
        canSearchUsers={false}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Add" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/requires user-directory access/),
    ).toBeInTheDocument();
  });

  it("prevents the current user from changing their own role or removing themselves", () => {
    render(
      <WorkspaceMembers
        workspace={ownerWorkspace}
        canManage
        canSearchUsers
        currentUserId="owner-user"
      />,
    );

    expect(
      screen.queryByRole("combobox", { name: "Role for Workspace Owner" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Remove Workspace Owner" }),
    ).not.toBeInTheDocument();
    expect(updateMutate).not.toHaveBeenCalled();
    expect(removeMutate).not.toHaveBeenCalled();
  });

  it("does not offer direct owner demotion to an administrator", () => {
    render(
      <WorkspaceMembers
        workspace={ownerWorkspace}
        canManage
        canSearchUsers
        currentUserId="admin-user"
      />,
    );

    expect(
      screen.queryByRole("combobox", { name: "Role for Workspace Owner" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Remove Workspace Owner" }),
    ).not.toBeInTheDocument();
  });

  it("asks for confirmation before transferring ownership", async () => {
    render(
      <WorkspaceMembers
        workspace={ownerWorkspace}
        canManage
        canSearchUsers
        currentUserId="owner-user"
      />,
    );

    fireEvent.click(
      screen.getByRole("combobox", { name: "Role for Workspace Editor" }),
    );
    const ownerOption = await screen.findByRole("option", { name: "Owner" });
    fireEvent.mouseMove(ownerOption);
    fireEvent.keyDown(ownerOption, { key: "Enter", code: "Enter" });
    fireEvent.keyUp(ownerOption, { key: "Enter", code: "Enter" });

    expect(updateMutate).not.toHaveBeenCalled();
    expect(
      screen.getByRole("alertdialog", {
        name: "Transfer workspace ownership?",
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Transfer ownership" }));
    expect(updateMutate).toHaveBeenCalledWith(
      { userId: "editor-user", role: "OWNER" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("cancels ownership transfer without calling the mutation", async () => {
    render(
      <WorkspaceMembers
        workspace={ownerWorkspace}
        canManage
        canSearchUsers
        currentUserId="owner-user"
      />,
    );

    fireEvent.click(
      screen.getByRole("combobox", { name: "Role for Workspace Editor" }),
    );
    const ownerOption = await screen.findByRole("option", { name: "Owner" });
    fireEvent.mouseMove(ownerOption);
    fireEvent.keyDown(ownerOption, { key: "Enter", code: "Enter" });
    fireEvent.keyUp(ownerOption, { key: "Enter", code: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    expect(updateMutate).not.toHaveBeenCalled();
  });
});
