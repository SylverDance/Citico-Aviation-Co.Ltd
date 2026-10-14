import type { Metadata } from "next";
import { company } from "@/lib/content";
import { languageAlternates, localizeHref, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dict";

/* Shared metadata builder — English and Arabic pages both use it, so every
   page carries a canonical URL and en/ar/x-default hreflang pairings. */

export function pageMetadata({
  locale,
  path,
  title,
  description,
  image = "/img/og.jpg",
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image?: string;
}): Metadata {
  const canonical = localizeHref(path, locale);
  const fullTitle = title.includes(company.name) ? title : `${title} | ${company.name}`;
  return {
    title: fullTitle,
    description,
    alternates: {
      canonical,
      languages: languageAlternates(company.siteUrl, path),
    },
    openGraph: {
      type: "website",
      siteName: company.name,
      title: fullTitle,
      description,
      url: `${company.siteUrl}${canonical}`,
      locale: locale === "ar" ? "ar_SS" : "en_US",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}

export function serviceMetadata(locale: Locale, slug: string): Metadata {
  const dict = getDictionary(locale);
  const service = dict.services.find((s) => s.slug === slug);
  if (!service) return {};
  return pageMetadata({
    locale,
    path: `/services/${slug}`,
    title: service.seoTitle ?? service.title,
    description: service.seoDescription ?? service.short,
    image: service.image,
  });
}

export function fleetMetadata(locale: Locale, slug: string): Metadata {
  const dict = getDictionary(locale);
  const aircraft = dict.fleet.find((a) => a.slug === slug);
  if (!aircraft) return {};
  return pageMetadata({
    locale,
    path: `/fleet/${slug}`,
    title: aircraft.model,
    description: aircraft.blurb,
    image: aircraft.image,
  });
}
