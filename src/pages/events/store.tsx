import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { eventSeed } from "@/data/events";
import type {
  ActivityLog,
  BundleGroup,
  Event,
  EventData,
  EventStatus,
  Form,
  FormQuestion,
  FormSection,
  FormStatus,
  Payment,
  PaymentSetting,
  Registration,
  RegistrationNote,
  Subevent,
  SubeventForm,
  SubeventStatus,
  TicketOption,
} from "@/types/events";
import {
  applyEventTransition,
  applyFormTransition,
  applySubeventTransition,
  canEditEventContent,
  canEditFormContent,
  canLimitedSubeventEdit,
  canMutateSubeventConfig,
} from "./lifecycle";

type Store = {
  data: EventData;
  saveEvent: (event: Event) => void;
  saveSubevent: (subevent: Subevent) => void;
  transitionEvent: (id: string, status: EventStatus, selectedSubeventIds?: string[]) => void;
  transitionSubevent: (id: string, status: SubeventStatus) => void;
  transitionForm: (id: string, status: FormStatus) => void;
  savePayment: (settings: PaymentSetting) => void;
  saveTicket: (ticket: TicketOption) => void;
  archiveTicket: (id: string) => void;
  saveForm: (form: Form, sections: FormSection[], questions: FormQuestion[]) => void;
  saveAssignments: (subeventId: string, assignments: SubeventForm[]) => void;
  updateRegistration: (id: string, patch: Partial<Registration>) => void;
  updatePayment: (id: string, patch: Partial<Payment>) => void;
  updateBundle: (id: string, patch: Partial<BundleGroup>) => void;
  addNote: (note: RegistrationNote) => void;
  addActivity: (activity: ActivityLog) => void;
};

const StoreContext = createContext<Store | null>(null);
const upsert = <T extends { id: string }>(items: T[], item: T) =>
  items.some((candidate) => candidate.id === item.id)
    ? items.map((candidate) => (candidate.id === item.id ? item : candidate))
    : [...items, item];

