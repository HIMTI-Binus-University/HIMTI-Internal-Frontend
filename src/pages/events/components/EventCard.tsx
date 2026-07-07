import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Plus,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
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
  <Card className="overflow-hidden">
    <div className="p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row">
          <div className="flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-semantic-info-background sm:w-24">
            {event.coverImageUrl ? (
              <img
                src={event.coverImageUrl}
                alt=""
                className="h-16 w-16 object-contain"
              />
            ) : (
              <CalendarDays
                aria-hidden="true"
                className="h-9 w-9 stroke-[1.5] text-semantic-info"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold leading-7 text-foreground">
              {event.name}
            </h2>
            {event.publicDescription && (
              <p className="mt-1.5 max-w-[70ch] text-sm leading-6 text-muted-foreground">
                {event.publicDescription}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusBadge status={event.status} />
              <span className="inline-flex min-h-6 items-center gap-1.5 rounded-md border border-semantic-info-border bg-semantic-info-background px-2 py-0.5 text-xs font-semibold text-semantic-info">
                <UsersRound aria-hidden="true" className="h-3.5 w-3.5 stroke-[1.75]" />
                {event.subevents.length} sub-events
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <Button type="button">
            <Plus />
            Add Sub-Event
          </Button>
          <EventActionsMenu />
          <IconButton
            label={`${isExpanded ? "Collapse" : "Expand"} ${event.name}`}
            aria-expanded={isExpanded}
            onClick={onToggle}
          >
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </IconButton>
        </div>
      </div>
    </div>

    {isExpanded && <SubeventsList subevents={event.subevents} />}
  </Card>
);
