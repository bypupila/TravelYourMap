"use client";

import Link from "next/link";
import { AirplaneTilt, ArrowLeft, ChartLineUp, Check, CreditCard, Handshake, MapPin, UploadSimple, UsersThree, YoutubeLogo } from "@phosphor-icons/react";
import posthog from "posthog-js";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FloatingTopBar } from "@/components/design-system/chrome";
import { YoutubeImportStep, type ChannelDraft } from "@/components/onboarding/youtube-import-step";
import { useComingSoon } from "@/components/site/coming-soon-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_ANALYTICS, DEMO_CHANNEL, DEMO_CHANNEL_SLUG, DEMO_USER, DEMO_VIDEO_LOCATIONS } from "@/lib/demo-data";
import { getLocalizedPlan, PLAN_DEFINITIONS, resolveCanonicalPlanSlug, resolveCheckoutPlanSlug } from "@/lib/plans";
import { buildLocalizedHref } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import type { ChannelAnalytics } from "@/lib/analytics";

type OnboardingStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type OnboardingLocale = "es" | "en";
type ActivationState = "idle" | "registering" | "checkout";
type StepState = "upcoming" | "active" | "done";
type ChannelValidationState = "idle" | "checking" | "valid" | "invalid";

type ChannelValidationMetrics = {
  youtubeChannelId: string | null;
  channelName: string | null;
  canonicalUrl: string | null;
  totalVideos: number | null;
  totalViews: number | null;
  videosSampled: number;
};

type OnboardingCopy = {
  topbarEyebrow: string;
  topbarTitle: string;
  searchPlaceholder: string;
  workflowPill: string;
  stepLabels: Array<{ step: OnboardingStep; label: string }>;
  stepMeta: Record<OnboardingStep, { eyebrow: string; title: string; description: string; icon: typeof AirplaneTilt }>;
  footerBack: string;
  footerStep: string;
  footerOf: string;
  footerContinue: string;
  footerReviewAccount: string;
  footerOpenDashboard: string;
  overviewFeatures: Array<{ title: string; copy: string }>;
  importMetricCountries: string;
  importMetricMapped: string;
  importMetricViews: string;
  analyticsCountryPerformance: string;
  metricCountries: string;
  metricMappedVideos: string;
  metricViews: string;
  sponsorsEyebrow: string;
  sponsorsDescription: string;
  sponsorsConnect: string;
  fanVoteEyebrow: string;
  fanVoteTitle: string;
  fanVoteDescription: string;
  fanVoteVotesLabel: string;
  fanVoteTotalLabel: string;
  accountSetup: string;
  accountDisplayNamePlaceholder: string;
  accountEmailPlaceholder: string;
  accountUsernamePlaceholder: string;
  accountPasswordPlaceholder: string;
  channelStepRequiredError: string;
  channelNotFoundError: string;
  planUnavailableError: string;
  choosePlanError: string;
  registerFallbackError: string;
  accountActivated: string;
  publicUrlReservedPrefix: string;
  missingCheckoutError: string;
  checkoutFailedError: string;
  creatingAccount: string;
  preparingCheckout: string;
  startTrial: string;
  payWithPolar: string;
  testWithoutPayment: string;
  testWithoutPaymentHint: string;
  testWithoutPaymentAction: string;
  testWithoutPaymentProcessing: string;
  trialBadge: string;
  trialNote: string;
  processingPhrases: string[];
  unavailablePlanBadge: string;
  importRealStatsNote: string;
  importDemoStatsNote: string;
  acceptTermsLabel: string;
  acceptTermsRequired: string;
};

