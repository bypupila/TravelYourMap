import { NextResponse } from "next/server";
import { z } from "zod";
import { getValidSessionUserFromRequest } from "@/lib/current-user";
import { hashPassword } from "@/lib/auth-password";
import { isValidUsername, normalizeUsername, toPublicMapPath } from "@/lib/auth-identifiers";
import { sql } from "@/lib/neon";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const payloadSchema = z.object({
  displayName: z.string().min(1),
  username: z.string().min(3),
  password: z.string().min(8).max(128).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const sessionUser = await getValidSessionUserFromRequest(request);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (sessionUser.role !== "creator") {
      return NextResponse.json({ error: "Este flujo solo está disponible durante el alta de creadores." }, { status: 403 });
    }
    const userId = sessionUser.id;

    const payload = payloadSchema.parse(await request.json());
    const displayName = payload.displayName.trim();
    const username = normalizeUsername(payload.username);

    if (!isValidUsername(username)) {
      return NextResponse.json({ error: "El usuario tiene un formato inválido." }, { status: 400 });
    }

    const existingRows = await sql<Array<{ id: string; email: string; username: string }>>`
      select id, email, username
      from public.users
      where username = ${username}
      limit 1
    `;
    const existing = existingRows[0] || null;
    if (existing && existing.id !== userId) {
      return NextResponse.json({ error: "Ese nombre de usuario ya está en uso." }, { status: 409 });
    }

    const nowIso = new Date().toISOString();
    const password = String(payload.password || "").trim();
    if (!password) {
      return NextResponse.json({ error: "La contraseña es obligatoria para completar el perfil." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
    }
    const passwordHash = hashPassword(password);
    const completionRows = await sql<Array<{ user_id: string }>>`
      with eligible_user as (
        select u.id
        from public.users u
        join public.onboarding_state os on os.user_id = u.id
        where u.id = ${userId}
          and u.role = 'creator'
          and coalesce(os.is_complete, false) = false
        for update of u, os
      ),
      inserted_credential as (
        insert into public.user_credentials (user_id, password_hash, updated_at)
        select id, ${passwordHash}, ${nowIso}
        from eligible_user
        on conflict (user_id) do update set
          password_hash = excluded.password_hash,
          updated_at = excluded.updated_at
        returning user_id
      ),
      updated_user as (
        update public.users
        set
          username = ${username},
          display_name = ${displayName},
          updated_at = ${nowIso}
        where id = ${userId}
          and exists (select 1 from inserted_credential)
        returning id
      ),
      updated_onboarding as (
        update public.onboarding_state
        set
          current_step = 'world',
          completed_steps = array['welcome', 'youtube', 'profile']::text[],
          is_complete = true,
          last_seen_at = ${nowIso},
          updated_at = ${nowIso}
        where user_id = ${userId}
          and exists (select 1 from inserted_credential)
        returning user_id
      )
      select user_id::text as user_id
      from inserted_credential
    `;
    if (!completionRows[0]?.user_id) {
      return NextResponse.json(
        { error: "El perfil ya fue completado. Inicia sesión nuevamente para cambiar credenciales." },
        { status: 409 }
      );
    }

    const channelRows = await sql<Array<{ id: string }>>`
      select id
      from public.channels
      where user_id = ${userId}
      limit 1
    `;
    const channelId = channelRows[0]?.id || null;

    return NextResponse.json({
      ok: true,
      user_id: userId,
      username,
      display_name: displayName,
      public_map_path: toPublicMapPath(username),
      channel_id: channelId,
    });
  } catch (error) {
    console.error("[api/auth/profile]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos de perfil inválidos.", details: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "No se pudo completar el perfil." },
      { status: 500 }
    );
  }
}
