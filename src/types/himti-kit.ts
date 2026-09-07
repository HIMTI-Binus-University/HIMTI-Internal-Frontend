export const BINUS_IT_MAJORS = [
  "All Majors",
  "Computer Science",
  "Cyber Security",
  "Data Science",
  "Game Application and Technology",
  "Artificial Intelligence",
  "Software Engineering",
] as const;

export type BinusItMajor = (typeof BINUS_IT_MAJORS)[number];

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

export type CreateHimtiKitResourceInput = Omit<HimtiKitResource, "id" | "createdAt" | "updatedAt">;
export type UpdateHimtiKitResourceInput = Partial<CreateHimtiKitResourceInput>;

export type CreateHimtiKitSoftwareInput = Omit<HimtiKitSoftware, "id" | "createdAt" | "updatedAt">;
export type UpdateHimtiKitSoftwareInput = Partial<CreateHimtiKitSoftwareInput>;
