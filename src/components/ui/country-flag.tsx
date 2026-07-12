"use client";

import { cn } from "@/lib/utils";
import { getCountryFlagClassName, normalizeCountryCode } from "@/lib/country-flags";

interface CountryFlagProps {
  code?: string | null;
  className?: string;
  size?: number;
  title?: string;
}

export function CountryFlag({ code, className, size = 16, title }: CountryFlagProps) {
  const normalized = normalizeCountryCode(code);
  if (!normalized) {
    return (
      <span
        aria-hidden={title ? undefined : "true"}
        title={title}
        className={cn("inline-grid shrink-0 place-items-center rounded-[2px] border border-current/25 text-[7px] font-semibold", className)}
        style={{ width: size, height: Math.round(size * 0.75) }}
      >
        --
      </span>
    );
  }

  return (
    <span
      aria-hidden={title ? undefined : "true"}
      title={title}
      className={cn(getCountryFlagClassName(normalized), "inline-block shrink-0 rounded-[2px]", className)}
      style={{ width: size, height: Math.round(size * 0.75) }}
    />
  );
}
