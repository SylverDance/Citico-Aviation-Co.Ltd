import type { Metadata } from "next";
import { ContactView } from "@/components/views";
import { getDictionary } from "@/lib/dict";
import { pageMetadata } from "@/lib/metadata";

const dict = getDictionary("ar");

export const metadata: Metadata = pageMetadata({
  locale: "ar",
  path: "/contact",
  title: dict.pages.contact.metaTitle,
  description: dict.pages.contact.metaDescription,
});

export default function ArabicContactPage() {
  return <ContactView locale="ar" />;
}