const onboardingCopy: Record<OnboardingLocale, OnboardingCopy> = {
  es: {
    topbarEyebrow: "TravelYourMap",
    topbarTitle: "Onboarding",
    searchPlaceholder: "Busca videos, países o creadores",
    workflowPill: "Flujo del creador",
    stepLabels: [
      { step: 0, label: "Resumen" },
      { step: 1, label: "Canal" },
      { step: 2, label: "Importar" },
      { step: 3, label: "Analítica" },
      { step: 4, label: "Sponsors" },
      { step: 5, label: "Voto fan" },
      { step: 6, label: "Planes" },
    ],
    stepMeta: {
      0: {
        eyebrow: "Flujo del canal",
        title: "Convierte tu canal en una experiencia viva.",
        description: "Setup, importación, analítica, sponsors y pago en un recorrido corto y claro.",
        icon: AirplaneTilt,
      },
      1: {
        eyebrow: "Tu canal",
        title: "Conecta el canal que vas a publicar.",
        description: "en 5 minutos, tienes tu mapa interactivo.",
        icon: YoutubeLogo,
      },
      2: {
        eyebrow: "Importación",
        title: "Filtramos y ordenamos tu catálogo.",
        description: "La vista muestra datos de ejemplo mientras el loader ejecuta la importación real.",
        icon: UploadSimple,
      },
      3: {
        eyebrow: "Analítica por país",
        title: "Lee dónde rinde mejor tu contenido.",
        description: "Detecta países fuertes, huecos y destinos con mayor tracción.",
        icon: ChartLineUp,
      },
      4: {
        eyebrow: "Brand deals",
        title: "Muestra tus sponsors en tu mapa",
        description: "Genera más ingresos promocionando empresas.",
        icon: Handshake,
      },
      5: {
        eyebrow: "Señal de audiencia",
        title: "Tu audiencia vota el siguiente destino.",
        description: "Una capa simple para convertir demanda en planificación.",
        icon: UsersThree,
      },
      6: {
        eyebrow: "Planes",
        title: "Elige tu plan y empieza la prueba de 7 días.",
        description: "Todos los planes incluyen el trial y luego cobran el plan elegido.",
        icon: CreditCard,
      },
    },
    footerBack: "Atrás",
    footerStep: "Paso",
    footerOf: "de",
    footerContinue: "Continuar",
    footerReviewAccount: "Revisar cuenta",
    footerOpenDashboard: "Abrir dashboard",
    overviewFeatures: [
      { title: "Importa videos", copy: "Lee el catálogo del canal y conserva solo contenido long-form." },
      { title: "Mapea países", copy: "Asocia cada video válido a un país real y explorable." },
      { title: "Monetiza destinos", copy: "Activa sponsors y votación sin romper el flujo." },
    ],
    importMetricCountries: "Países",
    importMetricMapped: "Videos",
    importMetricViews: "Views",
    analyticsCountryPerformance: "Rendimiento por país",
    metricCountries: "Países",
    metricMappedVideos: "Videos",
    metricViews: "Views",
    sponsorsEyebrow: "Sponsors",
    sponsorsDescription: "Integraciones por destino y tarjetas patrocinadas por país.",
    sponsorsConnect: "Ejemplo de integración",
    fanVoteEyebrow: "Voto fan",
    fanVoteTitle: "Tu audiencia decide el próximo país.",
    fanVoteDescription: "Convierte interés en señal y la señal en calendario de viaje.",
    fanVoteVotesLabel: "votos",
    fanVoteTotalLabel: "Total de votos",
    accountSetup: "Perfil final",
    accountDisplayNamePlaceholder: "Nombre público",
    accountEmailPlaceholder: "Email",
    accountUsernamePlaceholder: "Usuario",
    accountPasswordPlaceholder: "Contraseña",
    channelStepRequiredError: "Completa nombre, email y un canal real para continuar.",
    channelNotFoundError: "No pudimos verificar ese canal.",
    planUnavailableError: "Agency está en preparación y todavía no se puede contratar.",
    choosePlanError: "Primero elige un plan.",
    registerFallbackError: "No se pudo crear la cuenta.",
    accountActivated: "Cuenta lista.",
    publicUrlReservedPrefix: "URL pública reservada:",
    missingCheckoutError: "Este plan todavía no tiene checkout configurado.",
    checkoutFailedError: "No pudimos abrir Polar. Inténtalo nuevamente en unos segundos.",
    creatingAccount: "Creando cuenta...",
    preparingCheckout: "Abriendo Polar...",
    startTrial: "Empezar prueba de 7 días",
    payWithPolar: "Crear mi Mapa",
    testWithoutPayment: "TEST · Sin pago",
    testWithoutPaymentHint: "Usa este modo para QA interno. Crea cuenta trialing sin checkout y sigue al procesamiento.",
    testWithoutPaymentAction: "Procesar sin pago (TEST)",
    testWithoutPaymentProcessing: "Preparando modo test...",
    trialBadge: "7 días gratis",
    trialNote: "Todos los planes arrancan con una prueba de 7 días.",
    processingPhrases: [
      "Conectando tu canal...",
      "Filtrando shorts y ruido...",
      "Mapeando países y destinos...",
      "Preparando tu analítica...",
      "Afinando sponsors y crecimiento...",
    ],
    unavailablePlanBadge: "Próximamente",
    importRealStatsNote: "Videos y views vienen del canal real vía YouTube Data API oficial. Países se mantienen demo hasta completar importación.",
    importDemoStatsNote: "La vista usa ejemplo visual. El loader ejecuta la importación real después de Polar.",
    acceptTermsLabel: "Acepto los Términos y la Política de Privacidad de TravelYourMap, y reconozco que el producto usa YouTube API Services.",
    acceptTermsRequired: "Debes aceptar términos y privacidad para continuar.",
  },
  en: {
    topbarEyebrow: "TravelYourMap",
    topbarTitle: "Onboarding",
    searchPlaceholder: "Search across videos, countries, or creators",
    workflowPill: "Creator flow",
    stepLabels: [
      { step: 0, label: "Overview" },
      { step: 1, label: "Channel" },
      { step: 2, label: "Import" },
      { step: 3, label: "Analytics" },
      { step: 4, label: "Sponsors" },
      { step: 5, label: "Fan vote" },
      { step: 6, label: "Plans" },
    ],
    stepMeta: {
      0: {
        eyebrow: "Channel workflow",
        title: "Turn your channel into a living experience.",
        description: "Setup, import, analytics, sponsors, and payment in one short flow.",
        icon: AirplaneTilt,
      },
      1: {
        eyebrow: "Your channel",
        title: "Connect the channel you want to publish.",
        description: "Name, email, and a real channel URL are enough to continue.",
        icon: YoutubeLogo,
      },
      2: {
        eyebrow: "Import",
        title: "We filter and sort your catalog.",
        description: "This view uses example data while the loader runs the real import.",
        icon: UploadSimple,
      },
      3: {
        eyebrow: "Country analytics",
        title: "See where your content performs best.",
        description: "Find strong countries, gaps, and destinations with momentum.",
        icon: ChartLineUp,
      },
      4: {
        eyebrow: "Brand deals",
        title: "Turn destinations into inventory.",
        description: "Brands attach to countries and routes, not generic placement.",
        icon: Handshake,
      },
      5: {
        eyebrow: "Audience signal",
        title: "Let your audience vote next.",
        description: "A simple layer that turns demand into planning.",
        icon: UsersThree,
      },
      6: {
        eyebrow: "Plans",
        title: "Choose a plan and start the 7-day trial.",
        description: "Every plan begins with the trial and then bills the selected tier.",
        icon: CreditCard,
      },
    },
    footerBack: "Back",
    footerStep: "Step",
    footerOf: "of",
    footerContinue: "Continue",
    footerReviewAccount: "Review account",
    footerOpenDashboard: "Open dashboard",
    overviewFeatures: [
      { title: "Import videos", copy: "Read the channel catalog and keep only long-form travel content." },
      { title: "Map countries", copy: "Attach each valid video to a real, explorable country." },
      { title: "Monetize destinations", copy: "Unlock sponsors and audience voting without breaking flow." },
    ],
    importMetricCountries: "Countries",
    importMetricMapped: "Videos",
    importMetricViews: "Views",
    analyticsCountryPerformance: "Country performance",
    metricCountries: "Countries",
    metricMappedVideos: "Videos",
    metricViews: "Views",
    sponsorsEyebrow: "Sponsors",
    sponsorsDescription: "Destination placements and sponsored country cards.",
    sponsorsConnect: "Connect",
    fanVoteEyebrow: "Fan vote",
    fanVoteTitle: "Your audience picks the next country.",
    fanVoteDescription: "Turn interest into signal and signal into your travel calendar.",
    fanVoteVotesLabel: "votes",
    fanVoteTotalLabel: "Total votes",
    accountSetup: "Final profile",
    accountDisplayNamePlaceholder: "Display name",
    accountEmailPlaceholder: "Email",
    accountUsernamePlaceholder: "Username",
    accountPasswordPlaceholder: "Password",
    channelStepRequiredError: "Complete name, email, and a real channel to continue.",
    channelNotFoundError: "We couldn't verify that channel.",
    planUnavailableError: "Agency is still in preparation and cannot be purchased yet.",
    choosePlanError: "Choose a plan first.",
    registerFallbackError: "Could not create the account.",
    accountActivated: "Account ready.",
    publicUrlReservedPrefix: "Public URL reserved:",
    missingCheckoutError: "That plan does not have checkout configured yet.",
    checkoutFailedError: "We could not open Polar checkout. Please try again in a few seconds.",
    creatingAccount: "Creating account...",
    preparingCheckout: "Opening Polar...",
    startTrial: "Start 7-day trial",
    payWithPolar: "Create my Map",
    testWithoutPayment: "TEST · No payment",
    testWithoutPaymentHint: "Use this for internal QA. It creates a trialing account without checkout and continues to processing.",
    testWithoutPaymentAction: "Process without payment (TEST)",
    testWithoutPaymentProcessing: "Preparing test mode...",
    trialBadge: "7 days included",
    trialNote: "Every plan starts with a 7-day trial.",
    processingPhrases: [
      "Connecting your channel...",
      "Filtering shorts and noise...",
      "Mapping countries and destinations...",
      "Preparing your analytics...",
      "Sharpening sponsors and growth...",
    ],
    unavailablePlanBadge: "Coming soon",
    importRealStatsNote: "Videos and views come from the real channel via the official YouTube Data API. Countries stay demo until import finishes.",
    importDemoStatsNote: "This view uses visual sample data while real import runs after Polar.",
    acceptTermsLabel: "I accept TravelYourMap Terms and Privacy Policy, and acknowledge that this product uses YouTube API Services.",
    acceptTermsRequired: "You must accept terms and privacy to continue.",
  },
};

