import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/config/api-client";
import { Api } from "@/constants/api";
import {
  getStoredAttendees,
  getStoredResources,
  getStoredSoftwares,
  setStoredAttendees,
  setStoredResources,
  setStoredSoftwares,
} from "@/data/himti-kit";
import type { ApiDataResponse } from "@/types/batches";
import {
  BACKEND_ENUM_TO_MAJOR,
  MAJOR_TO_BACKEND_ENUM,
  type CreateHimtiKitAttendeeInput,
  type CreateHimtiKitResourceInput,
  type CreateHimtiKitSoftwareInput,
  type HimtiKitAttendee,
  type HimtiKitResource,
  type HimtiKitSoftware,
  type UpdateHimtiKitResourceInput,
  type UpdateHimtiKitSoftwareInput,
  type HimtiKitAppearanceConfig,
} from "@/types/himti-kit";

// Set to false to interact with real backend database.
// Falls back gracefully to mock storage if backend is offline.
export const FORCE_MOCK_HIMTI_KIT = false;

// ==========================================
// Backend response shapes
// ==========================================

interface BackendResource {
  id: string | number;
  title: string;
  description?: string | null;
  major?: string;
  majors?: string[];
  downloadUrl?: string;
  resourceUrl?: string;
  coverImageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendSoftware {
  id: string | number;
  name: string;
  description: string;
  downloadUrl: string;
  coverImageUrl?: string | null;
  logoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendAttendee {
  id: string | number;
  name: string;
  nim: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendBulkImportResult {
  totalSubmitted: number;
  totalCreated: number;
  totalUpdated: number;
  totalDuplicatesInPayload: number;
}

type BackendAppearance = Partial<HimtiKitAppearanceConfig>;

// ==========================================
// Transformers & Payload Mappers
// ==========================================

export const transformBackendResource = (raw: BackendResource): HimtiKitResource => {
  const rawMajor = (Array.isArray(raw.majors) && raw.majors[0]) || raw.major;
  return {
    id: String(raw.id),
    title: raw.title,
    description: raw.description ?? null,
    major: (rawMajor && BACKEND_ENUM_TO_MAJOR[rawMajor]) || rawMajor || "Computer Science",
    downloadUrl: raw.downloadUrl || raw.resourceUrl || "",
    resourceUrl: raw.downloadUrl || raw.resourceUrl || "",
    coverImageUrl: raw.coverImageUrl ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

export const transformResourceCreatePayload = (payload: CreateHimtiKitResourceInput) => {
  const backendMajor = MAJOR_TO_BACKEND_ENUM[payload.major] || payload.major;
  return {
    title: payload.title.trim(),
    description: payload.description?.trim() || undefined,
    major: backendMajor,
    majors: [backendMajor],
    downloadUrl: payload.resourceUrl || payload.downloadUrl || "",
    coverImageUrl: payload.coverImageUrl?.trim() || null,
  };
};

export const transformResourceUpdatePayload = (payload: UpdateHimtiKitResourceInput) => {
  const result: Record<string, unknown> = {};
  if (payload.title !== undefined) result.title = payload.title.trim();
  if (payload.description !== undefined) {
    result.description = payload.description?.trim() || undefined;
  }
  if (payload.major !== undefined) {
    const backendMajor = MAJOR_TO_BACKEND_ENUM[payload.major] || payload.major;
    result.major = backendMajor;
    result.majors = [backendMajor];
  }
  if (payload.resourceUrl !== undefined || payload.downloadUrl !== undefined) {
    result.downloadUrl = payload.resourceUrl || payload.downloadUrl;
  }
  if (payload.coverImageUrl !== undefined) {
    result.coverImageUrl = payload.coverImageUrl?.trim() || null;
  }
  return result;
};

export const transformBackendSoftware = (raw: BackendSoftware): HimtiKitSoftware => ({
  id: String(raw.id),
  name: raw.name,
  description: raw.description,
  downloadUrl: raw.downloadUrl,
  logoUrl: raw.coverImageUrl || raw.logoUrl || null,
  coverImageUrl: raw.coverImageUrl || raw.logoUrl || null,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

export const transformSoftwareCreatePayload = (payload: CreateHimtiKitSoftwareInput) => ({
  name: payload.name.trim(),
  description: payload.description.trim(),
  downloadUrl: payload.downloadUrl.trim(),
  coverImageUrl: payload.logoUrl?.trim() || payload.coverImageUrl?.trim() || null,
});

export const transformSoftwareUpdatePayload = (payload: UpdateHimtiKitSoftwareInput) => {
  const result: Record<string, unknown> = {};
  if (payload.name !== undefined) result.name = payload.name.trim();
  if (payload.description !== undefined) result.description = payload.description.trim();
  if (payload.downloadUrl !== undefined) result.downloadUrl = payload.downloadUrl.trim();
  if (payload.logoUrl !== undefined || payload.coverImageUrl !== undefined) {
    result.coverImageUrl = payload.logoUrl?.trim() || payload.coverImageUrl?.trim() || null;
  }
  return result;
};

export const transformBackendAttendee = (raw: BackendAttendee): HimtiKitAttendee => ({
  id: String(raw.id),
  name: raw.name,
  nim: raw.nim,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

export const himtiKitQueryKeys = {
  resources: (search?: string) => ["himti-kit-resources", search ?? ""] as const,
  softwares: (search?: string) => ["himti-kit-softwares", search ?? ""] as const,
  attendees: (search?: string) => ["himti-kit-attendees", search ?? ""] as const,
  appearance: () => ["himti-kit-appearance"] as const,
};

// ==========================================
// HIMTI KIT Resources (Materi/Rangkuman)
// ==========================================

export const useGetHimtiKitResources = (search?: string) =>
  useQuery({
    queryKey: himtiKitQueryKeys.resources(search),
    queryFn: async () => {
      if (FORCE_MOCK_HIMTI_KIT) {
        const data = getStoredResources();
        if (!search) return data;
        return data.filter(
          (item) =>
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
        );
      }

      try {
        const response = await apiClient.get<ApiDataResponse<BackendResource[]>>(
          Api.himtiKitResources,
          { params: search ? { search } : undefined }
        );
        const data = (response.data?.data || []).map(transformBackendResource);
        return data;
      } catch (error) {
        console.warn(
          "%c[HIMTI-KIT:Materials] Backend GET unavailable, using mock storage:",
          "color: #f59e0b; font-weight: bold;",
          error
        );
        return getStoredResources();
      }
    },
  });

export const useCreateHimtiKitResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateHimtiKitResourceInput) => {
      if (FORCE_MOCK_HIMTI_KIT) {
        const current = getStoredResources();
        const newResource: HimtiKitResource = {
          id: `res-${Date.now()}`,
          ...payload,
          createdAt: new Date().toISOString(),
        };
        setStoredResources([newResource, ...current]);
        return newResource;
      }

      try {
        const backendPayload = transformResourceCreatePayload(payload);
        const response = await apiClient.post<ApiDataResponse<BackendResource>>(
          Api.himtiKitResources,
          backendPayload
        );
        return transformBackendResource(response.data?.data);
      } catch (error) {
        console.error(
          "%c[HIMTI-KIT:Materials] Failed to create in Backend, fallback to mock storage:",
          "color: #ef4444; font-weight: bold;",
          error
        );
        const current = getStoredResources();
        const newResource: HimtiKitResource = {
          id: `res-${Date.now()}`,
          ...payload,
          createdAt: new Date().toISOString(),
        };
        setStoredResources([newResource, ...current]);
        return newResource;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["himti-kit-resources"] });
    },
  });
};

export const useUpdateHimtiKitResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateHimtiKitResourceInput & { id: string }) => {
      if (FORCE_MOCK_HIMTI_KIT) {
        const current = getStoredResources();
        const updated = current.map((item) =>
          item.id === id ? { ...item, ...payload, updatedAt: new Date().toISOString() } : item
        );
        setStoredResources(updated);
        return updated.find((item) => item.id === id)!;
      }

      try {
        const url = Api.himtiKitResource.replace(":id", id);
        const backendPayload = transformResourceUpdatePayload(payload);
        const response = await apiClient.patch<ApiDataResponse<BackendResource>>(url, backendPayload);
        return transformBackendResource(response.data?.data);
      } catch (error) {
        console.error(
          "%c[HIMTI-KIT:Materials] Failed to update in Backend, fallback to mock storage:",
          "color: #ef4444; font-weight: bold;",
          error
        );
        const current = getStoredResources();
        const updated = current.map((item) =>
          item.id === id ? { ...item, ...payload, updatedAt: new Date().toISOString() } : item
        );
        setStoredResources(updated);
        return updated.find((item) => item.id === id)!;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["himti-kit-resources"] });
    },
  });
};

