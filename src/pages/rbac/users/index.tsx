import { useEffect, useState } from "react";

import { PageLayout, Container, ContainerHeader } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CircleUserRound, Search, Users } from "lucide-react";

import { useGetUsers, useGetRoles } from "@/api/rbac/queries";
import { useAssignUserRole, useRemoveUserRole } from "@/hooks/rbac/users";
import { authClient } from "@/utils/auth-client";
import type { RbacUser } from "@/types/rbac";

const USERS_PER_PAGE = 10;

const RbacUsersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Manage roles dialog state
  const [manageTarget, setManageTarget] = useState<RbacUser | null>(null);
  const [pendingRoles, setPendingRoles] = useState<Set<string>>(new Set());

  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  const { data: usersData, isLoading } = useGetUsers({
    page: currentPage,
    limit: USERS_PER_PAGE,
    search: debouncedSearchQuery,
  });
  const { data: allRoles = [] } = useGetRoles();

  const assignUserRole = useAssignUserRole();
  const removeUserRole = useRemoveUserRole();

  const users = usersData?.data ?? [];
  const paginationMeta = usersData?.meta;
  const totalPages = paginationMeta?.totalPages ?? 1;
  const totalRecords = paginationMeta?.totalRecords ?? 0;
  const pageStart =
    totalRecords === 0
      ? 0
      : ((paginationMeta?.page ?? currentPage) - 1) * USERS_PER_PAGE + 1;
  const pageEnd = Math.min(
    (paginationMeta?.page ?? currentPage) * USERS_PER_PAGE,
    totalRecords,
  );

  useEffect(() => {
    if (
      paginationMeta &&
      paginationMeta.totalPages > 0 &&
      currentPage > paginationMeta.totalPages
    ) {
      setCurrentPage(paginationMeta.totalPages);
    }
  }, [currentPage, paginationMeta]);

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
    <PageLayout icon={Users} title="Users">

        {/* Users grid */}
        <Container>
          <ContainerHeader>
            {debouncedSearchQuery
              ? `Results for "${debouncedSearchQuery}" (${totalRecords})`
              : `All Users (${totalRecords})`}
          </ContainerHeader>

          <div className="relative mb-5 w-full">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 stroke-[1.75] text-muted-foreground"
            />
            <Input
              id="userSearch"
              type="text"
              placeholder="Search by name, email, or NIM..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>

          {isLoading && (
            <p className="text-sm text-muted-foreground">
              Loading users...
            </p>
          )}

          {!isLoading && users.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {debouncedSearchQuery
                ? "No users match your search."
                : "No users found."}
            </p>
          )}

          <div className="-mx-5 divide-y divide-border border-y border-border">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isSelf={user.id === currentUserId}
                onManageRoles={() => openManageDialog(user)}
              />
            ))}
          </div>

          {!isLoading && users.length > 0 && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {pageStart}-{pageEnd} of {totalRecords} users
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(page - 1, 1))
                  }
                >
                  Previous
                </Button>
                <span className="px-2 text-sm text-muted-foreground">
                  Page {paginationMeta?.page ?? currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(page + 1, totalPages))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Container>

      {/* Manage roles dialog */}
      <Dialog
        open={!!manageTarget}
        onOpenChange={(open) => !open && setManageTarget(null)}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Manage Roles</DialogTitle>
            {liveManageTarget && (
              <p className="mt-1 text-sm text-muted-foreground">
                {liveManageTarget.name} · {liveManageTarget.email}
              </p>
            )}
          </DialogHeader>

          <div className="py-2">
            {allRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No roles available.
              </p>
            ) : (
              <div className="flex max-h-64 flex-col gap-1 overflow-y-auto rounded-lg border border-border p-2">
                {allRoles.map((role) => {
                  const isAssigned =
                    liveManageTarget?.roles?.some((r) => r.roleName === role.roleName) ?? false;
                  const isPending = pendingRoles.has(role.id);
                  return (
                    <label
                      key={role.id}
                      className={`flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted ${isPending ? "opacity-50" : ""}`}
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
                      <span className="text-sm text-foreground">
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
    </PageLayout>
  );
};

interface UserCardProps {
  user: RbacUser;
  isSelf: boolean;
  onManageRoles: () => void;
}

const UserCard = ({ user, isSelf, onManageRoles }: UserCardProps) => {
  return (
    <article className="flex min-h-16 w-full items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/35">
        <div className="shrink-0">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <CircleUserRound className="h-10 w-10 stroke-[1.5] text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {user.name} {isSelf ? "(You)" : ""}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {user.email}
          </p>

          {(user.roles?.length ?? 0) > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {user.roles?.map((role) => (
                <span
                  key={role.id}
                  className="rounded-md border border-semantic-info-border bg-semantic-info-background px-2 py-0.5 text-xs font-medium text-semantic-info"
                >
                  {role.roleName}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm italic text-muted-foreground">
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
    </article>
  );
};

export default RbacUsersPage;
