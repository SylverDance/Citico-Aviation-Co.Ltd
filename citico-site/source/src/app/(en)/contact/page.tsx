import type { Metadata } from "next";
import { ContactView } from "@/components/views";
import { getDictionary } from "@/lib/dict";
import { pageMetadata } from "@/lib/metadata";

const dict = getDictionary("en");

export const metadata: Metadata = pageMetadata({
  locale: "en",
  path: "/contact",
  title: dict.pages.contact.metaTitle,
  description: dict.pages.contact.metaDescription,
});

export default function ContactPage() {
  return <ContactView locale="en" />;
}
