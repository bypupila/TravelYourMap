import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { cookies } from "next/headers";
import { LOCALE_COOKIE_NAME, normalizeLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

interface OnboardingPageProps {
  searchParams: Promise<{
    demo?: string;
    lang?: string;
  }>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const resolvedSearchParams = await searchParams;
  const locale = normalizeLocale(resolvedSearchParams.lang || (await cookies()).get(LOCALE_COOKIE_NAME)?.value);
  return <OnboardingFlow isDemoMode={resolvedSearchParams.demo === "1"} locale={locale} />;
}
