# Deploying to Hostinger

CITICO Aviation's site is a Next.js app with no server-side logic — the contact
form posts through a `mailto:` link, and all content is known at build time. It
is therefore built as a **static export**: plain HTML, CSS, JavaScript, images
and fonts that any Hostinger plan can serve directly.

## The artifact

**`citico-aviation-hostinger-deployment.zip`** (≈23 MB) — this is the file you
upload. It is written by `npm run package:hostinger`.

The site files sit at the **root** of the archive, so they must be extracted
straight into `public_html`. Extracting it inside a subfolder is the single most
common way to end up with a blank page.

```
index.html        ← English home page
404.html          ← branded error page (wired up by .htaccess)
.htaccess         ← server config (routing, caching, compression, 404, denials)
robots.txt
sitemap.xml
_next/            ← build output: JS, CSS, fonts (fingerprinted)
img/              ← photography, logo, favicons
fonts/            ← self-hosted typefaces
about/  services/  fleet/  contact/  logistics/  leadership/  safety/
ar/               ← the entire Arabic tree (ar/index.html, ar/about/, …)

README-HOSTINGER.md   ← beginner deployment guide   ┐ reference material,
DEPLOYMENT-REPORT.md  ← what was built and tested   │ denied over HTTP,
source/               ← the project, for rebuilds   ┘ safe to delete on the server
```

`README-HOSTINGER.md` is the handover document — it is the one to send to
whoever uploads the site. The two Markdown files and `source/` are not part of
the website: `.htaccess` section 5 denies `*.md`, `*.zip`, `*.tsbuildinfo` and
`^source`, and `source/` carries its own deny-all `.htaccess` as a backstop.

Most of the archive's weight is the site's own imagery; the rest of the bulk is
`source/`, which mirrors the project (minus
`node_modules`, `.next`, `out`, `.assets_raw` and `.freebuff`) so the site can be
rebuilt later. The older root-level archives (`citico-aviation-website.zip`,
`citico-aviation-website.tar.gz`) are **stale** source snapshots from before the
switch to a static export; ignore them, and do not upload any archive to
`public_html`.

## Upload

### Option A — hPanel File Manager

1. Log in to Hostinger → **Files → File Manager**.
2. Open **`public_html`**.
3. Delete Hostinger's placeholder `index.html` and `default.php` if they exist,
   otherwise they will shadow the real home page.
4. Click **Upload**, select `citico-aviation-hostinger-deployment.zip`, and wait
   for it to finish.
5. Right-click the uploaded archive → **Extract** → extract into the current
   folder (`public_html`).
6. Confirm `public_html/index.html` exists, then delete the `.zip`.
7. Turn on **Settings → Show hidden files** and confirm `.htaccess` is present
   at `public_html/.htaccess`. Without it the custom 404 page will not be used.

### Option B — FTP (FileZilla)

1. Connect with the FTP credentials from hPanel → **Files → FTP Accounts**.
2. Upload `citico-aviation-hostinger-deployment.zip` into `public_html` and extract it there,
   or upload the archive contents directly (enable "show hidden files" so
   `.htaccess` is transferred).

The site is then live: `https://<your-domain>/` (English) and
`https://<your-domain>/ar/` (Arabic).

