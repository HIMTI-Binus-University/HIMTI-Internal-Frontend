import { useMemo, useState } from "react";
import { Archive, CalendarDays, Clock3, Edit3, Eye, MoreHorizontal, Plus, Search, Send, UsersRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/Utils";
import { StatusBadge } from "@/components/events/StatusBadge";
import { shortDate } from "@/components/events/helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { EmptyState } from "./components";
import { useEventsStore } from "./store";
import type { EventStatus } from "@/types/events";

export default function EventsPage() {
  const { data, saveEvent } = useEventsStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<EventStatus | "ALL">("ALL");
  const filtered = useMemo(() => data.events.filter((event) => {
    const search = `${event.name} ${event.publicDescription ?? ""}`.toLowerCase();
    return search.includes(query.trim().toLowerCase()) && (status === "ALL" || event.status === status);
  }).sort((a, b) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime()), [data.events, query, status]);

  const updateStatus = (id: string, next: EventStatus) => { const event = data.events.find((item) => item.id === id); if (event) saveEvent({ ...event, status: next, updatedAt: new Date().toISOString(), updatedBy: "admin-1" }); };

  return <PageLayout icon={CalendarDays} title="Events" actions={<Button asChild><Link to="/events/new"><Plus />Create event</Link></Button>}>
    <div className="mb-6"><p className="max-w-3xl text-sm leading-6 text-muted-foreground">Create events, configure their subevents, and keep registration operations in one clear workspace.</p></div>
    <Card className="mb-6"><CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_13rem]"><label className="relative"><span className="sr-only">Search events</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search event name or description" /></label><label><span className="sr-only">Filter event status</span><select value={status} onChange={(event) => setStatus(event.target.value as EventStatus | "ALL")} className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="ALL">All statuses</option><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="CLOSED">Closed</option><option value="ARCHIVED">Archived</option></select></label></CardContent></Card>
    {filtered.length ? <div className="grid gap-4">{filtered.map((event) => { const subevents = data.subevents.filter((subevent) => subevent.eventId === event.id); const subeventIds = new Set(subevents.map((subevent) => subevent.id)); const registrations = data.registrations.filter((registration) => subeventIds.has(registration.subeventId)); return <Card key={event.id} className="group overflow-hidden transition-colors hover:border-primary/30"><CardContent className="p-0"><div className="grid md:grid-cols-[9rem_1fr_auto]"><div className="flex min-h-36 items-center justify-center bg-gradient-to-br from-brand-primary-1 to-primary p-5"><img src={event.coverImageUrl || "/himti-icon.svg"} alt="" className="h-20 w-20 object-contain brightness-0 invert" /></div><button type="button" onClick={() => navigate(`/events/${event.id}`)} className="min-w-0 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold leading-7">{event.name}</h2><StatusBadge status={event.status} /></div><p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-muted-foreground">{event.publicDescription || "No public description yet."}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground"><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{subevents.length} subevents</span><span className="inline-flex items-center gap-1.5"><UsersRound className="h-3.5 w-3.5" />{registrations.length} registrations</span><span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />Updated {shortDate(event.updatedAt ?? event.createdAt)}</span></div></button><div className="flex items-start justify-end gap-2 p-4 md:flex-col"><Button size="sm" asChild><Link to={`/events/${event.id}`}>Open</Link></Button><DropdownMenu><DropdownMenuTrigger asChild><Button size="sm" variant="secondary" aria-label={`Actions for ${event.name}`}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => navigate(`/events/${event.id}/edit`)}><Edit3 />Edit event</DropdownMenuItem><DropdownMenuItem><Eye />Preview</DropdownMenuItem>{event.status === "DRAFT" && <DropdownMenuItem onSelect={() => updateStatus(event.id, "PUBLISHED")}><Send />Publish</DropdownMenuItem>}{event.status === "PUBLISHED" && <DropdownMenuItem onSelect={() => updateStatus(event.id, "CLOSED")}><Archive />Close</DropdownMenuItem>}<DropdownMenuItem onSelect={() => updateStatus(event.id, "ARCHIVED")}><Archive />Archive</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></div></CardContent></Card>; })}</div> : <EmptyState icon={CalendarDays} title={data.events.length ? "No events match these filters" : "Create your first event"} description={data.events.length ? "Clear the search or choose another lifecycle status." : "Events are the starting point for every registration workflow."} action={<Button asChild><Link to="/events/new"><Plus />Create event</Link></Button>} />}
  </PageLayout>;
}
