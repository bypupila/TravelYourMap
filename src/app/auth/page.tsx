"use client";

import Link from "next/link";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactStrip } from "@/components/site/contact-strip";
import {
  buildAuthHref,
  buildViewerRegisterHref,
  readViewerAuthAttribution,
  readViewerAuthAttributionFromLocation,
} from "@/lib/viewer-auth-attribution";
import { buildLocalizedHref, normalizeLocale, type Locale } from "@/lib/i18n";

const authCopy = {
  es: { creatorEyebrow: "Cuenta TravelYourMap", viewerEyebrow: "Cuenta Viewer", loadingAccess: "Cargando acceso...", loadingRegistration: "Cargando registro...", creatorTitle: "Entra, activa tu mapa y publica una presencia propia.", viewerTitle: "Inicia sesión para votar, guardar y seguir mapas.", creatorDescription: "TravelYourMap convierte el catálogo del canal en una experiencia editorial: rutas, países, sponsors y una URL pública lista para ventas o discovery.", viewerDescription: "Accede como viewer para participar en votaciones y desbloquear estadísticas avanzadas en los mapas públicos.", backHome: "Volver al inicio", accountAccess: "Acceso de cuenta", creator: "Creador", viewer: "Viewer", login: "Login", register: "Registro", email: "Email o usuario", emailPlaceholder: "tu@email.com o tu_usuario", creatorEmailHint: "Puedes entrar usando el email de facturación o tu identificador público.", viewerEmailHint: "Usa tu email o usuario para entrar como viewer.", password: "Contraseña", passwordPlaceholder: "Tu contraseña", creatorPasswordHint: "Mantén una clave única para tu operación editorial y comercial.", viewerPasswordHint: "Tu cuenta de viewer te permite participar y guardar contenido en mapas.", hidePassword: "Ocultar contraseña", showPassword: "Ver contraseña", entering: "Ingresando...", enter: "Entrar", viewerAccessHint: "Este acceso es para viewers del mapa público.", freeViewerAccount: "Crear cuenta viewer gratuita", viewerCreatorHint: "El alta de creator se gestiona por onboarding y checkout. Puedes gestionar consentimientos en", privacy: "privacidad", accept: "Al usar este producto aceptas nuestros", terms: "Términos", youtubeTerms: "Términos de YouTube", unaffiliated: "TravelYourMap no está afiliado, patrocinado ni respaldado por YouTube ni por Google.", help: "Ayuda", supportDescription: "Si no puedes entrar, usa soporte técnico. Para consultas generales o comerciales, usa los correos públicos." },
  en: { creatorEyebrow: "TravelYourMap account", viewerEyebrow: "Viewer account", loadingAccess: "Loading access...", loadingRegistration: "Loading registration...", creatorTitle: "Enter, activate your map and publish your own presence.", viewerTitle: "Sign in to vote, save and follow maps.", creatorDescription: "TravelYourMap turns your channel catalog into an editorial experience: routes, countries, sponsors and a public URL ready for sales or discovery.", viewerDescription: "Access as a viewer to participate in votes and unlock advanced statistics on public maps.", backHome: "Back to home", accountAccess: "Account access", creator: "Creator", viewer: "Viewer", login: "Login", register: "Register", email: "Email or username", emailPlaceholder: "you@email.com or your_username", creatorEmailHint: "Use your billing email or public identifier to sign in.", viewerEmailHint: "Use your email or username to sign in as a viewer.", password: "Password", passwordPlaceholder: "Your password", creatorPasswordHint: "Keep one unique password for your editorial and commercial operation.", viewerPasswordHint: "Your viewer account lets you participate and save content on maps.", hidePassword: "Hide password", showPassword: "Show password", entering: "Signing in...", enter: "Sign in", viewerAccessHint: "This access is for viewers of the public map.", freeViewerAccount: "Create a free viewer account", viewerCreatorHint: "Creator setup is managed through onboarding and checkout. You can manage consents in", privacy: "privacy", accept: "By using this product you accept our", terms: "Terms", youtubeTerms: "YouTube Terms", unaffiliated: "TravelYourMap is not affiliated with, sponsored by or endorsed by YouTube or Google.", help: "Help", supportDescription: "If you cannot sign in, contact technical support. For general or commercial questions, use the public emails." },
} satisfies Record<Locale, Record<string, string>>;

