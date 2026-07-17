"use client";

import Image from "next/image";
import {
  BookmarkSimple,
  Clock,
  Compass,
  GearSix,
  GlobeHemisphereWest,
  MapPin,
  Play,
  SquaresFour,
  Users,
  UsersThree,
  Video,
  X,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CountryFlag } from "@/components/ui/country-flag";
import type { MapRailSponsor } from "@/lib/map-types";
import type { TravelChannel, TravelVideoLocation } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ResponsiveCountrySortMode = "new" | "alphabetical" | "seen";

export type ResponsiveCountryItem = {
  code: string;
  name: string;
  count: number;
  watchedCount: number;
  activeCount: number;
  progress: number;
  newCount: number;
  hasNewVideos: boolean;
};

export type ResponsiveMapAnalytics = {
  countries: number;
  videos: number;
  watchedHours: number;
  visitedCountries: number;
  viewedVideosFromPlatform: number;
};

type ResponsivePanel = "destinations" | "videos" | "more";

interface ResponsiveMapChromeProps {
  channel: TravelChannel;
  countries: ResponsiveCountryItem[];
  countrySortMode: ResponsiveCountrySortMode;
  selectedCountryCode: string | null;
  videos: TravelVideoLocation[];
  totalVideos: number;
  sponsors: MapRailSponsor[];
  analytics: ResponsiveMapAnalytics;
  mapMode: "viewer" | "creator";
  isDemoMode: boolean;
  onChangeCountrySortMode: (mode: ResponsiveCountrySortMode) => void;
  onSelectCountry: (countryCode: string, countryName: string) => void;
  onSelectVideo: (video: TravelVideoLocation) => void;
  onNavigate: (label: string) => void;
  onCreateMap: () => void;
  onExtractVideos: () => void;
  onCreatePoll: () => void;
  onOpenAdmin: () => void;
  onManageSponsors: () => void;
  onPreviewViewer: () => void;
  onReturnToCreator: () => void;
  canReturnToCreator: boolean;
}

const NAV_ITEMS = [
  { label: "Explorar", Icon: Compass },
  { label: "En vivo", Icon: Video },
  { label: "Creadores", Icon: UsersThree },
  { label: "Guardados", Icon: BookmarkSimple },
  { label: "Historial", Icon: Clock },
  { label: "Comunidad", Icon: Users },
];

