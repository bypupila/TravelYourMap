"use client";

import type { ButtonHTMLAttributes } from "react";
import { useComingSoon } from "@/components/site/coming-soon-provider";
import type { ComingSoonFeatureId, ComingSoonSurfaceId } from "@/lib/coming-soon";

type ComingSoonButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  featureId: ComingSoonFeatureId;
  surfaceId: ComingSoonSurfaceId;
};

export function ComingSoonButton({ featureId, surfaceId, onClick, type = "button", ...props }: ComingSoonButtonProps) {
  const { showComingSoon } = useComingSoon();

  return (
    <button
      {...props}
      type={type}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) showComingSoon(featureId, surfaceId);
      }}
    />
  );
}
