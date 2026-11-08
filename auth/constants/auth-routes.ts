/**
 * CineSphere OS - Authentication & Protected Route Constants
 * Standardized URL paths for authentication, role redirects, and middleware guards.
 */

export const AUTH_ROUTES = {
  SIGN_IN: "/login",
  SIGN_UP: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
  VERIFY_PHONE: "/verify-phone",
  SESSION_EXPIRED: "/session-expired",
  UNAUTHORIZED: "/unauthorized",
  FORBIDDEN: "/forbidden",
  DEFAULT_PUBLIC_REDIRECT: "/",
} as const;

export const ROLE_LANDING_ROUTES = {
  SUPER_ADMIN: "/dashboard",
  THEATRE_ADMIN: "/theatre/dashboard",
  HALL_MANAGER: "/theatre/halls",
  STAFF: "/staff",
  CUSTOMER: "/profile",
} as const;

export const PROTECTED_ROUTE_PREFIXES = {
  SUPER_ADMIN: ["/dashboard"],
  THEATRE_ADMIN: ["/theatre"],
  HALL_MANAGER: ["/hall", "/theatre/halls"],
  STAFF: ["/staff"],
  CUSTOMER: ["/profile"],
} as const;

export const PUBLIC_ROUTES = [
  "/",
  "/movies",
  "/movies/(.*)",
  "/movie/(.*)",
  "/theatres",
  "/theatres/(.*)",
  "/theatre/(.*)",
  "/booking",
  "/booking/(.*)",
  "/about",
  "/contact",
  "/support",
  "/faq",
  "/events",
  "/offers",
  "/terms-and-conditions",
  "/privacy-policy",
  "/cookies-policy",
  "/design-system",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/verify-phone",
  "/unauthorized",
  "/forbidden",
  "/server-error",
  "/session-expired",
  "/maintenance",
];

