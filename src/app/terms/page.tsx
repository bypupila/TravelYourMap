import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { ContactStrip } from "@/components/site/contact-strip";
import { LOCALE_COOKIE_NAME, buildLocalizedHref, normalizeLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Términos | TravelYourMap",
  description: "Términos de uso de TravelYourMap y referencia obligatoria a los términos de YouTube.",
};

export default async function TermsPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = normalizeLocale((await searchParams).lang || (await cookies()).get(LOCALE_COOKIE_NAME)?.value);
  const en = locale === "en";
  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-4xl px-4 py-12 text-foreground">
      <h1 className="text-3xl font-semibold">{en ? "Terms of use" : "Términos de uso"}</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        {en ? "TravelYourMap is not affiliated with, sponsored by or endorsed by YouTube or Google." : "TravelYourMap no está afiliado, patrocinado ni respaldado por YouTube ni por Google."}
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        {en ? "TravelYourMap uses YouTube API Services to validate channels, import metadata and show content with the official YouTube player." : "TravelYourMap utiliza YouTube API Services para validar canales, importar metadatos y mostrar contenido con el reproductor oficial de YouTube."}
      </p>

      <section className="mt-8 space-y-3 text-sm leading-6 text-[#d6dce3]">
        <p>
          {en ? "By using TravelYourMap, you accept these terms and agree to be bound by the " : "Al usar TravelYourMap aceptas estos términos y también aceptas quedar sujeto a los "}{" "}
          <a
            href="https://www.youtube.com/t/terms"
            target="_blank"
            rel="noopener"
            className="underline underline-offset-2"
          >
            {en ? "YouTube Terms of Service" : "Términos de Servicio de YouTube"}
          </a>
          .
        </p>
        <p>
          {en ? "We do not download or rehost YouTube videos. Playback happens through the official embedded player or by redirecting to the video on YouTube." : "No descargamos ni rehosteamos videos de YouTube. La reproducción se realiza mediante el player oficial embebido o redirección al video en YouTube."}
        </p>
        <p>
          {en ? "Data from YouTube API Services is used to operate the map experience and kept under freshness and expiration rules to comply with current policies." : "Los datos provenientes de YouTube API Services se usan para operar la experiencia del mapa y se mantienen bajo reglas de frescura y expiración para cumplir políticas vigentes."}
        </p>
        <p>
          {en ? "If you do not accept these terms, you must not use import or playback features linked to YouTube API Services." : "Si no aceptas estos términos, no debes usar funciones de importación o reproducción vinculadas a YouTube API Services."}
        </p>
      </section>

      <div className="mt-10">
        <Link href={buildLocalizedHref("/privacy", locale)} className="text-sm underline underline-offset-2">
          {en ? "View Privacy Policy" : "Ver Política de Privacidad"}
        </Link>
      </div>
      <ContactStrip
        title={en ? "Contact" : "Contacto"}
        description={en ? "For support or general questions, use the official public channels." : "Para soporte o consultas generales, usa los canales públicos oficiales."}
        items={[
          { label: "Soporte", email: "support" },
          { label: "General", email: "hello" },
        ]}
        tone="light"
        locale={locale}
      />
    </main>
  );
}
