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
  image: string | null;
  roles?: { id: string; roleName: string; status: string }[];
  permissions?: { id: string; name: string; status: string }[];
  emailVerified: boolean;
  outlookEmail: string | null;
  outlookEmailVerified?: boolean;
  memberType: "STUDENT" | "LECTURER" | "OTHER" | null;
  institutionType: "BINUS" | "NON_BINUS" | null;
  binusRegion: { id: string; name: string } | null;
  universityName: string | null;
  studyProgramName: string | null;
  department: string | null;
  affiliation: string | null;
  registrationCompletedAt: string | null;
  nim: string | null;
  universityId: string | null;
  studyProgramId: string | null;
  university: { id: string; name: string } | null;
  studyProgram: { id: string; name: string } | null;
  graduateBatch: string | null;
  phoneNumber: string | null;
  lineId: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt?: string | null;
}

export interface RbacUserListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
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

export type UpdateUserPayload = Partial<Pick<RbacUser, "name" | "email" | "emailVerified" | "outlookEmail" | "outlookEmailVerified" | "image" | "status" | "nim" | "universityId" | "studyProgramId" | "graduateBatch" | "phoneNumber" | "lineId" | "memberType" | "institutionType" | "universityName" | "studyProgramName" | "department" | "affiliation">> & { binusRegionId?: string | null };
