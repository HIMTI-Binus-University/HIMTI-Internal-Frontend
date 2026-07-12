import type {
  Event,
  EventData,
  EventStatus,
  Form,
  FormStatus,
  FormVersion,
  FormVersionStatus,
  LifecycleStatus,
  Registration,
  Subevent,
  SubeventForm,
  SubeventStatus,
} from "@/types/events";

export type FormPublishContext = {
  assignments: Pick<SubeventForm, "subeventId" | "formVersionId" | "isRequired" | "id">[];
  versions: Pick<FormVersion, "id" | "status" | "formId">[];
  forms: Pick<Form, "id" | "status" | "name">[];
};

const ALLOWED: Record<LifecycleStatus, LifecycleStatus[]> = {
  DRAFT: ["PUBLISHED", "ARCHIVED"],
  PUBLISHED: ["CLOSED"],
  CLOSED: ["PUBLISHED", "ARCHIVED"],
  ARCHIVED: ["DRAFT"],
};

export const canTransition = (from: LifecycleStatus, to: LifecycleStatus) =>
  from === to || ALLOWED[from].includes(to);

export const nextStatuses = (from: LifecycleStatus) => ALLOWED[from];

/** Primary status actions (archive/unarchive stay on the Archive button). */
export const statusActions = (from: LifecycleStatus): LifecycleStatus[] =>
  ALLOWED[from].filter((to) => to !== "ARCHIVED" && !(from === "ARCHIVED" && to === "DRAFT"));

export const statusActionLabel = (from: LifecycleStatus, to: LifecycleStatus) => {
  if (to === "PUBLISHED") return from === "CLOSED" ? "Reopen" : "Publish";
  if (to === "CLOSED") return "Close";
  if (to === "DRAFT") return "Unarchive";
  if (to === "ARCHIVED") return "Archive";
  return to;
};

/** Full structural edit only in DRAFT when parent chain allows. */
export const isStructurallyEditable = (status: LifecycleStatus) => status === "DRAFT";

export const canEditEventContent = (event: Pick<Event, "status">) =>
  event.status === "DRAFT" || event.status === "PUBLISHED" || event.status === "CLOSED";

export const canCreateSubevent = (event: Pick<Event, "status">) =>
  event.status === "DRAFT" || event.status === "PUBLISHED";

/** Draft config mutable only when parent event is draft or published. */
export const canMutateSubeventConfig = (
  event: Pick<Event, "status">,
  subevent: Pick<Subevent, "status">,
) => subevent.status === "DRAFT" && (event.status === "DRAFT" || event.status === "PUBLISHED");

export const canMutateForms = (
  event: Pick<Event, "status">,
  subevent: Pick<Subevent, "status">,
) => canMutateSubeventConfig(event, subevent);

export const canEditFormContent = (
  event: Pick<Event, "status">,
  subevent: Pick<Subevent, "status">,
  form: Pick<Form, "status">,
  versionStatus: FormVersionStatus | undefined,
) =>
  canMutateForms(event, subevent)
  && form.status === "DRAFT"
  && (versionStatus ?? "DRAFT") === "DRAFT";

/** Limited published subevent edits: capacity up, extend deadlines, private notes — callers whitelist fields. */
export const canLimitedSubeventEdit = (subevent: Pick<Subevent, "status">) =>
  subevent.status === "PUBLISHED";

export const requiredFormsReady = (subeventId: string, ctx: FormPublishContext) =>
  ctx.assignments
    .filter((assignment) => assignment.subeventId === subeventId && assignment.isRequired)
    .every((assignment) => {
      const version = ctx.versions.find((item) => item.id === assignment.formVersionId);
      if (!version || version.status !== "PUBLISHED") return false;
      const form = ctx.forms.find((item) => item.id === version.formId);
      return form?.status === "PUBLISHED" || form?.status === "CLOSED";
    });

export const unpublishedRequiredFormCount = (subeventId: string, ctx: FormPublishContext) =>
  ctx.assignments.filter((assignment) => {
    if (assignment.subeventId !== subeventId || !assignment.isRequired) return false;
    const version = ctx.versions.find((item) => item.id === assignment.formVersionId);
    if (!version || version.status !== "PUBLISHED") return true;
    const form = ctx.forms.find((item) => item.id === version.formId);
    return form?.status !== "PUBLISHED" && form?.status !== "CLOSED";
  }).length;

