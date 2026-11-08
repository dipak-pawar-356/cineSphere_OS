"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { AuthUser } from "../types/user.types";
import { UserRole } from "../types/role.types";
import { AppPermission } from "../types/permission.types";
import { TenantContext } from "../types/session.types";
import { SessionService } from "../services/session-service";
import { MOCK_USERS, getMockUserByRole } from "../services/mock-auth-service";
import { checkRolePermission } from "../permissions/rbac-matrix";
import { isRoleAtLeast } from "../roles/role-hierarchy";
import { ROLE_LANDING_ROUTES } from "../constants/auth-routes";
import { useRouter } from "next/navigation";

export interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole | null;
  tenant: TenantContext;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithRole: (role: UserRole, customTheatreId?: string) => void;
  signOut: () => void;
  hasRole: (requiredRole: UserRole) => boolean;
  hasPermission: (permission: AppPermission) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize session from client storage
  useEffect(() => {
    const stored = SessionService.getStoredUser();
    if (stored) {
      setUser(stored);
    }
    setIsLoading(false);
  }, []);

  const tenant = useMemo(() => {
    return SessionService.getTenantContext(user);
  }, [user]);

  const signInWithRole = useCallback(
    (role: UserRole, customTheatreId?: string) => {
      let selectedUser = getMockUserByRole(role);

      if (customTheatreId && role === "THEATRE_ADMIN") {
        if (customTheatreId === "th-mum-001") {
          selectedUser = MOCK_USERS.THEATRE_ADMIN_MUMBAI;
        } else {
          selectedUser = {
            ...selectedUser,
            theatreId: customTheatreId,
            theatreName: customTheatreId === "th-ahd-001" ? "CineSphere Heritage Ahmedabad" : "Custom Cinema Circuit",
          };
        }
      }

      setUser(selectedUser);
      SessionService.setStoredUser(selectedUser, true);

      // Navigate to designated landing route
      const landing = ROLE_LANDING_ROUTES[selectedUser.role];
      router.push(landing);
    },
    [router]
  );

  const signOut = useCallback(() => {
    setUser(null);
    SessionService.clearSession();
    router.push("/");
  }, [router]);

  const hasRoleCheck = useCallback(
    (requiredRole: UserRole): boolean => {
      if (!user) return false;
      return isRoleAtLeast(user.role, requiredRole);
    },
    [user]
  );

  const hasPermissionCheck = useCallback(
    (permission: AppPermission): boolean => {
      if (!user) return false;
      return checkRolePermission(user.role, permission);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      role: user?.role || null,
      tenant,
      isAuthenticated: Boolean(user),
      isLoading,
      signInWithRole,
      signOut,
      hasRole: hasRoleCheck,
      hasPermission: hasPermissionCheck,
    }),
    [user, tenant, isLoading, signInWithRole, signOut, hasRoleCheck, hasPermissionCheck]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

