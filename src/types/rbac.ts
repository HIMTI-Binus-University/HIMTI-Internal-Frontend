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
}

export interface RbacUserListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
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

export interface AssignRolePermissionPayload {
  roleId: string;
  permissionId: string;
}

export interface AssignUserRolePayload {
  userId: string;
  roleId: string;
}
