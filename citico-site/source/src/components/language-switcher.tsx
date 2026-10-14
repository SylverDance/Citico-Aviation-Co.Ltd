"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { alternatePaths, localeFromPath, type Locale } from "@/lib/i18n";

/* Shown as: العربية | English — selecting a language opens the equivalent
   page of that locale (/services ↔ /ar/services) and remembers the choice. */

const DISPLAY_ORDER: Locale[] = ["ar", "en"];

function remember(locale: Locale) {
  try {
    window.localStorage.setItem("citico-lang", locale);
    document.cookie = `citico-lang=${locale};path=/;max-age=31536000;samesite=lax`;
  } catch {
    /* storage unavailable — the URL still carries the locale */
  }
}

export function LanguageSwitcher({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const pathname = usePathname() || "/";
  const active = localeFromPath(pathname);
  const paths = alternatePaths(pathname);

  return (
    <div
      className={
        variant === "mobile"
          ? "flex items-center justify-center gap-1 rounded-full border border-[#004ea8]/20 p-1"
          : "flex items-center gap-0.5 rounded-full border border-[#004ea8]/15 p-0.5"
      }
      role="group"
      aria-label="Language / اللغة"
    >
      {DISPLAY_ORDER.map((locale, index) => {
        const isActive = locale === active;
        const label = locale === "ar" ? "العربية" : "English";
        return (
          <span key={locale} className="flex items-center">
            {index > 0 && <span aria-hidden className="px-0.5 text-[11px] text-[#004ea8]/35">|</span>}
            <Link
              href={paths[locale]}
              hrefLang={locale}
              lang={locale}
              onClick={() => remember(locale)}
              aria-current={isActive ? "true" : undefined}
              dir={locale === "ar" ? "rtl" : "ltr"}
              className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                isActive
                  ? "bg-[#0078FF] text-white shadow-[0_6px_18px_-8px_rgba(0,120,255,0.8)]"
                  : "text-[#004ea8]/80 hover:bg-[#0078FF]/10 hover:text-[#0078FF]"
              }`}
            >
              {label}
            </Link>
          </span>
        );
      })}
    </div>
  );
}
