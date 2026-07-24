alter table public.sponsor_report_links
  alter column expires_at set default (now() + interval '90 days');

update public.sponsor_report_links
set expires_at = created_at + interval '90 days',
    updated_at = now()
where expires_at is null;

alter table public.brand_portal_links
  alter column expires_at set default (now() + interval '30 days');

update public.brand_portal_links
set expires_at = created_at + interval '30 days',
    updated_at = now()
where expires_at is null;

-- Legacy portals without an email/code pair cannot be upgraded safely because
-- the original code was never stored. Revoke them and require the creator to
-- issue a new protected link.
update public.brand_portal_links
set active = false,
    revoked_at = coalesce(revoked_at, now()),
    updated_at = now()
where active = true
  and (
    require_access_code = false
    or access_email is null
    or access_code_hash is null
  );
