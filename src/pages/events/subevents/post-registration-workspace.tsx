import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { AxiosError } from "axios";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  LockKeyhole,
  Search,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import {
  type PostRegistrationAssignment,
  usePostRegistrationAssignment,
  usePostRegistrationAssignments,
  useReopenPostRegistrationAssignment,
  useRequestPostRegistrationCorrection,
} from "@/api/post-registration/queries";
import { dateTime, titleCase } from "@/components/events/helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState, StatCard } from "../components";
import {
  completionOptions,
  readPostRegistrationFilters,
  validateTransitionReason,
} from "./post-registration-filters";

const apiError = (error: unknown) => {
  const response = (error as AxiosError<{ message?: string; msg?: string }>)
    .response;
  if (response?.status === 409)
    return "This response changed after you opened it. Close the dialog, refresh the row, and review the latest revision.";
  return (
    response?.data?.message ??
    response?.data?.msg ??
    "The operation could not be completed."
  );
};

export function PostRegistrationWorkspace({
  subeventId,
}: {
  subeventId: string;
}) {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readPostRegistrationFilters(params), [params]);
  const [search, setSearch] = useState(filters.search ?? "");
  const [selectedId, setSelectedId] = useState("");
  const queue = usePostRegistrationAssignments(subeventId, filters);
  const rows = queue.data?.data ?? [];
  const summary = queue.data?.summary;

  useEffect(() => setSearch(filters.search ?? ""), [filters.search]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search.trim() === (filters.search ?? "")) return;
      const next = new URLSearchParams(params);
      search.trim() ? next.set("search", search.trim()) : next.delete("search");
      next.set("page", "1");
      setParams(next, { replace: true });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [filters.search, params, search, setParams]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value === "ALL" ? next.delete(key) : next.set(key, value);
    if (key !== "page") next.set("page", "1");
    setParams(next);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-bold">Post-registration operations</h2>
          <p className="text-sm text-muted-foreground">
            Monitor follow-up forms and resolve completion blockers without
            changing attendance.
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Assigned"
          value={summary?.total ?? "-"}
          icon={FileCheck2}
        />
        <StatCard
          label="Completed"
          value={summary?.completed ?? "-"}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Required incomplete"
          value={summary?.requiredIncomplete ?? "-"}
          icon={Clock3}
          tone="warning"
        />
        <StatCard
          label="Check-in blocked"
          value={summary?.blockingIncomplete ?? "-"}
          icon={LockKeyhole}
          tone="danger"
        />
        <StatCard
          label="Overdue"
          value={summary?.overdue ?? "-"}
          icon={AlertTriangle}
          tone="danger"
        />
      </div>
      <Card>
        <CardContent className="grid gap-3 p-4 lg:grid-cols-[minmax(14rem,1fr)_repeat(3,minmax(10rem,auto))]">
          <label className="relative">
            <span className="sr-only">Search assignments</span>
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search participant, order, or form"
            />
          </label>
          <Filter
            label="Completion"
            value={filters.status ?? "ALL"}
            options={completionOptions}
            onChange={(value) => setFilter("completion", value)}
          />
          <Filter
            label="Required"
            value={
              filters.required === undefined ? "ALL" : String(filters.required)
            }
            options={["true", "false"]}
            labels={{ true: "Required", false: "Optional" }}
            onChange={(value) => setFilter("required", value)}
          />
          <Filter
            label="Check-in"
            value={
              filters.blocksCheckIn === undefined
                ? "ALL"
                : String(filters.blocksCheckIn)
            }
            options={["true", "false"]}
            labels={{ true: "Blocked", false: "Not blocked" }}
            onChange={(value) => setFilter("blocked", value)}
          />
        </CardContent>
      </Card>
      {queue.isError ? (
        <EmptyState
          title="Post-registration queue unavailable"
          description={apiError(queue.error)}
          action={<Button onClick={() => queue.refetch()}>Retry</Button>}
        />
      ) : !queue.isLoading && !rows.length ? (
        <EmptyState
          title="No assignments found"
          description="No post-registration assignments match these filters."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-4">Participant</th>
                  <th className="p-4">Form</th>
                  <th className="p-4">Window</th>
                  <th className="p-4">Completion</th>
                  <th className="p-4">Assignment</th>
                  <th className="p-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/20">
                    <td className="p-4">
                      <strong>{row.participant.name}</strong>
                      <span className="block text-xs text-muted-foreground">
                        {row.participant.email} · {audienceLabel(row.audience)}
                      </span>
                    </td>
                    <td className="p-4">
                      <strong>{row.formName}</strong>
                      <span className="block text-xs text-muted-foreground">
                        Version {row.version}
                      </span>
                    </td>
                    <td className="p-4 text-xs">
                      <span className="block">
                        Opens {dateTime(row.opensAt ?? undefined)}
                      </span>
                      <span className="block">
                        Closes {dateTime(row.closesAt ?? undefined)}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">
                        {titleCase(row.completion)}
                      </Badge>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {titleCase(row.availability)}
                      </span>
                    </td>
                    <td className="p-4 text-xs">
                      {audienceLabel(row.audience)}
                      <span className="block text-muted-foreground">
                        {row.isRequired ? "Required" : "Optional"}
                        {row.blocksCheckIn ? " · Blocks check-in" : ""}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedId(row.id)}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {queue.data && queue.data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span>
            Page {queue.data.meta.page} of {queue.data.meta.totalPages} ·{" "}
            {queue.data.meta.totalRecords} records
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={queue.data.meta.page <= 1}
              onClick={() =>
                setFilter("page", String(queue.data!.meta.page - 1))
              }
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={queue.data.meta.page >= queue.data.meta.totalPages}
              onClick={() =>
                setFilter("page", String(queue.data!.meta.page + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
      <AssignmentDialog
        assignmentId={selectedId}
        close={() => setSelectedId("")}
      />
    </div>
  );
}

function Filter({
  label,
  value,
  options,
  labels = {},
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  labels?: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
      {label}
      <select
        className="h-10 rounded-lg border bg-card px-3 text-sm text-foreground"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="ALL">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option] ?? titleCase(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function AssignmentDialog({
  assignmentId,
  close,
}: {
  assignmentId: string;
  close: () => void;
}) {
  const detail = usePostRegistrationAssignment(assignmentId);
  const correction = useRequestPostRegistrationCorrection();
  const reopen = useReopenPostRegistrationAssignment();
  const [action, setAction] = useState<"correction" | "reopen">();
  const [error, setError] = useState("");
  const assignment = detail.data;
  const canCorrect =
    assignment?.completion === "LOCKED" && Boolean(assignment.response);
  const canReopen =
    assignment?.availability === "OVERDUE" &&
    (assignment.completion === "NOT_STARTED" ||
      assignment.completion === "DRAFT");
  return (
    <Dialog
      open={Boolean(assignmentId)}
      onOpenChange={(open) => !open && close()}
    >
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assignment?.formName ?? "Assignment detail"}
          </DialogTitle>
          <DialogDescription>
            {assignment
              ? `Version ${assignment.version} · ${titleCase(assignment.completion)} · revision ${assignment.response?.revision ?? 0}`
              : "Loading exact assignment response..."}
          </DialogDescription>
        </DialogHeader>
        {detail.isError ? (
          <p
            role="alert"
            className="rounded-lg bg-semantic-danger-background p-3 text-sm text-semantic-danger"
          >
            {apiError(detail.error)}
          </p>
        ) : assignment ? (
          <div className="space-y-4">
            <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-3">
              <Detail
                label="Participant"
                value={assignment.participant.name}
                secondary={assignment.participant.email}
              />
              <Detail
                label="Assigned to"
                value={audienceLabel(assignment.audience)}
              />
              <Detail
                label="Window"
                value={`${dateTime(assignment.opensAt ?? undefined)} - ${dateTime(assignment.closesAt ?? undefined)}`}
              />
            </div>
            <Answers assignment={assignment} />
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={!canCorrect}
                onClick={() => {
                  setError("");
                  setAction("correction");
                }}
              >
                Request correction
              </Button>
              <Button
                variant="secondary"
                disabled={!canReopen}
                onClick={() => {
                  setError("");
                  setAction("reopen");
                }}
              >
                Reopen overdue
              </Button>
            </div>
            {!canCorrect && !canReopen && (
              <p className="text-xs text-muted-foreground">
                Correction is limited to an exact submitted response. Reopen is
                limited to overdue not-started or draft work.
              </p>
            )}
            {action && (
              <TransitionForm
                action={action}
                assignment={assignment}
                pending={correction.isPending || reopen.isPending}
                error={error}
                cancel={() => setAction(undefined)}
                submit={(payload) => {
                  const mutation =
                    action === "correction" ? correction : reopen;
                  mutation.mutate(
                    {
                      assignmentId: assignment.id,
                      revision: assignment.response?.revision ?? 0,
                      ...payload,
                    },
                    {
                      onSuccess: () => {
                        setAction(undefined);
                        setError("");
                      },
                      onError: (failure) => setError(apiError(failure)),
                    },
                  );
                }}
              />
            )}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Loading assignment...
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function Answers({
  assignment,
}: {
  assignment: PostRegistrationAssignment;
}) {
  if (!assignment.response)
    return (
      <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
        <LockKeyhole className="mb-2 h-5 w-5" />
        No response answers are available. This may be unstarted work or answers
        may be redacted by `view_event_answers` permission.
      </div>
    );
  if (!assignment.response.answers.length)
    return (
      <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
        <LockKeyhole className="mb-2 h-5 w-5" />
        No answer values were returned. The response may be empty, or answer
        values may be redacted because your account lacks the
        `view_event_answers` permission.
      </div>
    );
  const answers = new Map(
    assignment.response.answers.map((answer) => [answer.questionId, answer]),
  );
  return (
    <div className="space-y-3">
      {[...assignment.sections]
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((section) => (
          <section
            key={section.id}
            className="overflow-hidden rounded-xl border"
          >
            <h3 className="border-b bg-muted/30 px-4 py-3 font-semibold">
              {section.title}
            </h3>
            <dl className="divide-y">
              {[...section.questions]
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((question) => (
                  <div key={question.id} className="p-4">
                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {question.label}
                    </dt>
                    <dd className="mt-2 break-words text-sm">
                      <AnswerValue answer={answers.get(question.id)} />
                    </dd>
                  </div>
                ))}
            </dl>
          </section>
        ))}
    </div>
  );
}

const AnswerValue = ({
  answer,
}: {
  answer?: NonNullable<
    PostRegistrationAssignment["response"]
  >["answers"][number];
}) => {
  const values = answer?.selectedOptions.length
    ? answer.selectedOptions.map((option) => option.label)
    : answer?.value;
  if (Array.isArray(values))
    return values.length ? (
      <ul className="flex flex-wrap gap-2">
        {values.map((value) => (
          <li key={value}>
            <Badge variant="neutral">{value}</Badge>
          </li>
        ))}
      </ul>
    ) : (
      <span className="text-muted-foreground">No answer</span>
    );
  if (values === undefined || values === null || values === "")
    return <span className="text-muted-foreground">No answer</span>;
  return (
    <span className="whitespace-pre-wrap break-words">{String(values)}</span>
  );
};

const audienceLabel = (audience: PostRegistrationAssignment["audience"]) =>
  audience === "BUYER"
    ? "Registration buyer"
    : audience === "EACH_ATTENDEE"
      ? "This participant"
      : "All registered participants";

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
    <dt className="text-xs font-bold uppercase text-muted-foreground">
      {label}
    </dt>
    <dd className="mt-1 break-all text-sm">{value}</dd>
    {secondary && (
      <dd className="mt-0.5 break-all text-xs text-muted-foreground">
        {secondary}
      </dd>
    )}
  </div>
);

function TransitionForm({
  action,
  assignment,
  pending,
  error,
  cancel,
  submit,
}: {
  action: "correction" | "reopen";
  assignment: PostRegistrationAssignment;
  pending: boolean;
  error: string;
  cancel: () => void;
  submit: (payload: { reason: string; deadlineAt: string }) => void;
}) {
  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const reason = String(data.get("reason") ?? "");
    const deadline = String(data.get("deadline") ?? "");
    const issue = validateTransitionReason(reason, deadline);
    if (issue)
      return (
        (
          event.currentTarget.elements.namedItem(
            "reason",
          ) as HTMLTextAreaElement
        ).setCustomValidity(issue),
        event.currentTarget.reportValidity()
      );
    submit({
      reason: reason.trim(),
      deadlineAt: new Date(deadline).toISOString(),
    });
  };
  return (
    <form
      onSubmit={send}
      className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4"
    >
      <div>
        <h3 className="font-semibold">
          {action === "correction"
            ? "Request response correction"
            : "Reopen overdue assignment"}
        </h3>
        <p className="text-xs text-muted-foreground">
          Audited against response revision {assignment.response?.revision ?? 0}
          . Give the participant a clear reason and future deadline.
        </p>
      </div>
      <label className="grid gap-1 text-sm font-medium">
        Reason
        <textarea
          name="reason"
          required
          minLength={3}
          rows={3}
          className="rounded-lg border bg-card p-3"
          onInput={(event) => event.currentTarget.setCustomValidity("")}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Deadline
        <Input name="deadline" required type="datetime-local" />
      </label>
      {error && (
        <p role="alert" className="text-sm text-semantic-danger">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button disabled={pending}>
          {pending
            ? "Applying..."
            : action === "correction"
              ? "Send correction request"
              : "Reopen assignment"}
        </Button>
        <Button type="button" variant="secondary" onClick={cancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
