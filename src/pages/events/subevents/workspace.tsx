import { useEffect, useState, type FormEvent } from "react";
import type { AxiosError } from "axios";
import { CalendarClock, Edit3, ExternalLink, MapPin, Tags } from "lucide-react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";

import {
  useGetEvents,
  useGetSubevent,
  useUpdateSubevent,
} from "@/api/events/queries";
import { PageLayout } from "@/components/Utils";
import { ExpandableMarkdown } from "@/components/expandable-markdown";
import { ImagePreview } from "@/components/events/ImagePreview";
import { MarkdownTextarea } from "@/components/markdown-textarea";
import { ResourceMarkdown } from "@/components/resource-markdown";
import { dateTime, titleCase } from "@/components/events/helpers";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Subevent,
  SubeventStatus,
  SubeventType,
  SubeventVisibility,
} from "@/types/events";
import { getSafeHttpUrl, normalizeHttpUrlInput } from "@/utils/http-url";
import {
  EmptyState,
  IconBox,
  WorkspaceHeader,
  WorkspaceTabs,
  type WorkspaceSection,
} from "../components";
import {
  combineEventDateTime,
  normalizeOptionalEventUrl,
  splitEventDateTime,
} from "../event-form";
import { FormsList } from "./forms-list";
import {
  localDateTime,
  registrationSettingsPayload,
} from "./registration-settings";
import { RegistrationQueue } from "./registration-queue";

const sections: WorkspaceSection[] = [
  "overview",
  "registration-setup",
  "forms",
  "payment",
  "registrations",
];
const statuses: SubeventStatus[] = ["DRAFT", "OPEN", "CLOSED", "CANCELLED"];
const types: SubeventType[] = [
  "MAIN_EVENT",
  "WORKSHOP",
  "SEMINAR",
  "COMPETITION",
  "WELCOMING_PARTY",
  "DOMESTIC_STUDY_TOUR",
  "INTERNATIONAL_STUDY_TOUR",
  "COMPANY_VISIT",
  "OTHER",
];
const visibilities: SubeventVisibility[] = [
  "PUBLIC",
  "INTERNAL",
  "INVITE_ONLY",
];
const apiError = (error: unknown) =>
  (error as AxiosError<{ message?: string; msg?: string }>).response?.data
    ?.message ??
  (error as AxiosError<{ msg?: string }>).response?.data?.msg ??
  "Failed to save subevent.";

export default function SubeventWorkspacePage() {
  const { eventId = "", subeventId = "", section } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const eventsQuery = useGetEvents();
  const subeventQuery = useGetSubevent(subeventId);
  const update = useUpdateSubevent(eventId);
  const [error, setError] = useState("");
  const event = eventsQuery.data?.data.find((item) => item.id === eventId);
  const subevent = subeventQuery.data;
  const active = sections.includes(section as WorkspaceSection)
    ? (section as WorkspaceSection)
    : "overview";
  if (
    (!eventsQuery.isLoading && !event) ||
    (subeventQuery.isError && !subevent)
  )
    return <Navigate to={event ? `/events/${eventId}` : "/events"} replace />;
  if (!event || !subevent)
    return (
      <PageLayout icon={CalendarClock} title="Subevent workspace">
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading subevent...
        </p>
      </PageLayout>
    );
  const basePath = `/events/${eventId}/subevents/${subeventId}`;
  const close = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("edit");
    setSearchParams(next);
  };
  const destination = getSafeHttpUrl(subevent.destinationUrl);

  return (
    <PageLayout
      icon={CalendarClock}
      title="Subevent workspace"
      breadcrumbs={["Tools", "Events", event.name, subevent.name]}
      backTo={`/events/${eventId}`}
    >
      <WorkspaceHeader
        eyebrow="Subevent"
        title={subevent.name}
        media={
          <ImagePreview
            src={subevent.posterUrl}
            alt={subevent.name}
            className="aspect-[16/5] max-h-80 w-full rounded-none"
          />
        }
        description={
          <>
            <ExpandableMarkdown>
              {subevent.publicDescription ||
                "No public description configured."}
            </ExpandableMarkdown>
          </>
        }
        status={subevent.status}
        actions={
          <>
            <Button variant="edit" asChild>
              <Link to={`${basePath}/overview?edit=true`}>
                <Edit3 />
                Edit
              </Link>
            </Button>
            {destination && (
              <Button size="sm" variant="secondary" asChild>
                <a href={destination} target="_blank" rel="noreferrer">
                  <ExternalLink />
                  Destination
                </a>
              </Button>
            )}
            <Select
              value={subevent.status}
              onValueChange={(status) =>
                update.mutate(
                  { id: subevent.id, status: status as SubeventStatus },
                  { onError: (failure) => setError(apiError(failure)) },
                )
              }
            >
              <SelectTrigger className="w-36" aria-label="Subevent status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />
      <WorkspaceTabs basePath={basePath} active={active} />
      {error && (
        <p role="alert" className="text-sm text-semantic-danger">
          {error}
        </p>
      )}
      {active === "overview" ? (
        <Overview subevent={subevent} />
      ) : active === "registration-setup" ? (
        <RegistrationSetup subevent={subevent} />
      ) : active === "forms" ? (
        <FormsList eventId={eventId} subeventId={subeventId} />
      ) : active === "registrations" ? (
        <RegistrationQueue eventId={eventId} subeventId={subeventId} />
      ) : (
        <PrototypeNotice section={active} />
      )}
      <EditDialog
        subevent={subevent}
        open={searchParams.get("edit") === "true"}
        close={close}
      />
    </PageLayout>
  );
}

