import { NextResponse } from "next/server";
import { hasInternalRequestAccess } from "@/lib/internal-request-auth";
import { closeExpiredMapPolls } from "@/lib/map-polls";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  return hasInternalRequestAccess({
    request,
    configuredTokens: [process.env.MAP_POLLS_CRON_TOKEN, process.env.CRON_SECRET],
    tokenHeaderNames: ["x-cron-token"],
  });
}

async function handle(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const closedPolls = await closeExpiredMapPolls();
  console.info("[api/map/polls/close-expired]", {
    closedCount: closedPolls.length,
    pollIds: closedPolls.map((poll) => poll.id),
  });
  return NextResponse.json({ ok: true, closed_count: closedPolls.length, poll_ids: closedPolls.map((poll) => poll.id) });
}

export async function GET(request: Request) {
  // Vercel Cron invokes GET and sends Authorization: Bearer <CRON_SECRET>.
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
