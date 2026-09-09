import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  useRegistrationSettings,
  useUpdateRegistrationSettings,
} from "@/api/event-registration/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { backendMessage, useNotification } from "@/components/notification";
import type {
  RegistrationSettings,
  RegistrationSettingsDraft,
} from "@/types/event-registration";
import { buildRegistrationSettingsPayload } from "@/types/event-registration";

const toLocal = (value: string | null) =>
  value ? new Date(value).toISOString().slice(0, 16) : "";

const asDraft = (value: RegistrationSettings): RegistrationSettingsDraft => ({
  isRegistrationOpen: value.isRegistrationOpen,
  paymentCurrency: value.paymentCurrency,
  paymentBankName: value.paymentBankName,
  paymentAccountNumber: value.paymentAccountNumber,
  paymentAccountHolder: value.paymentAccountHolder,
  paymentInstructions: value.paymentInstructions,
  attendanceEnabled: value.attendanceEnabled,
  attendanceCheckoutEnabled: value.attendanceCheckoutEnabled,
  registrationOpensAt: toLocal(value.registrationOpensAt),
  registrationClosesAt: toLocal(value.registrationClosesAt),
  cancellationClosesAt: toLocal(value.cancellationClosesAt),
  capacity: value.capacity?.toString() ?? "",
});

export function RegistrationSettings({
  eventId,
  canEdit,
  section = "registration",
}: {
  eventId: string;
  canEdit: boolean;
  section?: "registration" | "payment";
}) {
  const query = useRegistrationSettings(eventId);
  const update = useUpdateRegistrationSettings(eventId);
  const notify = useNotification();
  const [draft, setDraft] = useState<RegistrationSettingsDraft | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (query.data) setDraft(asDraft(query.data));
  }, [query.data]);
  if (query.isLoading || !draft)
    return (
      <p className="py-10 text-center text-sm">Loading registration setup...</p>
    );
  const set = <K extends keyof RegistrationSettingsDraft>(
    key: K,
    value: RegistrationSettingsDraft[K],
  ) =>
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
    update.mutate(buildRegistrationSettingsPayload(draft), {
      onSuccess: () => notify("Registration setup saved."),
      onError: (cause) =>
        notify(
          backendMessage(cause, "Could not save registration setup."),
          "error",
        ),
    });
  };
  return (
    <form onSubmit={submit} className="grid gap-4 xl:grid-cols-2">
      {section === "registration" && (
        <>
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Registration availability</CardTitle>
              <p className="text-sm text-muted-foreground">
                Control access, dates, cancellations, and overall capacity.
              </p>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="col-span-full flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="registration-open">
                    Accept registrations
                  </Label>
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
        </>
      )}
      {section === "payment" && (
        <Card className="xl:col-span-2">
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
            <div className="space-y-1">
              <p className="text-sm font-semibold">Proof size limit</p>
              <p className="text-sm">1.5 MB per file</p>
              <p className="text-xs text-muted-foreground">
                Fixed upload limit for every payment proof.
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Accepted proof formats</p>
              <p className="text-sm">JPG/JPEG, PNG, and PDF</p>
              <p className="text-xs text-muted-foreground">
                Fixed for every payment proof.
              </p>
            </div>
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
      )}
      {section === "registration" && (
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
      )}
      <div className="flex items-center justify-between gap-4 xl:col-span-2">
        <p role="alert" className="text-sm text-destructive">
          {error ||
            (update.isError ? "Could not save registration setup." : "")}
        </p>
        {canEdit ? (
          <Button type="submit" disabled={update.isPending}>
            {update.isPending
              ? "Saving..."
              : section === "payment"
                ? "Save payment settings"
                : "Save setup"}
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
