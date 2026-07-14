import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function CountryCardProposalsLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return children;
}
