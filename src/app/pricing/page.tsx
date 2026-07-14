import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { buildLocalizedHref, normalizeLocale } from "@/lib/i18n";
import { getLocalizedPlan, PLAN_DEFINITIONS } from "@/lib/plans";
import { ComingSoonButton } from "@/components/site/coming-soon-button";

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
    siteName: "TravelYourMap - BY PUPILA",
  },
};

interface PricingPageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const { lang } = await searchParams;
  const locale = normalizeLocale(lang);
  const plans = PLAN_DEFINITIONS.filter((plan) => plan.slug !== "free").map((plan) => getLocalizedPlan(plan, locale));
  const copy =
    locale === "en"
      ? {
          eyebrow: "TravelYourMap plans",
          title: "Choose the plan that fits your map.",
          description: "One source of truth for pricing, availability, trial length, and checkout.",
          back: "Back home",
          trial: "No charge today. Billing starts after the 7-day trial.",
        }
      : {
          eyebrow: "Planes TravelYourMap",
          title: "Elige el plan que acompaña tu mapa.",
          description: "Una única fuente para precios, disponibilidad, prueba y checkout.",
          back: "Volver al inicio",
          trial: "No se cobra hoy. La facturación comienza después de la prueba de 7 días.",
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

        <section className="py-14 text-center sm:py-20">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff5a3d]">{copy.eyebrow}</p>
          <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-black tracking-[-0.045em] text-white sm:text-6xl">{copy.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/65">{copy.description}</p>
        </section>

        <section className="grid gap-5 lg:grid-cols-3" aria-label={copy.eyebrow}>
          {plans.map((plan) => (
            <article
              key={plan.slug}
              className={`flex min-h-full flex-col rounded-[24px] border p-6 ${plan.featured ? "border-[#ff5a3d]/70 bg-[#171316]" : "border-white/10 bg-white/[0.035]"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white">{plan.name}</h2>
                  <p className="mt-2 text-3xl font-black text-white">{plan.price}</p>
                </div>
                {plan.featured ? (
                  <span className="rounded-full border border-[#ff5a3d]/45 bg-[#ff5a3d]/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#ff9d8a]">
                    {locale === "en" ? "Most popular" : "Más popular"}
                  </span>
                ) : null}
              </div>
              <p className="mt-4 min-h-12 text-sm leading-6 text-white/65">{plan.description}</p>
              {plan.available && plan.trialLabel ? <p className="mt-3 text-xs font-bold text-[#ff8f78]">{plan.trialLabel}</p> : null}
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-white/75">
                    <CheckCircle size={17} className="mt-0.5 shrink-0 text-[#ff6b50]" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {plan.available ? (
                <Link
                  href={buildLocalizedHref(`/onboarding?plan=${encodeURIComponent(plan.slug)}`, locale)}
                  className={`mt-7 inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-black ${plan.featured ? "bg-[#ff5a3d] text-white" : "border border-white/15 text-white"}`}
                >
                  {plan.ctaLabel}
                </Link>
              ) : (
                <ComingSoonButton
                  featureId="agency_plan"
                  surfaceId="pricing"
                  className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 px-4 text-sm font-black text-white transition hover:bg-white/6"
                >
                  {locale === "en" ? "Coming soon" : "Próximamente"}
                </ComingSoonButton>
              )}
            </article>
          ))}
        </section>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-white/55">{copy.trial}</p>
      </div>
    </main>
  );
}
