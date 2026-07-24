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

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type MemberType = "STUDENT" | "LECTURER" | "OTHER";
export type InstitutionType = "BINUS" | "NON_BINUS";

export interface UserRelation {
  id: string;
  name: string;
  shortName: string | null;
}

export interface UserRole {
  id: string;
  roleName: string;
  status: string;
}

export interface RbacUserListItem {
  id: string;
  name: string;
  email: string;
  image: string | null;
  roles: UserRole[];
  emailVerified: boolean;
  outlookEmail: string | null;
  outlookEmailVerified: boolean;
  memberType: MemberType | null;
  institutionType: InstitutionType | null;
  regionId: string | null;
  region: UserRelation | null;
  universityName: string | null;
  studyProgramName: string | null;
  department: string | null;
  affiliation: string | null;
  registrationCompletedAt: string | null;
  nim: string | null;
  universityId: string | null;
  studyProgramId: string | null;
  university: UserRelation | null;
  studyProgram: UserRelation | null;
  graduateBatch: string | null;
  phoneNumber: string | null;
  lineId: string | null;
  status: UserStatus;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface RbacUserDetail extends RbacUserListItem {
  permissions: { id: string; name: string; status: string }[];
}

export type RbacUserUpdateResult = Omit<RbacUserListItem, "roles">;

export interface RbacUserListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  sort?: string;
  memberType?: MemberType;
  institutionType?: InstitutionType;
  regionId?: string;
  verification?: boolean;
  completed?: boolean;
}

export interface RbacUserListResponse {
  msg: string;
  data: RbacUserListItem[];
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
  unverifiedOutlookEmail: number;
  byMemberType: Record<string, number>;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  emailVerified?: boolean;
  outlookEmail?: string | null;
  outlookEmailVerified?: boolean;
  image?: string | null;
  status?: UserStatus;
  memberType?: MemberType | null;
  institutionType?: InstitutionType | null;
  universityId?: string | null;
  universityName?: string | null;
  studyProgramId?: string | null;
  studyProgramName?: string | null;
  regionId?: string | null;
  nim?: string | null;
  graduateBatch?: string | null;
  department?: string | null;
  affiliation?: string | null;
  phoneNumber?: string | null;
  lineId?: string | null;
}

export interface RegistrationOption {
  id: string;
  name: string;
  shortName: string | null;
}

export interface RegistrationOptions {
  universities: RegistrationOption[];
  studyPrograms: RegistrationOption[];
  binusRegions: RegistrationOption[];
}
