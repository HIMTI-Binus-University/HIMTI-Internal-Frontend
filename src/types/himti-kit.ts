export const BINUS_IT_MAJORS = [
  "All Majors",
  "Computer Science",
  "Mobile Application and Technology",
  "Game Application and Technology",
  "Data Science",
  "Cyber Security",
  "Computer Science & Mathematics",
  "Computer Science & Statistics",
  "Computer Science - Software Engineering",
  "Artificial Intelligence",
  "Digital Psychology",
] as const;

export type BinusItMajor = (typeof BINUS_IT_MAJORS)[number];

export const MAJOR_SHORT_LABELS: Record<string, string> = {
  "ALL": "All Jurusan",
  "All Majors": "All Majors",
  "Computer Science": "Computer Science (CS)",
  "Mobile Application and Technology": "Mobile (MAT)",
  "Game Application and Technology": "Game (GAT)",
  "Data Science": "Data Science",
  "Cyber Security": "Cyber Security",
  "Computer Science & Mathematics": "CS & Math",
  "Computer Science & Statistics": "CS & Stats",
  "Computer Science - Software Engineering": "Software Eng (SE)",
  "Artificial Intelligence": "AI",
  "Digital Psychology": "Digital Psych",
};

export interface HimtiKitResource {
  id: string;
  title: string;
  major: string; // Jurusan (e.g. Computer Science, Cyber Security, Data Science, etc.)
  coverImageUrl?: string | null;
  resourceUrl: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface HimtiKitSoftware {
  id: string;
  name: string;
  logoUrl?: string | null;
  description: string;
  downloadUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HimtiKitAttendee {
  id: string;
  name: string;
  nim: string;
  createdAt?: string;
}

export type CreateHimtiKitResourceInput = Omit<HimtiKitResource, "id" | "createdAt" | "updatedAt">;
export type UpdateHimtiKitResourceInput = Partial<CreateHimtiKitResourceInput>;

export type CreateHimtiKitSoftwareInput = Omit<HimtiKitSoftware, "id" | "createdAt" | "updatedAt">;
export type UpdateHimtiKitSoftwareInput = Partial<CreateHimtiKitSoftwareInput>;

export type CreateHimtiKitAttendeeInput = Omit<HimtiKitAttendee, "id" | "createdAt">;
