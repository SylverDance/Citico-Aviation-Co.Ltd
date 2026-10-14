import { defaultLocale, type Locale } from "@/lib/i18n";
import { en, type Dictionary } from "@/lib/dict-en";
import { ar } from "@/lib/dict-ar";

/* Single entry point for locale content — server components call
   getDictionary(locale), client components read it from LocaleProvider. */

export type { Dictionary };

export const dictionaries: Record<Locale, Dictionary> = { en, ar };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
