#!/usr/bin/env node

import fs from "fs";
import path from "path";

const cwd = process.cwd();
const envPath = path.join(cwd, ".env.local");

const required = [
  "NEXT_PUBLIC_APP_URL",
  "DATABASE_URL",
  "YOUTUBE_API_KEY",
  "NOMINATIM_USER_AGENT",
  "NOMINATIM_EMAIL",
];

const requiredOneOf = [
  ["AUTH_SESSION_SECRET", "SESSION_SECRET"],
];

const optional = [
  "NEXT_PUBLIC_ENABLE_AGENTATION",
  "ENABLE_TEST_NO_PAYMENT",
  "NEXT_PUBLIC_CLARITY_PROJECT_ID",
  "NEXT_PUBLIC_ENABLE_CLARITY_IN_DEV",
  "GEMINI_ENABLED",
  "GEMINI_MODEL",
  "NEON_PROJECT_ID",
  "YOUTUBE_IMPORT_WORKER_TOKEN",
  "YOUTUBE_DATA_GOVERNANCE_TOKEN",
  "YOUTUBE_IMPORT_CONCURRENCY",
  "YOUTUBE_IMPORT_MAX_VIDEOS_PER_RUN",
  "MAP_POLLS_CRON_TOKEN",
  "SPONSOR_REPORTS_CRON_TOKEN",
  "CRON_SECRET",
  "POLAR_ACCESS_TOKEN",
  "POLAR_WEBHOOK_SECRET",
  "POLAR_TRIAL_DISCOUNT_ID",
  "POLAR_SERVER",
  "POLAR_ORGANIZATION_ID",
  "SENTRY_ENABLED",
  "NEXT_PUBLIC_SENTRY_ENABLED",
  "SENTRY_ALLOW_NON_PRODUCTION",
  "NEXT_PUBLIC_SENTRY_ALLOW_NON_PRODUCTION",
  "SENTRY_DSN",
  "NEXT_PUBLIC_SENTRY_DSN",
  "SENTRY_ENVIRONMENT",
  "NEXT_PUBLIC_SENTRY_ENVIRONMENT",
  "SENTRY_ORG",
  "SENTRY_PROJECT",
  "SENTRY_AUTH_TOKEN",
];

function parseEnv(content) {
  const out = new Map();
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    out.set(key, value);
  }
  return out;
}

if (!fs.existsSync(envPath)) {
  console.error("Missing .env.local");
  process.exit(1);
}

const values = parseEnv(fs.readFileSync(envPath, "utf8"));
const missing = [];

const geminiEnabledValue = String(values.get("GEMINI_ENABLED") || "0");
if (!new Set(["0", "1"]).has(geminiEnabledValue)) {
  console.error("GEMINI_ENABLED must be either 0 or 1.");
  process.exit(1);
}
if (geminiEnabledValue === "1") {
  const geminiKeys = ["GOOGLE_GENAI_API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY"];
  if (!geminiKeys.some((key) => Boolean(values.get(key)))) missing.push(geminiKeys.join(" | "));
}

const polarServer = String(values.get("POLAR_SERVER") || "production").toLowerCase();
if (!new Set(["production", "sandbox"]).has(polarServer)) {
  console.error("POLAR_SERVER must be either production or sandbox.");
  process.exit(1);
}

const sentryEnabled = values.get("SENTRY_ENABLED") === "1";
const publicSentryEnabled = values.get("NEXT_PUBLIC_SENTRY_ENABLED") === "1";
if (sentryEnabled !== publicSentryEnabled) {
  console.error("SENTRY_ENABLED and NEXT_PUBLIC_SENTRY_ENABLED must match.");
  process.exit(1);
}
const sentryNonProductionEnabled = values.get("SENTRY_ALLOW_NON_PRODUCTION") === "1";
const publicSentryNonProductionEnabled = values.get("NEXT_PUBLIC_SENTRY_ALLOW_NON_PRODUCTION") === "1";
if (sentryNonProductionEnabled !== publicSentryNonProductionEnabled) {
  console.error("SENTRY_ALLOW_NON_PRODUCTION and NEXT_PUBLIC_SENTRY_ALLOW_NON_PRODUCTION must match.");
  process.exit(1);
}
if (sentryEnabled) {
  for (const key of ["SENTRY_DSN", "NEXT_PUBLIC_SENTRY_DSN", "SENTRY_ORG", "SENTRY_PROJECT", "SENTRY_AUTH_TOKEN"]) {
    if (!values.get(key)) missing.push(key);
  }
}

for (const key of required) {
  if (!values.get(key)) missing.push(key);
}

for (const group of requiredOneOf) {
  const hasAny = group.some((key) => Boolean(values.get(key)));
  if (!hasAny) missing.push(`${group.join(" | ")}`);
}

if (missing.length > 0) {
  console.error("Missing required environment values:");
  for (const key of missing) {
    console.error(`- ${key}`);
  }
  process.exit(1);
}

console.log("Environment check passed.");
console.log("Optional values:");
for (const key of optional) {
  console.log(`- ${key}: ${values.get(key) ? "set" : "not set"}`);
}
