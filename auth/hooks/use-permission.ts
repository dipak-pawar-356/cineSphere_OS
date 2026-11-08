"use client";

import { useAuth } from "../providers/auth-provider";
import { AppPermission } from "../types/permission.types";

export function usePermission() {
  const { user, hasPermission } = useAuth();

  return {
    permissions: user?.permissions || [],
    hasPermission,
    can: hasPermission,
  };
}

