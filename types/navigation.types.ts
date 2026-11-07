import { LucideIcon } from "lucide-react";

export type Role = "Super Admin" | "Theatre Admin" | "Hall Manager" | "Staff" | "Customer";

export type Permission =
  | "theatre:read"
  | "theatre:write"
  | "hall:read"
  | "hall:write"
  | "show:read"
  | "show:write"
  | "booking:read"
  | "booking:refund"
  | "reports:export"
  | "analytics:view"
  | "billing:manage";

export interface NavigationItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string | number;
  badgeVariant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
  description?: string;
  roles?: Role[];
  permissions?: Permission[];
  children?: NavigationItem[];
}

export interface NavigationSection {
  title?: string;
  items: NavigationItem[];
}

