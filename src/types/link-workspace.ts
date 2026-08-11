import type { Status } from "./url-shortener";

export type WorkspaceRole = "OWNER" | "EDITOR" | "VIEWER";
export type WorkspaceStatus = "ACTIVE" | "ARCHIVED";

export interface WorkspaceMemberUser {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: string;
  updatedAt?: string | null;
  user: WorkspaceMemberUser;
}

export interface LinkWorkspace {
  id: string;
  name: string;
  description: string | null;
  status: WorkspaceStatus;
  createdAt: string;
  updatedAt?: string | null;
  createdBy: string;
  updatedBy?: string | null;
  members: WorkspaceMember[];
  _count: { links: number };
}

export interface WorkspaceLink {
  id: string;
  workspaceId: string;
  urlId: string;
  status: Status;
  createdAt: string;
  updatedAt?: string | null;
  createdBy: string;
  updatedBy?: string | null;
  url: {
    id: string;
    originalUrl: string;
    shortCode: string;
    expiresAt: string | null;
    status: Status;
    createdAt: string;
    updatedAt?: string | null;
    createdBy: string;
    updatedBy?: string | null;
  };
  creator: { id: string; name: string };
}

export interface ApiEnvelope<T> {
  msg: "success";
  data: T;
}

export interface PaginatedEnvelope<T> extends ApiEnvelope<T[]> {
  meta: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
}

export interface WorkspaceLinkInput {
  originalUrl: string;
  shortCode: string;
  expiresAt?: string;
}

export const getWorkspaceRole = (
  workspace: LinkWorkspace,
  userId?: string,
): WorkspaceRole | undefined =>
  workspace.members.find((member) => member.userId === userId)?.role;

export const canManageWorkspace = (role?: WorkspaceRole, isAdmin = false) =>
  isAdmin || role === "OWNER";

export const canEditWorkspaceLinks = (role?: WorkspaceRole, isAdmin = false) =>
  isAdmin || role === "OWNER" || role === "EDITOR";
