import { NextResponse } from "next/server";
import { z } from "zod";
import { recordCreatorActivity, requireCreatorChannelAccess } from "@/lib/creator-admin-actions";
import { getValidSessionUserFromRequest } from "@/lib/current-user";
import { isDemoChannelId } from "@/lib/demo-data";
import { buildAbsoluteMediaKitUrl, loadCreatorMediaKit, saveMediaKitSettings } from "@/lib/media-kit";
import { reportOperationalError } from "@/lib/observability";

export const dynamic = "force-dynamic";

const mediaKitSchema = z.object({
  channelId: z.string().uuid(),
  public_enabled: z.boolean(),
  headline: z.string().trim().max(140).optional().nullable(),
  bio: z.string().trim().max(900).optional().nullable(),
  audience_note: z.string().trim().max(500).optional().nullable(),
  partnership_email: z.string().trim().email().max(180).optional().or(z.literal("")).nullable(),
  rate_card_url: z.string().trim().max(280).optional().or(z.literal("")).nullable(),
  preferred_cta_label: z.string().trim().max(80).optional().nullable(),
  featured_country_codes: z.array(z.string().trim().length(2)).max(12).default([]),
});

function requestOrigin(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function GET(request: Request) {
  try {
    const sessionUser = await getValidSessionUserFromRequest(request);
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const channelId = url.searchParams.get("channelId") || "";
    if (!z.string().uuid().safeParse(channelId).success) {
      return NextResponse.json({ error: "channelId is required" }, { status: 400 });
    }

    const access = await requireCreatorChannelAccess(channelId, sessionUser.id);
    if (!access) return NextResponse.json({ error: "Channel not found for this user" }, { status: 404 });

    const mediaKit = await loadCreatorMediaKit(channelId);
    if (!mediaKit) return NextResponse.json({ error: "Channel not found" }, { status: 404 });

    return NextResponse.json({
      mediaKit: {
        ...mediaKit,
        urls: {
          ...mediaKit.urls,
          absoluteMediaKitUrl: buildAbsoluteMediaKitUrl(requestOrigin(request), mediaKit.urls.mediaKitUrl),
        },
      },
    });
  } catch (error) {
    reportOperationalError(error, { area: "sponsors", operation: "load_media_kit" });
    return NextResponse.json({ error: "Could not load media kit" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const sessionUser = await getValidSessionUserFromRequest(request);
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const requestBody = await request.json().catch(() => null);
    const parsedPayload = mediaKitSchema.safeParse(requestBody);
    if (!parsedPayload.success) {
      return NextResponse.json(
        {
          error: mediaKitValidationMessage(parsedPayload.error),
          details: parsedPayload.error.issues,
        },
        { status: 400 },
      );
    }
    const payload = parsedPayload.data;
    if (isDemoChannelId(payload.channelId)) {
      return NextResponse.json({ error: "Modo demo: esta operación no persiste cambios." }, { status: 400 });
    }
    if (payload.rate_card_url && !isValidUrl(payload.rate_card_url)) {
      return NextResponse.json({ error: "La URL del rate card no es valida." }, { status: 400 });
    }

    const access = await requireCreatorChannelAccess(payload.channelId, sessionUser.id);
    if (!access) return NextResponse.json({ error: "Channel not found for this user" }, { status: 404 });

    await saveMediaKitSettings(payload);
    const mediaKit = await loadCreatorMediaKit(payload.channelId);

    await recordCreatorActivity({
      channelId: payload.channelId,
      actorUserId: sessionUser.id,
      eventType: "media_kit_updated",
      entityType: "sponsor",
      entityId: null,
      description: `${sessionUser.username} actualizo el media kit`,
      metadata: { public_enabled: payload.public_enabled },
    });

    return NextResponse.json({
      ok: true,
      mediaKit: mediaKit
        ? {
            ...mediaKit,
            urls: {
              ...mediaKit.urls,
              absoluteMediaKitUrl: buildAbsoluteMediaKitUrl(requestOrigin(request), mediaKit.urls.mediaKitUrl),
            },
          }
        : null,
    });
  } catch (error) {
    reportOperationalError(error, { area: "sponsors", operation: "save_media_kit" });
    return NextResponse.json({ error: "Could not save media kit" }, { status: 500 });
  }
}

function mediaKitValidationMessage(error: z.ZodError) {
  const firstIssue = error.issues[0];
  const field = firstIssue?.path[0];
  if (field === "bio") return "La presentación no puede superar los 900 caracteres.";
  if (field === "headline") return "El título no puede superar los 140 caracteres.";
  if (field === "audience_note") return "La nota de audiencia no puede superar los 500 caracteres.";
  if (field === "partnership_email") return "Ingresa un email de contacto válido.";
  if (field === "featured_country_codes") return "Selecciona como máximo 12 países válidos.";
  return "Revisa los datos del media kit e inténtalo nuevamente.";
}

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