const sponsorCards = [
  { brand: "Booking.com", image: "/brands/booking.svg" },
  { brand: "GetYourGuide", image: "/brands/getyourguide.svg" },
  { brand: "Airbnb", image: "/brands/airbnb.svg" },
  { brand: "IATI Seguros", image: "/brands/iati.svg" },
] as const;

const visiblePlans = PLAN_DEFINITIONS.filter((plan) => plan.slug !== "free");
const showTestNoPaymentPlan = process.env.NEXT_PUBLIC_ENABLE_TEST_NO_PAYMENT === "1";

export function OnboardingFlow({ isDemoMode, locale }: { isDemoMode: boolean; locale: OnboardingLocale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showComingSoon } = useComingSoon();
  const [step, setStep] = useState<OnboardingStep>(0);
  const [selectedPlan, setSelectedPlan] = useState<string>(() => resolveCanonicalPlanSlug(searchParams.get("plan") || "") || "creator_pro");
  const [channelDraft, setChannelDraft] = useState<ChannelDraft>(() => ({
    displayName: isDemoMode ? DEMO_USER.displayName : "",
    email: isDemoMode ? DEMO_USER.email : "",
    channelUrl: isDemoMode ? "https://www.youtube.com/@pupilanomad" : "",
  }));
  const [stepError, setStepError] = useState<string | null>(null);
  const [channelValidationState, setChannelValidationState] = useState<ChannelValidationState>("idle");
  const [channelValidationMessage, setChannelValidationMessage] = useState<string | null>(null);
  const [channelValidationMetrics, setChannelValidationMetrics] = useState<ChannelValidationMetrics | null>(null);
  const [activationState, setActivationState] = useState<ActivationState>("idle");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const didHydrateQueryState = useRef(false);
  const contentScrollRef = useRef<HTMLElement>(null);

  const copy = onboardingCopy[locale];
  const analytics = DEMO_ANALYTICS as ChannelAnalytics;
  const selectedPlanAvailable = PLAN_DEFINITIONS.some((plan) => plan.slug === selectedPlan && plan.available);

  const currentMeta = copy.stepMeta[step];

  useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0 });
  }, [step]);

  useEffect(() => {
    if (didHydrateQueryState.current) return;
    didHydrateQueryState.current = true;

    const planParam = String(searchParams.get("plan") || "").trim();
    const canonicalPlan = resolveCanonicalPlanSlug(planParam);
    if (canonicalPlan) {
      setSelectedPlan(canonicalPlan);
      setStep(6);
    }

    const errorCode = String(searchParams.get("error") || "").trim().toLowerCase();
    if (!errorCode) return;

    setStep(6);
    if (errorCode === "plan_unavailable") {
      setStepError(copy.missingCheckoutError);
      return;
    }
    if (errorCode === "checkout_failed") {
      setStepError(copy.checkoutFailedError);
      return;
    }
  }, [copy.checkoutFailedError, copy.missingCheckoutError, searchParams]);

  function normalizeUsernameSeed(input: string) {
    const normalized = String(input || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    return normalized.replace(/^@+/, "").replace(/[^a-z0-9._-]+/g, "-").replace(/^[^a-z0-9]+/, "").replace(/[^a-z0-9]+$/, "");
  }

  function generateUsernameCandidates() {
    const emailHandle = channelDraft.email.split("@")[0] || "";
    const preferred = normalizeUsernameSeed(emailHandle) || normalizeUsernameSeed(channelDraft.displayName) || "creator";
    const baseCore = preferred.length >= 3 ? preferred : `${preferred}map`;
    const base = baseCore.slice(0, 24);
    const fallbackToken = () =>
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().replace(/-/g, "").slice(0, 6)
        : Math.random().toString(36).slice(2, 8);

    const attempts = [base];
    for (let index = 0; index < 4; index += 1) {
      attempts.push(`${base.slice(0, 22)}${fallbackToken()}`.slice(0, 30));
    }

    return Array.from(
      new Set(
        attempts
          .map((value) => value.replace(/^[^a-z0-9]+/, "").replace(/[^a-z0-9]+$/, ""))
          .filter((value) => value.length >= 3)
      )
    );
  }

  async function activateAndOpenCheckout() {
    if (!selectedPlan) {
      setStepError(copy.choosePlanError);
      return;
    }

    if (!PLAN_DEFINITIONS.some((plan) => plan.slug === selectedPlan && plan.available)) {
      setStepError(copy.planUnavailableError);
      return;
    }

    if (isDemoMode) {
      router.push(`/dashboard?channelId=${DEMO_CHANNEL_SLUG}&demo=1`);
      return;
    }
    if (!acceptTerms) {
      setStepError(copy.acceptTermsRequired);
      return;
    }

    const checkoutSlug = resolveCheckoutPlanSlug(selectedPlan);
    if (!checkoutSlug) {
      setStepError(copy.missingCheckoutError);
      return;
    }

    setActivationState("registering");
    setStepError(null);

    try {
      const usernameCandidates = generateUsernameCandidates();
      const generatedPassword = `tm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
      let lastErrorMessage = copy.registerFallbackError;

      for (const username of usernameCandidates) {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: channelDraft.displayName.trim(),
            email: channelDraft.email.trim(),
            username,
            password: generatedPassword,
            selectedPlan,
            channelUrl: channelDraft.channelUrl.trim() || null,
            youtubeChannelId: channelValidationMetrics?.youtubeChannelId || null,
            acceptTerms,
            activateWithoutPayment: false,
          }),
        });

        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        if (response.ok) {
          setActivationState("checkout");
          window.location.assign(`/api/billing/polar/checkout?plan=${encodeURIComponent(checkoutSlug)}&lang=${encodeURIComponent(locale)}`);
          return;
        }

        lastErrorMessage = payload?.error || copy.registerFallbackError;
        const usernameTaken = response.status === 409 || /usuario|username/i.test(lastErrorMessage);
        if (usernameTaken) continue;

        throw new Error(lastErrorMessage);
      }
      throw new Error(lastErrorMessage);
    } catch (error) {
      setActivationState("idle");
      setStepError(error instanceof Error ? error.message : copy.registerFallbackError);
    }
  }

  async function activateWithoutPaymentForTest() {
    if (!selectedPlan) {
      setStepError(copy.choosePlanError);
      return;
    }

    if (!PLAN_DEFINITIONS.some((plan) => plan.slug === selectedPlan && plan.available)) {
      setStepError(copy.planUnavailableError);
      return;
    }

    if (isDemoMode) {
      router.push(`/dashboard?channelId=${DEMO_CHANNEL_SLUG}&demo=1`);
      return;
    }
    if (!acceptTerms) {
      setStepError(copy.acceptTermsRequired);
      return;
    }

    setActivationState("registering");
    setStepError(null);

    try {
      const usernameCandidates = generateUsernameCandidates();
      const generatedPassword = `tm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
      let lastErrorMessage = copy.registerFallbackError;

      for (const username of usernameCandidates) {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: channelDraft.displayName.trim(),
            email: channelDraft.email.trim(),
            username,
            password: generatedPassword,
            selectedPlan,
            channelUrl: channelDraft.channelUrl.trim() || null,
            youtubeChannelId: channelValidationMetrics?.youtubeChannelId || null,
            acceptTerms,
            activateWithoutPayment: true,
            deferImportToProcessing: true,
          }),
        });

        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        if (response.ok) {
          window.location.assign(`/onboarding/processing?lang=${encodeURIComponent(locale)}`);
          return;
        }

        lastErrorMessage = payload?.error || copy.registerFallbackError;
        const usernameTaken = response.status === 409 || /usuario|username/i.test(lastErrorMessage);
        if (usernameTaken) continue;

        throw new Error(lastErrorMessage);
      }

      throw new Error(lastErrorMessage);
    } catch (error) {
      setActivationState("idle");
      setStepError(error instanceof Error ? error.message : copy.registerFallbackError);
    }
  }

  async function validateChannelDraft() {
    setStepError(null);

    if (isDemoMode) {
      setChannelValidationState("valid");
      setChannelValidationMessage(null);
      setChannelValidationMetrics({
        youtubeChannelId: DEMO_CHANNEL.id,
        channelName: DEMO_CHANNEL.channel_name,
        canonicalUrl: null,
        totalVideos: DEMO_VIDEO_LOCATIONS.length,
        totalViews: DEMO_VIDEO_LOCATIONS.reduce((sum, video) => sum + Number(video.view_count || 0), 0),
        videosSampled: DEMO_VIDEO_LOCATIONS.length,
      });
      return true;
    }

    const channelUrl = channelDraft.channelUrl.trim();
    if (!channelUrl) {
      setChannelValidationState("invalid");
      setChannelValidationMessage(copy.channelNotFoundError);
      setChannelValidationMetrics(null);
      return false;
    }

    setChannelValidationState("checking");
    setChannelValidationMessage(null);

    try {
      const response = await fetch("/api/youtube/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelUrl }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            error?: string;
            youtube_channel_id?: string;
            channel_name?: string;
            canonical_url?: string;
            total_videos?: number | null;
            total_views?: number | null;
            total_videos_sampled?: number;
          }
        | null;
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || copy.channelNotFoundError);
      }

      const metrics: ChannelValidationMetrics = {
        youtubeChannelId: payload.youtube_channel_id || null,
        channelName: payload.channel_name || null,
        canonicalUrl: payload.canonical_url || null,
        totalVideos: typeof payload.total_videos === "number" ? payload.total_videos : null,
        totalViews: typeof payload.total_views === "number" ? payload.total_views : null,
        videosSampled: typeof payload.total_videos_sampled === "number" ? payload.total_videos_sampled : 0,
      };

      const metricsSummary = [
        typeof metrics.totalVideos === "number" ? `${formatNumber(metrics.totalVideos)} videos` : null,
        typeof metrics.totalViews === "number" ? `${formatNumber(metrics.totalViews)} views` : null,
      ]
        .filter(Boolean)
        .join(" · ");

      setChannelValidationState("valid");
      setChannelValidationMetrics(metrics);
      setChannelValidationMessage(metrics.channelName ? `${metrics.channelName}${metricsSummary ? ` · ${metricsSummary}` : ""}` : metricsSummary || null);
      return true;
    } catch (error) {
      setChannelValidationState("invalid");
      setChannelValidationMetrics(null);
      setChannelValidationMessage(error instanceof Error ? error.message : copy.channelNotFoundError);
      return false;
    }
  }

  async function handleNext() {
    if (activationState !== "idle") return;

    if (step === 1) {
      const displayName = channelDraft.displayName.trim();
      const email = channelDraft.email.trim();
      const channelUrl = channelDraft.channelUrl.trim();
      if (!displayName || !email || !channelUrl) {
        setStepError(copy.channelStepRequiredError);
        return;
      }

      const isValid = await validateChannelDraft();
      if (!isValid) return;
    }

    setStepError(null);
    if (step < 6) {
      setStep((current) => (current + 1) as OnboardingStep);
      return;
    }
    if (!acceptTerms) {
      setStepError(copy.acceptTermsRequired);
      return;
    }
    await activateAndOpenCheckout();
  }

  function handleBack() {
    setStepError(null);
    if (step > 0) {
      setStep((current) => ((current - 1) as OnboardingStep));
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/auth");
  }

  function stepStateFor(stepIndex: OnboardingStep): StepState {
    if (stepIndex === step) return "active";
    if (stepIndex < step) return "done";
    return "upcoming";
  }

  const stepper = (
    <div className="mx-auto flex w-max min-w-full gap-1.5 rounded-full border border-white/10 bg-[#181818]/95 p-1.5 backdrop-blur md:min-w-0">
      {copy.stepLabels.map((item) => {
        const state = stepStateFor(item.step);
        return (
          <button
            key={item.step}
            type="button"
            className={cn(
              "inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full px-3 text-[12px] font-medium transition-colors lg:h-9",
              state === "active" && "bg-white/[0.08] text-[#f3eee7]",
              state === "done" && "bg-transparent text-[#8b8b8b] hover:text-[#b5b5b5]",
              state === "upcoming" && "bg-transparent text-[#ff4040] hover:text-[#ff6a6a]"
            )}
            onClick={() => {
              if (item.step <= step) setStep(item.step);
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
  const StepIcon = currentMeta.icon;

  return (
    <main className="relative grid h-[100dvh] grid-rows-[71px_minmax(0,1fr)_98px] overflow-hidden bg-[#0d0f10] text-[#f1f1f1] md:block md:min-h-[100dvh] md:overflow-x-hidden md:overflow-y-visible">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(255,255,255,0.035),transparent_28%),linear-gradient(180deg,#0d0f10_0%,#0a0c0d_100%)]" />

      <header className="pointer-events-none relative px-[13px] md:fixed md:inset-x-0 md:top-0 md:z-40 md:px-4 md:pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="pointer-events-auto relative mx-auto grid h-[71px] grid-cols-[44px_minmax(0,1fr)_112px] items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={handleBack}
            disabled={activationState !== "idle"}
            className="inline-flex h-11 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-[linear-gradient(145deg,#2a2c2e,#202224)] text-[#f3f3f3] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_30px_-24px_rgba(0,0,0,0.95)] transition-[transform,background-color] duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6552]/70 disabled:opacity-50"
            aria-label={copy.footerBack}
          >
            <ArrowLeft size={24} weight="regular" aria-hidden="true" />
          </button>

          <div className="absolute top-1/2 left-1/2 flex w-[190px] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center">
            <Link href="/" className="min-w-0 text-center" aria-label="TravelYourMap">
              <p className="truncate text-[11px] leading-4 font-normal tracking-[-0.01em] text-[#bebdc0]">{copy.topbarTitle}</p>
              <p className="truncate text-[9px] leading-3 font-semibold tracking-[0.18em] text-[#a8a8aa] uppercase">{copy.topbarEyebrow}</p>
            </Link>
            <span className={cn(
              "block max-w-full truncate text-[15px] leading-[18px] font-medium tracking-[-0.02em] tabular-nums",
              step === 6 ? "text-[#ff8173]" : "text-[#f5f5f5]"
            )} aria-live="polite">
              {copy.stepLabels[step]?.label} · {step + 1} {copy.footerOf} {copy.stepLabels.length}
            </span>
          </div>
        </div>
        <div className="hidden md:block">
          <FloatingTopBar
            eyebrow={copy.topbarEyebrow}
            title={copy.topbarTitle}
            centerContent={
              <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{stepper}</div>
            }
            hideSearch
          />
        </div>
      </header>

      <section
        ref={contentScrollRef}
        className={cn(
          "relative min-h-0 overscroll-contain",
          step === 6 ? "overflow-y-auto pb-4" : "overflow-hidden",
          "md:pointer-events-none md:z-20 md:flex md:min-h-[100dvh] md:items-center md:justify-center md:overflow-visible md:px-4 md:pb-28 md:pt-32"
        )}
      >
        <div className="h-full w-full max-w-[1040px] md:h-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              onAnimationComplete={() => contentScrollRef.current?.scrollTo({ top: 0 })}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              data-onboarding-step={step + 1}
              className={cn(
                "pointer-events-auto rounded-t-[28px] border border-b-0 border-white/[0.12] bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.025),transparent_36%),linear-gradient(180deg,rgba(20,23,25,0.98),rgba(15,18,20,0.98))] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]",
                step === 6 ? "min-h-full overflow-visible" : "h-full overflow-hidden",
                "md:h-auto md:min-h-0 md:rounded-[28px] md:border-b md:bg-[linear-gradient(180deg,rgba(25,28,31,0.96),rgba(18,21,23,0.92))] md:shadow-[0_36px_100px_-52px_rgba(0,0,0,0.92)] md:backdrop-blur"
              )}
            >
              <div className="px-[30px] pt-[33px] text-center md:border-b md:border-white/10 md:px-8 md:py-5">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(255,90,61,0.28)] bg-[rgba(255,90,61,0.12)] text-[#ff8b78]" aria-hidden="true">
                  <StepIcon size={22} weight="duotone" />
                </div>
                <p className="text-[11px] leading-4 font-semibold tracking-[0.2em] text-[#a9a9aa] uppercase md:tym-overline md:text-[#aaaaaa]">{currentMeta.eyebrow}</p>
                <h1 className="mx-auto mt-2 max-w-[290px] text-[28px] leading-[32px] font-bold tracking-[-0.035em] text-[#f4f4f4] md:max-w-3xl md:text-balance md:text-[38px] md:leading-[42px] md:tracking-tight">
                  {currentMeta.title}
                </h1>
                <p className="mx-auto mt-3 max-w-[320px] text-[14px] leading-5 font-normal tracking-[-0.01em] text-[#ff8173] md:max-w-2xl md:text-[14px] md:leading-6 md:text-[#b7b0a6]">{currentMeta.description}</p>
              </div>

              <div className="px-[30px] pt-[25px] pb-3 md:px-8 md:py-8">
                {renderStepBody(step, {
                  isDemoMode,
                  analytics,
                  selectedPlan,
                  setSelectedPlan,
                  onUnavailablePlanSelected: () => showComingSoon("agency_plan", "onboarding_plans"),
                  validateChannelDraft,
                  locale,
                  copy,
                  channelDraft,
                  setChannelDraft: (next) => {
                    setChannelDraft(next);
                    setChannelValidationState("idle");
                    setChannelValidationMessage(null);
                    setChannelValidationMetrics(null);
                  },
                  channelValidationMetrics,
                  channelValidationState,
                  channelValidationMessage,
                  stepError,
                  activationState,
                  acceptTerms,
                  setAcceptTerms,
                  onActivateWithoutPaymentForTest: activateWithoutPaymentForTest,
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <div className="relative border-t border-white/[0.12] bg-[#0b0d0e] px-[13px] pt-[13px] md:hidden">
        <Button
          type="button"
          onClick={handleNext}
          className="h-[50px] w-full rounded-[7px] border-0 bg-[linear-gradient(110deg,#ff5a46,#ff654d)] text-[16px] font-semibold tracking-[-0.02em] text-white shadow-none hover:bg-[linear-gradient(110deg,#ff5a46,#ff654d)] disabled:pointer-events-auto"
          disabled={
            activationState !== "idle" ||
            (step === 1 && channelValidationState === "checking") ||
            (step === 6 && (!selectedPlanAvailable || (!isDemoMode && !acceptTerms)))
          }
        >
          {activationState === "registering"
            ? copy.creatingAccount
            : activationState === "checkout"
              ? copy.preparingCheckout
              : step === 6
                ? copy.payWithPolar
                : copy.footerContinue}
        </Button>
        <span aria-hidden="true" className="mx-auto mt-[23px] block h-[5px] w-[137px] rounded-full bg-[#f3f3f3]" />
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 hidden px-4 md:block">
        <div className="pointer-events-auto mx-auto flex max-w-[1040px] items-center justify-between gap-2 rounded-full border border-white/10 bg-[#181818]/96 px-4 py-3 shadow-[0_-18px_60px_-30px_rgba(0,0,0,0.95)] backdrop-blur">
          <Button
            type="button"
            variant="secondary"
            className="disabled:pointer-events-auto"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleBack();
            }}
            disabled={activationState !== "idle"}
          >
            {copy.footerBack}
          </Button>
          <p className="text-[12px] text-[#aaaaaa]">
            {copy.footerStep} {step + 1} {copy.footerOf} {copy.stepLabels.length}
          </p>
          <Button
            type="button"
            onClick={handleNext}
            className="disabled:pointer-events-auto"
            disabled={
              activationState !== "idle" ||
              (step === 1 && channelValidationState === "checking") ||
              (step === 6 && (!selectedPlanAvailable || (!isDemoMode && !acceptTerms)))
            }
          >
            {activationState === "registering"
              ? copy.creatingAccount
              : activationState === "checkout"
                ? copy.preparingCheckout
                : step === 6
                  ? copy.payWithPolar
                  : copy.footerContinue}
          </Button>
        </div>
      </div>
    </main>
  );
}

function renderStepBody(
  step: OnboardingStep,
  ctx: {
    isDemoMode: boolean;
    analytics: ChannelAnalytics;
    selectedPlan: string;
    setSelectedPlan: (value: string) => void;
    onUnavailablePlanSelected: () => void;
    validateChannelDraft: () => Promise<boolean>;
    locale: OnboardingLocale;
    copy: OnboardingCopy;
    channelDraft: ChannelDraft;
    setChannelDraft: (next: ChannelDraft) => void;
    channelValidationMetrics: ChannelValidationMetrics | null;
    channelValidationState: ChannelValidationState;
    channelValidationMessage: string | null;
    stepError: string | null;
    activationState: ActivationState;
    acceptTerms: boolean;
    setAcceptTerms: (value: boolean) => void;
    onActivateWithoutPaymentForTest: () => Promise<void>;
  }
) {
  if (step === 0) {
    const featureCards = [
      { ...ctx.copy.overviewFeatures[0], icon: AirplaneTilt },
      { ...ctx.copy.overviewFeatures[1], icon: MapPin },
      { ...ctx.copy.overviewFeatures[2], icon: Handshake },
    ] as const;

    return (
      <div className="grid gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
        {featureCards.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-3 rounded-[18px] border border-white/10 bg-[#212121] p-3 text-left md:flex md:flex-col md:items-center md:rounded-[28px] md:p-6 md:text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(255, 90, 61,0.14)] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:mb-5 md:h-16 md:w-16">
                <Icon size={24} weight="regular" className="md:h-[30px] md:w-[30px]" />
              </div>
              <div>
                <p className="text-[14px] leading-5 font-medium text-[#f1f1f1] md:text-[16px] md:leading-[22px]">{feature.title}</p>
                <p className="onboarding-description mt-2 hidden text-[14px] leading-6 md:block">{feature.copy}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="space-y-4">
        <YoutubeImportStep
          demo={ctx.isDemoMode}
          locale={ctx.locale}
          value={ctx.channelDraft}
          onChange={ctx.setChannelDraft}
          channelValidationState={ctx.channelValidationState}
          channelValidationMessage={ctx.channelValidationMessage}
          onValidateChannel={() => {
            void ctx.validateChannelDraft();
          }}
        />
        {ctx.stepError ? <p className="text-[12px] text-[#ff8b8b]">{ctx.stepError}</p> : null}
      </div>
    );
  }

  if (step === 2) {
    const mapped =
      typeof ctx.channelValidationMetrics?.videosSampled === "number" && ctx.channelValidationMetrics.videosSampled > 0
        ? ctx.channelValidationMetrics.videosSampled
        : ctx.channelValidationMetrics?.totalVideos ?? DEMO_VIDEO_LOCATIONS.length;
    const countries = new Set(DEMO_VIDEO_LOCATIONS.map((video) => video.country_code)).size;
    const views = ctx.channelValidationMetrics?.totalViews ?? DEMO_VIDEO_LOCATIONS.reduce((sum, video) => sum + Number(video.view_count || 0), 0);
    return (
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StudioMetric label={ctx.copy.importMetricCountries} value={countries} />
        <StudioMetric label={ctx.copy.importMetricMapped} value={mapped} />
        <StudioMetric label={ctx.copy.importMetricViews} value={views} />
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[22px] border border-white/10 bg-[#212121] p-4 md:rounded-[28px] md:p-5">
          <p className="tym-overline text-[#aaaaaa]">{ctx.copy.analyticsCountryPerformance}</p>
          <div className="mt-4 space-y-3 md:mt-5 md:space-y-4">
            {ctx.analytics.top_countries.slice(0, 5).map((country, index) => (
              <div key={country.country_name}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[14px] text-[#f1f1f1]">{country.country_name}</span>
                  <span className="text-[12px] text-[#aaaaaa]">
                    {country.video_count} {ctx.copy.metricMappedVideos}
                  </span>
                </div>
                <div className="tym-progress">
                  <span style={{ width: `${Math.max(18, 100 - index * 12)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 lg:block lg:space-y-3">
          <StudioMetric label={ctx.copy.metricCountries} value={ctx.analytics.total_countries} />
          <StudioMetric label={ctx.copy.metricMappedVideos} value={ctx.analytics.total_mapped_videos} />
          <StudioMetric label={ctx.copy.metricViews} value={ctx.analytics.total_views} />
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-4">
        {sponsorCards.map((sponsor) => (
          <div key={sponsor.brand} className="flex h-full flex-col items-center rounded-[18px] border border-white/10 bg-[#212121] p-3 text-center md:rounded-[28px] md:p-5">
            <div className="mb-2 flex h-14 w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#111111] md:mb-4 md:aspect-video md:h-auto md:rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sponsor.image} alt={sponsor.brand} className="h-full w-full object-contain p-2 md:p-4" />
            </div>
            <p className="text-[13px] font-medium text-[#f1f1f1] md:text-[16px]">{sponsor.brand}</p>
            <p className="onboarding-description mt-2 hidden text-[13px] leading-5 md:block">{ctx.copy.sponsorsDescription}</p>
            <span className="mt-5 hidden min-h-10 w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-[12px] font-semibold text-[#c7c7c7] md:inline-flex">
              {ctx.copy.sponsorsConnect}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (step === 5) {
    const fanVoteOptions = ctx.locale === "en"
      ? [{ country: "Japan", votes: 42 }, { country: "Mexico", votes: 31 }, { country: "Italy", votes: 27 }]
      : [{ country: "Japón", votes: 42 }, { country: "México", votes: 31 }, { country: "Italia", votes: 27 }];
    const totalVotes = fanVoteOptions.reduce((total, option) => total + option.votes, 0);

    return (
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden rounded-[28px] border border-[rgba(255, 90, 61,0.24)] bg-[rgba(255, 90, 61,0.12)] p-6 text-center md:block lg:text-left">
          <p className="tym-overline text-[#ff8b8b]">{ctx.copy.fanVoteEyebrow}</p>
          <h3 className="mt-2 text-[26px] leading-[30px] font-bold text-[#f1f1f1]">{ctx.copy.fanVoteTitle}</h3>
          <p className="onboarding-description mx-auto mt-3 max-w-xl text-[14px] leading-6 lg:mx-0">{ctx.copy.fanVoteDescription}</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-[14px] border border-white/10 bg-white/[0.04] px-3 py-2">
            <span className="text-[12px] font-medium text-[#aaaaaa]">{ctx.copy.fanVoteTotalLabel}</span>
            <span className="text-[12px] font-semibold text-[#f1f1f1]">{totalVotes} {ctx.copy.fanVoteVotesLabel}</span>
          </div>
          {fanVoteOptions.map(({ country, votes }) => (
            <div key={country} className="rounded-[18px] border border-white/10 bg-[#212121] p-3 md:rounded-[28px] md:p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[14px] font-medium text-[#f1f1f1]">{country}</span>
                <span className="text-[12px] text-[#aaaaaa]">{votes} {ctx.copy.fanVoteVotesLabel} · {votes}%</span>
              </div>
              <div className="tym-progress">
                <span style={{ width: `${votes}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-0 space-y-[11px] md:space-y-4">
      <div className="grid gap-[13px] md:grid-cols-2 md:gap-4 lg:grid-cols-3">
        {visiblePlans.map((plan) => {
          const active = ctx.selectedPlan === plan.slug;
          const localizedPlan = getLocalizedPlan(plan, ctx.locale);
          const unavailable = !plan.available;
          const badgeLabel = unavailable ? ctx.copy.unavailablePlanBadge : plan.badge;

          return (
            <button
              key={plan.slug}
              type="button"
              onClick={() => {
                ctx.setSelectedPlan(plan.slug);
                posthog.capture("onboarding_plan_selected", {
                  plan: plan.slug,
                  available: !unavailable,
                });
                if (unavailable) {
                  ctx.onUnavailablePlanSelected();
                }
              }}
              aria-pressed={active}
              className={cn(
                "relative h-full rounded-[24px] border-[1.5px] px-[16px] py-[17px] text-left transition-[transform,border-color,background-color] duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] active:scale-[0.995] md:rounded-[28px] md:border md:p-5",
                unavailable && !active && "border-white/10 bg-[#1b1b1b] opacity-70 hover:border-white/20 hover:opacity-90",
                unavailable && active && "border-[#ff6c5b] bg-[#15181a] opacity-90",
                !unavailable && active && "min-h-[243px] border-[#ff6c5b] bg-[#15181a] md:min-h-0 md:border-[rgba(255,90,61,0.36)] md:bg-[rgba(255,90,61,0.12)]",
                !unavailable && !active && "min-h-[140px] border-white/[0.14] bg-[#171a1c] hover:bg-[#1c1f21] md:min-h-0 md:border-white/10 md:bg-[#212121] md:hover:bg-[#272727]"
              )}
            >
              <div className="grid grid-cols-[24px_minmax(0,1fr)] items-start gap-[12px] md:block">
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#4a4d50]",
                    active && "border-[#424548] bg-[#1c1f21]"
                  )}
                >
                  {active ? <span className="h-3 w-3 rounded-full bg-[#ff624f] shadow-[0_0_0_2px_rgba(255,98,79,0.12)]" /> : null}
                </span>

                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[12px] leading-4 font-semibold tracking-[0.2em] text-[#a9a9aa] uppercase md:tym-overline md:text-[#aaaaaa]">{localizedPlan.name}</p>
                      <p className="mt-1 text-[24px] leading-7 font-bold tracking-[-0.035em] text-[#f4f4f4] md:mt-2 md:text-[24px] md:leading-[26px]">{localizedPlan.price}</p>
                    </div>
                    {badgeLabel ? (
                      <>
                        <span className="mt-0.5 inline-flex min-h-7 items-center rounded-full bg-white/[0.08] px-3 text-[10px] leading-none font-medium tracking-[0.15em] text-[#bebdc0] uppercase md:hidden">
                          {badgeLabel}
                        </span>
                        <Badge className="hidden md:inline-flex" variant={unavailable ? "outline" : "secondary"}>{badgeLabel}</Badge>
                      </>
                    ) : null}
                  </div>

                  <p className="mt-[11px] text-[14px] leading-[21px] font-normal tracking-[-0.01em] text-[#ff8173] md:mt-3 md:text-[13px] md:leading-5 md:text-[#b7b0a6]">{localizedPlan.description}</p>

                  {localizedPlan.trialLabel && !unavailable ? <p className={cn("mt-[12px] text-[14px] leading-5 font-medium text-[#ff8173] md:mt-3 md:block md:text-[12px] md:text-[#ff6a6a]", !active && "hidden")}>{localizedPlan.trialLabel}</p> : null}

                  <ul className={cn("mt-[11px] grid grid-flow-col grid-cols-[0.78fr_1.22fr] grid-rows-2 gap-x-3 gap-y-[8px] border-t border-white/[0.13] pt-[12px] text-[10.5px] leading-4 tracking-[-0.015em] text-[#dedede] md:mt-4 md:block md:space-y-1.5 md:border-0 md:pt-0 md:text-[12px] md:leading-5 md:tracking-normal", !active && "hidden md:block")}>
                    {localizedPlan.features.map((feature) => (
                      <li key={`${plan.slug}-${feature}`} className="flex items-start gap-[8px]">
                        <span className="mt-[5px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#f1f1f1]" />
                        <span className="whitespace-nowrap md:whitespace-normal">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="hidden rounded-xl border border-[rgba(255, 90, 61,0.16)] bg-[rgba(255, 90, 61,0.08)] px-3 py-2 text-[11px] leading-4 text-[#f1f1f1] md:block md:rounded-2xl md:px-4 md:py-3 md:text-[13px]">
        {ctx.copy.trialBadge} · {ctx.copy.trialNote}
      </div>
      <label className="flex min-h-[58px] items-center gap-[10px] rounded-[23px] border border-white/[0.14] bg-[#171a1c] px-[15px] py-3 text-[11px] leading-4 text-[#dedede] md:min-h-11 md:items-start md:gap-2 md:rounded-xl md:border-white/10 md:bg-[#1b1b1b] md:px-3 md:py-2 md:text-[12px]">
        <span className="relative grid h-[22px] w-[22px] shrink-0 place-items-center md:mt-0.5 md:h-4 md:w-4">
          <input
            type="checkbox"
            checked={ctx.acceptTerms}
            onChange={(event) => ctx.setAcceptTerms(event.target.checked)}
            className="absolute inset-0 h-full w-full appearance-none rounded-[5px] border-2 border-[#c6c8ca] bg-[#15181a] checked:border-[#ff6552] checked:bg-[#ff6552] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6552]/50 md:rounded"
          />
          {ctx.acceptTerms ? <Check size={14} weight="bold" className="pointer-events-none relative text-white md:h-3 md:w-3" aria-hidden="true" /> : null}
        </span>
        <span className="md:hidden">
          {ctx.locale === "en" ? "I accept the " : "Acepto los "}
          <Link href={buildLocalizedHref("/terms", ctx.locale)} className="text-[#ff7665]">
            {ctx.locale === "en" ? "Terms of service" : "Términos de servicio"}
          </Link>{" "}
          {ctx.locale === "en" ? "and the " : "y la "}
          <Link href={buildLocalizedHref("/privacy", ctx.locale)} className="text-[#ff7665]">
            {ctx.locale === "en" ? "Privacy policy" : "Política de privacidad"}
          </Link>
          .
        </span>
        <span className="hidden md:inline">
          {ctx.copy.acceptTermsLabel}{" "}
          <Link href={buildLocalizedHref("/terms", ctx.locale)} className="text-[#f5f7fb] underline underline-offset-2">
            {ctx.locale === "en" ? "Terms" : "Términos"}
          </Link>{" "}
          /{" "}
          <Link href={buildLocalizedHref("/privacy", ctx.locale)} className="text-[#f5f7fb] underline underline-offset-2">
            {ctx.locale === "en" ? "Privacy" : "Privacidad"}
          </Link>
          .
        </span>
      </label>
      {showTestNoPaymentPlan ? (
        <div className="hidden rounded-xl border border-[#ffd27a]/25 bg-[rgba(255,210,122,0.08)] px-3 py-2 md:block">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="tym-overline text-[#ffd27a]">{ctx.copy.testWithoutPayment}</p>
              <p className="mt-1 text-[11px] leading-4 text-[#e7d7b1]">{ctx.copy.testWithoutPaymentHint}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="xs"
              className="border border-black/10 bg-white text-black hover:bg-white/90"
              onClick={() => {
                void ctx.onActivateWithoutPaymentForTest();
              }}
              disabled={ctx.activationState !== "idle"}
            >
              {ctx.activationState === "registering" ? ctx.copy.testWithoutPaymentProcessing : ctx.copy.testWithoutPaymentAction}
            </Button>
          </div>
        </div>
      ) : null}
      {ctx.stepError ? <p className="text-[12px] text-[#ff8b8b]">{ctx.stepError}</p> : null}
    </div>
  );
}

function StudioMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-[#181818] p-3 text-center sm:rounded-[24px] sm:p-4">
      <p className="text-[22px] leading-none font-semibold tracking-tight text-[#f1f1f1] sm:text-[32px]">{formatNumber(value)}</p>
      <p className="mt-1 text-[10px] leading-4 text-[#aaaaaa] sm:text-[12px]">{label}</p>
    </div>
  );
}

function formatNumber(value: number) {
  if (!value) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
}
