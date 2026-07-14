import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChartBar,
  CurrencyDollar,
  GlobeHemisphereWest,
  MapPin,
  Play,
  RocketLaunch,
  SignIn,
  Users,
  UsersThree,
  Video,
  CheckCircle,
  XCircle,
  YoutubeLogo,
} from "@phosphor-icons/react/dist/ssr";
import { MiniMapModel } from "@/components/landing/mini-map-model";
import { PricingSection } from "@/components/landing/pricing-section";
import { ContactStrip } from "@/components/site/contact-strip";
import { DemoChannelShowcase } from "@/components/landing/demo-channel-showcase";
import { BY_PUPILA_SOCIAL_LINKS } from "@/lib/brand-links";
import { DEMO_VIDEO_LOCATIONS } from "@/lib/demo-data";
import { buildLocalizedHref, type Locale } from "@/lib/i18n";
import type { TravelVideoLocation } from "@/lib/types";

const BRAND_PROFILE_IMAGE = "/creators/by-pupila.png";
const DESTINATION_PREVIEW_IMAGE = "/creators/travelyourmap-influencer.png";
const FINAL_CTA_IMAGE = "/creators/demo-hero-mountain.png";
const CREATOR_AVATARS = [
  { src: BRAND_PROFILE_IMAGE, alt: "BY PUPILA" },
  { src: "/creators/drew-binsky.png", alt: "Drew Binsky" },
  { src: "/creators/alan-por-el-mundo.png", alt: "Alan por el Mundo" },
  { src: "/creators/misias-pero-viajeras.png", alt: "Misias pero Viajeras" },
];

const keyFeatureIcons = [UsersThree, Users, CurrencyDollar, RocketLaunch, GlobeHemisphereWest, Video];
const DEMO_MAP_HREF = "/map?channelId=demo-channel";

