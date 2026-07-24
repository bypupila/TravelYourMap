"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

const PRIVATE_CAPABILITY_PATH = /^\/(?:brand-portal|sponsor-report)\/[^/]+(?:\/|$)/i;

export function SafeAnalytics() {
  return (
    <Analytics
      beforeSend={(event: BeforeSendEvent) => {
        try {
          return PRIVATE_CAPABILITY_PATH.test(new URL(event.url).pathname) ? null : event;
        } catch {
          return null;
        }
      }}
    />
  );
}
