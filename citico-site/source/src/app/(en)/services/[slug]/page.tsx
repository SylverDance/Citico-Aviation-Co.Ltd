import type { Metadata } from "next";
import { ServiceDetailView } from "@/components/views";
import { getDictionary } from "@/lib/dict";
import { serviceMetadata } from "@/lib/metadata";

const dict = getDictionary("en");

export function generateStaticParams() {
  return dict.services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return serviceMetadata("en", slug);
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ServiceDetailView locale="en" slug={slug} />;
}
