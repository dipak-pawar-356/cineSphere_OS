/**
 * CineSphere OS — Centralized Route Constants
 * All URL patterns across public, customer, super-admin, theatre-admin, staff, and auth modules.
 * Strictly prevents hardcoded path strings inside layout or navigation components.
 */

export const ROUTES = {
  // Public Routes
  PUBLIC: {
    HOME: "/",
    MOVIES: "/movies",
    MOVIE_DETAIL: (slug: string) => `/movie/${slug}`,
    THEATRES: "/theatres",
    THEATRE_DETAIL: (slug: string) => `/theatre/${slug}`,
    OFFERS: "/offers",
    EVENTS: "/events",
    ABOUT: "/about",
    CONTACT: "/contact",
    SUPPORT: "/support",
    FAQ: "/faq",
    PRIVACY_POLICY: "/privacy-policy",
    TERMS_AND_CONDITIONS: "/terms-and-conditions",
    COOKIES_POLICY: "/cookies-policy",
    DESIGN_SYSTEM: "/design-system",
  },

  // Super Admin Routes (Multi-Tenant Platform HQ)
  SUPER_ADMIN: {
    ROOT: "/dashboard",
    OVERVIEW: "/dashboard/overview",
    THEATRES: "/dashboard/theatres",
    HALLS: "/dashboard/halls",
    MOVIES: "/dashboard/movies",
    SHOWS: "/dashboard/shows",
    BOOKINGS: "/dashboard/bookings",
    CUSTOMERS: "/dashboard/customers",
    ADMINS: "/dashboard/admins",
    STAFF: "/dashboard/staff",
    REVENUE: "/dashboard/revenue",
    ANALYTICS: "/dashboard/analytics",
    REPORTS: "/dashboard/reports",
    NOTIFICATIONS: "/dashboard/notifications",
    SETTINGS: "/dashboard/settings",
    PROFILE: "/dashboard/profile",
  },

  // Theatre Admin Routes (Specific Cinema Operator)
  THEATRE_ADMIN: {
    ROOT: "/theatre",
    DASHBOARD: "/theatre/dashboard",
    HALLS: "/theatre/halls",
    MOVIES: "/theatre/movies",
    SHOWS: "/theatre/shows",
    BOOKINGS: "/theatre/bookings",
    CUSTOMERS: "/theatre/customers",
    STAFF: "/theatre/staff",
    REPORTS: "/theatre/reports",
    SETTINGS: "/theatre/settings",
  },

  // Customer Routes (End-User Experience)
  CUSTOMER: {
    ROOT: "/profile",
    BOOKINGS: "/profile/bookings",
    TICKETS: "/profile/tickets",
    WISHLIST: "/profile/wishlist",
    SETTINGS: "/profile/settings",
    NOTIFICATIONS: "/profile/notifications",
    SUPPORT: "/profile/support",
  },

  // Staff Routes (Box Office, Scanners, Concessions)
  STAFF: {
    ROOT: "/staff",
    DASHBOARD: "/staff/dashboard",
    TICKETS: "/staff/tickets",
    CONCESSIONS: "/staff/concessions",
    SCHEDULE: "/staff/schedule",
  },

  // Authentication Routes
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    VERIFY_EMAIL: "/verify-email",
    VERIFY_PHONE: "/verify-phone",
  },

  // Shared System Status Routes
  SYSTEM: {
    UNAUTHORIZED: "/unauthorized",
    FORBIDDEN: "/forbidden",
    MAINTENANCE: "/maintenance",
    SERVER_ERROR: "/500",
  },
} as const;

export type AppRoutes = typeof ROUTES;

