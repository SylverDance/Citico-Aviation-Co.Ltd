import type { MetadataRoute } from "next";
import { company } from "@/lib/content";

/* Static export target — emit robots.txt as a plain file at build time. */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${company.siteUrl}/sitemap.xml`,
  };
}
