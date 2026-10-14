/* ──────────────────────────────────────────────────────────────
   Locale plumbing — one place to add a future language.
   English lives at the site root (/services), Arabic under /ar
   (/ar/services). Both trees render the same shared views, so a new
   locale only needs a dictionary + a route folder.
   ────────────────────────────────────────────────────────────── */

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeDir: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

export const localeHtmlLang: Record<Locale, string> = {
  en: "en",
  ar: "ar",
};

/** Label shown in the language switcher. */
export const localeLabel: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Prefix an internal href with the locale segment when it is not the default. */
export function localizeHref(href: string, locale: Locale): string {
  if (locale === defaultLocale) return href;
  // leave external, protocol and in-page targets untouched
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}

/** Remove a leading /ar (or /en) segment from a pathname. */
export function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/(en|ar)(?=\/|$)/);
  if (!match) return pathname;
  const rest = pathname.slice(match[0].length);
  return rest === "" ? "/" : rest;
}

/** Which locale a pathname belongs to (defaults to English). */
export function localeFromPath(pathname: string): Locale {
  return pathname === "/ar" || pathname.startsWith("/ar/") ? "ar" : "en";
}

/** The equivalent path in every locale — used by the switcher and hreflang. */
export function alternatePaths(pathname: string): Record<Locale, string> {
  const base = stripLocale(pathname);
  const result = {} as Record<Locale, string>;
  for (const locale of locales) {
    result[locale] = locale === defaultLocale ? base : base === "/" ? `/${locale}` : `/${locale}${base}`;
  }
  return result;
}

/** Absolute alternate URLs for metadata `alternates.languages`. */
export function languageAlternates(
  base: string,
  pathname: string
): Record<string, string> {
  const basePath = stripLocale(pathname);
  const absolute = (p: string) => `${base}${p === "/" ? "" : p}`;
  return {
    "en": absolute(basePath),
    "ar": absolute(basePath === "/" ? "/ar" : `/ar${basePath}`),
    "x-default": absolute(basePath),
  };
}

/** Fill `{placeholder}` slots in dictionary templates. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match
  );
}

/** Resolve a slugged pathname (e.g. /services/[slug]) to concrete content. */
export function matchSlug(pathname: string, base: string): string | null {
  const clean = stripLocale(pathname);
  const prefix = `${base}/`;
  if (!clean.startsWith(prefix)) return null;
  const slug = clean.slice(prefix.length).split("/")[0];
  return slug ? decodeURIComponent(slug) : null;
}
