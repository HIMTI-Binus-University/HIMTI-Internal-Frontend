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

const DetailPage = () => {
  const { userId = "" } = useParams();
  const { data: user, isLoading, isError } = useGetUser(userId);
  const update = useUpdateUser(userId); const resend = useResendUserVerification(userId);
  const { data: roles = [] } = useGetRoles(); const assign = useAssignUserRole(); const remove = useRemoveUserRole();
  const { data: session } = authClient.useSession(); const [form, setForm] = useState<UpdateUserPayload>({}); const [message, setMessage] = useState("");
  useEffect(() => { if (user) setForm({ ...user, binusRegionId: user.binusRegion?.id ?? null }); }, [user]);
  if (isLoading) return <PageLayout icon={UserRound} title="User detail"><p>Loading user...</p></PageLayout>;
  if (isError || !user) return <PageLayout icon={UserRound} title="User detail" backTo="/rbac/users"><p className="text-semantic-danger">Could not load this user.</p></PageLayout>;
  const set = (key: keyof UpdateUserPayload, value: string) => setForm((current) => ({ ...current, [key]: value || null }));
  const submit = (event: FormEvent) => { event.preventDefault(); update.mutate(form, { onSuccess: () => setMessage("User changes saved."), onError: () => setMessage("Could not save user changes.") }); };
  return <PageLayout icon={UserRound} title={user.name} backTo="/rbac/users"><div className="grid gap-6 xl:grid-cols-[2fr_1fr]"><Container><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">{(["name", "email", "phoneNumber", "lineId", "binusEmail", "nim", "universityName", "studyProgramName", "graduateBatch", "department", "affiliation"] as const).map((key) => <div key={key}><Label htmlFor={key}>{key.replace(/[A-Z]/g, (c) => ` ${c}`).replace(/^./, (c) => c.toUpperCase())}</Label><Input id={key} className="mt-1.5" value={String(form[key] ?? "")} onChange={(e) => set(key, e.target.value)} /></div>)}<label>Status<select className="mt-1.5 h-10 w-full rounded-lg border border-input bg-card px-3" value={form.status ?? user.status} onChange={(e) => set("status", e.target.value)}><option>ACTIVE</option><option>INACTIVE</option><option>SUSPENDED</option></select></label><div><Button disabled={update.isPending}>Save changes</Button><span className="ml-3 text-sm text-muted-foreground">{message}</span></div></form></Container><div className="space-y-6"><Container><h2 className="font-semibold">Roles</h2><div className="mt-3 space-y-2">{roles.map((role) => { const assigned = user.roles?.some((item) => item.roleName === role.roleName); return <label key={role.id} className="flex gap-2 text-sm"><input type="checkbox" checked={!!assigned} disabled={user.id === session?.user?.id} onChange={() => (assigned ? remove : assign).mutate({ userId: user.id, roleId: role.id })} />{role.roleName}</label>; })}</div>{user.id === session?.user?.id && <p className="mt-3 text-xs text-muted-foreground">You cannot change your own roles.</p>}</Container><Container><h2 className="font-semibold">Verification</h2><Button className="mt-3" variant="outline" disabled={resend.isPending || user.binusEmailVerified || !user.binusEmail} onClick={() => resend.mutate()}>{user.binusEmailVerified ? "Already verified" : "Resend verification"}</Button></Container></div></div></PageLayout>;
};
export default DetailPage;
