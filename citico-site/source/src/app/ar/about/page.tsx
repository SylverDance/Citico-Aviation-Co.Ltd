import type { Metadata } from "next";
import { AboutView } from "@/components/views";
import { getDictionary } from "@/lib/dict";
import { pageMetadata } from "@/lib/metadata";

const dict = getDictionary("ar");

export const metadata: Metadata = pageMetadata({
  locale: "ar",
  path: "/about",
  title: dict.pages.about.metaTitle,
  description: dict.pages.about.metaDescription,
});

export default function ArabicAboutPage() {
  return <AboutView locale="ar" />;
}
