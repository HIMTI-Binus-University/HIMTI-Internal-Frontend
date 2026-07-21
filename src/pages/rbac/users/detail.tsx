import { FormEvent, useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { useParams } from "react-router-dom";

import { useGetMe } from "@/api/auth/queries";
import {
  useGetRegistrationOptions,
  useGetRoles,
  useGetUser,
  useResendUserVerification,
  useUpdateUser,
} from "@/api/rbac/queries";
import { Container, PageLayout } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAssignUserRole, useRemoveUserRole } from "@/hooks/rbac/users";
import type {
  InstitutionType,
  MemberType,
  RbacUserDetail,
  RegistrationOption,
  UserStatus,
} from "@/types/rbac";
import { buildUserUpdate, type UserFormState } from "./form";

const DetailPage = () => {
  const { userId = "" } = useParams();
  const { data: user, isLoading, isError } = useGetUser(userId);
  const { data: options, isError: optionsError } = useGetRegistrationOptions();
  const { data: me } = useGetMe();
  const canManageRoles = me?.permissions.includes("manage_roles") ?? false;
  const { data: roles = [] } = useGetRoles(canManageRoles);
  const updateUser = useUpdateUser(userId);
  const resend = useResendUserVerification(userId);
  const assignRole = useAssignUserRole();
  const removeRole = useRemoveUserRole();
  const [form, setForm] = useState<UserFormState | null>(null);
  const [formUserId, setFormUserId] = useState("");
  const [pendingRoles, setPendingRoles] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user && user.id !== formUserId) {
      setForm(toForm(user));
      setFormUserId(user.id);
    }
  }, [formUserId, user]);

  if (isError) {
    return (
      <PageLayout icon={UserRound} title="User detail" backTo="/rbac/users">
        <p className="text-sm text-semantic-danger">
          Could not load this user.
        </p>
      </PageLayout>
    );
  }

  if (isLoading || !user || !form) {
    return (
      <PageLayout icon={UserRound} title="User detail" backTo="/rbac/users">
        <p className="text-sm text-muted-foreground">Loading user...</p>
      </PageLayout>
    );
  }

  const set = <Key extends keyof UserFormState>(
    key: Key,
    value: UserFormState[Key],
  ) => setForm((current) => (current ? { ...current, [key]: value } : current));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    const payload = buildUserUpdate(form, user);
    if (!Object.keys(payload).length) {
      setMessage("No changes to save.");
      return;
    }
    updateUser.mutate(payload, {
      onSuccess: () => setMessage("User changes saved."),
      onError: () => setMessage("Could not save user changes."),
    });
  };

  const updateVerification = (
    field: "emailVerified" | "outlookEmailVerified",
    checked: boolean,
  ) => {
    setMessage("");
    updateUser.mutate(
      { [field]: checked },
      {
        onSuccess: () => setMessage("Verification status updated."),
        onError: () => setMessage("Could not update verification status."),
      },
    );
  };

  const toggleRole = (roleId: string, assigned: boolean) => {
    if (pendingRoles.has(roleId)) return;
    setMessage("");
    setPendingRoles((current) => new Set(current).add(roleId));
    (assigned ? removeRole : assignRole).mutate(
      { userId: user.id, roleId },
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

  const resendVerification = () => {
    setMessage("");
    resend.mutate(undefined, {
      onSuccess: () => setMessage("Verification email sent."),
      onError: () => setMessage("Could not send verification email."),
    });
  };

  const isBinus = form.institutionType === "BINUS";
  const isStudent = form.memberType === "STUDENT";
  const isLecturer = form.memberType === "LECTURER";
  const isOther = form.memberType === "OTHER";

  return (
    <PageLayout icon={UserRound} title={user.name} backTo="/rbac/users">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <Container>
          <form onSubmit={submit} className="space-y-6">
            <section aria-labelledby="identity-heading">
              <h2 id="identity-heading" className="font-semibold">
                Identity and contact
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <TextField
                  id="name"
                  label="Name"
                  value={form.name}
                  onChange={(value) => set("name", value)}
                />
                <TextField
                  id="email"
                  label="Personal email"
                  type="email"
                  value={form.email}
                  onChange={(value) => set("email", value)}
                />
                <TextField
                  id="phoneNumber"
                  label="Phone number"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(value) => set("phoneNumber", value)}
                />
                <TextField
                  id="lineId"
                  label="LINE ID"
                  value={form.lineId}
                  onChange={(value) => set("lineId", value)}
                />
                <TextField
                  id="image"
                  label="Profile image URL"
                  type="url"
                  value={form.image}
                  onChange={(value) => set("image", value)}
                />
                <SelectField
                  id="status"
                  label="Account status"
                  value={form.status}
                  onChange={(value) => set("status", value as UserStatus)}
                  options={enumOptions(["ACTIVE", "INACTIVE", "SUSPENDED"])}
                />
              </div>
            </section>

            <section
              aria-labelledby="membership-heading"
              className="border-t pt-6"
            >
              <h2 id="membership-heading" className="font-semibold">
                Membership path
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Fields below follow the selected member and institution types.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <SelectField
                  id="memberType"
                  label="Member type"
                  value={form.memberType}
                  emptyLabel="Not set"
                  onChange={(value) =>
                    set("memberType", value as MemberType | "")
                  }
                  options={enumOptions(["STUDENT", "LECTURER", "OTHER"])}
                />
                <SelectField
                  id="institutionType"
                  label="Institution type"
                  value={form.institutionType}
                  emptyLabel="Not set"
                  onChange={(value) =>
                    set("institutionType", value as InstitutionType | "")
                  }
                  options={enumOptions(["BINUS", "NON_BINUS"])}
                />

                {isBinus && (
                  <>
                    <OptionField
                      id="universityId"
                      label="University"
                      value={form.universityId}
                      options={options?.universities ?? []}
                      onChange={(value) => set("universityId", value)}
                    />
                    <OptionField
                      id="regionId"
                      label="BINUS region"
                      value={form.regionId}
                      options={options?.binusRegions ?? []}
                      onChange={(value) => set("regionId", value)}
                    />
                    <TextField
                      id="outlookEmail"
                      label="Outlook email"
                      type="email"
                      value={form.outlookEmail}
                      onChange={(value) => set("outlookEmail", value)}
                    />
                  </>
                )}

                {form.institutionType === "NON_BINUS" && (
                  <TextField
                    id="universityName"
                    label={
                      isOther
                        ? "Institution / organization name"
                        : "University name"
                    }
                    value={form.universityName}
                    onChange={(value) => set("universityName", value)}
                  />
                )}

                {isStudent && (
                  <TextField
                    id="nim"
                    label="Student ID / NIM"
                    value={form.nim}
                    onChange={(value) => set("nim", value)}
                  />
                )}

                {isStudent && isBinus && (
                  <>
                    <OptionField
                      id="studyProgramId"
                      label="Study program"
                      value={form.studyProgramId}
                      options={options?.studyPrograms ?? []}
                      onChange={(value) => set("studyProgramId", value)}
                    />
                    <TextField
                      id="graduateBatch"
                      label="Graduation batch"
                      value={form.graduateBatch}
                      onChange={(value) => set("graduateBatch", value)}
                    />
                  </>
                )}

                {isStudent && form.institutionType === "NON_BINUS" && (
                  <TextField
                    id="studyProgramName"
                    label="Study program"
                    value={form.studyProgramName}
                    onChange={(value) => set("studyProgramName", value)}
                  />
                )}

                {isLecturer && (
                  <TextField
                    id="department"
                    label="Department"
                    value={form.department}
                    onChange={(value) => set("department", value)}
                  />
                )}

                {isOther && (
                  <TextField
                    id="affiliation"
                    label="Affiliation"
                    value={form.affiliation}
                    onChange={(value) => set("affiliation", value)}
                  />
                )}
              </div>
              {optionsError && isBinus && (
                <p className="mt-3 text-sm text-semantic-danger">
                  Registration options could not be loaded. Existing IDs remain
                  selected, but changing them is unavailable.
                </p>
              )}
            </section>

            <div className="flex items-center justify-between gap-4 border-t pt-5">
              <p role="status" className="text-sm text-muted-foreground">
                {message}
              </p>
              <Button disabled={updateUser.isPending}>
                {updateUser.isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </Container>

        <div className="space-y-6">
          {canManageRoles && (
            <Container>
              <h2 className="font-semibold">Roles</h2>
              <div className="mt-3 space-y-1">
                {roles.map((role) => {
                  const assigned = user.roles.some(
                    (item) => item.id === role.id,
                  );
                  return (
                    <label
                      key={role.id}
                      className="flex min-h-10 items-center gap-3 rounded-lg px-2 text-sm hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={assigned}
                        disabled={
                          user.id === me?.id || pendingRoles.has(role.id)
                        }
                        onChange={() => toggleRole(role.id, assigned)}
                      />
                      {role.roleName}
                    </label>
                  );
                })}
              </div>
              {user.id === me?.id && (
                <p className="mt-3 text-xs text-muted-foreground">
                  You cannot change your own roles.
                </p>
              )}
            </Container>
          )}

          <Container>
            <h2 className="font-semibold">Verification</h2>
            <div className="mt-3 space-y-3">
              <label className="flex min-h-10 items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={user.emailVerified}
                  disabled={updateUser.isPending}
                  onChange={(event) =>
                    updateVerification("emailVerified", event.target.checked)
                  }
                />
                Personal email verified
              </label>
              <label className="flex min-h-10 items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={user.outlookEmailVerified}
                  disabled={!user.outlookEmail || updateUser.isPending}
                  onChange={(event) =>
                    updateVerification(
                      "outlookEmailVerified",
                      event.target.checked,
                    )
                  }
                />
                Outlook email verified
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={
                  !user.outlookEmail ||
                  user.outlookEmailVerified ||
                  resend.isPending
                }
                onClick={resendVerification}
              >
                {resend.isPending ? "Sending..." : "Resend verification"}
              </Button>
              {!user.outlookEmail && (
                <p className="text-xs text-muted-foreground">
                  Add an Outlook email before sending verification.
                </p>
              )}
              {user.outlookEmailVerified && (
                <p className="text-xs text-muted-foreground">
                  This Outlook email is already verified.
                </p>
              )}
            </div>
          </Container>

          <Container>
            <h2 className="font-semibold">Metadata</h2>
            <dl className="mt-3 space-y-3 text-sm">
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

const TextField = ({
  id,
  label,
  value,
  type = "text",
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      className="mt-1.5"
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
);

const SelectField = ({
  id,
  label,
  value,
  options,
  emptyLabel,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  emptyLabel?: string;
  onChange: (value: string) => void;
}) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <select
      id={id}
      className="mt-1.5 h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {emptyLabel && <option value="">{emptyLabel}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const OptionField = ({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: RegistrationOption[];
  onChange: (value: string) => void;
}) => {
  const selectedExists = options.some((option) => option.id === value);
  return (
    <SelectField
      id={id}
      label={label}
      value={value}
      emptyLabel="Not set"
      onChange={onChange}
      options={[
        ...(!selectedExists && value
          ? [{ value, label: `Current (${value})` }]
          : []),
        ...options.map((option) => ({
          value: option.id,
          label: option.shortName || option.name,
        })),
      ]}
    />
  );
};

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
    <dd className={`break-all ${mono ? "font-mono text-xs" : ""}`}>
      {value || "-"}
    </dd>
  </div>
);

const toForm = (user: RbacUserDetail): UserFormState => ({
  name: user.name,
  email: user.email,
  outlookEmail: user.outlookEmail ?? "",
  image: user.image ?? "",
  status: user.status,
  memberType: user.memberType ?? "",
  institutionType: user.institutionType ?? "",
  universityId: user.universityId ?? "",
  universityName: user.universityName ?? "",
  studyProgramId: user.studyProgramId ?? "",
  studyProgramName: user.studyProgramName ?? "",
  regionId: user.regionId ?? "",
  nim: user.nim ?? "",
  graduateBatch: user.graduateBatch ?? "",
  department: user.department ?? "",
  affiliation: user.affiliation ?? "",
  phoneNumber: user.phoneNumber ?? "",
  lineId: user.lineId ?? "",
});

const enumOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value.replaceAll("_", " ") }));
const formatDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString() : "-";

export default DetailPage;
