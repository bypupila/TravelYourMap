import type { Metadata } from "next";
import Link from "next/link";
import { PricingPlanExplorer } from "@/components/pricing/pricing-plan-explorer";
import { buildLocalizedHref, normalizeLocale } from "@/lib/i18n";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Planes y precios | TravelYourMap",
  description: "Compara los planes de TravelYourMap para creadores y agencias y comienza una prueba de 7 días.",
  alternates: { canonical: `${siteUrl}/pricing` },
  openGraph: {
    title: "Planes y precios | TravelYourMap",
    description: "Planes para publicar mapas de viaje, gestionar sponsors y analizar destinos.",
    type: "website",
    url: `${siteUrl}/pricing`,
    siteName: "TravelYourMap",
  },
};

interface PricingPageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const { lang } = await searchParams;
  const locale = normalizeLocale(lang);
  const copy =
    locale === "en"
      ? {
          back: "Back home",
        }
      : {
          back: "Volver al inicio",
        };

  return (
    <main className="min-h-[100dvh] bg-[#070a0d] px-4 py-8 text-[#f5f2ed] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4">
          <Link href={buildLocalizedHref("/", locale)} className="text-sm font-black uppercase tracking-[0.12em] text-white">
            TravelYourMap
          </Link>
          <Link href={buildLocalizedHref("/", locale)} className="text-sm text-white/70 underline underline-offset-4">
            {copy.back}
          </Link>
        </header>

        <PricingPlanExplorer locale={locale} />
      </div>
    </main>
  );
}
