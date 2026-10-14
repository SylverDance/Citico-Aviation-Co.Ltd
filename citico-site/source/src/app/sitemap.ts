import type { MetadataRoute } from "next";
import { company, fleet, services } from "@/lib/content";
import { locales, localizeHref } from "@/lib/i18n";

/* Static export target — emit sitemap.xml as a plain file at build time. */
export const dynamic = "force-static";

/* Every English URL gets its Arabic counterpart, so search engines can
   discover both language trees from a single sitemap. */

export default function sitemap(): MetadataRoute.Sitemap {
  const base = company.siteUrl;
  const now = new Date();

  const paths = [
    { path: "/", changeFrequency: "monthly" as const, priority: 1 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/services", changeFrequency: "monthly" as const, priority: 0.9 },
    { path: "/logistics", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/leadership", changeFrequency: "yearly" as const, priority: 0.6 },
    { path: "/safety", changeFrequency: "yearly" as const, priority: 0.7 },
    { path: "/fleet", changeFrequency: "yearly" as const, priority: 0.7 },
    { path: "/contact", changeFrequency: "yearly" as const, priority: 0.9 },
    ...services.map((s) => ({
      path: `/services/${s.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    ...fleet.map((a) => ({
      path: `/fleet/${a.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];

  /* The production build is a static export that emits directory-style output
     (about/index.html served at /about/), and Next.js writes the canonical tags
     in that trailing-slash form. The sitemap has to match exactly — a <loc> that
     redirects to the real page is not a canonical URL. */
  const withSlash = (path: string) => (path.endsWith("/") ? path : `${path}/`);

  const entries: MetadataRoute.Sitemap = paths.flatMap((entry) =>
    locales.map((locale) => ({
      url: `${base}${withSlash(localizeHref(entry.path, locale))}`,
      lastModified: now,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
    }))
  );

  return entries;
}
