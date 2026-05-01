import { useState } from "react";
import { AxiosError } from "axios";

import { Sidebar } from "@/components/Utils";
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
import { Card, CardContent } from "@/components/ui/card";

import { FaBars, FaPencilAlt, FaBan } from "react-icons/fa";
import { FaKey } from "react-icons/fa";

import { useGetPermissions } from "@/api/rbac/queries";
import { useCreatePermission, useUpdatePermission } from "@/hooks/rbac/permissions";
import type { Permission } from "@/types/rbac";

const RbacPermissionsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Create form state
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState("");

  // Edit dialog state
  const [editTarget, setEditTarget] = useState<Permission | null>(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [editError, setEditError] = useState("");

  // Deactivate dialog state
  const [deactivateTarget, setDeactivateTarget] = useState<Permission | null>(null);

  const { data: permissions = [], isLoading } = useGetPermissions();
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();

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
    updatePermission.mutate(
      { id: deactivateTarget.id, status: "INACTIVE" },
      {
        onSuccess: () => {
          setDeactivateTarget(null);
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen w-full bg-semantic-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 p-10 font-sans max-md:px-4 max-md:py-3">
        <header className="flex justify-between items-center relative mb-8">
          <div className="flex flex-row gap-4">
            <button
              className="xl:hidden p-2 rounded-lg hover:bg-semantic-muted opacity-30"
              onClick={() => setSidebarOpen(true)}
            >
              <FaBars size={24} />
            </button>

            <div className="flex items-center gap-5 p-2 min-w-0">
              <FaKey
                size={48}
                className="text-semantic-foreground/30 max-xl:w-[36px] max-xl:h-[36px]"
              />
              <h2 className="min-w-0 text-h3 max-xl:text-h4 max-xl:font-bold max-lg:text-h5 max-lg:font-bold font-bold text-semantic-foreground/50">
                Permissions
              </h2>
            </div>
          </div>
        </header>

        {/* Create form */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-h5 font-bold mb-6">Add Permission</h3>
          <div className="flex flex-col gap-4 max-w-md">
            <div>
              <Label htmlFor="newPermissionName" className="mb-3">
                Permission Name
              </Label>
              <Input
                id="newPermissionName"
                type="text"
                placeholder="e.g. manage_events"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setCreateError("");
                }}
                className={createError ? "border-semantic-danger" : ""}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              {createError && (
                <p className="text-semantic-danger text-body-2 mt-2">
                  {createError}
                </p>
              )}
            </div>
            <Button
              onClick={handleCreate}
              disabled={createPermission.isPending}
              className="w-fit"
            >
              {createPermission.isPending ? "Adding..." : "Add Permission"}
            </Button>
          </div>
        </div>

        {/* Permissions list */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-h5 font-bold mb-6">All Permissions</h3>

          {isLoading && (
            <p className="text-semantic-foreground/50 text-body-1">
              Loading permissions...
            </p>
          )}

          {!isLoading && permissions.length === 0 && (
            <p className="text-semantic-foreground/50 text-body-1">
              No permissions found.
            </p>
          )}

          <div className="flex flex-col gap-4">
            {permissions.map((permission) => (
              <Card key={permission.id} className="shadow-sm">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-body-1 font-semibold text-semantic-foreground truncate">
                      {permission.name}
                    </span>
                    <span
                      className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                        permission.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {permission.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(permission)}
                    >
                      <FaPencilAlt size={12} className="mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-semantic-danger border-semantic-danger hover:bg-semantic-danger hover:text-white"
                      onClick={() => setDeactivateTarget(permission)}
                      disabled={permission.status === "INACTIVE"}
                    >
                      <FaBan size={12} className="mr-1.5" />
                      Deactivate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

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
                <p className="text-semantic-danger text-body-2 mt-2">
                  {editError}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="editPermissionStatus" className="mb-2">
                Status
              </Label>
              <select
                id="editPermissionStatus"
                value={editStatus}
                onChange={(e) =>
                  setEditStatus(e.target.value as "ACTIVE" | "INACTIVE")
                }
                className="w-full border border-semantic-border rounded-lg px-3 py-2 text-body-1 text-semantic-foreground bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary-2"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
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

      {/* Deactivate confirmation */}
      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Permission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate{" "}
              <span className="font-semibold">{deactivateTarget?.name}</span>?
              Roles that have this permission will lose access to the associated
              feature.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              className="bg-semantic-danger hover:bg-semantic-danger/90"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RbacPermissionsPage;
