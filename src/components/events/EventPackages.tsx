import { useState, type FormEvent, type ReactNode } from "react";
import { Pencil, Plus, Ticket } from "lucide-react";
import {
  useEventPackages,
  useSaveEventPackage,
  useSetEventPackageActive,
} from "@/api/event-registration/queries";
import { StatusBadge } from "@/components/events/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { EventPackage, PackageDraft } from "@/types/event-registration";
import {
  buildPackagePayload,
  emptyPackageDraft,
  validatePackageDraft,
} from "@/types/event-registration";

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const localDate = (value?: string | null) =>
  value ? new Date(value).toISOString().slice(0, 16) : "";
const readableDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "No limit";

export function EventPackages({
  eventId,
  canEdit,
}: {
  eventId: string;
  canEdit: boolean;
}) {
  const query = useEventPackages(eventId);
  const save = useSaveEventPackage(eventId);
  const setActive = useSetEventPackageActive(eventId);
  const [editing, setEditing] = useState<EventPackage | null | undefined>();
  const [draft, setDraft] = useState<PackageDraft>(emptyPackageDraft);
  const [error, setError] = useState("");
  const open = (item: EventPackage | null) => {
    setEditing(item);
    setError("");
    setDraft(
      item
        ? {
            name: item.name,
            description: item.description ?? "",
            seatCount: String(item.seatCount),
            priceIdr: item.priceMinor,
            salesStartAt: localDate(item.salesStartAt),
            salesEndAt: localDate(item.salesEndAt),
          }
        : emptyPackageDraft(),
    );
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const problem = validatePackageDraft(draft);
    if (problem) return setError(problem);
    save.mutate(
      { id: editing?.id, body: buildPackagePayload(draft) },
      { onSuccess: () => setEditing(undefined) },
    );
  };
  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Ticket packages</h2>
          <p className="text-sm text-muted-foreground">
            Prices are for the entire order, not per seat.
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => open(null)}>
            <Plus />
            Create package
          </Button>
        )}
      </div>
      {query.isLoading ? (
        <p className="py-10 text-center text-sm">Loading packages...</p>
      ) : query.data?.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {query.data.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {item.code}
                    </p>
                  </div>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => open(item)}
                      aria-label={`Edit ${item.name}`}
                    >
                      <Pencil />
                    </Button>
                  )}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {item.description || "No description."}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Whole-order price
                    </dt>
                    <dd className="font-semibold">
                      {currency.format(Number(item.priceMinor))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Seats</dt>
                    <dd className="font-semibold">{item.seatCount}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Sales start
                    </dt>
                    <dd>{readableDate(item.salesStartAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Sales end</dt>
                    <dd>{readableDate(item.salesEndAt)}</dd>
                  </div>
                </dl>
                {canEdit && (
                  <Button
                    className="mt-4"
                    size="sm"
                    variant={item.status === "ACTIVE" ? "secondary" : "default"}
                    disabled={setActive.isPending}
                    onClick={() =>
                      setActive.mutate({
                        id: item.id,
                        active: item.status !== "ACTIVE",
                      })
                    }
                  >
                    {item.status === "ACTIVE" ? "Deactivate" : "Activate"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Ticket className="mb-3 h-9 w-9 text-muted-foreground" />
            <h3 className="font-semibold">No packages yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create the ticket choices registrants can purchase.
            </p>
          </CardContent>
        </Card>
      )}
      <Dialog
        open={editing !== undefined}
        onOpenChange={(openValue) => !openValue && setEditing(undefined)}
      >
        <DialogContent>
          <form onSubmit={submit} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit package" : "Create package"}
              </DialogTitle>
              <DialogDescription>
                The package code is generated by the server and cannot be
                edited.
              </DialogDescription>
            </DialogHeader>
            {editing && (
              <Field label="Generated code">
                <Input value={editing.code} disabled />
              </Field>
            )}
            <Field label="Name">
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                required
              />
            </Field>
            <Field label="Description">
              <textarea
                className="min-h-20 rounded-lg border bg-card px-3 py-2 text-sm"
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Seat count">
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={draft.seatCount}
                  onChange={(e) =>
                    setDraft({ ...draft, seatCount: e.target.value })
                  }
                />
              </Field>
              <Field label="Whole-order price (IDR)">
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={draft.priceIdr}
                  onChange={(e) =>
                    setDraft({ ...draft, priceIdr: e.target.value })
                  }
                />
              </Field>
              <Field label="Sales start">
                <Input
                  type="datetime-local"
                  value={draft.salesStartAt}
                  onChange={(e) =>
                    setDraft({ ...draft, salesStartAt: e.target.value })
                  }
                />
              </Field>
              <Field label="Sales end">
                <Input
                  type="datetime-local"
                  value={draft.salesEndAt}
                  onChange={(e) =>
                    setDraft({ ...draft, salesEndAt: e.target.value })
                  }
                />
              </Field>
            </div>
            <p role="alert" className="text-sm text-destructive">
              {error || (save.isError ? "Could not save package." : "")}
            </p>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditing(undefined)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving..." : "Save package"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}