export const useDeleteHimtiKitResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (FORCE_MOCK_HIMTI_KIT) {
        const current = getStoredResources();
        const filtered = current.filter((item) => item.id !== id);
        setStoredResources(filtered);
        return;
      }

      try {
        const url = Api.himtiKitResource.replace(":id", id);
        await apiClient.delete<ApiDataResponse<void>>(url);
      } catch (error) {
        console.error(
          "%c[HIMTI-KIT:Materials] Failed to delete in Backend, fallback to mock storage:",
          "color: #ef4444; font-weight: bold;",
          error
        );
        const current = getStoredResources();
        setStoredResources(current.filter((item) => item.id !== id));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["himti-kit-resources"] });
    },
  });
};

// ==========================================
// HIMTI KIT Softwares (Software Directory)
// ==========================================

export const useGetHimtiKitSoftwares = (search?: string) =>
  useQuery({
    queryKey: himtiKitQueryKeys.softwares(search),
    queryFn: async () => {
      if (FORCE_MOCK_HIMTI_KIT) {
        const data = getStoredSoftwares();
        if (!search) return data;
        return data.filter(
          (item) =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase())
        );
      }

      try {
        const response = await apiClient.get<ApiDataResponse<BackendSoftware[]>>(
          Api.himtiKitSoftwares,
          { params: search ? { search } : undefined }
        );
        const data = (response.data?.data || []).map(transformBackendSoftware);
        return data;
      } catch (error) {
        console.warn(
          "%c[HIMTI-KIT:Software] Backend GET unavailable, using mock storage:",
          "color: #f59e0b; font-weight: bold;",
          error
        );
        return getStoredSoftwares();
      }
    },
  });

