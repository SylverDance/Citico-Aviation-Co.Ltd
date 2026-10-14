import type { NextConfig } from "next";

/* CITICO Aviation — production build target: Hostinger shared hosting.
   Hostinger serves plain files from `public_html` and does not run a Node.js
   process (no Next.js image optimizer, no SSR), so the site is exported to
   static HTML/CSS/JS.

   Everything the site needs is known at build time:
   - English and Arabic are sibling route groups: (en) and ar
   - both dynamic routes declare generateStaticParams
     (/services/[slug], /fleet/[slug] — English and Arabic)
   - the contact form posts with a mailto: link, so no server is required

   Result: `npm run build` writes the complete deployable site to ./out */
const nextConfig: NextConfig = {
  output: "export",

  /* Emit /about/index.html rather than /about.html so LiteSpeed/Apache serves
     every route from its directory index without custom rewrite rules. */
  trailingSlash: true,

  images: {
    /* No Node.js at runtime means no /_next/image optimizer endpoint — ship the
       source files as-is. Hero art direction is handled by an explicit <picture>
       in components/hero.tsx instead of the optimizer's srcSet. */
    unoptimized: true,
  },

  experimental: {
    /* (en) and ar are sibling root layouts, so there is no single root layout for
       Next.js to build a global 404 from — without this the export ships Next's
       unstyled default "404: This page could not be found." Enabling it lets
       app/global-not-found.tsx supply its own <html>/<body> and reuse the branded
       NotFoundView. */
    globalNotFound: true,
  },
};

export default nextConfig;
