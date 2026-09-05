export type EventStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "CANCELLED";
export type EventGroupStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type OrganizerRole = "MANAGER" | "ORGANIZER";

export interface Organizer {
  userId: string;
  role: OrganizerRole;
  user?: { id: string; name: string; email: string };
}

export interface EventGroup {
  id: string;
  name: string;
  publicDescription: string | null;
  internalDescription: string | null;
  coverImageUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  status: EventGroupStatus;
  organizers?: Organizer[];
  createdAt: string;
  updatedAt: string | null;
}

export interface EventItem {
  id: string;
  eventGroupId: string | null;
  name: string;
  publicDescription: string | null;
  internalDescription: string | null;
  startsAt: string | null;
  endsAt: string | null;
  locationName: string | null;
  locationAddress: string | null;
  locationUrl: string | null;
  coverImageUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  status: EventStatus;
  isRegistrationOpen?: boolean;
  organizers?: Organizer[];
  eventGroup?: {
    id: string;
    name: string;
    organizers?: Organizer[];
  } | null;
  createdAt: string;
  updatedAt: string | null;
}

export type EventGroupPayload = Pick<EventGroup, "name"> &
  Partial<
    Pick<
      EventGroup,
      | "publicDescription"
      | "internalDescription"
      | "coverImageUrl"
      | "primaryColor"
      | "secondaryColor"
    >
  >;
export type EventPayload = Pick<EventItem, "name"> &
  Partial<
    Pick<
      EventItem,
      | "eventGroupId"
      | "publicDescription"
      | "internalDescription"
      | "startsAt"
      | "endsAt"
      | "locationName"
      | "locationAddress"
      | "locationUrl"
      | "coverImageUrl"
      | "primaryColor"
      | "secondaryColor"
    >
  >;
export interface DataResponse<T> {
  data: T;
}