function AuthPageFallback() {
  return (
    <main className="relative grid min-h-[100dvh] place-items-center overflow-hidden px-4 text-foreground">
      <div className="platform-grid-glow pointer-events-none absolute inset-0" />
      <section className="tm-surface-strong relative z-10 w-full max-w-[32rem] rounded-[2rem] p-6 text-center">
        <p className="tym-overline">TravelYourMap account</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">Loading access...</h1>
      </section>
    </main>
  );
}

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = normalizeLocale(searchParams.get("lang"));
  const copy = authCopy[locale];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const attribution = useMemo(() => {
    return readViewerAuthAttribution(searchParams);
  }, [searchParams]);

  const viewerRegisterHref = useMemo(() => buildLocalizedHref(buildViewerRegisterHref(attribution), locale), [attribution, locale]);

  const creatorAuthHref = useMemo(() => {
    return buildLocalizedHref(buildAuthHref(attribution, "creator"), locale);
  }, [attribution, locale]);

  const viewerAuthHref = useMemo(() => {
    return buildLocalizedHref(buildAuthHref(attribution, "viewer"), locale);
  }, [attribution, locale]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitAttribution = readViewerAuthAttributionFromLocation(searchParams);
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          password,
          registrationChannelId: submitAttribution.registrationChannelId,
          utmSource: submitAttribution.utmSource,
          utmMedium: submitAttribution.utmMedium,
          utmCampaign: submitAttribution.utmCampaign,
        }),
      });
      const loginPayload = (await loginResponse.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!loginResponse.ok) {
        throw new Error(loginPayload?.error || "No se pudo iniciar sesión.");
      }

      const defaultPath = submitAttribution.authIntent === "viewer" ? "/" : "/dashboard";
      router.push(submitAttribution.safeNext || defaultPath);
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden text-foreground">
      <div className="platform-grid-glow pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255, 90, 61,0.18),transparent_24%),radial-gradient(circle_at_84%_14%,rgba(255, 90, 61,0.12),transparent_26%),linear-gradient(180deg,rgba(17,20,22,0.92),rgba(17,20,22,0.76))]" />
      <div className="relative z-10 mx-auto grid min-h-[100dvh] max-w-[1400px] items-center gap-8 px-4 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:px-6">
        <section className="order-2 lg:order-1">
          <div className="max-w-[38rem]">
            <nav className="auth-switch inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1" aria-label="Tipo de cuenta">
              <Link
                href={creatorAuthHref}
                className="tym-nav-pill"
                data-active={attribution.authIntent === "creator"}
                aria-current={attribution.authIntent === "creator" ? "page" : undefined}
              >
                {copy.creator}
              </Link>
              <Link
                href={viewerAuthHref}
                className="tym-nav-pill"
                data-active={attribution.authIntent === "viewer"}
                aria-current={attribution.authIntent === "viewer" ? "page" : undefined}
              >
                {copy.viewer}
              </Link>
            </nav>
            <h1 className="mt-5 max-w-[12ch] text-4xl font-semibold tracking-[-0.06em] text-foreground md:text-6xl md:leading-none">
              {attribution.authIntent === "viewer" ? copy.viewerTitle : copy.creatorTitle}
            </h1>
            <p className="mt-5 max-w-[60ch] text-base leading-7 text-muted-foreground">
              {attribution.authIntent === "viewer"
                ? copy.viewerDescription
                : copy.creatorDescription}
            </p>
          </div>

          <div className="mt-6">
            <Link href="/" className="tym-btn-secondary">
              {copy.backHome}
            </Link>
          </div>
        </section>

        <section className="order-1 tm-surface-strong rounded-[2rem] p-6 sm:p-8 lg:order-2 lg:ml-auto lg:w-full lg:max-w-[38rem]">
          <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="tym-overline">{attribution.authIntent === "viewer" ? copy.viewerEyebrow : copy.creatorEyebrow}</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-foreground">{copy.accountAccess}</h2>
            </div>
            <nav className="auth-switch inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1" aria-label="Modo de acceso">
              <span className="tym-nav-pill" data-active="true" aria-current="page">
                {copy.login}
              </span>
              <Link href={buildLocalizedHref("/onboarding", locale)} className="tym-nav-pill" aria-label={copy.register}>
                {copy.register}
              </Link>
            </nav>
          </div>

          <form className="grid gap-4" onSubmit={handleLogin}>
            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{copy.email}</span>
              <Input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder={copy.emailPlaceholder} />
              <p className="text-xs text-muted-foreground">
                {attribution.authIntent === "viewer"
                  ? copy.viewerEmailHint
                  : copy.creatorEmailHint}
              </p>
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{copy.password}</span>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={copy.passwordPlaceholder}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 flex h-full min-w-11 items-center justify-center px-3 text-muted-foreground transition hover:text-foreground lg:min-w-10"
                  aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {attribution.authIntent === "viewer"
                  ? copy.viewerPasswordHint
                  : copy.creatorPasswordHint}
              </p>
            </label>
            <Button type="submit" className="mt-2 w-full" disabled={loading || !identifier.trim() || !password.trim()}>
              {loading ? copy.entering : copy.enter}
            </Button>
          </form>

          {error ? <p className="mt-4 text-sm text-[#ffb0a7]">{error}</p> : null}
          {attribution.authIntent === "viewer" ? (
            <p className="mt-5 text-sm text-muted-foreground">
              {copy.viewerAccessHint}{" "}
              <Link href={viewerRegisterHref} className="text-foreground underline underline-offset-4">
                {copy.freeViewerAccount}
              </Link>
              . {copy.viewerCreatorHint}{" "}
              <Link href="/auth/consents" className="text-foreground underline underline-offset-4">
                {copy.privacy}
              </Link>
              .
            </p>
          ) : null}
          <p className="mt-4 text-xs text-muted-foreground">
            {copy.accept} <Link href={buildLocalizedHref("/terms", locale)} className="underline underline-offset-2">{copy.terms}</Link> y{" "}
            <Link href={buildLocalizedHref("/privacy", locale)} className="underline underline-offset-2">{copy.privacy}</Link>, {locale === "en" ? "as well as the" : "además de los"}{" "}
            <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener" className="underline underline-offset-2">
              {copy.youtubeTerms}
            </a>
            .
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {copy.unaffiliated}
          </p>
        </section>
      </div>
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 pb-6 lg:px-6">
        <ContactStrip
          title={copy.help}
          description={copy.supportDescription}
          items={[
            { label: "Soporte", email: "support" },
            { label: "General", email: "hello" },
          ]}
          tone="dark"
          locale={locale}
          className="mt-0 border-t-white/10"
        />
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <AuthPageContent />
    </Suspense>
  );
}
