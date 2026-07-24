import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";
import { isPrivateCapabilityPath, sanitizeSentryEvent } from "@/lib/sentry-sanitize";

declare global {
  type ClarityStub = {
    (...args: unknown[]): void;
    q?: unknown[][];
  };

  interface Window {
    clarity?: ClarityStub;
  }
}

function installExtensionHydrationGuard() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const selectors = ["#heurio-app", ".heurio-overlay", "[class*='heurio-']", "[id*='heurio-']"];
  // Some cursor/feedback extensions annotate existing nodes before hydration.
  const attributes = ["data-cursor-element-id"];

  const removeInjectedArtifacts = () => {
    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((node) => {
        node.parentNode?.removeChild(node);
      });
    });
    attributes.forEach((attribute) => {
      document.querySelectorAll(`[${attribute}]`).forEach((node) => {
        node.removeAttribute(attribute);
      });
    });
  };

  removeInjectedArtifacts();

  const observer = new MutationObserver(removeInjectedArtifacts);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: attributes,
  });

  window.addEventListener("load", () => {
    window.setTimeout(() => {
      removeInjectedArtifacts();
      observer.disconnect();
    }, 2500);
  });
}

function installMicrosoftClarity() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (isPrivateCapabilityPath(window.location.pathname)) return;
  if (document.getElementById("microsoft-clarity-script")) return;
  const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  const clarityEnabled =
    process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_ENABLE_CLARITY_IN_DEV === "1";
  if (!clarityEnabled || !clarityProjectId) return;

  if (typeof window.clarity !== "function") {
    const stub: ClarityStub = (...args: unknown[]) => {
      stub.q ||= [];
      stub.q.push(args);
    };
    window.clarity = stub;
  }

  const script = document.createElement("script");
  script.id = "microsoft-clarity-script";
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${clarityProjectId}`;
  document.head.appendChild(script);
}

installExtensionHydrationGuard();
installMicrosoftClarity();

const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const isProduction = process.env.NODE_ENV === "production";
const enablePostHogInDev = process.env.NEXT_PUBLIC_ENABLE_POSTHOG_IN_DEV === "1";
const enablePostHogDebugLogs = process.env.NEXT_PUBLIC_POSTHOG_DEBUG === "1";

const startsOnPrivateCapability =
  typeof window !== "undefined" && isPrivateCapabilityPath(window.location.pathname);
const sentryRuntimeAllowed =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ||
  process.env.NEXT_PUBLIC_SENTRY_ALLOW_NON_PRODUCTION === "1";

if (posthogToken && !startsOnPrivateCapability && (isProduction || enablePostHogInDev)) {
  posthog.init(posthogToken, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    defaults: "2026-01-30",
    capture_exceptions: true,
    disable_web_experiments: true,
    disable_surveys_automatic_display: true,
    before_send: (event) => {
      if (typeof window !== "undefined" && isPrivateCapabilityPath(window.location.pathname)) return null;
      return event;
    },
    debug: enablePostHogDebugLogs,
  });
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled:
    process.env.NEXT_PUBLIC_SENTRY_ENABLED === "1" &&
    Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN) &&
    sentryRuntimeAllowed,
  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
    process.env.NEXT_PUBLIC_VERCEL_ENV ||
    process.env.NODE_ENV,
  integrations: startsOnPrivateCapability ? [] : [Sentry.replayIntegration()],
  tracesSampleRate: startsOnPrivateCapability ? 0 : 0.1,
  enableLogs: false,
  replaysSessionSampleRate: startsOnPrivateCapability ? 0 : 0.01,
  replaysOnErrorSampleRate: startsOnPrivateCapability ? 0 : 1.0,
  sendDefaultPii: false,
  beforeSend(event) {
    return sanitizeSentryEvent(event);
  },
  beforeSendTransaction(event) {
    return sanitizeSentryEvent(event);
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

// IMPORTANT: Keep a single client instrumentation hook. Next.js loads this file
// before hydration, so both analytics and error monitoring must live here.
