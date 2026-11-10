import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createDoubleSubmitTokenPair } from "@/lib/security/csrf-protection";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { buildCacheControlHeader } from "@/lib/performance/cache-strategy";

export const dynamic = "force-dynamic";

/**
 * CSRF Double-Submit Token Minting Endpoint
 * Issues a cryptographically strong token bound via SameSite cookie and header metadata.
 */
export async function GET(request: NextRequest) {
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const rate = checkRateLimit(clientIp, "PUBLIC_DEFAULT");

  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    );
  }

  const pair = createDoubleSubmitTokenPair(false);

  const response = NextResponse.json(
    {
      success: true,
      token: pair.token,
      headerName: pair.headerName,
      cookieName: pair.cookieName,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": buildCacheControlHeader("NO_STORE"),
      },
    }
  );

  response.cookies.set(pair.cookieName, pair.token, pair.cookieOptions);
  return response;
}

