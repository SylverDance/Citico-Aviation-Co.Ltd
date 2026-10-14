# Deployment test report — CITICO Aviation

**Artifact:** `citico-aviation-hostinger-deployment.zip`
**Prepared:** 10 October 2026
**Target:** Hostinger shared hosting (`public_html`, Apache/LiteSpeed)
**Sources:** the existing Next.js project in this folder, unchanged in
architecture — nothing was rebuilt from scratch and no functionality was removed.

**Live deployment status: NOT tested on Hostinger.** The production domain
(`www.citicoaviation.com`) does not resolve yet, so this package was verified
against the real build output served locally by the same routing rules the host
uses — never against the host itself. The shipped `.htaccess` rules were
additionally proven on a real Apache 2.4 server (§5.6). Everything in section 5
below was run; the checks that need a live domain are listed in section 6 and
are *not* claimed.

---

## 1. What was delivered

| File | What it is |
|---|---|
| `citico-aviation-hostinger-deployment.zip` | the upload-ready website, the server configuration, the project source, and the two documents below |
| `README-HOSTINGER.md` | step-by-step deployment instructions, written for someone who has never used hPanel |
| `DEPLOYMENT-REPORT.md` | this report |

The archive holds the site at its **root**, so extracting it into `public_html`
places `index.html` exactly where the host looks for it. `source/` and the two
Markdown documents sit alongside it, clearly separated, and are denied over HTTP
by `.htaccess` (see section 4).

---

## 2. Architecture decision

The project is **Next.js 15.5.25 / React 19**, which is *not* something ordinary
shared hosting can run as-is: Next.js normally needs a Node.js process for
server rendering, route handlers and the `/_next/image` optimizer.

The site was therefore reviewed for server dependencies and exported as **static
files**. That was already the project's configuration; this task verified it
still holds rather than changing it:

| Next.js feature | Needed here? | How it is handled |
|---|---|---|
| Server rendering (SSR) | no | every page is pre-rendered at build time (`output: "export"`) |
| API routes / route handlers | no | there are none in `src/app/` |
| Database | no | no DB client anywhere in the project |
| Image optimizer | no | `images.unoptimized: true`; the hero uses an explicit `<picture>` with pre-cropped files |
| `trailingSlash: true` | yes | emits `about/index.html`, so LiteSpeed resolves `/about/` with no rewrite rules |
| Dynamic routes | yes | `/services/[slug]` and `/fleet/[slug]` declare `generateStaticParams`, so all 24 × 2 pages are pre-rendered |
| Contact/newsletter forms | no backend | they open the visitor's mail client with the message prepared (see section 6) |

**Conclusion:** a plain shared-hosting plan serving files from `public_html` is
sufficient. No Node.js plan, no database, no server-side runtime, no API keys.

---

## 3. Build results

```
node v26.7.0 · npm 11.19.0 · next 15.5.25 (Turbopack) · react 19.1.0
command:  npm run build           (= next build --turbopack)
exit:     0
result:   ✓ Compiled successfully in 19.0s
          ✓ Generating static pages (53/53)
          ✓ Exporting (2/2)
```

| Output | Count |
|---|---|
| Files written to `out/` | 193 (22 MB) |
| HTML pages | 50 — 24 English + 24 Arabic + `404.html` + `/404/` |
| Sitemap URLs | 48 (24 English, 24 Arabic) |
| Client-navigation RSC payloads (`.txt`) | 48 |
| JavaScript / CSS | 23 / 4 |
| Web fonts | 25 (`Gilroy`, `Montserrat`, `Cairo` self-hosted) |
| Images | 40 |

No build warnings, no missing-module errors, no unresolved imports.

---

## 4. Package contents and integrity

