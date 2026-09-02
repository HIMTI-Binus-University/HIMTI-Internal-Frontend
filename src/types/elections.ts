export type ElectionStatus = "DRAFT" | "OPEN" | "CLOSED" | "PUBLISHED";

export interface ElectionCandidate {
  id: string;
  electionId: string;
  ballotNumber: number;
  name: string;
  photoUrl: string | null;
  biography: string | null;
  slogan: string | null;
  vision: string;
  mission: string;
  videoUrl: string | null;
  workPrograms: string[];
  experiences: string[];
  position: number;
  isActive: boolean;
}

export interface Election {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: ElectionStatus;
  startsAt: string;
  endsAt: string;
  debateAt: string | null;
  openedAt: string | null;
  closedAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  candidates: ElectionCandidate[];
}

export type ElectionPayload = Pick<
  Election,
  "slug" | "title" | "description" | "startsAt" | "endsAt" | "debateAt"
>;

export type ElectionPublicDetailsPayload = Pick<
  Election,
  "title" | "slug" | "description"
>;

export type CandidatePayload = Omit<ElectionCandidate, "id" | "electionId">;

export interface ElectionTurnout {
  participationCount: number;
  ballotCount: number;
  valid: boolean;
}

export interface ElectionTally extends ElectionTurnout {
  winnerCandidateId: string | null;
  isTie: boolean;
  results: { candidate: ElectionCandidate; votes: number }[];
}

export interface ElectionResponse<T> {
  msg: string;
  data: T;
}
