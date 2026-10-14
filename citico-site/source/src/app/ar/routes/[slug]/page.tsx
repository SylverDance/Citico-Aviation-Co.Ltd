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
    locale: "ar",
    path: `/routes/${slug}`,
    title: `${corridor.title} | مواصفات الرحلات والشحن الجوي | سيتيكو للطيران`,
    description: `مواصفات الرحلات الجوية من ${corridor.origin} إلى ${corridor.destination}. المسافة ${corridor.distanceNm} ميل بحري، وقت الرحلة ${corridor.flightTimeTurboprop}. مكتب العمليات 24/7.`,
  });
}

export default async function ArabicRoutePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const corridor = corridors.find((c) => c.slug === slug);
  if (!corridor) notFound();

  return <CorridorView corridor={corridor} locale="ar" />;
}
