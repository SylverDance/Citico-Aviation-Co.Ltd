# CITICO Aviation — Hostinger Deployment Guide

**You are holding `citico-aviation-hostinger-deployment.zip`.**

It contains the finished website (English + Arabic), the server configuration, the
project source, and these instructions. Nothing in it has to be built, compiled
or installed before you upload it. There is no database, no Node.js process and
no API key to configure.

Read section 1, then follow sections 3 → 7 in order. That is the whole job.

---

## 1. What is in this package

```
citico-aviation-hostinger-deployment.zip
│
├── index.html              ← English home page          ┐
├── 404.html                ← the branded "page not found" page
├── .htaccess               ← server configuration (routing, cache, 404, security)
├── robots.txt              ← tells search engines what to crawl
├── sitemap.xml             ← all 48 page URLs
│
├── _next/                  ← JavaScript, CSS and web fonts (filenames are
│                             fingerprinted, so they can be cached for a year)
├── img/                    ← photography and logo
├── fonts/                  ← self-hosted typefaces (Gilroy / Montserrat / Cairo)
│
├── about/  services/  fleet/  contact/  leadership/  logistics/  safety/
│                           ← the English pages, one folder per page
└── ar/                     ← the Arabic pages, same structure, right-to-left
    ├── index.html
    └── about/ services/ fleet/ contact/ leadership/ logistics/ safety/
│
├── README-HOSTINGER.md     ← this file                    ┐ reference only —
├── DEPLOYMENT-REPORT.md    ← what was built and tested    │ NOT part of the
└── source/                 ← the project itself, for      ┘ website
                              future changes
```

### What you upload and what you don't

**Upload:** everything except `README-HOSTINGER.md`, `DEPLOYMENT-REPORT.md` and
`source/`. Those three are reference material.

You do not have to be surgical about it: the shipped `.htaccess` denies those
paths over HTTP, and `source/` carries its own deny-all `.htaccess`. If you
extract the whole archive into `public_html`, the website still works and the
source is still not readable in a browser — but deleting those three items after
extraction is cleaner and saves about 11 MB of hosting space.

**Never upload:** the two `.zip` / `.tar.gz` source snapshots in the project
folder (`citico-aviation-website.zip`, `citico-aviation-website.tar.gz`) or the
`node_modules` folder. They are not part of the website.

### What this site is, technically

A **static export** of a Next.js 15 application: plain HTML, CSS, JavaScript,
images and fonts. Every URL is a real folder containing a real `index.html`, so
no rewrite rules or application server are required. `.htaccess` handles the
directory index, the custom 404 page, compression, caching and security headers.

---

## 2. Which Hostinger plan you need

**Any plan that can serve files from `public_html`.** That includes the cheapest
shared "Web Hosting / Single" plan, and all Premium, Business and Cloud plans.

You do **not** need:

- a Node.js / VPS / cloud plan (the site needs no server-side process),
- a database (MySQL is not used at all),
- any hosting panel setting beyond uploading files.

Requirements in practice:

| Need | Why |
|---|---|
| Apache or LiteSpeed with `.htaccess` support | Routing (`DirectoryIndex`), the branded 404, compression, caching |
| ~25 MB of disk space | the website is about 22 MB once extracted (the archive itself is 23 MB) |
| SSL certificate (free on Hostinger) | for `https://` and for the redirect rules in section 8 |

If your plan is a Node.js-oriented plan, this package still works — it simply
does not need the Node app feature.

---

## 3. Back up the current website first

Do this before you replace anything. It takes two minutes and it is the only
step that cannot be undone.

**Option A — let Hostinger do it**

1. hPanel → **Files** → **Backups**.
2. Create a backup of the website (or note the date of the most recent automatic
   one). Hostinger keeps daily backups on most plans.

**Option B — keep your own copy (recommended)**

1. hPanel → **Files** → **File Manager**.
2. Open `public_html`.
3. Select everything in it → **Download** (the panel offers to zip it for you).
   On a large site this produces several files; keep them all.
4. Store the download somewhere outside the Hostinger account.

**Local copy of the old site?** If a developer built what is live now, ask them
for the source as well — a copy of `public_html` restores the site, but not the
ability to change it.

---

## 4. Getting to hPanel and File Manager

1. Sign in at **https://hpanel.hostinger.com** (or `hostinger.com` → **Login**).
2. In the top bar, choose the website you are deploying (the domain you want).
3. Open **Files** → **File Manager** (sometimes labelled just **File Manager**).
4. A two-pane file browser opens; the left pane is the folder tree, the right
   pane lists files.
5. You will see `public_html` (and possibly `public_ftp`, `mail`, `logs`).
   **`public_html` is the website's web root.** Everything the world can reach
   lives in there.

Two settings worth turning on straight away:

- **Settings → Show hidden files** — needed to see `.htaccess`, the file that
  makes the custom 404 page and the caching rules work.
- **Settings → Confirm before delete** (if offered) — cheap insurance.

---

## 5. Where the files go

Into **`public_html`** — the contents of the archive, not the archive itself.

The website is served from `public_html`, so these must be true when you are done:

