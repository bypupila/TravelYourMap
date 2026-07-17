import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChartBar,
  CheckSquare,
  GlobeHemisphereWest,
  MapPin,
  PlayCircle,
  ShieldCheck,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";

import { buildLocalizedHref, type Locale } from "@/lib/i18n";

const HERO_IMAGE = "/creators/homepage-demo.png";

const mediaKitCopy = {
  es: {
    title: "Historias que mueven marcas",
    kit: "Media kit",
    channel: "Canal demo",
    credibility: "Credibilidad",
    metrics: [
      { value: "450K+", label: "Comunidad" },
      { value: "25M+", label: "Vistas totales" },
      { value: "8%+", label: "Engagement" },
    ],
    safety: "Marca segura",
    safetyTitle: "Contenido responsable",
    safetyBody: "Ambiente seguro para tu marca",
    collaborate: "Colaborar",
    values: ["Viajes reales", "Contenido honesto", "Audiencia global"],
    imageAlt: "Creador de viajes contemplando una región montañosa durante el atardecer",
  },
  en: {
    title: "Stories that move brands",
    kit: "Media kit",
    channel: "Demo channel",
    credibility: "Credibility",
    metrics: [
      { value: "450K+", label: "Community" },
      { value: "25M+", label: "Total views" },
      { value: "8%+", label: "Engagement" },
    ],
    safety: "Brand safe",
    safetyTitle: "Responsible content",
    safetyBody: "A safe environment for your brand",
    collaborate: "Collaborate",
    values: ["Real journeys", "Honest content", "Global audience"],
    imageAlt: "Travel creator overlooking a mountainous region at sunset",
  },
} as const;

const metricIcons = [UsersThree, PlayCircle, ChartBar] as const;
const valueIcons = [MapPin, CheckSquare, GlobeHemisphereWest] as const;

export function DemoChannelShowcase({ locale }: { locale: Locale }) {
  const copy = mediaKitCopy[locale];

  return (
    <section id="examples" className="py-10 lg:py-14" aria-labelledby="media-kit-title">
      <div className="mx-auto grid w-full max-w-[1400px] overflow-hidden rounded-[28px] border border-white/[0.11] bg-[#0a0e12] shadow-[0_34px_100px_-58px_rgba(0,0,0,0.96),inset_0_1px_0_rgba(255,255,255,0.04)] lg:h-[min(650px,calc(100dvh-120px))] lg:min-h-[600px] lg:grid-cols-[1.54fr_1fr]">
        <div className="relative min-h-[560px] overflow-hidden lg:min-h-0">
          <Image
            src={HERO_IMAGE}
            alt={copy.imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 860px"
            className="object-cover object-[46%_center]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,13,0.02)_26%,rgba(7,10,13,0.22)_48%,rgba(7,10,13,0.94)_100%)]" />

          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-[clamp(28px,3vw,46px)]">
            <h2
              id="media-kit-title"
              className="max-w-[10ch] text-[44px] font-extrabold leading-[0.95] tracking-[-0.065em] text-[#f5f2ed] sm:text-[58px] lg:text-[clamp(46px,4.6vw,68px)]"
            >
              {copy.title}
            </h2>

            <ul className="mt-6 grid gap-3 sm:grid-cols-3 lg:mt-[clamp(18px,2.5vh,26px)]">
              {copy.values.map((value, index) => {
                const Icon = valueIcons[index];
                return (
                  <li
                    key={value}
                    className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-[12px] border border-white/[0.11] bg-[#101419]/78 px-3 py-2.5 text-[12px] font-medium text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl lg:text-[13px]"
                  >
                    <Icon size={18} weight="regular" className="shrink-0 text-white/52" aria-hidden="true" />
                    {value}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <aside className="flex min-h-[560px] flex-col bg-[#090d10] p-7 sm:p-10 lg:min-h-0 lg:p-[clamp(30px,3vw,46px)]" aria-label={copy.kit}>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-[#ff5147]">{copy.kit}</p>
            <h3 className="mt-3 text-[38px] font-extrabold leading-none tracking-[-0.055em] text-[#f5f2ed] lg:text-[clamp(36px,3vw,46px)]">{copy.channel}</h3>
          </div>

          <div className="mt-[clamp(24px,3vh,34px)] border-t border-white/[0.08] pt-[clamp(22px,3vh,30px)]">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.26em] text-white/48 lg:text-[11px]">{copy.credibility}</p>
            <dl className="mt-5 grid grid-cols-3 gap-3">
              {copy.metrics.map((metric, index) => {
                const Icon = metricIcons[index];
                return (
                  <div key={metric.label} className="min-w-0">
                    <Icon size={27} weight="regular" className="text-white/52" aria-hidden="true" />
                    <dd className="mt-3 font-mono text-[28px] font-bold leading-none tracking-[-0.05em] text-[#ff5147] lg:text-[clamp(27px,2.35vw,36px)]">{metric.value}</dd>
                    <dt className="mt-2.5 text-[11px] leading-tight text-white/52 lg:text-[13px]">{metric.label}</dt>
                  </div>
                );
              })}
            </dl>
          </div>

          <div className="mt-[clamp(26px,4vh,40px)] border-t border-white/[0.08] pt-[clamp(22px,3vh,30px)]">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.26em] text-white/48 lg:text-[11px]">{copy.safety}</p>
            <div className="mt-4 flex items-center gap-4">
              <ShieldCheck size={42} weight="regular" className="shrink-0 text-[#ff5147]" aria-hidden="true" />
              <div className="text-[12px] leading-5 text-white/52 lg:text-[13px]">
                <p className="font-medium text-white/82">{copy.safetyTitle}</p>
                <p>{copy.safetyBody}</p>
              </div>
            </div>

            <Link
              href={buildLocalizedHref("/onboarding", locale)}
              className="group mt-5 grid min-h-13 grid-cols-[1fr_52px] items-center overflow-hidden rounded-full bg-[#ff5147] text-[14px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ff5d54] active:translate-y-0 active:scale-[0.98]"
            >
              <span className="pl-[54px] text-center">{copy.collaborate}</span>
              <span className="grid h-full place-items-center border-l border-white/[0.13]" aria-hidden="true">
                <ArrowRight size={19} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
