import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronRight, Clock3, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { useGetEvents } from "@/api/events/queries";
import { Container, PageLayout } from "@/components/Utils";
import { ImagePreview } from "@/components/events/ImagePreview";
import { StatusBadge } from "@/components/events/StatusBadge";
import { shortDate } from "@/components/events/helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { gsap, useGSAP } from "@/lib/motion";
import type { EventListItem, EventStatus } from "@/types/events";
import { EmptyState } from "./components";

const statuses: EventStatus[] = ["DRAFT", "PUBLISHED", "CLOSED", "CANCELLED"];

const EventRow = ({ event }: { event: EventListItem }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const card = cardRef.current;
    const arrow = arrowRef.current;
    if (!card || !arrow) return;

    const media = gsap.matchMedia();
    media.add(
      {
        reduceMotion: "(prefers-reduced-motion: reduce)",
        allowMotion: "(prefers-reduced-motion: no-preference)",
      },
      ({ conditions }) => {
        const move = (active: boolean) => {
          const vars = { y: active ? -2 : 0, x: active ? 4 : 0 };
          if (conditions?.reduceMotion) {
            gsap.set(card, { y: vars.y });
            gsap.set(arrow, { x: vars.x });
          } else {
            gsap.to(card, { y: vars.y, duration: 0.18, ease: "power2.out", overwrite: "auto" });
            gsap.to(arrow, { x: vars.x, duration: 0.18, ease: "power2.out", overwrite: "auto" });
          }
        };
        const enter = () => move(true);
        const leave = () => move(false);
        const focusOut = (focusEvent: FocusEvent) => {
          if (!card.contains(focusEvent.relatedTarget as Node | null)) leave();
        };
        card.addEventListener("pointerenter", enter);
        card.addEventListener("pointerleave", leave);
        card.addEventListener("focusin", enter);
        card.addEventListener("focusout", focusOut);
        return () => {
          card.removeEventListener("pointerenter", enter);
          card.removeEventListener("pointerleave", leave);
          card.removeEventListener("focusin", enter);
          card.removeEventListener("focusout", focusOut);
        };
      },
    );
    return () => media.revert();
  }, { scope: cardRef });

  return (
    <Card
      ref={cardRef}
      className="overflow-hidden transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-md focus-within:border-primary/40 focus-within:shadow-md"
    >
      <CardContent className="p-0">
        <Link
          to={`/events/${event.id}`}
          aria-label={`Open ${event.name} workspace`}
          className="grid min-h-28 grid-cols-[5rem_minmax(0,1fr)_2.75rem] sm:grid-cols-[7rem_minmax(0,1fr)_3.5rem]"
        >
          <ImagePreview
            src={event.coverImageUrl}
            alt={event.name}
            className="h-full w-full"
          />
          <div className="min-w-0 px-4 py-4 sm:px-5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-bold sm:text-lg">
                {event.name}
              </h3>
              <StatusBadge status={event.status} />
            </div>
            <p className="mt-1 line-clamp-1 text-sm leading-6 text-muted-foreground">
              {event.publicDescription || "No public description yet."}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {event.subevents.length} subevent
                {event.subevents.length === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                Updated {shortDate(event.updatedAt ?? event.createdAt)}
              </span>
            </div>
          </div>
          <span ref={arrowRef} className="flex items-center justify-center text-muted-foreground">
            <ChevronRight className="h-5 w-5" />
          </span>
        </Link>
      </CardContent>
    </Card>
  );
};

export default function EventsPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [status, setStatus] = useState<EventStatus | "ALL">("ALL");
  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedQuery(query.trim()),
      300,
    );
    return () => window.clearTimeout(timeoutId);
  }, [query]);
  const eventsQuery = useGetEvents(
    debouncedQuery,
    status === "ALL" ? undefined : status,
  );
  const events = eventsQuery.data?.data ?? [];
  const totalRecords = eventsQuery.data?.meta.totalRecords ?? 0;
  const clear = () => {
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
         <div className="mb-5">
           <h2 className="text-lg font-semibold leading-7 tracking-tight">Events ({totalRecords})</h2>
           <p className="mt-1 text-sm text-muted-foreground">
             Create and manage events for your community.
           </p>
         </div>
         <div className="mb-4 flex items-center justify-between gap-3">
           <h3 className="text-base font-semibold">Results</h3>
          {(query || status !== "ALL") && (
            <Button variant="ghost" size="sm" onClick={clear}>
              Clear filters
            </Button>
          )}
        </div>
        <div className="mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_13rem]">
          <div className="relative">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground" htmlFor="event-search">
              Search
            </label>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-[calc(50%+0.35rem)] h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
            <Input
              id="event-search"
              type="search"
              className="pl-10"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search event name or description"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground" htmlFor="event-status-filter">
              Status
            </label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as EventStatus | "ALL")}
            >
            <SelectTrigger id="event-status-filter" aria-label="Filter by event status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {statuses.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {eventsQuery.isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Loading events...
          </p>
        ) : eventsQuery.isError ? (
          <EmptyState
            icon={CalendarDays}
            title="Events could not be loaded"
            description="Check your connection and try again."
            action={
              <Button variant="secondary" onClick={() => eventsQuery.refetch()}>
                Try again
              </Button>
            }
          />
        ) : events.length ? (
          <div className="grid gap-3">
            {events.map((event) => <EventRow key={event.id} event={event} />)}
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title={
              debouncedQuery || status !== "ALL"
                ? "No events match these filters"
                : "Create your first event"
            }
            description={
              debouncedQuery || status !== "ALL"
                ? "Clear the search or choose another status."
                : "Events are the starting point for every registration workflow."
            }
            action={
              <Button
                variant={
                  debouncedQuery || status !== "ALL" ? "secondary" : "default"
                }
                onClick={debouncedQuery || status !== "ALL" ? clear : undefined}
                asChild={!debouncedQuery && status === "ALL"}
              >
                {debouncedQuery || status !== "ALL" ? (
                  "Clear filters"
                ) : (
                  <Link to="/events/new">
                    <Plus />
                    Create event
                  </Link>
                )}
              </Button>
            }
          />
        )}
      </Container>
    </PageLayout>
  );
}
