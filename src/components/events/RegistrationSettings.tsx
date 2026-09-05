import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  useRegistrationSettings,
  useUpdateRegistrationSettings,
} from "@/api/event-registration/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type {
  RegistrationSettings,
  RegistrationSettingsPayload,
} from "@/types/event-registration";

const proofTypes = [
  ["image/jpeg", "JPEG"],
  ["image/png", "PNG"],
  ["image/webp", "WebP"],
  ["application/pdf", "PDF"],
] as const;
const toLocal = (value: string | null) =>
  value ? new Date(value).toISOString().slice(0, 16) : "";
const fromLocal = (value: string) =>
  value ? new Date(value).toISOString() : null;

type Draft = Omit<
  RegistrationSettingsPayload,
  | "registrationOpensAt"
  | "registrationClosesAt"
  | "cancellationClosesAt"
  | "capacity"
  | "paymentProofMaxBytes"
> & {
  registrationOpensAt: string;
  registrationClosesAt: string;
  cancellationClosesAt: string;
  capacity: string;
  paymentProofMaxMb: string;
};

type ProofType = RegistrationSettingsPayload["paymentProofTypes"][number];
const isProofType = (value: string): value is ProofType =>
  proofTypes.some(([type]) => type === value);

const asDraft = (value: RegistrationSettings): Draft => ({
  ...value,
  paymentProofTypes: value.paymentProofTypes.filter(isProofType),
  registrationOpensAt: toLocal(value.registrationOpensAt),
  registrationClosesAt: toLocal(value.registrationClosesAt),
  cancellationClosesAt: toLocal(value.cancellationClosesAt),
  capacity: value.capacity?.toString() ?? "",
  paymentProofMaxMb: (value.paymentProofMaxBytes / 1024 / 1024).toString(),
});

