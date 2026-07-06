import type { Event } from "@/types/events";

export const mockEvents: Event[] = [
  {
    id: "evt-techno-2026",
    name: "TECHNO 2026: Wondrous Wonderland",
    publicDescription:
      "A welcoming party for new School of Computer Science students to connect, explore, and begin their BINUS journey together.",
    coverImageUrl: "/himti-icon.svg",
    status: "PUBLISHED",
    createdAt: "2026-04-12T08:00:00.000Z",
    updatedAt: "2026-05-01T10:30:00.000Z",
    subevents: [
      {
        id: "sub-techno-jakarta",
        eventId: "evt-techno-2026",
        name: "TECHNO 2026 — Greater Jakarta",
        date: "2026-05-17T10:00:00.000+07:00",
        type: "WELCOMING_PARTY",
        visibility: "PUBLIC",
        status: "OPEN",
      },
      {
        id: "sub-techno-semarang",
        eventId: "evt-techno-2026",
        name: "TECHNO 2026 — Semarang",
        date: "2026-05-24T10:00:00.000+07:00",
        type: "WELCOMING_PARTY",
        visibility: "PUBLIC",
        status: "OPEN",
      },
      {
        id: "sub-techno-bandung",
        eventId: "evt-techno-2026",
        name: "TECHNO 2026 — Bandung",
        date: "2026-05-31T10:00:00.000+07:00",
        type: "WELCOMING_PARTY",
        visibility: "INTERNAL",
        status: "DRAFT",
      },
    ],
  },
  {
    id: "evt-hackathon-2026",
    name: "HIMTI Innovation Challenge 2026",
    publicDescription:
      "A collaborative technology competition for student teams building useful solutions to real community problems.",
    coverImageUrl: null,
    status: "DRAFT",
    createdAt: "2026-03-08T09:15:00.000Z",
    updatedAt: null,
    subevents: [
      {
        id: "sub-hackathon-briefing",
        eventId: "evt-hackathon-2026",
        name: "Participant Technical Briefing",
        date: "2026-08-08T13:00:00.000+07:00",
        type: "SEMINAR",
        visibility: "INTERNAL",
        status: "DRAFT",
      },
      {
        id: "sub-hackathon-final",
        eventId: "evt-hackathon-2026",
        name: "Innovation Challenge Final",
        date: "2026-08-15T09:00:00.000+07:00",
        type: "COMPETITION",
        visibility: "INVITE_ONLY",
        status: "DRAFT",
      },
    ],
  },
  {
    id: "evt-company-visit",
    name: "Industry Connect: Company Visit",
    publicDescription:
      "An industry exposure program connecting HIMTI members with technology professionals and workplace practices.",
    coverImageUrl: "/himti-icon.svg",
    status: "CLOSED",
    createdAt: "2025-11-20T04:30:00.000Z",
    updatedAt: "2026-01-18T07:00:00.000Z",
    subevents: [
      {
        id: "sub-company-visit",
        eventId: "evt-company-visit",
        name: "Technology Office Visit",
        date: "2026-01-17T08:00:00.000+07:00",
        type: "COMPANY_VISIT",
        visibility: "INTERNAL",
        status: "CLOSED",
      },
    ],
  },
];
