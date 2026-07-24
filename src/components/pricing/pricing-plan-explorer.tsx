"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Buildings, CaretDown, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { ComingSoonButton } from "@/components/site/coming-soon-button";
import { buildLocalizedHref, type Locale } from "@/lib/i18n";
import { getLocalizedPlan, PLAN_DEFINITIONS } from "@/lib/plans";

type BillingCycle = "monthly" | "annual";

const ANNUAL_DISCOUNT = 0.2;

function formatMoney(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function priceFor(monthlyPrice: number, billingCycle: BillingCycle, locale: Locale) {
  if (billingCycle === "monthly") {
    return {
      amount: formatMoney(monthlyPrice, locale),
      suffix: locale === "en" ? "/mo" : "/mes",
      detail: locale === "en" ? "Monthly billing" : "Facturación mensual",
    };
  }

  const annualPrice = monthlyPrice * 12 * (1 - ANNUAL_DISCOUNT);
  return {
    amount: formatMoney(annualPrice, locale),
    suffix: locale === "en" ? "/yr" : "/año",
    detail: locale === "en" ? `Equivalent to ${formatMoney(annualPrice / 12, locale)}/mo` : `Equivale a ${formatMoney(annualPrice / 12, locale)}/mes`,
  };
}

export function PricingPlanExplorer({ locale }: { locale: Locale }) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const billingId = useId();
  const creator = getLocalizedPlan(PLAN_DEFINITIONS.find((plan) => plan.slug === "creator")!, locale);
  const creatorPro = getLocalizedPlan(PLAN_DEFINITIONS.find((plan) => plan.slug === "creator_pro")!, locale);
  const free = getLocalizedPlan(PLAN_DEFINITIONS.find((plan) => plan.slug === "free")!, locale);
  const agency = getLocalizedPlan(PLAN_DEFINITIONS.find((plan) => plan.slug === "agency")!, locale);
  const creatorPrice = priceFor(creator.monthlyPrice, billingCycle, locale);
  const creatorProPrice = priceFor(creatorPro.monthlyPrice, billingCycle, locale);
  const copy =
    locale === "en"
      ? {
          eyebrow: "TravelYourMap plans",
          title: "Choose the plan that fits your map.",
          description: "Show the value of your destinations, understand the interest they generate, and turn your map into a clearer business proposal.",
          monthly: "Monthly",
          annual: "Annual",
          save: "Save 20%",
          popular: "Most popular",
          more: "See all capabilities",
          freeEyebrow: "Start here",
          agencyLabel: "For teams and portfolios",
          soon: "Coming soon",
          trial: "No charge today. Billing starts after the 7-day trial.",
        }
      : {
          eyebrow: "Planes TravelYourMap",
          title: "Elige el plan que acompaña tu mapa.",
          description: "Muestra el valor de tus destinos, entiende el interés que generan y convierte tu mapa en una propuesta de negocio más clara.",
          monthly: "Mensual",
          annual: "Anual",
          save: "Ahorra 20%",
          popular: "Más elegido",
          more: "Ver todas las capacidades",
          freeEyebrow: "Para empezar",
          agencyLabel: "Para equipos y portafolios",
          soon: "Próximamente",
          trial: "No se cobra hoy. La facturación comienza después de la prueba de 7 días.",
        };

  const primaryFeatures = creatorPro.features.slice(0, 3);
  const additionalFeatures = creatorPro.features.slice(3);

  return (
    <section className="pb-10 pt-14 sm:pb-14 sm:pt-20" aria-labelledby="pricing-title">
      <div className="grid gap-8 border-b border-white/10 pb-8 md:grid-cols-[minmax(0,1fr)_290px] md:items-end md:gap-12">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff725b]">{copy.eyebrow}</p>
          <h1 id="pricing-title" className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl md:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/65">{copy.description}</p>
        </div>

        <div>
          <p id={billingId} className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-white/52">
            {locale === "en" ? "Billing cycle" : "Ciclo de facturación"}
          </p>
          <div role="radiogroup" aria-labelledby={billingId} className="grid grid-cols-2 rounded-2xl border border-white/12 bg-white/[0.025] p-1">
            {(["monthly", "annual"] as const).map((cycle) => {
              const active = billingCycle === cycle;
              return (
                <button
                  key={cycle}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setBillingCycle(cycle)}
                  className={`rounded-xl px-3 py-3 text-left text-sm font-black transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:translate-y-px ${
                    active ? "bg-[#ff5a3d] text-white" : "text-white/62 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <span className="block">{cycle === "monthly" ? copy.monthly : copy.annual}</span>
                  <span className={`mt-0.5 block text-[11px] font-bold ${active ? "text-white/82" : "text-white/40"}`}>
                    {cycle === "annual" ? copy.save : formatMoney(creatorPro.monthlyPrice, locale)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <article className="relative overflow-hidden rounded-[22px] border border-[#ff5a3d]/65 bg-[#171316] p-6 shadow-[0_24px_60px_-36px_rgba(255,90,61,0.45)] sm:p-8">
          <div className="absolute right-0 top-0 h-24 w-24 border-b border-l border-[#ff5a3d]/20" aria-hidden="true" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#ff9d8a]">{copy.popular}</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-white">{creatorPro.name}</h2>
            </div>
            <p className="text-right text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">
              {creatorProPrice.amount}<span className="ml-1 text-sm font-bold tracking-normal text-white/60">{creatorProPrice.suffix}</span>
            </p>
          </div>
          <p className="mt-2 text-sm text-white/52">{creatorProPrice.detail}</p>

          <div className="mt-7 border-y border-white/10 py-1">
            {primaryFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-3 border-b border-white/10 py-3.5 last:border-b-0">
                <CheckCircle size={19} weight="fill" className="shrink-0 text-[#ff725b]" aria-hidden="true" />
                <span className="text-sm font-semibold text-white/82">{feature}</span>
              </div>
            ))}
          </div>

          <Link
            href={buildLocalizedHref(`/onboarding?plan=${creatorPro.slug}`, locale)}
            className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#ff5a3d] px-4 text-sm font-black text-white transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#ff725b] active:translate-y-px"
          >
            {creatorPro.ctaLabel}
          </Link>

          <details className="group mt-3 border-t border-white/10 pt-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-2 text-sm font-bold text-white/66 transition hover:text-white">
              {copy.more} ({additionalFeatures.length})
              <CaretDown size={18} className="shrink-0 transition duration-300 group-open:rotate-180" aria-hidden="true" />
            </summary>
            <ul className="space-y-2 pb-2 pt-3">
              {additionalFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-white/68">
                  <CheckCircle size={17} className="shrink-0 text-[#ff725b]" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </details>
        </article>

        <article className="flex flex-col rounded-[22px] border border-white/16 bg-white/[0.035] p-6 sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/48">{locale === "en" ? "Build your map" : "Crea tu mapa"}</p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-black tracking-tight text-white">{creator.name}</h2>
            <p className="text-right text-3xl font-black tracking-[-0.05em] text-white">
              {creatorPrice.amount}<span className="ml-1 text-sm font-bold tracking-normal text-white/60">{creatorPrice.suffix}</span>
            </p>
          </div>
          <p className="mt-2 text-sm text-white/52">{creatorPrice.detail}</p>
          <p className="mt-3 text-sm leading-6 text-white/62">{creator.description}</p>

          <div className="mt-7 flex-1 border-y border-white/10 py-1">
            {creator.features.map((feature) => (
              <div key={feature} className="flex items-center gap-3 border-b border-white/10 py-3.5 last:border-b-0">
                <CheckCircle size={19} className="shrink-0 text-white/58" aria-hidden="true" />
                <span className="text-sm font-semibold text-white/76">{feature}</span>
              </div>
            ))}
          </div>
          <Link
            href={buildLocalizedHref(`/onboarding?plan=${creator.slug}`, locale)}
            className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/22 px-4 text-sm font-black text-white transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#ff725b]/55 hover:bg-white/[0.06] active:translate-y-px"
          >
            {creator.ctaLabel}
          </Link>
        </article>

        <article className="flex flex-col border border-white/12 bg-white/[0.025] p-6 sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">{copy.freeEyebrow}</p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-black tracking-tight text-white">{free.name}</h2>
            <p className="text-3xl font-black tracking-[-0.05em] text-white">$0</p>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">{free.description}</p>

          <div className="mt-7 flex-1 border-y border-white/10 py-1">
            {free.features.slice(0, 3).map((feature) => (
              <div key={feature} className="flex items-center gap-3 border-b border-white/10 py-3.5 last:border-b-0">
                <CheckCircle size={19} className="shrink-0 text-white/46" aria-hidden="true" />
                <span className="text-sm font-semibold text-white/72">{feature}</span>
              </div>
            ))}
          </div>
          <Link
            href={buildLocalizedHref("/auth/viewer-register", locale)}
            className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/18 px-4 text-sm font-black text-white transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/[0.06] active:translate-y-px"
          >
            {free.ctaLabel}
          </Link>
        </article>

        <article className="md:col-span-2 lg:col-span-3">
          <div className="grid gap-5 border border-white/12 bg-white/[0.025] p-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:p-6">
            <Buildings size={30} className="text-white/52" aria-hidden="true" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">{copy.agencyLabel}</p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-white">{agency.name}</h2>
              <p className="mt-1 text-sm text-white/60">{agency.description}</p>
            </div>
            <ComingSoonButton
              featureId="agency_plan"
              surfaceId="pricing"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/18 px-5 text-sm font-black text-white/78 transition hover:bg-white/[0.06] active:translate-y-px"
            >
              {copy.soon}
            </ComingSoonButton>
          </div>
        </article>
      </div>

      <p className="mt-6 text-center text-sm text-white/50">{copy.trial}</p>
    </section>
  );
}
