import { NextResponse } from "next/server";
import { z } from "zod";
import { enforceRequestRateLimit } from "@/lib/request-rate-limit";
import { verifyBrandPortalAccessCode } from "@/lib/sponsor-crm";

export const dynamic = "force-dynamic";

const accessSchema = z.object({
  email: z.string().trim().email().max(180),
  code: z.string().trim().regex(/^\d{6}$/),
});

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const rateLimit = await enforceRequestRateLimit({
      request,
      scope: "api:brand-portal-access",
      windowMinutes: 15,
      maxAttempts: 5,
      failClosed: process.env.NODE_ENV === "production",
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos. Reintenta más tarde." },
        {
          status: 429,
          headers: rateLimit.retryAfterSeconds ? { "Retry-After": String(rateLimit.retryAfterSeconds) } : undefined,
        }
      );
    }

    const { token } = await context.params;
    const payload = accessSchema.parse(await request.json());
    const access = await verifyBrandPortalAccessCode({
      token: String(token || "").trim(),
      email: payload.email,
      code: payload.code,
    });
    if (!access) return NextResponse.json({ error: "Email o codigo invalido." }, { status: 401 });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(access.cookieName, access.cookieValue, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: `/brand-portal/${encodeURIComponent(token)}`,
      maxAge: access.maxAgeSeconds,
    });
    return response;
  } catch (error) {
    console.error("[api/brand-portal/[token]/access POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos de acceso invalidos.", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "No se pudo validar el acceso." }, { status: 400 });
  }
}
