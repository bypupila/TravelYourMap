import type { Metadata } from "next";
import { cookies } from "next/headers";
import { CinematicLanding } from "@/components/landing/cinematic-landing";
import { LOCALE_COOKIE_NAME, normalizeLocale, type Locale } from "@/lib/i18n";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "TravelYourMap para creators | convierte tu canal en un mapa",
  description:
    "Landing para creadores de viajes: importa tu canal de YouTube, organiza videos por destino y publica una página interactiva lista para marcas y sponsors.",
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "TravelYourMap para creators | convierte tu canal en un mapa",
    description:
      "Convierte tu canal de YouTube en un media kit geográfico con mapa 3D, analytics por país, sponsors visibles y página pública SEO.",
    type: "website",
    url: siteUrl,
    siteName: "TravelYourMap - BY PUPILA",
  },
  twitter: {
    card: "summary_large_image",
    title: "TravelYourMap para creators",
    description:
      "Importa tu canal, detecta destinos y publica una página interactiva lista para marcas, sponsors y partnerships.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function HomePage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const locale: Locale = normalizeLocale(resolvedSearchParams.lang || (await cookies()).get(LOCALE_COOKIE_NAME)?.value);
  return <CinematicLanding locale={locale} />;
}
