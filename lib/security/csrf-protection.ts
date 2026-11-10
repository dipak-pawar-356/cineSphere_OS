/**
 * ==============================================================================
 * CineSphere OS — CSRF Protection & Request Integrity (Phase 2 – Part 16)
 * ==============================================================================
 * Protection against Cross-Site Request Forgery via Double-Submit tokens,
 * cryptographically strong tokens, and Origin / Referer validation.
 * Compatible with Edge Runtime and Server Environments.
 * ==============================================================================
 */

export const CSRF_CONFIG = {
  COOKIE_NAME: "cs_csrf_token",
  HEADER_NAME: "x-csrf-token",
  TOKEN_LENGTH_BYTES: 32,
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  },
};

/**
 * Generates a high-entropy cryptographic CSRF token using Web Crypto API.
 */
export function generateCsrfToken(): string {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const randomBytes = new Uint8Array(CSRF_CONFIG.TOKEN_LENGTH_BYTES);
    crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback for minimal environments
  return `csrf-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Constant-time string comparison preventing timing attacks.
 * Pure JavaScript implementation compatible with Next.js Edge Runtime.
 */
export function verifyCsrfToken(submittedToken?: string, expectedToken?: string): boolean {
  if (!submittedToken || !expectedToken) {
    return false;
  }

  if (submittedToken.length !== expectedToken.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < submittedToken.length; i++) {
    mismatch |= submittedToken.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }

  return mismatch === 0;
}

/**
 * Validates request Origin and Referer headers against the host header
 * or an explicit list of allowed origins.
 */
export function verifyRequestOrigin(
  origin?: string | null,
  referer?: string | null,
  host?: string | null,
  allowedOrigins: string[] = []
): boolean {
  if (!host) return false;

  const validOrigins = new Set([
    `http://${host}`,
    `https://${host}`,
    ...allowedOrigins,
  ]);

  if (origin) {
    return validOrigins.has(origin);
  }

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      return validOrigins.has(refererUrl.origin);
    } catch {
      return false;
    }
  }

  return true;
}

/**
 * Double-Submit Token Architecture (Stateless CSRF Protection).
 * Returns identical cookie and request header tokens to bind client session requests.
 */
export interface DoubleSubmitTokenPair {
  cookieName: string;
  headerName: string;
  token: string;
  cookieOptions: typeof CSRF_CONFIG.COOKIE_OPTIONS;
}

export function createDoubleSubmitTokenPair(): DoubleSubmitTokenPair {
  return {
    cookieName: CSRF_CONFIG.COOKIE_NAME,
    headerName: CSRF_CONFIG.HEADER_NAME,
    token: generateCsrfToken(),
    cookieOptions: CSRF_CONFIG.COOKIE_OPTIONS,
  };
}

export function verifyDoubleSubmitRequest(
  cookieToken?: string | null,
  headerToken?: string | null
): boolean {
  if (!cookieToken || !headerToken) return false;
  return verifyCsrfToken(headerToken, cookieToken);
}

