"use client";

import { useState } from "react";
import { SignOut } from "@phosphor-icons/react";

export function LogoutButton({ label, redirectHref }: { label: string; redirectHref: string }) {
  const [isPending, setIsPending] = useState(false);
  const [hasError, setHasError] = useState(false);

  async function logout() {
    if (isPending) return;
    setIsPending(true);
    setHasError(false);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("No se pudo cerrar la sesión.");
      window.location.assign(redirectHref);
    } catch {
      setHasError(true);
      setIsPending(false);
    }
  }

  const errorMessage = label === "Sign out" ? "Sign out failed. Try again." : "No se pudo cerrar la sesión. Inténtalo nuevamente.";
  const accessibleLabel = hasError ? errorMessage : label;

  return (
    <>
      <button
        type="button"
        onClick={() => void logout()}
        disabled={isPending}
        aria-label={accessibleLabel}
        title={accessibleLabel}
        className={`inline-grid h-10 w-10 shrink-0 place-items-center rounded-full border bg-white/[0.045] transition hover:bg-white/[0.08] hover:text-white disabled:cursor-wait disabled:opacity-50 ${hasError ? "border-red-400/50 text-red-300" : "border-white/10 text-white/62 hover:border-white/20"}`}
      >
        <SignOut size={16} weight="bold" aria-hidden="true" />
      </button>
      {hasError ? <span className="sr-only" aria-live="polite">{errorMessage}</span> : null}
    </>
  );
}
