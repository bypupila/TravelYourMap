export interface PlanDefinition {
  slug: "free" | "creator" | "creator_pro" | "agency";
  checkoutSlug: string | null;
  name: string;
  price: string;
  monthlyPrice: number;
  trialDays: number;
  available: boolean;
  badge?: string;
  featured?: boolean;
  tone: "free" | "creator" | "pro" | "agency";
  description: string;
  features: string[];
}

export const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    slug: "free",
    checkoutSlug: null,
    name: "Free",
    price: "$0",
    monthlyPrice: 0,
    trialDays: 0,
    available: true,
    tone: "free",
    description: "Gancho de conversión para ver el mapa y validar el canal.",
    features: ["1 canal", "Hasta 50 videos", "Mapa público", "Importación básica"],
  },
  {
    slug: "creator",
    checkoutSlug: "starter",
    name: "Creator",
    price: "$29/mes",
    monthlyPrice: 29,
    trialDays: 7,
    available: true,
    tone: "creator",
    description: "Plan core para creadores individuales.",
    features: ["Videos ilimitados", "1 sponsor", "Analytics básicos", "Mapa con branding limpio"],
  },
  {
    slug: "creator_pro",
    checkoutSlug: "pro",
    name: "Creator Pro",
    price: "$79/mes",
    monthlyPrice: 79,
    trialDays: 7,
    available: true,
    badge: "Más Vendido",
    featured: true,
    tone: "pro",
    description: "Sponsor hub y analytics más vendible.",
    features: ["Videos ilimitados", "Competitor analytics", "Sponsor hub", "Sync prioritaria"],
  },
  {
    slug: "agency",
    checkoutSlug: "creator_plus",
    name: "Agency",
    price: "$199/mes",
    monthlyPrice: 199,
    trialDays: 7,
    available: false,
    tone: "agency",
    description: "Para agencias y marcas que operan portafolios.",
    features: ["Portafolio de canales", "API", "Portal de marcas", "Soporte dedicado"],
  },
];

export type PlanLocale = "es" | "en";

type LocalizedPlanCopy = Pick<PlanDefinition, "name" | "description" | "features"> & {
  priceSuffix: string;
  trialLabel: string | null;
  ctaLabel: string;
};

const LOCALIZED_PLAN_COPY: Record<PlanLocale, Record<CanonicalPlanSlug, LocalizedPlanCopy>> = {
  es: {
    free: {
      name: "Free",
      description: "Para validar el canal y publicar un mapa inicial.",
      features: ["1 canal", "Hasta 50 videos", "Mapa público", "Importación básica"],
      priceSuffix: "",
      trialLabel: null,
      ctaLabel: "Empezar gratis",
    },
    creator: {
      name: "Creator",
      description: "Para creadores individuales que quieren publicar y monetizar su mapa.",
      features: ["Videos ilimitados", "1 sponsor", "Analytics básicos", "Mapa sin branding"],
      priceSuffix: "/mes",
      trialLabel: "7 días gratis",
      ctaLabel: "Empezar prueba",
    },
    creator_pro: {
      name: "Creator Pro",
      description: "Para creadores que necesitan sponsor hub y analítica avanzada.",
      features: ["Videos ilimitados", "Análisis competitivo", "Sponsor hub", "Sincronización prioritaria"],
      priceSuffix: "/mes",
      trialLabel: "7 días gratis",
      ctaLabel: "Empezar prueba",
    },
    agency: {
      name: "Agency",
      description: "Para agencias y marcas que operan portafolios de canales.",
      features: ["Portafolio de canales", "API", "Portal de marcas", "Soporte dedicado"],
      priceSuffix: "/mes",
      trialLabel: "7 días gratis",
      ctaLabel: "Empezar prueba",
    },
  },
  en: {
    free: {
      name: "Free",
      description: "For validating a channel and publishing an initial map.",
      features: ["1 channel", "Up to 50 videos", "Public map", "Basic import"],
      priceSuffix: "",
      trialLabel: null,
      ctaLabel: "Start free",
    },
    creator: {
      name: "Creator",
      description: "For individual creators ready to publish and monetize their map.",
      features: ["Unlimited videos", "1 sponsor", "Basic analytics", "Branding-free map"],
      priceSuffix: "/mo",
      trialLabel: "7-day free trial",
      ctaLabel: "Start trial",
    },
    creator_pro: {
      name: "Creator Pro",
      description: "For creators who need a sponsor hub and advanced analytics.",
      features: ["Unlimited videos", "Competitive analytics", "Sponsor hub", "Priority sync"],
      priceSuffix: "/mo",
      trialLabel: "7-day free trial",
      ctaLabel: "Start trial",
    },
    agency: {
      name: "Agency",
      description: "For agencies and brands managing channel portfolios.",
      features: ["Channel portfolio", "API", "Brand portal", "Dedicated support"],
      priceSuffix: "/mo",
      trialLabel: "7-day free trial",
      ctaLabel: "Start trial",
    },
  },
};

export function getLocalizedPlan(plan: PlanDefinition, locale: PlanLocale) {
  const copy = LOCALIZED_PLAN_COPY[locale][plan.slug];
  return {
    ...plan,
    ...copy,
    price: plan.monthlyPrice === 0 ? "$0" : `$${plan.monthlyPrice}${copy.priceSuffix}`,
  };
}

export type CanonicalPlanSlug = PlanDefinition["slug"];

const PLAN_ALIAS_GROUPS: ReadonlyArray<readonly [CanonicalPlanSlug, ...string[]]> = [
  ["free"],
  ["creator", "starter"],
  ["creator_pro", "pro"],
  ["agency", "creator_plus"],
];

const canonicalByAlias = new Map<string, CanonicalPlanSlug>();
const aliasesByCanonical = new Map<CanonicalPlanSlug, string[]>();

for (const group of PLAN_ALIAS_GROUPS) {
  const [canonical, ...aliases] = group;
  const normalizedAliases = Array.from(new Set([canonical, ...aliases].map((slug) => String(slug).trim().toLowerCase()).filter(Boolean)));
  aliasesByCanonical.set(canonical, normalizedAliases);
  for (const alias of normalizedAliases) canonicalByAlias.set(alias, canonical);
}

export function resolveCanonicalPlanSlug(slug: string): CanonicalPlanSlug | null {
  const normalized = String(slug || "").trim().toLowerCase();
  if (!normalized) return null;
  return canonicalByAlias.get(normalized) || null;
}

export function getPlanSlugCandidates(slug: string) {
  const normalized = String(slug || "").trim().toLowerCase();
  if (!normalized) return [];

  const canonical = canonicalByAlias.get(normalized);
  if (!canonical) return [normalized];

  const aliases = aliasesByCanonical.get(canonical) || [canonical];
  return [normalized, ...aliases.filter((alias) => alias !== normalized)];
}

export function resolveCheckoutPlanSlug(slug: string) {
  const canonicalSlug = resolveCanonicalPlanSlug(slug);
  if (!canonicalSlug) return null;
  return PLAN_DEFINITIONS.find((plan) => plan.slug === canonicalSlug)?.checkoutSlug || null;
}