```
citico-aviation-hostinger-deployment.zip
├── index.html  404.html  robots.txt  sitemap.xml  .htaccess   ← web root
├── _next/  img/  fonts/                                       ← assets
├── about/ services/ fleet/ contact/ leadership/ logistics/ safety/
├── ar/  (24 Arabic pages, dir=rtl)
├── README-HOSTINGER.md  DEPLOYMENT-REPORT.md                  ← reference (denied over HTTP)
└── source/  (the project: src, public, scripts, deploy, docs, configs)
    └── .htaccess                                              ← deny-all for the source tree
```

| Property | Measured |
|---|---|
| Archive size | **23.08 MB** (about 24.2 million bytes); `npm run package:hostinger` prints the exact figure for your build |
| Entries | 327 files in 87 folders — 32.07 MB uncompressed |
| Site files | 194 — the published website (`index.html`, `ar/`, `_next/`, `img/`, `fonts/`, …) |
| Reference documents | 2 — this report and `README-HOSTINGER.md` |
| Project source | 131 files, 11 MB uncompressed, under `source/` |
| Compression | 119 files stored (already-compressed media), 208 deflated |
| Integrity | **327 / 327 entries byte-identical** to the files on disk; CRC-32, sizes, compression method and local-header offset checked on every entry; no unexpected entries |

The packager (`scripts/package-hostinger.mjs`) is not a generic zip tool: it
writes the archive itself and then **reads it back**, inflating every entry and
comparing it byte-for-byte with the file on disk, checking CRC-32, size and
compression method, and refusing to finish if any entry is missing, unexpected
or different. It also refuses to package an `.env*` file, `node_modules`,
`.next`, `out`, `.assets_raw`, `.freebuff`, any `.zip`/`.tar.gz`, or a
`.tsbuildinfo`, and it fails if `index.html`, `ar/index.html`, `404.html`, both
documents or `source/package.json` are absent.

---

## 5. Checks performed, and their results

### 5.1 Build and static analysis

| Check | Command | Result |
|---|---|---|
| Production build | `npm run build` | **pass** — exit 0, 53 pages, export complete |
| TypeScript | `npx tsc --noEmit` | **pass** — 0 errors |
| Lint | `npm run lint` | **pass** — 0 errors, 12 warnings (all pre-existing: unused imports in `src/components/*` and two `react-hooks/exhaustive-deps` notices in `hero.tsx`) |

One lint *configuration* defect was found and fixed: `scripts/*.js` are CommonJS
utilities executed directly with `node` (`package.json` declares no
`"type": "module"`), so the Next.js rule banning `require()` reported 6 false
errors. The rule is now scoped off for `scripts/**/*.js` only; nothing else was
relaxed.

### 5.2 Live-style verification of the real artifact

`npm run verify:live -- http://localhost:4173`, against `out/` served by the
project's own static server (`scripts/serve-out.mjs`, which reproduces LiteSpeed
directory-index behaviour and the `.htaccess` `ErrorDocument`):

```
46 checks · 29 passed · 0 failed · 13 warnings   →  exit 0
```

Highlights (all **pass**): all 48 sitemap routes return 200 HTML; the Arabic
tree serves all 24 routes; unknown URLs return **404 with the branded "Off the
flight plan." page**; no source/config file is downloadable; directory listings
are disabled; `/` is `lang=en` and `/ar/` is `lang=ar dir=rtl` with real Arabic
text and reciprocal `hreflang`; 89 referenced assets — images, scripts,
stylesheets, the 20 self-hosted font files — all return 200 with correct MIME
types and valid magic numbers; `robots.txt` is permissive and advertises a valid
sitemap.

The 13 warnings are all host-configuration or environment, not site defects:
compression, caching and security headers are inactive on a plain local server
(they come from the `.htaccess` `IfModule` blocks on the real host); the
canonical-host checks complain because the domain does not resolve; and
`/about/index.html` does not collapse onto `/about/` until optional block (d) is
enabled.

### 5.3 Offline link and asset audit

Every `href`, `src` and `srcset` in all 50 built HTML files was resolved against
the files on disk:

