import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/config/api-client";
import { Api } from "@/constants/api";
import type { ApiDataResponse } from "@/types/batches";
import type {
  CreateHimtiKitResourceInput,
  CreateHimtiKitSoftwareInput,
  HimtiKitResource,
  HimtiKitSoftware,
  UpdateHimtiKitResourceInput,
  UpdateHimtiKitSoftwareInput,
} from "@/types/himti-kit";

export const himtiKitQueryKeys = {
  resources: (search?: string) => ["himti-kit-resources", search ?? ""] as const,
  softwares: (search?: string) => ["himti-kit-softwares", search ?? ""] as const,
};

// ==========================================
// HIMTI KIT Resources (Materi/Rangkuman)
// ==========================================

export const useGetHimtiKitResources = (search?: string) =>
  useQuery({
    queryKey: himtiKitQueryKeys.resources(search),
    queryFn: async () => {
      const response = await apiClient.get<ApiDataResponse<HimtiKitResource[]>>(
        Api.himtiKitResources,
        { params: search ? { search } : undefined }
      );
      return response.data.data;
    },
  });

export const useCreateHimtiKitResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateHimtiKitResourceInput) => {
      const response = await apiClient.post<ApiDataResponse<HimtiKitResource>>(
        Api.himtiKitResources,
        payload
      );
      return response.data.data;
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
      const url = Api.himtiKitResource.replace(":id", id);
      const response = await apiClient.put<ApiDataResponse<HimtiKitResource>>(url, payload);
      return response.data.data;
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
      const url = Api.himtiKitResource.replace(":id", id);
      const response = await apiClient.delete<ApiDataResponse<void>>(url);
      return response.data;
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
      const response = await apiClient.get<ApiDataResponse<HimtiKitSoftware[]>>(
        Api.himtiKitSoftwares,
        { params: search ? { search } : undefined }
      );
      return response.data.data;
    },
  });

export const useCreateHimtiKitSoftware = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateHimtiKitSoftwareInput) => {
      const response = await apiClient.post<ApiDataResponse<HimtiKitSoftware>>(
        Api.himtiKitSoftwares,
        payload
      );
      return response.data.data;
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
      const url = Api.himtiKitSoftware.replace(":id", id);
      const response = await apiClient.put<ApiDataResponse<HimtiKitSoftware>>(url, payload);
      return response.data.data;
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
      const url = Api.himtiKitSoftware.replace(":id", id);
      const response = await apiClient.delete<ApiDataResponse<void>>(url);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["himti-kit-softwares"] });
    },
  });
};