export const useCreateHimtiKitSoftware = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateHimtiKitSoftwareInput) => {
      if (FORCE_MOCK_HIMTI_KIT) {
        const current = getStoredSoftwares();
        const newSoftware: HimtiKitSoftware = {
          id: `soft-${Date.now()}`,
          ...payload,
          createdAt: new Date().toISOString(),
        };
        setStoredSoftwares([newSoftware, ...current]);
        return newSoftware;
      }

      try {
        const backendPayload = transformSoftwareCreatePayload(payload);
        const response = await apiClient.post<ApiDataResponse<BackendSoftware>>(
          Api.himtiKitSoftwares,
          backendPayload
        );
        return transformBackendSoftware(response.data?.data);
      } catch (error) {
        console.error(
          "%c[HIMTI-KIT:Software] Failed to create in Backend, fallback to mock storage:",
          "color: #ef4444; font-weight: bold;",
          error
        );
        const current = getStoredSoftwares();
        const newSoftware: HimtiKitSoftware = {
          id: `soft-${Date.now()}`,
          ...payload,
          createdAt: new Date().toISOString(),
        };
        setStoredSoftwares([newSoftware, ...current]);
        return newSoftware;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["himti-kit-softwares"] });
    },
  });
};

export const useUpdateHimtiKitSoftware = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateHimtiKitSoftwareInput & { id: string }) => {
      if (FORCE_MOCK_HIMTI_KIT) {
        const current = getStoredSoftwares();
        const updated = current.map((item) =>
          item.id === id ? { ...item, ...payload, updatedAt: new Date().toISOString() } : item
        );
        setStoredSoftwares(updated);
        return updated.find((item) => item.id === id)!;
      }

      try {
        const url = Api.himtiKitSoftware.replace(":id", id);
        const backendPayload = transformSoftwareUpdatePayload(payload);
        const response = await apiClient.patch<ApiDataResponse<BackendSoftware>>(url, backendPayload);
        return transformBackendSoftware(response.data?.data);
      } catch (error) {
        console.error(
          "%c[HIMTI-KIT:Software] Failed to update in Backend, fallback to mock storage:",
          "color: #ef4444; font-weight: bold;",
          error
        );
        const current = getStoredSoftwares();
        const updated = current.map((item) =>
          item.id === id ? { ...item, ...payload, updatedAt: new Date().toISOString() } : item
        );
        setStoredSoftwares(updated);
        return updated.find((item) => item.id === id)!;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["himti-kit-softwares"] });
    },
  });
};