| Metric | Result |
|---|---|
| Pages scanned | 50 |
| Distinct internal references | 98 (48 links/routes + 50 assets) |
| **Unresolved internal references** | **0** |
| Exported routes with no inbound link | **0** (no orphan pages) |
| `tel:` / `mailto:` links | 198 / 52 |
| **Mixed content** (would break on HTTPS) | **0** — 54 HTML/CSS files scanned, no plain-`http://` subresource anywhere; every absolute reference is `https:` (own site, Facebook, YouTube, OpenStreetMap) |

External references are limited to four origins: the site's own canonical host,
Facebook, YouTube, and `openstreetmap.org` (the `/contact/` map iframe). Nothing
else leaves the site.

### 5.4 Browser checks (real Chromium, against the built output)

| Check | Result |
|---|---|
| English home renders | **pass** — correct title, hero, header, footer |
| Arabic home renders | **pass** — `lang=ar`, `dir=rtl`, 1 399 Arabic characters visible, **Cairo** font loads |
| Arabic on 10 sampled routes (`/ar/`, about, services, fleet, a service detail, a fleet detail, contact, leadership, safety, logistics) | **pass** — every one `lang=ar dir=rtl` with 23 000+ Arabic characters; Arabic navigation labels render |
| Language switcher | **pass** — Arabic page offers English and vice versa; on `/ar/services/` the switch points at `/services/` (equivalent page, not the home page) |
| Mobile menu | **pass** — opens and closes, labelled in the current language |
| Client-side navigation | **pass** — navigating to `/ar/services/` updated the URL and content with no page reload and no errors |
| Images / fonts in browser | **pass** — 0 broken images, 0 failed font loads, all requests 200 |
| Console | **pass** — no errors; only the harmless Next.js "preloaded but not used" font/CSS notices |
| RSC navigation payloads | **pass** — the 48 `.txt` files the client prefetches exist and are served, so client-side routing works on static hosting |

### 5.5 The archive itself: extracted with an independent tool, then served

The archive was unpacked with **Info-ZIP `unzip`** — a different implementation
from the one that wrote it — and then served as a web root with the shipped
`.htaccess` rules modelled locally:

| Check | Result |
|---|---|
| `unzip -t` over all 327 entries | **pass** — "No errors detected in compressed data of citico-aviation-hostinger-deployment.zip" |
| Extraction | **pass** — exit 0; top level is `index.html`, `404.html`, `.htaccess`, `_next/`, `img/`, `fonts/`, both language trees, the two documents and `source/` |
| Forbidden content | **pass** — no `node_modules`, `.next`, `.env*`, `.git`, `.freebuff`, `.assets_raw`, `.zip` or `.tar.gz` anywhere in the archive |
| `.htaccess` placement | **pass** — at the web root, and a deny-all inside `source/` (the original also travels at `source/deploy/.htaccess`) |
| Routing from the extracted copy | **pass** — `/` 200, `/ar/` 200, `/services/air-cargo/` 200, `/ar/services/air-cargo/` 200, `/about` → 301 `/about/`, `/nope` → 404 with the branded page, a directory request → 403 |
| Full verifier run against the extracted copy | **pass** — `46 checks · 29 passed · 0 failed · 13 warnings`, exit 0 — identical to the run against the build itself |
| Deny rules (modelled from `.htaccess`) | **pass** — `/source/`, `/source/package.json`, `/source/src/lib/content.ts`, `/README-HOSTINGER.md`, `/DEPLOYMENT-REPORT.md` and `/.htaccess` all return **403**; `robots.txt`, `sitemap.xml` and the RSC `index.txt` payloads still return 200 |

This is the strongest statement this report can make about the *archive*: the
bytes you upload extract cleanly with a third-party tool, place `index.html` at
the web root, and verify as a working bilingual site. The deny-rule row above
comes from a **local model** of the `.htaccess` rules — §5.6 then runs the real
rules on real Apache, which is what proves they work.

