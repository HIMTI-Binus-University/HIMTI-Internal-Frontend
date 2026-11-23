import type {
  HimtiKitAttendee,
  HimtiKitResource,
  HimtiKitSoftware,
} from "@/types/himti-kit";

export const initialHimtiKitResources: HimtiKitResource[] = [
  {
    id: "res-1",
    title: "Data Structures & Algorithms Comprehensive Notes",
    major: "Computer Science",
    coverImageUrl: "https://images.unsplash.com/photo-1516116211227-bbc13c7d690c?w=600&auto=format&fit=crop&q=80",
    resourceUrl: "https://drive.google.com/drive/folders/example-dsa",
    description: "In-depth summary covering Trees, Graphs, Sorting algorithms, and Big-O asymptotic analysis.",
    createdAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "res-2",
    title: "Linear Algebra & Neural Foundations",
    major: "Artificial Intelligence",
    coverImageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
    resourceUrl: "https://drive.google.com/drive/folders/example-math",
    description: "Matrix operations, eigenvalues, gradient descent, and neural network mathematical foundations.",
    createdAt: "2026-03-05T09:30:00Z",
  },
  {
    id: "res-3",
    title: "Database Systems & Big Data Engineering",
    major: "Data Science",
    coverImageUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80",
    resourceUrl: "https://drive.google.com/drive/folders/example-db",
    description: "Relational normalization (1NF-3NF), ERD design, PostgreSQL queries, and ETL pipelines.",
    createdAt: "2026-03-10T11:15:00Z",
  },
  {
    id: "res-4",
    title: "Operating Systems & Network Penetration Testing",
    major: "Cyber Security",
    coverImageUrl: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&auto=format&fit=crop&q=80",
    resourceUrl: "https://drive.google.com/drive/folders/example-sec",
    description: "Linux kernel architecture, memory vulnerabilities, buffer overflow, and network packet analysis.",
    createdAt: "2026-03-15T14:00:00Z",
  },
  {
    id: "res-5",
    title: "Game Engine Architecture & 3D Math with Unity",
    major: "Game Application and Technology",
    coverImageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
    resourceUrl: "https://drive.google.com/drive/folders/example-gat",
    description: "Vector physics, rendering pipelines, shaders, game loops, and C# scripting fundamentals.",
    createdAt: "2026-03-18T16:00:00Z",
  },
];

export const initialHimtiKitSoftwares: HimtiKitSoftware[] = [
  {
    id: "soft-1",
    name: "Visual Studio Code",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg",
    description: "The premier code editor with comprehensive extension support for WebDev, Python, C++, and Java.",
    downloadUrl: "https://code.visualstudio.com/",
    createdAt: "2026-02-10T08:00:00Z",
  },
  {
    id: "soft-2",
    name: "Docker Desktop",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
    description: "Containerization platform required for running standardized development environments and databases locally.",
    downloadUrl: "https://www.docker.com/products/docker-desktop/",
    createdAt: "2026-02-12T09:00:00Z",
  },
  {
    id: "soft-3",
    name: "Postman",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg",
    description: "API development and testing platform for building, sending requests, and inspecting HTTP endpoints.",
    downloadUrl: "https://www.postman.com/downloads/",
    createdAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "soft-4",
    name: "Git & GitHub CLI",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
    description: "Distributed version control system essential for collaborative software engineering and coursework.",
    downloadUrl: "https://git-scm.com/downloads",
    createdAt: "2026-02-18T11:00:00Z",
  },
];

// LocalStorage helpers for persistent mock testing
const RESOURCES_STORAGE_KEY = "himti_kit_mock_resources_v2";
const SOFTWARES_STORAGE_KEY = "himti_kit_mock_softwares";

export const getStoredResources = (): HimtiKitResource[] => {
  if (typeof window === "undefined") return initialHimtiKitResources;
  const stored = localStorage.getItem(RESOURCES_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(initialHimtiKitResources));
    return initialHimtiKitResources;
  }
  try {
    return JSON.parse(stored) as HimtiKitResource[];
  } catch {
    return initialHimtiKitResources;
  }
};

export const setStoredResources = (data: HimtiKitResource[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(data));
  }
};

export const getStoredSoftwares = (): HimtiKitSoftware[] => {
  if (typeof window === "undefined") return initialHimtiKitSoftwares;
  const stored = localStorage.getItem(SOFTWARES_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(SOFTWARES_STORAGE_KEY, JSON.stringify(initialHimtiKitSoftwares));
    return initialHimtiKitSoftwares;
  }
  try {
    return JSON.parse(stored) as HimtiKitSoftware[];
  } catch {
    return initialHimtiKitSoftwares;
  }
};

export const setStoredSoftwares = (data: HimtiKitSoftware[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(SOFTWARES_STORAGE_KEY, JSON.stringify(data));
  }
};

export const initialHimtiKitAttendees: HimtiKitAttendee[] = [
  { id: "att-1", name: "Alya Putri", nim: "2602111111", createdAt: "2026-08-15T09:00:00Z" },
  { id: "att-2", name: "Bima Pratama", nim: "2602111112", createdAt: "2026-08-15T09:05:00Z" },
  { id: "att-3", name: "Citra Anindita", nim: "2602111113", createdAt: "2026-08-15T09:12:00Z" },
  { id: "att-4", name: "Daffa Mahendra", nim: "2602111114", createdAt: "2026-08-15T09:20:00Z" },
  { id: "att-5", name: "Eka Saputra", nim: "2602111115", createdAt: "2026-08-15T09:35:00Z" },
];

const ATTENDEES_STORAGE_KEY = "himti_kit_mock_attendees";

export const getStoredAttendees = (): HimtiKitAttendee[] => {
  if (typeof window === "undefined") return initialHimtiKitAttendees;
  const stored = localStorage.getItem(ATTENDEES_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(ATTENDEES_STORAGE_KEY, JSON.stringify(initialHimtiKitAttendees));
    return initialHimtiKitAttendees;
  }
  try {
    return JSON.parse(stored) as HimtiKitAttendee[];
  } catch {
    return initialHimtiKitAttendees;
  }
};

export const setStoredAttendees = (data: HimtiKitAttendee[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(ATTENDEES_STORAGE_KEY, JSON.stringify(data));
  }
};
