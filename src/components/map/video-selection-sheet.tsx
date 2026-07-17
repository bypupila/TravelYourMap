"use client";

import Image from "next/image";
import { useMemo } from "react";
import { BatteryCharging, CaretLeft, CaretRight, ChatCircle, CheckCircle, Clock, Eye, Heart, MapPin, Play, X } from "@phosphor-icons/react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { CountryFlag } from "@/components/ui/country-flag";
import { DesktopVideoMapCard } from "@/components/map/desktop-video-map-card";
import type { VideoActivityController } from "@/components/map/video-activity";
import {
  buildCountryVideoSections,
  formatCompactNumber,
  formatVideoDate,
  formatVideoDuration,
  formatVideoPlace,
  getYouTubeHref,
  getVideoWatchStateLabel,
  getVideoWatchStateTone,
} from "@/components/map/video-viewer-utils";
import { DemoVideoEmbedPreview } from "@/components/map/demo-video-embed-preview";
import { YouTubeEmbedPlayer } from "@/components/map/youtube-embed-player";
import { getDemoMapPreviewImage } from "@/lib/demo-video-previews";
import { getSponsorCardStyleLabel } from "@/lib/sponsor-card-style";
import type { TravelVideoLocation } from "@/lib/types";
import type { MapRailSponsor } from "@/lib/map-types";
import { cn } from "@/lib/utils";
import { toCompactYouTubeThumbnail } from "@/lib/youtube-thumbnails";

interface VideoSelectionSheetProps {
  open: boolean;
  videos: TravelVideoLocation[];
  currentVideo: TravelVideoLocation | null;
  presentation?: "default" | "desktop-card";
  sponsors?: MapRailSponsor[];
  hidePlatformAds?: boolean;
  platformAd?: {
    title: string;
    description?: string | null;
    cta_label?: string | null;
    href?: string | null;
  } | null;
  resolveSponsorNames?: (video: TravelVideoLocation | null | undefined) => string[];
  activity: VideoActivityController;
  onClose: () => void;
  onChangeVideo: (video: TravelVideoLocation) => void;
  onOpenInYouTube?: (video: TravelVideoLocation) => void;
  openButtonLabel?: string;
  playbackCommand?: { id: number; action: "pause" | "play" } | null;
  initialStartSeconds?: number | null;
  onPlaybackStateChange?: (state: "playing" | "paused" | "ended") => void;
  onPlaybackProgress?: (progress: {
    positionSeconds: number;
    durationSeconds: number;
    watchedDeltaSeconds: number;
  }) => void;
  isDemoMode?: boolean;
}

export function VideoSelectionSheet(props: VideoSelectionSheetProps) {
  if (props.presentation === "desktop-card") {
    return <DesktopCardVideoSelectionSheet {...props} />;
  }

  return <LegacyVideoSelectionSheet {...props} />;
}

