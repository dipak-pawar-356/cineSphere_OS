import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveTenantFromHostname } from "@/lib/security/tenant";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const tenantId = resolveTenantFromHostname(hostname);

  // Clone the request headers and attach the resolved tenant ID
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-id", tenantId);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public files (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|logos/|images/).*)",
  ],
};
