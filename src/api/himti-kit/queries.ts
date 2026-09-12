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
import type {
  CreateHimtiKitAttendeeInput,
  CreateHimtiKitResourceInput,
  CreateHimtiKitSoftwareInput,
  HimtiKitAttendee,
  HimtiKitResource,
  HimtiKitSoftware,
  UpdateHimtiKitResourceInput,
  UpdateHimtiKitSoftwareInput,
} from "@/types/himti-kit";

// Set to true while developing frontend independently.
// Once your backend is running, set this to false!
export const FORCE_MOCK_HIMTI_KIT = true;

export const himtiKitQueryKeys = {
  resources: (search?: string) => ["himti-kit-resources", search ?? ""] as const,
  softwares: (search?: string) => ["himti-kit-softwares", search ?? ""] as const,
  attendees: (search?: string) => ["himti-kit-attendees", search ?? ""] as const,
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
        const response = await apiClient.get<ApiDataResponse<HimtiKitResource[]>>(
          Api.himtiKitResources,
          { params: search ? { search } : undefined }
        );
        return response.data.data;
      } catch (error) {
        console.warn("Backend unavailable, falling back to mock resources:", error);
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
        const response = await apiClient.post<ApiDataResponse<HimtiKitResource>>(
          Api.himtiKitResources,
          payload
        );
        return response.data.data;
      } catch (error) {
        console.warn("Backend unavailable, creating in mock storage:", error);
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
        const response = await apiClient.put<ApiDataResponse<HimtiKitResource>>(url, payload);
        return response.data.data;
      } catch (error) {
        console.warn("Backend unavailable, updating in mock storage:", error);
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
        console.warn("Backend unavailable, deleting from mock storage:", error);
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
        const response = await apiClient.get<ApiDataResponse<HimtiKitSoftware[]>>(
          Api.himtiKitSoftwares,
          { params: search ? { search } : undefined }
        );
        return response.data.data;
      } catch (error) {
        console.warn("Backend unavailable, falling back to mock softwares:", error);
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
        const response = await apiClient.post<ApiDataResponse<HimtiKitSoftware>>(
          Api.himtiKitSoftwares,
          payload
        );
        return response.data.data;
      } catch (error) {
        console.warn("Backend unavailable, creating in mock storage:", error);
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
        const response = await apiClient.put<ApiDataResponse<HimtiKitSoftware>>(url, payload);
        return response.data.data;
      } catch (error) {
        console.warn("Backend unavailable, updating in mock storage:", error);
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
        console.warn("Backend unavailable, deleting from mock storage:", error);
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

      try {
        const response = await apiClient.get<ApiDataResponse<HimtiKitAttendee[]>>(
          Api.himtiKitAttendees,
          { params: search ? { search } : undefined }
        );
        return response.data.data;
      } catch (error) {
        console.warn("Backend unavailable, falling back to mock attendees:", error);
        return getStoredAttendees();
      }
    },
  });

export const useAddHimtiKitAttendees = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateHimtiKitAttendeeInput[]) => {
      if (FORCE_MOCK_HIMTI_KIT) {
        const current = getStoredAttendees();
        const existingNims = new Set(current.map((a) => a.nim));
        const newAttendees: HimtiKitAttendee[] = payload
          .filter((p) => !existingNims.has(p.nim))
          .map((p, idx) => ({
            id: `att-${Date.now()}-${idx}`,
            name: p.name,
            nim: p.nim,
            createdAt: new Date().toISOString(),
          }));

        const updated = [...newAttendees, ...current];
        setStoredAttendees(updated);
        return newAttendees;
      }

      try {
        const response = await apiClient.post<ApiDataResponse<HimtiKitAttendee[]>>(
          Api.himtiKitAttendeeBulk,
          { attendees: payload }
        );
        return response.data.data;
      } catch (error) {
        console.warn("Backend unavailable, adding to mock storage:", error);
        const current = getStoredAttendees();
        const existingNims = new Set(current.map((a) => a.nim));
        const newAttendees: HimtiKitAttendee[] = payload
          .filter((p) => !existingNims.has(p.nim))
          .map((p, idx) => ({
            id: `att-${Date.now()}-${idx}`,
            name: p.name,
            nim: p.nim,
            createdAt: new Date().toISOString(),
          }));

        const updated = [...newAttendees, ...current];
        setStoredAttendees(updated);
        return newAttendees;
      }
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

      try {
        const url = Api.himtiKitAttendee.replace(":id", id);
        await apiClient.delete<ApiDataResponse<void>>(url);
      } catch (error) {
        console.warn("Backend unavailable, deleting from mock storage:", error);
        const current = getStoredAttendees();
        setStoredAttendees(current.filter((item) => item.id !== id));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["himti-kit-attendees"] });
    },
  });
};
