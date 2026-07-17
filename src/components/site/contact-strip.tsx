import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";
import {
  ArrowUpRight,
  BehanceLogo,
  Clock,
  EnvelopeSimple,
  GlobeHemisphereWest,
  GlobeSimple,
  InstagramLogo,
  Lifebuoy,
  PaperPlaneTilt,
  XLogo,
  YoutubeLogo,
} from "@phosphor-icons/react/dist/ssr";
import { APP_EMAILS, type AppEmailKey } from "@/lib/app-emails";
import type { ByPupilaSocialPlatform } from "@/lib/brand-links";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface ContactStripProps {
  title?: string;
  description?: string;
  items?: Array<{ label: string; email: AppEmailKey }>;
  socialLinks?: ReadonlyArray<{ platform: ByPupilaSocialPlatform; href: string }>;
  tone?: "dark" | "light";
  compactOnMobile?: boolean;
  className?: string;
  locale?: Locale;
  variant?: "default" | "field-notes";
}

const defaultItems: Array<{ label: string; email: AppEmailKey }> = [
  { label: "General", email: "hello" },
  { label: "Marketing", email: "marketing" },
  { label: "Soporte", email: "support" },
];

const toneClasses: Record<NonNullable<ContactStripProps["tone"]>, string> = {
  dark: "border-white/10 bg-[#0c1014] text-white shadow-[0_28px_80px_-56px_rgba(0,0,0,0.95)]",
  light: "border-[#d7dce4] bg-white text-[#111827] shadow-[0_18px_40px_-28px_rgba(17,24,39,0.18)]",
};

const toneTextClasses: Record<NonNullable<ContactStripProps["tone"]>, string> = {
  dark: "text-white/60",
  light: "text-[#64748b]",
};

const toneButtonClasses: Record<NonNullable<ContactStripProps["tone"]>, string> = {
  dark: "border-white/10 bg-white/[0.035] text-white hover:bg-white/[0.07]",
  light: "border-[#d7dce4] bg-[#f8fafc] text-[#111827] hover:bg-white",
};

const socialIcons: Record<ByPupilaSocialPlatform, Icon> = {
  x: XLogo,
  youtube: YoutubeLogo,
  behance: BehanceLogo,
  instagram: InstagramLogo,
  website: GlobeSimple,
};

const socialLabels: Record<Locale, Record<ByPupilaSocialPlatform, string>> = {
  es: { x: "X", youtube: "YouTube", behance: "Behance", instagram: "Instagram", website: "Mi página web" },
  en: { x: "X", youtube: "YouTube", behance: "Behance", instagram: "Instagram", website: "My website" },
};

