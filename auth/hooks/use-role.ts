"use client";

import { useAuth } from "../providers/auth-provider";
import { UserRole } from "../types/role.types";
import { isRoleAtLeast } from "../roles/role-hierarchy";

export function useRole() {
  const { role, user, isAuthenticated } = useAuth();

  return {
    role,
    user,
    isAuthenticated,
    isSuperAdmin: role === "SUPER_ADMIN",
    isTheatreAdmin: role === "THEATRE_ADMIN",
    isHallManager: role === "HALL_MANAGER",
    isStaff: role === "STAFF",
    isCustomer: role === "CUSTOMER",
    hasRole: (required: UserRole) => (role ? isRoleAtLeast(role, required) : false),
  };
}

