// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { sanitizeSentryEvent } from "./src/lib/sentry-sanitize";

const sentryRuntimeAllowed =
  process.env.VERCEL_ENV === "production" || process.env.SENTRY_ALLOW_NON_PRODUCTION === "1";
const sentryEnabled =
  process.env.SENTRY_ENABLED === "1" && Boolean(process.env.SENTRY_DSN) && sentryRuntimeAllowed;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: sentryEnabled,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.VERCEL_ENV || process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  enableLogs: false,
  sendDefaultPii: false,
  beforeSend: sanitizeSentryEvent,
});
