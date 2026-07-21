import type { Event, EventData, EventStatus, FormStatus, Registration, Subevent, SubeventStatus, TicketOption } from "@/types/events";

export const statuses = ["DRAFT", "UPCOMING", "OPEN", "CLOSED", "ARCHIVED"] as const;

const assignedForms = (data: EventData, subeventId: string) =>
  data.subeventForms.flatMap((assignment) => {
    if (assignment.subeventId !== subeventId) return [];
    const version = data.formVersions.find((item) => item.id === assignment.formVersionId);
    const form = data.forms.find((item) => item.id === version?.formId);
    return form ? [{ assignment, form }] : [];
  });

export const ticketIsSoldOut = (ticket: Pick<TicketOption, "id" | "capacity">, registrations: Pick<Registration, "ticketOptionId" | "status">[]) =>
  ticket.capacity !== undefined && registrations.filter((item) => item.ticketOptionId === ticket.id && !["DRAFT", "CANCELLED"].includes(item.status)).length >= ticket.capacity;

export const subeventOpenBlockers = (data: EventData, subevent: Pick<Subevent, "id">): string[] => {
  const tickets = data.ticketOptions.filter((item) => item.subeventId === subevent.id);
  const hasOpenTicket = tickets.some((ticket) => ticket.status === "OPEN" && !ticketIsSoldOut(ticket, data.registrations));
  const requiredFormsOpen = assignedForms(data, subevent.id).filter(({ assignment }) => assignment.isRequired).every(({ form }) => form.status === "OPEN");
  return [
    ...(hasOpenTicket ? [] : ["Add an open ticket with available capacity"]),
    ...(requiredFormsOpen ? [] : ["Open every required form"]),
  ];
};

export const eventOpenBlockers = (data: EventData, event: Pick<Event, "id">) =>
  data.subevents.some((subevent) => subevent.eventId === event.id && subevent.status === "OPEN" && subeventOpenBlockers(data, subevent).length === 0)
    ? []
    : ["Open at least one ready subevent first"];

export const canSetEventStatus = (data: EventData, event: Pick<Event, "id">, next: EventStatus) =>
  next !== "OPEN" || eventOpenBlockers(data, event).length === 0;

export const canSetSubeventStatus = (data: EventData, subevent: Pick<Subevent, "id">, next: SubeventStatus) =>
  next !== "OPEN" || subeventOpenBlockers(data, subevent).length === 0;

export const canSetFormStatus = (..._args: unknown[]) => true;
export const canMutateSubeventConfig = (..._args: unknown[]) => true;
export const canEditEventContent = (..._args: unknown[]) => true;
export const canCreateSubevent = (..._args: unknown[]) => true;
export const canTransition = (..._args: unknown[]) => true;
export const statusActions = (..._args: unknown[]) => statuses as unknown as EventStatus[];
export const statusActionLabel = (_from: unknown, to: string) => to;
export const canPublishSubevent = (..._args: unknown[]) => true;
export const subeventPublishBlockers = (..._args: unknown[]) => [] as string[];

const stamp = <T extends { updatedAt?: string; updatedBy?: string }>(item: T, now: string): T => ({ ...item, updatedAt: now, updatedBy: "admin-1" });

const descendantIds = (data: EventData, eventId: string) => new Set(data.subevents.filter((item) => item.eventId === eventId).map((item) => item.id));

export const applyEventTransition = (data: EventData, eventId: string, next: EventStatus): EventData | null => {
  const event = data.events.find((item) => item.id === eventId);
  if (!event || !canSetEventStatus(data, event, next)) return null;
  const now = new Date().toISOString();
  if (!["DRAFT", "CLOSED", "ARCHIVED"].includes(next)) return { ...data, events: data.events.map((item) => item.id === eventId ? stamp({ ...item, status: next }, now) : item) };
  const subeventIds = descendantIds(data, eventId);
  const versionIds = new Set(data.subeventForms.filter((item) => subeventIds.has(item.subeventId)).map((item) => item.formVersionId));
  const formIds = new Set(data.formVersions.filter((item) => versionIds.has(item.id)).map((item) => item.formId));
  return {
    ...data,
    events: data.events.map((item) => item.id === eventId ? stamp({ ...item, status: next }, now) : item),
    subevents: data.subevents.map((item) => subeventIds.has(item.id) ? stamp({ ...item, status: next }, now) : item),
    forms: data.forms.map((item) => formIds.has(item.id) ? stamp({ ...item, status: next }, now) : item),
    ticketOptions: data.ticketOptions.map((item) => subeventIds.has(item.subeventId) ? { ...item, status: next } : item),
  };
};

export const applySubeventTransition = (data: EventData, subeventId: string, next: SubeventStatus): EventData | null => {
  const subevent = data.subevents.find((item) => item.id === subeventId);
  if (!subevent || !canSetSubeventStatus(data, subevent, next)) return null;
  const now = new Date().toISOString();
  return { ...data, subevents: data.subevents.map((item) => item.id === subeventId ? stamp({ ...item, status: next }, now) : item) };
};

export const applyFormTransition = (data: EventData, formId: string, next: FormStatus): EventData | null => {
  const form = data.forms.find((item) => item.id === formId);
  if (!form || !canSetFormStatus(data, form, next)) return null;
  const now = new Date().toISOString();
  return { ...data, forms: data.forms.map((item) => item.id === formId ? stamp({ ...item, status: next }, now) : item) };
};

export const isParticipantVisible = (status: EventStatus | SubeventStatus) => status === "UPCOMING" || status === "OPEN" || status === "CLOSED";
export const canRegister = (data: EventData, event: Pick<Event, "status">, subevent: Pick<Subevent, "id" | "status">) => event.status === "OPEN" && subevent.status === "OPEN" && subeventOpenBlockers(data, subevent).length === 0;
