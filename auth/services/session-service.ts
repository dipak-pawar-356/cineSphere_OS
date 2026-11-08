import { SECURITY_CONFIG } from "../constants/security.constants";
import { AuthUser } from "../types/user.types";
import { TenantContext } from "../types/session.types";

export interface StoredSessionPayload {
  user: AuthUser;
  expiresAt: number;
}

/**
 * Client & Server Session Storage Service
 * Handles persistence of role context and tenant identification.
 */
export class SessionService {
  private static STORAGE_KEY = SECURITY_CONFIG.SESSION.COOKIE_NAME;

  public static getStoredUser(): AuthUser | null {
    if (typeof window === "undefined") return null;

    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return null;

      const parsed: StoredSessionPayload = JSON.parse(data);
      if (Date.now() > parsed.expiresAt) {
        this.clearSession();
        return null;
      }
      return parsed.user;
    } catch {
      return null;
    }
  }

  public static setStoredUser(user: AuthUser, rememberMe = false): void {
    if (typeof window === "undefined") return;

    try {
      const durationSeconds = rememberMe
        ? SECURITY_CONFIG.SESSION.REMEMBER_ME_SECONDS
        : SECURITY_CONFIG.SESSION.MAX_AGE_SECONDS;

      const payload: StoredSessionPayload = {
        user,
        expiresAt: Date.now() + durationSeconds * 1000,
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));

      // Also set lightweight cookie for middleware / server consumption
      document.cookie = `${this.STORAGE_KEY}=${user.role}; path=/; max-age=${durationSeconds}; SameSite=Lax`;
      if (user.theatreId) {
        document.cookie = `${SECURITY_CONFIG.SESSION.TENANT_COOKIE_NAME}=${user.theatreId}; path=/; max-age=${durationSeconds}; SameSite=Lax`;
      }
    } catch {
      // Safe fallback
    }
  }

  public static clearSession(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(this.STORAGE_KEY);
      document.cookie = `${this.STORAGE_KEY}=; path=/; max-age=0`;
      document.cookie = `${SECURITY_CONFIG.SESSION.TENANT_COOKIE_NAME}=; path=/; max-age=0`;
    } catch {
      // Safe fallback
    }
  }

  public static getTenantContext(user: AuthUser | null): TenantContext {
    if (!user) {
      return {
        theatreId: null,
        theatreSlug: null,
        theatreName: null,
        isIsolated: false,
        isPlatformWide: false,
      };
    }

    return {
      theatreId: user.theatreId,
      theatreSlug: user.theatreId ? user.theatreId.replace("th-", "") : null,
      theatreName: user.theatreName,
      isIsolated: Boolean(user.theatreId),
      isPlatformWide: user.role === "SUPER_ADMIN",
    };
  }
}

