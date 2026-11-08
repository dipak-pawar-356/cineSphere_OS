import { UserRole } from "./role.types";
import { AppPermission } from "./permission.types";

export type UserStatus = "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED" | "INVITED";

/**
 * PostgreSQL Database Model Blueprint
 * Prepared for future Prisma / Drizzle ORM integration without schema changes.
 */
export interface DbUser {
  id: string;                       // Primary UUID / ULID
  clerkId: string;                  // Clerk External User ID (user_2xxxx)
  email: string;
  emailVerified: boolean;
  phone?: string | null;
  phoneVerified?: boolean;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string | null;
  role: UserRole;
  theatreId?: string | null;        // Isolated Tenant ID (Null for Super Admin & Customers)
  theatreName?: string | null;
  status: UserStatus;
  createdAt: string;                // ISO 8601
  updatedAt: string;                // ISO 8601
  lastSignInAt?: string | null;
  metadata?: Record<string, unknown>; // Extensible JSONB payload (GST, permissions, etc.)
}

/**
 * Runtime Authenticated User
 * Extracted from Clerk session JWT claims and multi-tenant security headers.
 */
export interface AuthUser {
  id: string;
  clerkId: string;
  email: string;
  displayName: string;
  role: UserRole;
  theatreId: string | null;
  theatreName: string | null;
  isEmailVerified: boolean;
  avatarUrl?: string | null;
  permissions: AppPermission[];
  status: UserStatus;
}

