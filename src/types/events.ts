export type EventStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "CANCELLED";

export type SubeventStatus = "DRAFT" | "OPEN" | "CLOSED" | "CANCELLED";

export type SubeventVisibility = "PUBLIC" | "INTERNAL" | "INVITE_ONLY";

export type SubeventType =
  | "MAIN_EVENT"
  | "WORKSHOP"
  | "SEMINAR"
  | "COMPETITION"
  | "WELCOMING_PARTY"
  | "DOMESTIC_STUDY_TOUR"
  | "INTERNATIONAL_STUDY_TOUR"
  | "COMPANY_VISIT"
  | "OTHER";

export interface Subevent {
  id: string;
  eventId: string;
  name: string;
  date: string;
  type: SubeventType;
  visibility: SubeventVisibility;
  status: SubeventStatus;
}

export interface Event {
  id: string;
  name: string;
  publicDescription: string | null;
  coverImageUrl: string | null;
  status: EventStatus;
  createdAt: string;
  updatedAt: string | null;
  subevents: Subevent[];
}

export type EventStatusFilter = EventStatus | "ALL";
export type VisibilityFilter = SubeventVisibility | "ALL";
export type EventSort = "NEWEST" | "OLDEST";
