import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Plus,
  Search,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Container, PageLayout } from "@/components/Utils";
import { StatusBadge } from "@/components/events/StatusBadge";
import { shortDate } from "@/components/events/helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EventStatus } from "@/types/events";

import { EmptyState } from "./components";
import { useEventsStore } from "./store";

const countLabel = (count: number, singular: string) =>
  `${count} ${singular}${count === 1 ? "" : "s"}`;

export default function EventsPage() {
  const { data } = useEventsStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<EventStatus | "ALL">("ALL");
  const hasFilters = query.trim().length > 0 || status !== "ALL";

  const filtered = useMemo(
    () =>
      data.events
        .filter((event) => {
          const search = `${event.name} ${event.publicDescription ?? ""}`.toLowerCase();
          return (
            search.includes(query.trim().toLowerCase()) &&
            (status === "ALL" || event.status === status)
          );
        })
        .sort(
          (a, b) =>
            new Date(b.updatedAt ?? b.createdAt).getTime() -
            new Date(a.updatedAt ?? a.createdAt).getTime(),
        ),
    [data.events, query, status],
  );

  const clearFilters = () => {
    setQuery("");
    setStatus("ALL");
  };

  return (
    <PageLayout
      icon={CalendarDays}
      title="Events"
      actions={
        <Button asChild>
          <Link to="/events/new">
            <Plus />
            Create event
          </Link>
        </Button>
      }
    >
      <Container>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold leading-7 tracking-tight">
            Events ({filtered.length})
          </h2>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_13rem]">
          <label className="relative">
            <span className="sr-only">Search events</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 stroke-[1.75] text-muted-foreground"
            />
            <Input
              className="pl-10"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search event name or description"
            />
          </label>
          <Select items={{ ALL: "All statuses", DRAFT: "Draft", PUBLISHED: "Published", CLOSED: "Closed", ARCHIVED: "Archived" }} value={status} onValueChange={(value) => setStatus(value as EventStatus | "ALL")}>
            <SelectTrigger aria-label="Filter event status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length ? (
          <div className="grid gap-3">
            {filtered.map((event) => {
              const subevents = data.subevents.filter(
                (subevent) => subevent.eventId === event.id,
              );
              const subeventIds = new Set(subevents.map((subevent) => subevent.id));
              const registrations = data.registrations.filter((registration) =>
                subeventIds.has(registration.subeventId),
              );
              const hasCover =
                event.coverImageUrl && event.coverImageUrl !== "/himti-icon.svg";

              return (
                <Card
                  key={event.id}
                  className="group overflow-hidden transition-[border-color,box-shadow,transform,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/20 hover:shadow-md motion-reduce:transform-none"
                >
                  <CardContent className="p-0">
                    <Link
                      to={`/events/${event.id}`}
                      aria-label={`Open ${event.name} workspace`}
                      className="grid min-h-28 cursor-pointer grid-cols-[5rem_minmax(0,1fr)_2.75rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:grid-cols-[7rem_minmax(0,1fr)_3.5rem]"
                    >
                      <div className="bg-gradient-to-br from-brand-primary-1 to-primary">
                        {hasCover && (
                          <img
                            src={event.coverImageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <div className="min-w-0 px-4 py-4 sm:px-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="min-w-0 truncate text-base font-bold leading-6 sm:text-lg">
                            {event.name}
                          </h3>
                          <StatusBadge status={event.status} />
                        </div>
                        <p className="mt-1 line-clamp-1 text-sm leading-6 text-muted-foreground">
                          {event.publicDescription || "No public description yet."}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
                            {countLabel(subevents.length, "subevent")}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <UsersRound aria-hidden="true" className="h-3.5 w-3.5" />
                            {countLabel(registrations.length, "registration")}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                            Updated {shortDate(event.updatedAt ?? event.createdAt)}
                          </span>
                        </div>
                      </div>

                      <span className="flex items-center justify-center text-muted-foreground transition-[color,transform] duration-200 group-hover:translate-x-1 group-hover:text-foreground motion-reduce:transform-none">
                        <ChevronRight aria-hidden="true" className="h-5 w-5" />
                      </span>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title={data.events.length ? "No events match these filters" : "Create your first event"}
            description={
              data.events.length
                ? "Clear the search or choose another status."
                : "Events are the starting point for every registration workflow."
            }
            action={
              data.events.length ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/events/new">
                    <Plus />
                    Create event
                  </Link>
                </Button>
              )
            }
          />
        )}
      </Container>
    </PageLayout>
  );
}
