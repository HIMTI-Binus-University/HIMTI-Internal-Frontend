export const Api = {
  // Auth endpoints
  authSignInSocial: "/api/auth/sign-in/social",
  getMe: "/api/user/me",

  // URL Shortener endpoints
  urlCreate: "/api/url/create-url",
  urlList: "/api/url/get-list",
  urlUpdate: "/api/url/update-url/:id",
  urlDelete: "/api/url/delete/:id",
  urlResolve: "/api/url/:shortCode",
  urlLink: "/api/url/link/:shortCode",

  // Shared link workspace endpoints
  linkWorkspaces: "/api/link-workspaces",
  linkWorkspace: "/api/link-workspaces/:workspaceId",
  linkWorkspaceArchive: "/api/link-workspaces/:workspaceId/archive",
  linkWorkspaceMembers: "/api/link-workspaces/:workspaceId/members",
  linkWorkspaceMember: "/api/link-workspaces/:workspaceId/members/:userId",
  linkWorkspaceLinks: "/api/link-workspaces/:workspaceId/links",
  linkWorkspaceLink: "/api/link-workspaces/:workspaceId/links/:linkId",
  linkWorkspaceLinkDeactivate: "/api/link-workspaces/:workspaceId/links/:linkId/deactivate",
  linkWorkspaceAttach: "/api/link-workspaces/:workspaceId/links/attach",

  // Permission endpoints
  permissionList: "/api/permission",
  permissionCreate: "/api/permission",
  permissionUpdate: "/api/permission/:id",
  permissionDelete: "/api/permission/delete/:id",

  // Role endpoints
  roleList: "/api/roles",
  roleCreate: "/api/role",
  roleUpdate: "/api/role/:id",
  roleDelete: "/api/role/delete/:id",
  roleAssignPermission: "/api/role/assign-permission",
  roleRemovePermission: "/api/role/remove-permission",

  // User (RBAC) endpoints
  userList: "/api/users",
  userSummary: "/api/users/summary",
  userExport: "/api/users/export",
  userDetail: "/api/user/:id",
  userRegistrationOptions: "/api/user/registration-options",
  userResendVerification: "/api/user/:id/resend-verification",
  userAssignRole: "/api/role/assign-user",
  userRemoveRole: "/api/role/remove-user",

  // Membership period and resource endpoints
  membershipPeriods: "/api/membership/periods",
  membershipPeriod: "/api/membership/periods/:id",
  membershipPeriodActivate: "/api/membership/periods/:id/activate",
  membershipPeriodReregistration: "/api/membership/periods/:id/reregistration",
  membershipPeriodResources: "/api/membership/periods/:id/resources",
  membershipResource: "/api/membership/resources/:id",
  membershipResourceOrder: "/api/membership/periods/:id/resources/order",

  // Event hub administration endpoints
  eventList: "/api/event/get-list",
  eventCreate: "/api/event/create-event",
  eventUpdate: "/api/event/update-event/:id",
  eventSubeventOrder: "/api/event/:id/sub-events/order",
  subeventList: "/api/sub-event/get-list",
  subeventDetail: "/api/sub-event/get-list/:id",
  subeventCreate: "/api/sub-event/create-sub-event",
  subeventUpdate: "/api/sub-event/update-sub-event/:id",
};
