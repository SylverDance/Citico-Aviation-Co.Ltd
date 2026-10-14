import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Inter, Manrope } from "next/font/google";
import "../globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LocaleProvider } from "@/components/locale-provider";
import { AviationOrganizationJsonLd } from "@/components/aviation-jsonld";
import { company } from "@/lib/content";
import { getDictionary } from "@/lib/dict";

/* Gilroy-style primary face — self-hosted Montserrat (closest free match to
   Gilroy; Gilroy itself requires a commercial license) */
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

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(company.siteUrl),
  title: {
    default: `${company.shortName} | Aviation & Logistics in South Sudan`,
    template: `%s · ${company.shortName}`,
  },
  description:
    "CITICO Aviation Co. Ltd provides reliable charter aviation, cargo transportation and logistics solutions for humanitarian, government and commercial operations in South Sudan and across the region.",
  keywords: [
    "South Sudan aviation",
    "air cargo Juba",
    "humanitarian aviation",
    "charter flights Africa",
    "helicopter operations South Sudan",
    "river cargo transport",
    "CITICO Aviation",
  ],
  openGraph: {
    type: "website",
    siteName: company.name,
    title: `${company.shortName} | Aviation & Logistics in South Sudan`,
    description:
      "Reliable charter aviation, cargo and logistics solutions for humanitarian, government and commercial operations across South Sudan and East Africa.",
    images: [{ url: "/img/og.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${company.shortName} | Aviation & Logistics in South Sudan`,
    description:
      "Reliable charter aviation, cargo and logistics solutions for humanitarian, government and commercial operations across South Sudan and East Africa.",
    images: ["/img/og.jpg"],
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

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  const dict = getDictionary("en");
  return (
    <html lang="en">
      <head>
        <script
          // set theme before paint to avoid flash
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('citico-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.toggle('dark',t==='dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${gilroy.variable} ${inter.variable} ${manrope.variable} font-sans`}>
        <AviationOrganizationJsonLd />
        <LocaleProvider locale="en" dict={dict}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-citico-700 focus:px-4 focus:py-2 focus:text-white"
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