export function RegistrationSettings({
  eventId,
  canEdit,
}: {
  eventId: string;
  canEdit: boolean;
}) {
  const query = useRegistrationSettings(eventId);
  const update = useUpdateRegistrationSettings(eventId);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (query.data) setDraft(asDraft(query.data));
  }, [query.data]);
  if (query.isLoading || !draft)
    return (
      <p className="py-10 text-center text-sm">Loading registration setup...</p>
    );
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (draft.isRegistrationOpen && !draft.registrationClosesAt)
      return setError("A closing date is required while registration is open.");
    if (
      draft.registrationOpensAt &&
      draft.registrationClosesAt &&
      draft.registrationClosesAt <= draft.registrationOpensAt
    )
      return setError("Registration closing must be after opening.");
    if (!draft.paymentProofTypes.length)
      return setError("Select at least one payment proof type.");
    update.mutate({
      ...draft,
      registrationOpensAt: fromLocal(draft.registrationOpensAt),
      registrationClosesAt: fromLocal(draft.registrationClosesAt),
      cancellationClosesAt: fromLocal(draft.cancellationClosesAt),
      capacity: draft.capacity ? Number(draft.capacity) : null,
      paymentProofMaxBytes: Math.round(
        Number(draft.paymentProofMaxMb) * 1024 * 1024,
      ),
      attendanceCheckoutEnabled:
        draft.attendanceEnabled && draft.attendanceCheckoutEnabled,
    });
  };
  return (
    <form onSubmit={submit} className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Registration availability</CardTitle>
          <p className="text-sm text-muted-foreground">
            Control access, dates, cancellations, and overall capacity.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="col-span-full flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="registration-open">Accept registrations</Label>
              <p className="text-xs text-muted-foreground">
                Dates still apply when enabled.
              </p>
            </div>
            <Switch
              id="registration-open"
              checked={draft.isRegistrationOpen}
              onCheckedChange={(value) => set("isRegistrationOpen", value)}
              disabled={!canEdit}
            />
          </div>
          <Field label="Opens at">
            <Input
              type="datetime-local"
              value={draft.registrationOpensAt}
              onChange={(e) => set("registrationOpensAt", e.target.value)}
              disabled={!canEdit}
            />
          </Field>
          <Field label="Closes at">
            <Input
              type="datetime-local"
              value={draft.registrationClosesAt}
              onChange={(e) => set("registrationClosesAt", e.target.value)}
              disabled={!canEdit}
            />
          </Field>
          <Field label="Cancellation closes at">
            <Input
              type="datetime-local"
              value={draft.cancellationClosesAt}
              onChange={(e) => set("cancellationClosesAt", e.target.value)}
              disabled={!canEdit}
            />
          </Field>
          <Field label="Capacity">
            <Input
              min="1"
              step="1"
              type="number"
              placeholder="Unlimited"
              value={draft.capacity}
              onChange={(e) => set("capacity", e.target.value)}
              disabled={!canEdit}
            />
          </Field>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Payment instructions</CardTitle>
          <p className="text-sm text-muted-foreground">
            One bank transfer destination and proof upload policy.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Currency">
            <Input
              value={draft.paymentCurrency}
              maxLength={3}
              onChange={(e) =>
                set("paymentCurrency", e.target.value.toUpperCase())
              }
              disabled={!canEdit}
            />
          </Field>
          <Field label="Bank name">
            <Input
              value={draft.paymentBankName ?? ""}
              onChange={(e) => set("paymentBankName", e.target.value || null)}
              disabled={!canEdit}
            />
          </Field>
          <Field label="Account number">
            <Input
              value={draft.paymentAccountNumber ?? ""}
              onChange={(e) =>
                set("paymentAccountNumber", e.target.value || null)
              }
              disabled={!canEdit}
            />
          </Field>
          <Field label="Account holder">
            <Input
              value={draft.paymentAccountHolder ?? ""}
              onChange={(e) =>
                set("paymentAccountHolder", e.target.value || null)
              }
              disabled={!canEdit}
            />
          </Field>
          <Field label="Proof size limit (MB)">
            <Input
              type="number"
              min="0.01"
              max="25"
              step="0.01"
              value={draft.paymentProofMaxMb}
              onChange={(e) => set("paymentProofMaxMb", e.target.value)}
              disabled={!canEdit}
            />
          </Field>
          <fieldset className="grid gap-2">
            <legend className="text-sm font-semibold">Accepted proof</legend>
            {proofTypes.map(([value, label]) => (
              <label className="flex items-center gap-2 text-sm" key={value}>
                <Checkbox
                  checked={draft.paymentProofTypes.includes(value)}
                  onCheckedChange={(checked) =>
                    set(
                      "paymentProofTypes",
                      checked
                        ? [...draft.paymentProofTypes, value]
                        : draft.paymentProofTypes.filter(
                            (item) => item !== value,
                          ),
                    )
                  }
                  disabled={!canEdit}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <Field className="col-span-full" label="Payment instructions">
            <textarea
              className="min-h-24 w-full rounded-lg border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:bg-muted"
              value={draft.paymentInstructions ?? ""}
              onChange={(e) =>
                set("paymentInstructions", e.target.value || null)
              }
              disabled={!canEdit}
            />
          </Field>
        </CardContent>
      </Card>
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Attendance</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enabling attendance reveals its workspace tab.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Toggle
            label="Track check-in"
            description="Show attendance configuration and allow check-in later."
            checked={draft.attendanceEnabled}
            onChange={(value) => {
              set("attendanceEnabled", value);
              if (!value) set("attendanceCheckoutEnabled", false);
            }}
            disabled={!canEdit}
          />
          <Toggle
            label="Track check-out"
            description="Requires attendance tracking."
            checked={draft.attendanceCheckoutEnabled}
            onChange={(value) => set("attendanceCheckoutEnabled", value)}
            disabled={!canEdit || !draft.attendanceEnabled}
          />
        </CardContent>
      </Card>
      <div className="flex items-center justify-between gap-4 xl:col-span-2">
        <p role="alert" className="text-sm text-destructive">
          {error ||
            (update.isError ? "Could not save registration setup." : "")}
        </p>
        {canEdit ? (
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save setup"}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Registration-management permission is required to make changes.
          </p>
        )}
      </div>
    </form>
  );
}

export function PaymentSummary({ eventId }: { eventId: string }) {
  const settings = useRegistrationSettings(eventId);
  const value = settings.data;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment configuration</CardTitle>
        <p className="text-sm text-muted-foreground">
          Payment operations are configured as part of registration setup.
        </p>
      </CardHeader>
      <CardContent>
        {value ? (
          <dl className="grid gap-4 sm:grid-cols-3">
            <Summary term="Currency" value={value.paymentCurrency} />
            <Summary
              term="Destination"
              value={
                value.paymentBankName
                  ? `${value.paymentBankName} - ${value.paymentAccountNumber}`
                  : "Not configured"
              }
            />
            <Summary
              term="Proof limit"
              value={`${(value.paymentProofMaxBytes / 1024 / 1024).toFixed(1)} MB`}
            />
          </dl>
        ) : (
          <p className="text-sm">Loading...</p>
        )}
        <Button className="mt-5" variant="secondary" asChild>
          <Link to={`?section=setup`}>Open registration setup</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`grid gap-1.5 ${className}`}>
      <span className="text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}
function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-label={label}
      />
    </div>
  );
}
function Summary({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {term}
      </dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}