### 5.6 The `.htaccess` rules on a real Apache 2.4 server

§5.5 exercised the deny rules against a **local re-implementation** of them. To
exercise the rules themselves, the extracted archive was then served by a real
web server: **Apache/2.4.69 (Win64, Apache Lounge build)** with `AllowOverride
All` and `mod_rewrite`, `mod_deflate`, `mod_expires`, `mod_headers`,
`mod_autoindex`, `mod_authz_core` loaded.

No container runtime is installed on this machine (no Docker, no podman) and no
WSL distribution is present, so the server was a native binary rather than a
container — same software, different packaging. The web root was the archive's
own extraction, and the test `.htaccess` was confirmed byte-identical to
`deploy/.htaccess` before every run.

| Rule in the shipped `.htaccess` | Observed on real Apache |
|---|---|
| `DirectoryIndex index.html` — routing needs no rewrite rules | `/`, `/ar/`, `/services/air-cargo/`, `/ar/services/air-cargo/` all **200** text/html |
| mod_dir `DirectorySlash` | `/about` → **301** `Location: /about/` |
| `ErrorDocument 404 /404.html` | `/no-such-page`, `/ar/no-such-page`, `/services/no-such-service` → **404**, each with the branded "Off the flight plan." body |
| mod_deflate / mod_brotli block | HTML, CSS and JS all return `Content-Encoding: gzip` when `Accept-Encoding: gzip` is sent |
| mod_expires + `Cache-Control` block | JS/CSS/woff2 → `public, max-age=31536000, immutable`; images → `max-age=15552000`; HTML → `max-age=0, must-revalidate` |
| security headers block | `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy: geolocation=(), camera=(), microphone=()` on **every** response, including error responses |
| `<Files ".htaccess"> Require all denied` | `/.htaccess` → **403** |
| section 5 `FilesMatch` (`md\|zip\|tar.gz\|tsbuildinfo\|log\|bak`) | `/README-HOSTINGER.md`, `/DEPLOYMENT-REPORT.md`, `/citico-aviation-hostinger-deployment.zip` → **403** |
| section 5 `RewriteRule ^source` plus `source/.htaccess` deny-all | `/source/`, `/source/package.json`, `/source/src/lib/content.ts`, `/source/.htaccess` → **403** |
| `Options -Indexes` | `/img/`, `/_next/` → **403** (no listing); `/ar/` still **200** because it has an `index.html` |
| MIME block | `.txt` RSC payloads `text/plain`, `.woff2` `font/woff2`, `.jpg` `image/jpeg`, `.xml` `application/xml` |
| optional block (d) — enabled in a **test copy only** | `/about/index.html`, `/index.html`, `/ar/index.html`, `/services/air-cargo/index.html` → **301** to their directory URLs; following the redirect ends **200 after exactly one hop** (the `THE_REQUEST` guard prevents the loop); deny rules and the 404 contract still held |

Verifier runs against the real server:

| Run | Result |
|---|---|
| `verify:live` against the shipped configuration | **46 checks · 36 passed · 0 failed · 6 warnings**, exit 0 — every compression, caching, security-header, 404 and exposure check that failed locally now passes |
| `verify:live` with optional block (d) enabled in the test copy | **46 checks · 37 passed · 0 failed · 5 warnings** — the `/about/index.html` warning disappears |
| `verify:live --strict` | exit **1** — "NOT READY (--strict: warnings are fatal)", with **0 failed checks**. The 6 warnings promoted to failures are: 4 that compare the canonical host `www.citicoaviation.com` against a machine that is not that host, 1 for `/about/index.html` (block (d) ships commented out on purpose), and 1 for the Arabic 404 being served in English |

**What this proves:** every rule in the shipped `.htaccess` is correct and
takes effect on the server software it is written for. What it does not prove is
that *LiteSpeed* on the Hostinger account loads those modules — see §6.

### 5.7 Behaviours deliberately changed

