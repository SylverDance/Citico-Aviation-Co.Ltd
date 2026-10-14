import type { Metadata } from "next";
import { LeadershipView } from "@/components/views";
import { getDictionary } from "@/lib/dict";
import { pageMetadata } from "@/lib/metadata";

const dict = getDictionary("en");

export const metadata: Metadata = pageMetadata({
  locale: "en",
  path: "/leadership",
  title: dict.pages.leadership.metaTitle,
  description: dict.pages.leadership.metaDescription,
});

export default function LeadershipPage() {
  return <LeadershipView locale="en" />;
}
