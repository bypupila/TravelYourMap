import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { normalizeEmail, normalizeUsername } from "@/lib/auth-identifiers";
import { verifyPassword } from "@/lib/auth-password";
import { setSessionCookie } from "@/lib/auth-session";
import { normalizeAppUserRole } from "@/lib/current-user";
import {
  LoginRateLimitUnavailableError,
  releaseSuccessfulLoginReservation,
  reserveLoginAttempt,
} from "@/lib/login-rate-limit";
import { sql } from "@/lib/neon";
import { getPostHogClient } from "@/lib/posthog-server";

const payloadSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(1),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const DUMMY_PASSWORD_HASH =
  "00000000000000000000000000000000:69a91ee73211f6c44993e4b78adf1add6df8a4fcabf3ad90839df9101f2513bca5c5d8bf399d10c0c5087a6043c1f5f8df73402404bf12886a017af4152462b3";

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function readClientIp(request: Request) {
  const forwardedFor = String(request.headers.get("x-forwarded-for") || "")
    .split(",")[0]
    ?.trim();
  if (forwardedFor) return forwardedFor;
  return String(request.headers.get("x-real-ip") || "").trim();
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud de inicio de sesión inválida." }, { status: 400 });
  }
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Completa un usuario o email y una contraseña válidos.", details: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const payload = parsed.data;
    const identifier = String(payload.identifier || "").trim();
    const isEmail = identifier.includes("@");
    const normalizedIdentifier = isEmail ? normalizeEmail(identifier) : normalizeUsername(identifier);
    const identifierHash = hashValue(normalizedIdentifier);
    const ipValue = readClientIp(request);
    const ipHash = ipValue ? hashValue(ipValue) : null;

    const loginReservation = await reserveLoginAttempt(identifierHash, ipHash);
    if (loginReservation.limited) {
      return NextResponse.json(
        { error: "Demasiados intentos. Reintenta en unos minutos." },
        { status: 429 }
      );
    }

    const userRows = isEmail
      ? await sql<
          Array<{ id: string; email: string; username: string; display_name: string; role: string | null; password_hash: string | null }>
        >`
          select u.id, u.email, u.username, u.display_name, u.role::text as role, uc.password_hash
          from public.users u
          left join public.user_credentials uc on uc.user_id = u.id
          where u.email = ${normalizedIdentifier}
          limit 1
        `
      : await sql<
          Array<{ id: string; email: string; username: string; display_name: string; role: string | null; password_hash: string | null }>
        >`
          select u.id, u.email, u.username, u.display_name, u.role::text as role, uc.password_hash
          from public.users u
          left join public.user_credentials uc on uc.user_id = u.id
          where u.username = ${normalizedIdentifier}
          limit 1
        `;

    const user = userRows[0];
    const storedHash = user?.password_hash || DUMMY_PASSWORD_HASH;
    const passwordMatches = verifyPassword(payload.password, storedHash);
    if (!user || !user.password_hash || !passwordMatches) {
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
    }

    await releaseSuccessfulLoginReservation(loginReservation);
    const normalizedRole = normalizeAppUserRole(user.role);

    const posthog = getPostHogClient();
    posthog.identify({
      distinctId: user.id,
      properties: {
        email: user.email,
        username: user.username,
        display_name: user.display_name,
      },
    });
    posthog.capture({
      distinctId: user.id,
      event: "user_logged_in",
      properties: {
        username: user.username,
        identifier_type: isEmail ? "email" : "username",
      },
    });

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        role: normalizedRole,
      },
      creator_subscription_id: null,
    });
    setSessionCookie(response, user.id, request.headers.get("host"));
    return response;
  } catch (error) {
    console.error("[api/auth/login]", error);
    if (error instanceof LoginRateLimitUnavailableError) {
      return NextResponse.json(
        { error: "Inicio de sesión temporalmente no disponible." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "No se pudo iniciar sesión." },
      { status: 400 }
    );
  }
}
