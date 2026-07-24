#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

function loadDotEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const separator = line.indexOf("=");
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && !(key in process.env)) process.env[key] = value;
  }
}

function parseArgs() {
  const output = { channel: "", changedBy: "", action: "verify", method: "", note: "" };
  for (const argument of process.argv.slice(2)) {
    if (argument.startsWith("--channel=")) output.channel = argument.slice(10).trim();
    if (argument.startsWith("--changed-by=")) output.changedBy = argument.slice(13).trim();
    if (argument.startsWith("--action=")) output.action = argument.slice(9).trim();
    if (argument.startsWith("--method=")) output.method = argument.slice(9).trim();
    if (argument.startsWith("--note=")) output.note = argument.slice(7).trim();
  }
  return output;
}

async function main() {
  loadDotEnvLocal();
  const input = parseArgs();
  if (!input.channel) throw new Error("Missing --channel=<uuid|YouTube id|handle>");
  if (!input.changedBy) throw new Error("Missing --changed-by=<superadmin email|username|uuid>");
  if (!['verify', 'revoke'].includes(input.action)) throw new Error("--action must be verify or revoke");
  if (input.action === "verify" && !['manual_evidence', 'youtube_oauth', 'description_challenge'].includes(input.method)) {
    throw new Error("Verification requires --method=manual_evidence|youtube_oauth|description_challenge");
  }
  if (input.action === "verify" && input.note.length < 8) {
    throw new Error("Verification requires --note with the evidence reference (minimum 8 characters)");
  }

  const databaseUrl = String(process.env.DATABASE_URL || "").trim();
  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  const sql = neon(databaseUrl);
  const actorIdentifier = input.changedBy.toLowerCase();
  const channelIdentifier = input.channel.toLowerCase().replace(/^@/, "");
  const [actorRows, channelRows] = await Promise.all([
    sql`
      select id, username, role::text as role
      from public.users
      where id::text = ${input.changedBy}
         or lower(email) = ${actorIdentifier}
         or lower(username) = ${actorIdentifier}
      limit 1
    `,
    sql`
      select id, youtube_channel_id, ownership_status
      from public.channels
      where id::text = ${input.channel}
         or lower(coalesce(youtube_channel_id, '')) = ${channelIdentifier}
         or ltrim(lower(coalesce(channel_handle, '')), '@') = ${channelIdentifier}
      order by created_at asc
      limit 1
    `,
  ]);
  const actor = actorRows[0];
  const channel = channelRows[0];
  if (!actor || actor.role !== "superadmin") throw new Error("--changed-by must resolve to a superadmin");
  if (!channel) throw new Error("Channel not found");

  const newStatus = input.action === "verify" ? "verified" : "revoked";
  if (channel.ownership_status === newStatus) {
    console.log(JSON.stringify({ ...channel, changed: false }, null, 2));
    return;
  }

  const rows = await sql`
    with updated_channel as (
      update public.channels
      set
        ownership_status = ${newStatus},
        ownership_verified_at = case when ${newStatus} = 'verified' then now() else null end,
        ownership_verified_by = case when ${newStatus} = 'verified' then ${actor.id}::uuid else null end,
        ownership_verification_method = ${input.method || null},
        ownership_verification_note = ${input.note || null},
        is_public = case
          when ${newStatus} = 'verified' then exists (
            select 1
            from public.video_locations vl
            inner join public.videos v on v.id = vl.video_id
            where v.channel_id = public.channels.id
          )
          else false
        end,
        updated_at = now()
      where id = ${channel.id}
        and ownership_status = ${channel.ownership_status}
      returning id, youtube_channel_id, ownership_status, is_public
    ),
    audit_insert as (
      insert into public.channel_ownership_audit (
        channel_id,
        youtube_channel_id,
        previous_status,
        new_status,
        verification_method,
        verification_note,
        changed_by_user_id,
        changed_by_username
      )
      select
        id,
        youtube_channel_id,
        ${channel.ownership_status},
        ownership_status,
        ${input.method || null},
        ${input.note || null},
        ${actor.id},
        ${actor.username}
      from updated_channel
      returning id
    )
    select id, youtube_channel_id, ownership_status, is_public
    from updated_channel
    where (select count(*) from audit_insert) = 1
  `;
  if (!rows[0]) throw new Error("Channel ownership state changed concurrently; retry");
  console.log(JSON.stringify({ ...rows[0], changed: true }, null, 2));
}

main().catch((error) => {
  console.error("[verify-channel-ownership]", error instanceof Error ? error.message : error);
  process.exit(1);
});

