export const Status = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' } as const;
export type Status = (typeof Status)[keyof typeof Status];
  
export interface UrlItem {
  id: string;
  shortCode: string;
  originalUrl: string;
  expiresAt: string | null;
  status: Status;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string | null;
}

export interface CreateUrlPayload {
  originalUrl: string;
  shortCode: string;
  expiresAt?: string | null;
}

export interface UpdateUrlPayload {
  id: string;
  originalUrl: string;
  shortCode: string;
  status?: Status;
  expiresAt?: string | null;
}

export interface DeleteUrlPayload {
  id: string;
}

export interface UrlListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: Status;
}

export interface UrlListResponse {
  data: UrlItem[];
  meta: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
}
