/**
 * CineSphere OS - Authentication Bridge (Backward Compatibility)
 * Re-exports from @/auth
 */

export * from "@/auth";

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
  } | null;
  isAuthenticated: boolean;
  expiresAt: string | null;
}

export async function getSession(): Promise<AuthSession> {
  return {
    user: null,
    isAuthenticated: false,
    expiresAt: null,
  };
}

export async function validateToken(token: string): Promise<boolean> {
  return Boolean(token);
}
