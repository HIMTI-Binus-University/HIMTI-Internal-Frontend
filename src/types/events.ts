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

export type RegistrationFormStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export interface RegistrationForm {
  id: string;
  status: RegistrationFormStatus;
  questionCount: number;
}

export interface Subevent {
  id: string;
  eventId: string;
  name: string;
  publicDescription: string | null;
  privateDescription: string | null;
  date: string;
  type: SubeventType;
  locationName: string | null;
  locationUrl: string | null;
  price: number;
  paid: boolean;
  paymentAccountBank: string;
  paymentAccountNumber: number | null;
  paymentAccountName: string | null;
  priceModifier: number | null;
  paymentDesc: string;
  maxParticipants: number | null;
  maxTicketsPerUser: number | null;
  isRegistrationOpen: boolean;
  autoAcceptRegistration: boolean;
  checkOutToken: string | null;
  visibility: SubeventVisibility;
  status: SubeventStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  registrationForms: RegistrationForm[];
  participantCount: number;
  submittedResponseCount: number;
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
