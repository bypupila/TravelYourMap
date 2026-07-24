"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowClockwise, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ContactStrip } from "@/components/site/contact-strip";
import { Skeleton } from "@/components/ui/skeleton";

type ConsentState = {
  account_operation: { accepted: boolean; consent_version: string; accepted_at: string } | null;
  platform_promotions: { accepted: boolean; consent_version: string; accepted_at: string } | null;
  creator_promotions: { accepted: boolean; consent_version: string; accepted_at: string } | null;
};

export default function AuthConsentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [consentPlatformPromotions, setConsentPlatformPromotions] = useState(false);
  const [consentCreatorPromotions, setConsentCreatorPromotions] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [deleteReason, setDeleteReason] = useState("");

  const loadConsents = useCallback(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);
    fetch("/api/auth/consents", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          router.replace("/auth?next=%2Fauth%2Fconsents");
          throw new Error("Tu sesión venció. Volvé a iniciar sesión.");
        }
        if (!response.ok) throw new Error("No se pudo cargar consentimientos.");
        return response.json() as Promise<ConsentState>;
      })
      .then((data) => {
        if (!active) return;
        setConsentPlatformPromotions(Boolean(data.platform_promotions?.accepted));
        setConsentCreatorPromotions(Boolean(data.creator_promotions?.accepted));
      })
      .catch((loadError) => {
        if (!active) return;
        setLoadError(loadError instanceof Error ? loadError.message : "No se pudo cargar consentimientos.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => loadConsents(), [loadConsents]);

  async function saveConsents() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/auth/consents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consentVersion: "v1",
          platformPromotions: consentPlatformPromotions,
          creatorPromotions: consentCreatorPromotions,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (response.status === 401) {
        router.replace("/auth?next=%2Fauth%2Fconsents");
        throw new Error("Tu sesión venció. Volvé a iniciar sesión.");
      }
      if (!response.ok) throw new Error(payload?.error || "No se pudieron guardar consentimientos.");
      setMessage("Preferencias guardadas correctamente.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudieron guardar consentimientos.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteViewerAccount() {
    setDeleting(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/auth/viewer-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmationText: deleteConfirmationText.trim(),
          reason: deleteReason.trim() || null,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error || "No se pudo eliminar la cuenta.");
      router.push("/");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar la cuenta.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden text-foreground">
      <div className="relative z-10 mx-auto max-w-[760px] px-4 py-8">
        <section className="tm-surface-strong min-h-[744px] rounded-[2rem] border border-white/10 p-6 sm:min-h-[708px] sm:p-8">
          <p className="tym-overline">Privacidad</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-foreground">Consentimientos</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Puedes cambiar tus consentimientos promocionales cuando quieras. El consentimiento de operación de cuenta es obligatorio para mantener acceso.
          </p>

          {loading ? (
            <ConsentsSkeleton />
          ) : loadError ? (
            <ConsentsLoadError error={loadError} onRetry={loadConsents} />
          ) : (
            <div className="mt-6 grid gap-3">
              <label className="flex min-h-11 items-start gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
                  checked={consentPlatformPromotions}
                  onChange={(event) => setConsentPlatformPromotions(event.target.checked)}
                />
                <span>Recibir promociones de TravelYourMap.</span>
              </label>
              <label className="flex min-h-11 items-start gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
                  checked={consentCreatorPromotions}
                  onChange={(event) => setConsentCreatorPromotions(event.target.checked)}
                />
                <span>Recibir promociones de creadores.</span>
              </label>

              <div className="mt-2 flex items-center gap-2">
                <Button onClick={saveConsents} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar preferencias"}
                </Button>
                <Link href="/" className="text-sm text-muted-foreground underline underline-offset-2">
                  Volver
                </Link>
              </div>
            </div>
          )}

          {!loading && !loadError ? (
            <div className="mt-8 rounded-2xl border border-[#ff5a3d]/30 bg-[#ff5a3d]/10 p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#ffcabf]">Zona crítica</p>
              <h2 className="mt-1 text-sm font-semibold text-[#ffd8d1]">Eliminar cuenta viewer</h2>
              <p className="mt-2 text-xs text-[#ffd8d1]/85">
                Esta acción elimina tu perfil viewer, consentimientos y credenciales de acceso. Para continuar, escribe exactamente{" "}
                <span className="font-semibold">ELIMINAR MI CUENTA</span>.
              </p>
              <div className="mt-3 grid gap-2">
                <input
                  value={deleteConfirmationText}
                  onChange={(event) => setDeleteConfirmationText(event.target.value)}
                  placeholder="ELIMINAR MI CUENTA"
                  className="h-11 rounded-lg border border-white/15 bg-black/20 px-3 text-[13px] text-white outline-none lg:h-10"
                />
                <input
                  value={deleteReason}
                  onChange={(event) => setDeleteReason(event.target.value)}
                  placeholder="Motivo (opcional)"
                  className="h-11 rounded-lg border border-white/15 bg-black/20 px-3 text-[13px] text-white outline-none lg:h-10"
                />
                <Button
                  onClick={deleteViewerAccount}
                  disabled={deleting || deleteConfirmationText.trim() !== "ELIMINAR MI CUENTA"}
                  variant="destructive"
                >
                  {deleting ? "Eliminando..." : "Eliminar mi cuenta"}
                </Button>
              </div>
            </div>
          ) : null}

        {error ? <p className="mt-3 text-sm text-[#ffb0a7]">{error}</p> : null}
        {message ? <p className="mt-3 text-sm text-[#b7d9ff]">{message}</p> : null}
      </section>
      <ContactStrip
        title="Contacto"
        description="Para soporte de cuenta, escribe a support. Para consultas generales, hello sigue siendo el canal principal."
        items={[
          { label: "Soporte", email: "support" },
          { label: "General", email: "hello" },
        ]}
        tone="dark"
        className="mt-6"
      />
      </div>
    </main>
  );
}

function ConsentsSkeleton() {
  return (
    <div className="mt-6" aria-busy="true" aria-label="Cargando tus preferencias">
      <p className="text-sm text-muted-foreground">Cargando tus preferencias</p>
      <div className="mt-4 grid gap-3" aria-hidden="true">
        <ConsentRowSkeleton />
        <ConsentRowSkeleton />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Skeleton className="h-11 w-48 rounded-full bg-white/10" />
          <Skeleton className="h-5 w-14 bg-white/10" />
        </div>
      </div>
      <div className="mt-8 rounded-2xl border border-white/10 p-4" aria-hidden="true">
        <Skeleton className="h-3 w-20 bg-white/10" />
        <Skeleton className="mt-2 h-4 w-40 bg-white/10" />
        <Skeleton className="mt-3 h-3 w-full bg-white/10" />
        <Skeleton className="mt-2 h-3 w-4/5 bg-white/10" />
        <div className="mt-3 grid gap-2">
          <Skeleton className="h-11 w-full bg-white/10" />
          <Skeleton className="h-11 w-full bg-white/10" />
          <Skeleton className="h-11 w-44 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

function ConsentRowSkeleton() {
  return (
    <div className="flex min-h-11 items-start gap-3">
      <Skeleton className="mt-0.5 size-5 shrink-0 rounded-[0.3rem] bg-white/10" />
      <Skeleton className="mt-1 h-4 w-64 max-w-[calc(100%-2rem)] bg-white/10" />
    </div>
  );
}

function ConsentsLoadError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="mt-6 rounded-2xl border border-[#ff5a3d]/30 bg-[#ff5a3d]/10 p-4" role="alert">
      <div className="flex items-start gap-3">
        <WarningCircle className="mt-0.5 size-5 shrink-0 text-[#ffb0a7]" weight="fill" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-[#ffd8d1]">No pudimos cargar tus preferencias</p>
          <p className="mt-1 text-sm text-[#ffcabf]">{error}</p>
        </div>
      </div>
      <Button className="mt-4" variant="outline" onClick={onRetry}>
        <ArrowClockwise aria-hidden="true" />
        Reintentar
      </Button>
    </div>
  );
}
