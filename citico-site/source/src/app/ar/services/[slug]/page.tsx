import type { Metadata } from "next";
import { ServiceDetailView } from "@/components/views";
import { getDictionary } from "@/lib/dict";
import { serviceMetadata } from "@/lib/metadata";

const dict = getDictionary("ar");

export function generateStaticParams() {
  return dict.services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return serviceMetadata("ar", slug);
}

export default async function ArabicServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ServiceDetailView locale="ar" slug={slug} />;
}
