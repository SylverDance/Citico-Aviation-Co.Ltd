import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CorridorView } from "@/components/corridor-view";
import { corridors } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export function generateStaticParams() {
  return corridors.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const corridor = corridors.find((c) => c.slug === slug);
  if (!corridor) return {};

  return pageMetadata({
    locale: "en",
    path: `/routes/${slug}`,
    title: `${corridor.title} | Flight Times & Cargo Specs | Citico Aviation`,
    description: `Aviation charter flight specs from ${corridor.origin} to ${corridor.destination}. Distance ${corridor.distanceNm} NM, flight time ${corridor.flightTimeTurboprop}, runway ${corridor.runwayType}. 24/7 RFQ dispatch.`,
  });
}

export default async function RoutePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const corridor = corridors.find((c) => c.slug === slug);
  if (!corridor) notFound();

  return <CorridorView corridor={corridor} locale="en" />;
}
