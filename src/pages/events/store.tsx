import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { eventSeed } from "@/data/events";
import type { ActivityLog, BundleGroup, Event, EventData, Form, FormQuestion, FormSection, Payment, PaymentSetting, Registration, RegistrationNote, Subevent, SubeventForm, TicketOption } from "@/types/events";

type Store = {
  data: EventData;
  saveEvent: (event: Event) => void;
  saveSubevent: (subevent: Subevent) => void;
  savePayment: (settings: PaymentSetting) => void;
  saveTicket: (ticket: TicketOption) => void;
  removeTicket: (id: string) => void;
  saveForm: (form: Form, sections: FormSection[], questions: FormQuestion[]) => void;
  saveAssignments: (subeventId: string, assignments: SubeventForm[]) => void;
  updateRegistration: (id: string, patch: Partial<Registration>) => void;
  updatePayment: (id: string, patch: Partial<Payment>) => void;
  updateBundle: (id: string, patch: Partial<BundleGroup>) => void;
  addNote: (note: RegistrationNote) => void;
  addActivity: (activity: ActivityLog) => void;
};

const StoreContext = createContext<Store | null>(null);
const upsert = <T extends { id: string }>(items: T[], item: T) => items.some((candidate) => candidate.id === item.id) ? items.map((candidate) => candidate.id === item.id ? item : candidate) : [...items, item];

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<EventData>(() => structuredClone(eventSeed));
  const value = useMemo<Store>(() => ({
    data,
    saveEvent: (event) => setData((current) => ({ ...current, events: upsert(current.events, event) })),
    saveSubevent: (subevent) => setData((current) => ({ ...current, subevents: upsert(current.subevents, subevent) })),
    savePayment: (settings) => setData((current) => ({ ...current, paymentSettings: upsert(current.paymentSettings, settings) })),
    saveTicket: (ticket) => setData((current) => ({ ...current, ticketOptions: upsert(current.ticketOptions, ticket) })),
    removeTicket: (id) => setData((current) => ({ ...current, ticketOptions: current.ticketOptions.filter((ticket) => ticket.id !== id) })),
    saveForm: (form, sections, questions) => setData((current) => {
      const version = current.formVersions.find((candidate) => candidate.formId === form.id) ?? { id: `version-${form.id}`, formId: form.id, versionNumber: 1, status: "DRAFT" as const };
      return { ...current, forms: upsert(current.forms, form), formVersions: upsert(current.formVersions, version), formSections: [...current.formSections.filter((section) => section.formVersionId !== version.id), ...sections], formQuestions: [...current.formQuestions.filter((question) => question.formVersionId !== version.id), ...questions] };
    }),
    saveAssignments: (subeventId, assignments) => setData((current) => ({ ...current, subeventForms: [...current.subeventForms.filter((assignment) => assignment.subeventId !== subeventId), ...assignments] })),
    updateRegistration: (id, patch) => setData((current) => ({ ...current, registrations: current.registrations.map((registration) => registration.id === id ? { ...registration, ...patch, updatedAt: new Date().toISOString() } : registration) })),
    updatePayment: (id, patch) => setData((current) => ({ ...current, payments: current.payments.map((payment) => payment.id === id ? { ...payment, ...patch } : payment) })),
    updateBundle: (id, patch) => setData((current) => ({ ...current, bundleGroups: current.bundleGroups.map((bundle) => bundle.id === id ? { ...bundle, ...patch } : bundle) })),
    addNote: (note) => setData((current) => ({ ...current, registrationNotes: [...current.registrationNotes, note] })),
    addActivity: (activity) => setData((current) => ({ ...current, activityLogs: [...current.activityLogs, activity] })),
  }), [data]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

// Store and provider stay together because this frontend-only demo has one consumer domain.
// eslint-disable-next-line react-refresh/only-export-components
export const useEventsStore = () => {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useEventsStore must be used inside EventsProvider");
  return store;
};
