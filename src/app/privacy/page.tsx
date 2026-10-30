import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { ContactStrip } from "@/components/site/contact-strip";
import { ClarityConsentPreferences } from "@/components/site/clarity-consent";
import { LOCALE_COOKIE_NAME, normalizeLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Privacidad | TravelYourMap",
  description: "Política de privacidad de TravelYourMap para uso de YouTube API Services.",
};

export default async function PrivacyPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = normalizeLocale((await searchParams).lang || (await cookies()).get(LOCALE_COOKIE_NAME)?.value);
  const en = locale === "en";
  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-4xl px-4 py-12 text-foreground">
      <h1 className="text-3xl font-semibold">{en ? "Privacy Policy" : "Política de Privacidad"}</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        {en ? "TravelYourMap is not affiliated with, sponsored by or endorsed by YouTube or Google." : "TravelYourMap no está afiliado, patrocinado ni respaldado por YouTube ni por Google."}
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        {en ? "This policy explains how TravelYourMap uses data related to YouTube API Services." : "Esta política explica cómo TravelYourMap usa datos relacionados con YouTube API Services."}
      </p>

      <section className="mt-8 space-y-3 text-sm leading-6 text-[#d6dce3]">
        <p>
          {en ? "TravelYourMap uses YouTube API Services to resolve channels, load video metadata and render content with the official player." : "TravelYourMap usa YouTube API Services para resolver canales, cargar metadatos de videos y renderizar contenido con el reproductor oficial."}
        </p>
        <p>
          {en ? "Processed data: channel/video ID, title, description, thumbnail, publication dates, available public metrics, location status and technical pipeline signals." : "Datos procesados: ID de canal/video, título, descripción, miniatura, fechas de publicación, métricas públicas disponibles, estado de ubicación y señales técnicas del pipeline."}
        </p>
        <p>
          {en ? "Unauthorized statistics data is refreshed or expires according to YouTube API Services policies. When data expires, the system marks it for update." : "Los datos de estadísticas no autorizadas se refrescan o expiran de acuerdo con políticas de YouTube API Services. Cuando datos están expirados, el sistema los marca para actualización."}
        </p>
        <p>
          {en ? "We also record our own product metrics (for example, panel openings and navigation actions) to improve TravelYourMap operations." : "También registramos métricas propias de producto (por ejemplo, apertura de paneles y acciones de navegación) para mejorar la operación de TravelYourMap."}
        </p>
        <p>
          {en ? "If you accept analytics, Microsoft Clarity records masked interactions and session replays on public pages only, and it is not loaded before your choice." : "Si aceptas la analítica, Microsoft Clarity registra interacciones y reproducciones de sesión enmascaradas solo en páginas públicas, y no se carga antes de tu decisión."}
        </p>
        <ClarityConsentPreferences en={en} />
        <p>
          {en ? "For more detail about Google's data processing, see Google's " : "Para más detalle sobre el tratamiento de datos por parte de Google, consulta la "}{" "}
          <a
            href="https://www.google.com/policies/privacy"
            target="_blank"
            rel="noopener"
            className="underline underline-offset-2"
          >
            {en ? "Privacy Policy" : "Política de Privacidad de Google"}
          </a>
          .
        </p>
      </section>

      <div className="mt-10 flex gap-4 text-sm">
        <Link href="/terms" className="underline underline-offset-2">
          {en ? "View Terms" : "Ver Términos"}
        </Link>
        <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener" className="underline underline-offset-2">
          Términos de YouTube
        </a>
      </div>
      <ContactStrip
        title={en ? "Contact" : "Contacto"}
        description={en ? "For privacy or product support questions, use BY PUPILA's public channels." : "Para dudas sobre privacidad o soporte de producto, usa los canales públicos de BY PUPILA."}
        items={[
          { label: "General", email: "hello" },
          { label: "Soporte", email: "support" },
        ]}
        tone="light"
        locale={locale}
      />
    </main>
  );
}
