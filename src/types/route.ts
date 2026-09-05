import { ComponentType } from "react";

export type HimtiPermission =
  | "manage_urls"
  | "manage_users"
  | "manage_roles"
  | "manage_permissions"
  | "manage_events"
  | "manage_event_groups"
  | "manage_event_registration"
  | "manage_event_packages"
  | "manage_event_registration_form"
  | "manage_elections"
  | "view_election_results"
  | "manage_batch"
  | "create_events"
  | "view_dashboard";

export interface Route {
  key: string;
  title: string;
  description: string;
  component: ComponentType;
  path: string;
  isEnabled: boolean;
  isProtected: boolean;
  requiredPermission?: HimtiPermission;
  allowedRoles?: string[];
  group?: string;
  children?: Route[];
}