export function ResponsiveMapChrome({
  channel,
  countries,
  countrySortMode,
  selectedCountryCode,
  videos,
  totalVideos,
  sponsors,
  analytics,
  mapMode,
  isDemoMode,
  onChangeCountrySortMode,
  onSelectCountry,
  onSelectVideo,
  onNavigate,
  onCreateMap,
  onExtractVideos,
  onCreatePoll,
  onOpenAdmin,
  onManageSponsors,
  onPreviewViewer,
  onReturnToCreator,
  canReturnToCreator,
}: ResponsiveMapChromeProps) {
  const [activePanel, setActivePanel] = useState<ResponsivePanel | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const activeCountry = countries.find((country) => country.code === selectedCountryCode) || null;
  const panelVideos = useMemo(() => {
    if (!selectedCountryCode) return videos;
    const matching = videos.filter((video) => String(video.country_code || "").toUpperCase() === selectedCountryCode);
    return matching.length > 0 ? matching : videos;
  }, [selectedCountryCode, videos]);

  useEffect(() => {
    if (!activePanel) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActivePanel(null);
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;
      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.getClientRects().length > 0);
      if (focusableElements.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    window.setTimeout(() => panelRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activePanel]);

  function openPanel(panel: ResponsivePanel) {
    setActivePanel((current) => (current === panel ? null : panel));
  }

  return (
    <div className="lg:hidden" data-component="ResponsiveMapChrome">
      <nav
        aria-label="Navegación del mapa"
        className="pointer-events-auto absolute inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[110] grid grid-cols-4 gap-1 rounded-[1.35rem] border border-white/10 bg-[#091017]/88 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_22px_60px_-32px_rgba(0,0,0,0.92)] backdrop-blur-2xl md:inset-x-auto md:bottom-auto md:right-3 md:top-1/2 md:w-[68px] md:-translate-y-1/2 md:grid-cols-1 md:gap-2 md:rounded-[1.5rem] md:p-2"
      >
        <DockButton
          label="Mapa"
          Icon={GlobeHemisphereWest}
          active={activePanel === null}
          onClick={() => setActivePanel(null)}
        />
        <DockButton
          label="Destinos"
          Icon={MapPin}
          active={activePanel === "destinations"}
          badge={countries.length}
          onClick={() => openPanel("destinations")}
        />
        <DockButton
          label="Videos"
          Icon={Play}
          active={activePanel === "videos"}
          badge={totalVideos}
          onClick={() => openPanel("videos")}
        />
        <DockButton label="Más" Icon={SquaresFour} active={activePanel === "more"} onClick={() => openPanel("more")} />
      </nav>

      {activePanel ? (
        <div
          className="pointer-events-auto fixed inset-0 z-[180] bg-[#020406]/54 backdrop-blur-sm"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setActivePanel(null);
          }}
        >
          <section
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="responsive-map-panel-title"
            aria-describedby="responsive-map-panel-description"
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 z-[190] flex h-[min(78dvh,720px)] min-h-0 flex-col overflow-hidden rounded-t-[1.75rem] border-t border-white/10 bg-[#081017]/98 pb-[env(safe-area-inset-bottom)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_34px_90px_-42px_rgba(0,0,0,0.96)] outline-none animate-in fade-in-0 slide-in-from-bottom-8 duration-200 md:inset-x-auto md:inset-y-3 md:left-auto md:right-3 md:h-[calc(100dvh-1.5rem)] md:w-[320px] md:rounded-[1.75rem] md:border md:pb-0 md:slide-in-from-right-8"
          >
            <p id="responsive-map-panel-description" className="sr-only">Opciones adaptadas para navegar el mapa en pantallas táctiles.</p>

          {activePanel === "destinations" ? (
            <DestinationsPanel
              countries={countries}
              selectedCountryCode={selectedCountryCode}
              countrySortMode={countrySortMode}
              onChangeCountrySortMode={onChangeCountrySortMode}
              onSelectCountry={(countryCode, countryName) => {
                onSelectCountry(countryCode, countryName);
                setActivePanel(null);
              }}
              onClose={() => setActivePanel(null)}
            />
          ) : null}

          {activePanel === "videos" ? (
            <VideosPanel
              videos={panelVideos}
              totalVideos={totalVideos}
              activeCountry={activeCountry}
              onSelectVideo={(video) => {
                onSelectVideo(video);
                setActivePanel(null);
              }}
              onClose={() => setActivePanel(null)}
            />
          ) : null}

          {activePanel === "more" ? (
            <MorePanel
              channel={channel}
              sponsors={sponsors}
              analytics={analytics}
              mapMode={mapMode}
              isDemoMode={isDemoMode}
              onNavigate={(label) => {
                onNavigate(label);
                setActivePanel(null);
              }}
              onCreateMap={onCreateMap}
              onExtractVideos={onExtractVideos}
              onCreatePoll={onCreatePoll}
              onOpenAdmin={onOpenAdmin}
              onManageSponsors={onManageSponsors}
              onPreviewViewer={onPreviewViewer}
              onReturnToCreator={onReturnToCreator}
              canReturnToCreator={canReturnToCreator}
              onClose={() => setActivePanel(null)}
            />
          ) : null}
          </section>
        </div>
      ) : null}
    </div>
  );
}

