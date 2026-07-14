export const COMING_SOON_FEATURES = {
  agency_plan: "Agency",
  map_live: "En vivo",
  map_destinations: "Destinos",
  map_creators: "Creadores",
  map_saved: "Guardados",
  map_history: "Historial",
  map_community: "Comunidad",
  map_video_extraction: "Extracción de videos",
  map_poll_creation: "Creación de votaciones",
  map_sponsor_management: "Gestión de patrocinadores",
} as const;

export const COMING_SOON_SURFACES = {
  pricing: "Pricing",
  landing_pricing: "Landing · Pricing",
  onboarding_plans: "Onboarding · Planes",
  map_sidebar: "Mapa · Navegación",
  map_creator_tools: "Mapa · Herramientas del creador",
  map_support: "Mapa · Apoyo al creador",
} as const;

export type ComingSoonFeatureId = keyof typeof COMING_SOON_FEATURES;
export type ComingSoonSurfaceId = keyof typeof COMING_SOON_SURFACES;

export const COMING_SOON_DURATION_MS = 10_000;

export function isComingSoonFeatureId(value: string): value is ComingSoonFeatureId {
  return Object.prototype.hasOwnProperty.call(COMING_SOON_FEATURES, value);
}

export function isComingSoonSurfaceId(value: string): value is ComingSoonSurfaceId {
  return Object.prototype.hasOwnProperty.call(COMING_SOON_SURFACES, value);
}
