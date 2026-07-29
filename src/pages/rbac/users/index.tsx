import { useState } from "react";
import {
  ChevronRight,
  Download,
  Filter,
  Search,
  Users,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import {
  exportUsers,
  useGetRegistrationOptions,
  useGetUsers,
} from "@/api/rbac/queries";
import {
  Container,
  EmptyState,
  PageLayout,
  PaginationFooter,
} from "@/components/Utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  InstitutionType,
  MemberType,
  RbacUserListItem,
  RbacUserListParams,
  UserStatus,
} from "@/types/rbac";

const PAGE_SIZE = 20;
const ALL = "all";
const advancedFilterKeys = [
  "memberType",
  "institutionType",
  "regionId",
  "verification",
  "completed",
] as const;

const UsersPage = () => {
  const [params, setParams] = useSearchParams();
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

  const { data, isLoading, isError, refetch } = useGetUsers(filters);
  const { data: options } = useGetRegistrationOptions();
  const users = data?.data ?? [];
  const meta = data?.meta;
  const activeAdvancedFilters = advancedFilterKeys.filter((key) =>
    params.has(key),
  ).length;
  const hasFilters =
    !!params.get("search") || !!params.get("status") || activeAdvancedFilters > 0;

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== ALL) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    const sort = params.get("sort");
    if (sort) next.set("sort", sort);
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

  const totalRecords = meta?.totalRecords ?? 0;
  const pageStart = totalRecords ? ((meta?.page ?? 1) - 1) * PAGE_SIZE + 1 : 0;
  const pageEnd = Math.min((meta?.page ?? 1) * PAGE_SIZE, totalRecords);

  return (
    <PageLayout
      icon={Users}
       title="Users"
       actions={
        <Button size="sm" onClick={handleExport} disabled={exporting}>
          <Download />
          <span className="max-sm:sr-only">
            {exporting ? "Exporting..." : "Export CSV"}
          </span>
        </Button>
      }
    >
      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}

       <Container padding="none" className="overflow-hidden">
         <div className="border-b border-border px-4 pt-4">
           <h2 className="text-lg font-semibold leading-7 tracking-tight text-foreground">
             Users
           </h2>
           <p className="mt-1 pb-4 text-sm text-muted-foreground">
             View and manage workspace members.
           </p>
         </div>
         <div className="border-b border-border p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1">
              <Label className="mb-1.5 block text-xs font-medium text-muted-foreground" htmlFor="user-search">
                Search
              </Label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground/70"
                />
                <Input
                  id="user-search"
                  className="pl-10 placeholder:text-muted-foreground/55"
                  type="search"
                  placeholder="Search by name, email, NIM, or phone"
                  value={params.get("search") ?? ""}
                  onChange={(event) => updateFilter("search", event.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <FilterSelect
                id="user-sort"
                label="Sort"
                className="sm:w-44"
                value={params.get("sort") ?? "createdAt:desc"}
                onChange={(value) => updateFilter("sort", value)}
                options={[
                  { value: "createdAt:desc", label: "Newest first" },
                  { value: "createdAt:asc", label: "Oldest first" },
                  { value: "name:asc", label: "Name A-Z" },
                  { value: "name:desc", label: "Name Z-A" },
                ]}
                includeAll={false}
              />
              <FilterSelect
                id="user-status"
                label="Status"
                className="sm:w-44"
                value={params.get("status") ?? ALL}
                onChange={(value) => updateFilter("status", value)}
                options={enumOptions(["ACTIVE", "INACTIVE", "SUSPENDED"])}
              />

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="col-span-2 self-end sm:col-span-1">
                    <Filter />
                    Filters
                    {activeAdvancedFilters > 0 && (
                      <span className="rounded-full bg-primary px-1.5 py-0.5 text-[11px] leading-none text-primary-foreground">
                        {activeAdvancedFilters}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-[min(22rem,calc(100vw-2rem))] space-y-4"
                >
                  <div>
                    <p className="font-semibold">Filter users</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Narrow results by membership and account state.
                    </p>
                  </div>
                  <FilterSelect
                    id="member-type"
                    label="Member type"
                    value={params.get("memberType") ?? ALL}
                    onChange={(value) => updateFilter("memberType", value)}
                    options={enumOptions(["STUDENT", "LECTURER", "OTHER"])}
                  />
                  <FilterSelect
                    id="institution-type"
                    label="Institution"
                    value={params.get("institutionType") ?? ALL}
                    onChange={(value) => updateFilter("institutionType", value)}
                    options={enumOptions(["BINUS", "NON_BINUS"])}
                  />
                  <FilterSelect
                    id="binus-region"
                    label="BINUS region"
                    value={params.get("regionId") ?? ALL}
                    onChange={(value) => updateFilter("regionId", value)}
                    options={
                      options?.binusRegions.map((region) => ({
                        value: region.id,
                        label: region.shortName || region.name,
                      })) ?? []
                    }
                  />
                  <FilterSelect
                    id="outlook-verification"
                    label="Outlook verification"
                    value={params.get("verification") ?? ALL}
                    onChange={(value) => updateFilter("verification", value)}
                    options={[
                      { value: "true", label: "Verified" },
                      { value: "false", label: "Unverified" },
                    ]}
                  />
                  <FilterSelect
                    id="registration-status"
                    label="Registration"
                    value={params.get("completed") ?? ALL}
                    onChange={(value) => updateFilter("completed", value)}
                    options={[
                      { value: "true", label: "Completed" },
                      { value: "false", label: "Incomplete" },
                    ]}
                  />
                  {activeAdvancedFilters > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-foreground">
                {isLoading
                  ? "Loading users..."
                  : `${totalRecords} ${hasFilters ? "matching " : ""}users`}
              </p>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {!isLoading && !isError && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left text-sm md:table-auto">
              <caption className="sr-only">
                Users matching the current search and filters
              </caption>
              <thead className="border-b border-border bg-muted/45 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th scope="col" className="w-[42%] px-4 py-3 md:w-auto">
                    User
                  </th>
                  <th scope="col" className="hidden px-4 py-3 md:table-cell">
                    Membership
                  </th>
                  <th scope="col" className="w-[40%] px-3 py-3 md:w-auto">
                    Account state
                  </th>
                  <th scope="col" className="hidden px-4 py-3 md:table-cell">
                    Status
                  </th>
                  <th scope="col" className="hidden px-4 py-3 lg:table-cell">
                    Roles
                  </th>
                  <th scope="col" className="w-12 px-2 py-3 sm:w-28">
                    <span className="sr-only sm:not-sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div aria-live="polite">
          {isLoading && (
            <p className="p-6 text-sm text-muted-foreground">Loading users...</p>
          )}
          {isError && (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <p className="text-sm text-semantic-danger">
                Users could not be loaded.
              </p>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          )}
          {!isLoading && !isError && !users.length && (
            <div className="p-4">
              <EmptyState
                icon={Users}
                title="No users found"
                description={
                  hasFilters
                    ? "Try adjusting your search or filters."
                    : "Users will appear here after they register."
                }
              />
            </div>
          )}
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="border-t border-border p-4">
            <PaginationFooter
              label={`Showing ${pageStart}-${pageEnd} of ${totalRecords} users`}
              page={meta.page}
              totalPages={meta.totalPages}
              onPageChange={(nextPage) => updateFilter("page", String(nextPage))}
            />
          </div>
        )}
      </Container>
    </PageLayout>
  );
};

const UserRow = ({ user }: { user: RbacUserListItem }) => {
  const verification = getVerification(user);

  return (
    <tr className="group transition-colors hover:bg-muted/35 focus-within:bg-muted/35">
      <th scope="row" className="px-4 py-3 font-normal">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-9 w-9 border border-semantic-info-border">
            {user.image && <AvatarImage src={user.image} alt="" />}
            <AvatarFallback className="bg-semantic-info-background text-xs font-semibold text-semantic-info">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Link
              className="block truncate font-semibold text-foreground hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              to={`/rbac/users/${user.id}`}
            >
              {user.name}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </th>
      <td className="hidden px-4 py-3 md:table-cell">
        <Badge variant={user.memberType ? "info" : "neutral"}>
          {user.memberType ? formatEnum(user.memberType) : "Not set"}
        </Badge>
        <p className="mt-1.5 max-w-52 truncate text-xs text-muted-foreground">
          {membershipContext(user)}
        </p>
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-col items-start gap-1.5">
          <Badge variant={user.registrationCompletedAt ? "success" : "warning"}>
            {user.registrationCompletedAt ? "Registered" : "Incomplete"}
          </Badge>
          <Badge variant={verification.verified ? "success" : "warning"}>
            {verification.label}
          </Badge>
        </div>
      </td>
      <td className="hidden px-4 py-3 md:table-cell">
        <Badge variant={statusVariant(user.status)}>{formatEnum(user.status)}</Badge>
      </td>
      <td className="hidden px-4 py-3 lg:table-cell">
        {user.roles.length ? (
          <div className="flex items-center gap-1.5">
            <Badge variant="neutral" className="max-w-36 truncate">
              {user.roles[0].roleName}
            </Badge>
            {user.roles.length > 1 && (
              <span className="text-xs font-medium text-muted-foreground">
                +{user.roles.length - 1}
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </td>
      <td className="px-2 py-3 sm:px-4">
        <Button
          asChild
          size="sm"
          variant="secondary"
          className="px-2 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:group-focus-within:opacity-100 sm:px-3"
        >
          <Link to={`/rbac/users/${user.id}`} aria-label={`View details for ${user.name}`}>
            <span className="max-sm:sr-only">Details</span>
            <ChevronRight />
          </Link>
        </Button>
      </td>
    </tr>
  );
};

const FilterSelect = ({
  id,
  label,
  value,
  options,
  onChange,
  className,
  includeAll = true,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
  includeAll?: boolean;
}) => (
  <div className={className}>
    <Label className="mb-1.5 text-xs" htmlFor={id}>
      {label}
    </Label>
    <Select
      items={[
        ...(includeAll ? [{ value: ALL, label: `All ${label.toLowerCase()}` }] : []),
        ...options,
      ]}
      value={value}
      onValueChange={(next) => next && onChange(next)}
    >
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {includeAll && <SelectItem value={ALL}>All {label.toLowerCase()}</SelectItem>}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const getVerification = (user: RbacUserListItem) => {
  if (user.institutionType === "BINUS") {
    if (!user.outlookEmail) return { verified: false, label: "Outlook missing" };
    return {
      verified: user.outlookEmailVerified,
      label: user.outlookEmailVerified ? "Outlook verified" : "Outlook unverified",
    };
  }
  return {
    verified: user.emailVerified,
    label: user.emailVerified ? "Email verified" : "Email unverified",
  };
};

const membershipContext = (user: RbacUserListItem) => {
  if (!user.institutionType) return "Institution not set";
  if (user.institutionType === "BINUS") {
    return ["BINUS", user.region?.shortName || user.region?.name]
      .filter(Boolean)
      .join(" · ");
  }
  return user.universityName || "Non-BINUS";
};

const statusVariant = (status: UserStatus) =>
  status === "ACTIVE" ? "success" : status === "SUSPENDED" ? "danger" : "neutral";

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const booleanParam = (value: string | null) =>
  value === "true" ? true : value === "false" ? false : undefined;

const formatEnum = (value: string) => {
  if (value === "BINUS") return "BINUS";
  if (value === "NON_BINUS") return "Non-BINUS";
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const enumOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: formatEnum(value) }));

export default UsersPage;
