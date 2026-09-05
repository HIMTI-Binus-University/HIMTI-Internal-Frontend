import { useState } from "react";
import { CalendarDays, Layers3, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetMe } from "@/api/auth/queries";
import { useEventGroups } from "@/api/event-groups/queries";
import { useGetEvents } from "@/api/events/queries";
import { Container, PageLayout } from "@/components/Utils";
import { StatusBadge } from "@/components/events/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const { data: me } = useGetMe();
  const canManageGroups =
    me?.permissions.includes("manage_event_groups") ?? false;
  const query = useGetEvents(search);
  const groupsQuery = useEventGroups(search, canManageGroups);
  return (
    <PageLayout
      icon={CalendarDays}
      title="Events"
      actions={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {canManageGroups && (
            <Button variant="secondary" asChild>
              <Link to="/event-groups/new">
                <Layers3 />
                Create event group
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link to="/events/new">
              <Plus />
              Create event
            </Link>
          </Button>
        </div>
      }
    >
      <Container>
        {canManageGroups && (
          <section className="mb-8" aria-labelledby="event-groups-heading">
            <div className="mb-5">
              <h2 id="event-groups-heading" className="text-lg font-semibold">
                Event groups
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Organize related events under one shared identity.
              </p>
            </div>
            {groupsQuery.isLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Loading event groups...
              </p>
            ) : groupsQuery.isError ? (
              <p
                role="alert"
                className="py-8 text-center text-sm text-semantic-danger"
              >
                Event groups could not be loaded.
              </p>
            ) : !groupsQuery.data?.length ? (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No event groups found.
                </p>
                <Button className="mt-4" variant="secondary" asChild>
                  <Link to="/event-groups/new">Create event group</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {groupsQuery.data.map((group) => (
                  <Card key={group.id}>
                    <CardContent className="flex items-center justify-between gap-4 p-5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-bold">{group.name}</h3>
                          <StatusBadge status={group.status} />
                        </div>
                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                          {group.publicDescription || "No public description."}
                        </p>
                      </div>
                      <Button variant="secondary" asChild>
                        <Link to={`/event-groups/${group.id}`}>View</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        <section aria-labelledby="registerable-events-heading">
          <div className="mb-5">
            <h2
              id="registerable-events-heading"
              className="text-lg font-semibold"
            >
              Registerable events
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage event details, schedules, lifecycle, and organizers.
            </p>
          </div>
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events"
            />
          </div>
          {query.isLoading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Loading events...
            </p>
          ) : query.isError ? (
            <p
              role="alert"
              className="py-12 text-center text-sm text-semantic-danger"
            >
              Events could not be loaded.
            </p>
          ) : !query.data?.length ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No events found.
            </p>
          ) : (
            <div className="grid gap-3">
              {query.data.map((event) => (
                <Card key={event.id}>
                  <CardContent className="flex items-center justify-between gap-4 p-5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-bold">{event.name}</h3>
                        <StatusBadge status={event.status} />
                      </div>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {event.locationName || "Location pending"}
                        {event.startsAt
                          ? ` · ${new Date(event.startsAt).toLocaleString()}`
                          : ""}
                      </p>
                    </div>
                    <Button variant="secondary" asChild>
                      <Link to={`/events/${event.id}`}>View</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </Container>
    </PageLayout>
  );
}
