import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { NotFoundView } from "@/components/views";

/* ──────────────────────────────────────────────────────────────
   Branded 404 for the static (Hostinger) build.

   English and Arabic are sibling root layouts — the (en) and ar route
   groups — so no single root layout exists for Next.js to derive a global
   404 from. Without this file `next build` exports Next's unstyled default
   ("404: This page could not be found."), which ships a bare, un-branded
   error page with no lang attribute.

   This entry renders the same branded NotFoundView the app uses everywhere
   else, wrapped in its own <html>/<body> because it cannot inherit a layout.
   The Apache/LiteSpeed 404 handler in .htaccess points here.

   The typefaces are declared again here (next/font is build-time and scoped per
   route) so the page keeps the Gilroy/Montserrat brand typography instead of
   falling back to a system sans.

   All three cells of the stack are required, not just Gilroy: globals.css builds
   --font-sans and --font-display from var(--font-gilroy), var(--font-inter) and
   var(--font-manrope), and an undefined var() anywhere in that list makes the
   whole font-family declaration invalid at computed-value time. Omitting Inter
   and Manrope would drop the 404 page back to the browser default face.
   ────────────────────────────────────────────────────────────── */

const gilroy = localFont({
  src: [
    { path: "./fonts/montserrat-v31-latin-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/montserrat-v31-latin-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/montserrat-v31-latin-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/montserrat-v31-latin-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/montserrat-v31-latin-800.woff2", weight: "800", style: "normal" },
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
  title: "Page not found",
  description: "The page you were looking for is not here — return to CITICO Aviation.",
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr">
      <body className={`${gilroy.variable} ${inter.variable} ${manrope.variable} font-sans`}>
        <NotFoundView locale="en" />
      </body>
    </html>
  );
}
