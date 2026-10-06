import { Search, UserPlus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useGetUsers } from "@/api/rbac/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Organizer, OrganizerRole } from "@/types/events";

export function OrganizerManager({
  organizers,
  isLoading,
  isError,
  canSearchUsers,
  isAdding,
  addError,
  onAdd,
}: {
  organizers: Organizer[];
  isLoading: boolean;
  isError: boolean;
  canSearchUsers: boolean;
  isAdding: boolean;
  addError: boolean;
  onAdd: (userId: string, role: OrganizerRole, done: () => void) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<OrganizerRole>("ORGANIZER");
  const users = useGetUsers(
    {
      page: 1,
      limit: 20,
      search: debouncedSearch || undefined,
      status: "ACTIVE",
    },
    canSearchUsers && open,
  );

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  const existingIds = useMemo(
    () => new Set(organizers.map((organizer) => organizer.userId)),
    [organizers],
  );
  const candidates =
    users.data?.data.filter((user) => !existingIds.has(user.id)) ?? [];
  const close = () => {
    setOpen(false);
    setSearch("");
    setUserId("");
    setRole("ORGANIZER");
  };

  return (
    <section aria-labelledby="organizers-heading">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2
            id="organizers-heading"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </span>
            Organizers
          </h2>
          <p className="ml-11 mt-1 text-sm text-muted-foreground">
            {organizers.length} organizer{organizers.length === 1 ? "" : "s"}
          </p>
        </div>
        {canSearchUsers && (
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            <UserPlus /> Add
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading organizers...</p>
      ) : isError ? (
        <p role="alert" className="text-sm text-semantic-danger">
          Organizers could not be loaded.
        </p>
      ) : organizers.length ? (
        <ul className="overflow-hidden rounded-lg border border-border bg-background divide-y divide-border">
          {organizers.map((organizer) => (
            <li
              key={organizer.userId}
              className="flex min-w-0 items-center gap-3 px-4 py-3.5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {(organizer.user?.name || "U").slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {organizer.user?.name || "Unknown user"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {organizer.user?.email || organizer.userId}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                {organizer.role === "MANAGER" ? "Manager" : "Organizer"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No organizers listed.</p>
      )}

      {!canSearchUsers && (
        <p className="mt-3 text-xs text-muted-foreground">
          Adding organizers requires user-directory access (`manage_users`).
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add organizer</DialogTitle>
            <DialogDescription>
              Select an active HIMTI Internal user and assign their role.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (userId) onAdd(userId, role, close);
            }}
          >
            <div>
              <Label htmlFor="organizer-search" className="mb-2">
                Find active user
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="organizer-search"
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
              <Label id="organizer-role-label" className="mb-2">
                Role
              </Label>
              <div
                role="radiogroup"
                aria-labelledby="organizer-role-label"
                className="grid gap-2 sm:grid-cols-2"
              >
                {(
                  [
                    {
                      value: "MANAGER",
                      label: "Manager",
                      description: "Can manage details and organizers",
                    },
                    {
                      value: "ORGANIZER",
                      label: "Organizer",
                      description: "Can work within assigned access",
                    },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={role === option.value}
                    onClick={() => setRole(option.value)}
                    className={`rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${role === option.value ? "border-primary bg-primary/10 text-primary" : "border-input bg-card hover:bg-muted"}`}
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
            {addError && (
              <p role="alert" className="text-sm text-semantic-danger">
                Could not add this user. They may already be an organizer.
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" disabled={!userId || isAdding}>
                {isAdding ? "Adding..." : "Add organizer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
