import { NextResponse } from "next/server";
import { hasInternalRequestAccess } from "@/lib/internal-request-auth";
import { getTrustedAppOrigin } from "@/lib/map-urls";
import { runDueSponsorReportSchedules } from "@/lib/sponsor-reports";
import { invalidateExpiredYouTubeStatistics } from "@/lib/youtube-data-governance";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  return hasInternalRequestAccess({
    request,
    configuredTokens: [
      process.env.YOUTUBE_DATA_GOVERNANCE_TOKEN,
      process.env.YOUTUBE_IMPORT_WORKER_TOKEN,
      process.env.CRON_SECRET,
    ],
    tokenHeaderNames: ["x-import-worker-token", "x-cron-token"],
  });
}

async function handle(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await invalidateExpiredYouTubeStatistics();
    let sponsorReportSchedules: Awaited<ReturnType<typeof runDueSponsorReportSchedules>> | { processed: number; results: unknown[]; error: string } = {
      processed: 0,
      results: [],
    };
    try {
      sponsorReportSchedules = await runDueSponsorReportSchedules({
        origin: getTrustedAppOrigin(),
        limit: 20,
      });
    } catch (error) {
      sponsorReportSchedules = {
        processed: 0,
        results: [],
        error: error instanceof Error ? error.message : "Could not run sponsor report schedules",
      };
    }
    return NextResponse.json({
      ok: true,
      ...result,
      sponsor_report_schedules: sponsorReportSchedules,
    });
  } catch (error) {
    console.error("[api/youtube/data-expiry/sweep]", error);
    return NextResponse.json(
      { error: "Could not sweep expired YouTube data" },
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
