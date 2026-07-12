import { redirect } from "next/navigation";
import { OnboardingProcessing } from "@/components/onboarding/onboarding-processing";
import { getSessionUserById, getValidSessionUserIdFromServerCookies } from "@/lib/current-user";
import { sql } from "@/lib/neon";
import { DEMO_USER } from "@/lib/demo-data";
import { isResponsiveQaFixture } from "@/lib/responsive-qa-fixtures";

export const dynamic = "force-dynamic";

interface OnboardingProcessingPageProps {
  searchParams: Promise<{
    lang?: string;
    checkout?: string;
    plan?: string;
    qa?: string;
  }>;
}

export default async function OnboardingProcessingPage({ searchParams }: OnboardingProcessingPageProps) {
  const resolvedSearchParams = await searchParams;
  const locale = resolvedSearchParams.lang === "en" ? "en" : "es";
  if (isResponsiveQaFixture(resolvedSearchParams.qa)) {
    return (
      <OnboardingProcessing
        locale={locale}
        qaMode
        user={{
          id: DEMO_USER.id,
          email: DEMO_USER.email,
          username: DEMO_USER.username,
          display_name: DEMO_USER.displayName,
          role: "creator",
        }}
      />
    );
  }
  const userId = await getValidSessionUserIdFromServerCookies();
  if (!userId) {
    redirect("/auth");
  }

  const user = await getSessionUserById(userId);
  if (!user) {
    redirect("/auth");
  }

  const stateRows = await sql<Array<{ is_complete: boolean | null }>>`
    select is_complete
    from public.onboarding_state
    where user_id = ${userId}
    limit 1
  `;
  const onboardingState = stateRows[0] || null;
  if (onboardingState?.is_complete) {
    redirect("/dashboard");
  }

  return <OnboardingProcessing locale={locale} user={user} />;
}
