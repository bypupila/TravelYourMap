"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CaretDown,
  MapPin,
  MapTrifold,
  ShareNetwork,
  YoutubeLogo,
  type Icon,
} from "@phosphor-icons/react";
import { useState } from "react";

export type HowItWorksStep = {
  title: string;
  description: string;
};

export type HowItWorksContent = {
  eyebrow: string;
  titleLead: string;
  titleMiddle: string;
  titleAccent: string;
  description: string;
  steps: HowItWorksStep[];
};

const STEP_ICONS: Icon[] = [YoutubeLogo, MapPin, MapTrifold, ShareNetwork];

export function HowItWorksSection({ content }: { content: HowItWorksContent }) {
  const [activeStep, setActiveStep] = useState(0);
  const reduceMotion = useReducedMotion();
  const currentStep = String(activeStep + 1).padStart(2, "0");

  return (
    <section id="how-it-works" className="scroll-mt-24 border-b border-white/[0.08] py-12 sm:py-16 lg:py-20" aria-labelledby="how-it-works-title">
      <div data-testid="how-it-works-panel" className="grid w-full overflow-hidden rounded-[28px] border border-white/[0.13] bg-[#0a0e12] shadow-[0_36px_90px_-54px_rgba(0,0,0,0.96),inset_0_1px_0_rgba(255,255,255,0.035)] lg:min-h-[720px] lg:grid-cols-[47.5%_52.5%] xl:min-h-[748px] xl:rounded-[34px]">
        <div className="relative overflow-hidden border-b border-white/[0.1] px-6 py-10 sm:px-10 sm:py-14 lg:border-b-0 lg:border-r lg:px-[clamp(48px,4.7vw,74px)] lg:pb-[clamp(62px,5vw,82px)] lg:pt-[clamp(160px,12.5vw,194px)]">
          <div aria-hidden="true" className="absolute inset-0 bg-[url('/images/landing/contact-topography.png')] bg-cover bg-[center_54%] opacity-[0.72]" />
          <div aria-hidden="true" className="absolute inset-0 bg-[#080c10]/30" />

          <div className="relative flex h-full flex-col">
            <div>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.34em] text-[#ff5147] sm:text-[13px]">
                {content.eyebrow}
              </p>
              <h2
                id="how-it-works-title"
                className="mt-7 max-w-[12ch] text-[42px] font-extrabold leading-[1.06] tracking-[-0.06em] text-[#f5f2ed] sm:text-[52px] lg:text-[58px] xl:text-[60px]"
              >
                {content.titleLead}<br />
                {content.titleMiddle} {content.titleAccent}<span className="text-[#ff5147]">.</span>
              </h2>
              <p className="mt-7 max-w-[35ch] text-[16px] leading-[1.7] text-white/62 sm:text-[18px] lg:mt-8">
                {content.description}
              </p>
            </div>

            <div className="mt-12 lg:mt-auto" aria-label={`${currentStep} / 04`}>
              <p className="flex items-baseline gap-3 font-mono">
                <span className="text-[42px] font-semibold leading-none tracking-[-0.07em] text-[#ff5147] sm:text-[48px]">{currentStep}</span>
                <span className="text-[22px] tracking-[-0.05em] text-white/56">/ 04</span>
              </p>
              <div className="mt-5 grid max-w-[310px] grid-cols-4 gap-2" aria-hidden="true">
                {content.steps.map((step, index) => (
                  <span key={step.title} className="h-[6px] overflow-hidden bg-white/[0.16]">
                    <motion.span
                      className="block h-full origin-left bg-[#ff5147]"
                      initial={false}
                      animate={{ scaleX: index === activeStep ? 1 : 0 }}
                      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 100, damping: 20 }}
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col bg-[#090d10]">
          {content.steps.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? MapPin;
            const isActive = activeStep === index;
            const panelId = `how-step-panel-${index}`;
            const triggerId = `how-step-trigger-${index}`;

            return (
              <motion.div
                layout={!reduceMotion}
                key={step.title}
                className={`group flex min-h-[96px] flex-col border-white/[0.11] first:border-t-0 [&:not(:first-child)]:border-t ${isActive ? "lg:flex-[2.2]" : "lg:flex-1"}`}
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 100, damping: 20 }}
              >
                <button
                  id={triggerId}
                  type="button"
                  className={`grid min-h-[96px] w-full grid-cols-[42px_52px_minmax(0,1fr)_24px] items-center gap-3 px-5 py-5 text-left transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/[0.025] active:scale-[0.995] sm:grid-cols-[58px_68px_minmax(0,1fr)_28px] sm:gap-5 sm:px-8 lg:min-h-[126px] lg:grid-cols-[64px_84px_minmax(0,1fr)_30px] lg:gap-6 lg:px-[clamp(34px,3.8vw,60px)] ${isActive ? "lg:pb-4 lg:pt-10" : "lg:py-7"}`}
                  onClick={() => setActiveStep(index)}
                  aria-expanded={isActive}
                  aria-controls={panelId}
                >
                  <span className="font-mono text-[24px] font-semibold leading-none tracking-[-0.06em] text-[#ff5147] sm:text-[29px] lg:text-[32px]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="grid h-[52px] w-[52px] place-items-center rounded-full border border-white/[0.18] text-[#ff5147] sm:h-[66px] sm:w-[66px] lg:h-[76px] lg:w-[76px]" aria-hidden="true">
                    <Icon size={32} weight={index === 0 ? "fill" : "regular"} />
                  </span>
                  <span className="min-w-0 text-[19px] font-bold leading-tight tracking-[-0.035em] text-[#f5f2ed] sm:text-[23px] lg:text-[26px]">
                    {step.title}
                  </span>
                  <CaretDown
                    size={24}
                    weight="bold"
                    className={`text-white/58 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isActive ? "rotate-180 text-[#ff5147]" : "rotate-0"}`}
                    aria-hidden="true"
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isActive ? (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      key="content"
                      initial={reduceMotion ? false : { opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 100, damping: 20 }}
                      className="px-5 pb-7 sm:pl-[174px] sm:pr-12 lg:pl-[clamp(182px,13.1vw,210px)] lg:pr-[clamp(48px,5vw,78px)] lg:pb-10 lg:pt-3"
                    >
                      <p className="max-w-[34ch] text-[16px] leading-[1.65] text-white/62 sm:text-[18px] lg:text-[20px]">
                        {step.description}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
