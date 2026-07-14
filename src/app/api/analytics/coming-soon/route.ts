import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getValidSessionUserIdFromRequest } from "@/lib/current-user";
import {
  COMING_SOON_FEATURES,
  COMING_SOON_SURFACES,
  isComingSoonFeatureId,
  isComingSoonSurfaceId,
} from "@/lib/coming-soon";
import { tableExists } from "@/lib/db-schema";
import { sql } from "@/lib/neon";
import { enforceRequestRateLimit } from "@/lib/request-rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const payloadSchema = z.object({
  featureId: z.string().trim().min(1).max(80),
  surfaceId: z.string().trim().min(1).max(80),
  anonymousVisitorId: z.string().uuid(),
  path: z.string().trim().max(240).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const rateLimit = await enforceRequestRateLimit({
      request,
      scope: "api:coming-soon",
      windowMinutes: 1,
      maxAttempts: 60,
    });
    if (!rateLimit.allowed) return NextResponse.json({ ok: true, skipped: "rate_limited" });

    const payload = payloadSchema.parse(await request.json());
    if (!isComingSoonFeatureId(payload.featureId) || !isComingSoonSurfaceId(payload.surfaceId)) {
      return NextResponse.json({ error: "Unknown coming-soon interaction" }, { status: 400 });
    }

    if (!(await tableExists("public", "coming_soon_interactions"))) {
      return NextResponse.json({ ok: true, skipped: "migration_pending" });
    }

    const userId = await getValidSessionUserIdFromRequest(request);
    const anonymousVisitorHash = userId
      ? null
      : createHash("sha256").update(payload.anonymousVisitorId).digest("hex");

    await sql`
      insert into public.coming_soon_interactions (
        feature_id,
        feature_label,
        surface_id,
        surface_label,
        path,
        user_id,
        anonymous_visitor_hash
      ) values (
        ${payload.featureId},
        ${COMING_SOON_FEATURES[payload.featureId]},
        ${payload.surfaceId},
        ${COMING_SOON_SURFACES[payload.surfaceId]},
        ${payload.path || null},
        ${userId},
        ${anonymousVisitorHash}
      )
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid interaction payload", details: error.issues }, { status: 400 });
    }
    console.error("[api/analytics/coming-soon POST]", error);
    return NextResponse.json({ error: "Could not record interaction" }, { status: 500 });
  }
}