| Change | Why |
|---|---|
| Footer newsletter form now opens the visitor's mail client instead of showing "Thank you — you are on the list." | it previously reported a successful signup while sending nothing anywhere — a false success claim, which this task's brief forbids. Both languages updated (`dict-en.ts`, `dict-ar.ts`), verified in the browser. |
| `.htaccess` gained a section 5 deny block for `*.md`, `*.zip`, `*.tar.gz`, `*.tsbuildinfo`, `*.log`, `*.bak`, plus `RewriteRule ^source` and a `source/.htaccess` deny-all | the archive now carries reference documents and the project source; none of it may be fetchable from the published site |
| `scripts/verify-live.mjs` sensitive-path list extended with `/source/`, `/source/package.json`, `/source/src/lib/content.ts`, the new archive name, and both documents | so a future upload that leaves the source tree in `public_html` is caught by the verifier instead of passing quietly |
| `scripts/package-hostinger.mjs` now starts the build through npm's JavaScript entry point instead of spawning `npm.cmd` | on Node 20+ (this machine runs 26.7.0) Windows refuses to spawn `.cmd` without a shell and the child process fails with `EINVAL` — `npm run package:hostinger` and `npm run deploy` crashed *after* building, producing no archive. Found by actually running the documented command rather than only the `--no-build` path. Fixed and re-run end to end. |

---

## 6. What could NOT be tested here — and why

These are **not** asserted anywhere in this report:

| Untested | Reason | How to close it |
|---|---|---|
| The live site on Hostinger | `www.citicoaviation.com` does not resolve (the domain is not registered/pointed yet). Running `verify:live` against it returns `ENOTFOUND`. | deploy, then run `npm run verify:deploy` |
| `.htaccess` on LiteSpeed specifically | the rules were proven on **real Apache 2.4.69** (§5.6), which is the spec LiteSpeed's `.htaccess` compatibility emulates — but LiteSpeed Enterprise is a licensed product with no runnable image available here, and this machine has no container runtime | after upload, run `npm run verify:live -- https://your-domain --strict` — it checks compression, caching, security headers, the 404 contract and that `/source/` is unreachable |
| HTTPS, TLS certificate, `http→https` and canonical-host redirects | require the real certificate and DNS; blocks (a)–(c) ship commented out on purpose | enable them per README §8 once SSL is **Active**, then re-verify |
| Real 404 handling by *this* host | the `ErrorDocument 404 /404.html` rule was proven on Apache (§5.6), branded body served at status 404; the Hostinger account's own behaviour is still unobserved | check a typo URL after upload |
| Database / backend | not applicable — none exists | — |
| OpenStreetMap iframe rendering | third-party, needs internet access from the visitor | visually confirm on the live site |

The contact and newsletter forms were **not** tested end-to-end for delivery
either, because there is no delivery: both are `mailto:` links that hand the
message to the visitor's own mail application. No backend, API key or email
service is configured, and none is included. That is stated in
`README-HOSTINGER.md` §12, with the options for adding a real form backend.

---

## 7. Known limitations

1. **The Arabic 404 page is in English.** Static hosting serves one `404.html`
   for the whole domain, so an Arabic visitor who mistypes a URL sees the
   branded English page (status 404 is still correct). Fixing it needs either a
   host that supports per-path error documents or a small `ErrorDocument`
   rewrite in `.htaccess`. Confirmed on real Apache (§5.6): an unknown URL under
   `/ar/` returns 404 with the branded **English** page.
2. **JavaScript disabled:** the reveal animations mean header and below-the-fold
   sections stay hidden; only the hero has a stalled-animation fallback. Normal
   browsers are unaffected (verified in Chromium).
3. **Hero widget inputs** ("Track Shipment", "Flight Status", "Get a Quote") are
   lead-in fields whose buttons navigate to `/contact/`; the typed values are not
   carried over. Left as designed rather than silently changed.