const parentOfSubevent = (data: EventData, subeventId: string) => {
  const subevent = data.subevents.find((item) => item.id === subeventId);
  const event = data.events.find((item) => item.id === subevent?.eventId);
  return { subevent, event };
};

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<EventData>(() => structuredClone(eventSeed));
  const value = useMemo<Store>(
    () => ({
      data,
      saveEvent: (event) =>
        setData((current) => {
          const existing = current.events.find((item) => item.id === event.id);
          if (!existing) return { ...current, events: upsert(current.events, event) };
          if (existing.status !== event.status) return current;
          if (!canEditEventContent(existing)) return current;
          if (existing.status === "ARCHIVED") return current;
          return { ...current, events: upsert(current.events, { ...event, status: existing.status }) };
        }),
      saveSubevent: (subevent) =>
        setData((current) => {
          const existing = current.subevents.find((item) => item.id === subevent.id);
          const parent = current.events.find((item) => item.id === subevent.eventId);
          if (!parent) return current;
          if (!existing) {
            if (!canCreateUnder(parent.status)) return current;
            return { ...current, subevents: upsert(current.subevents, { ...subevent, status: "DRAFT" }) };
          }
          if (existing.status !== subevent.status) return current;
          if (canMutateSubeventConfig(parent, existing)) {
            return { ...current, subevents: upsert(current.subevents, { ...subevent, status: existing.status }) };
          }
          if (canLimitedSubeventEdit(existing)) {
            const capacityOk =
              subevent.capacity === undefined
              || existing.capacity === undefined
              || subevent.capacity >= existing.capacity;
            if (!capacityOk) return current;
            return {
              ...current,
              subevents: upsert(current.subevents, {
                ...existing,
                capacity: subevent.capacity ?? existing.capacity,
                registrationClosesAt: subevent.registrationClosesAt ?? existing.registrationClosesAt,
                editLockAt: subevent.editLockAt ?? existing.editLockAt,
                privateDescription: subevent.privateDescription ?? existing.privateDescription,
                updatedAt: subevent.updatedAt,
                updatedBy: subevent.updatedBy,
              }),
            };
          }
          return current;
        }),
      transitionEvent: (id, status, selectedSubeventIds) =>
        setData((current) => applyEventTransition(current, id, status, selectedSubeventIds) ?? current),
      transitionSubevent: (id, status) =>
        setData((current) => applySubeventTransition(current, id, status) ?? current),
      transitionForm: (id, status) =>
        setData((current) => applyFormTransition(current, id, status) ?? current),
      savePayment: (settings) =>
        setData((current) => {
          const { subevent, event } = parentOfSubevent(current, settings.subeventId);
          if (!subevent || !event || !canMutateSubeventConfig(event, subevent)) return current;
          return { ...current, paymentSettings: upsert(current.paymentSettings, settings) };
        }),
      saveTicket: (ticket) =>
        setData((current) => {
          const { subevent, event } = parentOfSubevent(current, ticket.subeventId);
          if (!subevent || !event || !canMutateSubeventConfig(event, subevent)) return current;
          return { ...current, ticketOptions: upsert(current.ticketOptions, ticket) };
        }),
      archiveTicket: (id) =>
        setData((current) => {
          const ticket = current.ticketOptions.find((item) => item.id === id);
          if (!ticket) return current;
          const { subevent, event } = parentOfSubevent(current, ticket.subeventId);
          if (!subevent || !event || !canMutateSubeventConfig(event, subevent)) return current;
          return {
            ...current,
            ticketOptions: current.ticketOptions.map((item) =>
              item.id === id ? { ...item, status: "ARCHIVED" as const } : item,
            ),
          };
        }),
      saveForm: (form, sections, questions) =>
        setData((current) => {
          const version =
            current.formVersions.find((candidate) => candidate.formId === form.id)
            ?? { id: `version-${form.id}`, formId: form.id, versionNumber: 1, status: "DRAFT" as const };
          const assignment = current.subeventForms.find((item) => item.formVersionId === version.id);
          const subevent = current.subevents.find((item) => item.id === assignment?.subeventId);
          const event = current.events.find((item) => item.id === subevent?.eventId);
          if (subevent && event) {
            const existingForm = current.forms.find((item) => item.id === form.id) ?? form;
            if (!canEditFormContent(event, subevent, existingForm, version.status)) return current;
          } else if (version.status === "PUBLISHED" || form.status === "PUBLISHED" || form.status === "CLOSED" || form.status === "ARCHIVED") {
            return current;
          }
          return {
            ...current,
            forms: upsert(current.forms, { ...form, status: current.forms.find((item) => item.id === form.id)?.status ?? form.status }),
            formVersions: upsert(current.formVersions, version),
            formSections: [
              ...current.formSections.filter((section) => section.formVersionId !== version.id),
              ...sections,
            ],
            formQuestions: [
              ...current.formQuestions.filter((question) => question.formVersionId !== version.id),
              ...questions,
            ],
          };
        }),
      saveAssignments: (subeventId, assignments) =>
        setData((current) => {
          const { subevent, event } = parentOfSubevent(current, subeventId);
          if (!subevent || !event || !canMutateSubeventConfig(event, subevent)) return current;
          const versionToForm = new Map(current.formVersions.map((version) => [version.id, version.formId]));
          const ownedElsewhere = new Set(
            current.subeventForms
              .filter((assignment) => assignment.subeventId !== subeventId)
              .map((assignment) => versionToForm.get(assignment.formVersionId)),
          );
          return {
            ...current,
            subeventForms: [
              ...current.subeventForms.filter((assignment) => assignment.subeventId !== subeventId),
              ...assignments.filter((assignment) => !ownedElsewhere.has(versionToForm.get(assignment.formVersionId))),
            ],
          };
        }),
      updateRegistration: (id, patch) =>
        setData((current) => ({
          ...current,
          registrations: current.registrations.map((registration) =>
            registration.id === id ? { ...registration, ...patch, updatedAt: new Date().toISOString() } : registration,
          ),
        })),
      updatePayment: (id, patch) =>
        setData((current) => ({
          ...current,
          payments: current.payments.map((payment) => (payment.id === id ? { ...payment, ...patch } : payment)),
        })),
      updateBundle: (id, patch) =>
        setData((current) => ({
          ...current,
          bundleGroups: current.bundleGroups.map((bundle) => (bundle.id === id ? { ...bundle, ...patch } : bundle)),
        })),
      addNote: (note) => setData((current) => ({ ...current, registrationNotes: [...current.registrationNotes, note] })),
      addActivity: (activity) =>
        setData((current) => ({ ...current, activityLogs: [...current.activityLogs, activity] })),
    }),
    [data],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

const canCreateUnder = (status: EventStatus) => status === "DRAFT" || status === "PUBLISHED";

// eslint-disable-next-line react-refresh/only-export-components
export const useEventsStore = () => {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useEventsStore must be used inside EventsProvider");
  return store;
};
