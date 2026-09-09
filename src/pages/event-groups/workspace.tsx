import { Edit3, Layers3 } from "lucide-react";
import { useGetMe } from "@/api/auth/queries";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  useAddEventGroupOrganizer,
  useEventGroup,
  useEventGroupOrganizers,
  useTransitionEventGroup,
} from "@/api/event-groups/queries";
import { useGetEvents } from "@/api/events/queries";
import { PageLayout } from "@/components/Utils";
import { OrganizerManager } from "@/components/events/OrganizerManager";
import { ConfirmAction } from "@/components/events/ConfirmAction";
import { StatusBadge } from "@/components/events/StatusBadge";
import { ExpandableMarkdown } from "@/components/expandable-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { backendMessage, useNotification } from "@/components/notification";
export default function EventGroupWorkspacePage() {
  const { eventGroupId = "" } = useParams();
  const detail = useEventGroup(eventGroupId);
  const events = useGetEvents();
  const organizers = useEventGroupOrganizers(eventGroupId);
  const add = useAddEventGroupOrganizer(eventGroupId);
  const transition = useTransitionEventGroup();
  const notify = useNotification();
  const { data: me } = useGetMe();
  if (!detail.isLoading && !detail.data)
    return <Navigate to="/events" replace />;
  if (!detail.data)
    return (
      <PageLayout icon={Layers3} title="Event group">
        <p className="py-12 text-center">Loading...</p>
      </PageLayout>
    );
  const group = detail.data;
  const children =
    events.data?.filter((event) => event.eventGroupId === group.id) ?? [];
  return (
    <PageLayout
      icon={Layers3}
      title="Event group workspace"
      breadcrumbs={["Tools", "Event Groups", group.name]}
      backTo="/events"
    >
      <Card>
        <CardContent className="p-5">
          <div className="flex justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{group.name}</h1>
                <StatusBadge status={group.status} />
              </div>
              <ExpandableMarkdown className="mt-3 max-w-3xl text-sm text-muted-foreground">
                {group.publicDescription || "No public description."}
              </ExpandableMarkdown>
            </div>
            <Button variant="edit" asChild>
              <Link to={`/event-groups/${group.id}/edit`}>
                <Edit3 />
                Edit
              </Link>
            </Button>
          </div>
          <div className="mt-5 flex gap-2">
            {group.status === "DRAFT" && (
              <ConfirmAction
                label="Publish event group"
                successMessage="Event group published."
                description={`Make "${group.name}" publicly visible. This does not publish its events.`}
                onConfirm={() =>
                  transition.mutateAsync({ id: group.id, action: "publish" })
                }
              >
                <Button disabled={transition.isPending}>Publish</Button>
              </ConfirmAction>
            )}
            {group.status !== "ARCHIVED" && (
              <ConfirmAction
                label="Archive event group"
                successMessage="Event group archived."
                description={`Remove "${group.name}" from public event groups. Its events' statuses will not change.`}
                onConfirm={() =>
                  transition.mutateAsync({ id: group.id, action: "archive" })
                }
              >
                <Button variant="secondary" disabled={transition.isPending}>
                  Archive
                </Button>
              </ConfirmAction>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Events</CardTitle>
            <Button asChild>
              <Link to="/events/new">Create event</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {children.length ? (
            <div className="grid gap-2">
              {children.map((e) => (
                <Link
                  className="flex justify-between rounded-lg border p-3 hover:border-primary/40"
                  key={e.id}
                  to={`/events/${e.id}`}
                >
                  <span className="font-semibold">{e.name}</span>
                  <StatusBadge status={e.status} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No events in this group.
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <OrganizerManager
            organizers={organizers.data ?? []}
            isLoading={organizers.isLoading}
            isError={organizers.isError}
            canSearchUsers={me?.permissions.includes("manage_users") ?? false}
            isAdding={add.isPending}
            addError={add.isError}
            onAdd={(userId, role, done) =>
              add.mutate(
                { userId, role },
                {
                  onSuccess: () => {
                    done();
                    notify("Organizer added.");
                  },
                  onError: (cause) =>
                    notify(
                      backendMessage(cause, "Could not add organizer."),
                      "error",
                    ),
                },
              )
            }
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
}
