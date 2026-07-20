export interface Permission {
  id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface Role {
  id: string;
  roleName: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  permissions?: Permission[];
}

export interface RbacUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  roles?: { id: string; roleName: string; status: string }[];
  binusEmail: string | null;
  binusEmailVerified: boolean;
  binusEmailVerifiedAt: string | null;
  memberType: "STUDENT" | "LECTURER" | "OTHER" | null;
  institutionType: "BINUS" | "NON_BINUS" | null;
  binusRegion: { id: string; name: string } | null;
  nim: string | null;
  universityName: string | null;
  studyProgramName: string | null;
  graduateBatch: string | null;
  department: string | null;
  affiliation: string | null;
  phoneNumber: string | null;
  lineId: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  registrationCompletedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface RbacUserListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  memberType?: string;
  institutionType?: string;
  binusRegion?: string;
  verification?: string;
  completed?: string;
}

export interface RbacUserListResponse {
  msg: string;
  data: RbacUser[];
  meta: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
}

export interface UpdatePermissionPayload {
  id: string;
  name?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface UpdateRolePayload {
  id: string;
  roleName?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface DeletePermissionPayload {
  id: string;
}

export interface DeleteRolePayload {
  id: string;
}

export interface AssignRolePermissionPayload {
  roleId: string;
  permissionId: string;
}

export interface AssignUserRolePayload {
  userId: string;
  roleId: string;
}

export interface RbacUserSummary {
  total: number;
  today: number;
  unverifiedBinus: number;
  byMemberType: Record<string, number>;
}

export type UpdateUserPayload = Partial<Pick<RbacUser, "name" | "email" | "binusEmail" | "memberType" | "institutionType" | "nim" | "universityName" | "studyProgramName" | "graduateBatch" | "department" | "affiliation" | "phoneNumber" | "lineId" | "status"> & { binusRegionId: string | null }>;
