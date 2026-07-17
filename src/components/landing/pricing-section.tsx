"use client";

import { useId, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle,
  Eye,
  MapTrifold,
  PencilSimple,
  SealCheck,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { ComingSoonButton } from "@/components/site/coming-soon-button";
import { buildLocalizedHref, type Locale } from "@/lib/i18n";
import { getLocalizedPlan, PLAN_DEFINITIONS } from "@/lib/plans";

type BillingCycle = "monthly" | "annual";

type PricingSectionProps = {
  locale: Locale;
};

const DEFAULT_ANNUAL_DISCOUNT = 0.2;

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

function getBillingAmount(monthlyPrice: number, billingCycle: BillingCycle, annualDiscount: number, locale: Locale) {
  if (billingCycle === "monthly") {
    return {
      price: monthlyPrice,
      suffix: locale === "en" ? "/mo" : "/mes",
      accessibleLabel: locale === "en" ? `${formatMoney(monthlyPrice)} per month` : `${formatMoney(monthlyPrice)} por mes`,
    };
  }

  const discountedYearly = monthlyPrice * 12 * (1 - annualDiscount);
  return {
    price: discountedYearly,
    suffix: locale === "en" ? "/yr" : "/año",
    accessibleLabel: locale === "en" ? `${formatMoney(discountedYearly)} per year` : `${formatMoney(discountedYearly)} por año`,
  };
}

function FeatureRows({ rows, muted = false }: { rows: string[]; muted?: boolean }) {
  return (
    <ul className="divide-y divide-white/[0.12] border-y border-white/[0.12]">
      {rows.map((row) => (
        <li key={row} className="flex min-h-12 items-center gap-3 py-3 text-[15px] font-medium text-[#f3eee7]/78 sm:text-[16px] lg:min-h-10 lg:py-2 lg:text-[15px]">
          <CheckCircle size={24} weight="regular" className={`${muted ? "text-[#f3eee7]/52" : "text-[#ff5a3d]"} size-6 shrink-0 lg:size-5`} aria-hidden="true" />
          <span>{row}</span>
        </li>
      ))}
    </ul>
  );
}

export function PricingSection({ locale }: PricingSectionProps) {
  const billingCycleLabelId = useId();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const creatorPro = getLocalizedPlan(PLAN_DEFINITIONS.find((plan) => plan.slug === "creator_pro")!, locale);
  const agency = getLocalizedPlan(PLAN_DEFINITIONS.find((plan) => plan.slug === "agency")!, locale);
  const creatorPrice = getBillingAmount(creatorPro.monthlyPrice, billingCycle, DEFAULT_ANNUAL_DISCOUNT, locale);
  const agencyPrice = getBillingAmount(agency.monthlyPrice, billingCycle, DEFAULT_ANNUAL_DISCOUNT, locale);

  const copy = locale === "en"
    ? {
        title: "Choose how to experience TravelYourMap",
        viewerLane: "To explore",
        creatorLane: "To create",
        viewerDescription: "For viewing creator maps",
        viewerCta: "Explore maps",
        audienceLine: "Audience access.",
        audienceValueLead: "Brands buy ",
        audienceValueAccent: "destinations",
        audienceValueEnd: ", not just views.",
        monthly: "Monthly",
        annual: "Annual",
        comingSoon: "Coming soon",
      }
    : {
        title: "Elige cómo vivir TravelYourMap",
        viewerLane: "Para mirar",
        creatorLane: "Para crear",
        viewerDescription: "Para ver mapas de creadores",
        viewerCta: "Explorar mapas",
        audienceLine: "Acceso para audiencias.",
        audienceValueLead: "Las marcas compran ",
        audienceValueAccent: "destinos",
        audienceValueEnd: ", no solo views.",
        monthly: "Mensual",
        annual: "Anual",
        comingSoon: "Próximamente",
      };

  return (
    <section id="pricing" className="relative isolate overflow-hidden border-t border-white/[0.07] py-14 sm:py-16 lg:py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[url('/images/landing/contact-topography.png')] bg-cover bg-[center_45%] opacity-[0.09] mix-blend-screen" />

      <h2 className="mx-auto max-w-[980px] text-center text-[38px] font-extrabold leading-[1.02] tracking-[-0.045em] text-[#f3eee7] sm:text-[48px] lg:text-[48px]">
        {copy.title}
      </h2>

      <div className="mt-12 grid min-w-0 lg:mt-10 lg:grid-cols-[31%_69%]">
        <div className="min-w-0 border-white/25 lg:border-r lg:pr-8">
          <div className="relative border-b border-white/20 pb-5 lg:pb-4">
            <span aria-hidden="true" className="absolute bottom-[-1px] left-0 h-[3px] w-[44%] bg-[#ff5a3d]" />
            <p className="flex items-center gap-4 text-[18px] font-extrabold text-[#ff5a3d] sm:text-[20px] lg:text-[18px]">
              <Eye size={29} weight="regular" aria-hidden="true" />
              {copy.viewerLane}
            </p>
          </div>

          <article className="relative mt-8 flex min-h-[518px] flex-col overflow-hidden rounded-[16px] border border-white/[0.19] bg-[#0b1013]/88 px-7 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:px-9 sm:py-10 lg:mt-5 lg:min-h-[414px] lg:px-7 lg:py-6">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url('/images/landing/contact-topography.png')] bg-cover bg-center opacity-[0.1] mix-blend-screen" />
            <div className="relative flex h-full flex-1 flex-col">
              <div className="flex items-center gap-4 border-b border-white/20 pb-7 lg:pb-5">
                <MapTrifold size={45} weight="regular" className="size-[45px] text-[#f3eee7] lg:size-9" aria-hidden="true" />
                <h3 className="text-[25px] font-extrabold text-[#f3eee7] sm:text-[28px] lg:text-[24px]">Viewer</h3>
              </div>

              <div className="mt-7 lg:mt-5">
                <p className="text-[76px] font-extrabold leading-none tracking-[-0.065em] text-[#f3eee7] sm:text-[84px] lg:text-[68px]">$0</p>
                <p className="mt-3 text-[22px] font-extrabold text-[#ff5a3d] lg:mt-2 lg:text-[19px]">{locale === "en" ? "Free" : "Gratis"}</p>
                <p className="mt-5 max-w-[28ch] text-[15px] font-medium leading-7 text-[#f3eee7]/78 sm:text-[17px] lg:mt-4 lg:text-[15px] lg:leading-6">{copy.viewerDescription}</p>
              </div>

              <Link href={buildLocalizedHref("/explore", locale)} className="mt-auto inline-flex min-h-16 w-full items-center justify-center rounded-[8px] border border-white/42 px-6 text-[16px] font-extrabold text-[#f3eee7] transition duration-300 ease-out hover:border-[#ff5a3d]/65 hover:bg-white/[0.035] active:scale-[0.98] lg:min-h-14 lg:text-[15px]">
                {copy.viewerCta}
              </Link>
            </div>
          </article>

          <div className="mt-8 grid grid-cols-[46px_1fr] items-start gap-5 pb-3 lg:mt-5 lg:grid-cols-[36px_1fr] lg:gap-4 lg:pb-0">
            <UsersThree size={42} weight="regular" className="size-[42px] text-[#f3eee7] lg:size-9" aria-hidden="true" />
            <p className="text-[14px] font-medium leading-6 text-[#f3eee7]/67 sm:text-[15px]">
              <span className="block text-[#f3eee7]/82">{copy.audienceLine}</span>
              {copy.audienceValueLead}<strong className="font-extrabold text-[#ff5a3d]">{copy.audienceValueAccent}</strong>{copy.audienceValueEnd}
            </p>
          </div>
        </div>

        <div className="min-w-0 pt-12 lg:pl-8 lg:pt-0">
          <div className="relative border-b border-white/20 pb-5 lg:pb-4">
            <span aria-hidden="true" className="absolute bottom-[-1px] left-0 h-[3px] w-[28%] bg-[#ff5a3d]" />
            <p className="flex items-center gap-4 text-[18px] font-extrabold text-[#ff5a3d] sm:text-[20px] lg:text-[18px]">
              <PencilSimple size={29} weight="regular" aria-hidden="true" />
              {copy.creatorLane}
            </p>
          </div>

          <div className="relative mt-8 grid min-h-[654px] min-w-0 gap-8 overflow-hidden rounded-[18px] border border-white/[0.19] bg-[#0b1013]/84 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-8 lg:mt-5 lg:min-h-[500px] lg:grid-cols-[1.25fr_0.95fr] lg:gap-7 lg:p-6">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url('/images/landing/contact-topography.png')] bg-cover bg-[center_36%] opacity-[0.08] mix-blend-screen" />

            <article className="relative flex min-w-0 flex-col">
              <div className="flex items-center gap-4">
                <SealCheck size={37} weight="regular" className="size-[37px] text-[#ff5a3d] lg:size-8" aria-hidden="true" />
                <h3 className="text-[25px] font-extrabold text-[#f3eee7] sm:text-[28px] lg:text-[24px]">{creatorPro.name}</h3>
              </div>

              <div className="mt-8 flex flex-wrap items-end gap-x-4 gap-y-5 lg:mt-5">
                <p aria-label={creatorPrice.accessibleLabel} className="text-[72px] font-extrabold leading-none tracking-[-0.065em] text-[#f3eee7] sm:text-[84px] lg:text-[72px]">
                  {formatMoney(creatorPrice.price)}
                </p>
                <span className="pb-2 text-[20px] font-medium text-[#f3eee7]/84 sm:text-[22px] lg:text-[18px]">{creatorPrice.suffix}</span>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-5 lg:mt-5 lg:gap-4">
                <div aria-label={locale === "en" ? "Billing cycle" : "Ciclo de facturación"} role="tablist" className="grid w-full max-w-[282px] grid-cols-2 rounded-full border border-white/48 bg-[#0b1013] p-1 text-[15px] font-extrabold">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={billingCycle === "monthly"}
                    aria-controls={billingCycleLabelId}
                    onClick={() => setBillingCycle("monthly")}
                    className={`min-h-11 rounded-full px-5 transition duration-300 ease-out active:scale-[0.98] lg:min-h-10 ${billingCycle === "monthly" ? "bg-[#ff5a3d] text-white" : "text-[#f3eee7] hover:bg-white/[0.045]"}`}
                  >
                    {copy.monthly}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={billingCycle === "annual"}
                    aria-controls={billingCycleLabelId}
                    onClick={() => setBillingCycle("annual")}
                    className={`min-h-11 rounded-full px-5 transition duration-300 ease-out active:scale-[0.98] lg:min-h-10 ${billingCycle === "annual" ? "bg-[#ff5a3d] text-white" : "text-[#f3eee7] hover:bg-white/[0.045]"}`}
                  >
                    {copy.annual}
                  </button>
                </div>
                <p id={billingCycleLabelId} className="text-[15px] font-medium text-[#f3eee7]/50">-20% real</p>
              </div>

              <div className="mt-8 lg:mt-5">
                <FeatureRows rows={creatorPro.features} />
              </div>

              <Link href={buildLocalizedHref(`/onboarding?plan=${creatorPro.slug}`, locale)} className="mt-auto inline-flex min-h-[72px] w-full items-center justify-center rounded-[8px] bg-[#ff5a3d] px-6 text-[17px] font-extrabold text-white transition duration-300 ease-out hover:bg-[#ff684f] active:scale-[0.98] lg:min-h-14 lg:text-[15px]">
                {creatorPro.ctaLabel}
              </Link>
            </article>

            <article className="relative flex min-w-0 flex-col rounded-[14px] border border-white/[0.12] bg-[#0b1013]/66 px-6 py-7 sm:px-8 sm:py-8 lg:px-6 lg:py-6">
              <div className="flex items-center gap-4 border-b border-white/[0.16] pb-7 lg:pb-5">
                <Briefcase size={34} weight="regular" className="text-[#f3eee7]/57" aria-hidden="true" />
                <h3 className="text-[24px] font-extrabold text-[#f3eee7] sm:text-[27px] lg:text-[24px]">{agency.name}</h3>
              </div>

              <div className="mt-8 flex flex-wrap items-end gap-x-3 gap-y-3 lg:mt-5">
                <p aria-label={agencyPrice.accessibleLabel} className="text-[65px] font-extrabold leading-none tracking-[-0.06em] text-[#f3eee7] sm:text-[72px] lg:text-[60px]">
                  {formatMoney(agencyPrice.price)}
                </p>
                <span className="pb-1.5 text-[18px] font-medium text-[#f3eee7]/80 sm:text-[20px] lg:text-[17px]">{agencyPrice.suffix}</span>
              </div>

              <div className="mt-7 lg:mt-5">
                <FeatureRows rows={agency.features} muted />
              </div>

              <ComingSoonButton
                featureId="agency_plan"
                surfaceId="landing_pricing"
                className="mt-auto inline-flex min-h-16 w-full items-center justify-center rounded-[8px] border border-white/25 px-6 text-[16px] font-extrabold text-[#f3eee7]/55 transition duration-300 ease-out hover:border-white/40 hover:text-[#f3eee7]/75 active:scale-[0.98] lg:min-h-14 lg:text-[15px]"
              >
                {copy.comingSoon}
              </ComingSoonButton>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
