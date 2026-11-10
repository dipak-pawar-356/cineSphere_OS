import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sanitizeObject } from "@/lib/security/input-sanitizer";
import { recordSecurityEvent } from "@/lib/security/security-events";
import { checkRateLimit } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

/**
 * CSP Violation Reporting Endpoint (Future CSP Reporting Architecture)
 */
export async function POST(request: NextRequest) {
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const rate = checkRateLimit(clientIp, "PUBLIC_DEFAULT");

  if (!rate.allowed) {
    return NextResponse.json({ received: false }, { status: 429 });
  }

  try {
    const rawBody = await request.json();
    const sanitizedReport = sanitizeObject(rawBody) as Record<string, unknown>;

    recordSecurityEvent({
      eventType: "SUSPICIOUS_PAYLOAD",
      severity: "MEDIUM",
      ipAddress: clientIp,
      userAgent: request.headers.get("user-agent") || "Browser-CSP-Agent",
      requestPath: "/api/security/csp-report",
      details: "Content-Security-Policy violation telemetry report received",
      metadata: { report: sanitizedReport },
    });

    return NextResponse.json({ received: true }, { status: 204 });
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }
}

