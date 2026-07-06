import {
  FaCalendarAlt,
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaUsers,
} from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Event } from "@/types/events";

import { EventActionsMenu } from "./EventActionsMenu";
import { StatusBadge } from "./StatusBadge";
import { SubeventsList } from "./SubeventsList";

interface EventCardProps {
  event: Event;
  isExpanded: boolean;
  onToggle: () => void;
}

export const EventCard = ({ event, isExpanded, onToggle }: EventCardProps) => (
  <Card className="overflow-hidden border-0 shadow-sm">
    <div className="p-5 sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row">
          <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-secondary-2/35 sm:w-28">
            {event.coverImageUrl ? (
              <img
                src={event.coverImageUrl}
                alt=""
                className="h-20 w-20 object-contain"
              />
            ) : (
              <FaCalendarAlt
                aria-hidden="true"
                className="h-10 w-10 text-brand-primary-1/45"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-ds-h4 font-bold text-semantic-foreground">
              {event.name}
            </h3>
            {event.publicDescription && (
              <p className="mt-2 max-w-[70ch] text-ds-body text-semantic-foreground/70">
                {event.publicDescription}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusBadge status={event.status} />
              <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                <FaUsers aria-hidden="true" />
                {event.subevents.length} sub-events
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <Button type="button">
            <FaPlus />
            Add Sub-Event
          </Button>
          <EventActionsMenu />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${event.name}`}
            onClick={onToggle}
          >
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </Button>
        </div>
      </div>
    </div>

    {isExpanded && <SubeventsList subevents={event.subevents} />}
  </Card>
);