const landingCopy = {
  es: {
    nav: { features: "Funciones", pricing: "Precios", examples: "Ejemplos", resources: "Recursos", explore: "Explorar", login: "Iniciar sesión", create: "Crear mi mapa", language: "Seleccionar idioma", english: "Cambiar a inglés", spanish: "Español seleccionado" },
    hero: { eyebrow: "El media kit interactivo para creadores de viajes", titleLead: "Convierte tu canal en un mapa que", titleAccent: "abre puertas.", description: "Importa tu canal de YouTube, detectamos destinos y crea tu página web interactiva lista para marcas y sponsors.", mode: "Creator Mode", modeDescription: "Únete a una red de creadores ficticios y reales que ya están cerrando mejores deals.", demoMap: "Ver mapa demo", create: "Crear mi mapa" },
    stats: [{ value: "2406", label: "videos mapeados", icon: YoutubeLogo }, { value: "165", label: "países cubiertos", icon: GlobeHemisphereWest }],
    keyFeatures: ["Influencers de viajes", "Agencias", "Sponsors", "Colaboraciones", "Mapas interactivos"],
    brand: { eyebrow: "Perfil comercial", title: "Trabajamos con", description: "Influencers de viajes, agencias y sponsors que necesitan presentar su cobertura con contexto geográfico." },
    how: { titleLead: "De tu canal", titleMiddle: "a un mapa en", titleAccent: "minutos." },
    steps: ["Conecta tu canal de YouTube", "Detectamos tus destinos", "Organizamos tu mapa", "Publica y comparte tu página"],
    features: { titleLead: "Todo lo que necesitas para", titleAccent: "crecer", titleEnd: "como creador de viajes", description: "Una plataforma, todas las herramientas para mostrar tu mundo.", cards: [{ title: "Mapa 3D Interactivo", text: "Tus videos organizados por destinos en un mapa visual espectacular." }, { title: "Videos Oficiales de YouTube", text: "Usamos el embed oficial. No pierdes views, ingresos, ni control." }, { title: "Sponsors por Destino", text: "Activa sponsors por país, ciudad o ruta. Tú eliges dónde y cómo." }, { title: "Analytics por País", text: "Descubre qué destinos generan más interés y cómo crece tu audiencia." }, { title: "Votaciones de Fans", text: "Deja que tu comunidad vote tu próximo destino y aumente el engagement." }, { title: "Página Pública SEO", text: "Tu propio sitio web optimizado para buscadores. Comparte tu enlace y destaca." }] },
    comparison: { titleLead: "¿Por qué", titleAccent: "TravelYourMap", titleEnd: "te ayuda a cerrar mejores deals?", description: "Las marcas compran destinos, audiencias y relevancia geográfica. Muéstralo todo en segundos.", note: "Un solo sponsorship puede pagar tu suscripción anual.", without: "Sin TravelYourMap", withoutItems: ["PDFs estáticos", "Videos sueltos", "Datos difíciles de entender", "Sin contexto geográfico", "Propuestas poco efectivas"], with: "Con TravelYourMap", withItems: ["Mapa interactivo", "Cobertura por destino", "Sponsors visibles", "Datos claros y visuales", "Propuestas que convierten"] },
    faq: { title: "Preguntas frecuentes", questions: ["¿TravelYourMap reemplaza a YouTube?", "¿Puedo activar sponsors por país o ciudad?", "¿Pierdo mis views o ingresos?", "¿Necesito editar mis videos?", "¿Qué tipos de creadores pueden usarlo?", "¿Cuánto tarda configurarlo?"], answers: ["No. TravelYourMap complementa tu canal: YouTube sigue siendo la fuente oficial de tus videos, mientras la plataforma organiza tu contenido por destino y lo convierte en un media kit público para marcas.", "Sí. Puedes plantear oportunidades comerciales por país, ciudad o ruta, mostrar el contexto de cada destino y gestionar propuestas desde tu espacio de sponsors. Las condiciones finales siempre las acuerdas tú con cada marca.", "No. Usamos el embed oficial de YouTube: no descargamos ni re-subimos tus videos. Tus views, ingresos y control del canal siguen dependiendo de YouTube y de sus propias políticas.", "No. Puedes comenzar con tu catálogo existente. El sistema importa los datos del canal, detecta destinos y te permite revisar o corregir la información antes de publicar tu mapa.", "Está pensado para creadores de viajes con canal de YouTube, agencias o managers que representan talento y proyectos editoriales que necesitan presentar cobertura geográfica de forma profesional.", "La configuración inicial puede comenzar en pocos minutos. El tiempo total depende del tamaño de tu catálogo y de la revisión de destinos; la importación continúa en segundo plano para que puedas avanzar sin esperar."] },
    cta: { titleLead: "Tu contenido ya existe.", titleMiddle: "Ahora necesita", titleAccent: "verse profesional.", description: "Transforma tu canal en un media kit interactivo listo para sponsors, marcas y partnerships.", create: "Crear mi mapa gratis", demo: "Ver demo en vivo", credit: "Requiere tarjeta de crédito", setup: "Configuración en minutos", contactDescription: "Escribe a soporte si algo no funciona, a marketing para alianzas o a hello para consultas generales." },
    pricing: { rows: ["Videos ilimitados", "Competitor analytics", "Sponsor hub", "Sync prioritaria", "Página pública avanzada"] },
  },
  en: {
    nav: { features: "Features", pricing: "Pricing", examples: "Examples", resources: "Resources", explore: "Explore", login: "Sign in", create: "Create my map", language: "Select language", english: "English selected", spanish: "Switch to Spanish" },
    hero: { eyebrow: "The interactive media kit for travel creators", titleLead: "Turn your channel into a map that", titleAccent: "opens doors.", description: "Import your YouTube channel, detect destinations and create an interactive website ready for brands and sponsors.", mode: "Creator Mode", modeDescription: "Join a network of fictional and real creators already closing better deals.", demoMap: "View demo map", create: "Create my map" },
    stats: [{ value: "2406", label: "mapped videos", icon: YoutubeLogo }, { value: "165", label: "covered countries", icon: GlobeHemisphereWest }],
    keyFeatures: ["Travel influencers", "Agencies", "Sponsors", "Collaborations", "Interactive maps"],
    brand: { eyebrow: "Commercial profile", title: "We work with", description: "Travel influencers, agencies and sponsors who need to present their coverage with geographic context." },
    how: { titleLead: "From your channel", titleMiddle: "to a map in", titleAccent: "minutes." },
    steps: ["Connect your YouTube channel", "We detect your destinations", "We organize your map", "Publish and share your page"],
    features: { titleLead: "Everything you need to", titleAccent: "grow", titleEnd: "as a travel creator", description: "One platform, every tool to show your world.", cards: [{ title: "Interactive 3D Map", text: "Your videos organized by destination in a spectacular visual map." }, { title: "Official YouTube Videos", text: "We use the official embed. You keep your views, revenue and control." }, { title: "Sponsors by Destination", text: "Activate sponsors by country, city or route. You choose where and how." }, { title: "Analytics by Country", text: "Discover which destinations drive the most interest and how your audience grows." }, { title: "Fan Voting", text: "Let your community vote on your next destination and increase engagement." }, { title: "SEO Public Page", text: "Your own search-optimized website. Share your link and stand out." }] },
    comparison: { titleLead: "Why", titleAccent: "TravelYourMap", titleEnd: "helps you close better deals", description: "Brands buy destinations, audiences and geographic relevance. Show it all in seconds.", note: "One sponsorship can pay for your annual subscription.", without: "Without TravelYourMap", withoutItems: ["Static PDFs", "Scattered videos", "Hard-to-understand data", "No geographic context", "Weak proposals"], with: "With TravelYourMap", withItems: ["Interactive map", "Coverage by destination", "Visible sponsors", "Clear visual data", "Proposals that convert"] },
    faq: { title: "Frequently asked questions", questions: ["Does TravelYourMap replace YouTube?", "Can I activate sponsors by country or city?", "Do I lose my views or revenue?", "Do I need to edit my videos?", "What types of creators can use it?", "How long does setup take?"], answers: ["No. TravelYourMap complements your channel: YouTube remains the official source for your videos, while the platform organizes your content by destination and turns it into a public media kit for brands.", "Yes. You can build commercial opportunities by country, city or route, show the context around each destination and manage proposals from your sponsor space. You always agree the final terms with each brand.", "No. We use the official YouTube embed, so your videos are not downloaded or re-uploaded. Your views, revenue and channel control remain subject to YouTube and its own policies.", "No. You can start with your existing catalog. The system imports channel data, detects destinations and lets you review or correct the information before publishing your map.", "It is built for travel creators with a YouTube channel, agencies or managers representing talent and editorial projects that need to present geographic coverage professionally.", "Initial setup can start in a few minutes. Total time depends on the size of your catalog and destination review; importing continues in the background so you can keep moving."] },
    cta: { titleLead: "Your content already exists.", titleMiddle: "Now it needs to", titleAccent: "look professional.", description: "Turn your channel into an interactive media kit ready for sponsors, brands and partnerships.", create: "Create my free map", demo: "View live demo", credit: "Credit card required", setup: "Set up in minutes", contactDescription: "Contact support if something is not working, marketing for partnerships or hello for general questions." },
    pricing: { rows: ["Unlimited videos", "Competitor analytics", "Sponsor hub", "Priority sync", "Advanced public page"] },
  },
} satisfies Record<Locale, unknown>;
type LandingCopy = (typeof landingCopy)[Locale];

