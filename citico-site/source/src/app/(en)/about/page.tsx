import type { Metadata } from "next";
import { AboutView } from "@/components/views";
import { getDictionary } from "@/lib/dict";
import { pageMetadata } from "@/lib/metadata";

const dict = getDictionary("en");

export const metadata: Metadata = pageMetadata({
  locale: "en",
  path: "/about",
  title: dict.pages.about.metaTitle,
  description: dict.pages.about.metaDescription,
});

export default function AboutPage() {
  return <AboutView locale="en" />;
}
