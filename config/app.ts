export const APP_CONFIG = {
  version: "1.0.0-foundation",
  apiPrefix: "/api/v1",
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  tenant: {
    headerKey: "x-tenant-id",
    cookieKey: "cinesphere_tenant",
    defaultTenantId: "enterprise-hq",
  },
  auth: {
    sessionCookie: "cinesphere_session",
    tokenExpirySeconds: 60 * 60 * 24, // 24 hours
  },
  roles: {
    SUPER_ADMIN: "SUPER_ADMIN",
    THEATRE_ADMIN: "THEATRE_ADMIN",
    HALL_MANAGER: "HALL_MANAGER",
    STAFF: "STAFF",
    CUSTOMER: "CUSTOMER",
  } as const,
  theme: {
    defaultMode: "dark",
    colors: {
      primary: "#FBBF24",
      background: "#070B12",
      surface: "#111827",
      card: "#161F2E",
      border: "#2A3445",
      primaryText: "#F9FAFB",
      secondaryText: "#9CA3AF",
      success: "#22C55E",
      warning: "#F59E0B",
      danger: "#EF4444",
      info: "#2563EB",
    },
  },
} as const;

export type UserRole = (typeof APP_CONFIG.roles)[keyof typeof APP_CONFIG.roles];

