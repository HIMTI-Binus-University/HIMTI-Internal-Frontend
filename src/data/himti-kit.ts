import type { HimtiKitResource, HimtiKitSoftware } from "@/types/himti-kit";

export const initialHimtiKitResources: HimtiKitResource[] = [
  {
    id: "res-1",
    title: "Data Structures & Algorithms Comprehensive Notes",
    semester: 2,
    coverImageUrl: "https://images.unsplash.com/photo-1516116211227-bbc13c7d690c?w=600&auto=format&fit=crop&q=80",
    resourceUrl: "https://drive.google.com/drive/folders/example-dsa",
    description: "In-depth summary covering Trees, Graphs, Sorting algorithms, and Big-O asymptotic analysis.",
    createdAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "res-2",
    title: "Linear Algebra & Engineering Mathematics",
    semester: 1,
    coverImageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
    resourceUrl: "https://drive.google.com/drive/folders/example-math",
    description: "Matrix operations, eigenvalues, vector spaces, and exam preparation cheat sheets.",
    createdAt: "2026-03-05T09:30:00Z",
  },
  {
    id: "res-3",
    title: "Database Systems & SQL Design Patterns",
    semester: 3,
    coverImageUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80",
    resourceUrl: "https://drive.google.com/drive/folders/example-db",
    description: "Relational database normalization (1NF-3NF), ERD design, indexing strategies, and PostgreSQL queries.",
    createdAt: "2026-03-10T11:15:00Z",
  },
  {
    id: "res-4",
    title: "Operating Systems & Concurrency Guide",
    semester: 4,
    coverImageUrl: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&auto=format&fit=crop&q=80",
    resourceUrl: "https://drive.google.com/drive/folders/example-os",
    description: "Process synchronization, deadlocks, memory virtualization, and paging systems.",
    createdAt: "2026-03-15T14:00:00Z",
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
const RESOURCES_STORAGE_KEY = "himti_kit_mock_resources";
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
