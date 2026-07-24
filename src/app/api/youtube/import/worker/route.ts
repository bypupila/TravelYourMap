import { NextResponse } from "next/server";
import { z } from "zod";
import { getValidSessionUserFromRequest } from "@/lib/current-user";
import { hasInternalRequestAccess } from "@/lib/internal-request-auth";
import { invalidateExpiredYouTubeStatistics } from "@/lib/youtube-data-governance";
import { processNextQueuedYoutubeImportRun, processYoutubeImportRunById } from "@/lib/youtube-import";

export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  runId: z.string().uuid().optional(),
});

function hasInternalWorkerAccess(request: Request) {
  return hasInternalRequestAccess({
    request,
    configuredTokens: [process.env.YOUTUBE_IMPORT_WORKER_TOKEN, process.env.CRON_SECRET],
    tokenHeaderNames: ["x-import-worker-token"],
  });
}

async function handle(request: Request) {
  try {
    const sessionUser = await getValidSessionUserFromRequest(request);
    const internalAccess = hasInternalWorkerAccess(request);
    if (!sessionUser && !internalAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (sessionUser && sessionUser.role !== "creator" && sessionUser.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const payload = payloadSchema.parse(body);

    const result = payload.runId
      ? await processYoutubeImportRunById({
          runId: payload.runId,
          requestedByUserId: sessionUser?.id || null,
        })
      : await processNextQueuedYoutubeImportRun({
          requestedByUserId: sessionUser?.id || null,
        });

    const governanceSweep = await invalidateExpiredYouTubeStatistics();

    return NextResponse.json({
      ...result,
      governanceSweep,
    });
  } catch (error) {
    console.error("[api/youtube/import/worker]", error);
    return NextResponse.json(
      { error: "Could not process queued import run" },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  return handle(request);
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405, headers: { Allow: "POST" } });
}