export const canPublishSubevent = (
  event: Pick<Event, "status">,
  subevent: Pick<Subevent, "id" | "status">,
  forms: FormPublishContext,
  options: { coPublishingEvent?: boolean; ticketCount?: number } = {},
) => {
  const parentOk = event.status === "PUBLISHED" || options.coPublishingEvent === true;
  if (!parentOk) return false;
  if (!canTransition(subevent.status, "PUBLISHED")) return false;
  if ((options.ticketCount ?? 1) < 1) return false;
  return requiredFormsReady(subevent.id, forms);
};

export const subeventPublishBlockers = (
  event: Pick<Event, "status">,
  subevent: Pick<Subevent, "id" | "status">,
  forms: FormPublishContext,
  options: { coPublishingEvent?: boolean; ticketCount?: number } = {},
): string[] => {
  const blockers: string[] = [];
  if (!(event.status === "PUBLISHED" || options.coPublishingEvent)) blockers.push("Publish the parent event first");
  if (!canTransition(subevent.status, "PUBLISHED")) blockers.push("Subevent cannot be published from this status");
  if ((options.ticketCount ?? 1) < 1) blockers.push("Add at least one ticket");
  const pending = unpublishedRequiredFormCount(subevent.id, forms);
  if (pending > 0) blockers.push(pending === 1 ? "Publish the required form first" : `Publish ${pending} required forms first`);
  return blockers;
};

export const canPublishEvent = (
  event: Pick<Event, "status" | "name">,
  selected: Pick<Subevent, "id" | "status">[],
  forms: FormPublishContext,
  ticketCounts: Record<string, number>,
) => {
  if (!canTransition(event.status, "PUBLISHED")) return false;
  if (!event.name?.trim()) return false;
  if (!selected.length) return false;
  return selected.every((sub) =>
    canPublishSubevent(event, sub, forms, { coPublishingEvent: true, ticketCount: ticketCounts[sub.id] ?? 0 }),
  );
};

export const canArchiveStatus = (status: LifecycleStatus) =>
  status === "DRAFT" || status === "CLOSED";

export const canSetEventStatus = (
  event: Pick<Event, "status">,
  next: EventStatus,
): boolean => {
  if (event.status === next) return true;
  if (!canTransition(event.status, next)) return false;
  if (next === "PUBLISHED") return true; // selection validated separately
  if (next === "ARCHIVED") return canArchiveStatus(event.status);
  if (next === "CLOSED") return event.status === "PUBLISHED";
  if (next === "DRAFT") return event.status === "ARCHIVED";
  return false;
};

export const canSetSubeventStatus = (
  event: Pick<Event, "status">,
  subevent: Pick<Subevent, "id" | "status">,
  next: SubeventStatus,
  forms: FormPublishContext = { assignments: [], versions: [], forms: [] },
  ticketCount = 1,
): boolean => {
  if (subevent.status === next) return true;
  if (event.status === "ARCHIVED") return false;
  if (!canTransition(subevent.status, next)) return false;
  if (next === "PUBLISHED") return canPublishSubevent(event, subevent, forms, { ticketCount });
  if (next === "ARCHIVED") return canArchiveStatus(subevent.status);
  if (next === "CLOSED") return subevent.status === "PUBLISHED";
  if (next === "DRAFT") return subevent.status === "ARCHIVED";
  return false;
};

export const canSetFormStatus = (
  event: Pick<Event, "status">,
  subevent: Pick<Subevent, "status">,
  form: Pick<Form, "status">,
  next: FormStatus,
): boolean => {
  if (form.status === next) return true;
  if (event.status === "ARCHIVED" || subevent.status === "ARCHIVED") return next === form.status;
  if (!canTransition(form.status, next)) return false;
  if (next === "PUBLISHED") {
    return subevent.status === "PUBLISHED" || subevent.status === "DRAFT";
  }
  if (next === "ARCHIVED") return canArchiveStatus(form.status);
  if (next === "CLOSED") return form.status === "PUBLISHED";
  if (next === "DRAFT") return form.status === "ARCHIVED";
  return false;
};

