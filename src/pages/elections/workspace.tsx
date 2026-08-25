import { useState, type FormEvent } from "react";
import type { AxiosError } from "axios";
import {
  BarChart3,
  CheckCircle2,
  CalendarCheck,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Pencil,
  Plus,
  Users,
  Vote,
} from "lucide-react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";

import { useGetMe } from "@/api/auth/queries";
import {
  useCreateCandidate,
  useGetElection,
  useGetElectionTally,
  useGetElectionTurnout,
  useTransitionElection,
  useUpdateCandidate,
  useUpdateElectionDebateSchedule,
  useUpdateElectionPublicDetails,
} from "@/api/elections/queries";
import { Container, PageLayout } from "@/components/Utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import type {
  CandidatePayload,
  ElectionCandidate,
  ElectionStatus,
} from "@/types/elections";

const errorText = (error: unknown) =>
  (error as AxiosError<{ msg?: string; message?: string }>).response?.data
    .msg ??
  (error as AxiosError<{ message?: string }>).response?.data.message ??
  "The request failed.";
const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Not scheduled";
const lines = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
const optional = (value: FormDataEntryValue | null) =>
  String(value ?? "").trim() || null;
const candidateChecks = (candidate: ElectionCandidate) =>
  [
    ["Photo", Boolean(candidate.photoUrl)],
    ["Video", Boolean(candidate.videoUrl)],
    [
      "Vision & mission",
      Boolean(candidate.vision.trim() && candidate.mission.trim()),
    ],
    ["Work programs", candidate.workPrograms.length > 0],
    ["Organization experience", candidate.experiences.length > 0],
  ] as const;
const isCandidateReady = (candidate: ElectionCandidate) =>
  candidate.isActive &&
  candidateChecks(candidate).every(([, complete]) => complete);
const percentage = (votes: number, ballots: number) =>
  ballots > 0 ? (votes / ballots) * 100 : 0;

function CandidatePhoto({ candidate }: { candidate: ElectionCandidate }) {
  return (
    <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary/10 font-bold text-primary">
      <span aria-hidden="true">
        {candidate.name.trim().charAt(0).toUpperCase() || "?"}
      </span>
      {candidate.photoUrl && (
        <img
          src={candidate.photoUrl}
          alt={`${candidate.name} portrait`}
          className="absolute inset-0 size-full object-cover"
          onError={(event) => (event.currentTarget.style.display = "none")}
        />
      )}
    </div>
  );
}

const lifecycleCopy: Record<ElectionStatus, string> = {
  DRAFT:
    "Setup is still editable. Add at least two active candidates before opening voting.",
  OPEN: "Voting is live during the scheduled window. New ballots continue to be counted until voting closes.",
  CLOSED:
    "Voting has ended. Review the final tally and record consistency before publishing results.",
  PUBLISHED:
    "Voting is complete and the final results are visible on the public election website.",
};

function ElectionStage({ status }: { status: ElectionStatus }) {
  return (
    <Container className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <ClipboardCheck className="size-6" aria-hidden="true" />
      </span>
      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Current election stage
        </p>
        <div className="mt-1 flex items-center gap-2">
          <h3 className="text-xl font-bold">{status}</h3>
          <Badge>{status}</Badge>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {lifecycleCopy[status]}
        </p>
      </div>
    </Container>
  );
}
const localDate = (value: string | null) =>
  value ? new Date(value).toLocaleString("sv-SE").slice(0, 16) : "";

