import "server-only";

import * as Sentry from "@sentry/nextjs";

type OperationalErrorContext = {
  area: string;
  operation: string;
  tags?: Record<string, string>;
};

export function reportOperationalError(error: unknown, context: OperationalErrorContext) {
  console.error(`[${context.area}/${context.operation}]`, error);
  Sentry.withScope((scope) => {
    scope.setTag("app.area", context.area);
    scope.setTag("app.operation", context.operation);
    for (const [key, value] of Object.entries(context.tags || {})) {
      scope.setTag(key, value);
    }
    Sentry.captureException(error);
  });
}
