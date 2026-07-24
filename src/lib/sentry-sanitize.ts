const PRIVATE_CAPABILITY_PATH = /^\/(brand-portal|sponsor-report)\/[^/?#]+/i;
const SENSITIVE_HEADER = /^(authorization|cookie|set-cookie|x-api-key|x-auth-token)$/i;

function redactPrivateCapabilityTokens(value: string) {
  return value.replace(/\/(brand-portal|sponsor-report)\/[^/?#\s]+/gi, "/$1/[redacted]");
}

export function isPrivateCapabilityPath(pathname: string) {
  return PRIVATE_CAPABILITY_PATH.test(pathname);
}

export function sanitizeTelemetryUrl(value: string) {
  try {
    const parsed = new URL(value, "https://telemetry.invalid");
    parsed.pathname = redactPrivateCapabilityTokens(parsed.pathname);
    parsed.search = "";
    parsed.hash = "";
    return parsed.origin === "https://telemetry.invalid"
      ? parsed.pathname
      : `${parsed.origin}${parsed.pathname}`;
  } catch {
    return redactPrivateCapabilityTokens(value).split(/[?#]/, 1)[0];
  }
}

type TelemetryEvent = {
  transaction?: string;
  tags?: Record<string, unknown>;
  breadcrumbs?: Array<{
    data?: Record<string, unknown>;
  }>;
  contexts?: Record<string, Record<string, unknown> | undefined>;
  request?: {
    url?: string;
    headers?: Record<string, string>;
    cookies?: unknown;
    query_string?: unknown;
  };
  user?: Record<string, unknown>;
};

export function sanitizeSentryEvent<T extends TelemetryEvent>(event: T): T {
  if (event.transaction) {
    event.transaction = redactPrivateCapabilityTokens(event.transaction);
  }
  if (typeof event.tags?.url === "string") {
    event.tags.url = sanitizeTelemetryUrl(event.tags.url);
  }
  for (const breadcrumb of event.breadcrumbs || []) {
    for (const key of ["url", "from", "to"]) {
      if (typeof breadcrumb.data?.[key] === "string") {
        breadcrumb.data[key] = sanitizeTelemetryUrl(breadcrumb.data[key]);
      }
    }
  }
  for (const context of Object.values(event.contexts || {})) {
    if (typeof context?.request_path === "string") {
      context.request_path = sanitizeTelemetryUrl(context.request_path);
    }
  }
  if (event.request?.url) {
    event.request.url = sanitizeTelemetryUrl(event.request.url);
  }
  if (event.request) {
    delete event.request.cookies;
    delete event.request.query_string;
    if (event.request.headers) {
      event.request.headers = Object.fromEntries(
        Object.entries(event.request.headers).filter(([name]) => !SENSITIVE_HEADER.test(name))
      );
    }
  }
  if (event.user) {
    event.user = {
      id: event.user.id,
      username: event.user.username,
    };
  }
  return event;
}
