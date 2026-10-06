import { useEffect, useState, type ReactNode } from "react";
import {
  useEventPackages,
  useRegistrationForm,
  useRegistrationSettings,
} from "@/api/event-registration/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import type { EventItem } from "@/types/events";

export function ReviewSettings({
  event,
  canManageRegistration,
  canManagePackages,
  canManageForm,
  organizerCount,
  onSectionChange,
  children,
}: {
  event: EventItem;
  canManageRegistration: boolean;
  canManagePackages: boolean;
  canManageForm: boolean;
  organizerCount?: number;
  onSectionChange: (
    section: "overview" | "setup" | "form" | "packages" | "payment",
  ) => void;
  children?: ReactNode;
}) {
  const settings = useRegistrationSettings(event.id, canManageRegistration);
  const packages = useEventPackages(event.id, canManagePackages);
  const form = useRegistrationForm(event.id, canManageForm);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const setup =
    canManageRegistration && !settings.isError ? settings.data : undefined;
  const tickets =
    canManagePackages && !packages.isError ? packages.data : undefined;
  const latest = canManageForm && !form.isError ? form.data : undefined;
  const available = tickets?.filter(
    (ticket) =>
      ticket.status === "ACTIVE" &&
      ticket.seatCount === 1 &&
      (!ticket.salesStartAt || Date.parse(ticket.salesStartAt) <= now) &&
      (!ticket.salesEndAt || Date.parse(ticket.salesEndAt) > now),
  );
  const checks = [
    { label: "Event published", ready: event.status === "PUBLISHED" },
    { label: "Accept registrations enabled", ready: setup?.isRegistrationOpen },
    {
      label: "Within registration dates",
      ready: setup
        ? (!setup.registrationOpensAt ||
            Date.parse(setup.registrationOpensAt) <= now) &&
          (!setup.registrationClosesAt ||
            Date.parse(setup.registrationClosesAt) > now)
        : undefined,
    },
    {
      label: "Published registration form",
      ready:
        latest === undefined
          ? undefined
          : latest === null
            ? false
            : latest.status === "PUBLISHED"
              ? true
              : latest.version > 1
                ? undefined
                : false,
    },
    {
      label: "Individual ticket on sale with payment destination if paid",
      ready: available
        ? available.some((ticket) => Number(ticket.priceMinor) === 0)
          ? true
          : !available.length
            ? false
            : setup
              ? Boolean(
                  setup.paymentBankName &&
                  setup.paymentAccountNumber &&
                  setup.paymentAccountHolder,
                )
              : undefined
        : undefined,
    },
  ];
  const confirmed = checks.filter(({ ready }) => ready === true).length;
  const unknown = checks.filter(({ ready }) => ready === undefined).length;
  const percentage = Math.round((confirmed / checks.length) * 100);
  const scheduled = Boolean(
    setup?.registrationOpensAt && Date.parse(setup.registrationOpensAt) > now,
  );
  const registrationStatus =
    event.status === "CLOSED" ||
    event.status === "CANCELLED" ||
    setup?.isRegistrationOpen === false ||
    (setup?.registrationClosesAt &&
      Date.parse(setup.registrationClosesAt) <= now)
      ? "Closed"
      : checks.some(({ ready }, index) => index !== 2 && ready === false)
        ? "Unavailable"
        : unknown
          ? "Unknown"
          : scheduled
            ? "Scheduled"
            : "Configuration ready";
  const checkLinks: {
    label: string;
    section: Parameters<typeof onSectionChange>[0];
    allowed: boolean;
  }[][] = [
    [{ label: "Overview", section: "overview", allowed: true }],
    [
      {
        label: "Registration setup",
        section: "setup",
        allowed: canManageRegistration,
      },
    ],
    [
      {
        label: "Registration setup",
        section: "setup",
        allowed: canManageRegistration,
      },
    ],
    [{ label: "Registration form", section: "form", allowed: canManageForm }],
    [
      { label: "Packages", section: "packages", allowed: canManagePackages },
      { label: "Payment", section: "payment", allowed: canManageRegistration },
    ],
  ];
  const date = (value: string | null) =>
    value ? new Date(value).toLocaleString() : "Not set";
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Summary</CardTitle>
        <p className="text-sm text-muted-foreground">
          Publishing makes the event public; it does not enable registration.
          These checks do not block publishing.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <section aria-labelledby="general-summary" className="space-y-3">
          <h2 id="general-summary" className="font-semibold">
            {event.name}
          </h2>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Schedule</dt>
              <dd>
                {date(event.startsAt)} to {date(event.endsAt)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Venue</dt>
              <dd>
                {[event.locationName, event.locationAddress]
                  .filter(Boolean)
                  .join(", ") || "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                Pricing (configured packages)
              </dt>
              <dd>
                {tickets
                  ? tickets.length
                    ? tickets
                        .map(
                          (ticket) =>
                            `${ticket.name}: ${Number(ticket.priceMinor) === 0 ? "Free" : `${ticket.currency} ${Number(ticket.priceMinor).toLocaleString()}`} (${ticket.seatCount} seat${ticket.seatCount === 1 ? "" : "s"})`,
                        )
                        .join("; ")
                    : "No packages"
                  : "Unknown"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Event organizers</dt>
              <dd>{organizerCount ?? "Unknown"}</dd>
            </div>
          </dl>
        </section>
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="mb-1 text-sm font-medium">Event status</p>
            <StatusBadge status={event.status} />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium">Registration form</p>
            {latest ? (
              <StatusBadge status={latest.status} />
            ) : (
              <p className="text-sm">
                {!canManageForm
                  ? "Permission required"
                  : form.isError
                    ? "Could not load form"
                    : form.isLoading
                      ? "Loading..."
                      : "No form"}
              </p>
            )}
            {latest && (
              <p className="mt-1 text-sm text-muted-foreground">
                {latest.name}
              </p>
            )}
          </div>
        </div>
        <section aria-labelledby="registration-status" className="space-y-1">
          <h2 id="registration-status" className="text-sm font-medium">
            Registration status
          </h2>
          <p role="status" className="font-semibold">
            {registrationStatus}
          </p>
          <p className="text-sm text-muted-foreground">
            {registrationStatus === "Scheduled"
              ? `Registration opening is scheduled for ${date(setup!.registrationOpensAt)}. `
              : ""}
            Configuration status only, not a guarantee of availability.
            Capacity, participant eligibility and answers are checked at
            registration. Unknown means required data could not be confirmed;
            Unavailable means a known configuration requirement is not met.
          </p>
        </section>
        <section
          aria-labelledby="readiness-title"
          className="space-y-3 rounded-lg border p-4"
        >
          <h2 id="readiness-title" className="font-semibold">
            Registration readiness: {percentage}% confirmed
          </h2>
          <progress
            aria-labelledby="readiness-title"
            value={percentage}
            max={100}
            className="block h-3 w-full accent-primary"
          />
          <p className="text-sm text-muted-foreground">
            {confirmed} of {checks.length} checks confirmed
            {unknown ? `; ${unknown} unknown` : ""}. This is not a guarantee of
            registration availability: capacity, participant eligibility and
            answers are checked by the backend.
          </p>
          <ul className="space-y-2 text-sm">
            {checks.map(({ label, ready }, index) => (
              <li key={label} className="flex flex-wrap justify-between gap-2">
                <span>{label}</span>
                <strong>
                  {ready === undefined
                    ? "Unknown"
                    : ready
                      ? "Confirmed"
                      : "Not met"}
                </strong>
                <div className="flex w-full flex-wrap gap-2">
                  {checkLinks[index]
                    .filter(({ allowed }) => allowed)
                    .map((link) => (
                      <Button
                        key={link.section}
                        type="button"
                        variant="link"
                        className="h-auto p-0"
                        onClick={() => onSectionChange(link.section)}
                      >
                        {link.label}
                      </Button>
                    ))}
                </div>
              </li>
            ))}
          </ul>
          {latest && latest.status !== "PUBLISHED" && latest.version > 1 && (
            <p className="text-sm text-muted-foreground">
              The current form is not published. Registration availability
              cannot be confirmed from this form.
            </p>
          )}
        </section>
        <section aria-labelledby="settings-summary" className="space-y-3">
          <h2 id="settings-summary" className="font-semibold">
            Settings summary
          </h2>
          {!setup ? (
            <p className="text-sm">
              {!canManageRegistration
                ? "Registration settings permission required."
                : settings.isError
                  ? "Could not load registration settings. Reopen this tab to retry."
                  : "Loading registration settings..."}
            </p>
          ) : (
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Accept registrations</dt>
                <dd>
                  {setup.isRegistrationOpen
                    ? "Enabled (dates still apply)"
                    : "Disabled"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Capacity</dt>
                <dd>
                  {setup.capacity ?? "Unlimited"} (remaining seats not checked)
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Registration opens</dt>
                <dd>{date(setup.registrationOpensAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Registration closes</dt>
                <dd>{date(setup.registrationClosesAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Cancellation deadline</dt>
                <dd>{date(setup.cancellationClosesAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Attendance</dt>
                <dd>
                  {setup.attendanceEnabled
                    ? setup.attendanceCheckoutEnabled
                      ? "Check-in and check-out"
                      : "Check-in only"
                    : "Disabled"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  Payment destination ({setup.paymentCurrency})
                </dt>
                <dd>
                  {setup.paymentBankName &&
                  setup.paymentAccountNumber &&
                  setup.paymentAccountHolder
                    ? `${setup.paymentBankName} / ${setup.paymentAccountNumber} / ${setup.paymentAccountHolder}`
                    : "Not configured (required for paid tickets only)"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Payment proof types</dt>
                <dd>JPG/JPEG, PNG, and PDF</dd>
              </div>
            </dl>
          )}
          <p className="text-sm">
            {tickets
              ? `${tickets.length} packages; ${available?.length} active individual packages currently on sale.`
              : !canManagePackages
                ? "Package permission required."
                : packages.isError
                  ? "Could not load packages. Reopen this tab to retry."
                  : "Loading packages..."}
          </p>
        </section>
        <section aria-labelledby="lifecycle-title" className="border-t pt-4">
          <h2 id="lifecycle-title" className="font-semibold">
            Event lifecycle
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Close and Cancel turn off registration. Cancellation is permanent.
            Actions require event management permission and manager scope.
          </p>
          {children}
        </section>
      </CardContent>
    </Card>
  );
}