function DockButton({
  label,
  Icon,
  active,
  badge,
  onClick,
}: {
  label: string;
  Icon: typeof Compass;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative grid min-h-12 min-w-0 place-items-center gap-0.5 rounded-[1rem] px-1.5 py-1.5 text-[9px] font-bold text-[#9ca7b3] transition-[transform,background-color,color] duration-200 ease-out active:scale-[0.97] md:min-h-[54px] md:px-1",
        active ? "bg-[#ff5a3d]/14 text-[#ff9b87]" : "hover:bg-white/[0.05] hover:text-white"
      )}
    >
      <span className="relative">
        <Icon size={19} weight={active ? "fill" : "regular"} aria-hidden="true" />
        {badge ? (
          <span className="absolute -right-3 -top-2 min-w-4 rounded-full border border-[#081017] bg-[#ff5a3d] px-1 font-mono text-[7px] leading-4 text-white">
            {formatCompact(badge)}
          </span>
        ) : null}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function PanelHeader({ eyebrow, title, detail, onClose }: { eyebrow: string; title: string; detail: string; onClose: () => void }) {
  return (
    <header className="shrink-0 border-b border-white/10 px-4 pb-3 pt-4 sm:px-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#ff8f78]">{eyebrow}</p>
          <h2 id="responsive-map-panel-title" className="mt-1 text-[18px] font-semibold tracking-tight text-white">{title}</h2>
          <p className="mt-1 text-[11px] leading-5 text-[#909ba7]">{detail}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white transition active:scale-[0.97]"
          aria-label="Cerrar panel"
        >
          <X size={17} weight="bold" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

function DestinationsPanel({
  countries,
  selectedCountryCode,
  countrySortMode,
  onChangeCountrySortMode,
  onSelectCountry,
  onClose,
}: {
  countries: ResponsiveCountryItem[];
  selectedCountryCode: string | null;
  countrySortMode: ResponsiveCountrySortMode;
  onChangeCountrySortMode: (mode: ResponsiveCountrySortMode) => void;
  onSelectCountry: (countryCode: string, countryName: string) => void;
  onClose: () => void;
}) {
  const totalVideos = countries.reduce((sum, country) => sum + country.count, 0);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelHeader eyebrow="Explorar por lugar" title="Destinos" detail={`${countries.length} países · ${totalVideos} videos`} onClose={onClose} />
      <div className="shrink-0 border-b border-white/10 px-4 py-3 sm:px-5">
        <div className="grid grid-cols-3 gap-1 rounded-[1rem] border border-white/10 bg-white/[0.025] p-1">
          {[
            { id: "new", label: "Nuevos" },
            { id: "alphabetical", label: "ABC" },
            { id: "seen", label: "Vistos" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onChangeCountrySortMode(option.id as ResponsiveCountrySortMode)}
              className={cn(
                "h-11 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition active:scale-[0.98]",
                countrySortMode === option.id ? "bg-white/[0.1] text-white" : "text-[#8f9aa6] hover:text-white"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2 sm:px-4" data-map-scroll="true">
        {countries.length > 0 ? (
          <div className="divide-y divide-white/[0.06]">
            {countries.map((country) => {
              const active = country.code === selectedCountryCode;
              return (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => onSelectCountry(country.code, country.name)}
                  className={cn(
                    "grid min-h-[64px] w-full grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 text-left transition active:scale-[0.99]",
                    active ? "bg-[#ff5a3d]/10" : "hover:bg-white/[0.035]"
                  )}
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.035]">
                    <CountryFlag code={country.code} size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[12px] font-bold text-white">{country.name}</span>
                      {country.hasNewVideos ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6f56]" aria-label="Tiene videos nuevos" /> : null}
                    </span>
                    <span className="mt-1 block text-[10px] text-[#87929e]">
                      {country.watchedCount} vistos de {country.count}
                    </span>
                    <span className="mt-2 block h-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <span className="block h-full origin-left rounded-full bg-[#ff6f56]" style={{ transform: `scaleX(${country.progress / 100})` }} />
                    </span>
                  </span>
                  <span className="font-mono text-[11px] font-bold text-[#b7c0ca]">{country.count}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyPanel Icon={MapPin} title="Todavía no hay destinos" detail="Los países aparecerán cuando existan videos geolocalizados." />
        )}
      </div>
    </div>
  );
}

function VideosPanel({
  videos,
  totalVideos,
  activeCountry,
  onSelectVideo,
  onClose,
}: {
  videos: TravelVideoLocation[];
  totalVideos: number;
  activeCountry: ResponsiveCountryItem | null;
  onSelectVideo: (video: TravelVideoLocation) => void;
  onClose: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelHeader
        eyebrow="Biblioteca del mapa"
        title={activeCountry ? `Videos en ${activeCountry.name}` : "Videos"}
        detail={`${videos.length} disponibles · ${totalVideos} en total`}
        onClose={onClose}
      />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2 sm:px-4" data-map-scroll="true">
        {videos.length > 0 ? (
          <div className="divide-y divide-white/[0.06]">
            {videos.map((video) => (
              <button
                key={video.youtube_video_id}
                type="button"
                onClick={() => onSelectVideo(video)}
                className="grid min-h-[82px] w-full grid-cols-[92px_minmax(0,1fr)] items-center gap-3 rounded-xl px-1.5 py-2 text-left transition hover:bg-white/[0.035] active:scale-[0.99]"
              >
                <span className="relative aspect-video w-[92px] overflow-hidden rounded-lg border border-white/10 bg-white/[0.035]">
                  {video.thumbnail_url ? (
                    <Image src={video.thumbnail_url} alt="" fill sizes="92px" className="object-cover" />
                  ) : (
                    <span className="grid h-full place-items-center text-[#7f8a96]"><Video size={20} aria-hidden="true" /></span>
                  )}
                  <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(3,6,10,0.7))]" />
                  <span className="absolute bottom-1 left-1 grid h-6 w-6 place-items-center rounded-full bg-[#ff5a3d] text-white">
                    <Play size={10} weight="fill" aria-hidden="true" />
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-2 text-[12px] font-semibold leading-4 text-white">{video.title}</span>
                  <span className="mt-2 flex min-w-0 items-center gap-2 text-[10px] text-[#8f9aa6]">
                    <CountryFlag code={video.country_code} size={12} />
                    <span className="truncate">{video.city || video.country_name || video.country_code || "Destino"}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <EmptyPanel Icon={Video} title="No hay videos disponibles" detail="Cambia de destino o limpia los filtros para ampliar la lista." />
        )}
      </div>
    </div>
  );
}

function MorePanel({
  channel,
  sponsors,
  analytics,
  mapMode,
  isDemoMode,
  onNavigate,
  onCreateMap,
  onExtractVideos,
  onCreatePoll,
  onOpenAdmin,
  onManageSponsors,
  onPreviewViewer,
  onReturnToCreator,
  canReturnToCreator,
  onClose,
}: {
  channel: TravelChannel;
  sponsors: MapRailSponsor[];
  analytics: ResponsiveMapAnalytics;
  mapMode: "viewer" | "creator";
  isDemoMode: boolean;
  onNavigate: (label: string) => void;
  onCreateMap: () => void;
  onExtractVideos: () => void;
  onCreatePoll: () => void;
  onOpenAdmin: () => void;
  onManageSponsors: () => void;
  onPreviewViewer: () => void;
  onReturnToCreator: () => void;
  canReturnToCreator: boolean;
  onClose: () => void;
}) {
  const isCreator = mapMode === "creator";
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelHeader eyebrow={isCreator ? "Herramientas creator" : "Tu experiencia"} title="Más opciones" detail={channel.channel_name || "TravelYourMap"} onClose={onClose} />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5" data-map-scroll="true">
        {isCreator ? (
          <section className="border-b border-white/10 pb-5">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#ff8f78]">Acciones creator</p>
            <div className="mt-3 grid gap-2">
              <ActionButton Icon={Video} label="Extraer videos" onClick={onExtractVideos} accent />
              <ActionButton Icon={Users} label="Crear votación" onClick={onCreatePoll} />
              <ActionButton Icon={GearSix} label="Abrir panel admin" onClick={onOpenAdmin} />
            </div>
          </section>
        ) : null}

        <section className="border-b border-white/10 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#8d98a4]">Modo del mapa</p>
              <p className="mt-1 text-[11px] leading-5 text-[#aab4bf]">
                {isCreator ? "Vista de gestión y herramientas creator." : "Vista pública tal como la ve un seguidor."}
              </p>
            </div>
            {isCreator ? (
              <button type="button" onClick={onPreviewViewer} className="h-11 shrink-0 rounded-full border border-[#ff5a3d]/35 bg-[#ff5a3d]/10 px-4 text-[10px] font-black text-[#ffab99] transition active:scale-[0.98]">
                Ver como seguidor
              </button>
            ) : canReturnToCreator ? (
              <button type="button" onClick={onReturnToCreator} className="h-11 shrink-0 rounded-full border border-[#ff5a3d]/35 bg-[#ff5a3d]/10 px-4 text-[10px] font-black text-[#ffab99] transition active:scale-[0.98]">
                Volver a creator
              </button>
            ) : null}
          </div>
        </section>

        <section className={cn("border-b border-white/10 py-5", isCreator && "pt-5")}>
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#8d98a4]">Actividad</p>
          <div className="mt-3 grid grid-cols-[1fr_1fr] divide-x divide-white/10 rounded-[1.1rem] border border-white/10 bg-white/[0.025]">
            <Metric label="Horas vistas" value={analytics.watchedHours} Icon={Clock} />
            <Metric label="Países visitados" value={analytics.visitedCountries} Icon={GlobeHemisphereWest} />
          </div>
          <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-[#8e99a5]">
            <span>Videos vistos desde el mapa</span>
            <span className="font-mono font-bold text-white">{analytics.viewedVideosFromPlatform}</span>
          </div>
        </section>

        <section className="border-b border-white/10 py-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#8d98a4]">{isCreator ? "Mis sponsors" : "Sponsors del mapa"}</p>
            {isCreator ? (
              <button type="button" className="min-h-11 text-[10px] font-bold text-[#ff9a84]" onClick={onManageSponsors}>Gestionar</button>
            ) : null}
          </div>
          {sponsors.length > 0 ? (
            <div className="mt-2 divide-y divide-white/[0.06]">
              {sponsors.slice(0, 6).map((sponsor) => {
                const sponsorContent = (
                  <>
                  {sponsor.logo_url ? (
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
                      <Image src={sponsor.logo_url} alt={sponsor.brand_name} fill sizes="36px" className="object-contain p-1" />
                    </span>
                  ) : (
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-[#ff8f78]">
                      <Compass size={16} aria-hidden="true" />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-bold text-white">{sponsor.brand_name}</span>
                    <span className="mt-0.5 block truncate text-[10px] text-[#8995a1]">{sponsor.description || "Sponsor activo en el mapa"}</span>
                  </span>
                  </>
                );
                return sponsor.affiliate_url ? (
                  <a
                    key={sponsor.id}
                    href={sponsor.affiliate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[58px] items-center gap-3 rounded-xl py-2 transition hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a3d]/60"
                    aria-label={`Visitar el sitio de ${sponsor.brand_name}`}
                  >
                    {sponsorContent}
                  </a>
                ) : (
                  <div key={sponsor.id} className="flex min-h-[58px] items-center gap-3 py-2">{sponsorContent}</div>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-[11px] leading-5 text-[#8995a1]">No hay sponsors activos en este mapa.</p>
          )}
        </section>

        <section className="py-5">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#8d98a4]">Navegación</p>
          <div className="mt-2 divide-y divide-white/[0.06]">
            {NAV_ITEMS.map(({ label, Icon }) => (
              <button key={label} type="button" onClick={() => onNavigate(label)} className="flex min-h-12 w-full items-center gap-3 px-1 text-left text-[11px] font-semibold text-[#cbd3dc] transition hover:text-white active:translate-y-px">
                <Icon size={17} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </section>
      </div>

      {!isCreator || isDemoMode ? (
        <footer className="shrink-0 border-t border-white/10 bg-[#081017] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
          <button type="button" onClick={onCreateMap} className="flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] bg-[#e65c43] px-4 text-[12px] font-black text-white transition hover:bg-[#ef684f] active:scale-[0.98]">
            <Compass size={16} weight="fill" aria-hidden="true" />
            Crear mi mapa
          </button>
        </footer>
      ) : null}
    </div>
  );
}

function ActionButton({ Icon, label, onClick, accent = false }: { Icon: typeof Compass; label: string; onClick: () => void; accent?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={cn("flex h-12 items-center justify-center gap-2 rounded-[1rem] border px-3 text-[11px] font-black transition active:scale-[0.98]", accent ? "border-[#ff5a3d]/35 bg-[#ff5a3d]/12 text-[#ffab99]" : "border-white/10 bg-white/[0.035] text-white hover:bg-white/[0.06]")}>
      <Icon size={16} aria-hidden="true" />
      {label}
    </button>
  );
}

function Metric({ label, value, Icon }: { label: string; value: number; Icon: typeof Compass }) {
  return (
    <div className="px-3 py-3">
      <Icon size={15} className="text-[#ff8f78]" aria-hidden="true" />
      <p className="mt-3 font-mono text-[18px] font-black text-white">{formatCompact(value)}</p>
      <p className="mt-1 text-[9px] uppercase tracking-[0.1em] text-[#8995a1]">{label}</p>
    </div>
  );
}

function EmptyPanel({ Icon, title, detail }: { Icon: typeof Compass; title: string; detail: string }) {
  return (
    <div className="grid min-h-[260px] place-items-center px-6 text-center">
      <div>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/[0.035] text-[#ff8f78]">
          <Icon size={20} aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-[14px] font-semibold text-white">{title}</h3>
        <p className="mx-auto mt-2 max-w-[30ch] text-[11px] leading-5 text-[#8d98a4]">{detail}</p>
      </div>
    </div>
  );
}

function formatCompact(value: number) {
  if (!Number.isFinite(value)) return "0";
  if (value >= 1_000_000) return `${Math.round(value / 100_000) / 10}M`;
  if (value >= 1_000) return `${Math.round(value / 100) / 10}K`;
  return String(Math.round(value));
}
