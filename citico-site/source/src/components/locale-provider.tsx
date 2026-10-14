"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  defaultLocale,
  localizeHref,
  localeDir,
  type Locale,
} from "@/lib/i18n";
import { getDictionary, type Dictionary } from "@/lib/dict";

type LocaleContextValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  dict: Dictionary;
  /** Prefix an internal href for the active locale (/ar/... on Arabic). */
  href: (href: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict?: Dictionary;
  children: ReactNode;
}) {
  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      dir: localeDir[locale],
      dict: dict ?? getDictionary(locale),
      href: (target: string) => localizeHref(target, locale),
    }),
    [locale, dict]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** Full locale context (locale, direction, dictionary, href helper). */
export function useLocaleContext(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (ctx) return ctx;
  // Fallback keeps components usable outside a provider (never expected in app
  // routes, but avoids hard failures in isolation).
  return {
    locale: defaultLocale,
    dir: localeDir[defaultLocale],
    dict: getDictionary(defaultLocale),
    href: (target: string) => target,
  };
}

export function useLocale(): Locale {
  return useLocaleContext().locale;
}

/** The active locale dictionary — replaces direct `@/lib/content` imports. */
export function useDict(): Dictionary {
  return useLocaleContext().dict;
}

/** Localize an internal href for the active locale. */
export function useLocalizedHref(): (href: string) => string {
  return useLocaleContext().href;
}
