import { useState } from "react";
import { Download, Search, Users } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { useGetMe } from "@/api/auth/queries";
import {
  exportUsers,
  useGetRegistrationOptions,
  useGetRoles,
  useGetUsers,
  useGetUserSummary,
} from "@/api/rbac/queries";
import { Container, PageLayout, PaginationFooter } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAssignUserRole, useRemoveUserRole } from "@/hooks/rbac/users";
import type {
  InstitutionType,
  MemberType,
  RbacUserListItem,
  RbacUserListParams,
  UserStatus,
} from "@/types/rbac";

const PAGE_SIZE = 20;
const text = (value: string | null | undefined) => value || "-";
const date = (value: string | null) =>
  value ? new Date(value).toLocaleDateString() : "-";

const UsersPage = () => {
  const [params, setParams] = useSearchParams();
  const [target, setTarget] = useState<RbacUserListItem | null>(null);
  const [pendingRoles, setPendingRoles] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");

  const filters: RbacUserListParams = {
    page: Number(params.get("page")) || 1,
    limit: PAGE_SIZE,
    search: params.get("search") || undefined,
    sort: params.get("sort") || undefined,
    status: (params.get("status") as UserStatus) || undefined,
    memberType: (params.get("memberType") as MemberType) || undefined,
    institutionType:
      (params.get("institutionType") as InstitutionType) || undefined,
    regionId: params.get("regionId") || undefined,
    verification: booleanParam(params.get("verification")),
    completed: booleanParam(params.get("completed")),
  };

  const { data, isLoading, isError } = useGetUsers(filters);
  const { data: summary } = useGetUserSummary(filters);
  const { data: options } = useGetRegistrationOptions();
  const { data: me } = useGetMe();
  const canManageRoles = me?.permissions.includes("manage_roles") ?? false;
  const { data: roles = [] } = useGetRoles(canManageRoles);
  const assignRole = useAssignUserRole();
  const removeRole = useRemoveUserRole();
  const users = data?.data ?? [];
  const meta = data?.meta;
  const liveTarget = target
    ? users.find((user) => user.id === target.id) ?? target
    : null;

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  };

  const handleExport = async () => {
    setExporting(true);
    setMessage("");
    try {
      const exportFilters = { ...filters };
      delete exportFilters.page;
      delete exportFilters.limit;
      const response = await exportUsers(exportFilters);
      const disposition = response.headers["content-disposition"];
      const filename = disposition?.match(/filename="?([^";]+)"?/i)?.[1];
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "users.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage("Filtered users exported.");
    } catch {
      setMessage("Could not export users.");
    } finally {
      setExporting(false);
    }
  };

  const toggleRole = (roleId: string, assigned: boolean) => {
    if (!target || pendingRoles.has(roleId)) return;
    setMessage("");
    setPendingRoles((current) => new Set(current).add(roleId));
    (assigned ? removeRole : assignRole).mutate(
      { userId: target.id, roleId },
      {
        onError: () => setMessage("Could not update this user's roles."),
        onSettled: () =>
          setPendingRoles((current) => {
            const next = new Set(current);
            next.delete(roleId);
            return next;
          }),
      },
    );
  };

  return (
    <PageLayout
      icon={Users}
      title="Users"
      actions={
        <Button
          size="sm"
          variant="outline"
          onClick={handleExport}
          disabled={exporting}
        >
          <Download className="mr-2 h-4 w-4" />
          {exporting ? "Exporting..." : "Export CSV"}
        </Button>
      }
    >
      <section
        aria-label="User summary"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <Summary label="Total registrations" value={summary?.total} />
        <Summary label="Registered today" value={summary?.today} />
        <Summary
          label="Unverified BINUS"
          value={summary?.unverifiedOutlookEmail}
        />
        <Summary
          label="By member type"
          value={
            summary &&
            Object.entries(summary.byMemberType)
              .map(([key, value]) => `${key}: ${value}`)
              .join(" · ")
          }
        />
      </section>

      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}

      <Container padding="none" className="overflow-hidden">
        <div className="border-b p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <label className="relative">
              <span className="sr-only">Search users</span>
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                type="search"
                placeholder="Search name, email, NIM, or phone"
                value={params.get("search") ?? ""}
                onChange={(event) => updateFilter("search", event.target.value)}
              />
            </label>
            <FilterSelect
              label="BINUS region"
              value={params.get("regionId") ?? ""}
              onChange={(value) => updateFilter("regionId", value)}
              options={
                options?.binusRegions.map((region) => ({
                  value: region.id,
                  label: region.shortName || region.name,
                })) ?? []
              }
            />
            <FilterSelect
              label="Sort"
              value={params.get("sort") ?? ""}
              onChange={(value) => updateFilter("sort", value)}
              options={[
                { value: "createdAt:desc", label: "Newest first" },
                { value: "createdAt:asc", label: "Oldest first" },
                { value: "name:asc", label: "Name A-Z" },
                { value: "name:desc", label: "Name Z-A" },
              ]}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
            <FilterSelect
              label="Member type"
              value={params.get("memberType") ?? ""}
              onChange={(value) => updateFilter("memberType", value)}
              options={enumOptions(["STUDENT", "LECTURER", "OTHER"])}
            />
            <FilterSelect
              label="Institution"
              value={params.get("institutionType") ?? ""}
              onChange={(value) => updateFilter("institutionType", value)}
              options={enumOptions(["BINUS", "NON_BINUS"])}
            />
            <FilterSelect
              label="Outlook verification"
              value={params.get("verification") ?? ""}
              onChange={(value) => updateFilter("verification", value)}
              options={[
                { value: "true", label: "Verified" },
                { value: "false", label: "Unverified" },
              ]}
            />
            <FilterSelect
              label="Status"
              value={params.get("status") ?? ""}
              onChange={(value) => updateFilter("status", value)}
              options={enumOptions(["ACTIVE", "INACTIVE", "SUSPENDED"])}
            />
            <FilterSelect
              label="Registration"
              value={params.get("completed") ?? ""}
              onChange={(value) => updateFilter("completed", value)}
              options={[
                { value: "true", label: "Completed" },
                { value: "false", label: "Incomplete" },
              ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1900px] text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                {[
                  "Name",
                  "Membership path",
                  "Personal email",
                  "Outlook email",
                  "Phone / LINE",
                  "NIM",
                  "University",
                  "Study program / department / affiliation",
                  "Region",
                  "Batch",
                  "Registration",
                  "Status",
                  "Roles",
                  "Created",
                  ...(canManageRoles ? ["Actions"] : []),
                ].map((heading) => (
                  <th key={heading} scope="col" className="px-3 py-2">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/35">
                  <td className="px-3 py-2">
                    <Link
                      className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      to={`/rbac/users/${user.id}`}
                    >
                      {user.name}
                    </Link>
                    <span className="mt-0.5 block max-w-48 truncate font-mono text-xs text-muted-foreground">
                      {user.id}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {text(user.memberType)} / {text(user.institutionType)}
                  </td>
                  <td className="px-3 py-2">
                    {user.email}
                    <Verification verified={user.emailVerified} />
                  </td>
                  <td className="px-3 py-2">
                    {text(user.outlookEmail)}
                    {user.outlookEmail && (
                      <Verification verified={user.outlookEmailVerified} />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {text(user.phoneNumber)}
                    {user.lineId && (
                      <span className="block text-xs text-muted-foreground">
                        LINE: {user.lineId}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">{text(user.nim)}</td>
                  <td className="px-3 py-2">
                    {text(user.university?.name || user.universityName)}
                  </td>
                  <td className="px-3 py-2">
                    {text(
                      user.studyProgram?.name ||
                        user.studyProgramName ||
                        user.department ||
                        user.affiliation,
                    )}
                  </td>
                  <td className="px-3 py-2">{text(user.region?.name)}</td>
                  <td className="px-3 py-2">{text(user.graduateBatch)}</td>
                  <td className="px-3 py-2">
                    {user.registrationCompletedAt ? "Completed" : "Incomplete"}
                    <span className="block text-xs text-muted-foreground">
                      {date(user.registrationCompletedAt)}
                    </span>
                  </td>
                  <td className="px-3 py-2">{user.status}</td>
                  <td className="px-3 py-2">
                    <div className="flex max-w-64 flex-wrap gap-1">
                      {user.roles.length
                        ? user.roles.map((role) => (
                            <span
                              key={role.id}
                              className="rounded-md border border-semantic-info-border bg-semantic-info-background px-2 py-0.5 text-xs text-semantic-info"
                            >
                              {role.roleName}
                            </span>
                          ))
                        : "-"}
                    </div>
                  </td>
                  <td className="px-3 py-2">{date(user.createdAt)}</td>
                  {canManageRoles && (
                    <td className="px-3 py-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={user.id === me?.id}
                        title={
                          user.id === me?.id
                            ? "You cannot change your own roles"
                            : undefined
                        }
                        onClick={() => setTarget(user)}
                      >
                        Manage roles
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div aria-live="polite">
          {isLoading && (
            <p className="p-6 text-sm text-muted-foreground">Loading users...</p>
          )}
          {isError && (
            <p className="p-6 text-sm text-semantic-danger">
              Could not load users.
            </p>
          )}
          {!isLoading && !isError && !users.length && (
            <p className="p-6 text-sm text-muted-foreground">
              No users match these filters.
            </p>
          )}
        </div>
        {meta && meta.totalPages > 1 && (
          <div className="border-t p-4">
            <PaginationFooter
              label={`Page ${meta.page} of ${meta.totalPages} · ${meta.totalRecords} users`}
              page={meta.page}
              totalPages={meta.totalPages}
              onPrevious={() => updateFilter("page", String(meta.page - 1))}
              onNext={() => updateFilter("page", String(meta.page + 1))}
            />
          </div>
        )}
      </Container>

      {canManageRoles && (
        <Dialog open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage roles</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {liveTarget?.name} · {liveTarget?.email}
              </p>
            </DialogHeader>
            <div className="space-y-1 py-2">
              {roles.map((role) => {
                const assigned =
                  liveTarget?.roles.some((item) => item.id === role.id) ?? false;
                return (
                  <label
                    key={role.id}
                    className="flex min-h-10 items-center gap-3 rounded-lg px-2 hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      checked={assigned}
                      disabled={pendingRoles.has(role.id)}
                      onChange={() => toggleRole(role.id, assigned)}
                    />
                    {role.roleName}
                  </label>
                );
              })}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTarget(null)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </PageLayout>
  );
};

const FilterSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) => (
  <label className="text-xs font-medium text-muted-foreground">
    {label}
    <select
      className="mt-1 h-9 w-full rounded-lg border border-input bg-card px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">All</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const Verification = ({ verified }: { verified: boolean }) => (
  <span className="block text-xs text-muted-foreground">
    {verified ? "Verified" : "Unverified"}
  </span>
);

const Summary = ({
  label,
  value,
}: {
  label: string;
  value?: number | string;
}) => (
  <Container padding="compact">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <p className="mt-1 truncate text-xl font-semibold">{value ?? "-"}</p>
  </Container>
);

const booleanParam = (value: string | null) =>
  value === "true" ? true : value === "false" ? false : undefined;

const enumOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value.replaceAll("_", " ") }));

export default UsersPage;