```
public_html/index.html      ← English home page      ✔ the entry point
public_html/ar/index.html   ← Arabic home page       ✔
public_html/.htaccess       ← server configuration   ✔
public_html/_next/          ← build assets           ✔
public_html/img/            ← images                 ✔
```

The most common deployment mistake on shared hosting is ending up with
`public_html/citico-aviation-hostinger-deployment/index.html` or
`public_html/out/index.html`. Section 7 shows how to check and fix that.

Before uploading, also delete the two placeholder files the host creates, if
they exist:

- `public_html/index.html` (Hostinger's "Success! Your new site is ready" page)
- `public_html/default.php`

If you leave them, they will win over the real home page.

---

## 6. Extracting the archive

### Using hPanel File Manager (no extra software)

1. hPanel → **Files** → **File Manager** → open `public_html`.
2. Upload `citico-aviation-hostinger-deployment.zip`
   (**Upload** button, then drag the file in, or use **Settings → Upload**).
3. When the upload finishes, right-click the archive → **Extract**.
4. In the extract dialog, leave the destination as the current folder
   (`public_html`) and confirm. Extraction of a ~25 MB archive takes a moment.
5. When it finishes, delete the `.zip` from `public_html` (it is not needed and
   is listed in the shipped `.htaccess` as a file that must not be downloadable
   anyway).
6. Optional tidy-up: delete `README-HOSTINGER.md`, `DEPLOYMENT-REPORT.md` and
   the `source/` folder. Keep your own copy of them first — they are in your
   download.

### Using FTP (FileZilla)

1. hPanel → **Files** → **FTP Accounts** → copy the host, username and password.
2. In FileZilla: **File → Site Manager → New site**, protocol **FTP** (or SFTP),
   enter those credentials, connect.
3. Turn on **Server → Force showing hidden files** so `.htaccess` transfers.
4. Upload `citico-aviation-hostinger-deployment.zip` into `public_html`, then
   use hPanel File Manager to extract it (FTP itself cannot extract archives) —
   or upload the archive *contents* directly, keeping `.htaccess`.

---

## 7. Make sure the entry point is directly inside `public_html`

After extraction, open `public_html` in File Manager and look for `index.html`.

**Right:**

```
public_html/
├── index.html      ✔  this is the English home page
├── ar/
├── _next/
├── img/
└── .htaccess
```

**Wrong — the site will show a blank page, a "not found" page, or the host's
placeholder:**

```
public_html/
└── citico-aviation-hostinger-deployment/   ✘ extra folder level
    ├── index.html
    └── ...
```

### How to fix it

1. Open the extra folder (`citico-aviation-hostinger-deployment`, or `out`).
2. Select everything inside it — including the hidden `.htaccess` (turn on
   **Show hidden files** first) — and **Cut**.
3. Go up to `public_html` and **Paste**.
4. Delete the now-empty extra folder.
5. Reload `https://your-domain/`. You should see the English home page.

**Check the two most important files are really there:** `public_html/index.html`
and `public_html/.htaccess`. If `.htaccess` did not come across (easy to miss —
it is a hidden file), the site still loads but unknown URLs will show Hostinger's
generic error page instead of the branded one, and the caching rules will not
apply.

---

## 8. Domain (DNS) and HTTPS

### If the domain is registered elsewhere

In hPanel → **Domains** → **DNS / Nameservers**, either:

- point the domain's nameservers at Hostinger's (fastest and least work), or
- keep your current nameservers and add the `A` record (and `www` `CNAME`)
  Hostinger shows in that screen.

DNS changes take from a few minutes up to a few hours to spread.

### HTTPS

1. hPanel → **Security** → **SSL**. Hostinger issues a free certificate for the
   domain automatically; wait until it shows **Active** for both the bare
   domain and `www`.
2. Once it is active, switch on the redirect rules in `.htaccess`. Open
   `public_html/.htaccess` in the File Manager editor, scroll to **section 6** at
   the bottom, and un-comment (remove the leading `#`) from:
   - block **(a)** — sends `http://` visitors to `https://`; and
   - **either** block **(b)** (prefer `www.`, which matches the canonical tags
     the site already contains) **or** block **(c)** (prefer the bare domain) —
     never both.

Save the file. Test `http://your-domain/` in a browser: it should land on
`https://www.your-domain/` in one step.

**Do not enable block (a) before the certificate is active** — that takes the
site down. That is why it ships switched off.

---

## 9. Testing English and Arabic

Open the site and check these seven things:

| # | Check | What you should see |
|---|---|---|
| 1 | `https://your-domain/` | English home page, hero photograph, header, footer |
| 2 | `https://your-domain/ar/` | Arabic home page, right-to-left layout, Cairo typeface, Arabic navigation |
| 3 | Language switcher | on the English page it offers **العربية**; on the Arabic page it offers **English**, and each takes you to the *same page* in the other language (e.g. `/services/` ↔ `/ar/services/`) |
| 4 | A deep page | `https://your-domain/services/air-cargo/` and `https://your-domain/ar/services/air-cargo/` both load |
| 5 | A typo URL | `https://your-domain/no-such-page` shows the branded "Off the flight plan." page, not the host's default |
| 6 | A phone/desktop view | resize the window: the menu collapses into a button on narrow screens |
| 7 | Console | open browser DevTools → Console: no red errors (a font-preload warning from Next.js is harmless) |

The contact form and the footer newsletter form both open the visitor's own
email application with the message prepared — there is no server behind them, so
nothing is stored on the site. See section 12 if you want them to submit
automatically instead.

### Automating these checks

The project ships a verifier that runs all of the above (and ~45 more checks)
against the live domain:

```bash
npm run verify:live -- https://your-domain
```

`npm run verify:deploy` is the post-upload version: it waits until the build
that is on disk is actually the one being served, then verifies it. See
`DEPLOY.md` in the source tree for the flags.

---

## 10. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Blank page, or "Success! Your new site is ready" | Hostinger's placeholder `index.html` is still there, or the archive was extracted one level too deep | Delete the placeholder; move the files so `public_html/index.html` is the home page (§7) |
| Home page works, every other page 404s | `.htaccess` was not uploaded (hidden file) or was not extracted | Show hidden files and re-upload `.htaccess` to `public_html/` |
| Generic "404 Not Found" instead of the branded page | `.htaccess` missing, or `404.html` was not uploaded | Both must sit in `public_html` |
| Images missing, layout unstyled | `_next/` or `img/` was skipped during upload/extraction | Re-upload those folders; check they exist in `public_html/` |
| Arabic page shows left-to-right or squares instead of letters | `ar/` folder incomplete, or the `fonts/` and `_next/static/media/` font files are missing | Re-upload; Arabic needs the Cairo `.woff2` files |
| Old content keeps appearing after you upload a new build | browser cache | hard refresh (Ctrl/Cmd+Shift+R). `.htaccess` sends `must-revalidate` for HTML, so a normal reload is usually enough |
| Site unreachable right after enabling redirect block (a) | the SSL certificate is not active yet | re-comment block (a) in `.htaccess`, wait for SSL **Active**, then re-enable |
| Arabic visitors see an English 404 page | a static host serves a single `404.html` for the whole site | known and documented; see `DEPLOYMENT-REPORT.md` |
| Contact/newsletter button appears to do nothing | the visitor's browser has no configured email application, so the `mailto:` link has nowhere to go | expected; the direct email address and phone number are printed next to the form. See section 12 for a real form backend |

Checklist if something is off: is there an `index.html` directly in
`public_html`? is `public_html/ar/index.html` present? is `_next/` there? is
`.htaccess` there? Those four answers resolve almost every deployment problem.

---

## 11. Updating the website later

You need the `source/` folder from this archive (and Node.js 18+ installed on
your computer). Keep it — it is the difference between editing the site and
rebuilding it.

```bash
# once, in the source/ folder
npm install

# edit content in src/lib/content.ts (English copy), src/lib/dict-en.ts and
# src/lib/dict-ar.ts (both languages), or replace images in public/img/

# rebuild the deployable site and repackage the archive
npm run package:hostinger
```

That writes a fresh `citico-aviation-hostinger-deployment.zip` and checks every
file inside it byte-for-byte. Then:

1. Back up the current `public_html` (section 3).
2. Upload and extract the new archive over the old files, letting it overwrite.
3. Delete the two `.md` files and `source/` again if you uploaded the whole
   archive.
4. Run `npm run verify:deploy -- https://your-domain` (start it *before*
   uploading if you want it to catch the moment the new files go live).

**Small edits without a rebuild:** text that lives inside the HTML can be edited
directly in the File Manager, but the next rebuild will overwrite it. Prefer
editing the dictionary files and rebuilding.

---

## 12. Features that need a database, backend, API or external service

The website itself needs **none** of these: it is static files, and every page,
image, font and language works with no server-side code, no database and no
credentials. Two things are worth knowing:

| Feature | What it does today | What it needs to do more |
|---|---|---|
| Contact form (`/contact/`) and footer newsletter form | build a pre-filled email and open the visitor's mail app (`mailto:`), addressed to `citicoaviation@gmail.com` | a server-side endpoint or a form service key. On static hosting the practical route is a third-party form service (e.g. Formspree, Web3Forms, Netlify Forms) or a newsletter provider (e.g. Mailchimp, Buttondown). Those need an API key or a hosted form ID that you sign up for yourself — no key is included in this package, and none can be |
| Embedded map on `/contact/` | an OpenStreetMap `<iframe>` | nothing, but it is the one visual element that requires the visitor to be online to load; if you prefer Google Maps, replace the `src` |

Nothing else leaves the site: the only external requests are the map iframe and
the Facebook / YouTube links in the footer.

If you later add one of the form services above, edit
`src/components/contact-client.tsx` and `src/components/footer.tsx`, rebuild,
and re-upload. Until then the forms are honest about what they do — they never
claim a message was delivered when it was not.

---

## Support references

- `DEPLOYMENT-REPORT.md` — what was built, what was tested, what could not be
  tested without a live domain, and the known limitations.
- `DEPLOY.md` — the developer-facing deployment notes (packaging, verifiers,
  post-deploy smoke test).
- `README.md` — the project itself: stack, pages, how to run it locally.
