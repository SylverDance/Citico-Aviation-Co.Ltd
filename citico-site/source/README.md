# CITICO Aviation Co. Ltd — Official Website

Premium aviation & integrated logistics website for CITICO Aviation (Juba, South Sudan).

**Safe. Reliable. Mission Ready. — Operating Where Others Cannot.**

## Stack

- **Next.js 15** (App Router, static prerender) + **TypeScript**
- **Tailwind CSS v4** — brand tokens sampled from the official logo (`#0c0c78` blue, `#900c18` red)
- **Framer Motion** — reveals, modal, micro-interactions
- **GSAP** — cinematic hero entrance timeline
- Dark mode (class-based, persisted), SEO metadata, JSON-LD `Organization` schema, sitemap, robots

## Pages

| Route | Description |
|---|---|
| `/` | Hero, Who We Are, Mission/Vision/Values, Services, Fleet, Logistics flow, Why CITICO, Leadership, Safety, Partners, Contact |
| `/about` | Story + HSEE (Health, Safety, Environment & Ethics) |
| `/logistics` | Multimodal AIR→RIVER→GROUND flow + asset tables |
| `/leadership` | Team grid with bio modals |
| `/safety` | Metrics, SMS/ICAO compliance, testimonial |
| `/contact` | Details, map, charter request form (mailto) |
| `/services/[slug]` | 7 service detail pages (SSG) |
| `/fleet/[slug]` | 5 aircraft detail pages (SSG) |

## Run

```bash
npm install
npm run dev                  # development server, http://localhost:3000
npm run build                # production build — static export to ./out
npm run package:hostinger    # build + citico-aviation-hostinger-deployment.zip ready to upload
npm run deploy               # build + package, then wait for your upload and verify it
npm run verify:live -- https://your-domain   # check whatever is live right now
```

The production build is a **static export** (`output: "export"`), so there is no
Node.js process in production and `next start` no longer applies. `npm start`
now serves the built `./out` folder on `:4173`, which previews the exact
artifact a static host serves, custom 404 page included.

`npm run verify:deploy` fingerprints the build in `./out`, waits until that exact
build is the one being served, and only then runs the verifier — so a pass means
your upload actually landed, rather than certifying the build that was already
there. It takes no URL argument: the target comes from `SITE_ORIGIN` in
`src/lib/site.ts`, the same one-line source the build uses for the domain.

Hosting instructions are in **[DEPLOY.md](DEPLOY.md)**; the beginner-facing
walkthrough that ships inside the archive is **`README-HOSTINGER.md`**, and a
report of what was built and verified is in **`DEPLOYMENT-REPORT.md`**.

The archive contains the site at its root, plus those two documents and a copy of
the project under `source/` for future rebuilds (`.htaccess` denies all three
over HTTP, and they can be deleted on the server).

## Assets — where they came from

All imagery in `public/img` was extracted and optimized from the client's own
materials by `scripts/`:

1. **`scripts/extract-pdf-images.mjs`** — pulls all 28 embedded bitmaps
   (FlateDecode RGB + SMask alpha) out of `Citico_Profile_2026-003.pdf`.
2. **`scripts/map-pdf-images.mjs`** — walks the PDF page tree to map each image
   to the page that draws it (cover, fleet, river, leadership pages…).
3. **`scripts/page-placements.mjs`** — mini PDF content-stream interpreter
   (tracks `q/Q/cm` CTMs, skips text blocks) to get each image's on-page
   position/size — this is how the four leadership portraits were matched to
   the right people (draw-order disambiguation for overlapping crops).
4. **`scripts/build-web-assets.mjs`** — sharp pipeline producing hero, ops,
   portrait (640×800), favicon, white logo, and OG assets.

Raw extraction cache lives in `.assets_raw/` (safe to delete).

## Editing content

All copy, stats, services, fleet specs, leaders, partners and contact details
live in **`src/lib/content.ts`** — single source of truth, sourced from the
2026 company profile PDF. Edit there; pages and SEO metadata follow
automatically.

### Swapping imagery

- Portraits: drop replacements into `public/img/leader-*.jpg` (640×800, 4:5).
  Unverified alternates are kept as `leader-alt-*.jpg`.
- Hero: replace `hero-aviation.jpg` (1920×1080) and `hero-aviation-mobile.jpg`.
- Service/fleet cards: update `image` fields in `src/lib/content.ts`.

## Notes

- The header uses a transparent-over-hero → glassmorphism-on-scroll pattern.
- Counters/reveals use a scroll-position hook (`useInViewSafe`) rather than
  IntersectionObserver — deterministic in embedded webviews and throttled
  environments.
- Production build: 50 exported HTML pages across the English and Arabic trees.
