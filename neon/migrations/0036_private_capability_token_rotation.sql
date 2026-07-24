-- Report and portal IDs were historically reused as their bearer token and
-- later reconstructed by creator-facing list APIs. Those values cannot be
-- made secret again, so rotate by revoking every link issued before the code
-- switched to independent random bearer tokens.
update public.sponsor_report_links
set active = false,
    revoked_at = coalesce(revoked_at, now()),
    updated_at = now()
where active = true;

update public.brand_portal_links
set active = false,
    revoked_at = coalesce(revoked_at, now()),
    updated_at = now()
where active = true;
