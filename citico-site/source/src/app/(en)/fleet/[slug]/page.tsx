import type { Metadata } from "next";
import { FleetDetailView } from "@/components/views";
import { getDictionary } from "@/lib/dict";
import { fleetMetadata } from "@/lib/metadata";

const dict = getDictionary("en");

export function generateStaticParams() {
  return dict.fleet.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return fleetMetadata("en", slug);
}

export default async function AircraftPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <FleetDetailView locale="en" slug={slug} />;
}
