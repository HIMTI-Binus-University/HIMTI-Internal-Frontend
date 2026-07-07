import { useState } from "react";
import { AxiosError } from "axios";

import { PageLayout, Container, ContainerHeader } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { BadgeCheck, Pencil, Trash2 } from "lucide-react";

import { useGetPermissions, useGetRoles } from "@/api/rbac/queries";
import {
  useCreateRole,
  useDeleteRole,
  useUpdateRole,
  useAssignRolePermission,
  useRemoveRolePermission,
} from "@/hooks/rbac/roles";
import type { Role } from "@/types/rbac";

const RbacRolesPage = () => {
  // Create form state
  const [newRoleName, setNewRoleName] = useState("");
  const [createError, setCreateError] = useState("");

  // Edit dialog state
  const [editTarget, setEditTarget] = useState<Role | null>(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [editError, setEditError] = useState("");

  // Delete dialog state
  const [deactivateTarget, setDeactivateTarget] = useState<Role | null>(null);

  // Track which permission toggles are pending to prevent double-clicks
  const [pendingPermissions, setPendingPermissions] = useState<Set<string>>(new Set());

  const { data: roles = [], isLoading } = useGetRoles();
  const { data: allPermissions = [] } = useGetPermissions();

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  const assignPermission = useAssignRolePermission();
  const removePermission = useRemoveRolePermission();

  const handleCreate = () => {
    if (!newRoleName.trim()) {
      setCreateError("Role name is required");
      return;
    }
    createRole.mutate(
      { roleName: newRoleName.trim() },
      {
        onSuccess: () => {
          setNewRoleName("");
          setCreateError("");
        },
        onError: (error) => {
          const axiosError = error as AxiosError<{ message?: string }>;
          setCreateError(
            axiosError.response?.data?.message ?? "Failed to create role",
          );
        },
      },
    );
  };

  const openEditDialog = (role: Role) => {
    setEditTarget(role);
    setEditRoleName(role.roleName);
    setEditStatus(role.status);
    setEditError("");
    setPendingPermissions(new Set());
  };

  const handleSaveEdit = () => {
    if (!editTarget) return;
    if (!editRoleName.trim()) {
      setEditError("Role name is required");
      return;
    }
    updateRole.mutate(
      { id: editTarget.id, roleName: editRoleName.trim(), status: editStatus },
      {
        onSuccess: () => {
          setEditTarget(null);
        },
        onError: (error) => {
          const axiosError = error as AxiosError<{ message?: string }>;
          setEditError(
            axiosError.response?.data?.message ?? "Failed to update role",
          );
        },
      },
    );
  };

  const handlePermissionToggle = (permissionId: string, isCurrentlyAssigned: boolean) => {
    if (!editTarget || pendingPermissions.has(permissionId)) return;

    setPendingPermissions((prev) => new Set(prev).add(permissionId));

    const mutation = isCurrentlyAssigned ? removePermission : assignPermission;
    mutation.mutate(
      { roleId: editTarget.id, permissionId },
      {
        onSuccess: () => {
          setPendingPermissions((prev) => {
            const next = new Set(prev);
            next.delete(permissionId);
            return next;
          });
        },
        onError: () => {
          setPendingPermissions((prev) => {
            const next = new Set(prev);
            next.delete(permissionId);
            return next;
          });
        },
      },
    );
  };

  const handleDeactivate = () => {
    if (!deactivateTarget) return;
    deleteRole.mutate(
      { id: deactivateTarget.id },
      {
        onSuccess: () => {
          setDeactivateTarget(null);
        },
      },
    );
  };

  // When editTarget is open, sync its permissions from the live roles data
  const liveEditTarget = editTarget
    ? roles.find((r) => r.id === editTarget.id) ?? editTarget
    : null;

  const assignedPermissionIds = new Set(
    liveEditTarget?.permissions?.map((p) => p.id) ?? [],
  );

  return (
    <PageLayout icon={BadgeCheck} title="Roles">

        {/* Create form */}
        <Container>
          <ContainerHeader>Add Role</ContainerHeader>
          <div className="flex flex-col gap-4 w-full">
            <div>
              <Label htmlFor="newRoleName" className="mb-2">
                Role Name
              </Label>
              <Input
                id="newRoleName"
                type="text"
                placeholder="Registration Team"
                value={newRoleName}
                onChange={(e) => {
                  setNewRoleName(e.target.value);
                  setCreateError("");
                }}
                className={createError ? "border-semantic-danger" : ""}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              {createError && (
                <p className="mt-2 text-sm text-semantic-danger">
                  {createError}
                </p>
              )}
            </div>
            <Button
              onClick={handleCreate}
              disabled={createRole.isPending}
              className="ml-auto w-fit"
            >
              {createRole.isPending ? "Adding..." : "Add Role"}
            </Button>
          </div>
        </Container>

        {/* Roles list */}
        <Container>
          <ContainerHeader>Manage Roles</ContainerHeader>

          {isLoading && (
            <p className="text-sm text-muted-foreground">
              Loading roles...
            </p>
          )}

          {!isLoading && roles.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No roles found.
            </p>
          )}

          <div className="-mx-5 -mb-5 divide-y divide-border border-t border-border">
            {roles.map((role) => (
            <div key={role.id} className="flex min-h-14 items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-muted/35">
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {role.roleName}
                    </span>
                  </div>

                  {(role.permissions?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions?.map((permission) => (
                        <span
                          key={permission.id}
                          className="rounded-md border border-semantic-info-border bg-semantic-info-background px-2 py-0.5 text-xs font-medium text-semantic-info"
                        >
                          {permission.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(role)}
                  >
                    <Pencil />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-semantic-danger-border text-semantic-danger hover:bg-semantic-danger-background hover:text-semantic-danger"
                    onClick={() => setDeactivateTarget(role)}
                    disabled={role.status === "INACTIVE"}
                  >
                    <Trash2 />
                    Delete
                  </Button>
                </div>
            </div>
          ))}
          </div>
        </Container>

      {/* Edit dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-2">
            <div>
              <Label htmlFor="editRoleName" className="mb-2">
                Role Name
              </Label>
              <Input
                id="editRoleName"
                value={editRoleName}
                onChange={(e) => {
                  setEditRoleName(e.target.value);
                  setEditError("");
                }}
                className={editError ? "border-semantic-danger" : ""}
              />
              {editError && (
                <p className="mt-2 text-sm text-semantic-danger">
                  {editError}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-3 block">Permissions</Label>
              {allPermissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No permissions available.
                </p>
              ) : (
                <div className="flex max-h-52 flex-col gap-1 overflow-y-auto rounded-lg border border-border p-2">
                  {allPermissions.map((permission) => {
                    const isAssigned = assignedPermissionIds.has(permission.id);
                    const isPending = pendingPermissions.has(permission.id);
                    return (
                      <label
                        key={permission.id}
                        className={`flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted ${isPending ? "opacity-50" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          disabled={isPending}
                          onChange={() =>
                            handlePermissionToggle(permission.id, isAssigned)
                          }
                          className="w-4 h-4 accent-brand-primary-2 cursor-pointer"
                        />
                        <span className="text-sm text-foreground">
                          {permission.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateRole.isPending}
            >
              {updateRole.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deactivateTarget?.roleName}</span>?
              Users assigned to this role will lose their associated permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              className="bg-semantic-danger text-white hover:bg-semantic-danger/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default RbacRolesPage;
