import type { Metadata } from "next";
import { ServicesView } from "@/components/views";
import { getDictionary } from "@/lib/dict";
import { pageMetadata } from "@/lib/metadata";

const dict = getDictionary("en");

export const metadata: Metadata = pageMetadata({
  locale: "en",
  path: "/services",
  title: dict.pages.services.metaTitle,
  description: dict.pages.services.metaDescription,
});

export default function ServicesPage() {
  return <ServicesView locale="en" />;
}
