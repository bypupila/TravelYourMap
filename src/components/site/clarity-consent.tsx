"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  isClarityAllowedPath,
  isClarityConfigured,
  readClarityConsent,
  saveClarityConsent,
} from "@/lib/clarity-consent";

const OPEN_PREFERENCES_EVENT = "travel:clarity-preferences";

export function ClarityConsent() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [en, setEn] = useState(false);

  useEffect(() => {
    setOpen(readClarityConsent() === null);
    setEn(document.documentElement.lang === "en");
    const showPreferences = () => setOpen(true);
    window.addEventListener(OPEN_PREFERENCES_EVENT, showPreferences);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, showPreferences);
  }, []);

  // Client-side navigation keeps the page loaded, so leaving the allowlist must revoke and reload.
  useEffect(() => {
    if (!isClarityAllowedPath(pathname) && document.getElementById("microsoft-clarity-script")) {
      window.clarity?.("consent", false);
      window.location.reload();
    }
  }, [pathname]);

  if (!isClarityConfigured() || !open || !isClarityAllowedPath(pathname)) return null;

  const choose = (accepted: boolean) => {
    saveClarityConsent(accepted);
    setOpen(false);
  };

  return (
    <aside
      aria-label={en ? "Analytics preferences" : "Preferencias de analítica"}
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-2xl rounded-2xl border border-white/20 bg-[#101921] p-4 text-sm text-white shadow-2xl sm:inset-x-6 sm:bottom-6 sm:p-5"
    >
      <p className="font-semibold">{en ? "Help us improve TravelYourMap" : "Ayúdanos a mejorar TravelYourMap"}</p>
      <p className="mt-2 leading-6 text-white/75">
        {en ? "With your permission, Microsoft Clarity records masked interactions and session replays. You can change your choice in the " : "Con tu permiso, Microsoft Clarity registra interacciones y reproducciones de sesión enmascaradas. Puedes cambiar tu decisión desde la "}
        <Link href="/privacy" className="underline underline-offset-2">{en ? "privacy policy" : "política de privacidad"}</Link>.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => choose(true)} className="min-h-11 rounded-lg bg-[#ff5a3d] px-4 font-semibold text-white">
          {en ? "Accept analytics" : "Aceptar analítica"}
        </button>
        <button type="button" onClick={() => choose(false)} className="min-h-11 rounded-lg border border-white/30 px-4 font-semibold text-white">
          {en ? "Decline" : "Rechazar"}
        </button>
      </div>
    </aside>
  );
}

export function ClarityConsentPreferences({ en }: { en: boolean }) {
  if (!isClarityConfigured()) return null;
  return (
    <button
      type="button"
      className="underline underline-offset-2"
      onClick={() => window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT))}
    >
      {en ? "Change analytics preferences" : "Cambiar preferencias de analítica"}
    </button>
  );
}
