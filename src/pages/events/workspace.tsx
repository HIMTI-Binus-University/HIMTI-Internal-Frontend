import {
  Archive,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Clock3,
  Edit3,
  MapPin,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { PageLayout } from "@/components/Utils";
import { StatusBadge } from "@/components/events/StatusBadge";
import { dateTime, percent, shortDate } from "@/components/events/helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EventStatus, SubeventStatus } from "@/types/events";

import { EmptyState, ProgressBar } from "./components";
import { useEventsStore } from "./store";

export default function EventWorkspacePage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { data, saveEvent, saveSubevent } = useEventsStore();
  const event = data.events.find((item) => item.id === eventId);

  if (!event) {
    return (
      <PageLayout icon={CalendarDays} title="Event not found" backTo="/events">
        <EmptyState
          title="This event does not exist"
          description="Return to Events and choose another workspace."
          action={
            <Button asChild>
              <Link to="/events">Back to Events</Link>
            </Button>
          }
        />
      </PageLayout>
    );
  }

  const subevents = data.subevents.filter((item) => item.eventId === event.id);
  const subeventIds = new Set(subevents.map((item) => item.id));
  const formCount = data.subeventForms.filter((item) =>
    subeventIds.has(item.subeventId),
  ).length;

  const changeSubeventStatus = (id: string, status: SubeventStatus) => {
    const item = data.subevents.find((subevent) => subevent.id === id);
    if (item) {
      saveSubevent({
        ...item,
        status,
        updatedAt: new Date().toISOString(),
        updatedBy: "admin-1",
      });
    }
  };

  const changeEventStatus = (status: EventStatus) => {
    saveEvent({
      ...event,
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: "admin-1",
    });
  };

  const hasCover = event.coverImageUrl && event.coverImageUrl !== "/himti-icon.svg";

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
            <div className="h-28 overflow-hidden rounded-xl bg-gradient-to-br from-brand-primary-1 to-primary sm:h-full sm:min-h-32">
              {hasCover && (
                <img
                  src={event.coverImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex min-w-0 flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
                Event
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  {event.name}
                </h1>
                <StatusBadge status={event.status} />
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {event.publicDescription || "No public description configured."}
              </p>
              <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays aria-hidden="true" className="h-4 w-4 text-primary" />
                    {subevents.length} {subevents.length === 1 ? "subevent" : "subevents"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ClipboardList aria-hidden="true" className="h-4 w-4 text-primary" />
                    {formCount} {formCount === 1 ? "form" : "forms"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="edit" asChild>
                    <Link to={`/events/${event.id}/edit`}>
                      <Edit3 />
                      Edit event
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => changeEventStatus(event.status === "ARCHIVED" ? "DRAFT" : "ARCHIVED")}
                  >
                    <Archive />
                    {event.status === "ARCHIVED" ? "Unarchive event" : "Archive event"}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="secondary" disabled={event.status === "ARCHIVED"}>
                        Status
                        <ChevronDown />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => changeEventStatus("DRAFT")}>Set to draft</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => changeEventStatus("PUBLISHED")}>Publish</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => changeEventStatus("CLOSED")}>Close</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <CardTitle className="text-xl">Subevents</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Open a subevent to manage its setup, forms, payment, and registrations.
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
          {subevents.length ? (
            <div className="grid gap-3">
              {subevents.map((subevent) => {
                const registrations = data.registrations.filter(
                  (item) => item.subeventId === subevent.id,
                );
                const occupied = registrations.filter(
                  (item) => item.status !== "DRAFT" && item.status !== "CANCELLED",
                ).length;
                const reviews = registrations.filter(
                  (item) => item.status === "PENDING_REVIEW",
                ).length;
                const workspace = `/events/${event.id}/subevents/${subevent.id}/overview`;

                return (
                  <Card
                    key={subevent.id}
                    className="overflow-hidden transition-colors hover:border-primary/30"
                  >
                    <CardContent className="p-0">
                      <div className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-lg font-bold">
                                {subevent.name}
                              </h3>
                              <StatusBadge status={subevent.status} />
                              {reviews > 0 && (
                                <span className="rounded-full bg-semantic-warning-background px-2.5 py-1 text-xs font-semibold text-semantic-warning">
                                  {reviews} need review
                                </span>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                aria-label={`Actions for ${subevent.name}`}
                              >
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={() => navigate(`${workspace}?edit=true`)}
                              >
                                <Edit3 />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={subevent.status === "ARCHIVED"}
                                onSelect={() =>
                                  changeSubeventStatus(subevent.id, "ARCHIVED")
                                }
                              >
                                <Archive />
                                {subevent.status === "ARCHIVED" ? "Archived" : "Archive"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                          <div className="flex min-w-0 gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                              <CalendarClock className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-muted-foreground">
                                Schedule
                              </p>
                              <p className="mt-0.5 text-sm font-medium">
                                {dateTime(subevent.startsAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex min-w-0 gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                              <MapPin className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-muted-foreground">
                                Location
                              </p>
                              <p className="mt-0.5 truncate text-sm font-medium">
                                {subevent.locationName || "Location pending"}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {subevent.locationAddress || "Address not configured"}
                              </p>
                            </div>
                          </div>
                          <div className="flex min-w-0 gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                              <CalendarDays className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-muted-foreground">
                                Registration deadline
                              </p>
                              <p className="mt-0.5 text-sm font-medium">
                                {shortDate(subevent.registrationClosesAt)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 border-t border-border pt-4">
                          <ProgressBar
                            value={percent(occupied, subevent.capacity)}
                            label={`${occupied} of ${subevent.capacity ?? "unlimited"} capacity occupied`}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock3 className="h-4 w-4" aria-hidden="true" />
                          Updated {shortDate(subevent.updatedAt ?? subevent.createdAt)}
                        </p>
                        <Button size="sm" variant="secondary" asChild>
                          <Link to={workspace}>Open workspace</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No subevents yet"
              description="Create the first occurrence, region, or schedule for this event."
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
