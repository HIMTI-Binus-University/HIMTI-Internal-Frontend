import { FaSearch } from "react-icons/fa";

import { Container } from "@/components/Utils";
import { Input } from "@/components/ui/input";
import type {
  EventSort,
  EventStatusFilter,
  VisibilityFilter,
} from "@/types/events";

interface EventsToolbarProps {
  query: string;
  status: EventStatusFilter;
  visibility: VisibilityFilter;
  sort: EventSort;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: EventStatusFilter) => void;
  onVisibilityChange: (value: VisibilityFilter) => void;
  onSortChange: (value: EventSort) => void;
}

const selectClassName =
  "h-10 rounded-md border border-input bg-white px-3 text-ds-body text-semantic-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const EventsToolbar = ({
  query,
  status,
  visibility,
  sort,
  onQueryChange,
  onStatusChange,
  onVisibilityChange,
  onSortChange,
}: EventsToolbarProps) => (
  <Container>
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-md">
        <FaSearch
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-semantic-foreground/55"
        />
        <Input
          aria-label="Search events and sub-events"
          className="pl-10 placeholder:text-semantic-foreground/55"
          placeholder="Search event or sub-event..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="sr-only" htmlFor="event-status-filter">
          Event status
        </label>
        <select
          id="event-status-filter"
          className={selectClassName}
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as EventStatusFilter)
          }
        >
          <option value="ALL">Status: All</option>
          <option value="DRAFT">Status: Draft</option>
          <option value="PUBLISHED">Status: Published</option>
          <option value="CLOSED">Status: Closed</option>
          <option value="CANCELLED">Status: Cancelled</option>
        </select>

        <label className="sr-only" htmlFor="event-visibility-filter">
          Sub-event visibility
        </label>
        <select
          id="event-visibility-filter"
          className={selectClassName}
          value={visibility}
          onChange={(event) =>
            onVisibilityChange(event.target.value as VisibilityFilter)
          }
        >
          <option value="ALL">Visibility: All</option>
          <option value="PUBLIC">Visibility: Public</option>
          <option value="INTERNAL">Visibility: Internal</option>
          <option value="INVITE_ONLY">Visibility: Invite only</option>
        </select>

        <label className="sr-only" htmlFor="event-sort">
          Sort events
        </label>
        <select
          id="event-sort"
          className={selectClassName}
          value={sort}
          onChange={(event) => onSortChange(event.target.value as EventSort)}
        >
          <option value="NEWEST">Sort: Newest</option>
          <option value="OLDEST">Sort: Oldest</option>
        </select>
      </div>
    </div>
  </Container>
);
