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

export const MAJOR_TO_BACKEND_ENUM: Record<string, string> = {
  "Computer Science": "COMPUTER_SCIENCE",
  "Mobile Application and Technology": "MOBILE_APPLICATION_AND_TECHNOLOGY",
  "Game Application and Technology": "GAME_APPLICATION_AND_TECHNOLOGY",
  "Data Science": "DATA_SCIENCE",
  "Cyber Security": "CYBER_SECURITY",
  "Computer Science & Mathematics": "COMPUTER_SCIENCE_AND_MATHEMATICS",
  "Computer Science & Statistics": "COMPUTER_SCIENCE_AND_STATISTIC",
  "Computer Science - Software Engineering": "COMPUTER_SCIENCE_SOFTWARE_ENGINEERING",
  "Artificial Intelligence": "ARTIFICIAL_INTELLIGENCE",
  "Digital Psychology": "DIGITAL_PSYCHOLOGY",
};

export const BACKEND_ENUM_TO_MAJOR: Record<string, string> = {
  "COMPUTER_SCIENCE": "Computer Science",
  "MOBILE_APPLICATION_AND_TECHNOLOGY": "Mobile Application and Technology",
  "GAME_APPLICATION_AND_TECHNOLOGY": "Game Application and Technology",
  "DATA_SCIENCE": "Data Science",
  "CYBER_SECURITY": "Cyber Security",
  "COMPUTER_SCIENCE_AND_MATHEMATICS": "Computer Science & Mathematics",
  "COMPUTER_SCIENCE_AND_STATISTIC": "Computer Science & Statistics",
  "COMPUTER_SCIENCE_SOFTWARE_ENGINEERING": "Computer Science - Software Engineering",
  "ARTIFICIAL_INTELLIGENCE": "Artificial Intelligence",
  "DIGITAL_PSYCHOLOGY": "Digital Psychology",
};

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
  // Backend enum aliases for robust fallback
  "COMPUTER_SCIENCE": "Computer Science (CS)",
  "MOBILE_APPLICATION_AND_TECHNOLOGY": "Mobile (MAT)",
  "GAME_APPLICATION_AND_TECHNOLOGY": "Game (GAT)",
  "DATA_SCIENCE": "Data Science",
  "CYBER_SECURITY": "Cyber Security",
  "COMPUTER_SCIENCE_AND_MATHEMATICS": "CS & Math",
  "COMPUTER_SCIENCE_AND_STATISTIC": "CS & Stats",
  "COMPUTER_SCIENCE_SOFTWARE_ENGINEERING": "Software Eng (SE)",
  "ARTIFICIAL_INTELLIGENCE": "AI",
  "DIGITAL_PSYCHOLOGY": "Digital Psych",
};

export interface HimtiKitResource {
  id: string;
  title: string;
  major: string; // Jurusan (e.g. Computer Science, Cyber Security, Data Science, etc.)
  coverImageUrl?: string | null;
  resourceUrl: string;
  downloadUrl?: string; // Backend field alias
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface HimtiKitSoftware {
  id: string;
  name: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null; // Backend field alias
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
  updatedAt?: string;
}

export type CreateHimtiKitResourceInput = Omit<HimtiKitResource, "id" | "createdAt" | "updatedAt">;
export type UpdateHimtiKitResourceInput = Partial<CreateHimtiKitResourceInput>;

export type CreateHimtiKitSoftwareInput = Omit<HimtiKitSoftware, "id" | "createdAt" | "updatedAt">;
export type UpdateHimtiKitSoftwareInput = Partial<CreateHimtiKitSoftwareInput>;

export type CreateHimtiKitAttendeeInput = Omit<HimtiKitAttendee, "id" | "createdAt" | "updatedAt">;

export interface HimtiKitAppearanceConfig {
  backgroundUrl: string;
  primaryColor: string;
  enableOverlay: boolean;
  overlayOpacity: number;
  enableBlur: boolean;
  blurLevel: number;
  // Backend field aliases for bidirectional compatibility
  backgroundImageUrl?: string;
  accentColor?: string;
  overlayEnabled?: boolean;
  overlayDarkness?: number;
  blurEnabled?: boolean;
  blurIntensity?: number;
  updatedAt?: string;
}

