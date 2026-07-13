import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ExplorePageClient } from "@/components/explore/explore-page-client";
import { LOCALE_COOKIE_NAME, normalizeLocale, type Locale } from "@/lib/i18n";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Explorar creadores por destino | TravelYourMap",
  description: "Explora países, creadores y videos con una vista editorial centrada en destinos y rutas.",
  openGraph: {
    title: "Explorar creadores por destino | TravelYourMap",
    description: "Directorio visual de creadores y videos por destino para discovery y SEO.",
    type: "website",
    url: `${siteUrl}/explore`,
    siteName: "TravelYourMap - BY PUPILA",
  },
};

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale: Locale = normalizeLocale((await searchParams).lang || (await cookies()).get(LOCALE_COOKIE_NAME)?.value);
  return <ExplorePageClient locale={locale} />;
}
