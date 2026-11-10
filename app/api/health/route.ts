import { NextResponse } from "next/server";
import { getSystemHealthReport } from "@/lib/observability/health-monitor";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await getSystemHealthReport();
  const statusCode = report.status === "DOWN" ? 503 : 200;

  return NextResponse.json(report, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

