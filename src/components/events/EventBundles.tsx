import { useState, type ReactNode } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  type InternalRegistration,
  useInternalEventRegistration,
  useInternalEventRegistrations,
  useInternalRegistrationPayment,
  useRemoveBundleMember,
} from "@/api/event-registration/queries";
import { backendMessage, useNotification } from "@/components/notification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PaymentReview } from "./EventPayments";

type Status = InternalRegistration["status"];
type Kind = InternalRegistration["kind"];

const statuses: Status[] = [
  "ASSEMBLING",
  "PENDING_PAYMENT",
  "PAYMENT_REVIEW",
  "CONFIRMED",
  "EXPIRED",
  "CANCELLED",
  "REJECTED",
];

const label = (value: string) =>
  value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
const date = (value: string | null) =>
  value ? new Date(value).toLocaleString() : "Not set";
const money = (currency: string, value: string) =>
  `${currency} ${BigInt(value).toLocaleString()}`;

export function EventRegistrations({
  eventId,
  canReviewPayments,
  canViewProofs,
}: {
  eventId: string;
  canReviewPayments: boolean;
  canViewProofs: boolean;
}) {
  const [params, setParams] = useSearchParams();
  const selected = params.get("registration") ?? "";
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<Status | "">("");
  const [kind, setKind] = useState<Kind | "">("");
  const registrations = useInternalEventRegistrations(eventId, {
    page,
    ...(status && { status }),
    ...(kind && { kind }),
  });
  const select = (id?: string) => {
    const next = new URLSearchParams(params);
    if (id) next.set("registration", id);
    else next.delete("registration");
    setParams(next);
  };

  if (selected)
    return (
      <RegistrationDetail
        eventId={eventId}
        registrationId={selected}
        canReviewPayments={canReviewPayments}
        canViewProofs={canViewProofs}
        onBack={() => select()}
      />
    );

  return (
    <Card>
      <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle>Registrations</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Individual registrations and Bundle orders.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Filter
            label="Order type"
            value={kind}
            onChange={(value) => {
              setKind(value as Kind | "");
              setPage(1);
            }}
            options={["INDIVIDUAL", "BUNDLE"]}
          />
          <Filter
            label="Status"
            value={status}
            onChange={(value) => {
              setStatus(value as Status | "");
              setPage(1);
            }}
            options={statuses}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {registrations.isPending && (
          <p className="py-8 text-center text-sm">Loading registrations...</p>
        )}
        {registrations.isError && (
          <p role="alert" className="py-8 text-center text-sm text-destructive">
            Could not load registrations.
          </p>
        )}
        {registrations.data?.data.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No registrations match these filters.
          </p>
        )}
        {registrations.data?.data.map((registration) => (
          <button
            key={registration.id}
            type="button"
            className="grid w-full gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[1fr_auto] sm:items-center"
            onClick={() => select(registration.id)}
          >
            <span>
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">
                  {registration.orderNumber}
                </span>
                <Badge>{label(registration.kind)}</Badge>
                <Badge>{label(registration.status)}</Badge>
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                {registration.ticketPackage.name} · {registration.memberCount}/
                {registration.seatCount} participant
                {registration.seatCount === 1 ? "" : "s"}
              </span>
            </span>
            <span className="text-sm font-medium">
              {money(registration.currency, registration.totalMinor)}
            </span>
          </button>
        ))}
        {registrations.data && registrations.data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {registrations.data.meta.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= registrations.data.meta.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RegistrationDetail({
  eventId,
  registrationId,
  canReviewPayments,
  canViewProofs,
  onBack,
}: {
  eventId: string;
  registrationId: string;
  canReviewPayments: boolean;
  canViewProofs: boolean;
  onBack: () => void;
}) {
  const query = useInternalEventRegistration(eventId, registrationId);
  const payment = useInternalRegistrationPayment(
    eventId,
    registrationId,
    canReviewPayments &&
      Boolean(
        query.data &&
        query.data.status !== "ASSEMBLING" &&
        BigInt(query.data.totalMinor) > 0n,
      ),
  );
  const remove = useRemoveBundleMember(eventId);
  const notify = useNotification();
  const [reason, setReason] = useState<Record<string, string>>({});

  return (
    <div className="space-y-5">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" />
        Back to registrations
      </Button>
      {query.isPending && (
        <p className="py-10 text-center">Loading detail...</p>
      )}
      {query.isError && (
        <p role="alert" className="py-10 text-center text-destructive">
          Registration detail could not be loaded.
        </p>
      )}
      {query.data && (
        <>
          <Card>
            <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>{query.data.orderNumber}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {query.data.ticketPackage.name} · {label(query.data.kind)}
                </p>
              </div>
              <Badge>{label(query.data.status)}</Badge>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <Fact label="Order total">
                {money(query.data.currency, query.data.totalMinor)}
              </Fact>
              <Fact label="Payment deadline">
                {date(query.data.paymentDeadlineAt)}
              </Fact>
              <Fact label="Cancellation deadline">
                {date(query.data.event.cancellationClosesAt)}
              </Fact>
              <Fact label="Event starts">
                {date(query.data.event.startsAt)}
              </Fact>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {query.data.kind === "BUNDLE"
                  ? "Bundle members"
                  : "Participant"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {query.data.members.length}/{query.data.seatCount} seats
                recorded
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {query.data.members.map((member) => (
                <div key={member.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">
                        {member.name || member.email || "Participant"}
                      </h3>
                      <p className="break-all text-sm text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge>Seat {member.position}</Badge>
                      <Badge>{label(member.status)}</Badge>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <Profile member={member} />
                    <Answers member={member} />
                  </div>
                  {query.data.kind === "BUNDLE" &&
                    query.data.status === "ASSEMBLING" &&
                    member.status === "ACTIVE" && (
                      <div className="mt-4 flex flex-col gap-2 border-t pt-4 sm:flex-row">
                        <Input
                          aria-label={`Removal reason for ${member.name || member.email}`}
                          placeholder="Required removal reason"
                          value={reason[member.id] ?? ""}
                          onChange={(event) =>
                            setReason((current) => ({
                              ...current,
                              [member.id]: event.target.value,
                            }))
                          }
                        />
                        <Button
                          variant="destructive"
                          disabled={
                            !reason[member.id]?.trim() || remove.isPending
                          }
                          onClick={() =>
                            remove.mutate(
                              {
                                registrationId: query.data.id,
                                userId: member.userId,
                                expectedRevision: query.data.revision,
                                reason: reason[member.id].trim(),
                              },
                              {
                                onSuccess: () =>
                                  notify("Bundle member removed."),
                                onError: (error) =>
                                  notify(
                                    backendMessage(
                                      error,
                                      "Could not remove member.",
                                    ),
                                    "error",
                                  ),
                              },
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                </div>
              ))}
            </CardContent>
          </Card>
          {canReviewPayments &&
            query.data.status !== "ASSEMBLING" &&
            BigInt(query.data.totalMinor) > 0n && (
              <>
                {payment.isPending && <p>Loading payment review...</p>}
                {payment.isError && (
                  <p role="alert" className="text-sm text-destructive">
                    Payment detail could not be loaded.
                  </p>
                )}
                {payment.data && (
                  <PaymentReview
                    key={`${payment.data.id}:${payment.data.revision}`}
                    payment={payment.data}
                    canViewProofs={canViewProofs}
                  />
                )}
              </>
            )}
        </>
      )}
    </div>
  );
}

function Profile({
  member,
}: {
  member: InternalRegistration["members"][number];
}) {
  const values = [
    ["NIM", member.snapshotNim],
    ["Outlook", member.snapshotOutlookEmail],
    ["Phone", member.snapshotPhoneNumber],
    ["University", member.snapshotUniversity],
    ["Study program", member.snapshotStudyProgram],
    ["Region", member.snapshotRegion],
  ].filter((item): item is [string, string] => Boolean(item[1]));
  return (
    <section>
      <h4 className="text-sm font-semibold">Profile snapshot</h4>
      {!member.snapshotAt ? (
        <p className="mt-2 text-sm text-muted-foreground">Not captured yet.</p>
      ) : (
        <dl className="mt-2 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          {values.map(([name, value]) => (
            <div key={name}>
              <dt className="text-xs text-muted-foreground">{name}</dt>
              <dd className="break-words">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

function Answers({
  member,
}: {
  member: InternalRegistration["members"][number];
}) {
  const submission = member.submissions[0];
  const answers = new Map(
    submission?.answers.map((answer) => [answer.formQuestionId, answer]),
  );
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">Registration answers</h4>
        <Badge>
          Additional answers{" "}
          {member.additionalAnswersReady ? "ready" : "outstanding"}
        </Badge>
      </div>
      {!submission ? (
        <p className="mt-2 text-sm text-muted-foreground">
          No form submission.
        </p>
      ) : (
        <dl className="mt-2 space-y-2 text-sm">
          {submission.form.sections.flatMap((section) =>
            section.questions.map((question) => {
              const answer = answers.get(question.id);
              const value = answer
                ? answer.selectedOptions
                    .map(({ option }) => option.label ?? option.value)
                    .join(", ") ||
                  answer.textValue ||
                  answer.numberValue ||
                  (answer.dateValue
                    ? new Date(answer.dateValue).toLocaleDateString()
                    : "Not answered")
                : "Not answered";
              return (
                <div key={question.id}>
                  <dt className="text-xs text-muted-foreground">
                    {question.label}
                  </dt>
                  <dd className="whitespace-pre-wrap break-words">{value}</dd>
                </div>
              );
            }),
          )}
          {member.supplementalRequests.map((request) => (
            <div key={request.id}>
              <dt className="text-xs text-muted-foreground">
                {request.question.label} · Additional
              </dt>
              <dd className="whitespace-pre-wrap break-words">
                {request.withdrawnAt
                  ? "Withdrawn"
                  : request.answeredAt
                    ? formatUnknown(request.answer)
                    : "Outstanding"}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

function formatUnknown(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined || value === "")
    return "Not answered";
  return String(value);
}

function Filter({
  label: name,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="grid gap-1 text-xs font-medium">
      {name}
      <select
        aria-label={name}
        className="rounded-md border bg-background px-3 py-2 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {label(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
      {children}
    </span>
  );
}

function Fact({
  label: name,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{name}</p>
      <p className="mt-1 font-medium">{children}</p>
    </div>
  );
}

/** Kept for callers that still render the former Bundle-only component directly. */
export function EventBundles({ eventId }: { eventId: string }) {
  return (
    <EventRegistrations
      eventId={eventId}
      canReviewPayments={false}
      canViewProofs={false}
    />
  );
}
