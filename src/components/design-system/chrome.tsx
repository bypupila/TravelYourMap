"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { GlobeHemisphereWest, MagnifyingGlass } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FloatingTopBarProps {
  eyebrow: string;
  title: string;
  titleClassName?: string;
  actions?: ReactNode;
  className?: string;
  searchPlaceholder?: string;
  searchInput?: ReactNode;
  centerContent?: ReactNode;
  logoBadgeContent?: ReactNode;
  hideSearch?: boolean;
}

export function FloatingTopBar({
  eyebrow,
  title,
  titleClassName,
  actions,
  className,
  searchPlaceholder = "Search across videos, countries, or creators",
  searchInput,
  centerContent,
  logoBadgeContent,
  hideSearch = false,
}: FloatingTopBarProps) {
  return (
    <div className={cn("pointer-events-auto mx-auto grid w-full min-w-0 grid-cols-1 gap-3 tym-navbar tm-refraction md:grid-cols-[minmax(0,1fr)_auto] md:items-center lg:grid-cols-[auto_minmax(0,1fr)_auto]", className)}>
      <div className="tym-logo-lockup min-w-0 shrink-0">
        <Link
          href="/"
          aria-label="Go to homepage"
          className="tym-logo-badge cursor-pointer transition-transform duration-200 hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {logoBadgeContent || <GlobeHemisphereWest size={20} weight="duotone" />}
        </Link>
        <div className="min-w-0">
          <p className="tym-overline">{eyebrow}</p>
          <p className={cn("truncate text-[15px] font-medium text-foreground", titleClassName)}>{title}</p>
        </div>
      </div>

      {centerContent || searchInput || !hideSearch ? (
        <div className="min-w-0 w-full md:order-3 md:col-span-2 md:justify-self-center md:px-1 lg:order-none lg:col-span-1 lg:px-4">
          {searchInput || centerContent || (
            <div className="tym-search platform-shimmer" aria-hidden="true">
              <div className="flex h-full items-center pl-4 text-[13px] text-muted-foreground">
                <MagnifyingGlass size={16} />
              </div>
              <div className="flex h-full min-w-0 flex-1 items-center px-3 text-[13px] text-muted-foreground">
                {searchPlaceholder}
              </div>
            </div>
          )}
        </div>
      ) : null}

      <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 md:ml-auto md:justify-self-end lg:flex-nowrap">
        {actions}
      </div>
    </div>
  );
}

export function MetricPill({ text, className }: { text: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn("bg-white/[0.04] text-foreground", className)}>
      {text}
    </Badge>
  );
}

export function SignalPill({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("tym-chip bg-white/[0.06] text-foreground", className)}>
      <span className="platform-signal-dot h-2 w-2 rounded-full bg-primary" />
      <span>{text}</span>
    </div>
  );
}
