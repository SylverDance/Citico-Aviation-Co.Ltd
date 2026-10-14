import type { Metadata } from "next";
import { RfqView } from "@/components/views";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  locale: "en",
  path: "/rfq",
  title: "Aviation RFQ & Charter Quote Request | Citico Aviation",
  description:
    "Request an immediate aviation charter or cargo quote for South Sudan and East Africa. Instant routing, aircraft payload selection, and direct dispatch to 24/7 ops desk.",
});

export default function RfqPage() {
  return <RfqView locale="en" />;
}
