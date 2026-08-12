import { Crown, Search, Trash2, UserPlus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  useAddWorkspaceMember,
  useRemoveWorkspaceMember,
  useUpdateWorkspaceMember,
  useWorkspaceMembers,
} from "@/api/link-workspaces/queries";
import { useGetUsers } from "@/api/rbac/queries";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LinkWorkspace, WorkspaceRole } from "@/types/link-workspace";

export function WorkspaceMembers({
  workspace,
  canManage,
  canSearchUsers,
  currentUserId,
}: {
  workspace: LinkWorkspace;
  canManage: boolean;
  canSearchUsers: boolean;
  currentUserId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<Exclude<WorkspaceRole, "OWNER">>("VIEWER");
  const [ownershipTarget, setOwnershipTarget] = useState<
    (typeof workspace.members)[number] | null
  >(null);
  const members = useWorkspaceMembers(workspace.id, canManage);
  const users = useGetUsers(
    {
      page: 1,
      limit: 20,
      search: debouncedSearch || undefined,
      status: "ACTIVE",
    },
    canManage && canSearchUsers && open,
  );
  const addMember = useAddWorkspaceMember(workspace.id);
  const updateMember = useUpdateWorkspaceMember(workspace.id);
  const removeMember = useRemoveWorkspaceMember(workspace.id);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  const existingUserIds = useMemo(
    () =>
      new Set(
        (members.data ?? workspace.members).map((member) => member.userId),
      ),
    [members.data, workspace.members],
  );
  const candidates =
    users.data?.data.filter((user) => !existingUserIds.has(user.id)) ?? [];
  const displayedMembers = members.data ?? workspace.members;
  const currentOwner = displayedMembers.find(
    (member) => member.role === "OWNER",
  );

  const submit = () => {
    if (!userId) return;
    addMember.mutate(
      { userId, role },
      {
        onSuccess: () => {
          setSearch("");
          setUserId("");
          setRole("VIEWER");
          setOpen(false);
        },
      },
    );
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Users className="h-4 w-4 text-primary" /> Members
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {workspace.members.length} collaborator
            {workspace.members.length === 1 ? "" : "s"}
          </p>
        </div>
        {canManage && canSearchUsers && (
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            <UserPlus /> Add
          </Button>
        )}
      </div>

      {canManage && members.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading members...</p>
      ) : canManage && members.isError ? (
        <p role="alert" className="text-sm text-semantic-danger">
          Members could not be loaded.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {displayedMembers.map((member) => (
            <li
              key={member.userId}
              className="flex min-w-0 items-center gap-3 py-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {member.user.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {member.user.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.user.email}
                </p>
              </div>
              {!canManage ||
              member.userId === currentUserId ||
              member.role === "OWNER" ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  {member.role === "OWNER" && (
                    <Crown className="h-3 w-3 text-amber-700" />
                  )}
                  {member.role[0] + member.role.slice(1).toLowerCase()}
                </span>
              ) : (
                <>
                  <Select
                    value={member.role}
                    onValueChange={(next) => {
                      const nextRole = next as WorkspaceRole;
                      if (!nextRole || nextRole === member.role) return;
                      if (nextRole === "OWNER") {
                        setOwnershipTarget(member);
                        return;
                      }
                      updateMember.mutate({
                        userId: member.userId,
                        role: nextRole,
                      });
                    }}
                  >
                    <SelectTrigger
                      aria-label={`Role for ${member.user.name}`}
                      className="h-8 w-24 px-2 text-xs"
                    >
                      <SelectValue>
                        {member.role[0] + member.role.slice(1).toLowerCase()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OWNER">Owner</SelectItem>
                      <SelectItem value="EDITOR">Editor</SelectItem>
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <IconButton
                    label={`Remove ${member.user.name}`}
                    tone="danger"
                    onClick={() => removeMember.mutate(member.userId)}
                  >
                    <Trash2 />
                  </IconButton>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {canManage && !canSearchUsers && (
        <p className="mt-3 text-xs text-muted-foreground">
          Adding members requires user-directory access (`manage_users`).
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add member</DialogTitle>
            <DialogDescription>
              Select an active HIMTI Internal user and assign a workspace role.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <div>
              <Label htmlFor="member-search" className="mb-2">
                Find active user
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="member-search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setUserId("");
                  }}
                  className="pl-9"
                  placeholder="Search by name or email"
                />
              </div>
              <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-border">
                {users.isLoading ? (
                  <p className="p-3 text-sm text-muted-foreground">
                    Searching users...
                  </p>
                ) : candidates.length ? (
                  candidates.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setUserId(user.id)}
                      className={`flex w-full items-center justify-between gap-3 border-b border-border p-3 text-left text-sm last:border-0 ${userId === user.id ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">
                          {user.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </span>
                      {userId === user.id && (
                        <span className="text-xs font-bold">Selected</span>
                      )}
                    </button>
                  ))
                ) : (
                  <p className="p-3 text-sm text-muted-foreground">
                    No eligible active users found.
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label id="member-role-label" className="mb-2">
                Role
              </Label>
              <div
                role="radiogroup"
                aria-labelledby="member-role-label"
                className="grid gap-2 sm:grid-cols-2"
              >
                {(
                  [
                    {
                      value: "EDITOR",
                      label: "Editor",
                      description: "Can create and manage links",
                    },
                    {
                      value: "VIEWER",
                      label: "Viewer",
                      description: "Can view, copy, and open links",
                    },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={role === option.value}
                    onClick={() => setRole(option.value)}
                    className={`rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      role === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="block text-sm font-semibold">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            {addMember.isError && (
              <p role="alert" className="text-sm text-semantic-danger">
                Could not add this user. They may already be a member.
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!userId || addMember.isPending}>
                {addMember.isPending ? "Adding..." : "Add member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!ownershipTarget}
        onOpenChange={(next) => !next && setOwnershipTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer workspace ownership?</AlertDialogTitle>
            <AlertDialogDescription>
              {ownershipTarget?.user.name} will become the only owner. This
              transfer changes {currentOwner?.user.name ?? "the current owner"}
              's role to Editor, and gives only the new owner workspace and
              member management access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {updateMember.isError && (
            <p role="alert" className="text-sm text-semantic-danger">
              Ownership could not be transferred. Try again.
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={updateMember.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (!ownershipTarget) return;
                updateMember.mutate(
                  { userId: ownershipTarget.userId, role: "OWNER" },
                  { onSuccess: () => setOwnershipTarget(null) },
                );
              }}
            >
              {updateMember.isPending
                ? "Transferring..."
                : "Transfer ownership"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
