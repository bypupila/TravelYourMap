import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getValidSessionUserIdFromServerCookies } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export default async function AuthConsentsLayout({ children }: { children: ReactNode }) {
  const userId = await getValidSessionUserIdFromServerCookies();
  if (!userId) {
    redirect("/auth?next=%2Fauth%2Fconsents");
  }
  return children;
}
