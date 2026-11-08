import { AuthUser } from "./user.types";
import { UserRole } from "./role.types";

export interface TenantContext {
  theatreId: string | null;
  theatreSlug: string | null;
  theatreName: string | null;
  isIsolated: boolean;
  isPlatformWide: boolean;
}

export interface UserSession {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  expiresAt: string | null;
  token?: string;
  tenant: TenantContext;
}

/**
 * Clerk JWT Custom Claims Specification
 * Injected into Clerk Session Tokens via Clerk Dashboard JWT Templates.
 */
export interface ClerkCustomClaims {
  userId: string;
  role: UserRole;
  theatreId?: string | null;
  theatreName?: string | null;
  permissions?: string[];
  status: string;
}

