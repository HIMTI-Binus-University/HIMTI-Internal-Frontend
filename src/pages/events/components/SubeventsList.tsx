import { CalendarDays, FileText, UsersRound } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Event, Subevent } from "@/types/events";
import { formatSubeventType } from "@/utils/events";

import { StatusBadge } from "./StatusBadge";
import { SubeventDetailsDialog } from "./SubeventDetailsDialog";

const getCalendarParts = (date: string) => {
  const dateValue = new Date(date);
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
  const parts = formatter.formatToParts(dateValue);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    month: getPart("month").toUpperCase(),
    day: getPart("day"),
    time: `${getPart("hour")}:${getPart("minute")}`,
  };
};

const SubeventCard = ({ event, subevent }: { event: Event; subevent: Subevent }) => {
  const calendar = getCalendarParts(subevent.date);
  const capacity = subevent.maxParticipants
    ? `${subevent.participantCount} / ${subevent.maxParticipants} participants`
    : `${subevent.participantCount} participants`;

  return (
    <article aria-labelledby={`subevent-${subevent.id}`}>
      <Card className="flex min-w-0 flex-col p-4 transition-colors hover:border-primary/25">
      <div className="flex min-w-0 gap-3">
        <div className="flex h-20 w-16 shrink-0 flex-col items-center justify-center rounded-lg border border-semantic-info-border bg-semantic-info-background text-semantic-info">
          <span className="text-[11px] font-bold tracking-[0.08em]">{calendar.month}</span>
          <span className="text-2xl font-bold leading-7">{calendar.day}</span>
          <span className="text-xs font-semibold">{calendar.time}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 id={`subevent-${subevent.id}`} className="min-w-0 text-base font-semibold leading-6 text-foreground">
              {subevent.name}
            </h3>
            <StatusBadge status={subevent.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatSubeventType(subevent.type)} · {subevent.visibility.replace("_", " ")}
          </p>
          {subevent.publicDescription && (
            <p className="mt-2 line-clamp-1 text-sm leading-5 text-muted-foreground">
              {subevent.publicDescription}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="inline-flex items-center gap-1.5">
            <UsersRound aria-hidden="true" className="h-4 w-4 stroke-[1.75]" />
            {capacity}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays aria-hidden="true" className="h-4 w-4 stroke-[1.75]" />
            Registration {subevent.isRegistrationOpen ? "open" : "closed"}
          </span>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            aria-label={`Registration for ${subevent.name}`}
          >
            <FileText />
            Registration
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            aria-label={`Participants for ${subevent.name}`}
          >
            <UsersRound />
            Participants
          </Button>
          <SubeventDetailsDialog event={event} subevent={subevent} />
        </div>
      </div>
      </Card>
    </article>
  );
};

interface SubeventsListProps {
  event: Event;
  subevents: Subevent[];
}

export const SubeventsList = ({ event, subevents }: SubeventsListProps) => (
  <section aria-labelledby={`subevents-${event.id}`} className="border-t border-border bg-muted/20 p-5">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 id={`subevents-${event.id}`} className="text-sm font-semibold text-foreground">
        Sub-events
      </h3>
      <span className="rounded-md border border-border bg-card px-2 py-0.5 text-xs font-semibold text-muted-foreground">
        {subevents.length} {subevents.length === 1 ? "sub-event" : "sub-events"}
      </span>
    </div>

    <div className="grid gap-4">
      {subevents.map((subevent) => (
        <SubeventCard key={subevent.id} event={event} subevent={subevent} />
      ))}
    </div>
  </section>
);