function DebateScheduleDialog({
  electionId,
  debateAt,
}: {
  electionId: string;
  debateAt: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const mutation = useUpdateElectionDebateSchedule(electionId);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate(
      { debateAt: value ? new Date(value).toISOString() : null },
      { onSuccess: () => setOpen(false) },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setValue(localDate(debateAt));
          mutation.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <Pencil />
          Edit debate schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Edit debate schedule</DialogTitle>
          <DialogDescription>
            Set the candidate debate date and time, or leave it empty to clear
            the schedule.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Debate date and time</span>
            <Input
              type="datetime-local"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </label>
          <p className="text-sm text-muted-foreground">
            This only changes the debate schedule. Voting dates and ballot
            configuration remain unchanged.
          </p>
          {mutation.isError && (
            <p role="alert" className="text-sm text-semantic-danger">
              {errorText(mutation.error)}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={mutation.isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PublicDetailsDialog({
  electionId,
  title,
  slug,
  description,
}: {
  electionId: string;
  title: string;
  slug: string;
  description: string | null;
}) {
  const [open, setOpen] = useState(false);
  const mutation = useUpdateElectionPublicDetails(electionId);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    mutation.mutate(
      {
        title: String(data.get("title") ?? "").trim(),
        slug: String(data.get("slug") ?? "").trim(),
        description: optional(data.get("description")),
      },
      { onSuccess: () => setOpen(false) },
    );
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) mutation.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <Pencil />
          Edit public details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Edit public details</DialogTitle>
          <DialogDescription>
            Update the election name and description shown to voters.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Title</span>
            <Input
              name="title"
              defaultValue={title}
              required
              minLength={3}
              maxLength={255}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Slug</span>
            <Input
              name="slug"
              defaultValue={slug}
              required
              minLength={3}
              maxLength={100}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            />
            <span className="block text-xs leading-5 text-muted-foreground">
              A required internal URL-safe identifier using lowercase letters,
              numbers, and hyphens. It is not currently shown publicly.
            </span>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Description</span>
            <textarea
              name="description"
              defaultValue={description ?? ""}
              maxLength={10000}
              rows={6}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          {mutation.isError && (
            <p role="alert" className="text-sm text-semantic-danger">
              {errorText(mutation.error)}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={mutation.isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save details"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LifecycleAction({
  id,
  action,
  label,
}: {
  id: string;
  action: "open" | "close" | "publish";
  label: string;
}) {
  const mutation = useTransitionElection(id, action);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={action === "close" ? "destructive" : "default"}>
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{label}?</AlertDialogTitle>
          <AlertDialogDescription>
            This lifecycle change takes effect immediately and cannot be undone
            from this workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {mutation.isError && (
          <p role="alert" className="text-sm text-semantic-danger">
            {errorText(mutation.error)}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              mutation.mutate(undefined);
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Working..." : label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function Overview({
  id,
  status,
  title,
  slug,
  description,
  startsAt,
  endsAt,
  debateAt,
}: {
  id: string;
  status: ElectionStatus;
  title: string;
  slug: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  debateAt: string | null;
}) {
  const turnout = useGetElectionTurnout(id);
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  const progress = Math.max(
    0,
    Math.min(100, ((Date.now() - start) / (end - start)) * 100),
  );
  const countsMatch = turnout.data?.valid;
  return (
    <div className="space-y-5">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Public details
            </p>
            <h3 className="mt-1 text-xl font-bold">{title}</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {description || "No public description has been added."}
            </p>
          </div>
          {(status === "DRAFT" || status === "OPEN") && (
            <PublicDetailsDialog
              electionId={id}
              title={title}
              slug={slug}
              description={description}
            />
          )}
        </div>
      </Container>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Voters recorded</CardTitle>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Accounts that have completed voting.
              </p>
            </div>
            <Users className="size-5 text-primary" aria-hidden="true" />
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {turnout.data?.participationCount ?? "-"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Anonymous ballots</CardTitle>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Candidate selections stored without voter identities.
              </p>
            </div>
            <Vote className="size-5 text-primary" aria-hidden="true" />
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {turnout.data?.ballotCount ?? "-"}
          </CardContent>
        </Card>
        <Card
          className={
            countsMatch
              ? "border-semantic-success-border bg-semantic-success-background"
              : turnout.data
                ? "border-semantic-danger-border bg-semantic-danger-background"
                : undefined
          }
        >
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Record consistency</CardTitle>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Voter records should equal anonymous ballots.
              </p>
            </div>
            {countsMatch ? (
              <CheckCircle2
                className="size-6 text-semantic-success"
                aria-hidden="true"
              />
            ) : (
              <CircleAlert
                className="size-6 text-semantic-danger"
                aria-hidden="true"
              />
            )}
          </CardHeader>
          <CardContent>
            <p
              className={`text-lg font-bold ${countsMatch ? "text-semantic-success" : turnout.data ? "text-semantic-danger" : "text-muted-foreground"}`}
            >
              {turnout.data
                ? turnout.data.valid
                  ? "Counts match"
                  : "Mismatch detected"
                : "Checking records..."}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {countsMatch
                ? "Every recorded voter has one anonymous ballot."
                : turnout.data
                  ? "Do not publish results until the records are investigated."
                  : "Waiting for the latest totals."}
            </p>
          </CardContent>
        </Card>
      </div>
      <Container>
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Clock3 className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-semibold">Election schedule</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The progress bar shows how much of the configured voting window
              has elapsed, not voter turnout.
            </p>
          </div>
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="font-medium text-muted-foreground">Voting starts</dt>
            <dd>{formatDate(startsAt)}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">Voting ends</dt>
            <dd>{formatDate(endsAt)}</dd>
          </div>
          <div className="space-y-2">
            <dt className="font-medium text-muted-foreground">
              Candidate debate
            </dt>
            <dd>{formatDate(debateAt)}</dd>
            {(status === "DRAFT" || status === "OPEN") && (
              <DebateScheduleDialog electionId={id} debateAt={debateAt} />
            )}
          </div>
        </dl>
        <div
          className="mt-5 h-2 overflow-hidden rounded-full bg-muted"
          aria-label={`Schedule progress ${Math.round(progress)} percent`}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {Math.round(progress)}% of the voting window has elapsed.
        </p>
      </Container>
    </div>
  );
}

function CandidateForm({
  electionId,
  candidate,
  close,
}: {
  electionId: string;
  candidate?: ElectionCandidate;
  close: () => void;
}) {
  const create = useCreateCandidate(electionId);
  const update = useUpdateCandidate(electionId);
  const [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload: CandidatePayload = {
      ballotNumber: Number(data.get("ballotNumber")),
      name: String(data.get("name") ?? "").trim(),
      photoUrl: optional(data.get("photoUrl")),
      biography: optional(data.get("biography")),
      slogan: optional(data.get("slogan")),
      vision: String(data.get("vision") ?? "").trim(),
      mission: String(data.get("mission") ?? "").trim(),
      videoUrl: optional(data.get("videoUrl")),
      workPrograms: lines(data.get("workPrograms")),
      experiences: lines(data.get("experiences")),
      position: Number(data.get("position")),
      isActive: data.get("isActive") === "on",
    };
    const options = {
      onSuccess: close,
      onError: (failure: unknown) => setError(errorText(failure)),
    };
    candidate
      ? update.mutate({ id: candidate.id, ...payload }, options)
      : create.mutate(payload, options);
  };
  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-xl border bg-muted/20 p-4"
    >
      <h3 className="font-semibold">
        {candidate ? `Edit ${candidate.name}` : "Add candidate"}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm">Name *</span>
          <Input
            name="name"
            required
            minLength={2}
            defaultValue={candidate?.name}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm">Ballot number *</span>
          <Input
            name="ballotNumber"
            type="number"
            min={1}
            required
            defaultValue={candidate?.ballotNumber}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm">Position *</span>
          <Input
            name="position"
            type="number"
            min={0}
            required
            defaultValue={candidate?.position ?? 0}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm">Photo URL</span>
          <Input
            name="photoUrl"
            type="url"
            defaultValue={candidate?.photoUrl ?? ""}
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-sm">Slogan</span>
          <Input name="slogan" defaultValue={candidate?.slogan ?? ""} />
        </label>
        {["biography", "vision", "mission", "workPrograms", "experiences"].map(
          (name) => (
            <label key={name} className="space-y-1 sm:col-span-2">
              <span className="text-sm capitalize">
                {name.replace(/([A-Z])/g, " $1")}
                {["vision", "mission"].includes(name)
                  ? " *"
                  : " (one per line)"}
              </span>
              <textarea
                className="flex w-full rounded-md border bg-background px-3 py-2 text-sm"
                name={name}
                rows={3}
                required={["vision", "mission"].includes(name)}
                defaultValue={
                  name === "workPrograms" || name === "experiences"
                    ? candidate?.[name].join("\n")
                    : (candidate?.[
                        name as "biography" | "vision" | "mission"
                      ] ?? "")
                }
              />
            </label>
          ),
        )}
        <label className="space-y-1 sm:col-span-2">
          <span className="text-sm">Video URL</span>
          <Input
            name="videoUrl"
            type="url"
            defaultValue={candidate?.videoUrl ?? ""}
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={candidate?.isActive ?? true}
          />{" "}
          Active
        </label>
      </div>
      {error && (
        <p role="alert" className="text-sm text-semantic-danger">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={close}>
          Cancel
        </Button>
        <Button disabled={create.isPending || update.isPending}>
          Save candidate
        </Button>
      </div>
    </form>
  );
}

function Candidates({
  electionId,
  candidates,
  draft,
}: {
  electionId: string;
  candidates: ElectionCandidate[];
  draft: boolean;
}) {
  const [editing, setEditing] = useState<ElectionCandidate | "new" | null>(
    null,
  );
  const update = useUpdateCandidate(electionId);
  const activeCount = candidates.filter(
    (candidate) => candidate.isActive,
  ).length;
  const readyCount = candidates.filter(isCandidateReady).length;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          [
            "Total candidates",
            candidates.length,
            "All candidates on this ballot",
          ],
          ["Active", activeCount, "Currently eligible to appear"],
          ["Ready", readyCount, "Active with all profile content"],
        ].map(([label, value, detail]) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-muted-foreground">
                {label}
              </p>
              <p className="mt-1 text-3xl font-bold">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        Ready means active with a photo, video, nonempty vision and mission, at
        least one work program, and at least one organization experience.
      </p>
      {draft && !editing && (
        <Button onClick={() => setEditing("new")}>
          <Plus />
          Add candidate
        </Button>
      )}
      {editing && (
        <CandidateForm
          electionId={electionId}
          candidate={editing === "new" ? undefined : editing}
          close={() => setEditing(null)}
        />
      )}
      {candidates
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((candidate) => (
          <Card key={candidate.id}>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
              <CandidatePhoto candidate={candidate} />
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                      Ballot {candidate.ballotNumber}
                    </Badge>
                    <h3 className="font-semibold">{candidate.name}</h3>
                    <Badge variant={candidate.isActive ? "success" : "neutral"}>
                      {candidate.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge
                      variant={
                        isCandidateReady(candidate) ? "success" : "warning"
                      }
                    >
                      {isCandidateReady(candidate)
                        ? "Ready"
                        : "Needs attention"}
                    </Badge>
                  </div>
                  {candidate.slogan && (
                    <p className="mt-1 text-sm italic text-muted-foreground">
                      &quot;{candidate.slogan}&quot;
                    </p>
                  )}
                </div>
                <ul
                  className="flex flex-wrap gap-2"
                  aria-label={`${candidate.name} readiness checklist`}
                >
                  {candidateChecks(candidate).map(([label, complete]) => (
                    <li
                      key={label}
                      className={`rounded-md px-2 py-1 text-xs font-medium ${complete ? "bg-semantic-success-background text-semantic-success" : "bg-semantic-warning-background text-semantic-warning"}`}
                    >
                      {complete ? "✓" : "!"} {label}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground">
                  {candidate.workPrograms.length} work program
                  {candidate.workPrograms.length === 1 ? "" : "s"} ·{" "}
                  {candidate.experiences.length} experience
                  {candidate.experiences.length === 1 ? "" : "s"}
                </p>
              </div>
              {draft && (
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      aria-label={`Toggle ${candidate.name} activation`}
                      checked={candidate.isActive}
                      onCheckedChange={(isActive) =>
                        update.mutate({ id: candidate.id, isActive })
                      }
                    />
                    Active
                  </label>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditing(candidate)}
                  >
                    <Pencil />
                    Edit
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
    </div>
  );
}

function Results({
  id,
  status,
  allowed,
}: {
  id: string;
  status: ElectionStatus;
  allowed: boolean;
}) {
  const available = status === "CLOSED" || status === "PUBLISHED";
  const query = useGetElectionTally(id, available && allowed);
  if (!available)
    return (
      <Container>
        <p className="text-sm text-muted-foreground">
          Tally is hidden until the election closes.
        </p>
      </Container>
    );
  if (!allowed)
    return (
      <Container>
        <p className="text-sm text-muted-foreground">
          You do not have permission to view election results.
        </p>
      </Container>
    );
  if (query.isLoading) return <p>Loading results...</p>;
  if (query.isError || !query.data)
    return (
      <p role="alert" className="text-sm text-semantic-danger">
        Results could not be loaded.
      </p>
    );
  const sorted = query.data.results.slice().sort((a, b) => b.votes - a.votes);
  const topVotes = sorted[0]?.votes ?? 0;
  const margin = query.data.isTie ? 0 : topVotes - (sorted[1]?.votes ?? 0);
  const winner = query.data.results.find(
    (item) => item.candidate.id === query.data?.winnerCandidateId,
  );
  const hasTally = query.data.results.length > 0;
  const readyToPublish = query.data.valid && hasTally;
  const heroTitle = query.data.isTie
    ? "Tie"
    : winner
      ? `Winner: ${winner.candidate.name}`
      : query.data.ballotCount === 0
        ? "No votes cast"
        : "No winner";
  return (
    <div className="space-y-4">
      <Container className="border-primary/20 bg-primary/5">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Final tally
        </p>
        <h3 className="mt-1 text-2xl font-bold">{heroTitle}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {topVotes} vote{topVotes === 1 ? "" : "s"} ·{" "}
          {percentage(topVotes, query.data.ballotCount).toFixed(1)}% of ballots
        </p>
      </Container>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Total ballots", query.data.ballotCount, "Anonymous votes cast"],
          [
            "Participation records",
            query.data.participationCount,
            "Completed voter records",
          ],
          [
            "Record consistency",
            query.data.valid ? "Match" : "Mismatch",
            "Participation equals ballots",
          ],
          [
            "Winning margin",
            margin,
            query.data.isTie ? "Tied result" : "Top votes minus second",
          ],
          [
            "Visibility",
            status === "PUBLISHED" ? "Public" : "Internal only",
            status === "PUBLISHED"
              ? "Published election results"
              : "Not published yet",
          ],
        ].map(([label, value, detail]) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">
                {label}
              </p>
              <p className="mt-1 text-xl font-bold">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {status === "CLOSED" && (
        <Container
          className={
            readyToPublish
              ? "border-semantic-success-border bg-semantic-success-background"
              : "border-semantic-warning-border bg-semantic-warning-background"
          }
        >
          <div className="flex items-start gap-3">
            {readyToPublish ? (
              <CheckCircle2
                className="size-5 shrink-0 text-semantic-success"
                aria-hidden="true"
              />
            ) : (
              <CircleAlert
                className="size-5 shrink-0 text-semantic-warning"
                aria-hidden="true"
              />
            )}
            <div>
              <h3 className="font-semibold">
                {readyToPublish ? "Ready to publish" : "Not ready to publish"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Publishing makes these results visible to the public.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2 text-xs">
                <li>
                  <Badge variant="success">Voting closed</Badge>
                </li>
                <li>
                  <Badge variant={query.data.valid ? "success" : "warning"}>
                    {query.data.valid ? "Counts match" : "Counts mismatch"}
                  </Badge>
                </li>
                <li>
                  <Badge variant={hasTally ? "success" : "warning"}>
                    {hasTally ? "Tally available" : "Tally unavailable"}
                  </Badge>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      )}
      {status === "PUBLISHED" && (
        <p className="rounded-lg border border-semantic-success-border bg-semantic-success-background p-3 text-sm font-medium text-semantic-success">
          Results are published and public.
        </p>
      )}
      <Container className="space-y-5">
        {sorted.map((result) => {
          const share = percentage(result.votes, query.data.ballotCount);
          const tied = query.data.isTie && result.votes === topVotes;
          const won = result.candidate.id === query.data.winnerCandidateId;
          return (
            <div key={result.candidate.id} className="flex gap-3">
              <CandidatePhoto candidate={result.candidate} />
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium">
                    {result.candidate.ballotNumber}. {result.candidate.name}
                  </span>
                  <span className="flex items-center gap-2">
                    {(won || tied) && (
                      <Badge variant={won ? "success" : "warning"}>
                        {won ? "Winner" : "Tied"}
                      </Badge>
                    )}
                    <strong>
                      {result.votes} · {share.toFixed(1)}%
                    </strong>
                  </span>
                </div>
                <div
                  className="h-4 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-label={`${result.candidate.name}: ${result.votes} votes, ${share.toFixed(1)} percent`}
                  aria-valuenow={share}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`h-full rounded-full ${result.votes === 0 ? "bg-muted-foreground/20" : won ? "bg-semantic-success" : tied ? "bg-semantic-warning" : "bg-primary"}`}
                    style={{
                      width: result.votes === 0 ? "0.35rem" : `${share}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </Container>
    </div>
  );
}

export default function ElectionWorkspacePage() {
  const { electionId = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const section = params.get("section") ?? "overview";
  const query = useGetElection(electionId);
  const me = useGetMe();
  if (query.isError) return <Navigate to="/elections" replace />;
  if (!query.data)
    return (
      <PageLayout icon={Vote} title="Election">
        <p>Loading election...</p>
      </PageLayout>
    );
  const election = query.data;
  const actions =
    election.status === "DRAFT" ? (
      <>
        <Button variant="secondary" asChild>
          <Link to={`/elections/${election.id}/edit`}>Edit draft</Link>
        </Button>
        <LifecycleAction id={election.id} action="open" label="Open election" />
      </>
    ) : election.status === "OPEN" ? (
      <LifecycleAction id={election.id} action="close" label="Close election" />
    ) : election.status === "CLOSED" ? (
      <LifecycleAction
        id={election.id}
        action="publish"
        label="Publish results"
      />
    ) : null;
  return (
    <PageLayout
      icon={Vote}
      title={election.title}
      backTo="/elections"
      actions={actions}
    >
      <div className="space-y-5">
        <ElectionStage status={election.status} />
        <div
          className="grid grid-cols-3 gap-2"
          role="tablist"
          aria-label="Election sections"
        >
          {[
            { id: "overview", label: "Overview", icon: CalendarCheck },
            { id: "candidates", label: "Candidates", icon: Users },
            { id: "results", label: "Results", icon: BarChart3 },
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              role="tab"
              aria-selected={section === id}
              variant={section === id ? "default" : "secondary"}
              onClick={() => setParams({ section: id })}
            >
              <Icon />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>
        {section === "candidates" ? (
          <Candidates
            electionId={election.id}
            candidates={election.candidates}
            draft={election.status === "DRAFT"}
          />
        ) : section === "results" ? (
          <Results
            id={election.id}
            status={election.status}
            allowed={!!me.data?.permissions.includes("view_election_results")}
          />
        ) : (
          <Overview
            id={election.id}
            status={election.status}
            title={election.title}
            slug={election.slug}
            description={election.description}
            startsAt={election.startsAt}
            endsAt={election.endsAt}
            debateAt={election.debateAt}
          />
        )}
      </div>
    </PageLayout>
  );
}