export async function CinematicLanding({ locale = "es" }: { locale?: Locale }) {
  const videoLocations = DEMO_VIDEO_LOCATIONS;
  const copy = landingCopy[locale];

  return (
    <main className="creator-landing min-h-[100dvh] overflow-x-clip bg-[#070a0d] text-[#f5f2ed]">
      <div className="pointer-events-none fixed inset-0 z-0 creator-noise" />
      <div className="relative z-[1] mx-auto w-full max-w-[1500px] px-5 py-4 sm:px-8 lg:px-14">
        <CreatorNav locale={locale} copy={copy} />
        <HeroSection videoLocations={videoLocations} locale={locale} copy={copy} />
        <BrandStrip copy={copy} />
        <HowItWorks copy={copy} />
        <FeatureGrid copy={copy} />
        <SponsorComparison copy={copy} />
        <DemoChannelShowcase locale={locale} />
        <PricingSection planRows={copy.pricing.rows} locale={locale} />
        <FaqSection copy={copy} />
      </div>
      <FinalCta locale={locale} copy={copy} />
    </main>
  );
}

function CreatorNav({ locale, copy }: { locale: Locale; copy: LandingCopy }) {
  const englishHref = buildLocalizedHref("/", "en");
  const spanishHref = buildLocalizedHref("/", "es");
  return (
    <header className="sticky top-3 z-30 rounded-[26px] border border-white/10 bg-[#080b0e]/88 p-2 shadow-[0_24px_70px_-34px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl sm:rounded-full sm:p-2.5">
      <nav>
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <Link href={buildLocalizedHref("/", locale)} className="group flex min-w-0 items-center gap-2 px-1 sm:gap-3 sm:px-0" aria-label="Travel Your Map home">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#ff6258]/35 bg-[radial-gradient(circle_at_35%_25%,#2a2424,#111417_70%)] text-[#ff5147] shadow-[0_10px_28px_-14px_rgba(255,71,59,0.8),inset_0_1px_0_rgba(255,255,255,0.12)] transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-105 sm:h-10 sm:w-10">
              <GlobeHemisphereWest size={20} weight="fill" className="sm:h-[22px] sm:w-[22px]" />
            </span>
            <span className="leading-none">
              <span className="mb-[5px] block whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.08em] text-white sm:text-[13px]">Travel Your Map</span>
              <span className="block text-[8px] font-bold uppercase tracking-[0.26em] text-white/48 sm:text-[9px]">BY PUPILA</span>
            </span>
          </Link>
          <div role="group" aria-label={copy.nav.language} className="inline-flex shrink-0 items-center rounded-[13px] border border-white/10 bg-[#090c0f]/55 p-1 text-[10px] font-extrabold tracking-[0.08em] sm:hidden">
            <Link href={englishHref} className={`rounded-[9px] px-2.5 py-1.5 transition duration-200 hover:text-white ${locale === "en" ? "bg-[#ff5147] text-white shadow-[0_6px_16px_-8px_rgba(255,71,59,0.9)]" : "text-white/48"}`} aria-current={locale === "en" ? "page" : undefined} aria-label={locale === "en" ? copy.nav.english : "Switch to English"}>EN</Link>
            <Link href={spanishHref} className={`rounded-[9px] px-2.5 py-1.5 transition active:scale-95 ${locale === "es" ? "bg-[#ff5147] text-white shadow-[0_6px_16px_-8px_rgba(255,71,59,0.9)]" : "text-white/48"}`} aria-current={locale === "es" ? "page" : undefined} aria-label={locale === "es" ? copy.nav.spanish : "Cambiar a español"}>ES</Link>
          </div>
          <div className="hidden items-center gap-7 text-[13px] font-medium text-white/68 xl:flex">
            <a href="#features" className="transition hover:text-white">{copy.nav.features}</a>
            <a href="#pricing" className="transition hover:text-white">{copy.nav.pricing}</a>
            <a href="#examples" className="transition hover:text-white">{copy.nav.examples}</a>
            <a href="#faq" className="transition hover:text-white">{copy.nav.resources}</a>
            <Link href={buildLocalizedHref("/explore", locale)} className="transition hover:text-white">{copy.nav.explore}</Link>
          </div>
          <div className="hidden items-center gap-1.5 text-[13px] font-semibold sm:flex sm:gap-2">
            <div role="group" aria-label={copy.nav.language} className="hidden items-center rounded-full border border-white/10 bg-white/[0.045] p-1 text-[10px] font-extrabold tracking-[0.08em] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:inline-flex">
              <Link href={englishHref} className={`rounded-full px-2.5 py-1.5 transition duration-200 hover:bg-white/[0.06] hover:text-white ${locale === "en" ? "bg-[#ff5147] text-white shadow-[0_6px_16px_-8px_rgba(255,71,59,0.9)]" : "text-white/48"}`} aria-current={locale === "en" ? "page" : undefined} aria-label={locale === "en" ? copy.nav.english : "Switch to English"}>EN</Link>
              <Link href={spanishHref} className={`rounded-full px-2.5 py-1.5 transition active:scale-95 ${locale === "es" ? "bg-[#ff5147] text-white shadow-[0_6px_16px_-8px_rgba(255,71,59,0.9)]" : "text-white/48"}`} aria-current={locale === "es" ? "page" : undefined} aria-label={locale === "es" ? copy.nav.spanish : "Cambiar a español"}>ES</Link>
            </div>
            <Link href={buildLocalizedHref("/auth", locale)} className="hidden min-h-10 items-center gap-2 rounded-full px-3.5 py-2 text-white/68 transition duration-200 hover:bg-white/[0.055] hover:text-white sm:inline-flex">
              <SignIn size={15} weight="bold" aria-hidden="true" />
              {copy.nav.login}
            </Link>
            <Link href={buildLocalizedHref("/onboarding", locale)} className="inline-flex min-h-10 items-center whitespace-nowrap rounded-full bg-[#ff5147] px-3.5 py-2 text-[11px] leading-5 text-white shadow-[0_14px_30px_-18px_rgba(255,71,59,0.95),inset_0_1px_0_rgba(255,255,255,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#ff5d54] active:translate-y-0 active:scale-[0.97] sm:px-4 sm:text-[12px] lg:px-5 lg:text-[13px]">
              {copy.nav.create}
            </Link>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 items-center gap-2 rounded-[18px] border border-white/[0.06] bg-white/[0.035] p-1.5 sm:hidden">
          <Link href={buildLocalizedHref("/auth", locale)} className="inline-flex min-h-9 items-center gap-2 rounded-[13px] px-2.5 py-1.5 text-[12px] font-semibold text-white/72 transition duration-200 hover:bg-white/[0.06] hover:text-white active:scale-[0.98]">
            <SignIn size={16} weight="bold" aria-hidden="true" />
            {copy.nav.login}
          </Link>
          <Link href="/onboarding?lang=es" className="inline-flex min-h-9 items-center justify-center rounded-[13px] bg-[#ff5147] px-2.5 py-1.5 text-[12px] font-bold text-white shadow-[0_10px_22px_-14px_rgba(255,71,59,0.95),inset_0_1px_0_rgba(255,255,255,0.18)] transition duration-200 hover:bg-[#ff5d54] active:scale-[0.98]">Crear mi mapa</Link>
        </div>
      </nav>
    </header>
  );
}

