#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

const rootDir = process.cwd();

function loadDotEnvLocal() {
  const envPath = path.join(rootDir, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const idx = line.indexOf("=");
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { identifier: "", role: "", changedBy: "" };
  for (const arg of args) {
    if (arg.startsWith("--identifier=")) out.identifier = arg.slice("--identifier=".length).trim();
    if (arg.startsWith("--role=")) out.role = arg.slice("--role=".length).trim();
    if (arg.startsWith("--changed-by=")) out.changedBy = arg.slice("--changed-by=".length).trim();
  }
  return out;
}

async function main() {
  loadDotEnvLocal();
  const { identifier, role, changedBy } = parseArgs();
  if (!identifier) {
    throw new Error("Missing --identifier=<email|username|uuid>");
  }
  if (!["viewer", "creator", "superadmin"].includes(role)) {
    throw new Error("Invalid --role. Use viewer | creator | superadmin");
  }
  const actorIdentifier = changedBy || String(process.env.ROLE_CHANGE_ACTOR || "").trim();
  if (!actorIdentifier) {
    throw new Error("Missing --changed-by=<superadmin email|username|uuid> (or ROLE_CHANGE_ACTOR)");
  }

  const databaseUrl = String(process.env.DATABASE_URL || "").trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const sql = neon(databaseUrl);
  const normalized = identifier.toLowerCase();
  const actorNormalized = actorIdentifier.toLowerCase();
  const [targetRows, actorRows] = await Promise.all([
    sql`
      select id, email, username, display_name, role::text as role
      from public.users
      where id::text = ${identifier}
         or lower(email) = ${normalized}
         or lower(username) = ${normalized}
      limit 1
    `,
    sql`
      select id, email, username, display_name, role::text as role
      from public.users
      where id::text = ${actorIdentifier}
         or lower(email) = ${actorNormalized}
         or lower(username) = ${actorNormalized}
      limit 1
    `,
  ]);

  const target = targetRows[0];
  const actor = actorRows[0];
  if (!target) throw new Error("User not found");
  if (!actor || actor.role !== "superadmin") {
    throw new Error("--changed-by must resolve to a superadmin account");
  }
  if (target.id === actor.id && target.role !== role) {
    throw new Error("A superadmin cannot change their own role with this command");
  }
  if (target.role === role) {
    console.log(JSON.stringify({ ...target, changed: false }, null, 2));
    return;
  }

  const rows = await sql`
    with updated_user as (
      update public.users
      set role = ${role}, updated_at = now()
      where id = ${target.id}
        and role::text = ${target.role}
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
        ${target.role},
        role,
        ${actor.id},
        ${actor.username},
        ${actor.display_name}
      from updated_user
      returning id
    ),
    revoked_session as (
      insert into public.user_session_revocations (user_id, revoked_after, reason, updated_at)
      select id, now(), 'role_changed_cli', now()
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

  if (!rows[0]) {
    throw new Error("Role changed concurrently; retry after resolving the current state");
  }

  console.log(JSON.stringify({ ...rows[0], changed: true }, null, 2));
}

main().catch((error) => {
  console.error("[set-user-role]", error instanceof Error ? error.message : error);
  process.exit(1);
});
