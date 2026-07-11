import { useMemo, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PageLayout } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { mockEvents } from "@/data/events";
import type {
  EventSort,
  EventStatusFilter,
  VisibilityFilter,
} from "@/types/events";
import { filterAndSortEvents } from "@/utils/events";

import { EventCard } from "./components/EventCard";
import { EventsToolbar } from "./components/EventsToolbar";

const EventsPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<EventStatusFilter>("ALL");
  const [visibility, setVisibility] = useState<VisibilityFilter>("ALL");
  const [sort, setSort] = useState<EventSort>("NEWEST");
  const [expandedEventIds, setExpandedEventIds] = useState<Set<string>>(
    () => new Set(),
  );

  const filteredEvents = useMemo(
    () =>
      filterAndSortEvents(mockEvents, { query, status, visibility, sort }),
    [query, sort, status, visibility],
  );

  const toggleEvent = (eventId: string) => {
    setExpandedEventIds((current) => {
      const next = new Set(current);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  return (
    <PageLayout
      icon={CalendarDays}
      title="Events"
      actions={
        <Button
          type="button"
          aria-label="Create event"
          className="max-sm:px-3"
          onClick={() => navigate("/events/create")}
        >
          <Plus />
          <span className="max-sm:hidden">Create Event</span>
          <span className="sm:hidden">Create</span>
        </Button>
      }
    >
      <EventsToolbar
        query={query}
        status={status}
        visibility={visibility}
        sort={sort}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
        onVisibilityChange={setVisibility}
        onSortChange={setSort}
      />

      {filteredEvents.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isExpanded={expandedEventIds.has(event.id)}
              onToggle={() => toggleEvent(event.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card px-5 py-12 text-center">
          <CalendarDays
            aria-hidden="true"
            className="mx-auto h-10 w-10 stroke-[1.5] text-muted-foreground"
          />
          <h2 className="mt-4 text-lg font-semibold">No matching events</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Try a different search term or reset the status and visibility filters.
          </p>
        </div>
      )}
    </PageLayout>
  );
};

export default EventsPage;
