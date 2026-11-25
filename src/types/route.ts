import { ComponentType } from "react";

export const educationSummaryPermissions = [
  "create_education_summary",
  "edit_education_summary",
  "review_education_summary",
  "publish_education_summary",
  "archive_education_summary",
] as const;

export type HimtiPermission =
  | (typeof educationSummaryPermissions)[number]
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
  | "manage_education"
  | "manage_certificates"
  | "view_election_results"
  | "manage_batch"
  | "manage_himti_kit"
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
  alternatePermissions?: readonly HimtiPermission[];
  allowedRoles?: string[];
  group?: string;
  children?: Route[];
}
