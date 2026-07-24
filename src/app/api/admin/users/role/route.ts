import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeEmail, normalizeUsername } from "@/lib/auth-identifiers";
import { getSessionUserById, getValidSessionUserIdFromRequest, normalizeAppUserRole, userIsSuperAdmin } from "@/lib/current-user";
import { sql } from "@/lib/neon";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const payloadSchema = z.object({
  identifier: z.string().min(1),
  role: z.enum(["viewer", "creator", "superadmin"]),
});

async function findTargetUser(identifier: string) {
  const trimmed = identifier.trim();
  const rows = await sql<Array<{ id: string; email: string; username: string; display_name: string; role: string | null }>>`
    select id, email, username, display_name, role::text as role
    from public.users
    where id::text = ${trimmed}
       or lower(email) = ${normalizeEmail(trimmed)}
       or lower(username) = ${normalizeUsername(trimmed)}
    limit 1
  `;

  const row = rows[0] || null;
  if (!row) return null;

  return {
    ...row,
    role: normalizeAppUserRole(row.role),
  };
}

export async function POST(request: Request) {
  try {
    const sessionUserId = await getValidSessionUserIdFromRequest(request);
    if (!sessionUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionUser = await getSessionUserById(sessionUserId);
    if (!userIsSuperAdmin(sessionUser?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payload = payloadSchema.parse(await request.json());
    const targetUser = await findTargetUser(payload.identifier);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.id === sessionUserId && payload.role !== sessionUser.role) {
      return NextResponse.json({ error: "No puedes cambiar tu propio rol desde esta pantalla." }, { status: 400 });
    }

    if (targetUser.role === payload.role) {
      return NextResponse.json({
        ok: true,
        user: targetUser,
        previous_role: targetUser.role,
        changed: false,
      });
    }

    const rows = await sql<Array<{ id: string; email: string; username: string; display_name: string; role: string | null }>>`
      with updated_user as (
        update public.users
        set role = ${payload.role}, updated_at = now()
        where id = ${targetUser.id}
          and role::text = ${targetUser.role}
        returning id, email, username, display_name, role::text as role
      ),
      audit_insert as (
        insert into public.user_role_audit (
          target_user_id,
          target_user_email,
          target_user_username,
          target_display_name,
          previous_role,
          new_role,
          changed_by_user_id,
          changed_by_username,
          changed_by_display_name
        )
        select
          id,
          email,
          username,
          display_name,
          ${targetUser.role},
          role,
          ${sessionUser.id},
          ${sessionUser.username},
          ${sessionUser.display_name}
        from updated_user
        returning id
      ),
      revoked_session as (
        insert into public.user_session_revocations (user_id, revoked_after, reason, updated_at)
        select id, now(), 'role_changed', now()
        from updated_user
        on conflict (user_id)
        do update set
          revoked_after = excluded.revoked_after,
          reason = excluded.reason,
          updated_at = excluded.updated_at
        returning user_id
      )
      select id, email, username, display_name, role
      from updated_user
      where (select count(*) from audit_insert) = 1
        and (select count(*) from revoked_session) = 1
    `;

    const updatedUser = rows[0];
    if (!updatedUser) {
      return NextResponse.json(
        { error: "El rol cambió durante la operación. Recarga e intenta nuevamente." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: {
        ...updatedUser,
        role: normalizeAppUserRole(updatedUser.role),
      },
      previous_role: targetUser.role,
      changed: true,
    });
  } catch (error) {
    console.error("[api/admin/users/role]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Solicitud de rol inválida." }, { status: 400 });
    }
    return NextResponse.json(
      { error: "No se pudo actualizar el rol de forma segura." },
      { status: 500 }
    );
  }
}