const stamp = <T extends { updatedAt?: string; updatedBy?: string }>(item: T, now: string): T =>
  ({ ...item, updatedAt: now, updatedBy: "admin-1" });

export const cascadeClosePublishedForms = (
  forms: Form[],
  formIds: Set<string>,
  now: string,
): Form[] =>
  forms.map((form) =>
    formIds.has(form.id) && form.status === "PUBLISHED"
      ? stamp({ ...form, status: "CLOSED" as const }, now)
      : form,
  );

export const cascadeArchiveForms = (forms: Form[], formIds: Set<string>, now: string): Form[] =>
  forms.map((form) => (formIds.has(form.id) ? stamp({ ...form, status: "ARCHIVED" as const }, now) : form));

export const formIdsForSubevents = (
  subeventIds: Set<string>,
  assignments: SubeventForm[],
  versions: FormVersion[],
): Set<string> => {
  const versionIds = new Set(
    assignments.filter((item) => subeventIds.has(item.subeventId)).map((item) => item.formVersionId),
  );
  return new Set(versions.filter((version) => versionIds.has(version.id)).map((version) => version.formId));
};

/** Apply event status change with cascades. selectedSubeventIds required when → PUBLISHED. */
export const applyEventTransition = (
  data: EventData,
  eventId: string,
  next: EventStatus,
  selectedSubeventIds: string[] = [],
): EventData | null => {
  const event = data.events.find((item) => item.id === eventId);
  if (!event || !canTransition(event.status, next)) return null;
  const now = new Date().toISOString();
  const children = data.subevents.filter((item) => item.eventId === eventId);
  const formCtx: FormPublishContext = {
    assignments: data.subeventForms,
    versions: data.formVersions,
    forms: data.forms,
  };
  const ticketCounts = Object.fromEntries(
    children.map((sub) => [sub.id, data.ticketOptions.filter((ticket) => ticket.subeventId === sub.id).length]),
  );

  if (next === "PUBLISHED") {
    const selected = children.filter((item) => selectedSubeventIds.includes(item.id));
    if (!canPublishEvent(event, selected, formCtx, ticketCounts)) return null;
    const selectedSet = new Set(selectedSubeventIds);
    const subevents = data.subevents.map((sub) =>
      selectedSet.has(sub.id) ? stamp({ ...sub, status: "PUBLISHED" as const }, now) : sub,
    );
    // co-publish required draft forms whose versions are already published
    const forms = data.forms.map((form) => {
      const version = data.formVersions.find((item) => item.formId === form.id && item.status === "PUBLISHED");
      if (!version) return form;
      const assigned = data.subeventForms.some(
        (assignment) => selectedSet.has(assignment.subeventId) && assignment.formVersionId === version.id && assignment.isRequired,
      );
      if (assigned && form.status === "DRAFT") return stamp({ ...form, status: "PUBLISHED" as const }, now);
      return form;
    });
    return {
      ...data,
      events: data.events.map((item) => (item.id === eventId ? stamp({ ...item, status: "PUBLISHED" }, now) : item)),
      subevents,
      forms,
    };
  }

  if (next === "CLOSED") {
    if (event.status !== "PUBLISHED") return null;
    const publishedIds = new Set(children.filter((item) => item.status === "PUBLISHED").map((item) => item.id));
    const subevents = data.subevents.map((sub) =>
      publishedIds.has(sub.id) ? stamp({ ...sub, status: "CLOSED" as const }, now) : sub,
    );
    const formIds = formIdsForSubevents(publishedIds, data.subeventForms, data.formVersions);
    return {
      ...data,
      events: data.events.map((item) => (item.id === eventId ? stamp({ ...item, status: "CLOSED" }, now) : item)),
      subevents,
      forms: cascadeClosePublishedForms(data.forms, formIds, now),
    };
  }

  if (next === "ARCHIVED") {
    if (!canArchiveStatus(event.status)) return null;
    const childIds = new Set(children.map((item) => item.id));
    const formIds = formIdsForSubevents(childIds, data.subeventForms, data.formVersions);
    return {
      ...data,
      events: data.events.map((item) => (item.id === eventId ? stamp({ ...item, status: "ARCHIVED" }, now) : item)),
      subevents: data.subevents.map((sub) =>
        childIds.has(sub.id) ? stamp({ ...sub, status: "ARCHIVED" as const }, now) : sub,
      ),
      forms: cascadeArchiveForms(data.forms, formIds, now),
    };
  }

  if (next === "DRAFT") {
    if (event.status !== "ARCHIVED") return null;
    return {
      ...data,
      events: data.events.map((item) => (item.id === eventId ? stamp({ ...item, status: "DRAFT" }, now) : item)),
    };
  }

  return null;
};

