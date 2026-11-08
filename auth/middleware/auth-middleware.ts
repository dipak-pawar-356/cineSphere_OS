import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isProtectedRoute, canRoleAccessPath } from "../guards/route-guards";
import { UserRole } from "../types/role.types";
import { SECURITY_CONFIG } from "../constants/security.constants";
import { resolveTenantFromHostname } from "@/lib/security/tenant";

export function handleAuthMiddleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // 1. Resolve Tenant Context
  const hostTenant = resolveTenantFromHostname(hostname);
  const cookieTenant = request.cookies.get(SECURITY_CONFIG.SESSION.TENANT_COOKIE_NAME)?.value;
  const activeTenantId = cookieTenant || hostTenant || "th-pun-001";

  // 2. Resolve User Session & Role
  const roleCookie = request.cookies.get(SECURITY_CONFIG.SESSION.COOKIE_NAME)?.value as UserRole | undefined;
  const clerkSession = request.cookies.get("__session")?.value;
  const authHeader = request.headers.get("authorization");

  // Determine active authenticated role
  const isAuthenticated = Boolean(roleCookie || clerkSession || authHeader);
  const userRole: UserRole = roleCookie || (clerkSession ? "CUSTOMER" : "CUSTOMER");

  // 3. Prepare Downstream Request Headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(SECURITY_CONFIG.HEADERS.TENANT_ID, activeTenantId);
  if (isAuthenticated && roleCookie) {
    requestHeaders.set(SECURITY_CONFIG.HEADERS.USER_ROLE, roleCookie);
  }

  // 4. Evaluate Route Access
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

  // 5. Proceed with attached security context headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Inject Enterprise Hardened Security Headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

