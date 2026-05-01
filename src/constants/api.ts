import { API_URL } from "./api-service";

export const Api = {
  // Auth endpoints
  authSignInSocial: `${API_URL}/api/auth/sign-in/social`,
  getMe: `${API_URL}/api/registration/me`,

  // URL Shortener endpoints
  urlCreate: `${API_URL}/api/url/create-url`,
  urlList: `${API_URL}/api/url/get-list`,
  urlUpdate: `${API_URL}/api/url/update-url/:id`,
  urlDelete: `${API_URL}/api/url/delete/:id`,
  urlResolve: `${API_URL}/api/url/:shortCode`,
  urlLink: `${API_URL}/api/url/link/:shortCode`,

  // Permission endpoints
  permissionList: `${API_URL}/api/permission`,
  permissionCreate: `${API_URL}/api/permission`,
  permissionUpdate: `${API_URL}/api/permission/:id`,

  // Role endpoints
  roleList: `${API_URL}/api/roles`,
  roleCreate: `${API_URL}/api/role`,
  roleUpdate: `${API_URL}/api/role/:id`,
  roleAssignPermission: `${API_URL}/api/role/assign-permission`,
  roleRemovePermission: `${API_URL}/api/role/remove-permission`,

  // User (RBAC) endpoints
  userList: `${API_URL}/api/users`,
  userAssignRole: `${API_URL}/api/role/assign-user`,
  userRemoveRole: `${API_URL}/api/role/remove-user`,
};
