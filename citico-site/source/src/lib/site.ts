/* ──────────────────────────────────────────────────────────────
   Single source of truth for the deployed origin.

   Everything that needs an absolute URL — canonical tags and hreflang
   alternates (lib/metadata.ts, the layouts), openGraph URLs, sitemap.xml,
   robots.txt and the JSON-LD structured data in components/detail.tsx —
   resolves it from here, so moving the site to a different domain is a
   one-line edit to SITE_ORIGIN.

   Deliberately dependency-free: lib/content.ts and lib/dict-ar.ts both import
   it, and those two must never import each other.

   Prefer `absoluteUrl()` over concatenating SITE_ORIGIN by hand — it enforces
   the leading slash, which is the difference between a real URL and a
   relative string in an <img src> or a structured-data `image` field.
   ────────────────────────────────────────────────────────────── */

/** Canonical production origin. No trailing slash. */
export const SITE_ORIGIN = "https://www.citicoaviation.com";

/** Hostname without the scheme — the form shown in footer and contact copy. */
export const SITE_HOST = new URL(SITE_ORIGIN).host;

/** Absolute URL for a site-root-relative path, e.g. `/img/logo.png`. */
export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
