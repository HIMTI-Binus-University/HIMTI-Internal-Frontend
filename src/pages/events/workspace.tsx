import {
  ArrowDown,
  ArrowUp,
  CalendarClock,
  CalendarDays,
  Edit3,
  ExternalLink,
  MapPin,
  Plus,
} from "lucide-react";
import type { AxiosError } from "axios";
import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import {
  useGetEvents,
  useGetSubevents,
  useOrderSubevents,
  useUpdateEvent,
  useUpdateSubevent,
} from "@/api/events/queries";
import { PageLayout } from "@/components/Utils";
import { ImagePreview } from "@/components/events/ImagePreview";
import { StatusBadge } from "@/components/events/StatusBadge";
import { dateTime, titleCase } from "@/components/events/helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EventStatus, SubeventStatus } from "@/types/events";
import { getSafeHttpUrl } from "@/utils/http-url";
import { EmptyState } from "./components";

const eventStatuses: EventStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "CLOSED",
  "CANCELLED",
];
const subeventStatuses: SubeventStatus[] = [
  "DRAFT",
  "OPEN",
  "CLOSED",
  "CANCELLED",
];
const message = (error: unknown, fallback: string) =>
  (error as AxiosError<{ message?: string; msg?: string }>).response?.data
    ?.message ??
  (error as AxiosError<{ msg?: string }>).response?.data?.msg ??
  fallback;

export default function EventWorkspacePage() {
  const { eventId = "" } = useParams();
  const eventsQuery = useGetEvents();
  const subeventsQuery = useGetSubevents(eventId);
  const updateEvent = useUpdateEvent();
  const updateSubevent = useUpdateSubevent(eventId);
  const orderSubevents = useOrderSubevents(eventId);
  const [error, setError] = useState("");
  const event = eventsQuery.data?.data.find((item) => item.id === eventId);
  const subevents = [...(subeventsQuery.data ?? [])].sort(
    (a, b) => a.position - b.position,
  );
  if (!eventsQuery.isLoading && !event)
    return <Navigate to="/events" replace />;
  if (!event)
    return (
      <PageLayout icon={CalendarDays} title="Event workspace">
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading event...
        </p>
      </PageLayout>
    );

  const move = (index: number, direction: -1 | 1) => {
    const ids = subevents.map((item) => item.id);
    [ids[index], ids[index + direction]] = [ids[index + direction], ids[index]];
    orderSubevents.mutate(ids, {
      onError: (failure) =>
        setError(message(failure, "Failed to reorder subevents.")),
    });
  };
  const destination = (value: string | null) => getSafeHttpUrl(value);

  return (
    <PageLayout
      icon={CalendarDays}
      title="Event workspace"
      breadcrumbs={["Tools", "Events", event.name]}
      backTo="/events"
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
            <ImagePreview
              src={event.coverImageUrl}
              alt={event.name}
              className="h-28 w-full rounded-xl sm:h-full sm:min-h-32"
            />
            <div className="flex min-w-0 flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
                Event
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold sm:text-2xl">{event.name}</h1>
                <StatusBadge status={event.status} />
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {event.publicDescription || "No public description configured."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="edit" asChild>
                  <Link to={`/events/${event.id}/edit`}>
                    <Edit3 />
                    Edit
                  </Link>
                </Button>
                <Select
                  value={event.status}
                  onValueChange={(status) =>
                    updateEvent.mutate(
                      { id: event.id, status: status as EventStatus },
                      {
                        onError: (failure) =>
                          setError(
                            message(failure, "Failed to update event status."),
                          ),
                      },
                    )
                  }
                >
                  <SelectTrigger className="w-40" aria-label="Event status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <CardTitle className="text-xl">Subevents</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage member-facing cards, visibility, status, and display
                order.
              </p>
            </div>
            <Button asChild>
              <Link to={`/events/${event.id}/subevents/new/details`}>
                <Plus />
                Create subevent
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {error && (
            <p role="alert" className="mb-4 text-sm text-semantic-danger">
              {error}
            </p>
          )}
          {subeventsQuery.isLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Loading subevents...
            </p>
          ) : subeventsQuery.isError ? (
            <EmptyState
              title="Subevents could not be loaded"
              description="Try loading this event again."
              action={
                <Button
                  variant="secondary"
                  onClick={() => subeventsQuery.refetch()}
                >
                  Try again
                </Button>
              }
            />
          ) : subevents.length ? (
            <div className="grid gap-3">
              {subevents.map((subevent, index) => (
                <Card key={subevent.id} className="overflow-hidden">
                  <CardContent className="grid gap-4 p-4 sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:items-center">
                    <ImagePreview
                      src={subevent.posterUrl}
                      alt={subevent.name}
                      className="h-20 w-20 rounded-lg"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-bold">{subevent.name}</h3>
                        <StatusBadge status={subevent.status} />
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                          {titleCase(subevent.visibility)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {subevent.publicDescription || "No public description."}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {dateTime(subevent.date)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {subevent.locationName || "Location pending"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <IconButton
                        label={`Move ${subevent.name} up`}
                        disabled={index === 0 || orderSubevents.isPending}
                        onClick={() => move(index, -1)}
                      >
                        <ArrowUp />
                      </IconButton>
                      <IconButton
                        label={`Move ${subevent.name} down`}
                        disabled={
                          index === subevents.length - 1 ||
                          orderSubevents.isPending
                        }
                        onClick={() => move(index, 1)}
                      >
                        <ArrowDown />
                      </IconButton>
                      {destination(subevent.destinationUrl) && (
                        <IconButton
                          label={`Open destination for ${subevent.name}`}
                          onClick={() =>
                            window.open(
                              destination(subevent.destinationUrl)!,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                        >
                          <ExternalLink />
                        </IconButton>
                      )}
                      <Select
                        value={subevent.status}
                        onValueChange={(status) =>
                          updateSubevent.mutate(
                            {
                              id: subevent.id,
                              status: status as SubeventStatus,
                            },
                            {
                              onError: (failure) =>
                                setError(
                                  message(
                                    failure,
                                    "Failed to update subevent status.",
                                  ),
                                ),
                            },
                          )
                        }
                      >
                        <SelectTrigger
                          className="w-32"
                          aria-label={`Status for ${subevent.name}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {subeventStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="secondary" asChild>
                        <Link
                          to={`/events/${event.id}/subevents/${subevent.id}/overview`}
                        >
                          Manage
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No subevents yet"
              description="Create the first member-facing card for this event."
              action={
                <Button asChild>
                  <Link to={`/events/${event.id}/subevents/new/details`}>
                    <Plus />
                    Create subevent
                  </Link>
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
