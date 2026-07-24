import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { cookies } from "next/headers";
import { LOCALE_COOKIE_NAME, normalizeLocale } from "@/lib/i18n";
import { getSessionUserById, getValidSessionUserIdFromServerCookies } from "@/lib/current-user";

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
  const sessionUserId = await getValidSessionUserIdFromServerCookies();
  const sessionUser = sessionUserId ? await getSessionUserById(sessionUserId) : null;
  const authenticatedCreator = sessionUser?.role === "creator"
    ? {
        displayName: sessionUser.display_name,
        email: sessionUser.email,
      }
    : null;

  return (
    <OnboardingFlow
      isDemoMode={resolvedSearchParams.demo === "1"}
      locale={locale}
      authenticatedCreator={authenticatedCreator}
    />
  );
}
