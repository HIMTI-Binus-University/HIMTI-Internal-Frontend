import { ComponentType } from "react";

export type HimtiPermission =
  | "manage_urls"
  | "manage_users"
  | "manage_roles"
  | "manage_permissions"
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
  group?: string;
  children?: Route[];
}
