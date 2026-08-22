import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  Check,
  FileText,
  History,
  LockKeyhole,
  MessageCircleWarning,
  UserRound,
  X,
} from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import {
  type RegistrationDetail,
  type ReviewAction,
  useRegistrationDetail,
  useRegistrationNeighbors,
  useReviewRegistration,
} from "@/api/event-registrations/queries";
import { PageLayout } from "@/components/Utils";
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
import { EmptyState, Warning, WorkspaceHeader } from "../components";
import { readQueueFilters } from "./registration-queue-filters";
import {
  registrationReviewConflict,
  registrationReviewError,
} from "./registration-review-errors";
import { formatMinor } from "./payment-utils";

type ActionConfig = {
  action: ReviewAction;
  label: string;
  destructive?: boolean;
};
const actions: ActionConfig[] = [
  { action: "approve", label: "Approve" },
  { action: "request-correction", label: "Request correction" },
  { action: "reject", label: "Reject", destructive: true },
  { action: "admin-cancel", label: "Admin cancel", destructive: true },
];

export default function RegistrationReviewPage() {
  const { eventId = "", subeventId = "", registrationId = "" } = useParams();
  const [params] = useSearchParams();
  const [action, setAction] = useState<ActionConfig>();
  const detail = useRegistrationDetail(registrationId);
  const queueFilters = readQueueFilters(params);
  const { page: _page, limit: _limit, ...neighborFilters } = queueFilters;
  const neighbors = useRegistrationNeighbors(
    subeventId,
    registrationId,
    neighborFilters,
  );
  const query = params.toString();
  const queuePath = `/events/${eventId}/subevents/${subeventId}/registrations${query ? `?${query}` : ""}`;
  const detailPath = (id: string) =>
    `/events/${eventId}/subevents/${subeventId}/registrations/${id}${query ? `?${query}` : ""}`;

  if (detail.isError)
    return (
      <PageLayout icon={UserRound} title="Registration review">
        <EmptyState
          title="Registration unavailable"
          description={registrationReviewError(detail.error)}
          action={
            <Button asChild>
              <Link to={queuePath}>Back to queue</Link>
            </Button>
          }
        />
      </PageLayout>
    );
  if (!detail.data)
    return (
      <PageLayout icon={UserRound} title="Registration review">
        <p className="py-14 text-center text-sm text-muted-foreground">
          Loading registration...
        </p>
      </PageLayout>
    );

  const registration = detail.data;
  return (
    <PageLayout
      icon={UserRound}
      title="Registration review"
      breadcrumbs={[
        "Tools",
        "Events",
        registration.subEvent.name,
        "Registrations",
        registration.participant.name,
      ]}
      backTo={queuePath}
    >
      <WorkspaceHeader
        backTo={queuePath}
        eyebrow={`Order ${registration.orderNumber}`}
        title={registration.participant.name}
        description={`Submitted ${dateTime(registration.submittedAt ?? undefined)} - revision ${registration.revision}`}
        actions={
          <>
            <Button
              size="sm"
              variant="secondary"
              asChild={Boolean(neighbors.data?.previous)}
              disabled={!neighbors.data?.previous}
            >
              {neighbors.data?.previous ? (
                <Link to={detailPath(neighbors.data.previous.id)}>
                  <ArrowLeft />
                  Previous
                </Link>
              ) : (
                <>
                  <ArrowLeft />
                  Previous
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              asChild={Boolean(neighbors.data?.next)}
              disabled={!neighbors.data?.next}
            >
              {neighbors.data?.next ? (
                <Link to={detailPath(neighbors.data.next.id)}>
                  Next
                  <ArrowRight />
                </Link>
              ) : (
                <>
                  Next
                  <ArrowRight />
                </>
              )}
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <main className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-5 w-5 text-primary" />
                Buyer and order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <Detail
                  label="Buyer"
                  value={registration.participant.name}
                  secondary={registration.participant.email}
                />
                <Detail
                  label="NIM"
                  value={registration.participant.nim ?? "Not provided"}
                />
                <Detail
                  label="Package"
                  value={`${registration.package.name} (${registration.package.code})`}
                  secondary={`${registration.package.seatCount} fixed seat${registration.package.seatCount === 1 ? "" : "s"} · ${formatMinor(registration.package.priceMinor, registration.package.currency)} whole-order total`}
                />
                <Detail
                  label="Registration"
                  value={titleCase(registration.status)}
                />
                <Detail
                  label="Aggregate response"
                  value={
                    registration.responseStatus
                      ? titleCase(registration.responseStatus)
                      : "No response"
                  }
                />
                <Detail
                  label="Payment"
                  value={
                    registration.paymentStatus
                      ? titleCase(registration.paymentStatus)
                      : "Not available"
                  }
                />
              </dl>
            </CardContent>
          </Card>

          <Answers registration={registration} />

          <RosterReadiness registration={registration} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Status history
              </CardTitle>
            </CardHeader>
            <CardContent>
              {registration.history.length ? (
                <ol className="space-y-5">
                  {registration.history.map((entry) => (
                    <li
                      key={entry.id}
                      className="relative border-l-2 border-border pb-1 pl-5"
                    >
                      <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-primary" />
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm">
                          {titleCase(entry.toStatus)}
                        </strong>
                        {entry.fromStatus && (
                          <span className="text-xs text-muted-foreground">
                            from {titleCase(entry.fromStatus)}
                          </span>
                        )}
                      </div>
                      {entry.reason && (
                        <p className="mt-2 rounded-lg bg-muted p-3 text-sm">
                          {entry.reason}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {entry.actor?.name ?? "System"} -{" "}
                        {dateTime(entry.createdAt)}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No status changes have been recorded.
                </p>
              )}
            </CardContent>
          </Card>
        </main>

        <aside className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-base">Review decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {actions
                .filter((item) =>
                  registration.reviewCapabilities.includes(item.action),
                )
                .map((item) => (
                <Button
                  key={item.action}
                  className="w-full justify-start"
                  variant={
                    item.destructive
                      ? "secondary"
                      : item.action === "approve"
                        ? "default"
                        : "secondary"
                  }
                  onClick={() => setAction(item)}
                >
                  {item.action === "approve" ? (
                    <Check />
                  ) : item.action === "admin-cancel" ? (
                    <Ban />
                  ) : item.action === "reject" ? (
                    <X />
                  ) : (
                    <MessageCircleWarning />
                  )}
                  {item.label}
                </Button>
                ))}
              {!registration.reviewCapabilities.length && (
                <p className="text-sm text-muted-foreground">
                  No review actions are available for this status.
                </p>
              )}
              <p className="pt-2 text-xs leading-5 text-muted-foreground">
                Every decision is checked against revision{" "}
                {registration.revision}. Backend permissions and event scope
                remain authoritative.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
      <ReviewDialog
        config={action}
        registration={registration}
        close={() => setAction(undefined)}
         reload={() => detail.refetch()}
      />
    </PageLayout>
  );
}

export const Answers = ({
  registration,
}: {
  registration: RegistrationDetail;
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        Registration answers
      </CardTitle>
    </CardHeader>
    <CardContent>
      {!registration.answersVisible ? (
        <div className="flex gap-3 rounded-xl border border-border bg-muted/40 p-4">
          <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold">Answers are restricted</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              You can review registration status, identity, and history, but
              your account does not have the `view_event_answers` permission.
            </p>
          </div>
        </div>
      ) : registration.sections.length ? (
        <div className="space-y-4">
          {[...registration.sections]
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((section) => (
              <section
                key={section.id}
                className="overflow-hidden rounded-xl border"
              >
                <div className="border-b bg-muted/30 px-4 py-3">
                  <h3 className="font-semibold">{section.title}</h3>
                </div>
                <dl className="divide-y">
                  {section.answers.map(({ question, answer }) => (
                    <div key={question.id} className="p-4">
                      <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        {question.label}
                      </dt>
                      <dd className="mt-2 text-sm leading-6">
                        <AnswerValue
                          fieldType={question.fieldType}
                          answer={answer}
                        />
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No answers were submitted for this registration.
        </p>
      )}
    </CardContent>
  </Card>
);

export const RosterReadiness = ({
  registration,
}: {
  registration: RegistrationDetail;
}) => {
  const roster = registration.rosterSummary;
  const readiness = registration.readiness;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="h-5 w-5 text-primary" />
          Roster readiness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid gap-4 sm:grid-cols-4">
          <Detail label="Fixed seats" value={String(registration.seatCount)} />
          <Detail
            label="Seats claimed"
            value={`${readiness.claimedSeatCount}/${registration.seatCount}`}
          />
          <Detail
            label="Pending invitations"
            value={String(roster.pendingInvitationCount)}
          />
          <Detail label="Open slots" value={String(roster.pendingSlotCount)} />
        </dl>
        <div className="rounded-lg border bg-muted/30 p-3 text-sm">
          <p className="font-semibold">
            Response readiness: {readiness.completedResponseCount}/
            {readiness.requiredResponseCount} required responses complete
          </p>
          <p className="mt-1 text-muted-foreground">
            {readiness.responsesComplete
              ? "All required responses are complete."
              : "Required responses are still incomplete."}{" "}
            {readiness.submittable
              ? "The order is ready to submit."
              : "The order is not ready to submit."}
          </p>
          {readiness.blockerCodes.length > 0 && (
            <p className="mt-2 text-semantic-danger">
              Blockers: {readiness.blockerCodes.map(titleCase).join(", ")}
            </p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Active-member aggregate: {roster.activeMemberCount}. Invitation identities are intentionally not exposed.
        </p>
      </CardContent>
    </Card>
  );
};

const AnswerValue = ({
  fieldType,
  answer,
}: {
  fieldType: string;
  answer: RegistrationDetail["sections"][number]["answers"][number]["answer"];
}) => {
  if (fieldType === "FILE" || answer.type === "FILE")
    return (
      <span className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-muted-foreground">
        <FileText className="h-4 w-4" />
        {answer.fileAvailable
          ? "File submitted - preview unavailable in this phase"
          : "File unavailable"}
      </span>
    );
  if (Array.isArray(answer.value))
    return answer.value.length ? (
      <ul className="flex flex-wrap gap-2">
        {answer.value.map((value) => (
          <li key={value}>
            <Badge variant="neutral">{value}</Badge>
          </li>
        ))}
      </ul>
    ) : (
      <span className="text-muted-foreground">No answer</span>
    );
  if (answer.value === null || answer.value === "")
    return <span className="text-muted-foreground">No answer</span>;
  return (
    <span className="whitespace-pre-wrap break-words">
      {String(answer.value)}
    </span>
  );
};

const Detail = ({
  label,
  value,
  secondary,
}: {
  label: string;
  value: string;
  secondary?: string;
}) => (
  <div>
    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
      {label}
    </dt>
    <dd className="mt-1 font-semibold">{value}</dd>
    {secondary && (
      <dd className="mt-0.5 break-all text-xs text-muted-foreground">
        {secondary}
      </dd>
    )}
  </div>
);

const ReviewDialog = ({
  config,
  registration,
  close,
  reload,
}: {
  config?: ActionConfig;
  registration: RegistrationDetail;
  close: () => void;
  reload: () => Promise<unknown>;
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const mutation = useReviewRegistration(config?.action ?? "approve");
  const requiresReason = config?.action !== "approve";
  const confirm = () => {
    if (!config) return;
    mutation.mutate(
      {
        registrationId: registration.id,
        revision: registration.revision,
        reason: reason.trim() || undefined,
      },
      {
        onSuccess: () => {
          setReason("");
          setError("");
          close();
        },
        onError: async (failure) => {
          setError(registrationReviewError(failure));
          if (registrationReviewConflict(failure) === "revision") {
            setRefreshing(true);
            await reload();
            setRefreshing(false);
            setError(
              "Latest details loaded. Review the updated registration before trying again.",
            );
          }
        },
      },
    );
  };
  const dismiss = () => {
    setReason("");
    setError("");
    close();
  };
  return (
    <Dialog open={Boolean(config)} onOpenChange={(open) => !open && dismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{config?.label} registration?</DialogTitle>
          <DialogDescription>
            {requiresReason
              ? "Provide a clear reason. It becomes part of the registration history."
              : `Confirm this buyer's whole order for ${registration.package.name} (${registration.seatCount} fixed seats).`}
          </DialogDescription>
        </DialogHeader>
        {registration.status === "CANCELLED" && (
          <Warning>
            This registration is already cancelled. The backend will reject
            invalid lifecycle transitions.
          </Warning>
        )}
        <label className="space-y-2">
          <span className="text-sm font-semibold">
            Reason {requiresReason ? "*" : "(optional)"}
          </span>
          <textarea
            aria-label="Reason"
            rows={4}
            maxLength={1000}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="w-full rounded-lg border border-input bg-card p-3 text-sm"
            placeholder="Explain the review decision"
          />
        </label>
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-semantic-danger-background p-3 text-sm text-semantic-danger"
          >
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={dismiss}>
            Keep reviewing
          </Button>
          <Button
            variant={config?.destructive ? "destructive" : "default"}
            disabled={
              mutation.isPending || refreshing || (requiresReason && !reason.trim())
            }
            onClick={confirm}
          >
            {refreshing
              ? "Loading latest details..."
              : mutation.isPending
              ? "Saving..."
              : `Confirm ${config?.label.toLowerCase() ?? "action"}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
