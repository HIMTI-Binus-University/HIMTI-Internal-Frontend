import { useState } from "react";
import { UserRound } from "lucide-react";
import { useParams } from "react-router-dom";

import { useGetMe } from "@/api/auth/queries";
import { useGetRoles, useGetUser } from "@/api/rbac/queries";
import { Container, PageLayout } from "@/components/Utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAssignUserRole, useRemoveUserRole } from "@/hooks/rbac/users";
import type { UserStatus } from "@/types/rbac";

const DetailPage = () => {
  const { userId = "" } = useParams();
  const { data: user, isLoading, isError, refetch } = useGetUser(userId);
  const { data: me } = useGetMe();
  const canManageRoles = me?.permissions.includes("manage_roles") ?? false;
  const { data: roles = [] } = useGetRoles(canManageRoles);
  const assignRole = useAssignUserRole();
  const removeRole = useRemoveUserRole();
  const [pendingRoles, setPendingRoles] = useState<Set<string>>(new Set());
  const [roleMessage, setRoleMessage] = useState("");

  if (isError) {
    return (
      <PageLayout icon={UserRound} title="User detail" backTo="/rbac/users">
        <Container>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-semantic-danger">
              This user could not be loaded.
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        </Container>
      </PageLayout>
    );
  }

  if (isLoading || !user) {
    return (
      <PageLayout icon={UserRound} title="User detail" backTo="/rbac/users">
        <Container>
          <p className="text-sm text-muted-foreground">Loading user...</p>
        </Container>
      </PageLayout>
    );
  }

  const toggleRole = (roleId: string, assigned: boolean) => {
    if (pendingRoles.has(roleId)) return;
    setRoleMessage("");
    setPendingRoles((current) => new Set(current).add(roleId));
    (assigned ? removeRole : assignRole).mutate(
      { userId: user.id, roleId },
      {
        onError: () => setRoleMessage("This role could not be updated."),
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
    <PageLayout icon={UserRound} title={user.name} backTo="/rbac/users">
      <Container>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar className="h-14 w-14 border border-semantic-info-border">
              {user.image && <AvatarImage src={user.image} alt="" />}
              <AvatarFallback className="bg-semantic-info-background font-semibold text-semantic-info">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold text-foreground">
                {user.name}
              </h2>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={statusVariant(user.status)}>{formatEnum(user.status)}</Badge>
            <Badge variant={user.registrationCompletedAt ? "success" : "warning"}>
              {user.registrationCompletedAt ? "Registration complete" : "Registration incomplete"}
            </Badge>
          </div>
        </div>
      </Container>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <div className="space-y-6">
          <DetailSection title="Identity and contact">
            <DetailItem label="Full name" value={user.name} />
            <DetailItem
              label="Personal email"
              value={user.email}
              badge={user.emailVerified ? "Verified" : "Unverified"}
              badgeVariant={user.emailVerified ? "success" : "warning"}
            />
            <DetailItem
              label="Outlook email"
              value={user.outlookEmail}
              badge={
                user.outlookEmail
                  ? user.outlookEmailVerified
                    ? "Verified"
                    : "Unverified"
                  : undefined
              }
              badgeVariant={user.outlookEmailVerified ? "success" : "warning"}
            />
            <DetailItem label="Phone number" value={user.phoneNumber} />
            <DetailItem label="LINE ID" value={user.lineId} />
            <DetailItem label="Profile image URL" value={user.image} breakAll />
          </DetailSection>

          <DetailSection title="Membership">
            <DetailItem label="Member type" value={formatOptionalEnum(user.memberType)} />
            <DetailItem
              label="Institution type"
              value={formatOptionalEnum(user.institutionType)}
            />
            <DetailItem
              label="University"
              value={user.university?.name || user.universityName}
            />
            <DetailItem
              label="Study program"
              value={user.studyProgram?.name || user.studyProgramName}
            />
            <DetailItem
              label="BINUS region"
              value={user.region?.shortName || user.region?.name}
            />
            <DetailItem label="Student ID / NIM" value={user.nim} />
            <DetailItem label="Graduation batch" value={user.graduateBatch} />
            <DetailItem label="Department" value={user.department} />
            <DetailItem label="Affiliation" value={user.affiliation} />
          </DetailSection>
        </div>

        <div className="space-y-6">
          <Container>
            <h2 className="font-semibold">Roles</h2>
            {canManageRoles ? (
              roles.length ? (
                <div className="mt-3 space-y-1">
                  {roles.map((role) => {
                    const assigned = user.roles.some((item) => item.id === role.id);
                    const disabled = user.id === me?.id || pendingRoles.has(role.id);
                    return (
                      <label
                        key={role.id}
                        className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm transition-colors hover:bg-muted has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
                      >
                        <Checkbox
                          checked={assigned}
                          disabled={disabled}
                          onCheckedChange={() => toggleRole(role.id, assigned)}
                        />
                        {role.roleName}
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No roles available.</p>
              )
            ) : user.roles.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {user.roles.map((role) => <Badge key={role.id} variant="info">{role.roleName}</Badge>)}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No roles assigned.</p>
            )}
            {user.id === me?.id && canManageRoles && (
              <p className="mt-3 text-xs text-muted-foreground">
                You cannot change your own roles.
              </p>
            )}
            {roleMessage && (
              <p role="status" className="mt-3 text-sm text-semantic-danger">
                {roleMessage}
              </p>
            )}
          </Container>

          <Container>
            <h2 className="font-semibold">Permissions</h2>
            {user.permissions.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {user.permissions.map((permission) => (
                  <Badge key={permission.id} variant="neutral">
                    {permission.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No effective permissions.
              </p>
            )}
          </Container>

          <Container>
            <h2 className="font-semibold">Metadata</h2>
            <dl className="mt-3 space-y-4 text-sm">
              <Metadata label="User ID" value={user.id} mono />
              <Metadata label="Created" value={formatDate(user.createdAt)} />
              <Metadata label="Updated" value={formatDate(user.updatedAt)} />
              <Metadata
                label="Registration completed"
                value={formatDate(user.registrationCompletedAt)}
              />
              <Metadata label="Created by" value={user.createdBy} mono />
              <Metadata label="Updated by" value={user.updatedBy} mono />
            </dl>
          </Container>
        </div>
      </div>
    </PageLayout>
  );
};

const DetailSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Container>
    <h2 className="font-semibold">{title}</h2>
    <dl className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2">{children}</dl>
  </Container>
);

const DetailItem = ({
  label,
  value,
  badge,
  badgeVariant,
  breakAll = false,
}: {
  label: string;
  value: string | null | undefined;
  badge?: string;
  badgeVariant?: "success" | "warning";
  breakAll?: boolean;
}) => (
  <div>
    <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
    <dd className={`mt-1 flex flex-wrap items-center gap-2 text-sm font-medium ${breakAll ? "break-all" : ""}`}>
      {value || "-"}
      {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
    </dd>
  </div>
);

const Metadata = ({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) => (
  <div>
    <dt className="text-muted-foreground">{label}</dt>
    <dd className={`mt-0.5 break-all ${mono ? "font-mono text-xs" : ""}`}>
      {value || "-"}
    </dd>
  </div>
);

const statusVariant = (status: UserStatus) =>
  status === "ACTIVE" ? "success" : status === "SUSPENDED" ? "danger" : "neutral";

const formatOptionalEnum = (value: string | null) => (value ? formatEnum(value) : "-");

const formatEnum = (value: string) => {
  if (value === "BINUS") return "BINUS";
  if (value === "NON_BINUS") return "Non-BINUS";
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString() : "-";

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export default DetailPage;
