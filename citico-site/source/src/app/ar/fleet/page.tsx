import type { Metadata } from "next";
import { FleetView } from "@/components/views";
import { getDictionary } from "@/lib/dict";
import { pageMetadata } from "@/lib/metadata";

const dict = getDictionary("ar");

export const metadata: Metadata = pageMetadata({
  locale: "ar",
  path: "/fleet",
  title: dict.pages.fleet.metaTitle,
  description: dict.pages.fleet.metaDescription,
});

export default function ArabicFleetPage() {
  return <FleetView locale="ar" />;
}
