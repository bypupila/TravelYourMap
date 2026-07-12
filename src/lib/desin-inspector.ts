import { sanitizeEnvValue } from "@/lib/env";

const DEFAULT_DESIN_INSPECTOR_ADMIN_EMAIL = "daguilarfeener@gmail.com";

export function getDesinInspectorAdminEmail() {
  const configuredEmail = sanitizeEnvValue(process.env.DESIN_INSPECTOR_ADMIN_EMAIL);
  return (configuredEmail || DEFAULT_DESIN_INSPECTOR_ADMIN_EMAIL).toLowerCase();
}

export function canAccessDesinInspector(email: string | null | undefined) {
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  const normalizedEmail = sanitizeEnvValue(email).toLowerCase();
  if (!normalizedEmail) {
    return false;
  }

  return normalizedEmail === getDesinInspectorAdminEmail();
}
