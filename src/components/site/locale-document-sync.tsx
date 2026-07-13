"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LOCALE_COOKIE_NAME, normalizeLocale } from "@/lib/i18n";

export function LocaleDocumentSync() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const requestedLocale = searchParams.get("lang");
    const cookieLocale = document.cookie
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${LOCALE_COOKIE_NAME}=`))
      ?.split("=")[1];
    const locale = normalizeLocale(requestedLocale || cookieLocale);

    document.documentElement.lang = locale;
    if (requestedLocale) document.cookie = `${LOCALE_COOKIE_NAME}=${locale};path=/;max-age=31536000;samesite=lax`;
  }, [searchParams]);

  return null;
}
