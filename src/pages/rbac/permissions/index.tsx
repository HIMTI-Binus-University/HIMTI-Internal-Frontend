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
import { KeyRound, Pencil, Trash2 } from "lucide-react";

import { useGetPermissions } from "@/api/rbac/queries";
import {
  useCreatePermission,
  useDeletePermission,
  useUpdatePermission,
} from "@/hooks/rbac/permissions";
import type { Permission } from "@/types/rbac";

const RbacPermissionsPage = () => {
  // Create form state
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState("");

  // Edit dialog state
  const [editTarget, setEditTarget] = useState<Permission | null>(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [editError, setEditError] = useState("");

  // Delete dialog state
  const [deactivateTarget, setDeactivateTarget] = useState<Permission | null>(null);

  const { data: permissions = [], isLoading } = useGetPermissions();
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const deletePermission = useDeletePermission();

  const handleCreate = () => {
    if (!newName.trim()) {
      setCreateError("Permission name is required");
      return;
    }
    createPermission.mutate(
      { name: newName.trim() },
      {
        onSuccess: () => {
          setNewName("");
          setCreateError("");
        },
        onError: (error) => {
          const axiosError = error as AxiosError<{ message?: string }>;
          setCreateError(
            axiosError.response?.data?.message ?? "Failed to create permission",
          );
        },
      },
    );
  };

  const openEditDialog = (permission: Permission) => {
    setEditTarget(permission);
    setEditName(permission.name);
    setEditStatus(permission.status);
    setEditError("");
  };

  const handleSaveEdit = () => {
    if (!editTarget) return;
    if (!editName.trim()) {
      setEditError("Permission name is required");
      return;
    }
    updatePermission.mutate(
      { id: editTarget.id, name: editName.trim(), status: editStatus },
      {
        onSuccess: () => {
          setEditTarget(null);
        },
        onError: (error) => {
          const axiosError = error as AxiosError<{ message?: string }>;
          setEditError(
            axiosError.response?.data?.message ?? "Failed to update permission",
          );
        },
      },
    );
  };

  const handleDeactivate = () => {
    if (!deactivateTarget) return;
    deletePermission.mutate(
      { id: deactivateTarget.id },
      {
        onSuccess: () => {
          setDeactivateTarget(null);
        },
      },
    );
  };

  return (
    <PageLayout icon={KeyRound} title="Permissions">

        {/* Create form */}
        <Container>
          <ContainerHeader>Add Permission</ContainerHeader>
          <div className="flex flex-col gap-4 w-full">
            <div>
              <Label htmlFor="newPermissionName" className="mb-2">
                Permission Name
              </Label>
              <Input
                id="newPermissionName"
                type="text"
                placeholder="manage_everything"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
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
              disabled={createPermission.isPending}
              className="ml-auto w-fit"
            >
              {createPermission.isPending ? "Adding..." : "Add Permission"}
            </Button>
          </div>
        </Container>

        {/* Permissions list */}
        <Container>
          <ContainerHeader>Manage Permissions</ContainerHeader>

          {isLoading && (
            <p className="text-sm text-muted-foreground">
              Loading permissions...
            </p>
          )}

          {!isLoading && permissions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No permissions found.
            </p>
          )}

          <div className="-mx-5 -mb-5 divide-y divide-border border-t border-border">
            {permissions.map((permission) => (
              <div key={permission.id} className="flex min-h-14 items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-muted/35">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {permission.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(permission)}
                    >
                      <Pencil />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-semantic-danger-border text-semantic-danger hover:bg-semantic-danger-background hover:text-semantic-danger"
                      onClick={() => setDeactivateTarget(permission)}
                      disabled={permission.status === "INACTIVE"}
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
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div>
              <Label htmlFor="editPermissionName" className="mb-2">
                Permission Name
              </Label>
              <Input
                id="editPermissionName"
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value);
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
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updatePermission.isPending}
            >
              {updatePermission.isPending ? "Saving..." : "Save"}
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
            <AlertDialogTitle>Delete Permission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deactivateTarget?.name}</span>?
              Roles that have this permission will lose access to the associated
              feature.
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

export default RbacPermissionsPage;
