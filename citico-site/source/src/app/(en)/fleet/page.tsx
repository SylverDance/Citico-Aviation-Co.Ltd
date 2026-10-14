import type { Metadata } from "next";
import { FleetView } from "@/components/views";
import { getDictionary } from "@/lib/dict";
import { pageMetadata } from "@/lib/metadata";

const dict = getDictionary("en");

export const metadata: Metadata = pageMetadata({
  locale: "en",
  path: "/fleet",
  title: dict.pages.fleet.metaTitle,
  description: dict.pages.fleet.metaDescription,
});

export default function FleetPage() {
  return <FleetView locale="en" />;
}