export const useDeleteHimtiKitSoftware = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (FORCE_MOCK_HIMTI_KIT) {
        const current = getStoredSoftwares();
        setStoredSoftwares(current.filter((item) => item.id !== id));
        return;
      }

      try {
        const url = Api.himtiKitSoftware.replace(":id", id);
        await apiClient.delete<ApiDataResponse<void>>(url);
      } catch (error) {
        console.error(
          "%c[HIMTI-KIT:Software] Failed to delete in Backend, fallback to mock storage:",
          "color: #ef4444; font-weight: bold;",
          error
        );
        const current = getStoredSoftwares();
        setStoredSoftwares(current.filter((item) => item.id !== id));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["himti-kit-softwares"] });
    },
  });
};

// ==========================================
// HIMTI KIT Attendees (TECHNO Access Gate)
// ==========================================

export const useGetHimtiKitAttendees = (search?: string) =>
  useQuery({
    queryKey: himtiKitQueryKeys.attendees(search),
    queryFn: async () => {
      if (FORCE_MOCK_HIMTI_KIT) {
        const data = getStoredAttendees();
        if (!search) return data;
        const q = search.toLowerCase().trim();
        return data.filter(
          (item) => item.name.toLowerCase().includes(q) || item.nim.toLowerCase().includes(q)
        );
      }

      const response = await apiClient.get<ApiDataResponse<BackendAttendee[]>>(
        Api.himtiKitAttendees,
        { params: search ? { search } : undefined }
      );
      const data = (response.data?.data || []).map(transformBackendAttendee);
      return data;
    },
  });

export const upsertAttendeesInMemory = (
  current: HimtiKitAttendee[],
  payload: CreateHimtiKitAttendeeInput[]
): HimtiKitAttendee[] => {
  const existingMap = new Map(current.map((a) => [a.nim.trim().toLowerCase(), a]));
  const now = new Date().toISOString();

  // Deduplicate incoming payload: if the same NIM appears multiple times, the last entry takes precedence
  const payloadMap = new Map<string, CreateHimtiKitAttendeeInput>();
  for (const item of payload) {
    const key = item.nim.trim().toLowerCase();
    if (key) {
      payloadMap.set(key, item);
    }
  }

  // 1. Update existing attendees whose NIM matches any in the payload with the new name
  const updatedCurrent = current.map((att) => {
    const key = att.nim.trim().toLowerCase();
    const match = payloadMap.get(key);
    if (match) {
      return {
        ...att,
        name: match.name.trim(),
        updatedAt: now,
      };
    }
    return att;
  });

  // 2. Add brand new attendees that did not exist before
  const newAttendees: HimtiKitAttendee[] = [];
  let idx = 0;
  for (const [key, item] of payloadMap.entries()) {
    if (!existingMap.has(key)) {
      newAttendees.push({
        id: `att-${Date.now()}-${idx++}`,
        name: item.name.trim(),
        nim: item.nim.trim(),
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return [...newAttendees, ...updatedCurrent];
};

export const useAddHimtiKitAttendees = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateHimtiKitAttendeeInput[]) => {
      const sanitizedAttendees = payload.map((p) => ({
        name: p.name.trim(),
        nim: p.nim.trim(),
      }));

      if (FORCE_MOCK_HIMTI_KIT) {
        const current = getStoredAttendees();
        const updated = upsertAttendeesInMemory(current, sanitizedAttendees);
        setStoredAttendees(updated);
        return updated;
      }


      const response = await apiClient.post<ApiDataResponse<BackendBulkImportResult>>(
        Api.himtiKitAttendeeBulk,
        { attendees: sanitizedAttendees }
      );
      return response.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["himti-kit-attendees"] });
    },
  });
};

export const useDeleteHimtiKitAttendee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (FORCE_MOCK_HIMTI_KIT) {
        const current = getStoredAttendees();
        setStoredAttendees(current.filter((item) => item.id !== id));
        return;
      }

      const url = Api.himtiKitAttendee.replace(":id", id);
      await apiClient.delete<ApiDataResponse<void>>(url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["himti-kit-attendees"] });
    },
  });
};

// ==========================================
// HIMTI KIT Appearance (Public Portal Branding)
// ==========================================

export const DEFAULT_APPEARANCE_CONFIG: HimtiKitAppearanceConfig = {
  backgroundUrl:
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&auto=format&fit=crop&q=80",
  primaryColor: "#0284c7",
  enableOverlay: true,
  overlayOpacity: 65,
  enableBlur: true,
  blurLevel: 4,
};

