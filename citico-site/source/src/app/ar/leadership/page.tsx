import type { Metadata } from "next";
import { LeadershipView } from "@/components/views";
import { getDictionary } from "@/lib/dict";
import { pageMetadata } from "@/lib/metadata";

const dict = getDictionary("ar");

export const metadata: Metadata = pageMetadata({
  locale: "ar",
  path: "/leadership",
  title: dict.pages.leadership.metaTitle,
  description: dict.pages.leadership.metaDescription,
});

export default function ArabicLeadershipPage() {
  return <LeadershipView locale="ar" />;
}
