import { useState, useMemo } from "react";

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
import { Card, CardContent } from "@/components/ui/card";

import { FaBars, FaSearch, FaUserCircle, FaUsers } from "react-icons/fa";

import { useGetUsers, useGetRoles } from "@/api/rbac/queries";
import { useAssignUserRole, useRemoveUserRole } from "@/hooks/rbac/users";
import { authClient } from "@/utils/auth-client";
import type { RbacUser } from "@/types/rbac";

const RbacUsersPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Manage roles dialog state
  const [manageTarget, setManageTarget] = useState<RbacUser | null>(null);
  const [pendingRoles, setPendingRoles] = useState<Set<string>>(new Set());

  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  const { data: users = [], isLoading } = useGetUsers();
  const { data: allRoles = [] } = useGetRoles();

  const assignUserRole = useAssignUserRole();
  const removeUserRole = useRemoveUserRole();

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [users, searchQuery]);

  const openManageDialog = (user: RbacUser) => {
    setManageTarget(user);
    setPendingRoles(new Set());
  };

  const handleRoleToggle = (roleId: string, isCurrentlyAssigned: boolean) => {
    if (!manageTarget || pendingRoles.has(roleId)) return;

    setPendingRoles((prev) => new Set(prev).add(roleId));

    const mutation = isCurrentlyAssigned ? removeUserRole : assignUserRole;
    mutation.mutate(
      { userId: manageTarget.id, roleId },
      {
        onSuccess: () => {
          setPendingRoles((prev) => {
            const next = new Set(prev);
            next.delete(roleId);
            return next;
          });
        },
        onError: () => {
          setPendingRoles((prev) => {
            const next = new Set(prev);
            next.delete(roleId);
            return next;
          });
        },
      },
    );
  };

  // Sync manageTarget with live data after mutations
  const liveManageTarget = manageTarget
    ? users.find((u) => u.id === manageTarget.id) ?? manageTarget
    : null;

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
              <FaUsers
                size={48}
                className="text-semantic-foreground/30 max-xl:w-[36px] max-xl:h-[36px]"
              />
              <h2 className="min-w-0 text-h3 max-xl:text-h4 max-xl:font-bold max-lg:text-h5 max-lg:font-bold font-bold text-semantic-foreground/50">
                Users
              </h2>
            </div>
          </div>
        </header>

        {/* Search bar */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <Label htmlFor="userSearch" className="mb-3 block">
            Search Users
          </Label>
          <div className="relative max-w-md">
            <FaSearch
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-semantic-foreground/40 pointer-events-none"
            />
            <Input
              id="userSearch"
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Users grid */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-h5 font-bold mb-6">
            {searchQuery
              ? `Results for "${searchQuery}" (${filteredUsers.length})`
              : `All Users (${users.length})`}
          </h3>

          {isLoading && (
            <p className="text-semantic-foreground/50 text-body-1">
              Loading users...
            </p>
          )}

          {!isLoading && filteredUsers.length === 0 && (
            <p className="text-semantic-foreground/50 text-body-1">
              {searchQuery ? "No users match your search." : "No users found."}
            </p>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isSelf={user.id === currentUserId}
                onManageRoles={() => openManageDialog(user)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Manage roles dialog */}
      <Dialog
        open={!!manageTarget}
        onOpenChange={(open) => !open && setManageTarget(null)}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Manage Roles</DialogTitle>
            {liveManageTarget && (
              <p className="text-body-2 text-semantic-foreground/60 mt-1">
                {liveManageTarget.name} · {liveManageTarget.email}
              </p>
            )}
          </DialogHeader>

          <div className="py-2">
            {allRoles.length === 0 ? (
              <p className="text-semantic-foreground/50 text-body-2">
                No roles available.
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto border border-semantic-border rounded-lg p-3">
                {allRoles.map((role) => {
                  const isAssigned =
                    liveManageTarget?.roles?.some((r) => r.roleName === role.roleName) ?? false;
                  const isPending = pendingRoles.has(role.id);
                  return (
                    <label
                      key={role.id}
                      className={`flex items-center gap-3 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-semantic-muted transition-colors ${isPending ? "opacity-50" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={isAssigned}
                        disabled={isPending}
                        onChange={() =>
                          handleRoleToggle(role.id, isAssigned)
                        }
                        className="w-4 h-4 accent-brand-primary-2 cursor-pointer"
                      />
                      <span className="text-body-1 text-semantic-foreground">
                        {role.roleName}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setManageTarget(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface UserCardProps {
  user: RbacUser;
  isSelf: boolean;
  onManageRoles: () => void;
}

const UserCard = ({ user, isSelf, onManageRoles }: UserCardProps) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="shrink-0">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <FaUserCircle className="w-12 h-12 text-semantic-foreground/20" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-body-1 font-semibold text-semantic-foreground truncate">
            {user.name}
          </p>
          <p className="text-body-2 text-semantic-foreground/60 truncate">
            {user.email}
          </p>

          {(user.roles?.length ?? 0) > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {user.roles?.map((role) => (
                <span
                  key={role.id}
                  className="text-xs bg-brand-primary-1/10 text-brand-primary-1 px-2 py-0.5 rounded-full font-medium"
                >
                  {role.roleName}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-body-2 text-semantic-foreground/40 mt-1 italic">
              No roles assigned
            </p>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onManageRoles}
          disabled={isSelf}
          className="shrink-0"
          title={isSelf ? "You cannot change your own roles" : undefined}
        >
          Manage Roles
        </Button>
      </CardContent>
    </Card>
  );
};

export default RbacUsersPage;