export const transformBackendAppearance = (raw?: BackendAppearance | null): HimtiKitAppearanceConfig => ({
  backgroundUrl:
    raw?.backgroundImageUrl || raw?.backgroundUrl || DEFAULT_APPEARANCE_CONFIG.backgroundUrl,
  primaryColor: raw?.accentColor || raw?.primaryColor || DEFAULT_APPEARANCE_CONFIG.primaryColor,
  enableOverlay: raw?.overlayEnabled ?? raw?.enableOverlay ?? true,
  overlayOpacity: raw?.overlayDarkness ?? raw?.overlayOpacity ?? 65,
  enableBlur: raw?.blurEnabled ?? raw?.enableBlur ?? true,
  blurLevel: raw?.blurIntensity ?? raw?.blurLevel ?? 4,
  updatedAt: raw?.updatedAt,
});

export const transformAppearancePayload = (payload: HimtiKitAppearanceConfig) => ({
  accentColor: payload.primaryColor,
  backgroundImageUrl: payload.backgroundUrl,
  overlayEnabled: payload.enableOverlay,
  overlayDarkness: Math.round(payload.overlayOpacity),
  blurEnabled: payload.enableBlur,
  blurIntensity: Math.round(payload.blurLevel),
});

const APPEARANCE_STORAGE_KEY = "himti_kit_appearance_config_v4";

export const getStoredAppearanceConfig = (): HimtiKitAppearanceConfig => {
  if (typeof window === "undefined") return DEFAULT_APPEARANCE_CONFIG;
  const stored = localStorage.getItem(APPEARANCE_STORAGE_KEY);
  if (!stored) return DEFAULT_APPEARANCE_CONFIG;
  try {
    return { ...DEFAULT_APPEARANCE_CONFIG, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_APPEARANCE_CONFIG;
  }
};

export const setStoredAppearanceConfig = (config: HimtiKitAppearanceConfig) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(config));
  }
};

export const useGetHimtiKitAppearance = () =>
  useQuery({
    queryKey: himtiKitQueryKeys.appearance(),
    queryFn: async (): Promise<HimtiKitAppearanceConfig> => {
      if (FORCE_MOCK_HIMTI_KIT) {
        return getStoredAppearanceConfig();
      }

      try {
        const response = await apiClient.get<ApiDataResponse<BackendAppearance>>(
          Api.himtiKitAppearance
        );
        if (response.data?.data) {
          const transformed = transformBackendAppearance(response.data.data);
          setStoredAppearanceConfig(transformed);
          return transformed;
        }
        return getStoredAppearanceConfig();
      } catch (error) {
        console.warn(
          "%c[HIMTI-KIT:Appearance] Backend GET unavailable, using local storage:",
          "color: #f59e0b; font-weight: bold;",
          error
        );
        return getStoredAppearanceConfig();
      }
    },
  });

export const useUpdateHimtiKitAppearance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: HimtiKitAppearanceConfig): Promise<HimtiKitAppearanceConfig> => {
      setStoredAppearanceConfig(payload);

      if (FORCE_MOCK_HIMTI_KIT) {
        return payload;
      }

      try {
        const backendPayload = transformAppearancePayload(payload);
        const response = await apiClient.patch<ApiDataResponse<BackendAppearance>>(
          Api.himtiKitAppearance,
          backendPayload
        );
        const transformed = transformBackendAppearance(response.data?.data);
        return transformed;
      } catch (error) {
        console.error(
          "%c[HIMTI-KIT:Appearance] Failed to sync to Backend, saved to local storage fallback:",
          "color: #ef4444; font-weight: bold;",
          error
        );
        return payload;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: himtiKitQueryKeys.appearance() });
    },
  });
};

export const useResetHimtiKitAppearance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<HimtiKitAppearanceConfig> => {
      setStoredAppearanceConfig(DEFAULT_APPEARANCE_CONFIG);

      if (FORCE_MOCK_HIMTI_KIT) {
        return DEFAULT_APPEARANCE_CONFIG;
      }

      try {
        const response = await apiClient.post<ApiDataResponse<BackendAppearance>>(
          Api.himtiKitAppearanceReset
        );
        const transformed = transformBackendAppearance(response.data?.data);
        return transformed;
      } catch (error) {
        console.error(
          "%c[HIMTI-KIT:Appearance] Backend appearance reset unavailable, reset in local storage:",
          "color: #ef4444; font-weight: bold;",
          error
        );
        return DEFAULT_APPEARANCE_CONFIG;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: himtiKitQueryKeys.appearance() });
    },
  });
};


