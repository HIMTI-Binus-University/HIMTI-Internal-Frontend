import { useState, type FormEvent } from "react";
import type { AxiosError } from "axios";
import { LockKeyhole, PackagePlus, Pencil, Users } from "lucide-react";

import {
  type EventPackage,
  useCreateEventPackage,
  useEventPackages,
  useUpdateEventPackage,
} from "@/api/event-packages/queries";
import { dateTime, titleCase } from "@/components/events/helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatMinor } from "./payment-utils";
import { localDateTime } from "./registration-settings";
import { packagePayload } from "./package-utils";
import { EmptyState } from "../components";

const errorMessage = (error: unknown) =>
  (error as AxiosError<{ message?: string; msg?: string }>).response?.data
    ?.message ??
  (error as AxiosError<{ msg?: string }>).response?.data?.msg ??
  (error as Error).message ??
  "The package operation failed.";

export function PackagesWorkspace({ subEventId }: { subEventId: string }) {
  const query = useEventPackages(subEventId);
  const update = useUpdateEventPackage(subEventId);
  const [editor, setEditor] = useState<EventPackage | "new" | null>(null);
  const [error, setError] = useState("");
  const changeStatus = (item: EventPackage, status: EventPackage["status"]) =>
    update.mutate(
      { packageId: item.id, payload: { revision: item.revision, status } },
      { onError: (failure) => setError(errorMessage(failure)) },
    );

  if (query.isLoading)
    return <p className="py-12 text-center text-sm text-muted-foreground">Loading packages...</p>;
  if (query.isError)
    return (
      <EmptyState
        title="Packages could not be loaded"
        description={errorMessage(query.error)}
        action={<Button onClick={() => query.refetch()}>Retry</Button>}
      />
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Ticket packages</h2>
          <p className="text-sm text-muted-foreground">
            Set fixed seats, a whole-order total in IDR, and package-specific sales windows.
          </p>
        </div>
        <Button onClick={() => setEditor("new")}><PackagePlus />Create package</Button>
      </div>
      {error && <p role="alert" className="text-sm text-semantic-danger">{error}</p>}
      {!query.data?.length ? (
        <EmptyState
          title="No packages yet"
          description="Create a package before opening native registration."
          action={<Button onClick={() => setEditor("new")}>Create package</Button>}
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {query.data.map((item) => (
            <Card key={item.id}>
              <CardHeader className="border-b">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{item.name}</CardTitle>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{item.code}</p>
                  </div>
                  <Badge variant={item.status === "ACTIVE" ? "success" : "neutral"}>{titleCase(item.status)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                <p className="text-sm text-muted-foreground">{item.description || "No description"}</p>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <PackageDetail label="Fixed seats" value={`${item.seatCount}`} />
                  <PackageDetail label="Whole-order total IDR" value={formatMinor(item.priceMinor, item.currency)} />
                  <PackageDetail label="Sales start" value={dateTime(item.salesStartAt ?? undefined)} />
                  <PackageDetail label="Sales end" value={dateTime(item.salesEndAt ?? undefined)} />
                </dl>
                {item.dependentOrderCount > 0 && (
                  <div className="flex gap-2 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                    <LockKeyhole className="h-4 w-4 shrink-0" />
                    Referenced by {item.dependentOrderCount} order{item.dependentOrderCount === 1 ? "" : "s"}. Package terms are immutable; status remains manageable.
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" disabled={!item.editable} onClick={() => setEditor(item)}>
                    <Pencil />{item.editable ? "Edit terms" : "Terms locked"}
                  </Button>
                  <select
                    aria-label={`Status for ${item.name}`}
                    value={item.status}
                    disabled={update.isPending}
                    onChange={(event) => changeStatus(item, event.target.value as EventPackage["status"])}
                    className="h-10 rounded-lg border border-input bg-card px-3 text-sm"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-4 w-4" />{item.dependentOrderCount} orders</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <PackageDialog subEventId={subEventId} value={editor} close={() => setEditor(null)} />
    </div>
  );
}

const PackageDetail = ({ label, value }: { label: string; value: string }) => (
  <div><dt className="text-xs font-bold uppercase text-muted-foreground">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>
);

function PackageDialog({ subEventId, value, close }: { subEventId: string; value: EventPackage | "new" | null; close: () => void }) {
  const create = useCreateEventPackage(subEventId);
  const update = useUpdateEventPackage(subEventId);
  const [error, setError] = useState("");
  const item = value === "new" ? undefined : value ?? undefined;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      const payload = packagePayload(new FormData(event.currentTarget));
      const mutationOptions = { onSuccess: close, onError: (failure: unknown) => setError(errorMessage(failure)) };
      if (item) update.mutate({ packageId: item.id, payload: { ...payload, revision: item.revision } }, mutationOptions);
      else create.mutate(payload, mutationOptions);
    } catch (failure) { setError(errorMessage(failure)); }
  };
  return (
    <Dialog open={value !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto">
        <DialogHeader><DialogTitle>{item ? "Edit package" : "Create package"}</DialogTitle><DialogDescription>Enter the total IDR price for the entire fixed-seat order, not a per-seat price. Only IDR is supported here.</DialogDescription></DialogHeader>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          <Field label="Name"><Input name="name" required maxLength={255} defaultValue={item?.name} /></Field>
          <Field label="Code"><Input name="code" required maxLength={50} defaultValue={item?.code} /></Field>
          <Field label="Fixed seat count"><Input name="seatCount" type="number" required min={1} step={1} defaultValue={item?.seatCount ?? 1} /></Field>
          <Field label="Whole-order total IDR"><Input name="wholeOrderTotalIdr" inputMode="numeric" pattern="[0-9]+" required defaultValue={item?.priceMinor ?? "0"} /></Field>
          <Field label="Currency"><Input value="IDR" readOnly aria-readonly="true" /></Field>
          <Field label="Status"><select name="status" defaultValue={item?.status ?? "DRAFT"} className="h-10 w-full rounded-lg border bg-card px-3 text-sm"><option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></Field>
          <Field label="Sales start"><Input name="salesStartAt" type="datetime-local" defaultValue={localDateTime(item?.salesStartAt ?? null)} /></Field>
          <Field label="Sales end"><Input name="salesEndAt" type="datetime-local" defaultValue={localDateTime(item?.salesEndAt ?? null)} /></Field>
          <label className="space-y-2 sm:col-span-2"><span className="text-sm font-semibold">Description</span><textarea name="description" rows={3} maxLength={2000} defaultValue={item?.description ?? ""} className="w-full rounded-lg border bg-card p-3 text-sm" /></label>
          {error && <p role="alert" className="text-sm text-semantic-danger sm:col-span-2">{error}</p>}
          <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="secondary" onClick={close}>Cancel</Button><Button type="submit" disabled={create.isPending || update.isPending}>{create.isPending || update.isPending ? "Saving..." : "Save package"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="space-y-2"><span className="text-sm font-semibold">{label}</span>{children}</label>;
