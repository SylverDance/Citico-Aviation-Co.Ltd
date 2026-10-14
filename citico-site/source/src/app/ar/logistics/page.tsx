import type { Metadata } from "next";
import { LogisticsView } from "@/components/views";
import { getDictionary } from "@/lib/dict";
import { pageMetadata } from "@/lib/metadata";

const dict = getDictionary("ar");

export const metadata: Metadata = pageMetadata({
  locale: "ar",
  path: "/logistics",
  title: dict.pages.logistics.metaTitle,
  description: dict.pages.logistics.metaDescription,
});

export default function ArabicLogisticsPage() {
  return <LogisticsView locale="ar" />;
}