To have the result checked for you the moment extraction finishes, run
`npm run deploy` *before* uploading and leave it running while you upload — see
[Prove the upload landed](#prove-the-upload-landed-not-just-that-the-site-is-up).

## Enable HTTPS and pick one hostname

`.htaccess` ships with the redirect rules **switched off on purpose**, so the
site works the moment you upload it — forcing HTTPS before the certificate
exists would take it down.

Once Hostinger shows SSL as **Active** for the domain (hPanel → **Security →
SSL**), open `public_html/.htaccess`, go to section 6 at the bottom, and remove
the `#` from the block you need:

| Block | What it does | When to enable |
|---|---|---|
| **(a)** | Redirects `http://` → `https://` | Once SSL is active. Enable this. |
| **(b)** | Redirects to `www.` | If your site should be `www.citicoaviation.com` |
| **(c)** | Redirects to the bare domain | If it should be `citicoaviation.com` |

Enable **(a)** plus exactly one of **(b)** or **(c)** — never both. The canonical
tags Next.js writes point at `https://www.citicoaviation.com/…`, so **(b)** is
the matching choice unless your DNS says otherwise.

Block **(d)** collapses `/about/index.html` onto `/about/` so only one URL is
indexable. It is safe to enable and purely cosmetic for SEO.

## Check it after uploading

Against the live domain:

```bash
npm run verify:live -- https://<your-domain>
```

That runs every check below and prints a pass/fail report, exiting non-zero if
anything is broken:

| Group | What it proves |
|---|---|
| Reachability | the domain answers, TLS is accepted, the built files really uploaded |
| Host & transport | `/about` redirects to `/about/`, and whether the `http→https` and hostname rules are on yet |
| Routing | all 48 URLs from `sitemap.xml` return 200 HTML, in both language trees |
| 404 contract | unknown URLs return **404** *and* the branded "Off the flight plan." page — not the host's default |
| Exposure | `.htaccess`, `package.json`, `src/` and friends are not downloadable; no folder listings |
| Language trees | `/` is `lang=en`, `/ar/` is `lang=ar dir=rtl` with real Arabic text, hreflang alternates are reciprocal |
| Referenced assets | every image, script, stylesheet and font the shipped HTML and CSS point at returns 200 with the right MIME type, and sampled files are valid by magic number |
| Compression / Caching / Security headers | the corresponding `.htaccess` blocks took effect |
| Crawler files | `robots.txt` does not block the site and advertises a resolvable sitemap; `sitemap.xml` is valid XML |
| Typography | the self-hosted @font-face files (Gilroy/Montserrat, Cairo) are reachable |

`--strict` also fails on warnings — use it once section 6 of `.htaccess` is
enabled and you expect full hardening. `--json` emits a machine-readable report.
`--no-crawl` skips the asset sweep for a quick routing-only check.

Expect **warnings, not failures**, on a fresh upload: compression, cache and
security headers stay absent until the `IfModule` blocks apply, and the
canonical-host checks complain while you are testing a temporary domain.

## Prove the upload landed, not just that the site is up

`verify:live` checks whatever is being served *at that moment*. Right after an
upload that is a trap: until extraction finishes the old build keeps serving,
every check passes against it, and a failed upload gets certified as a success.

`verify:deploy` closes that gap. It fingerprints the build in `./out` — the set
of content-hashed `/_next/` files `index.html` references — polls the live site
until the page being served references that same set, and only then runs
`verify:live`. If the new build never shows up it exits *without* verifying and
reports what is still being served instead, so a pass always means your upload
is live.

```bash
npm run verify:deploy                     # wait up to 10 min, then verify
npm run verify:deploy -- --no-wait        # verify immediately, don't wait
npm run verify:deploy -- --timeout 1800   # for a slow upload
```

Or do the whole thing in one command — package, then wait while you upload:

```bash
npm run deploy
```

That builds and repackages `citico-aviation-hostinger-deployment.zip`, then sits there watching
the live site. Upload the archive in hPanel while it waits and it notices the new
files and verifies them on its own. It does **not** upload anything for you.

| Flag | Meaning |
|---|---|
| `--url <origin>` | target a staging host instead of the production domain |
| `--timeout <sec>` | how long to wait for the build to appear (default 600; `0` waits forever) |
| `--interval <sec>` | seconds between polls (default 15) |
| `--no-wait` | skip the wait and verify whatever is live right now |
| `--strict`, `--no-crawl` | passed through to `verify:live` |

| Exit | Meaning |
|---|---|
| `0` | the build on disk is live and verifies clean |
| `1` | the build is live but the site has problems |
| `2` | usage error, or no local build to compare against |
| `3` | the build never appeared — not uploaded, extracted into a subfolder, or the domain does not resolve |

The target defaults to `SITE_ORIGIN` in `src/lib/site.ts` — the same single
source the build itself uses — so moving the domain stays a one-line edit.

`--no-wait` turns it into a plain "is the live site healthy?" probe that needs no
local build, which is the shape a scheduled task wants (Windows Task Scheduler,
or a cron job on a machine holding this checkout):

```bash
npm run verify:deploy -- --no-wait
```

Then confirm by eye, on the live domain:

- the Arabic page at `/ar/` renders right-to-left with the Cairo typeface;
- the hero photograph is sharp on phone, tablet and desktop;
- the language switcher moves between `/` and `/ar/`;
- an obvious typo in the URL shows the branded "Off the flight plan." page.

For a raw look at individual responses:

```bash
curl -I https://<your-domain>/                 # 200 text/html
curl -I https://<your-domain>/ar/              # 200 text/html
curl -I https://<your-domain>/no-such-page     # 404 + the branded page
```

## Rebuilding after a content change

```bash
npm install
npm run package:hostinger
```

That runs the production build and re-writes
`citico-aviation-hostinger-deployment.zip` — including the current `source/`,
the two documents and the root `.htaccess` — CRC-checking every entry against the
bytes on disk before it finishes. Upload the new archive over the old one and
re-extract.

To preview the built site exactly as a static host serves it — including
directory-index routing and the custom 404 — run:

```bash
npm run build
npm start                 # http://localhost:4173
```

`npm run dev` is still the normal development server on `:3000`.

## How the build is configured

`next.config.ts` sets three things that make this deployment possible:

| Setting | Why |
|---|---|
| `output: "export"` | Emits `out/` as static files instead of a Node server |
| `trailingSlash: true` | Writes `about/index.html`, so LiteSpeed/Apache resolves `/about/` with no rewrite rules |
| `images.unoptimized: true` | There is no `/ _next/image` optimizer endpoint on shared hosting; the pre-cropped hero assets are referenced directly by an explicit `<picture>` |

`robots.ts` and `sitemap.ts` declare `export const dynamic = "force-static"`,
which `output: "export"` requires. The global 404 lives in
`src/app/global-not-found.tsx` and needs `experimental.globalNotFound` because
the English `(en)` and Arabic `ar` route groups are sibling root layouts, so
Next.js has no single layout to derive a 404 from.

## Known limitation

Page content is revealed by JavaScript animations: sections are served with
`opacity: 0` and animated in on load or scroll. In any normal browser this is
instant and invisible to the visitor. It does mean that with JavaScript disabled
the header and below-the-fold sections stay hidden, because only the hero has a
fallback path for a stalled animation loop. Say the word if you want that
hardened — the fix is small and reuses the fallback `hero.tsx` already has.

## Troubleshooting

| Symptom | Cause |
|---|---|
| Blank page, or a Hostinger placeholder | The archive was extracted into a subfolder, or the host's default `index.html` was left in place |
| Home page works, all other pages 404 | `.htaccess` was not uploaded (hidden files not shown in the FTP client) |
| Generic "404 Not Found" instead of the branded page | `.htaccess` missing, or `404.html` was not uploaded |
| Site unreachable after enabling block (a) | SSL is not active for the domain yet — re-comment block (a) |
| Images missing, layout broken | The `_next/` or `img/` folders were skipped during upload |
| New content not appearing | Cached HTML. `.htaccess` sends `must-revalidate`, so a hard refresh is enough |