function DesktopCardVideoSelectionSheet({
  open,
  videos,
  currentVideo,
  sponsors = [],
  hidePlatformAds = false,
  platformAd = null,
  activity,
  onClose,
  onChangeVideo,
  onOpenInYouTube,
  openButtonLabel,
  playbackCommand,
  initialStartSeconds = null,
  onPlaybackStateChange,
  onPlaybackProgress,
  isDemoMode = false,
}: VideoSelectionSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        overlayClassName="bg-[#020305]/82 backdrop-blur-[6px]"
        className="travel-video-sheet-content z-[460] overflow-y-auto overscroll-contain rounded-none border-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,90,61,0.08),transparent_34%),rgba(3,6,10,0.98)] p-0 text-white shadow-none sm:max-w-none data-[side=bottom]:h-[100dvh] data-[side=bottom]:max-h-[100dvh]"
      >
        <SheetTitle className="sr-only">Visor de video del mapa</SheetTitle>
        <SheetDescription className="sr-only">
          El mismo visor de desktop, adaptado para pantallas mobile y tablet.
        </SheetDescription>

        <div className="flex min-h-full w-full items-start justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:items-center sm:px-6 sm:py-6">
          <DesktopVideoMapCard
            videos={videos}
            currentVideo={currentVideo}
            sponsors={sponsors}
            hidePlatformAds={hidePlatformAds}
            platformAd={platformAd}
            activity={activity}
            onClose={onClose}
            onChangeVideo={onChangeVideo}
            onOpenInYouTube={onOpenInYouTube}
            openButtonLabel={openButtonLabel}
            playbackCommand={playbackCommand}
            initialStartSeconds={initialStartSeconds}
            onPlaybackStateChange={onPlaybackStateChange}
            onPlaybackProgress={onPlaybackProgress}
            variant="youtube-theater"
            isDemoMode={isDemoMode}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function LegacyVideoSelectionSheet({ open, videos, currentVideo, resolveSponsorNames, activity, onClose, onChangeVideo, onOpenInYouTube, openButtonLabel, playbackCommand, initialStartSeconds = null, onPlaybackStateChange, onPlaybackProgress, isDemoMode = false }: VideoSelectionSheetProps) {
  const currentCountryCode = String(currentVideo?.country_code || "").toUpperCase();
  const sections = useMemo(() => buildCountryVideoSections(videos, currentVideo), [currentVideo, videos]);

  const orderedVideos = useMemo(() => sections.flatMap((section) => section.videos), [sections]);
  const currentIndex = Math.max(
    0,
    orderedVideos.findIndex((video) => video.youtube_video_id === currentVideo?.youtube_video_id)
  );
  const currentSection = sections.find((section) => section.country_code === currentCountryCode) || sections[0] || null;
  const currentSeen = Boolean(currentVideo?.youtube_video_id && activity.seenIds.has(currentVideo.youtube_video_id));
  const currentOpenedInYoutube = Boolean(currentVideo?.youtube_video_id && activity.openedIds.has(currentVideo.youtube_video_id));
  const currentWatchStatus = currentVideo?.youtube_video_id ? activity.watchStatusById[currentVideo.youtube_video_id] : undefined;
  const currentWatchBadgeLabel = getVideoWatchStateLabel({
    openedInYoutube: currentOpenedInYoutube,
    watchStatus: currentWatchStatus,
  });
  const currentWatchBadgeTone = getVideoWatchStateTone({
    openedInYoutube: currentOpenedInYoutube,
    watchStatus: currentWatchStatus,
  });
  const currentSponsorNames = resolveSponsorNames?.(currentVideo) || [];
  const youtubeHref = getYouTubeHref(currentVideo);

  function go(direction: -1 | 1) {
    if (orderedVideos.length === 0) return;
    const nextIndex = (currentIndex + direction + orderedVideos.length) % orderedVideos.length;
    const nextVideo = orderedVideos[nextIndex];
    if (nextVideo) onChangeVideo(nextVideo);
  }

  function openYouTubeVideo() {
    if (isDemoMode) return;
    if (!currentVideo || !youtubeHref) return;

    if (!currentVideo.made_for_kids) {
      posthog.capture("video_youtube_opened", {
        video_id: currentVideo.youtube_video_id,
        video_title: currentVideo.title,
        country_code: currentVideo.country_code,
        country_name: currentVideo.country_name,
      });
    }
    activity.markVideoOpened(currentVideo.youtube_video_id);
    onOpenInYouTube?.(currentVideo);
    window.open(youtubeHref, "_blank", "noopener");
  }

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        overlayClassName="bg-[#020508]/72 backdrop-blur-sm"
        className="travel-video-sheet-content z-[460] gap-0 overflow-hidden rounded-none border-white/10 bg-[linear-gradient(180deg,rgba(8,15,21,0.99),rgba(5,9,13,0.99))] p-0 text-white shadow-[0_34px_110px_-44px_rgba(0,0,0,0.96)] sm:max-w-none data-[side=bottom]:h-[100dvh] data-[side=bottom]:max-h-[100dvh] lg:rounded-2xl lg:border"
      >
        <SheetTitle className="sr-only">Visor de video del mapa</SheetTitle>
        <SheetDescription className="sr-only">
          Revisa el video seleccionado en el mapa y navega una lista scrolleable de videos relacionados.
        </SheetDescription>

        <div className="flex h-full min-h-0 flex-col">
          <header className="flex min-h-[68px] shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5 sm:px-5 lg:min-h-0 lg:py-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#ff8272] lg:text-[11px] lg:font-semibold lg:tracking-[0.16em] lg:text-[#ff6b64]">Video seleccionado</p>
              <h2 className="mt-1 line-clamp-1 text-[14px] font-semibold leading-5 text-[#f4f7fb] lg:truncate lg:text-[15px]">
                {currentVideo?.title || "Selecciona un video"}
              </h2>
              {currentSponsorNames.length > 0 ? (
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <p className="truncate text-[10px] font-bold uppercase tracking-[0.08em] text-[#ffb49f]">
                    Sponsor: {currentSponsorNames.join(", ")}
                  </p>
                  <span className="rounded-full border border-[#ff5a3d]/20 bg-[#ff5a3d]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-[#ff9c84]">
                    {getSponsorCardStyleLabel(currentVideo?.sponsor_card_style, currentSponsorNames.length)}
                  </span>
                </div>
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Cerrar visor de video"
              onClick={onClose}
              className="shrink-0 border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
            >
              <X size={16} />
            </Button>
          </header>

          <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_320px] lg:grid-rows-1">
            <section className="min-h-0 border-b border-white/10 px-3 py-3 lg:border-b-0 lg:border-r lg:px-5 lg:py-5">
              <div className="flex h-full min-h-0 flex-col">
                <div className="relative overflow-hidden rounded-[1rem] border border-white/10 bg-black/35 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_70px_-38px_rgba(0,0,0,0.92)] lg:rounded-2xl lg:p-2">
                  <div className="absolute left-3 top-3 z-[2] inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full border border-white/10 bg-[#060a0e]/80 px-2.5 py-1 text-[10px] text-white backdrop-blur-md lg:left-4 lg:top-4 lg:max-w-[calc(100%-2rem)] lg:gap-2 lg:px-3 lg:py-1.5 lg:text-[12px]">
                    <CountryFlag code={currentVideo?.country_code} size={12} />
                    <span className="truncate font-medium">{currentVideo?.country_name || currentVideo?.country_code || "Destino"}</span>
                    <span className="text-white/45">/</span>
                    <span>{currentIndex + 1} de {Math.max(1, orderedVideos.length)}</span>
                  </div>
                  {isDemoMode ? (
                    <DemoVideoEmbedPreview
                      video={currentVideo}
                      openButtonLabel={openButtonLabel || (currentOpenedInYoutube ? "Visto en YouTube" : "Abrir en YouTube")}
                      className="[&>div:last-child]:hidden lg:[&>div:last-child]:flex"
                      frameClassName="min-h-0 max-h-none rounded-[0.75rem] lg:min-h-[202px] lg:rounded-xl"
                    />
                  ) : (
                    <YouTubeEmbedPlayer
                      videoId={currentVideo?.youtube_video_id || null}
                      title={currentVideo?.title || "Video seleccionado"}
                      youtubeHref={youtubeHref}
                      thumbnailUrl={currentVideo?.thumbnail_url || null}
                      openButtonLabel={openButtonLabel || (currentOpenedInYoutube ? "Visto en YouTube" : "Abrir en YouTube")}
                      fullscreenOnPlay
                      playbackCommand={playbackCommand}
                      initialStartSeconds={initialStartSeconds}
                      onOpenInYouTube={openYouTubeVideo}
                      onPlaybackStateChange={onPlaybackStateChange}
                      onPlaybackProgress={onPlaybackProgress}
                      isMadeForKids={Boolean(currentVideo?.made_for_kids)}
                      className="[&>div:last-child]:hidden lg:[&>div:last-child]:flex"
                      frameClassName="min-h-0 max-h-none rounded-[0.75rem] lg:min-h-[202px] lg:rounded-xl"
                    />
                  )}
                </div>

                <div className="mt-2 grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2 lg:mt-3 lg:grid-cols-[1fr_auto_1fr]">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    className="col-start-1 flex h-11 w-11 min-w-0 items-center justify-center gap-1 rounded-full border border-white/10 bg-white/[0.04] text-[12px] text-white backdrop-blur-md transition hover:bg-white/[0.08] active:scale-[0.96] lg:w-auto lg:min-w-[116px] lg:justify-self-start lg:rounded-md lg:bg-black/45 lg:px-3 lg:hover:bg-black/70"
                    aria-label="Video anterior"
                  >
                    <CaretLeft size={16} />
                    <span className="hidden lg:inline">Anterior</span>
                  </button>

                  <span
                    className={cn(
                      "col-start-2 inline-flex h-9 min-w-0 items-center justify-self-center rounded-full border px-3 text-[9px] font-black uppercase tracking-[0.08em] lg:h-11 lg:gap-1 lg:px-2.5 lg:text-[10px]",
                      currentWatchBadgeTone === "success"
                          ? "border-[rgba(85,200,123,0.45)] bg-[rgba(85,200,123,0.12)] text-[#c8f3d6]"
                          : currentWatchBadgeTone === "watch_later"
                            ? "border-[rgba(59,130,246,0.35)] bg-[rgba(59,130,246,0.12)] text-[#9ec1ff]"
                            : currentWatchBadgeTone === "danger"
                              ? "border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.12)] text-[#ffb4b4]"
                              : "border-white/10 bg-white/[0.04] text-[#d8dee6]"
                    )}
                  >
                    <BatteryCharging size={12} weight="fill" />
                    {currentWatchBadgeLabel}
                  </span>

                  <button
                    type="button"
                    onClick={() => go(1)}
                    className="col-start-3 flex h-11 w-11 min-w-0 items-center justify-center gap-1 rounded-full border border-white/10 bg-white/[0.04] text-[12px] text-white backdrop-blur-md transition hover:bg-white/[0.08] active:scale-[0.96] lg:w-auto lg:min-w-[116px] lg:justify-self-end lg:rounded-md lg:bg-black/45 lg:px-3 lg:hover:bg-black/70"
                    aria-label="Siguiente video"
                  >
                    <span className="hidden lg:inline">Siguiente</span>
                    <CaretRight size={16} />
                  </button>
                </div>

                <div className="mt-2 min-w-0 lg:mt-4">
                  <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto pb-1 text-[10px] text-[#aab2bc] [scrollbar-width:none] lg:flex-wrap lg:gap-2 lg:overflow-visible lg:pb-0 lg:text-[12px]">
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                      <MapPin size={13} />
                      {formatVideoPlace(currentVideo)}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                      <Clock size={13} />
                      {formatVideoDate(currentVideo?.published_at)}
                    </span>
                    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] lg:text-[11px]", currentSeen ? "bg-[#ff5a3d] text-white" : "bg-white text-[#e1543a]")}>
                      {currentSeen ? <CheckCircle size={13} weight="fill" /> : null}
                      {currentSeen ? "Visto" : "Nuevo"}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 lg:mt-3 lg:gap-2 lg:divide-x-0 lg:border-t-0">
                    <MetricPill icon={Eye} label="Vistas" value={formatCompactNumber(Number(currentVideo?.view_count || 0))} />
                    <MetricPill icon={Heart} label="Likes" value={formatCompactNumber(Number(currentVideo?.like_count || 0))} />
                    <MetricPill icon={ChatCircle} label="Comentarios" value={formatCompactNumber(Number(currentVideo?.comment_count || 0))} />
                  </div>
                </div>
              </div>
            </section>

            <aside className="flex min-h-0 flex-col">
              <div className="flex min-h-[52px] shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-2 lg:block lg:min-h-0 lg:py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8f98a3] lg:text-[11px] lg:font-semibold">Videos relacionados</p>
                <p className="truncate text-[11px] text-[#d8dee6] lg:mt-1 lg:text-[13px]">
                  {currentSection ? (
                    <>
                      <CountryFlag code={currentSection.country_code} size={12} className="mr-1 align-[-1px]" />
                      {currentSection.country_name} primero
                    </>
                  ) : (
                    "Lista del mapa"
                  )}
                </p>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2 [scrollbar-width:thin] lg:py-3" data-map-scroll="true">
                {sections.length > 0 ? (
                  <div className="space-y-4">
                    {sections.map((section) => (
                      <section key={section.country_code} className="space-y-2">
                        <div className="flex items-center justify-between gap-3 px-1">
                          <h4 className="truncate text-[12px] font-semibold text-[#f4f7fb]">
                            <CountryFlag code={section.country_code} size={12} className="mr-1 align-[-1px]" />
                            {section.country_name}
                          </h4>
                          <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-[#aab2bc]">
                            {section.videos.length}
                          </span>
                        </div>

                        {section.videos.map((video) => (
                          <VideoRow
                            key={`${section.country_code}-${video.youtube_video_id}`}
                            video={video}
                            sponsorNames={resolveSponsorNames?.(video) || []}
                            isDemoMode={isDemoMode}
                            active={video.youtube_video_id === currentVideo?.youtube_video_id}
                            seen={activity.seenIds.has(video.youtube_video_id)}
                            onSelect={() => onChangeVideo(video)}
                          />
                        ))}
                      </section>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-[13px] text-[#aab2bc]">
                    No hay videos disponibles para este mapa.
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function VideoRow({
  video,
  sponsorNames,
  isDemoMode,
  active,
  seen,
  onSelect,
}: {
  video: TravelVideoLocation;
  sponsorNames: string[];
  isDemoMode: boolean;
  active: boolean;
  seen: boolean;
  onSelect: () => void;
}) {
  const thumbnailSrc = isDemoMode ? getDemoMapPreviewImage(video.youtube_video_id) : (toCompactYouTubeThumbnail(video.thumbnail_url) || video.thumbnail_url);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group grid w-full grid-cols-[80px_minmax(0,1fr)] gap-x-2 rounded-xl border p-2 text-left transition hover:bg-white/[0.07] active:scale-[0.99] lg:flex",
        active
          ? "border-[rgba(255, 90, 61,0.32)] bg-[rgba(255, 90, 61,0.12)]"
          : "border-white/10 bg-white/[0.035]"
      )}
    >
      <span className="relative row-span-2 h-[54px] w-20 shrink-0 overflow-hidden rounded-lg bg-white/[0.05] lg:h-[62px] lg:w-[92px]">
        {thumbnailSrc ? (
          <Image
            src={thumbnailSrc}
            alt={video.title}
            width={184}
            height={124}
            sizes="(max-width: 1023px) 80px, 92px"
            className="h-full w-full object-cover"
          />
        ) : null}
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
          <Play size={18} weight="fill" />
        </span>
      </span>

      <span className="col-start-2 min-w-0 flex-1">
        <span className="line-clamp-2 text-[12px] font-semibold leading-4 text-[#f4f7fb]">{video.title}</span>
        {sponsorNames.length > 0 ? (
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="truncate text-[10px] font-bold uppercase tracking-[0.06em] text-[#ffb49f]">
              Sponsor: {sponsorNames.join(", ")}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-[#d5dbe2]">
              {getSponsorCardStyleLabel(video.sponsor_card_style, sponsorNames.length)}
            </span>
          </div>
        ) : null}
        <span className="mt-1 block truncate text-[11px] text-[#9da5ae]">{formatVideoPlace(video)}</span>
        <span className="mt-1 flex items-center gap-2 text-[10px] text-[#7f8994]">
          <span>{formatVideoDuration(video.duration_seconds)}</span>
          <span>{formatVideoDate(video.published_at)}</span>
        </span>
      </span>

      <span className={cn("col-start-2 mt-1 w-fit shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold lg:text-[10px]", seen ? "bg-white/10 text-[#f4f7fb]" : "bg-[rgba(255, 90, 61,0.16)] text-[#ffb7b3]")}>
        {seen ? "Visto" : "Nuevo"}
      </span>
    </button>
  );
}

function MetricPill({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: string }) {
  return (
    <div className="min-w-0 px-2 py-2 lg:rounded-xl lg:border lg:border-white/10 lg:bg-white/[0.035] lg:px-3">
      <p className="flex items-center gap-1 text-[8px] uppercase tracking-[0.1em] text-[#8f98a3] lg:gap-1.5 lg:text-[10px] lg:tracking-[0.12em]">
        <Icon size={12} />
        {label}
      </p>
      <p className="mt-1 truncate font-mono text-[13px] font-bold text-[#f4f7fb] lg:font-sans lg:text-[15px] lg:font-semibold">{value}</p>
    </div>
  );
}
