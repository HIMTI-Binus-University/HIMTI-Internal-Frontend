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
import { EventRegistrations } from "@/components/events/EventBundles";
import { EventAttendance } from "@/components/events/EventAttendance";
import { ReviewSettings } from "@/components/events/ReviewSettings";
import { ConfirmAction } from "@/components/events/ConfirmAction";
import { OrganizerManager } from "@/components/events/OrganizerManager";
import { RegistrationFormBuilder } from "@/components/events/RegistrationFormBuilder";
import { RegistrationSettings } from "@/components/events/RegistrationSettings";
import { StatusBadge } from "@/components/events/StatusBadge";
import { ExpandableMarkdown } from "@/components/expandable-markdown";
import { PageLayout } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { backendMessage, useNotification } from "@/components/notification";
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
  { id: "review", label: "Event Summary", icon: ClipboardCheck },
] as const;
type Section = (typeof sections)[number]["id"];

export default function EventWorkspacePage() {
  const { eventId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const detail = useGetEvent(eventId);
  const transition = useTransitionEvent();
  const organizers = useEventOrganizers(eventId);
  const add = useAddEventOrganizer(eventId);
  const notify = useNotification();
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
  const canReviewRegistrations =
    me?.permissions.includes("review_event_registrations") ?? false;
  const canReviewPayments =
    me?.permissions.includes("review_event_payments") ?? false;
  const canViewAttendance =
    me?.permissions.includes("view_event_attendance") ?? false;
  const canScanTickets =
    me?.permissions.includes("scan_event_tickets") ?? false;
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
    if (item.id === "registrations") return canReviewRegistrations;
    if (item.id === "payment") return canManageRegistration;
    if (item.id === "attendance")
      return (
        (canViewAttendance || canScanTickets) &&
        Boolean(settings.data?.attendanceEnabled)
      );
    if (["setup", "payment", "registrations"].includes(item.id))
      return canManageRegistration;
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
          canEdit={canEditEvent}
          organizers={organizers}
          add={add}
          me={me}
          notify={notify}
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
      {active === "payment" && (
        <RegistrationSettings
          eventId={eventId}
          canEdit={canManageRegistration}
          section="payment"
        />
      )}
      {active === "registrations" && (
        <EventRegistrations
          eventId={eventId}
          canReviewPayments={canReviewPayments}
          canViewProofs={
            me?.permissions.includes("view_payment_proofs") ?? false
          }
        />
      )}
      {active === "attendance" && (
        <EventAttendance
          eventId={eventId}
          canCheckIn={canScanTickets}
          canView={canViewAttendance}
          checkoutEnabled={
            Boolean(settings.data?.attendanceCheckoutEnabled) &&
            Boolean(me?.permissions.includes("correct_event_attendance"))
          }
        />
      )}
      {active === "review" && (
        <ReviewSettings
          event={event}
          canManageRegistration={canManageRegistration}
          canManagePackages={canManagePackages}
          canManageForm={canManageForm}
          organizerCount={
            !organizers.isError ? organizers.data?.length : undefined
          }
          onSectionChange={(section) =>
            setSearchParams(section === "overview" ? {} : { section })
          }
        >
          <Lifecycle
            event={event}
            action={action}
            canEdit={canEditEvent}
            transition={transition}
          />
        </ReviewSettings>
      )}
    </PageLayout>
  );
}

function Overview({
  event,
  canEdit,
  organizers,
  add,
  me,
  notify,
}: {
  event: EventItem;
  canEdit: boolean;
  organizers: ReturnType<typeof useEventOrganizers>;
  add: ReturnType<typeof useAddEventOrganizer>;
  me?: UserMeResponse;
  notify: ReturnType<typeof useNotification>;
}) {
  return (
    <>
      <Card>
        <CardContent className="p-5">
          <ExpandableMarkdown className="max-w-3xl text-sm text-muted-foreground">
            {event.publicDescription || "No public description."}
          </ExpandableMarkdown>
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
    </>
  );
}

function Lifecycle({
  event,
  action,
  canEdit,
  transition,
}: {
  event: EventItem;
  action: "publish" | "close" | null;
  canEdit: boolean;
  transition: ReturnType<typeof useTransitionEvent>;
}) {
  return canEdit ? (
    <div className="mt-5 flex flex-wrap gap-2">
      {action && (
        <ConfirmAction
          label={action === "publish" ? "Publish event" : "Close event"}
          successMessage={
            action === "publish" ? "Event published." : "Event closed."
          }
          description={
            action === "publish"
              ? `Publish "${event.name}" to make it publicly visible. Registration still depends on its registration settings.`
              : `Close "${event.name}" and turn off registration.`
          }
          onConfirm={() => transition.mutateAsync({ id: event.id, action })}
        >
          <Button disabled={transition.isPending}>
            {action === "publish" ? "Publish" : "Close event"}
          </Button>
        </ConfirmAction>
      )}
      {event.status !== "CANCELLED" && (
        <ConfirmAction
          label="Cancel event"
          successMessage="Event cancelled."
          description={`Cancel "${event.name}" and turn off registration. The event cannot leave the cancelled status.`}
          onConfirm={() =>
            transition.mutateAsync({ id: event.id, action: "cancel" })
          }
        >
          <Button variant="destructive" disabled={transition.isPending}>
            Cancel event
          </Button>
        </ConfirmAction>
      )}
    </div>
  ) : null;
}
