/**
 * CineSphere OS - Security & Session Configuration Constants
 * Enterprise hardened parameters for passwords, cookies, and rate limiting.
 */

export const SECURITY_CONFIG = {
  // Password Complexity Standards
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 64,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHAR: true,
    SPECIAL_CHARS_REGEX: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
  },

  // Session & Cookie Configuration
  SESSION: {
    COOKIE_NAME: "cinesphere_session",
    TENANT_COOKIE_NAME: "cinesphere_tenant",
    MAX_AGE_SECONDS: 60 * 60 * 24 * 7, // 7 days
    REMEMBER_ME_SECONDS: 60 * 60 * 24 * 30, // 30 days
    IDLE_TIMEOUT_SECONDS: 60 * 60 * 2, // 2 hours of inactivity
  },

  // HTTP Security Headers
  HEADERS: {
    TENANT_ID: "x-tenant-id",
    USER_ID: "x-user-id",
    USER_ROLE: "x-user-role",
    AUTH_STATUS: "x-auth-status",
  },

  // Verification Code Expiry
  OTP: {
    EXPIRATION_MINUTES: 10,
    CODE_LENGTH: 6,
    RESEND_COOLDOWN_SECONDS: 60,
  },
} as const;

