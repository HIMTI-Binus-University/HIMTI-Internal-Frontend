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
  linkWorkspaceLinkDeactivate:
    "/api/link-workspaces/:workspaceId/links/:linkId/deactivate",
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

  // Event administration endpoints
  eventGroups: "/api/internal/event-groups",
  eventGroup: "/api/internal/event-groups/:id",
  eventGroupPublish: "/api/internal/event-groups/:id/publish",
  eventGroupArchive: "/api/internal/event-groups/:id/archive",
  eventGroupOrganizers: "/api/internal/event-groups/:id/organizers",
  events: "/api/internal/events",
  event: "/api/internal/events/:id",
  eventPublish: "/api/internal/events/:id/publish",
  eventClose: "/api/internal/events/:id/close",
  eventCancel: "/api/internal/events/:id/cancel",
  eventOrganizers: "/api/internal/events/:id/organizers",
  eventRegistrationSettings: "/api/internal/events/:id/registration-settings",
  eventPackages: "/api/internal/events/:id/packages",
  eventPackage: "/api/internal/events/:id/packages/:packageId",
  eventPackageActivate: "/api/internal/events/:id/packages/:packageId/activate",
  eventPackageDeactivate:
    "/api/internal/events/:id/packages/:packageId/deactivate",
  eventRegistrationForm: "/api/internal/events/:id/registration-form",
  eventRegistrationFormAction:
    "/api/internal/events/:id/registration-form/:action",
  // Election administration endpoints
  elections: "/api/internal/elections",
  election: "/api/internal/elections/:electionId",
  electionCandidates: "/api/internal/elections/:electionId/candidates",
  electionCandidate: "/api/internal/elections/candidates/:candidateId",
  electionOpen: "/api/internal/elections/:electionId/open",
  electionClose: "/api/internal/elections/:electionId/close",
  electionPublish: "/api/internal/elections/:electionId/publish",
  electionDebateSchedule: "/api/internal/elections/:electionId/debate-schedule",
  electionPublicDetails: "/api/internal/elections/:electionId/public-details",
  electionTurnout: "/api/internal/elections/:electionId/turnout",
  electionTally: "/api/internal/elections/:electionId/tally",
};
