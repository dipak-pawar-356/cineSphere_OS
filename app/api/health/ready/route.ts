import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/observability/health-monitor";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbHealth = await checkDatabaseHealth();
  const isReady = dbHealth.status !== "DOWN";

  return NextResponse.json(
    {
      status: isReady ? "ready" : "not_ready",
      database: dbHealth.status,
      timestamp: new Date().toISOString(),
    },
    {
      status: isReady ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}

