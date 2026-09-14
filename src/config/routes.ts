import { Route } from "@/types/route";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import UrlShortenerPage from "@/pages/url-shortener";
import RedirectLoadingPage from "@/pages/loading";
import RbacPermissionsPage from "@/pages/rbac/permissions";
import RbacRolesPage from "@/pages/rbac/roles";
import RbacUsersPage from "@/pages/rbac/users";
import RbacUserDetailPage from "@/pages/rbac/users/detail";
import EventsPage from "@/pages/events";
import EventEditorPage from "@/pages/events/editor";
import EventWorkspacePage from "@/pages/events/workspace";
import EventGroupEditorPage from "@/pages/event-groups/editor";
import EventGroupWorkspacePage from "@/pages/event-groups/workspace";
import BatchesPage from "@/pages/batches";
import CompleteRegistrationPage from "@/pages/complete-registration";
import ElectionsPage from "@/pages/elections";
import ElectionEditorPage from "@/pages/elections/editor";
import ElectionWorkspacePage from "@/pages/elections/workspace";

export const publicRoutes: Route[] = [
  {
    key: "router-event-group-create",
    title: "Create event group",
    description: "Create Event Group",
    component: EventGroupEditorPage,
    path: "/event-groups/new",
    isEnabled: true,
    isProtected: true,
    requiredPermission: "manage_event_groups",
  },
  {
    key: "router-event-group-edit",
    title: "Edit event group",
    description: "Edit Event Group",
    component: EventGroupEditorPage,
    path: "/event-groups/:eventGroupId/edit",
    isEnabled: true,
    isProtected: true,
    requiredPermission: "manage_event_groups",
  },
  {
    key: "router-event-group-workspace",
    title: "Event group workspace",
    description: "Event Group Workspace",
    component: EventGroupWorkspacePage,
    path: "/event-groups/:eventGroupId",
    isEnabled: true,
    isProtected: true,
    requiredPermission: "manage_event_groups",
  },
  {
    key: "router-home",
    title: "Home",
    description: "Home Page",
    component: HomePage,
    path: "/",
    isEnabled: true,
    isProtected: false,
  },
  {
    key: "router-login",
    title: "Login",
    description: "Login Page",
    component: LoginPage,
    path: "/login",
    isEnabled: true,
    isProtected: false,
  },
  {
    key: "router-complete-registration",
    title: "Complete registration",
    description: "Complete HIMTI membership registration",
    component: CompleteRegistrationPage,
    path: "/complete-registration",
    isEnabled: true,
    isProtected: false,
  },
  {
    key: "router-url-shortener",
    title: "URL Shortener",
    description: "URL Shortener Page",
    component: UrlShortenerPage,
    path: "/url-shortener",
    isEnabled: true,
    isProtected: true,
    requiredPermission: "manage_urls",
    allowedRoles: ["Admin"],
    group: "Tools",
  },
  {
    key: "router-batches",
    title: "Batch",
    description: "Academic Period Management",
    component: BatchesPage,
    path: "/batches",
    isEnabled: true,
    isProtected: true,
    requiredPermission: "manage_batch",
    group: "Tools",
  },
  {
    key: "router-events",
    title: "Events",
    description: "Events Management Page",
    component: EventsPage,
    path: "/events",
    isEnabled: true,
    isProtected: true,
    requiredPermission: "manage_events",
    group: "Tools",
  },
  {
    key: "router-event-create",
    title: "Create event",
    description: "Create Event",
    component: EventEditorPage,
    path: "/events/new",
    isEnabled: true,
    isProtected: true,
    requiredPermission: "manage_events",
  },
  {
    key: "router-event-edit",
    title: "Edit event",
    description: "Edit Event",
    component: EventEditorPage,
    path: "/events/:eventId/edit",
    isEnabled: true,
    isProtected: true,
    requiredPermission: "manage_events",
  },
  {
    key: "router-event-workspace",
    title: "Event workspace",
    description: "Event Workspace",
    component: EventWorkspacePage,
    path: "/events/:eventId",
    isEnabled: true,
    isProtected: true,
    requiredPermission: "manage_events",
  },
  {
    key: "router-elections",
    title: "Elections",
    description: "Election Administration",
    component: ElectionsPage,
    path: "/elections",
    isEnabled: true,
    isProtected: true,
    requiredPermission: "manage_elections",
    group: "Tools",
  },
  {
    key: "router-election-create",
    title: "Create election",
    description: "Create Election",
    component: ElectionEditorPage,
    path: "/elections/new",
    isEnabled: true,
    isProtected: true,
    requiredPermission: "manage_elections",
  },
  {
    key: "router-election-edit",
    title: "Edit election",
    description: "Edit Election",
    component: ElectionEditorPage,
    path: "/elections/:electionId/edit",
    isEnabled: true,
    isProtected: true,
    requiredPermission: "manage_elections",
  },
  {
    key: "router-election-workspace",
    title: "Election workspace",
    description: "Election Workspace",
    component: ElectionWorkspacePage,
    path: "/elections/:electionId",
    isEnabled: true,
    isProtected: true,
    requiredPermission: "manage_elections",
  },
  {
    key: "router-rbac-permissions",
    title: "Permissions",
    description: "RBAC Permissions Management",
    component: RbacPermissionsPage,
    path: "/rbac/permissions",
    isEnabled: true,
    isProtected: true,
    requiredPermission: "manage_permissions",
    group: "RBAC",
  },
  {
    key: "router-rbac-user-detail",
    title: "User detail",
    description: "RBAC User Detail",
    component: RbacUserDetailPage,
    path: "/rbac/users/:userId",
    isEnabled: true,
    isProtected: true,
    requiredPermission: "manage_users",
  },
  {
    key: "router-rbac-roles",
    title: "Roles",
    description: "RBAC Roles Management",
    component: RbacRolesPage,
    path: "/rbac/roles",
    isEnabled: true,
    isProtected: true,
    requiredPermission: "manage_roles",
    group: "RBAC",
  },
  {
    key: "router-rbac-users",
    title: "Users",
    description: "RBAC Users Management",
    component: RbacUsersPage,
    path: "/rbac/users",
    isEnabled: true,
    isProtected: true,
    requiredPermission: "manage_users",
    group: "RBAC",
  },
  {
    key: "router-link-root-on-admin-host",
    title: "Redirect Root",
    description: "Short link root redirect on admin/general host",
    component: RedirectLoadingPage,
    path: "/link",
    isEnabled: true,
    isProtected: false,
  },
  {
    key: "router-link-shortcode-on-admin-host",
    title: "Redirect",
    description: "Short link redirect on admin/general host",
    component: RedirectLoadingPage,
    path: "/link/:shortCode",
    isEnabled: true,
    isProtected: false,
  },
];

export const protectedRoutes: Route[] = [];

export const linkRoutes: Route[] = [
  {
    key: "router-link-host-root",
    title: "Redirect Root",
    description: "Short link root redirect on dedicated link host",
    component: RedirectLoadingPage,
    path: "/",
    isEnabled: true,
    isProtected: false,
  },
  {
    key: "router-link-host-shortcode",
    title: "Redirect",
    description: "Short link redirect on dedicated link host",
    component: RedirectLoadingPage,
    path: "/:shortCode",
    isEnabled: true,
    isProtected: false,
  },
];

export const getAccessibleInternalRoutes = (
  permissions: string[],
  roles: string[] = [],
) =>
  publicRoutes.filter(
    (route) =>
      route.isEnabled &&
      route.isProtected &&
      route.group &&
      route.requiredPermission &&
      (permissions.includes(route.requiredPermission) ||
        route.allowedRoles?.some((role) => roles.includes(role))),
  );

export const getFirstAccessibleInternalRoute = (
  permissions: string[],
  roles: string[] = [],
) => getAccessibleInternalRoutes(permissions, roles)[0];
