import { useMemo, useState } from "react";
import { FaCalendarAlt, FaPlus } from "react-icons/fa";

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
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<EventStatusFilter>("ALL");
  const [visibility, setVisibility] = useState<VisibilityFilter>("ALL");
  const [sort, setSort] = useState<EventSort>("NEWEST");
  const [expandedEventIds, setExpandedEventIds] = useState<Set<string>>(
    () => new Set([mockEvents[0].id]),
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
      icon={FaCalendarAlt}
      title="Events"
      actions={
        <Button type="button" className="max-sm:px-3">
          <FaPlus />
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
        <div className="rounded-xl bg-white px-6 py-14 text-center shadow-sm">
          <FaCalendarAlt
            aria-hidden="true"
            className="mx-auto h-10 w-10 text-semantic-foreground/35"
          />
          <h3 className="mt-4 text-ds-h4">No matching events</h3>
          <p className="mx-auto mt-2 max-w-md text-ds-body text-semantic-foreground/70">
            Try a different search term or reset the status and visibility filters.
          </p>
        </div>
      )}
    </PageLayout>
  );
};

export default EventsPage;