function HeroSection({
  videoLocations,
  locale,
  copy,
}: {
  videoLocations: TravelVideoLocation[];
  locale: Locale;
  copy: LandingCopy;
}) {
  return (
    <section className="relative mt-8 grid min-h-0 items-start gap-8 pb-10 pt-20 sm:mt-[30px] sm:gap-10 sm:pb-14 sm:pt-16 lg:min-h-[680px] lg:grid-cols-[0.92fr_1.08fr] lg:pb-6 lg:pt-4">
      <div className="relative z-10 mx-auto max-w-[620px] text-center lg:mx-0 lg:text-left">
        <p className="mb-5 text-[12px] font-extrabold uppercase tracking-[0.2em] text-[#ff473b]">{copy.hero.eyebrow}</p>
        <h1 className="mx-auto max-w-[11ch] text-[46px] font-extrabold leading-[0.98] tracking-[-0.055em] text-white sm:text-[68px] lg:mx-0 lg:text-[76px]">
          {copy.hero.titleLead} <span className="text-[#ff473b]">{copy.hero.titleAccent}</span>
        </h1>
        <p className="mx-auto mt-7 max-w-[48ch] text-[16px] leading-8 text-white/66 lg:mx-0">
          {copy.hero.description}
        </p>
        <div className="mt-10 flex flex-col gap-4">
          <div className="flex items-center justify-center -space-x-3.5 lg:justify-start">
            {CREATOR_AVATARS.map((creator, index) => (
              <div
                key={creator.alt}
                className="relative h-11 w-11 overflow-hidden rounded-[12px] border border-white/20 bg-[#101419] shadow-[0_8px_20px_rgba(0,0,0,0.45)]"
                style={{ zIndex: CREATOR_AVATARS.length - index }}
              >
                <Image src={creator.src} alt={creator.alt} fill sizes="44px" className="object-cover" />
              </div>
            ))}
          </div>
          <div className="mx-auto max-w-[310px] lg:mx-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ff473b]/35 bg-[#ff473b]/12 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#ff6a60]">
              <RocketLaunch size={14} weight="fill" />
              {copy.hero.mode}
            </div>
            <p className="mt-2 text-[13px] leading-5 text-white/68">
              {copy.hero.modeDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="relative min-h-[600px] sm:min-h-[720px] lg:min-h-[760px]">
        <CreatorGlobe videoLocations={videoLocations} />
        <div className="absolute right-0 top-8 z-20 flex w-full max-w-[430px] flex-col gap-4 sm:right-4 sm:top-10 lg:right-0">
          <div className="grid w-full max-w-[410px] grid-cols-2 gap-4 self-end lg:w-[410px]">
            {copy.stats.map((stat) => <MetricCard key={stat.label} {...stat} />)}
          </div>
          <div className="w-full max-w-[410px] self-end lg:w-[410px]">
            <DestinationCard copy={copy} locale={locale} />
          </div>
        </div>
      </div>
    </section>
  );
}

function CreatorGlobe({ videoLocations }: { videoLocations: TravelVideoLocation[] }) {
  return (
    <div className="creator-real-globe absolute -left-[14%] -top-[180px] h-[780px] w-[780px] overflow-hidden rounded-full lg:-left-[8%] lg:-top-[196px] lg:h-[980px] lg:w-[980px]">
      <MiniMapModel
        videoLocations={videoLocations}
        markerMode="videos"
        pointOfView={{ lat: 25, lng: 12, altitude: 1.85 }}
        autoRotateSpeed={-0.32}
        className="rounded-full bg-transparent"
      />
    </div>
  );
}

function MetricCard({ value, label, icon: Icon }: { value: string; label: string; icon: typeof YoutubeLogo }) {
  return (
    <div className="rounded-[22px] border border-white/12 bg-[#101419]/82 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_28px_70px_-44px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:p-7">
      <Icon size={29} weight="fill" className="text-[#ff473b]" />
      <p className="mt-5 font-mono text-[34px] font-bold leading-none tracking-[-0.05em] text-[#ff473b]">{value}</p>
      <p className="mt-2 text-[13px] text-white/55">{label}</p>
    </div>
  );
}

function DestinationCard({ copy, locale }: { copy: LandingCopy; locale: Locale }) {
  return (
    <div className="w-full rounded-[24px] border border-white/13 bg-[#101419]/90 p-4 shadow-[0_32px_90px_-44px_rgba(0,0,0,0.95)] backdrop-blur-xl">
      <div className="relative h-[150px] overflow-hidden rounded-[16px] sm:h-[170px]">
        <Image
          src={DESTINATION_PREVIEW_IMAGE}
          alt="Vista previa creada de TravelYourMap"
          fill
          sizes="(max-width: 768px) 100vw, 410px"
          className="object-cover"
        />
      </div>
      <div className="px-3 pb-1 pt-4">
        <div className="grid gap-3">
          <Link
            href={buildLocalizedHref(DEMO_MAP_HREF, locale)}
            className="inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-full border border-white/18 bg-white/[0.03] px-8 py-4 text-[14px] font-bold text-white transition hover:bg-white/[0.07] active:translate-y-0 active:scale-[0.98]"
          >
            {copy.hero.demoMap} <Play size={15} weight="fill" />
          </Link>
          <Link
            href={buildLocalizedHref(DEMO_MAP_HREF, locale)}
            className="inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-full bg-[#ff473b] px-8 py-4 text-[14px] font-bold text-white shadow-[0_20px_46px_-24px_rgba(255,71,59,0.85)] transition hover:-translate-y-0.5 hover:bg-[#ff5b50] active:translate-y-0 active:scale-[0.98]"
          >
            {copy.hero.create} <ArrowRight size={17} weight="bold" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function BrandStrip({ copy }: { copy: LandingCopy }) {
  return (
    <section className="border-y border-white/8 py-9">
      <div className="mx-auto grid max-w-[980px] gap-6">
        <div className="mx-auto max-w-[620px] text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/55">{copy.brand.eyebrow}</p>
          <p className="mt-3 text-[34px] font-extrabold leading-[1.05] tracking-[-0.045em] text-white sm:text-[40px]">{copy.brand.title}</p>
          <p className="mt-4 text-[15px] leading-7 text-white/58">
            {copy.brand.description}
          </p>
        </div>
        <div className="grid grid-cols-2 justify-items-center gap-4 md:grid-cols-3 lg:grid-cols-5">
          {copy.keyFeatures.map((feature, index) => {
            const Icon = keyFeatureIcons[index] ?? GlobeHemisphereWest;

            return (
              <div key={feature} className="grid min-h-20 w-full place-items-center rounded-[16px] border border-white/9 bg-white/[0.035] px-4 py-4 text-center text-[14px] font-extrabold leading-5 tracking-[-0.03em] text-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] last:col-span-2 last:w-1/2 last:justify-self-center md:last:col-span-1 md:last:w-full">
                <Icon size={28} weight="fill" className="mb-3 text-[#ff473b]" />
                {feature}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ copy }: { copy: LandingCopy }) {
  return (
    <section className="grid gap-8 border-b border-white/8 py-12 lg:grid-cols-[300px_1fr]">
      <h2 className="text-[34px] font-extrabold leading-[1.05] tracking-[-0.045em] text-white sm:text-[40px]">{copy.how.titleLead}<br />{copy.how.titleMiddle}<br /><span className="text-[#ff473b]">{copy.how.titleAccent}</span></h2>
      <div className="grid gap-5 md:grid-cols-4">
        {copy.steps.map((title, index) => <StepCard key={title} index={index + 1} title={title} icon={[YoutubeLogo, MapPin, GlobeHemisphereWest, RocketLaunch][index]} />)}
      </div>
    </section>
  );
}

function StepCard({ title, icon: Icon, index }: { title: string; icon: typeof YoutubeLogo; index: number }) {
  return (
    <div className="relative min-h-[190px] rounded-[17px] border border-white/10 bg-white/[0.035] p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <span className="absolute -left-2 -top-3 grid h-9 w-9 place-items-center rounded-full bg-[#ff473b] text-[13px] font-extrabold text-white">{index}</span>
      <div className="mx-auto grid h-[76px] w-[76px] place-items-center rounded-full border border-[#ff473b]/25 bg-[#ff473b]/8 text-[#ff473b]">
        <Icon size={37} weight="fill" />
      </div>
      <p className="mx-auto mt-5 max-w-[130px] text-[13px] leading-5 text-white/82">{title}</p>
    </div>
  );
}

function FeatureGrid({ copy }: { copy: LandingCopy }) {
  return (
    <section id="features" className="py-16">
      <div className="mx-auto max-w-[760px] text-center">
        <h2 className="text-[34px] font-extrabold leading-[1.03] tracking-[-0.05em] text-white sm:text-[44px]">{copy.features.titleLead}<br className="hidden sm:block" /><span className="text-[#ff473b]"> {copy.features.titleAccent}</span> {copy.features.titleEnd}</h2>
        <p className="mt-3 text-[14px] text-white/55">{copy.features.description}</p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {copy.features.cards.map((feature, index) => <FeatureCard key={feature.title} {...feature} icon={keyFeatureIcons[index] ?? GlobeHemisphereWest} />)}
      </div>
    </section>
  );
}

function FeatureCard({ title, text, icon: Icon }: { title: string; text: string; icon: typeof YoutubeLogo }) {
  return (
    <article className="grid min-h-[150px] grid-cols-[82px_1fr] items-center gap-5 rounded-[16px] border border-white/9 bg-white/[0.04] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="grid h-16 w-16 place-items-center rounded-full border border-[#ff473b]/25 bg-[#ff473b]/8 text-[#ff473b]">
        <Icon size={35} weight="duotone" />
      </div>
      <div>
        <h3 className="text-[16px] font-extrabold text-white">{title}</h3>
        <p className="mt-2 max-w-[36ch] text-[13px] leading-5 text-white/62">{text}</p>
      </div>
    </article>
  );
}

function SponsorComparison({ copy }: { copy: LandingCopy }) {
  return (
    <section className="grid gap-8 border-y border-white/8 py-12 lg:grid-cols-[0.82fr_1.8fr]">
      <div>
        <h2 className="text-[31px] font-extrabold leading-[1.08] tracking-[-0.045em] text-white">{copy.comparison.titleLead} <span className="text-[#ff473b]">{copy.comparison.titleAccent}</span><br />{copy.comparison.titleEnd}</h2>
        <p className="mt-5 max-w-[420px] text-[15px] leading-7 text-white/66">{copy.comparison.description}</p>
        <div className="mt-10 inline-flex items-center gap-4 rounded-[14px] border border-white/10 bg-white/[0.035] p-4 text-[13px] font-bold text-white/82">
          <ChartBar size={30} className="text-[#ff473b]" /> {copy.comparison.note}
        </div>
      </div>
      <div className="grid rounded-[18px] border border-white/10 bg-white/[0.035] md:grid-cols-[1fr_auto_1.28fr]">
        <ComparisonPanel title={copy.comparison.without} bad items={copy.comparison.withoutItems} />
        <div className="grid place-items-center border-y border-white/10 px-4 py-5 md:border-x md:border-y-0"><span className="rounded-full border border-white/18 px-4 py-3 text-[13px] font-extrabold">VS</span></div>
        <ComparisonPanel title={copy.comparison.with} items={copy.comparison.withItems} />
      </div>
    </section>
  );
}

function ComparisonPanel({ title, items, bad = false }: { title: string; items: string[]; bad?: boolean }) {
  return (
    <div className="p-6 sm:p-8">
      <h3 className={`text-[15px] font-extrabold ${bad ? "text-white" : "text-[#ff473b]"}`}>{title}</h3>
      <div className="mt-6 grid gap-3">
        {items.map((item) => (
          <p key={item} className="flex items-center gap-3 text-[13px] text-white/70">
            {bad ? <XCircle size={18} className="text-[#ff473b]" /> : <CheckCircle size={18} className="text-[#49b86f]" />}
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function FaqSection({ copy }: { copy: LandingCopy }) {
  return (
    <section id="faq" className="grid gap-7 border-y border-white/8 py-9 lg:grid-cols-[280px_1fr]">
      <h2 className="text-[24px] font-extrabold text-white">{copy.faq.title}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {copy.faq.questions.map((question, index) => (
          <details key={question} className="group rounded-[10px] border border-white/10 bg-white/[0.03] px-5 py-4">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-[13px] font-bold text-white/78">{question}<span aria-hidden="true" className="text-xl leading-none text-white/62 transition-transform group-open:rotate-45">+</span></summary>
            <p className="mt-3 text-[13px] leading-6 text-white/58">{copy.faq.answers[index]}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function FinalCta({ locale, copy }: { locale: Locale; copy: LandingCopy }) {
  return (
    <section className="relative mt-8 min-h-[360px] overflow-hidden border-t border-white/8 bg-[linear-gradient(90deg,rgba(7,10,13,0.34),rgba(7,10,13,0.96)_52%),linear-gradient(145deg,#4a3424,#101820_45%,#070a0d)]">
      <div className="absolute left-[8%] top-[18%] h-[220px] w-[340px] rounded-[48%] bg-[radial-gradient(circle,#f3b46f,transparent_68%)] opacity-18 blur-3xl" />
      <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_1fr] lg:px-14">
        <div className="relative min-h-[260px] overflow-hidden rounded-[24px] border border-white/10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.8)] lg:min-h-[320px] lg:rounded-[40px]">
          <Image
            src={FINAL_CTA_IMAGE}
            alt="Influencer de viaje grabando en una montaña"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070a0d] via-transparent to-transparent opacity-40" />
        </div>
        <div className="max-w-[620px] self-center">
          <h2 className="text-[34px] font-extrabold leading-[1.04] tracking-[-0.05em] text-white sm:text-[46px]">{copy.cta.titleLead}<br />{copy.cta.titleMiddle} <span className="text-[#ff473b]">{copy.cta.titleAccent}</span></h2>
          <p className="mt-5 text-[15px] leading-7 text-white/65">{copy.cta.description}</p>
          <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap sm:gap-4">
            <Link href={buildLocalizedHref("/onboarding", locale)} className="inline-flex min-h-11 items-center justify-center rounded-[9px] bg-[#ff473b] px-6 py-3 text-center text-[14px] font-extrabold text-white shadow-[0_20px_46px_-24px_rgba(255,71,59,0.85)] sm:px-10 sm:py-4">{copy.cta.create}</Link>
            <Link href={buildLocalizedHref(DEMO_MAP_HREF, locale)} className="inline-flex min-h-11 items-center justify-center gap-4 rounded-[9px] border border-white/20 px-6 py-3 text-[14px] font-extrabold text-white sm:px-10 sm:py-4">{copy.cta.demo} <Play size={15} weight="fill" /></Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-6 text-[12px] text-white/52"><span>{copy.cta.credit}</span><span>{copy.cta.setup}</span></div>
        </div>
      </div>
      <div className="mx-auto max-w-[1500px] px-5 pb-14 sm:px-8 lg:px-14">
        <ContactStrip
          title="Contacto"
          description={copy.cta.contactDescription}
          items={[
            { label: "General", email: "hello" },
            { label: "Marketing", email: "marketing" },
            { label: "Soporte", email: "support" },
          ]}
          tone="dark"
          locale={locale}
          socialLinks={BY_PUPILA_SOCIAL_LINKS}
          className="mt-0 border-t-white/10"
        />
      </div>
    </section>
  );
}
