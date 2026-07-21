import { FormEvent, useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { useParams } from "react-router-dom";
import { useGetRoles, useGetUser, useResendUserVerification, useUpdateUser } from "@/api/rbac/queries";
import { useAssignUserRole, useRemoveUserRole } from "@/hooks/rbac/users";
import { Container, PageLayout } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/utils/auth-client";
import type { UpdateUserPayload } from "@/types/rbac";

const fields = ["name", "email", "outlookEmail", "phoneNumber", "lineId", "nim", "universityId", "studyProgramId", "binusRegionId", "universityName", "studyProgramName", "department", "affiliation", "graduateBatch", "image"] as const;
const label = (key: string) => key.replace(/[A-Z]/g, (c) => ` ${c}`).replace(/^./, (c) => c.toUpperCase());

const DetailPage = () => {
  const { userId = "" } = useParams();
  const { data: user, isLoading, isError } = useGetUser(userId);
  const update = useUpdateUser(userId); const resend = useResendUserVerification(userId); const { data: roles = [] } = useGetRoles(); const assign = useAssignUserRole(); const remove = useRemoveUserRole();
  const { data: session } = authClient.useSession(); const [form, setForm] = useState<UpdateUserPayload>({}); const [message, setMessage] = useState("");
  useEffect(() => { if (user) setForm({ ...Object.fromEntries(fields.map((key) => [key, key === "binusRegionId" ? user.binusRegion?.id : user[key]])), memberType: user.memberType, institutionType: user.institutionType, status: user.status, emailVerified: user.emailVerified, outlookEmailVerified: user.outlookEmailVerified ?? false } as UpdateUserPayload); }, [user]);
  if (isLoading) return <PageLayout icon={UserRound} title="User detail"><p>Loading user...</p></PageLayout>;
  if (isError || !user) return <PageLayout icon={UserRound} title="User detail" backTo="/rbac/users"><p className="text-semantic-danger">Could not load this user.</p></PageLayout>;
  const set = (key: keyof UpdateUserPayload, value: string | boolean) => setForm((current) => ({ ...current, [key]: typeof value === "string" ? value || null : value }));
  const submit = (event: FormEvent) => { event.preventDefault(); setMessage(""); update.mutate(form, { onSuccess: () => setMessage("User changes saved."), onError: () => setMessage("Could not save user changes.") }); };
  const roleMutation = (assigned: boolean, roleId: string) => (assigned ? remove : assign).mutate({ userId: user.id, roleId }, { onError: () => setMessage("Could not update this user's roles.") });
  const resendVerification = () => { setMessage(""); resend.mutate(undefined, { onSuccess: () => setMessage("Verification email sent."), onError: () => setMessage("Could not send verification email.") }); };

  return <PageLayout icon={UserRound} title={user.name} backTo="/rbac/users"><div className="grid gap-6 xl:grid-cols-[2fr_1fr]"><Container><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
    {fields.map((key) => <div key={key}><Label htmlFor={key}>{label(key)}</Label><Input id={key} className="mt-1.5" type={key.toLowerCase().includes("email") ? "email" : "text"} value={String(form[key] ?? "")} onChange={(e) => set(key, e.target.value)} />{key === "universityId" && user.university && <p className="mt-1 text-xs text-muted-foreground">Current: {user.university.name}</p>}{key === "studyProgramId" && user.studyProgram && <p className="mt-1 text-xs text-muted-foreground">Current: {user.studyProgram.name}</p>}{key === "binusRegionId" && user.binusRegion && <p className="mt-1 text-xs text-muted-foreground">Current: {user.binusRegion.name}</p>}</div>)}
    {[['memberType', 'Member type', ['STUDENT', 'LECTURER', 'OTHER']], ['institutionType', 'Institution type', ['BINUS', 'NON_BINUS']], ['status', 'Account status', ['ACTIVE', 'INACTIVE', 'SUSPENDED']]].map(([key, title, options]) => <label key={key as string} className="text-sm font-medium">{title as string}<select className="mt-1.5 h-10 w-full rounded-lg border border-input bg-card px-3" value={String(form[key as keyof UpdateUserPayload] ?? "")} onChange={(e) => set(key as keyof UpdateUserPayload, e.target.value)}><option value="">Not set</option>{(options as string[]).map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}</select></label>)}
    <div className="flex items-end"><Button disabled={update.isPending}>{update.isPending ? "Saving..." : "Save changes"}</Button></div><p role="status" className="sm:col-span-2 text-sm text-muted-foreground">{message}</p>
  </form></Container><div className="space-y-6">
    <Container><h2 className="font-semibold">Roles</h2><div className="mt-3 space-y-2">{roles.map((role) => { const assigned = user.roles?.some((item) => item.roleName === role.roleName); return <label key={role.id} className="flex gap-2 text-sm"><input type="checkbox" checked={!!assigned} disabled={user.id === session?.user?.id} onChange={() => roleMutation(!!assigned, role.id)} />{role.roleName}</label>; })}</div>{user.id === session?.user?.id && <p className="mt-3 text-xs text-muted-foreground">You cannot change your own roles.</p>}</Container>
    <Container><h2 className="font-semibold">Verification</h2><label className="mt-3 flex gap-2 text-sm"><input type="checkbox" checked={!!form.outlookEmailVerified} onChange={(e) => set("outlookEmailVerified", e.target.checked)} />Outlook email verified</label><Button className="mt-3" type="button" variant="secondary" size="sm" disabled={resend.isPending} onClick={resendVerification}>{resend.isPending ? "Sending..." : "Resend verification"}</Button></Container>
    <Container><h2 className="font-semibold">Metadata</h2><dl className="mt-3 space-y-2 text-sm"><div><dt className="text-muted-foreground">User ID</dt><dd className="break-all">{user.id}</dd></div><div><dt className="text-muted-foreground">Created</dt><dd>{new Date(user.createdAt).toLocaleString()}</dd></div>{user.updatedAt && <div><dt className="text-muted-foreground">Updated</dt><dd>{new Date(user.updatedAt).toLocaleString()}</dd></div>}{user.registrationCompletedAt && <div><dt className="text-muted-foreground">Registration completed</dt><dd>{new Date(user.registrationCompletedAt).toLocaleString()}</dd></div>}</dl></Container>
  </div></div></PageLayout>;
};
export default DetailPage;