function FieldNotesContact({
  title,
  items,
  socialLinks,
  locale,
  className,
}: Required<Pick<ContactStripProps, "title" | "items" | "locale">> & Pick<ContactStripProps, "description" | "socialLinks" | "className">) {
  const details: Record<string, { text: string; icon: Icon }> = locale === "en"
    ? {
        General: { text: "General enquiries and press", icon: EnvelopeSimple },
        Marketing: { text: "Partnerships and collaborations", icon: PaperPlaneTilt },
        Support: { text: "Help and technical support", icon: Lifebuoy },
      }
    : {
        General: { text: "Consultas generales y prensa", icon: EnvelopeSimple },
        Marketing: { text: "Alianzas y colaboraciones", icon: PaperPlaneTilt },
        Soporte: { text: "Ayuda y soporte técnico", icon: Lifebuoy },
      };

  const footerSocialLinks = socialLinks?.filter((link) => link.platform !== "youtube");
  const footerSocialLabels: Record<Locale, Partial<Record<ByPupilaSocialPlatform, string>>> = {
    es: { x: "X (Twitter)", behance: "Behance", instagram: "Instagram", website: "Mi mapa" },
    en: { x: "X (Twitter)", behance: "Behance", instagram: "Instagram", website: "My map" },
  };
  return (
    <section className={cn("relative isolate overflow-hidden rounded-[28px] border border-white/[0.18] bg-[#0b1013] text-[#f3eee7] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_32px_88px_-58px_rgba(0,0,0,0.98)]", className)}>
      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-[64%] bg-[url('/images/landing/contact-topography.png')] bg-cover bg-[center_58%] opacity-[0.52] mix-blend-screen [mask-image:linear-gradient(90deg,black_0%,black_76%,transparent_100%)]" />

      <div className="relative grid min-w-0 lg:min-h-[500px] lg:grid-cols-[51%_49%]">
        <div className="relative min-w-0 px-6 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-10 lg:px-16 lg:pb-12 lg:pt-[58px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.27em] text-[#ff654f] lg:text-[12px]">{title}</p>
          <h2 className="mt-6 max-w-[14ch] text-[38px] font-extrabold leading-[1.04] tracking-[-0.05em] text-[#f3eee7] sm:text-[50px] lg:mt-8 lg:max-w-[13ch] lg:text-[56px]">
            {locale === "en" ? (
              <><span className="block">The shortest route</span><span className="block">to talk<span className="text-[#ff5a3d]">.</span></span></>
            ) : (
              <><span className="block">El camino más corto</span><span className="block">para hablar<span className="text-[#ff5a3d]">.</span></span></>
            )}
          </h2>
          <p className="mt-7 max-w-[42ch] text-[15px] leading-7 text-white/61 sm:text-[16px] lg:max-w-[40ch] lg:text-[17px] lg:leading-8">
            {locale === "en" ? "Choose your destination and we’ll connect you with the right person. Real replies, no detours." : "Elige tu destino y te conectamos con la persona adecuada. Respuestas reales, sin desvíos."}
          </p>
          <p className="mt-10 inline-flex items-center gap-3 text-[14px] font-medium text-white/58 sm:text-[15px] lg:absolute lg:bottom-12 lg:left-16 lg:mt-0">
            <PaperPlaneTilt size={19} weight="regular" className="shrink-0 text-[#ff654f]" aria-hidden="true" />
            <span>{locale === "en" ? "We reply in " : "Respondemos en "}<strong className="font-bold text-[#ff654f]">{locale === "en" ? "under 24h" : "menos de 24h"}</strong></span>
          </p>
        </div>

        <div className="relative grid border-t border-white/10 lg:grid-rows-3 lg:border-l lg:border-t-0">
          {items.map((item, index) => {
            const detail = details[item.label] ?? { text: locale === "en" ? "Direct contact" : "Contacto directo", icon: EnvelopeSimple };
            const ItemIcon = detail.icon;
            const email = APP_EMAILS[item.email];
            const helperText = index === 0
              ? (locale === "en" ? "We reply in under 24h" : "Respondemos en menos de 24h")
              : detail.text;
            return (
              <a
                key={item.email}
                href={`mailto:${email}`}
                className="group grid min-w-0 grid-cols-[46px_1fr] items-center gap-x-4 border-b border-white/10 px-6 py-6 transition duration-300 ease-out last:border-b-0 hover:bg-white/[0.025] active:scale-[0.99] sm:grid-cols-[54px_64px_1fr] sm:px-8 lg:grid-cols-[58px_78px_1fr] lg:px-12 lg:py-5"
              >
                <span className="font-mono text-[19px] font-medium tracking-[-0.05em] text-[#ff5a3d] sm:text-[24px] lg:text-[27px]">{String(index + 1).padStart(2, "0")}</span>
                <span className="hidden h-[54px] w-[54px] items-center justify-center rounded-full border border-white/30 bg-white/[0.025] text-[#ff654f] transition duration-300 group-hover:border-[#ff654f]/60 sm:flex lg:h-[62px] lg:w-[62px]">
                  <ItemIcon size={29} weight="regular" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.24em] text-[#f3eee7] lg:text-[12px]">{item.label}</span>
                  <span className="mt-2 block truncate text-[14px] font-medium text-white/62 sm:text-[16px] lg:text-[17px]">{email}</span>
                  <span className="mt-1.5 flex items-center gap-2 text-[12px] leading-5 text-white/46 lg:text-[13px]">
                    {index === 0 ? <Clock size={14} weight="bold" aria-hidden="true" /> : null}
                    {helperText}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </div>

      <div className="relative flex min-h-[120px] flex-col gap-6 border-t border-white/15 px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:gap-12 lg:px-16 lg:py-5">
        <Link href={locale === "en" ? "/?lang=en" : "/"} aria-label="TravelYourMap — BY PUPILA" className="group inline-flex w-fit shrink-0 items-center gap-3 transition duration-300 active:scale-[0.98]">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#ff6258]/35 bg-[radial-gradient(circle_at_35%_25%,#2a2424,#111417_70%)] text-[#ff5147] shadow-[0_10px_28px_-14px_rgba(255,71,59,0.8),inset_0_1px_0_rgba(255,255,255,0.12)] transition-transform duration-300 group-hover:-rotate-[8deg] group-hover:scale-105">
            <GlobeHemisphereWest size={20} weight="fill" aria-hidden="true" />
          </span>
          <span className="text-left leading-none">
            <span className="mb-[5px] block whitespace-nowrap text-[12px] font-extrabold uppercase tracking-[0.08em] text-white">TravelYourMap</span>
            <span className="block text-[8px] font-bold uppercase tracking-[0.26em] text-white/48">BY PUPILA</span>
          </span>
        </Link>
        {footerSocialLinks?.length ? (
          <div className="flex min-w-0 flex-1 flex-col gap-4 lg:flex-row lg:items-center lg:gap-10">
            <p className="shrink-0 text-[10px] font-bold uppercase tracking-[0.24em] text-[#ff654f] lg:text-[11px]">{locale === "en" ? "Follow us" : "Síguenos en"}</p>
            <nav aria-label={locale === "en" ? "BY PUPILA social media" : "Redes sociales de BY PUPILA"} className="flex flex-wrap items-center gap-x-5 gap-y-3 lg:gap-x-0">
            {footerSocialLinks.map((link, index) => {
              return (
                <span key={link.platform} className="contents">
                  {index > 0 ? <span aria-hidden="true" className="hidden px-5 text-[10px] text-white/34 lg:inline">•</span> : null}
                  <a href={link.href} target="_blank" rel="noreferrer" className="group inline-flex min-h-7 items-center gap-3 text-[12px] font-medium text-white/59 transition hover:text-[#f3eee7] active:scale-[0.98] lg:text-[13px]">
                    {footerSocialLabels[locale][link.platform] ?? socialLabels[locale][link.platform]}
                    <ArrowUpRight size={14} weight="bold" className="text-[#ff654f] transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </a>
                </span>
              );
            })}
            </nav>
          </div>
        ) : <span />}
      </div>
    </section>
  );
}

export function ContactStrip({
  title = "Contacto",
  description,
  items = defaultItems,
  socialLinks,
  tone = "dark",
  compactOnMobile = false,
  className,
  locale = "es",
  variant = "default",
}: ContactStripProps) {
  const resolvedItems = items.length > 0 ? items : defaultItems;

  if (variant === "field-notes" && tone === "dark") {
    return <FieldNotesContact title={title} description={description} items={resolvedItems} socialLinks={socialLinks} locale={locale} className={className} />;
  }

  const detailByLabel: Record<string, string> = locale === "en"
    ? { General: "Business proposals", Marketing: "Platform partnerships", Soporte: "General questions", Support: "General questions" }
    : { General: "Propuestas de negocios", Marketing: "problemas en la plataforma", Soporte: "Preguntas generales", Support: "Preguntas generales" };

  return (
    <section className={cn(
      "relative mt-8 overflow-hidden rounded-[28px] border p-6 sm:p-7 lg:p-8",
      compactOnMobile && "max-sm:mt-5 max-sm:rounded-[22px] max-sm:p-4",
      toneClasses[tone],
      className
    )}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,90,61,0.16),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.05),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />
      <div className={cn("relative grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end", compactOnMobile && "max-sm:gap-4")}>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#ff5a3d]">{title}</p>
          <h2 className={cn("mt-3 max-w-[12ch] text-[34px] font-extrabold leading-[1.02] tracking-[-0.05em] sm:text-[42px]", compactOnMobile && "max-sm:mt-2 max-sm:text-[28px]", tone === "dark" ? "text-white" : "text-[#111827]")}>
            {locale === "en" ? "Let's talk directly." : "Hablemos directo."}
          </h2>
          {description ? <p className={cn("mt-4 max-w-[58ch] text-sm leading-6 sm:text-[15px] sm:leading-7", compactOnMobile && "max-sm:mt-3", toneTextClasses[tone])}>{description}</p> : null}
        </div>
        <div className={cn("grid gap-3 sm:grid-cols-3 lg:justify-self-end", compactOnMobile && "max-sm:gap-2")}>
          {resolvedItems.map((item) => {
            const email = APP_EMAILS[item.email];
            return (
              <a
                key={item.email}
                href={`mailto:${email}`}
                className={cn(
                  "group flex min-h-[84px] flex-col justify-between rounded-[18px] border px-4 py-4 text-left transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
                  compactOnMobile && "max-sm:min-h-[68px] max-sm:px-3 max-sm:py-2.5",
                  toneButtonClasses[tone]
                )}
              >
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#ff5a3d]">
                  <EnvelopeSimple size={15} weight="bold" />
                  {item.label}
                </span>
                <span className={cn("text-[12px] font-medium tracking-normal", tone === "dark" ? "text-white/88" : "text-[#111827]")}>
                  {email}
                </span>
                <span className={cn("text-[11px] leading-5", toneTextClasses[tone])}>{detailByLabel[item.label] ?? (locale === "en" ? "Direct contact" : "Contacto directo")}</span>
              </a>
            );
          })}
        </div>
      </div>
      {socialLinks?.length ? <div className="relative mt-7 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between"><p className={cn("text-[11px] font-bold uppercase tracking-[0.22em]", tone === "dark" ? "text-white/55" : "text-[#64748b]")}>{locale === "en" ? "Social media" : "Redes sociales"}</p><nav aria-label={locale === "en" ? "BY PUPILA social media" : "Redes sociales de BY PUPILA"} className="flex flex-wrap gap-2">{socialLinks.map((link) => { const SocialIcon = socialIcons[link.platform]; return <a key={link.platform} href={link.href} target="_blank" rel="noreferrer" className={cn("inline-flex min-h-9 items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] font-bold transition hover:-translate-y-0.5", toneButtonClasses[tone])}><SocialIcon size={15} weight="bold" aria-hidden="true" />{socialLabels[locale][link.platform]}</a>; })}</nav></div> : null}
    </section>
  );
}
