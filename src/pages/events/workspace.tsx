import {
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  Edit3,
  FileText,
  LayoutDashboard,
  MapPin,
  Settings2,
  Ticket,
  Users,
} from "lucide-react";
import { useGetMe } from "@/api/auth/queries";
import { useRegistrationSettings } from "@/api/event-registration/queries";
import {
  useAddEventOrganizer,
  useEventOrganizers,
  useGetEvent,
  useTransitionEvent,
} from "@/api/events/queries";
import { EventPackages } from "@/components/events/EventPackages";
import { OrganizerManager } from "@/components/events/OrganizerManager";
import { RegistrationFormBuilder } from "@/components/events/RegistrationFormBuilder";
import {
  PaymentSummary,
  RegistrationSettings,
} from "@/components/events/RegistrationSettings";
import { StatusBadge } from "@/components/events/StatusBadge";
import { ExpandableMarkdown } from "@/components/expandable-markdown";
import { PageLayout } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { UserMeResponse } from "@/types/auth";
import type { EventItem } from "@/types/events";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";

const sections = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "setup", label: "Registration setup", icon: Settings2 },
  { id: "packages", label: "Packages", icon: Ticket },
  { id: "form", label: "Registration form", icon: FileText },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "registrations", label: "Registrations", icon: Users },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck },
] as const;
type Section = (typeof sections)[number]["id"];

export default function EventWorkspacePage() {
  const { eventId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const detail = useGetEvent(eventId);
  const transition = useTransitionEvent();
  const organizers = useEventOrganizers(eventId);
  const add = useAddEventOrganizer(eventId);
  const { data: me } = useGetMe();
  const canManageRegistration =
    me?.permissions.includes("manage_event_registration") ?? false;
  const settings = useRegistrationSettings(eventId, canManageRegistration);
  if (!detail.isLoading && !detail.data)
    return <Navigate to="/events" replace />;
  if (!detail.data)
    return (
      <PageLayout icon={CalendarDays} title="Event">
        <p className="py-12 text-center">Loading...</p>
      </PageLayout>
    );
  const event = detail.data;
  const canManageEvents = me?.permissions.includes("manage_events") ?? false;
  const canManagePackages =
    me?.permissions.includes("manage_event_packages") ?? false;
  const canManageForm =
    me?.permissions.includes("manage_event_registration_form") ?? false;
  const isManager =
    me?.roles.includes("Admin") ||
    organizers.data?.some(
      (organizer) =>
        organizer.userId === me?.id && organizer.role === "MANAGER",
    ) ||
    event.eventGroup?.organizers?.some(
      (organizer) =>
        organizer.userId === me?.id && organizer.role === "MANAGER",
    ) ||
    false;
  const canEditEvent = canManageEvents && isManager;
  const requested = searchParams.get("section") as Section | null;
  const visibleSections = sections.filter((item) => {
    if (["setup", "payment", "registrations", "attendance"].includes(item.id))
      return (
        canManageRegistration &&
        (item.id !== "attendance" || settings.data?.attendanceEnabled)
      );
    if (item.id === "packages") return canManagePackages;
    if (item.id === "form") return canManageForm;
    return true;
  });
  const active = visibleSections.some(({ id }) => id === requested)
    ? requested!
    : "overview";
  const action =
    event.status === "DRAFT"
      ? "publish"
      : event.status === "PUBLISHED"
        ? "close"
        : null;
  return (
    <PageLayout
      icon={CalendarDays}
      title="Event workspace"
      breadcrumbs={["Tools", "Events", event.name]}
      backTo="/events"
    >
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{event.name}</h1>
                <StatusBadge status={event.status} />
              </div>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {event.locationName || "Location pending"}
              </p>
            </div>
            {canEditEvent && (
              <Button variant="edit" asChild>
                <Link to={`/events/${event.id}/edit`}>
                  <Edit3 />
                  Edit event
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
        <nav
          aria-label="Event workspace sections"
          className="overflow-x-auto border-t bg-muted/30"
        >
          <div className="flex min-w-max px-2">
            {visibleSections.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={active === item.id ? "page" : undefined}
                onClick={() =>
                  setSearchParams(
                    item.id === "overview" ? {} : { section: item.id },
                  )
                }
                className={cn(
                  "flex items-center gap-2 border-b-2 border-transparent px-3 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  active === item.id && "border-primary text-primary",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </Card>
      {active === "overview" && (
        <Overview
          event={event}
          action={action}
          canEdit={canEditEvent}
          transition={transition}
          organizers={organizers}
          add={add}
          me={me}
        />
      )}
      {active === "setup" && (
        <RegistrationSettings
          eventId={eventId}
          canEdit={canManageRegistration}
        />
      )}
      {active === "packages" && (
        <EventPackages eventId={eventId} canEdit={canManagePackages} />
      )}
      {active === "form" && (
        <RegistrationFormBuilder eventId={eventId} canEdit={canManageForm} />
      )}
      {active === "payment" && <PaymentSummary eventId={eventId} />}
      {active === "registrations" && (
        <Unavailable
          title="Registrations are not available yet"
          description="Registrant records and operational actions will appear here when the backend operations are available."
        />
      )}
      {active === "attendance" && (
        <Unavailable
          title="Attendance is configured"
          description={`Check-in tracking is enabled${settings.data?.attendanceCheckoutEnabled ? " with check-out tracking" : ""}. Attendance operations are not available yet.`}
        />
      )}
    </PageLayout>
  );
}

function Overview({
  event,
  action,
  canEdit,
  transition,
  organizers,
  add,
  me,
}: {
  event: EventItem;
  action: "publish" | "close" | null;
  canEdit: boolean;
  transition: ReturnType<typeof useTransitionEvent>;
  organizers: ReturnType<typeof useEventOrganizers>;
  add: ReturnType<typeof useAddEventOrganizer>;
  me?: UserMeResponse;
}) {
  return (
    <>
      <Card>
        <CardContent className="p-5">
          <ExpandableMarkdown className="max-w-3xl text-sm text-muted-foreground">
            {event.publicDescription || "No public description."}
          </ExpandableMarkdown>
          {canEdit && (
            <div className="mt-5 flex flex-wrap gap-2">
              {action && (
                <Button
                  onClick={() => transition.mutate({ id: event.id, action })}
                  disabled={transition.isPending}
                >
                  {action === "publish" ? "Publish" : "Close event"}
                </Button>
              )}
              {event.status !== "CANCELLED" && (
                <Button
                  variant="destructive"
                  onClick={() =>
                    transition.mutate({ id: event.id, action: "cancel" })
                  }
                  disabled={transition.isPending}
                >
                  Cancel event
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <OrganizerManager
            organizers={organizers.data ?? []}
            isLoading={organizers.isLoading}
            isError={organizers.isError}
            canSearchUsers={
              canEdit && (me?.permissions.includes("manage_users") ?? false)
            }
            isAdding={add.isPending}
            addError={add.isError}
            onAdd={(userId, role, done) =>
              add.mutate({ userId, role }, { onSuccess: done })
            }
          />
        </CardContent>
      </Card>
    </>
  );
}

function Unavailable({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
        <ClipboardCheck className="mb-3 h-10 w-10 text-muted-foreground" />
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
