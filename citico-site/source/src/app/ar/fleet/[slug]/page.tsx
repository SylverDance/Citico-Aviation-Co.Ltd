import type { Metadata } from "next";
import { FleetDetailView } from "@/components/views";
import { getDictionary } from "@/lib/dict";
import { fleetMetadata } from "@/lib/metadata";

const dict = getDictionary("ar");

export function generateStaticParams() {
  return dict.fleet.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return fleetMetadata("ar", slug);
}

export default async function ArabicAircraftPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <FleetDetailView locale="ar" slug={slug} />;
}
