export interface HimtiKitResource {
  id: string;
  title: string;
  semester: number | string;
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
