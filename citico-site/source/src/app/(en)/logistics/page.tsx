import type { Metadata } from "next";
import { LogisticsView } from "@/components/views";
import { getDictionary } from "@/lib/dict";
import { pageMetadata } from "@/lib/metadata";

const dict = getDictionary("en");

export const metadata: Metadata = pageMetadata({
  locale: "en",
  path: "/logistics",
  title: dict.pages.logistics.metaTitle,
  description: dict.pages.logistics.metaDescription,
});

export default function LogisticsPage() {
  return <LogisticsView locale="en" />;
}
