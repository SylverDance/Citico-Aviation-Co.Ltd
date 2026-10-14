import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "../globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LocaleProvider } from "@/components/locale-provider";
import { AviationOrganizationJsonLd } from "@/components/aviation-jsonld";
import { company } from "@/lib/content";
import { getDictionary } from "@/lib/dict";
import { languageAlternates } from "@/lib/i18n";

/* Arabic identity typeface: Cairo (self-hosted, Arabic + Latin subsets) with
   Montserrat kept as the Latin fallback for brand marks and phone numbers. */
const cairoArabic = localFont({
  src: [{ path: "../fonts/cairo-arabic.woff2", weight: "200 1000", style: "normal" }],
  variable: "--font-cairo-ar",
  display: "swap",
});

const cairoLatin = localFont({
  src: [{ path: "../fonts/cairo-latin.woff2", weight: "200 1000", style: "normal" }],
  variable: "--font-cairo-lat",
  display: "swap",
});

const gilroy = localFont({
  src: [
    { path: "../fonts/montserrat-v31-latin-regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/montserrat-v31-latin-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/montserrat-v31-latin-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/montserrat-v31-latin-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/montserrat-v31-latin-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-gilroy",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(company.siteUrl),
  title: {
    default: `${company.shortName} | الطيران والخدمات اللوجستية في جنوب السودان`,
    template: `%s · ${company.shortName}`,
  },
  description:
    "تقدّم شركة سيتيكو للطيران (CITICO Aviation Co. Ltd) حلولاً موثوقة في الرحلات العارضة ونقل الشحن والخدمات اللوجستية لعمليات المساعدات الإنسانية والجهات الحكومية والعملاء التجاريين في جنوب السودان والمنطقة.",
  keywords: [
    "الطيران في جنوب السودان",
    "الشحن الجوي جوبا",
    "الطيران الإنساني",
    "رحلات عارضة أفريقيا",
    "عمليات الهليكوبتر جنوب السودان",
    "النقل النهري",
    "سيتيكو للطيران",
  ],
  alternates: {
    canonical: "/ar",
    languages: languageAlternates(company.siteUrl, "/"),
  },
  openGraph: {
    type: "website",
    siteName: company.name,
    locale: "ar_SS",
    title: `${company.shortName} | الطيران والخدمات اللوجستية في جنوب السودان`,
    description:
      "حلول موثوقة في الرحلات العارضة والشحن والخدمات اللوجستية لعمليات المساعدات الإنسانية والجهات الحكومية والعملاء التجاريين في جنوب السودان وشرق أفريقيا.",
    images: [{ url: "/img/og.jpg", width: 1200, height: 630 }],
  },
  icons: {
    icon: [{ url: "/img/favicon-128.png", sizes: "128x128", type: "image/png" }],
    apple: [{ url: "/img/favicon-512.png", sizes: "512x512", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#030814" },
  ],
};

export default function ArabicRootLayout({ children }: { children: React.ReactNode }) {
  const dict = getDictionary("ar");
  return (
    <html lang="ar" dir="rtl">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('citico-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.toggle('dark',t==='dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${cairoArabic.variable} ${cairoLatin.variable} ${gilroy.variable} font-sans`}>
        <AviationOrganizationJsonLd />
        <LocaleProvider locale="ar" dict={dict}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-citico-700 focus:px-4 focus:py-2 focus:text-white"
          >
            {dict.ui.skipToContent}
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
