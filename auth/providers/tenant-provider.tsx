"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "./auth-provider";
import { TenantContext } from "../types/session.types";
import { validateTenantAccess, TenantAccessEvaluation } from "../guards/tenant-guard";

export interface TenantContextValue {
  tenant: TenantContext;
  theatreId: string | null;
  theatreName: string | null;
  isIsolated: boolean;
  isPlatformWide: boolean;
  assertTenantAccess: (targetTheatreId: string) => TenantAccessEvaluation;
}

const TenantContextReact = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user, tenant } = useAuth();

  const value = useMemo(() => {
    return {
      tenant,
      theatreId: tenant.theatreId,
      theatreName: tenant.theatreName,
      isIsolated: tenant.isIsolated,
      isPlatformWide: tenant.isPlatformWide,
      assertTenantAccess: (targetTheatreId: string) => {
        return validateTenantAccess(user, targetTheatreId);
      },
    };
  }, [user, tenant]);

  return <TenantContextReact.Provider value={value}>{children}</TenantContextReact.Provider>;
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContextReact);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}

