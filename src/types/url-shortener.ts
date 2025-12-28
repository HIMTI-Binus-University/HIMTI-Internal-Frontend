export interface UrlItem {
  id: string;
  shortCode: string;
  originalUrl: string;
  expiresAt: string | null;
  status: string;
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
  status?: string;
  expiresAt?: string | null;
}

export interface UrlListResponse {
  data: UrlItem[];
}
