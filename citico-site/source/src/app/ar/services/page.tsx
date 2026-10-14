import type { Metadata } from "next";
import { ServicesView } from "@/components/views";
import { getDictionary } from "@/lib/dict";
import { pageMetadata } from "@/lib/metadata";

const dict = getDictionary("ar");

export const metadata: Metadata = pageMetadata({
  locale: "ar",
  path: "/services",
  title: dict.pages.services.metaTitle,
  description: dict.pages.services.metaDescription,
});

export default function ArabicServicesPage() {
  return <ServicesView locale="ar" />;
}