const Overview = ({ subevent }: { subevent: Subevent }) => (
  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
    <Card>
      <CardHeader>
        <CardTitle>Subevent overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Public description
          </p>
          <ResourceMarkdown className="mt-2 text-sm leading-6 text-muted-foreground">
            {subevent.publicDescription || "No public description configured."}
          </ResourceMarkdown>
        </section>
        {subevent.privateDescription && (
          <section className="border-t pt-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Internal description
            </p>
            <ResourceMarkdown className="mt-2 text-sm leading-6 text-muted-foreground">
              {subevent.privateDescription}
            </ResourceMarkdown>
          </section>
        )}
      </CardContent>
    </Card>
    <Card className="self-start">
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3">
          <Info icon={CalendarClock} label="Date">
            {dateTime(subevent.date)}
          </Info>
          <Info icon={MapPin} label="Location">
            {subevent.locationName || "Pending"}
          </Info>
          <Info icon={Tags} label="Type">
            {titleCase(subevent.type)}
          </Info>
          <Info icon={Tags} label="Visibility">
            {titleCase(subevent.visibility)}
          </Info>
          <Info icon={Tags} label="Display position">
            {subevent.position + 1}
          </Info>
          <Info icon={Tags} label="Price">
            {subevent.price > 0 ? subevent.price : "Free"}
          </Info>
          <Info icon={Tags} label="Capacity">
            {subevent.maxParticipants ?? "Unlimited"}
          </Info>
        </dl>
      </CardContent>
    </Card>
  </div>
);
const Info = ({
  icon,
  label,
  children,
}: {
  icon: React.ComponentType;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex gap-3 rounded-lg border bg-muted/20 p-3">
    <IconBox icon={icon} className="h-9 w-9" />
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium">{children}</dd>
    </div>
  </div>
);
const PrototypeNotice = ({ section }: { section: string }) => (
  <EmptyState title={titleCase(section)} description="Coming soon!" />
);

export const RegistrationSetup = ({ subevent }: { subevent: Subevent }) => {
  const update = useUpdateSubevent(subevent.eventId);
  const [error, setError] = useState("");
  const [mode, setMode] = useState(subevent.registrationMode);
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      update.mutate(
        {
          id: subevent.id,
          ...registrationSettingsPayload(
            new FormData(event.currentTarget),
            subevent.status,
          ),
        },
        { onError: (failure) => setError(apiError(failure)) },
      );
    } catch (failure) {
      setError((failure as Error).message);
    }
  };
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Card>
        <CardHeader>
          <CardTitle>Registration setup</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={save}
            onChange={() => setError("")}
          >
            <Field label="Subevent status">
              <Select
                name="status"
                defaultValue={subevent.status}
                disabled={subevent.status === "CANCELLED"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                      disabled={
                        subevent.status === "CANCELLED" &&
                        status !== "CANCELLED"
                      }
                    >
                      {titleCase(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Registration flow">
              <Select
                name="registrationMode"
                value={mode}
                onValueChange={(value) => setMode(value as typeof mode)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTERNAL">
                    Built-in - register on this site
                  </SelectItem>
                  <SelectItem value="EXTERNAL">
                    External link - leave this site
                  </SelectItem>
                  <SelectItem value="DISABLED">No registration</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Approval">
              <Select
                name="approvalMode"
                defaultValue={subevent.approvalMode}
                disabled={mode !== "INTERNAL"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTO_APPROVE">Auto approve</SelectItem>
                  <SelectItem value="MANUAL_REVIEW">Manual review</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {mode === "EXTERNAL" && (
              <Field label="External destination" className="sm:col-span-2">
                <Input
                  name="destinationUrl"
                  type="url"
                  required
                  defaultValue={subevent.destinationUrl ?? ""}
                />
                <span className="text-xs text-muted-foreground">
                  Participants leave this site to register at this URL.
                </span>
              </Field>
            )}
            {mode === "INTERNAL" && (
              <>
                <label className="flex items-center gap-3 rounded-lg border p-3 sm:col-span-2">
                  <input
                    name="isRegistrationOpen"
                    type="checkbox"
                    defaultChecked={subevent.isRegistrationOpen}
                    disabled={subevent.status === "CANCELLED"}
                  />
                  <span>
                    <strong>Accept registrations now</strong>
                    <span className="block text-xs text-muted-foreground">
                      Choose status OPEN above and save both settings together.
                      Cancelled subevents are terminal.
                    </span>
                  </span>
                </label>
                <Field label="Registration opens">
                  <Input
                    name="registrationOpensAt"
                    type="datetime-local"
                    defaultValue={localDateTime(subevent.registrationOpensAt)}
                  />
                </Field>
                <Field label="Registration closes">
                  <Input
                    name="registrationClosesAt"
                    type="datetime-local"
                    defaultValue={localDateTime(subevent.registrationClosesAt)}
                  />
                </Field>
                <Field label="Cancellation cutoff">
                  <Input
                    name="cancellationClosesAt"
                    type="datetime-local"
                    defaultValue={localDateTime(subevent.cancellationClosesAt)}
                  />
                </Field>
                <Field label="Capacity">
                  <Input
                    name="maxParticipants"
                    type="number"
                    min="1"
                    defaultValue={subevent.maxParticipants ?? ""}
                  />
                </Field>
              </>
            )}
            {error && (
              <p
                role="alert"
                className="text-sm text-semantic-danger sm:col-span-2"
              >
                {error}
              </p>
            )}
            <div className="sm:col-span-2">
              <Button disabled={update.isPending}>
                {update.isPending ? "Saving..." : "Save registration setup"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card className="self-start">
        <CardHeader>
          <CardTitle>Current behavior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Registration flow:</strong>{" "}
            {subevent.registrationMode === "INTERNAL"
              ? "Built-in registration"
              : subevent.registrationMode === "EXTERNAL"
                ? "External link"
                : "No registration"}
          </p>
          <p>
            <strong>Native open flag:</strong>{" "}
            {subevent.isRegistrationOpen ? "Open" : "Closed"}
          </p>
          <p>
            <strong>Who can register:</strong> {titleCase(subevent.visibility)}
          </p>
          <p>
            <strong>Capacity:</strong> {subevent.maxParticipants ?? "Unlimited"}
          </p>
          <p className="text-muted-foreground">
            Visibility answers who is eligible. Registration flow answers
            whether they register on this site, on another site, or not at all.
            Built-in registration currently supports a free, one-seat package.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const EditDialog = ({
  subevent,
  open,
  close,
}: {
  subevent: Subevent;
  open: boolean;
  close: () => void;
}) => {
  const update = useUpdateSubevent(subevent.eventId);
  const [error, setError] = useState("");
  const [poster, setPoster] = useState(subevent.posterUrl ?? "");
  const initialDateTime = splitEventDateTime(subevent.date);
  useEffect(
    () => setPoster(subevent.posterUrl ?? ""),
    [subevent.posterUrl, open],
  );
  const save = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    const values = new FormData(formEvent.currentTarget);
    const name = String(values.get("name") ?? "").trim();
    if (!name) return setError("Subevent name is required.");
    try {
      update.mutate(
        {
          id: subevent.id,
          name,
          publicDescription: String(
            values.get("publicDescription") ?? "",
          ).trim(),
          privateDescription: String(
            values.get("privateDescription") ?? "",
          ).trim(),
          date: combineEventDateTime(values.get("date"), values.get("time")),
          type: String(values.get("type")) as SubeventType,
          visibility: String(values.get("visibility")) as SubeventVisibility,
          locationName: String(values.get("locationName") ?? "").trim(),
          locationUrl: normalizeOptionalEventUrl(
            values.get("locationUrl"),
            "location",
          ),
          posterUrl: normalizeOptionalEventUrl(
            values.get("posterUrl"),
            "poster",
          ),
          destinationUrl: normalizeOptionalEventUrl(
            values.get("destinationUrl"),
            "destination",
          ),
          price: Number(values.get("price")) || 0,
          paid: false,
          maxParticipants: Number(values.get("maxParticipants")) || undefined,
          maxTicketsPerUser: 1,
        },
        { onSuccess: close, onError: (failure) => setError(apiError(failure)) },
      );
    } catch (failure) {
      setError((failure as Error).message);
    }
  };
  return (
    <Dialog open={open} onOpenChange={(value) => !value && close()}>
      <DialogContent className="flex max-h-[calc(100vh-2rem)] max-w-3xl flex-col overflow-hidden p-0">
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <DialogHeader>
            <DialogTitle>Edit subevent content</DialogTitle>
            <DialogDescription>
              Update event details, destination, and ticketing.
            </DialogDescription>
          </DialogHeader>
          <form
            className="mt-4 grid gap-4 sm:grid-cols-2"
            onSubmit={save}
            onChange={() => setError("")}
          >
            <div className="sm:col-span-2 border-b pb-2">
              <h3 className="text-sm font-bold">Content</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                What members will see and what the team should remember.
              </p>
            </div>
            <Field label="Subevent name" className="sm:col-span-2">
              <Input name="name" defaultValue={subevent.name} />
            </Field>
            <Field label="Public description">
              <MarkdownTextarea
                name="publicDescription"
                defaultValue={subevent.publicDescription ?? ""}
                rows={4}
              />
            </Field>
            <Field label="Private description">
              <MarkdownTextarea
                name="privateDescription"
                defaultValue={subevent.privateDescription ?? ""}
                rows={4}
              />
            </Field>
            <div className="sm:col-span-2 border-b pb-2 pt-2">
              <h3 className="text-sm font-bold">Schedule and location</h3>
            </div>
            <Field label="Date">
              <Input
                name="date"
                type="date"
                defaultValue={initialDateTime.date}
              />
            </Field>
            <Field label="Time">
              <Input
                name="time"
                type="time"
                defaultValue={initialDateTime.time}
              />
            </Field>
            <Field label="Type">
              <select
                name="type"
                defaultValue={subevent.type}
                className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
              >
                {types.map((item) => (
                  <option key={item} value={item}>
                    {titleCase(item)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Visibility">
              <select
                name="visibility"
                defaultValue={subevent.visibility}
                className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
              >
                {visibilities.map((item) => (
                  <option key={item} value={item}>
                    {titleCase(item)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Venue">
              <Input
                name="locationName"
                defaultValue={subevent.locationName ?? ""}
              />
            </Field>
            <Field label="Location URL">
              <Input
                name="locationUrl"
                defaultValue={subevent.locationUrl ?? ""}
              />
            </Field>
            <Field label="Destination URL">
              <Input
                name="destinationUrl"
                defaultValue={subevent.destinationUrl ?? ""}
              />
            </Field>
            <Field label="Poster URL" className="sm:col-span-2">
              <Input
                name="posterUrl"
                value={poster}
                onChange={(change) => setPoster(change.target.value)}
              />
            </Field>
            <ImagePreview
              src={
                poster
                  ? (() => {
                      try {
                        return normalizeHttpUrlInput(poster);
                      } catch {
                        return null;
                      }
                    })()
                  : null
              }
              alt="Poster preview"
              className="h-40 w-full rounded-xl border sm:col-span-2"
            />
            <div className="sm:col-span-2 border-b pb-2 pt-2">
              <h3 className="text-sm font-bold">Ticketing</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Payment handling is not enabled yet. Price is shown for
                planning.
              </p>
            </div>
            <Field label="Price">
              <Input
                name="price"
                type="number"
                min="0"
                defaultValue={subevent.price}
              />
            </Field>
            <Field label="Maximum participants">
              <Input
                name="maxParticipants"
                type="number"
                min="1"
                defaultValue={subevent.maxParticipants ?? ""}
              />
            </Field>
            {error && (
              <p
                role="alert"
                className="text-sm text-semantic-danger sm:col-span-2"
              >
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="secondary" onClick={close}>
                Cancel
              </Button>
              <Button disabled={update.isPending}>
                {update.isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
const Field = ({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <label className={`space-y-2 ${className ?? ""}`}>
    <span className="block text-sm font-semibold">{label}</span>
    {children}
  </label>
);
