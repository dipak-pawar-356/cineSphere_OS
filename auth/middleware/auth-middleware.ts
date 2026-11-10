import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isProtectedRoute, canRoleAccessPath } from "../guards/route-guards";
import { UserRole } from "../types/role.types";
import { SECURITY_CONFIG } from "../constants/security.constants";
import { resolveTenantFromHostname } from "@/lib/security/tenant";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { verifyRequestOrigin } from "@/lib/security/csrf-protection";

export function handleAuthMiddleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const method = request.method;

  // 1. Generate & Inject Request Tracing Headers
  const existingCorrelationId = request.headers.get("x-correlation-id");
  const correlationId = existingCorrelationId || `corr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const requestId = request.headers.get("x-request-id") || `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  // 2. Edge CSRF & Origin Validation for State-Changing Requests
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const isOriginValid = verifyRequestOrigin(origin, referer, hostname);

    if (!isOriginValid) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: {
            code: "CSRF_ORIGIN_MISMATCH",
            message: "Cross-site request forgery protection: Origin rejected",
            correlationId,
          },
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", "x-correlation-id": correlationId },
        }
      );
    }
  }

  // 3. Edge Rate Limiting for Sensitive Auth Endpoints
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  if (pathname.startsWith("/login") && method === "POST") {
    const rateCheck = checkRateLimit(clientIp, "LOGIN");
    if (!rateCheck.allowed) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Too many login attempts. Retry in ${rateCheck.retryAfterSec} seconds.`,
            correlationId,
          },
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(rateCheck.retryAfterSec),
            "x-correlation-id": correlationId,
          },
        }
      );
    }
  }

  // 4. Resolve Tenant Context
  const hostTenant = resolveTenantFromHostname(hostname);
  const cookieTenant = request.cookies.get(SECURITY_CONFIG.SESSION.TENANT_COOKIE_NAME)?.value;
  const activeTenantId = cookieTenant || hostTenant || "th-pun-001";

  // 5. Resolve User Session & Role
  const roleCookie = request.cookies.get(SECURITY_CONFIG.SESSION.COOKIE_NAME)?.value as UserRole | undefined;
  const clerkSession = request.cookies.get("__session")?.value;
  const authHeader = request.headers.get("authorization");

  // Determine active authenticated role
  const isAuthenticated = Boolean(roleCookie || clerkSession || authHeader);
  const userRole: UserRole = roleCookie || (clerkSession ? "CUSTOMER" : "CUSTOMER");

  // 6. Prepare Downstream Request Headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(SECURITY_CONFIG.HEADERS.TENANT_ID, activeTenantId);
  requestHeaders.set("x-correlation-id", correlationId);
  requestHeaders.set("x-request-id", requestId);
  if (isAuthenticated && roleCookie) {
    requestHeaders.set(SECURITY_CONFIG.HEADERS.USER_ROLE, roleCookie);
  }

  // 7. Evaluate Route Access
  if (isProtectedRoute(pathname)) {
    // Unauthenticated user attempting to access protected route -> redirect to Login
    if (!isAuthenticated || !roleCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based authorization evaluation
    const canAccess = canRoleAccessPath(userRole, pathname);
    if (!canAccess) {
      const forbiddenUrl = new URL("/forbidden", request.url);
      forbiddenUrl.searchParams.set("attemptedPath", pathname);
      forbiddenUrl.searchParams.set("userRole", userRole);
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  // 8. Proceed with attached security context headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Inject Enterprise Hardened Security Headers & Telemetry
  response.headers.set("x-correlation-id", correlationId);
  response.headers.set("x-request-id", requestId);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), browsing-topics=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  return response;
}
