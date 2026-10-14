import type { Metadata } from "next";
import { HomeView } from "@/components/views";
import { company } from "@/lib/content";
import { languageAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  alternates: { canonical: "/ar", languages: languageAlternates(company.siteUrl, "/") },
};

export default function ArabicHomePage() {
  return <HomeView locale="ar" />;
}
