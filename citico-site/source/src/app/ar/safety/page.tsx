import type { Metadata } from "next";
import { SafetyView } from "@/components/views";
import { getDictionary } from "@/lib/dict";
import { pageMetadata } from "@/lib/metadata";

const dict = getDictionary("ar");

export const metadata: Metadata = pageMetadata({
  locale: "ar",
  path: "/safety",
  title: dict.pages.safety.metaTitle,
  description: dict.pages.safety.metaDescription,
});

export default function ArabicSafetyPage() {
  return <SafetyView locale="ar" />;
}
