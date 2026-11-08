/**
 * CineSphere OS - User Role Types
 * Production-ready Role Definitions for Multi-Tenant Cinema Management
 */

export type UserRole =
  | "SUPER_ADMIN"
  | "THEATRE_ADMIN"
  | "HALL_MANAGER"
  | "STAFF"
  | "CUSTOMER";

export interface RoleMetadata {
  role: UserRole;
  label: string;
  description: string;
  hierarchyLevel: number;
  landingRoute: string;
  allowedRoutePrefixes: string[];
  isTenantScoped: boolean;
  color: string;
}

export type RoleHierarchyMap = Record<UserRole, number>;

