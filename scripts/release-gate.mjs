#!/usr/bin/env node

import path from "path";
import { neon } from "@neondatabase/serverless";
import { loadDotEnvLocal, migrationName, rootDir, sortedSqlFiles } from "./lib/neon-sql.mjs";

function pass(id, detail) {
  return { id, status: "pass", detail };
}

function fail(id, detail) {
  return { id, status: "fail", detail };
}

async function tableExists(sql, tableName) {
  const rows = await sql`
    select exists (
      select 1
      from information_schema.tables
      where table_schema = 'public'
        and table_name = ${tableName}
    ) as exists
  `;
  return Boolean(rows[0]?.exists);
}

async function columnExists(sql, tableName, columnName) {
  const rows = await sql`
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = ${tableName}
        and column_name = ${columnName}
    ) as exists
  `;
  return Boolean(rows[0]?.exists);
}

function resolvePolarServer(value) {
  const server = String(value || "production").trim().toLowerCase();
  if (server !== "production" && server !== "sandbox") return null;
  return server;
}

function polarApiBaseUrl(server) {
  return server === "sandbox" ? "https://sandbox-api.polar.sh" : "https://api.polar.sh";
}

async function polarRequest({ token, server, apiPath }) {
  const response = await fetch(`${polarApiBaseUrl(server)}${apiPath}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    let detail = "";
    try {
      const parsed = JSON.parse(body);
      detail = String(parsed?.error_description || parsed?.detail || parsed?.error || "").trim();
    } catch {
      detail = body.trim().slice(0, 180);
    }
    throw new Error(
      `Polar API verification failed with status ${response.status}${detail ? `: ${detail}` : ""}`
    );
  }
  return response.json();
}

async function listAllPolarPages({ token, server, apiPath, limit = 100 }) {
  const items = [];
  let page = 1;
  while (true) {
    const separator = apiPath.includes("?") ? "&" : "?";
    const data = await polarRequest({
      token,
      server,
      apiPath: `${apiPath}${separator}page=${page}&limit=${limit}`,
    });
    const pageItems = Array.isArray(data?.items) ? data.items : [];
    items.push(...pageItems);
    const maxPage = Number(data?.pagination?.max_page || 1);
    if (pageItems.length === 0 || page >= maxPage) break;
    page += 1;
  }
  return items;
}

function normalizeUrl(value) {
  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function normalizeWebhookTarget(value) {
  try {
    const url = new URL(value);
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

async function main() {
  loadDotEnvLocal();
  const databaseUrl = String(process.env.DATABASE_URL || "").trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for release gate");
  }

  const sql = neon(databaseUrl);
  const checks = [];
  const requiredTables = [
    "users",
    "channels",
    "videos",
    "video_locations",
    "viewer_profiles",
    "user_consents",
    "creator_viewer_subscriptions",
    "viewer_video_activity",
    "subscription_plans",
    "subscriptions",
    "polar_webhook_events",
    "auth_login_attempts",
    "auth_login_rate_buckets",
    "security_request_rate_limits",
    "security_request_rate_limit_buckets",
    "external_service_rate_leases",
    "user_session_revocations",
    "sponsors",
    "sponsor_geo_rules",
    "sponsor_clicks",
    "sponsor_report_links",
    "sponsor_report_schedules",
    "brand_portal_links",
    "sponsor_bulk_assign_jobs",
    "map_sync_runs",
    "channel_ownership_audit",
    "schema_migrations",
  ];

  const tableResults = await Promise.all(requiredTables.map(async (name) => [name, await tableExists(sql, name)]));
  const missingTables = tableResults.filter(([, exists]) => !exists).map(([name]) => name);
  checks.push(
    missingTables.length === 0
      ? pass("db_required_tables", "Core, billing, security, Sponsors, viewer activity, and migration tracking tables exist.")
      : fail("db_required_tables", `Missing tables: ${missingTables.join(", ")}`)
  );

  const requiredColumns = [
    ["channels", "ownership_status"],
    ["subscriptions", "polar_modified_at"],
    ["channel_import_runs", "lease_id"],
    ["channel_import_runs", "lease_expires_at"],
    ["sponsor_bulk_assign_jobs", "lease_id"],
    ["sponsor_bulk_assign_jobs", "lease_expires_at"],
    ["sponsor_report_links", "expires_at"],
    ["brand_portal_links", "expires_at"],
    ["sponsor_report_schedules", "lease_id"],
    ["sponsor_report_schedules", "lease_expires_at"],
  ];
  const columnResults = await Promise.all(requiredColumns.map(async ([table, column]) => [
    `${table}.${column}`,
    await columnExists(sql, table, column),
  ]));
  const missingColumns = columnResults.filter(([, exists]) => !exists).map(([name]) => name);
  checks.push(
    missingColumns.length === 0
      ? pass("db_required_columns", "Billing, ownership, private-link, and worker lease columns exist.")
      : fail("db_required_columns", `Missing columns: ${missingColumns.join(", ")}`)
  );

  const unverifiedPublicChannels = await sql`
    select count(*)::int as count
    from public.channels
    where is_public = true
      and ownership_status <> 'verified'
  `.catch(() => [{ count: -1 }]);
  const unverifiedPublicCount = Number(unverifiedPublicChannels[0]?.count ?? -1);
  checks.push(
    unverifiedPublicCount === 0
      ? pass("channel_ownership", "Every public channel has verified ownership.")
      : fail("channel_ownership", `${unverifiedPublicCount < 0 ? "Unknown" : unverifiedPublicCount} public channels lack verified ownership.`)
  );

  const migrationFiles = sortedSqlFiles(path.join(rootDir, "neon", "migrations"));
  const migrationNames = migrationFiles.map(migrationName);
  const appliedRows = await sql`
    select name
    from public.schema_migrations
    order by name
  `.catch(() => []);
  const appliedNames = new Set(appliedRows.map((row) => row.name));
  const pendingMigrations = migrationNames.filter((name) => !appliedNames.has(name));
  checks.push(
    pendingMigrations.length === 0
      ? pass("db_migrations", `${migrationNames.length} migrations tracked as applied.`)
      : fail("db_migrations", `Pending migrations: ${pendingMigrations.join(", ")}`)
  );

  const checkoutPlans = await sql`
    select slug,
           is_active,
           polar_product_id,
           polar_price_id
    from public.subscription_plans
    where slug in ('starter', 'pro')
    order by slug
  `.catch(() => []);
  const checkoutReady = checkoutPlans.filter((row) => row.is_active && row.polar_product_id && row.polar_price_id);
  checks.push(
    checkoutReady.length === 2
      ? pass("billing_polar_checkout", "Creator (starter) and Creator Pro (pro) have active Polar product and price IDs.")
      : fail("billing_polar_checkout", `Only ${checkoutReady.length}/2 launch checkout plans have Polar product and price IDs.`)
  );

  const polarAccessToken = String(process.env.POLAR_ACCESS_TOKEN || "").trim();
  const polarWebhookSecret = String(process.env.POLAR_WEBHOOK_SECRET || "").trim();
  const polarServer = resolvePolarServer(process.env.POLAR_SERVER);
  const polarOrganizationId = String(process.env.POLAR_ORGANIZATION_ID || "").trim();
  const polarDiscountId = String(process.env.POLAR_TRIAL_DISCOUNT_ID || "").trim();
  checks.push(
    polarAccessToken && polarWebhookSecret && polarServer && polarOrganizationId
      ? pass("billing_polar_env", `Polar ${polarServer} token, webhook secret, and organization are configured.`)
      : fail("billing_polar_env", "POLAR_ACCESS_TOKEN, POLAR_WEBHOOK_SECRET, POLAR_ORGANIZATION_ID, and a valid POLAR_SERVER are required.")
  );

  const vercelEnvironment = String(process.env.VERCEL_ENV || "").trim().toLowerCase();
  checks.push(
    vercelEnvironment === "production" && polarServer === "sandbox"
      ? fail("billing_polar_environment", "A production Vercel deployment cannot use POLAR_SERVER=sandbox.")
      : pass("billing_polar_environment", `Deployment and Polar environment are compatible (${vercelEnvironment || "local"}/${polarServer || "invalid"}).`)
  );

  if (polarAccessToken && polarServer && polarOrganizationId) {
    try {
      const [organizations, products, webhookEndpoints, discounts] = await Promise.all([
        listAllPolarPages({ token: polarAccessToken, server: polarServer, apiPath: "/v1/organizations/" }),
        listAllPolarPages({
          token: polarAccessToken,
          server: polarServer,
          apiPath: `/v1/products/?organization_id=${encodeURIComponent(polarOrganizationId)}`,
        }),
        listAllPolarPages({
          token: polarAccessToken,
          server: polarServer,
          apiPath: `/v1/webhooks/endpoints?organization_id=${encodeURIComponent(polarOrganizationId)}`,
        }),
        polarDiscountId
          ? listAllPolarPages({
              token: polarAccessToken,
              server: polarServer,
              apiPath: `/v1/discounts/?organization_id=${encodeURIComponent(polarOrganizationId)}`,
            })
          : Promise.resolve([]),
      ]);

      const organizationExists = organizations.some((organization) => organization.id === polarOrganizationId);
      checks.push(
        organizationExists
          ? pass("billing_polar_organization", `Configured organization exists in Polar ${polarServer}.`)
          : fail("billing_polar_organization", `POLAR_ORGANIZATION_ID is not available in Polar ${polarServer}.`)
      );

      const catalogErrors = [];
      for (const plan of checkoutPlans) {
        const product = products.find((candidate) => candidate.id === plan.polar_product_id);
        const price = Array.isArray(product?.prices)
          ? product.prices.find((candidate) => candidate.id === plan.polar_price_id)
          : null;
        if (!plan.is_active || !product || product.is_archived || !price || price.is_archived || price.type !== "recurring") {
          catalogErrors.push(plan.slug);
        }
      }
      checks.push(
        catalogErrors.length === 0 && checkoutPlans.length === 2
          ? pass("billing_polar_catalog_live", `All launch products and recurring prices exist in Polar ${polarServer}.`)
          : fail("billing_polar_catalog_live", `Invalid or cross-environment Polar catalog entries: ${catalogErrors.join(", ") || "missing launch plans"}`)
      );

      const appUrl = normalizeUrl(process.env.NEXT_PUBLIC_APP_URL || "");
      const expectedWebhookUrl = appUrl ? normalizeUrl(`${appUrl}/api/billing/polar/webhook`) : null;
      const requiredEvents = new Set([
        "subscription.created",
        "subscription.updated",
        "subscription.active",
        "subscription.canceled",
        "subscription.uncanceled",
        "subscription.revoked",
        "subscription.past_due",
      ]);
      const matchingWebhook = webhookEndpoints.find((endpoint) =>
        endpoint.enabled &&
        normalizeWebhookTarget(endpoint.url) === expectedWebhookUrl &&
        Array.from(requiredEvents).every((eventName) => Array.isArray(endpoint.events) && endpoint.events.includes(eventName))
      );
      checks.push(
        matchingWebhook
          ? pass("billing_polar_webhook", `Enabled webhook covers the complete subscription lifecycle in Polar ${polarServer}.`)
          : fail("billing_polar_webhook", `No enabled webhook for ${expectedWebhookUrl || "invalid NEXT_PUBLIC_APP_URL"} covers all required subscription events.`)
      );

      if (polarServer === "sandbox") {
        const discountExists = polarDiscountId && discounts.some((discount) => discount.id === polarDiscountId);
        checks.push(
          discountExists
            ? pass("billing_polar_sandbox_discount", "Configured sandbox checkout discount exists in the sandbox organization.")
            : fail("billing_polar_sandbox_discount", "POLAR_SERVER=sandbox requires a sandbox POLAR_TRIAL_DISCOUNT_ID for QA checkout.")
        );
      } else if (polarDiscountId) {
        checks.push(
          discounts.some((discount) => discount.id === polarDiscountId)
            ? pass("billing_polar_discount", "Configured production discount exists in the production organization.")
            : fail("billing_polar_discount", "Configured POLAR_TRIAL_DISCOUNT_ID is not available in the production organization.")
        );
      }
    } catch (error) {
      checks.push(fail("billing_polar_remote_verification", error instanceof Error ? error.message : "Polar API verification failed."));
    }
  }

  const noPaymentBypassEnabled = process.env.NODE_ENV === "production" && (
    process.env.ENABLE_TEST_NO_PAYMENT === "1" || process.env.NEXT_PUBLIC_ENABLE_TEST_NO_PAYMENT === "1"
  );
  checks.push(
    noPaymentBypassEnabled
      ? fail("release_no_payment_bypass", "ENABLE_TEST_NO_PAYMENT cannot be enabled in production.")
      : pass("release_no_payment_bypass", "No-payment bypass is not enabled for production.")
  );

  const geminiEnabled = process.env.GEMINI_ENABLED === "1";
  const geminiKeyConfigured = ["GOOGLE_GENAI_API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY"]
    .some((name) => Boolean(String(process.env[name] || "").trim()));
  checks.push(
    !geminiEnabled || geminiKeyConfigured
      ? pass(
          "external_ai_opt_in",
          geminiEnabled
            ? "Gemini is explicitly enabled and has a configured API key."
            : "Gemini is disabled by default; configured legacy keys cannot trigger usage."
        )
      : fail("external_ai_opt_in", "GEMINI_ENABLED=1 requires an explicit Gemini API key.")
  );

  const sentryEnabled = process.env.SENTRY_ENABLED === "1";
  const publicSentryEnabled = process.env.NEXT_PUBLIC_SENTRY_ENABLED === "1";
  const sentryNonProductionEnabled = process.env.SENTRY_ALLOW_NON_PRODUCTION === "1";
  const publicSentryNonProductionEnabled = process.env.NEXT_PUBLIC_SENTRY_ALLOW_NON_PRODUCTION === "1";
  checks.push(
    sentryEnabled === publicSentryEnabled
      ? pass("observability_sentry_flags", `Server and browser Sentry flags agree (${sentryEnabled ? "enabled" : "disabled"}).`)
      : fail("observability_sentry_flags", "SENTRY_ENABLED and NEXT_PUBLIC_SENTRY_ENABLED must match.")
  );
  checks.push(
    sentryNonProductionEnabled === publicSentryNonProductionEnabled
      ? pass(
          "observability_sentry_non_production_flags",
          `Server and browser non-production Sentry overrides agree (${sentryNonProductionEnabled ? "enabled" : "disabled"}).`
        )
      : fail(
          "observability_sentry_non_production_flags",
          "SENTRY_ALLOW_NON_PRODUCTION and NEXT_PUBLIC_SENTRY_ALLOW_NON_PRODUCTION must match."
        )
  );

  if (vercelEnvironment === "production") {
    const requiredSentryValues = [
      "SENTRY_DSN",
      "NEXT_PUBLIC_SENTRY_DSN",
      "SENTRY_AUTH_TOKEN",
      "SENTRY_ORG",
      "SENTRY_PROJECT",
      "SENTRY_ENVIRONMENT",
      "NEXT_PUBLIC_SENTRY_ENVIRONMENT",
    ];
    const missingSentryValues = requiredSentryValues.filter((name) => !String(process.env[name] || "").trim());
    checks.push(
      sentryEnabled && missingSentryValues.length === 0
        ? pass("observability_sentry_production", "Production error capture and source-map upload are configured.")
        : fail("observability_sentry_production", `Production Sentry is incomplete: ${missingSentryValues.join(", ") || "capture is disabled"}.`)
    );
    checks.push(
      process.env.SENTRY_DSN === process.env.NEXT_PUBLIC_SENTRY_DSN &&
      process.env.SENTRY_ORG === "by-pupila" &&
      process.env.SENTRY_PROJECT === "travelyourmap" &&
      process.env.SENTRY_ENVIRONMENT === "production" &&
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === "production"
        ? pass("observability_sentry_identity", "Sentry DSN, project, and production environment are consistent across runtimes.")
        : fail("observability_sentry_identity", "Sentry server/browser identity or environment is inconsistent.")
    );
  }

  const blockers = checks.filter((check) => check.status === "fail");
  const payload = {
    generated_at: new Date().toISOString(),
    ready: blockers.length === 0,
    blockers: blockers.length,
    checks,
  };
  console.log(JSON.stringify(payload, null, 2));
  if (blockers.length > 0) process.exit(1);
}

main().catch((error) => {
  console.error("[release-gate] failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
