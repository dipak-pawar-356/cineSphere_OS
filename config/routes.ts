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
    BOOKING: (showId: string) => `/booking/${showId}`,
    DIGITAL_TICKET: (secureId: string) => `/tickets/${secureId}`,
  },

  // Super Admin Routes (Multi-Tenant Platform HQ)
  SUPER_ADMIN: {
    ROOT: "/dashboard",
    OVERVIEW: "/dashboard/overview",
    PLATFORM: "/dashboard/platform",
    THEATRES: "/dashboard/theatres",
    THEATRE_DETAIL: (id: string) => `/dashboard/theatres/${id}`,
    SUBSCRIPTIONS: "/dashboard/subscriptions",
    PAYMENTS: "/dashboard/payments",
    BOOKINGS: "/dashboard/bookings",
    USERS: "/dashboard/users",
    REPORTS: "/dashboard/reports",
    SETTINGS: "/dashboard/settings",
    CITIES: "/dashboard/cities",
    AMENITIES: "/dashboard/amenities",
    ANNOUNCEMENTS: "/dashboard/announcements",
    SUPPORT: "/dashboard/support",
    AUDIT: "/dashboard/audit",
    MEDIA: "/dashboard/media",
    HALLS: "/dashboard/halls",
    MOVIES: "/dashboard/movies",
    SHOWS: "/dashboard/shows",
    CUSTOMERS: "/dashboard/customers",
    ADMINS: "/dashboard/admins",
    STAFF: "/dashboard/staff",
    EVENTS: "/dashboard/events",
    OFFERS: "/dashboard/offers",
    LOCATIONS: "/dashboard/locations",
    REVENUE: "/dashboard/revenue",
    ANALYTICS: "/dashboard/analytics",
    NOTIFICATIONS: "/dashboard/notifications",
    AUDIT_LOGS: "/dashboard/audit-logs",
    SUPPORT_TICKETS: "/dashboard/support-tickets",
    MEDIA_LIBRARY: "/dashboard/media-library",
    PROFILE: "/dashboard/profile",
  },

  // Theatre Admin Routes (Specific Cinema Operator)
  THEATRE_ADMIN: {
    ROOT: "/theatre",
    DASHBOARD: "/theatre/dashboard",
    PROFILE: "/theatre/profile",
    INFORMATION: "/theatre/information",
    GALLERY: "/theatre/gallery",
    AMENITIES: "/theatre/amenities",
    CONTACTS: "/theatre/contacts",
    HALLS: "/theatre/halls",
    HALL_DESIGNER: "/theatre/halls/designer",
    MOVIES: "/theatre/movies",
    SHOWS: "/theatre/shows",
    SHOW_CALENDAR: "/theatre/shows/calendar",
    PRICING: "/theatre/pricing",
    BOOKINGS: "/theatre/bookings",
    BOOKINGS_TODAY: "/theatre/bookings/today",
    BOOKINGS_UPCOMING: "/theatre/bookings/upcoming",
    CUSTOMERS: "/theatre/customers",
    STAFF: "/theatre/staff",
    STAFF_MANAGERS: "/theatre/staff/managers",
    REVENUE: "/theatre/revenue",
    PAYMENTS: "/theatre/payments",
    TRANSACTIONS: "/theatre/transactions",
    OFFERS: "/theatre/offers",
    EVENTS: "/theatre/events",
    ANALYTICS: "/theatre/analytics",
    REPORTS: "/theatre/reports",
    NOTIFICATIONS: "/theatre/notifications",
    SUPPORT: "/theatre/support",
    SETTINGS: "/theatre/settings",
    MEDIA: "/theatre/media",
    UPI: "/theatre/upi",
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
    SERVER_ERROR: "/server-error",
    SESSION_EXPIRED: "/session-expired",
  },
} as const;

export type AppRoutes = typeof ROUTES;

