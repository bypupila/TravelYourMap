import { NextResponse } from "next/server";
import { hasInternalRequestAccess } from "@/lib/internal-request-auth";
import { getTrustedAppOrigin } from "@/lib/map-urls";
import { runDueSponsorReportSchedules } from "@/lib/sponsor-reports";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  return hasInternalRequestAccess({
    request,
    configuredTokens: [process.env.SPONSOR_REPORTS_CRON_TOKEN, process.env.CRON_SECRET],
    tokenHeaderNames: ["x-cron-token"],
  });
}

async function handle(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const requestedLimit = Number(new URL(request.url).searchParams.get("limit") || 20);
    const limit = Number.isFinite(requestedLimit) ? Math.max(1, Math.min(50, Math.floor(requestedLimit))) : 20;
    const result = await runDueSponsorReportSchedules({
      origin: getTrustedAppOrigin(),
      limit,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[api/sponsors/reports/schedules/run]", error);
    return NextResponse.json(
      { error: "Could not run sponsor report schedules" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return handle(request);
}

export async function GET(request: Request) {
  return handle(request);
}
