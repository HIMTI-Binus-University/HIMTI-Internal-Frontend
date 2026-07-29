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
import { ImagePreview } from "@/components/events/ImagePreview";
import { StatusBadge } from "@/components/events/StatusBadge";
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
const textarea =
  "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm leading-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
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
        description={
          <>
            <p>
              {subevent.publicDescription ||
                "No public description configured."}
            </p>
            <div className="mt-3 flex flex-wrap gap-5 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5">
                <Tags className="h-4 w-4 text-primary" />
                {titleCase(subevent.type)} · {titleCase(subevent.visibility)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4 text-primary" />
                {dateTime(subevent.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                {subevent.locationName || "Location pending"}
              </span>
            </div>
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
  <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
    <ImagePreview
      src={subevent.posterUrl}
      alt={subevent.name}
      className="h-80 w-full rounded-xl border"
    />
    <Card>
      <CardHeader>
        <CardTitle>Published card content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <StatusBadge status={subevent.status} />
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {subevent.publicDescription || "No public description configured."}
          </p>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Info icon={CalendarClock} label="Date">
            {dateTime(subevent.date)}
          </Info>
          <Info icon={MapPin} label="Location">
            {subevent.locationName || "Pending"}
          </Info>
          <Info icon={Tags} label="Visibility">
            {titleCase(subevent.visibility)}
          </Info>
          <Info icon={Tags} label="Display position">
            {subevent.position + 1}
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
  <EmptyState
    title={titleCase(section)}
    description="Coming soon!"
  />
);

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
          maxParticipants: Number(values.get("maxParticipants")) || undefined,
          maxTicketsPerUser:
            Number(values.get("maxTicketsPerUser")) || undefined,
        },
        { onSuccess: close, onError: (failure) => setError(apiError(failure)) },
      );
    } catch (failure) {
      setError((failure as Error).message);
    }
  };
  return (
    <Dialog open={open} onOpenChange={(value) => !value && close()}>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit subevent content</DialogTitle>
          <DialogDescription>
            Update persisted event-hub content and required backend fields.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={save}
          onChange={() => setError("")}
        >
          <Field label="Subevent name" className="sm:col-span-2">
            <Input name="name" defaultValue={subevent.name} />
          </Field>
          <Field label="Public description">
            <textarea
              name="publicDescription"
              defaultValue={subevent.publicDescription ?? ""}
              rows={4}
              className={textarea}
            />
          </Field>
          <Field label="Private description">
            <textarea
              name="privateDescription"
              defaultValue={subevent.privateDescription ?? ""}
              rows={4}
              className={textarea}
            />
          </Field>
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
            <Select name="type" defaultValue={subevent.type}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {types.map((item) => (
                  <SelectItem key={item} value={item}>
                    {titleCase(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Visibility">
            <Select name="visibility" defaultValue={subevent.visibility}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {visibilities.map((item) => (
                  <SelectItem key={item} value={item}>
                    {titleCase(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <Field label="Maximum tickets per user">
            <Input
              name="maxTicketsPerUser"
              type="number"
              min="1"
              defaultValue={subevent.maxTicketsPerUser ?? ""}
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