export const applySubeventTransition = (
  data: EventData,
  subeventId: string,
  next: SubeventStatus,
): EventData | null => {
  const subevent = data.subevents.find((item) => item.id === subeventId);
  const event = data.events.find((item) => item.id === subevent?.eventId);
  if (!subevent || !event) return null;
  const forms: FormPublishContext = {
    assignments: data.subeventForms,
    versions: data.formVersions,
    forms: data.forms,
  };
  const ticketCount = data.ticketOptions.filter((ticket) => ticket.subeventId === subeventId).length;
  if (!canSetSubeventStatus(event, subevent, next, forms, ticketCount)) return null;
  const now = new Date().toISOString();

  if (next === "PUBLISHED") {
    return {
      ...data,
      subevents: data.subevents.map((item) =>
        item.id === subeventId ? stamp({ ...item, status: "PUBLISHED" }, now) : item,
      ),
    };
  }

  if (next === "CLOSED") {
    const formIds = formIdsForSubevents(new Set([subeventId]), data.subeventForms, data.formVersions);
    let nextData: EventData = {
      ...data,
      subevents: data.subevents.map((item) =>
        item.id === subeventId ? stamp({ ...item, status: "CLOSED" }, now) : item,
      ),
      forms: cascadeClosePublishedForms(data.forms, formIds, now),
    };
    const siblings = nextData.subevents.filter((item) => item.eventId === event.id);
    if (!siblings.some((item) => item.status === "PUBLISHED") && event.status === "PUBLISHED") {
      nextData = {
        ...nextData,
        events: nextData.events.map((item) =>
          item.id === event.id ? stamp({ ...item, status: "CLOSED" }, now) : item,
        ),
      };
    }
    return nextData;
  }

  if (next === "ARCHIVED") {
    const formIds = formIdsForSubevents(new Set([subeventId]), data.subeventForms, data.formVersions);
    return {
      ...data,
      subevents: data.subevents.map((item) =>
        item.id === subeventId ? stamp({ ...item, status: "ARCHIVED" }, now) : item,
      ),
      forms: cascadeArchiveForms(data.forms, formIds, now),
    };
  }

  if (next === "DRAFT") {
    return {
      ...data,
      subevents: data.subevents.map((item) =>
        item.id === subeventId ? stamp({ ...item, status: "DRAFT" }, now) : item,
      ),
    };
  }

  return null;
};

export const applyFormTransition = (
  data: EventData,
  formId: string,
  next: FormStatus,
): EventData | null => {
  const form = data.forms.find((item) => item.id === formId);
  if (!form || !canTransition(form.status, next)) return null;
  const version = data.formVersions.find((item) => item.formId === formId);
  const assignment = data.subeventForms.find((item) => item.formVersionId === version?.id);
  const subevent = data.subevents.find((item) => item.id === assignment?.subeventId);
  const event = data.events.find((item) => item.id === subevent?.eventId);
  if (subevent && event && !canSetFormStatus(event, subevent, form, next)) return null;
  const now = new Date().toISOString();
  let formVersions = data.formVersions;
  if (next === "PUBLISHED" && version && version.status === "DRAFT") {
    formVersions = data.formVersions.map((item) =>
      item.formId === formId ? { ...item, status: "PUBLISHED" as const, publishedAt: item.publishedAt ?? now } : item,
    );
  }
  return {
    ...data,
    forms: data.forms.map((item) => (item.id === formId ? stamp({ ...item, status: next }, now) : item)),
    formVersions,
  };
};

export const hasLiveRegistrations = (registrations: Pick<Registration, "status">[]) =>
  registrations.some((item) => item.status !== "DRAFT" && item.status !== "CANCELLED");

// aliases used by older call sites during migration
export const isSubeventMutable = (subevent: Pick<Subevent, "status">) => subevent.status === "DRAFT";