4. **`/about/index.html`** stays reachable alongside `/about/` until optional
   block (d) is enabled — cosmetic for SEO. Block (d) was tested on real Apache
   (§5.6): it issues exactly one 301 with no loop, so it is safe to switch on.
5. The site ships **no analytics, no cookies, no tracking**, and therefore has no
   cookie banner.
6. **`source/` is only protected by `.htaccess`.** On a host that ignores
   `.htaccess` the project source would be readable — the protection was proven
   on Apache (403 for every path, §5.6), not universally. Deleting `source/`, the
   two Markdown files and the uploaded `.zip` after extraction (README §6) removes
   the concern entirely — nothing in the website needs them.

---

## 8. Required configuration after upload

1. Extract into `public_html` so `public_html/index.html` is the home page
   (README §7).
2. Delete Hostinger's placeholder `index.html` / `default.php` if present.
3. Confirm `.htaccess`, `404.html`, `_next/` and `img/` are all in
   `public_html/` (show hidden files).
4. Optionally delete `README-HOSTINGER.md`, `DEPLOYMENT-REPORT.md` and
   `source/` from the server.
5. Wait for SSL to be **Active**, then enable `.htaccess` section 6 block (a)
   plus (b) *or* (c) — never both.
6. Run `npm run verify:deploy -- https://your-domain` (or `verify:live`) and
   eyeball the seven checks in README §9.

---

## 9. Acceptance conditions from the brief

| Requirement | Status |
|---|---|
| A downloadable archive containing the complete, runnable website | **met** — `citico-aviation-hostinger-deployment.zip`, site at its root |
| Compatible with Hostinger shared hosting | **met** — static export, no Node/DB; `.htaccess` included, `<IfModule>`-guarded, and every rule in it verified against a real Apache 2.4 server (§5.6) |
| Branding preserved | **met** — no content, imagery or copy was invented or removed; only one misleading sentence was corrected |
| English and Arabic, RTL, correct glyphs, language switching | **met and verified** — 24 + 24 pages, `dir=rtl`, Cairo font, per-page pairing |
| Functionality audited and repaired | **met** — 0 broken links, 0 broken assets, 0 console errors, forms no longer make false claims |
| Correct production files, entry point, no dev files or secrets | **met** — `index.html` at root; no `.env`, `node_modules`, `.next`, `out`, `.assets_raw` or stray archives in the package |
| `README-HOSTINGER.md` with the twelve requested topics | **met** — all twelve are present and numbered |
| `DEPLOYMENT-REPORT.md` with build results, tests, limitations, remaining configuration | **met** — this document |
| Directory tree of the final package | **met** — section 4 here, and README §1 |
| The live Hostinger site tested | **NOT met — not attempted, not claimed.** No live host was reachable. Apache stands in for it (§5.6), which is not the same claim. |

---

## 10. Reproducing this verification

```bash
npm install                     # if node_modules is absent
npm run build                   # → out/  (53 pages)
npm start                       # serves out/ on http://localhost:4173
npm run verify:live -- http://localhost:4173
npx tsc --noEmit && npm run lint
npm run package:hostinger -- --no-build    # writes and CRC-verifies the archive
npm run verify:deploy -- --url https://your-domain   # after uploading
```

To repeat the `.htaccess` test against a real Apache (§5.6) — any httpd 2.4
binary works; this run used the Apache Lounge Windows build:

```bash
unzip citico-aviation-hostinger-deployment.zip -d /path/to/webroot
# In httpd.conf, for that webroot's <Directory> block:
#   AllowOverride All
# and LoadModule for: rewrite deflate expires headers autoindex authz_core
# DocumentRoot "/path/to/webroot"   Listen 127.0.0.1:8080
node scripts/verify-live.mjs http://127.0.0.1:8080            # 36 passed / 0 failed
node scripts/verify-live.mjs http://127.0.0.1:8080 --strict   # 0 failed; the 6 warnings are domain-bound
```
