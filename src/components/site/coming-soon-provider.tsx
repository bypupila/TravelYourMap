"use client";

import { Clock, X } from "@phosphor-icons/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  COMING_SOON_DURATION_MS,
  type ComingSoonFeatureId,
  type ComingSoonSurfaceId,
} from "@/lib/coming-soon";

const VISITOR_STORAGE_KEY = "travel-your-map:anonymous-visitor-id";

type ComingSoonNotice = {
  nonce: number;
};

type ComingSoonContextValue = {
  showComingSoon: (featureId: ComingSoonFeatureId, surfaceId: ComingSoonSurfaceId) => void;
};

const ComingSoonContext = createContext<ComingSoonContextValue | null>(null);

function getAnonymousVisitorId() {
  try {
    const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);
    if (existing) return existing;
    const generated = window.crypto.randomUUID();
    window.localStorage.setItem(VISITOR_STORAGE_KEY, generated);
    return generated;
  } catch {
    return window.crypto.randomUUID();
  }
}

export function ComingSoonProvider({ children }: { children: React.ReactNode }) {
  const [notice, setNotice] = useState<ComingSoonNotice | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const dismiss = useCallback(() => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setNotice(null);
  }, []);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    },
    []
  );

  const showComingSoon = useCallback((featureId: ComingSoonFeatureId, surfaceId: ComingSoonSurfaceId) => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    setNotice({ nonce: Date.now() });
    timeoutRef.current = window.setTimeout(dismiss, COMING_SOON_DURATION_MS);

    void fetch("/api/analytics/coming-soon", {
      method: "POST",
      headers: { "content-type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        featureId,
        surfaceId,
        anonymousVisitorId: getAnonymousVisitorId(),
        path: `${window.location.pathname}${window.location.search}`,
      }),
    }).catch(() => undefined);
  }, [dismiss]);

  return (
    <ComingSoonContext.Provider value={{ showComingSoon }}>
      {children}
      {notice ? (
        <div
          key={notice.nonce}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+5rem)] bottom-auto z-[2000] mx-auto flex min-h-14 w-[80%] items-center overflow-hidden rounded-2xl border border-[rgba(255,90,70,0.34)] bg-[#241b19] text-[#fffdf7] shadow-[0_18px_60px_rgba(0,0,0,0.48)] sm:inset-x-auto sm:top-auto sm:right-6 sm:bottom-6 sm:mx-0 sm:w-[min(100%,28rem)]"
        >
          <span className="grid min-h-14 w-14 shrink-0 place-items-center self-stretch bg-[#ff5a46] text-white" aria-hidden="true">
            <Clock size={23} weight="bold" />
          </span>
          <span className="min-w-0 flex-1 px-4 py-3 text-sm font-bold">Próximamente</span>
          <button
            type="button"
            onClick={dismiss}
            className="mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white/60 transition hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a46]"
            aria-label="Cerrar notificación"
          >
            <X size={18} />
          </button>
        </div>
      ) : null}
    </ComingSoonContext.Provider>
  );
}

export function useComingSoon() {
  const context = useContext(ComingSoonContext);
  if (!context) throw new Error("useComingSoon must be used inside ComingSoonProvider");
  return context;
}
