#!/usr/bin/env node
/* ──────────────────────────────────────────────────────────────
   Live-deployment verifier for the CITICO Aviation static export.

   Checks the *deployed* site the way a browser and a crawler see it:
   routing, the branded 404, every asset referenced by the shipped HTML,
   compression, caching, security headers, and both language trees.

   Usage:
     node scripts/verify-live.mjs https://www.citicoaviation.com
     node scripts/verify-live.mjs https://example.com --strict
     node scripts/verify-live.mjs https://example.com --json > report.json
     node scripts/verify-live.mjs https://example.com --no-crawl

   Flags:
     --strict    treat warnings as failures (use once .htaccess blocks
                 (a)/(b) have been enabled and you expect full hardening)
     --json      machine-readable output instead of the text report
     --no-crawl  skip downloading every asset (routing checks only)

   Exit status: 0 ok · 1 at least one failed check · 2 unreachable/usage error.

   Uses node:http/https rather than fetch so the raw Content-Encoding and
   redirect chains are visible — undici transparently rewrites both, which is
   exactly what these checks need to observe.
   ────────────────────────────────────────────────────────────── */

import http from "node:http";
import https from "node:https";
import { createBrotliDecompress, createGunzip, createInflate } from "node:zlib";

/* ── configuration ────────────────────────────────────────── */

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith("--")));
const positional = argv.filter((a) => !a.startsWith("--"));

const STRICT = flags.has("--strict");
const AS_JSON = flags.has("--json");
const NO_CRAWL = flags.has("--no-crawl");

const TIMEOUT_MS = Number(process.env.VERIFY_TIMEOUT_MS || 15000);
const CONCURRENCY = Number(process.env.VERIFY_CONCURRENCY || 6);
const MAX_ASSETS = Number(process.env.VERIFY_MAX_ASSETS || 250);
const MAX_ROUTES = Number(process.env.VERIFY_MAX_ROUTES || 60);

const UA =
  "Mozilla/5.0 (compatible; citico-deploy-verifier/1.0; +https://www.citicoaviation.com)";

/* The exact <h1> the branded 404 renders. If a host shows its own error page
   this string is absent, which is the difference between "404 works" and
   "404 returns the right status but a generic page". */
const BRAND_404 = "Off the flight plan.";

/* Hosting artefacts that must never be publicly readable. The first two also
   catch the common mistake of uploading the *source* archive instead of the
   built site. */
const SENSITIVE_PATHS = [
  "/.htaccess",
  "/.env",
  "/.env.local",
  "/package.json",
  "/package-lock.json",
  "/next.config.ts",
  "/tsconfig.json",
  "/src/app/page.tsx",
  "/node_modules/",
  "/out/index.html",
  "/hostinger-public-html.zip",
  "/citico-aviation-hostinger-deployment.zip",
  "/citico-aviation-website.zip",
  "/citico-aviation-website.tar.gz",
  "/README-HOSTINGER.md",
  "/DEPLOYMENT-REPORT.md",
  "/source/",
  "/source/package.json",
  "/source/src/lib/content.ts",
];

const EXPECTED_TYPE = {
  ".css": /text\/css/i,
  ".js": /javascript/i,
  ".mjs": /javascript/i,
  ".json": /application\/json/i,
  ".woff2": /font\/woff2|application\/font-woff2|application\/octet-stream/i,
  ".woff": /font\/woff|application\/font-woff|application\/octet-stream/i,
  ".webp": /image\/webp/i,
  ".avif": /image\/avif/i,
  ".png": /image\/png/i,
  ".jpg": /image\/jpe?g/i,
  ".jpeg": /image\/jpe?g/i,
  ".svg": /image\/svg\+xml/i,
  ".ico": /image\/(x-icon|vnd\.microsoft\.icon)/i,
  ".xml": /(application|text)\/xml/i,
  ".txt": /text\/plain/i,
  ".html": /text\/html/i,
  ".webmanifest": /application\/(manifest\+json|json)/i,
};

/* Magic numbers for the sampled byte-level check. A host that returns 200 with
   an HTML error body (or an empty file) still fails here. */
const MAGIC = {
  ".webp": (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP",
  ".png": (b) => b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])),
  ".jpg": (b) => b.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
  ".jpeg": (b) => b.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
  ".woff2": (b) => b.subarray(0, 4).toString("latin1") === "wOF2",
  ".woff": (b) => b.subarray(0, 4).toString("latin1") === "wOFF",
  ".ico": (b) => b.subarray(0, 4).equals(Buffer.from([0x00, 0x00, 0x01, 0x00])),
  ".svg": (b) => b.toString("utf8", 0, 400).toLowerCase().includes("<svg"),
  ".css": (b) => b.length > 0 && !b.toString("utf8", 0, 200).toLowerCase().includes("<html"),
  ".js": (b) => b.length > 0 && !b.toString("utf8", 0, 200).toLowerCase().includes("<html"),
};

/* ── result collection ────────────────────────────────────── */

const results = [];
let currentGroup = null;

const group = (name) => {
  currentGroup = name;
  results.push({ kind: "group", group: name });
};
const record = (level, name, detail = "") =>
  results.push({ kind: "check", group: currentGroup, level, name, detail });

const pass = (name, detail) => record("pass", name, detail);
const fail = (name, detail) => record("fail", name, detail);
const warn = (name, detail) => record("warn", name, detail);
const info = (name, detail) => record("info", name, detail);

/* A single assertion: `ok` decides pass vs the supplied fallback level. */
function expect(name, ok, okDetail, badDetail, badLevel = "fail") {
  if (ok) pass(name, okDetail);
  else record(badLevel, name, badDetail);
  return ok;
}

/* ── HTTP primitives ──────────────────────────────────────── */

/**
 * One raw request. Returns { status, headers, location, body, bytes, error }.
 * Headers are lower-cased by node. `stopAfterHeaders` aborts the body as soon as
 * headers arrive — used for the asset sweep so we never download 12 MB of images
 * just to read a Content-Type.
 */
function rawRequest(
  urlStr,
  {
    method = "GET",
    headers = {},
    decode = true,
    stopAfterHeaders = false,
    maxBytes = 4 * 1024 * 1024,
    timeout = TIMEOUT_MS,
  } = {},
) {
  return new Promise((resolve) => {
    let u;
    try {
      u = new URL(urlStr);
    } catch {
      return resolve({ error: "invalid-url" });
    }
    const mod = u.protocol === "https:" ? https : http;
    const req = mod.request(
      u,
      {
        method,
        headers: { "user-agent": UA, "accept-encoding": "identity", ...headers },
        timeout,
      },
      (res) => {
        const responseHeaders = res.headers;
        const encoding = String(responseHeaders["content-encoding"] || "").toLowerCase();

        const settle = (body, extra = {}) =>
          resolve({
            status: res.statusCode,
            headers: responseHeaders,
            location: responseHeaders.location,
            encoding,
            body,
            bytes: body ? body.length : 0,
            ...extra,
          });

        if (stopAfterHeaders) {
          res.destroy();
          return settle(null, { abortedBody: true });
        }

        let stream = res;
        if (decode) {
          if (encoding.includes("br")) stream = res.pipe(createBrotliDecompress());
          else if (encoding.includes("gzip")) stream = res.pipe(createGunzip());
          else if (encoding.includes("deflate")) stream = res.pipe(createInflate());
        }
        stream.on("error", () => settle(Buffer.alloc(0), { error: "body-decode" }));

        const chunks = [];
        let size = 0;
        stream.on("data", (c) => {
          size += c.length;
          if (size <= maxBytes) chunks.push(c);
        });
        stream.on("end", () => settle(Buffer.concat(chunks), { totalBytes: size }));
      },
    );
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", (e) => resolve({ error: e.code || e.name || e.message }));
    req.end();
  });
}

/** Follow redirects manually so each hop is observable. */
async function followChain(urlStr, { max = 6, headers = {}, decode = true } = {}) {
  const chain = [];
  let current = urlStr;
  for (let i = 0; i <= max; i++) {
    const res = await rawRequest(current, { headers, decode });
    chain.push({ url: current, status: res.status, location: res.location, res });
    if (!res.status || res.status < 300 || res.status >= 400 || !res.location) return chain;
    current = new URL(res.location, current).href;
  }
  return chain;
}

/** Run tasks with bounded concurrency, preserving order. */
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}

/* ── HTML helpers ─────────────────────────────────────────── */

/* Returns the first capture group, or the whole match when the pattern has no
   group (the <html …> tag below is matched whole, for instance). */
const attr = (html, re) => {
  const m = html.match(re);
  return m ? (m[1] ?? m[0]).trim() : null;
};

const extractAssets = (html, pageUrl) => {
  const found = new Set();
  const base = new URL(pageUrl);
  const push = (raw) => {
    if (!raw) return;
    let s = raw.trim();
    if (!s || /^(data:|blob:|mailto:|tel:|javascript:|#)/i.test(s)) return;
    if (s.startsWith("//")) s = base.protocol + s;
    let u;
    try {
      u = new URL(s, base);
    } catch {
      return;
    }
    if (u.origin !== base.origin) return; // third-party runs on someone else's uptime
    u.hash = "";
    found.add(u.href);
  };

  for (const m of html.matchAll(/(?:src|href)\s*=\s*"([^"]+)"/g)) push(m[1]);
  for (const m of html.matchAll(/(?:src|href)\s*=\s*'([^']+)'/g)) push(m[1]);
  for (const m of html.matchAll(/(?:srcset|imagesrcset)\s*=\s*"([^"]+)"/g))
    for (const part of m[1].split(",")) push(part.trim().split(/\s+/)[0]);
  for (const m of html.matchAll(/(?:srcset|imagesrcset)\s*=\s*'([^']+)'/g))
    for (const part of m[1].split(",")) push(part.trim().split(/\s+/)[0]);

  return [...found];
};

/* Scans url(...) with a hand-rolled walk rather than a regex, because the CSS
   contains data-URI SVGs whose *contents* include a nested url(%23n) (an SVG
   filter reference). A regex happily matches that inner call and reports a
   phantom /_next/static/chunks/%23n 404. Consuming each url() to its real close
   paren/quote and resuming after it makes the nested case unreachable. */
const extractCssUrls = (css, cssUrl) => {
  const found = new Set();
  const base = new URL(cssUrl);

  const push = (raw) => {
    const s = raw.trim().replace(/^["']|["']$/g, "");
    if (!s || /^(data:|blob:|#)/i.test(s)) return;
    let u;
    try {
      u = new URL(s, base);
    } catch {
      return;
    }
    if (u.origin !== base.origin) return;
    if (!u.pathname || u.pathname === "/") return;
    u.hash = "";
    found.add(u.href);
  };

  const re = /url\(/gi;
  let m;
  while ((m = re.exec(css))) {
    let i = m.index + m[0].length;
    while (i < css.length && /\s/.test(css[i])) i++;
    const quote = css[i];
    let value;
    let end;
    if (quote === '"' || quote === "'") {
      const close = css.indexOf(quote, i + 1);
      if (close === -1) break;
      value = css.slice(i + 1, close);
      end = close + 1;
    } else {
      const close = css.indexOf(")", i);
      if (close === -1) break;
      value = css.slice(i, close);
      end = close;
    }
    re.lastIndex = end; // never inspect the inside of what we just consumed
    push(value);
  }
  return [...found];
};

const extOf = (href) => {
  const p = new URL(href).pathname.toLowerCase();
  const i = p.lastIndexOf(".");
  const slash = p.lastIndexOf("/");
  return i > slash ? p.slice(i) : "";
};

const isHtmlLike = (contentType) => /text\/html|application\/xhtml/i.test(contentType || "");
const hasArabic = (s) => /[\u0600-\u06FF]/.test(s || "");

/* ── shared state gathered as the run proceeds ─────────────── */

const state = {
  baseUrl: "",
  baseHost: "",
  home: null,
  homeHtml: "",
  arabic: null,
  pages: [],
  /* Every stylesheet we have read, kept with the URL it was served from: CSS
     url() references are relative to the *stylesheet*, not the page, and
     resolving them against the site root silently points at the wrong path. */
  cssSources: [],
  sitemapRoutes: [],
  sitemapSameHost: 0,
  preferredHost: null,
};

/* ── checks ───────────────────────────────────────────────── */

async function checkReachability() {
  group("Reachability");

  const res = await rawRequest(state.baseUrl, { decode: true, maxBytes: 2 * 1024 * 1024 });
  if (res.error || !res.status) {
    fail(
      `base URL responds`,
      `${state.baseUrl} → ${res.error || "no response"}. ` +
        `DNS may not point here yet, the site may not be uploaded, or the domain differs.`,
    );
    return false;
  }

  const isHttps = state.baseUrl.startsWith("https:");
  expect(
    "base URL returns 200",
    res.status === 200,
    `HTTP ${res.status}`,
    `HTTP ${res.status} — expected 200. If this is 403/404 the upload landed in the wrong folder.`,
  );

  if (isHttps) pass("TLS handshake + certificate accepted", state.baseHost);

  info("server", `${res.headers.server || "unknown"}${res.headers["x-powered-by"] ? ` · ${res.headers["x-powered-by"]}` : ""}`);
  if (res.headers["x-litespeed-cache"]) info("LiteSpeed cache", String(res.headers["x-litespeed-cache"]));

  if (isHtmlLike(res.headers["content-type"])) {
    state.home = res;
    state.homeHtml = res.body ? res.body.toString("utf8") : "";
  } else {
    fail("home page is HTML", `Content-Type is ${res.headers["content-type"] || "absent"}`);
  }

  /* Uploaded-the-wrong-thing guard. Probing the bare /_next/ directory is not a
     valid test — Options -Indexes and directory-index behaviour both make a
     directory itself 403/404 even when its contents are fine. Ask instead for a
     fingerprinted build asset the home page actually references. */
  const buildAssets = extractAssets(state.homeHtml, state.baseUrl).filter((u) =>
    u.includes("/_next/static/"),
  );
  const buildAsset = buildAssets.find((u) => extOf(u) === ".js") || buildAssets[0];
  if (buildAsset) {
    const asset = await rawRequest(buildAsset, { stopAfterHeaders: true });
    expect(
      "build output is present (/ _next/static)",
      asset.status === 200,
      `HTTP 200 · ${new URL(buildAsset).pathname}`,
      `HTTP ${asset.status || asset.error} for ${new URL(buildAsset).pathname} — the built files were not uploaded. ` +
        `Extracting the archive into a subfolder instead of public_html produces exactly this.`,
    );
  } else {
    fail(
      "build output is present (/ _next/static)",
      `the home page references no /_next/static/ asset — either the export is wrong or a stale page is being served`,
    );
  }

  return true;
}

async function checkRedirects() {
  group("Host & transport");

  if (state.baseUrl.startsWith("https:")) {
    const httpUrl = "http://" + state.baseHost + "/";
    const chain = await followChain(httpUrl, { max: 1 });
    const first = chain[0];
    const toHttps =
      first.status >= 300 &&
      first.status < 400 &&
      first.location &&
      first.location.startsWith("https:");
    if (toHttps) {
      pass("http → https redirect", `${first.status} → ${first.location}`);
    } else {
      warn(
        "http → https redirect",
        `${httpUrl} → HTTP ${first.status || first.error} (no redirect). ` +
          `Expected until you uncomment block (a) in public_html/.htaccess — enable it once SSL shows Active.`,
      );
    }
  }

  /* Preferred host: the site's own canonical tag is authoritative. */
  if (state.homeHtml) {
    const canonical = attr(state.homeHtml, /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i);
    if (canonical) {
      try {
        state.preferredHost = new URL(canonical, state.baseUrl).host;
      } catch {
        /* ignore */
      }
    }
  }

  if (state.preferredHost && state.preferredHost !== state.baseHost) {
    warn(
      `canonical host matches the served host`,
      `canonical points at ${state.preferredHost} but this is ${state.baseHost}. ` +
        `Expected on a temporary/preview domain. On the real domain, enable block (b) in .htaccess so the site is served from ${state.preferredHost}.`,
    );

    /* If the canonical host is the real home it must serve, but when testing a
       temporary/preview domain it legitimately is not pointed yet — so this is a
       warning, not a failure. (When the served host *is* the canonical host this
       branch does not run at all.) */
    const canon = await rawRequest(`https://${state.preferredHost}/`, { stopAfterHeaders: true });
    expect(
      `canonical host resolves (${state.preferredHost})`,
      canon.status && canon.status < 400,
      `HTTP ${canon.status}`,
      `HTTP ${canon.status || canon.error}. Fine while you are testing another domain, but the live host must serve the site before search engines can follow sitemap.xml and the canonical tags.`,
      "warn",
    );
  } else if (state.preferredHost) {
    pass("canonical host matches the served host", state.preferredHost);
  }

  /* The other hostname variant, if DNS offers it. */
  if (state.preferredHost) {
    const bare = state.preferredHost.replace(/^www\./, "");
    const withWww = bare === state.preferredHost ? "www." + bare : bare;
    const other = await rawRequest(`https://${withWww}/`, { stopAfterHeaders: true });
    if (other.status && other.status >= 300 && other.status < 400) {
      info(`alternate host ${withWww}`, `HTTP ${other.status} → ${other.location}`);
    } else if (other.status) {
      info(`alternate host ${withWww}`, `HTTP ${other.status} (no redirect to ${state.preferredHost})`);
    } else {
      info(`alternate host ${withWww}`, `unreachable (${other.error})`);
    }
  }

  /* Directory-index behaviour: the whole export relies on this instead of
     rewrite rules. */
  const noSlash = new URL("/about", state.baseUrl).href;
  const chain = await followChain(noSlash, { max: 2 });
  const hop = chain[0];
  const landsAt = chain[chain.length - 1];
  if (hop.status >= 300 && hop.status < 400) {
    pass("/about redirects", `${hop.status} → ${hop.location}`);
  } else if (landsAt.status === 200) {
    info("/about serves directly", `HTTP 200 without a redirect (directory index handled the request)`);
  } else {
    warn(
      "/about resolves",
      `${noSlash} → HTTP ${landsAt.status || landsAt.error}. Missing trailing slash and no redirect means this URL is dead.`,
    );
  }

  /* Only one indexable URL per page once block (d) is on. */
  const withIndex = new URL("/about/index.html", state.baseUrl).href;
  const idx = await followChain(withIndex, { max: 2 });
  const idxLast = idx[idx.length - 1];
  if (idx[0].status >= 300 && idx[0].status < 400 && /\/about\/?$/.test(idxLast.url)) {
    pass("/about/index.html collapses to /about/", `${idx[0].status} → ${idxLast.url}`);
  } else if (idxLast.status === 200) {
    warn(
      "/about/index.html collapses to /about/",
      `HTTP 200 — the same page is indexable at two URLs. Enable block (d) in .htaccess (cosmetic for SEO, not a bug).`,
    );
  } else {
    info("/about/index.html", `HTTP ${idxLast.status || idxLast.error}`);
  }
}

async function checkRoutes() {
  group("Routing");

  /* Discover routes from the live sitemap so this stays correct as pages are
     added, then verify every one of them actually serves. */
  const sm = await rawRequest(new URL("/sitemap.xml", state.baseUrl).href, { decode: true });
  if (sm.status === 200) {
    const all = new Set();
    const sameHost = new Set();
    for (const m of sm.body.toString("utf8").matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
      try {
        const u = new URL(m[1]);
        /* Paths are checked even when the sitemap advertises a different host:
           on a preview domain that mismatch is expected, and the routing is
           still worth verifying. Host agreement is reported separately. */
        all.add(u.pathname);
        if (u.host === state.baseHost) sameHost.add(u.pathname);
      } catch {
        /* ignore */
      }
    }
    state.sitemapRoutes = [...all];
    state.sitemapSameHost = sameHost.size;
    pass(
      "sitemap.xml is readable",
      `${all.size} URLs (${sameHost.size} on ${state.baseHost}` +
        `${all.size > sameHost.size ? `, ${all.size - sameHost.size} on other hosts` : ""})`,
    );
  } else {
    fail("sitemap.xml is readable", `HTTP ${sm.status || sm.error} — expected 200`);
  }

  const core = [
    "/",
    "/about/",
    "/services/",
    "/logistics/",
    "/leadership/",
    "/safety/",
    "/fleet/",
    "/contact/",
    "/ar/",
    "/ar/about/",
    "/ar/services/",
    "/ar/logistics/",
    "/ar/leadership/",
    "/ar/safety/",
    "/ar/fleet/",
    "/ar/contact/",
  ];
  const routes = [...new Set([...core, ...state.sitemapRoutes])].slice(0, MAX_ROUTES);

  const probes = await mapLimit(routes, CONCURRENCY, async (p) => {
    const res = await rawRequest(new URL(p, state.baseUrl).href, { stopAfterHeaders: true });
    return { path: p, status: res.status, type: res.headers?.["content-type"], error: res.error };
  });

  const bad = probes.filter((p) => p.status !== 200);
  expect(
    `all ${routes.length} routes return 200`,
    bad.length === 0,
    `${routes.length}/${routes.length}`,
    bad
      .slice(0, 12)
      .map((p) => `${p.path} → ${p.status || p.error}`)
      .join(", ") + (bad.length > 12 ? ` (+${bad.length - 12} more)` : ""),
  );

  const notHtml = probes.filter((p) => p.status === 200 && p.type && !isHtmlLike(p.type));
  if (notHtml.length === 0 && bad.length === 0)
    pass("routes serve HTML", `text/html on every route`);
  else if (notHtml.length)
    fail(
      "routes serve HTML",
      notHtml
        .slice(0, 6)
        .map((p) => `${p.path} → ${p.type}`)
        .join(", "),
    );

  const arabic = probes.filter((p) => p.path.startsWith("/ar"));
  if (arabic.length && arabic.every((p) => p.status === 200))
    pass("Arabic tree serves every route", `${arabic.length} /ar/ URLs`);
}

async function check404() {
  group("404 contract");

  const probe = `/definitely-missing-${Math.random().toString(36).slice(2, 8)}`;
  for (const [label, path] of [
    ["missing path with slash", probe + "/"],
    ["missing path without slash", probe],
    ["missing path inside a real section", "/services/no-such-service/"],
  ]) {
    const res = await followChain(new URL(path, state.baseUrl).href, { max: 3 });
    const last = res[res.length - 1];
    const body = last.res.body ? last.res.body.toString("utf8") : "";
    const branded = body.includes(BRAND_404);

    if (last.status === 404 && branded) {
      pass(`${label} → branded 404`, `HTTP 404 · "${BRAND_404}"`);
    } else if (last.status === 404) {
      fail(
        `${label} → branded 404`,
        `HTTP 404 but the body is the host's own error page (no "${BRAND_404}"). ` +
          `ErrorDocument 404 /404.html is not taking effect — check .htaccess is at public_html/.htaccess and 404.html exists.`,
      );
    } else {
      fail(
        `${label} → branded 404`,
        `HTTP ${last.status || last.error} — expected 404. ` +
          `A 200 here means unknown URLs are being served some other page.`,
      );
    }
  }

  const arMiss = await followChain(new URL("/ar/definitely-missing/", state.baseUrl).href, { max: 3 });
  const arLast = arMiss[arMiss.length - 1];
  if (arLast.status === 404 && arLast.res.body?.toString("utf8").includes(BRAND_404)) {
    warn(
      "missing /ar/ path → branded 404",
      `HTTP 404 with the English page. A static host serves one 404.html for the whole site, so Arabic visitors see English here. Known limitation.`,
    );
  } else if (arLast.status === 404) {
    warn("missing /ar/ path → branded 404", `HTTP 404, host default page`);
  } else {
    fail("missing /ar/ path → branded 404", `HTTP ${arLast.status || arLast.error} — expected 404`);
  }
}

async function checkSensitivePaths() {
  group("Exposure");
  const leaked = [];
  const probes = await mapLimit(SENSITIVE_PATHS, CONCURRENCY, async (p) => {
    const res = await rawRequest(new URL(p, state.baseUrl).href, {
      stopAfterHeaders: false,
      maxBytes: 2048,
    });
    return { path: p, status: res.status, error: res.error, bytes: res.bytes };
  });

  for (const p of probes) {
    if (p.status === 200 && p.bytes > 0) leaked.push(p.path);
  }

  expect(
    "no source/config files are downloadable",
    leaked.length === 0,
    `${SENSITIVE_PATHS.length} paths checked, all denied or absent`,
    `${leaked.join(", ")} returned content. If /package.json, /src/ or /source/ is readable, the source tree was extracted into public_html as well as the built site.`,
  );

  const dirs = await mapLimit(["/img/", "/_next/", "/ar/"], CONCURRENCY, async (p) => {
    const res = await rawRequest(new URL(p, state.baseUrl).href, { maxBytes: 4096 });
    const body = res.body ? res.body.toString("utf8") : "";
    return { path: p, status: res.status, listing: /Index of \/|Parent Directory/i.test(body) };
  });

  const listings = dirs.filter((d) => d.listing);
  expect(
    "directory listings are disabled",
    listings.length === 0,
    `Options -Indexes in effect`,
    `${listings.map((d) => d.path).join(", ")} renders a file listing. The mod_autoindex block in .htaccess is not active.`,
  );
}

async function checkLanguages() {
  group("Language trees");

  const en = await rawRequest(state.baseUrl, { decode: true });
  const ar = await rawRequest(new URL("/ar/", state.baseUrl).href, { decode: true });

  if (en.status !== 200) fail("/ serves 200", `HTTP ${en.status || en.error}`);
  if (ar.status !== 200) {
    fail("/ar/ serves 200", `HTTP ${ar.status || ar.error}`);
    return;
  }

  const enHtml = en.body ? en.body.toString("utf8") : "";
  const arHtml = ar.body.toString("utf8");
  state.pages.push({ url: state.baseUrl, html: enHtml, res: en });
  state.pages.push({ url: new URL("/ar/", state.baseUrl).href, html: arHtml, res: ar });

  const htmlTag = (h) => attr(h, /<html[^>]*>/i) || "";
  const enTag = htmlTag(enHtml);
  const arTag = htmlTag(arHtml);

  expect(
    "English page is lang=en dir=ltr",
    /lang="en"/.test(enTag) && !/dir="rtl"/.test(enTag),
    enTag,
    `<html> is ${enTag || "absent"}`,
  );
  expect(
    "Arabic page is lang=ar dir=rtl",
    /lang="ar"/.test(arTag) && /dir="rtl"/.test(arTag),
    arTag,
    `<html> is ${arTag || "absent"}`,
  );
  expect(
    "Arabic page contains Arabic text",
    hasArabic(arHtml),
    `Arabic characters present`,
    `no Arabic characters in the rendered HTML — the Arabic dictionary may not have been bundled.`,
  );
  expect(
    "the two trees differ",
    enHtml !== arHtml,
    `distinct documents`,
    `/ and /ar/ are byte-identical, so one language tree is shadowing the other.`,
  );

  /* hreflang reciprocity: each language must point at the other, and at itself. */
  const hreflangs = (h) =>
    [...h.matchAll(/<link[^>]+hreflang="([^"]+)"[^>]*href="([^"]+)"/gi)].map((m) => ({
      lang: m[1].toLowerCase(),
      href: m[2],
    }));
  const enAlt = hreflangs(enHtml);
  const arAlt = hreflangs(arHtml);
  const langsOf = (a) => a.map((x) => x.lang).sort().join(",");
  expect(
    "hreflang alternates are reciprocal",
    enAlt.length > 0 && langsOf(enAlt) === langsOf(arAlt) && enAlt.some((x) => x.lang === "x-default"),
    `both pages declare: ${langsOf(enAlt)}`,
    `English declares [${langsOf(enAlt)}], Arabic declares [${langsOf(arAlt)}]`,
    "warn",
  );

  /* A canonical that points at a host that does not serve the page is the
     single most damaging SEO mistake here. */
  for (const [label, html] of [
    ["English", enHtml],
    ["Arabic", arHtml],
  ]) {
    const canonical = attr(html, /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i);
    if (!canonical) {
      warn(`${label} canonical tag`, "absent");
      continue;
    }
    const u = new URL(canonical, state.baseUrl);
    if (u.host === state.baseHost) pass(`${label} canonical tag`, canonical);
    else
      warn(
        `${label} canonical tag`,
        `${canonical} — points at ${u.host}, not the serving host ${state.baseHost}. ` +
          `Correct on a preview domain; on the live domain enable block (b) so the host matches.`,
      );
  }

  /* The Arabic typeface must actually be in the shipped CSS. */
  const arCss = await collectCss(arHtml, new URL("/ar/", state.baseUrl).href);
  if (arCss.hrefs.length === 0) {
    warn("Arabic typeface is shipped", `no stylesheet reachable from /ar/`);
  } else if (/cairo/i.test(arCss.text)) {
    pass("Arabic typeface is shipped", `"Cairo" found in ${arCss.files.length} stylesheet(s)`);
  } else {
    warn(
      "Arabic typeface is shipped",
      `"Cairo" not found in the CSS linked from /ar/ — the Arabic tree may fall back to a system font`,
    );
  }
}

async function collectCss(html, pageUrl) {
  const hrefs = extractAssets(html, pageUrl).filter((u) => extOf(u) === ".css");
  const texts = [];
  const files = [];
  await mapLimit(hrefs, CONCURRENCY, async (href) => {
    const res = await rawRequest(href, { decode: true, maxBytes: 2 * 1024 * 1024 });
    if (res.status === 200 && res.body) {
      texts.push(res.body.toString("utf8"));
      files.push(href);
    }
  });
  const text = texts.join("\n");
  for (let i = 0; i < texts.length; i++) state.cssSources.push({ url: files[i], text: texts[i] });
  return { text, files, hrefs };
}

async function checkAssets() {
  group("Referenced assets");

  if (NO_CRAWL) {
    info("asset sweep", "skipped (--no-crawl)");
    return;
  }

  /* Seed pages: both home pages plus one English and one Arabic detail page, so
     the sweep covers the deep templates too. */
  const extraPaths = ["/about/", "/ar/about/", "/services/", "/ar/services/"];
  const detail = state.sitemapRoutes.filter((p) => /^\/services\/[^/]+\/$/.test(p)).slice(0, 1);
  const detailAr = state.sitemapRoutes.filter((p) => /^\/ar\/services\/[^/]+\/$/.test(p)).slice(0, 1);

  for (const p of [...extraPaths, ...detail, ...detailAr]) {
    const res = await rawRequest(new URL(p, state.baseUrl).href, { decode: true, maxBytes: 2 * 1024 * 1024 });
    if (res.status === 200 && res.body)
      state.pages.push({ url: new URL(p, state.baseUrl).href, html: res.body.toString("utf8"), res });
  }

  /* Every same-origin URL referenced by those pages, plus everything the
     stylesheets pull in (fonts, background images). */
  const assetSet = new Set();
  for (const page of state.pages)
    for (const a of extractAssets(page.html, page.url)) assetSet.add(a);

  const cssRefs = new Set();
  for (const page of state.pages)
    for (const a of extractAssets(page.html, page.url))
      if (extOf(a) === ".css") cssRefs.add(a);

  const cssResults = await mapLimit([...cssRefs], CONCURRENCY, async (href) => {
    const res = await rawRequest(href, { decode: true, maxBytes: 2 * 1024 * 1024 });
    return { href, res };
  });
  for (const { href, res } of cssResults) {
    if (res.status !== 200 || !res.body) continue;
    const css = res.body.toString("utf8");
    if (!state.cssSources.some((s) => s.url === href)) state.cssSources.push({ url: href, text: css });
    for (const u of extractCssUrls(css, href)) assetSet.add(u);
  }

  /* A /_next/image URL means the export still references the optimizer that
     shared hosting does not provide — those requests 404 silently. */
  const optimizerUrls = [...assetSet].filter((u) => u.includes("/_next/image"));
  expect(
    "no image-optimizer URLs in the shipped markup",
    optimizerUrls.length === 0,
    `none of ${assetSet.size} referenced URLs use /_next/image`,
    `${optimizerUrls.length} URL(s) go through /_next/image, which does not exist on shared hosting: ` +
      optimizerUrls.slice(0, 3).join(", "),
  );

  const assets = [...assetSet].slice(0, MAX_ASSETS);
  if (assetSet.size > MAX_ASSETS)
    info("asset sweep", `capped at ${MAX_ASSETS} of ${assetSet.size} URLs`);

  const checked = await mapLimit(assets, CONCURRENCY, async (href) => {
    const res = await rawRequest(href, { stopAfterHeaders: true });
    return { href, status: res.status, type: res.headers?.["content-type"] || "", error: res.error };
  });

  const missing = checked.filter((c) => c.status !== 200);
  expect(
    `${assets.length} referenced assets are all present`,
    missing.length === 0,
    `all 200`,
    missing
      .slice(0, 12)
      .map((c) => `${new URL(c.href).pathname} → ${c.status || c.error}`)
      .join(", ") + (missing.length > 12 ? ` (+${missing.length - 12} more)` : ""),
  );

  const wrongType = checked.filter((c) => {
    if (c.status !== 200) return false;
    const re = EXPECTED_TYPE[extOf(c.href)];
    return re && !re.test(c.type);
  });
  expect(
    "assets are served with correct MIME types",
    wrongType.length === 0,
    `${checked.length} checked`,
    wrongType
      .slice(0, 10)
      .map((c) => `${new URL(c.href).pathname} → ${c.type || "no Content-Type"}`)
      .join(", "),
    "warn",
  );

  const counts = {};
  for (const c of checked) {
    if (c.status !== 200) continue;
    const e = extOf(c.href) || "(none)";
    counts[e] = (counts[e] || 0) + 1;
  }
  info(
    "referenced URLs",
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([e, n]) => `${n}× ${e === "(none)" ? "internal page links" : e}`)
      .join(", "),
  );

  /* Byte-level spot check: a 200 with an empty or HTML body is a common
     failed-upload symptom that a header check alone would miss. Up to two
     files per type, so a single broken format cannot hide or dominate. */
  const samples = [];
  const perExt = new Map();
  for (const href of assets) {
    const e = extOf(href);
    if (!MAGIC[e]) continue;
    const n = perExt.get(e) || 0;
    if (n >= 2) continue;
    perExt.set(e, n + 1);
    samples.push(href);
    if (samples.length >= 18) break;
  }

  const byteChecked = await mapLimit(samples, CONCURRENCY, async (href) => {
    const res = await rawRequest(href, { decode: true, maxBytes: 2 * 1024 * 1024 });
    const ok = res.status === 200 && res.body && res.body.length > 0 && MAGIC[extOf(href)](res.body);
    return { href, ok, status: res.status, bytes: res.totalBytes ?? res.bytes };
  });
  const badBytes = byteChecked.filter((b) => !b.ok);
  expect(
    "sampled asset bytes are valid files",
    badBytes.length === 0,
    `${byteChecked.length} files verified by magic number`,
    badBytes.map((b) => `${new URL(b.href).pathname} (HTTP ${b.status}, ${b.bytes} B)`).join(", "),
  );
}

async function checkCompression() {
  group("Compression");

  const targets = [];
  const htmlTarget = { label: "HTML", url: state.baseUrl };
  targets.push(htmlTarget);

  const cssHref = state.pages.length
    ? extractAssets(state.pages[0].html, state.pages[0].url).find((u) => extOf(u) === ".css")
    : null;
  if (cssHref) targets.push({ label: "CSS", url: cssHref });

  const jsHref = state.pages.length
    ? extractAssets(state.pages[0].html, state.pages[0].url).find((u) => extOf(u) === ".js")
    : null;
  if (jsHref) targets.push({ label: "JS", url: jsHref });

  for (const t of targets) {
    const res = await rawRequest(t.url, {
      headers: { "accept-encoding": "br, gzip" },
      decode: false,
      stopAfterHeaders: true,
    });
    const enc = String(res.headers?.["content-encoding"] || "").toLowerCase();
    if (enc)
      pass(`${t.label} is compressed`, `${enc}${res.headers.vary ? ` · Vary: ${res.headers.vary}` : ""}`);
    else
      warn(
        `${t.label} is compressed`,
        `no Content-Encoding with "Accept-Encoding: br, gzip". ` +
          `The mod_deflate/mod_brotli blocks in .htaccess may be inactive on this plan.`,
      );
  }
}

async function checkCaching() {
  group("Caching");

  const find = (ext) =>
    state.pages
      .flatMap((p) => extractAssets(p.html, p.url))
      .find((u) => extOf(u) === ext && (ext !== ".js" || u.includes("/_next/")));

  const cases = [
    {
      label: "fingerprinted JS (/_next/static)",
      url: find(".js"),
      want: /max-age=(\d+)/i,
      test: (cc) => /immutable/i.test(cc) && Number(cc.match(/max-age=(\d+)/i)?.[1] || 0) >= 31536000,
      hint: `expected max-age=31536000, immutable`,
    },
    {
      label: "images",
      url: find(".webp") || find(".png") || find(".jpg"),
      test: (cc) => Number(cc.match(/max-age=(\d+)/i)?.[1] || 0) >= 86400,
      hint: `expected a long max-age`,
    },
    {
      label: "HTML",
      url: state.baseUrl,
      test: (cc) => /no-cache|no-store|must-revalidate|max-age=0/i.test(cc),
      hint: `expected must-revalidate so new uploads appear immediately`,
    },
  ];

  for (const c of cases) {
    if (!c.url) {
      info(`${c.label} cache headers`, "no matching asset found to test");
      continue;
    }
    const res = await rawRequest(c.url, { stopAfterHeaders: true });
    const cc = String(res.headers?.["cache-control"] || "");
    if (!cc) warn(`${c.label} cache headers`, `no Cache-Control (${c.hint})`);
    else if (c.test(cc)) pass(`${c.label} cache headers`, cc);
    else warn(`${c.label} cache headers`, `${cc} — ${c.hint}`);
  }
}

async function checkSecurityHeaders() {
  group("Security headers");

  const res = await rawRequest(state.baseUrl, { decode: true, maxBytes: 1024 });
  const h = res.headers || {};
  const wanted = [
    ["X-Content-Type-Options", "nosniff"],
    ["Referrer-Policy", null],
    ["X-Frame-Options", null],
    ["Permissions-Policy", null],
  ];
  const missing = [];
  for (const [name, want] of wanted) {
    const v = h[name.toLowerCase()];
    if (!v) missing.push(name);
    else if (want && !v.includes(want)) missing.push(`${name} (${v})`);
  }

  expect(
    "hardening headers are present",
    missing.length === 0,
    wanted.map(([n]) => n).join(", "),
    `missing: ${missing.join(", ")}. The mod_headers block in .htaccess is inactive on this plan — harmless, but worth knowing.`,
    "warn",
  );
}

async function checkSeoFiles() {
  group("Crawler files");

  const robots = await rawRequest(new URL("/robots.txt", state.baseUrl).href, { decode: true });
  if (robots.status !== 200) {
    fail("robots.txt is reachable", `HTTP ${robots.status || robots.error}`);
  } else {
    const txt = robots.body.toString("utf8");
    pass("robots.txt is reachable", `${robots.bytes} bytes`);
    expect(
      "robots.txt allows crawling",
      !/^\s*Disallow:\s*\/\s*$/im.test(txt),
      `no site-wide Disallow`,
      `robots.txt blocks the whole site with "Disallow: /"`,
    );
    const sitemapLine = txt.match(/^\s*Sitemap:\s*(\S+)/im);
    if (!sitemapLine) {
      warn("robots.txt advertises the sitemap", "no Sitemap: line");
    } else {
      const su = new URL(sitemapLine[1]);
      expect(
        "robots.txt advertises the sitemap",
        su.host === state.baseHost || su.host === state.preferredHost,
        sitemapLine[1],
        `${sitemapLine[1]} points at a different host than the site is served from`,
        "warn",
      );
    }
  }

  const sm = await rawRequest(new URL("/sitemap.xml", state.baseUrl).href, { decode: true });
  if (sm.status !== 200) {
    fail("sitemap.xml is valid XML", `HTTP ${sm.status || sm.error}`);
    return;
  }
  const xml = sm.body.toString("utf8");
  const locCount = (xml.match(/<loc>/g) || []).length;
  expect(
    "sitemap.xml is valid XML",
    /<urlset[\s>]/.test(xml) && /<\/urlset>/.test(xml),
    `${locCount} <loc> entries, ${state.sitemapSameHost} of them on the serving host ${state.baseHost}`,
    `missing a <urlset> root element`,
  );

  const hostCounts = {};
  for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
    try {
      const h = new URL(m[1]).host;
      hostCounts[h] = (hostCounts[h] || 0) + 1;
    } catch {
      /* ignore */
    }
  }
  info(
    "sitemap hosts",
    Object.entries(hostCounts)
      .map(([h, n]) => `${h} (${n})`)
      .join(", ") || "none",
  );

  const totalLocs = [...xml.matchAll(/<loc>/g)].length;
  if (totalLocs < 20)
    warn("sitemap covers the site", `only ${totalLocs} URLs — expected the full English + Arabic tree`);
  else pass("sitemap covers the site", `${totalLocs} URLs`);
}

async function checkFonts() {
  group("Typography");

  /* Faces and their url()s must be read per stylesheet, resolving file URLs
     against the stylesheet that declares them. */
  const faces = [];
  const families = new Set();
  const fileUrls = new Set();

  for (const src of state.cssSources) {
    for (const m of src.text.matchAll(/@font-face\s*\{[^}]*\}/gi)) {
      faces.push(m[0]);
      const fam = m[0].match(/font-family:\s*["']?([^;"'}]+)/i);
      if (fam) families.add(fam[1].trim());
      for (const u of extractCssUrls(m[0], src.url)) fileUrls.add(u);
    }
  }

  if (faces.length === 0) {
    warn(
      "self-hosted @font-face rules",
      state.cssSources.length
        ? `none found in ${state.cssSources.length} stylesheet(s)`
        : "no stylesheet was reachable",
    );
    return;
  }

  const named = families.size
    ? [...families].filter((f) => f.trim()).slice(0, 6).join(", ")
    : "(unnamed)";
  pass("self-hosted @font-face rules", `${faces.length} faces: ${named}`);
  if (fileUrls.size === 0) {
    warn("font files are reachable", "no url() inside any @font-face");
    return;
  }
  const list = [...fileUrls].slice(0, 40);
  const checked = await mapLimit(list, CONCURRENCY, async (href) => {
    const res = await rawRequest(href, { stopAfterHeaders: true });
    return { href, status: res.status, error: res.error };
  });
  const missing = checked.filter((c) => c.status !== 200);
  expect(
    "font files are reachable",
    missing.length === 0,
    `${list.length} font files`,
    missing.map((c) => `${new URL(c.href).pathname} → ${c.status || c.error}`).join(", "),
  );
}

/* ── reporting ────────────────────────────────────────────── */

const ICON = { pass: " PASS ", fail: " FAIL ", warn: " WARN ", info: "  ·   " };

function printReport(startedAt, baseUrl) {
  const groups = [];
  let current = null;
  for (const r of results) {
    if (r.kind === "group") {
      current = { name: r.group, checks: [] };
      groups.push(current);
    } else if (current) current.checks.push(r);
  }

  console.log(`\nCITICO Aviation — live deployment verification`);
  console.log(`base   ${baseUrl}`);
  console.log(`started ${startedAt.toISOString()}`);
  console.log("─".repeat(72));

  for (const g of groups) {
    console.log(`\n■ ${g.name}`);
    for (const c of g.checks) {
      const head = `${ICON[c.level]} ${c.name}`;
      console.log(`  ${head}`);
      if (c.detail) console.log(`         ${c.detail}`);
    }
  }

  const flat = results.filter((r) => r.kind === "check");
  const level = (l) => flat.filter((r) => r.level === l);
  const fails = level("fail");
  const warns = level("warn");

  console.log("\n" + "─".repeat(72));
  console.log(
    `${flat.length} checks · ${level("pass").length} passed · ${fails.length} failed · ${warns.length} warnings`,
  );

  if (fails.length) {
    console.log("\nFailures:");
    for (const f of fails) console.log(`  ✗ ${f.name}\n      ${f.detail}`);
  }
  if (warns.length) {
    console.log("\nWarnings (expected until the .htaccess blocks in section 6 are enabled):");
    for (const w of warns) console.log(`  ! ${w.name}\n      ${w.detail}`);
  }
  if (!fails.length && !warns.length) console.log("\nEverything checked out.");

  console.log(
    `\nVerdict: ${fails.length ? "NOT READY — fix the failures above" : warns.length && STRICT ? "NOT READY (--strict: warnings are fatal)" : "DEPLOYED AND WORKING"}`,
  );
}

/* ── main ─────────────────────────────────────────────────── */

async function main() {
  if (!positional[0]) {
    console.error(
      "usage: node scripts/verify-live.mjs <https://your-domain> [--strict] [--json] [--no-crawl]",
    );
    process.exit(2);
  }

  let base;
  try {
    base = new URL(positional[0]);
  } catch {
    console.error(`not a valid URL: ${positional[0]}`);
    process.exit(2);
  }
  if (!/^https?:$/.test(base.protocol)) {
    console.error(`only http/https are supported, got ${base.protocol}`);
    process.exit(2);
  }
  base.pathname = "/";
  base.search = "";
  base.hash = "";
  state.baseUrl = base.origin + "/";
  state.baseHost = base.host;

  const startedAt = new Date();

  const reachable = await checkReachability();
  if (!reachable) {
    if (AS_JSON) {
      console.log(JSON.stringify({ base: state.baseUrl, startedAt, results }, null, 2));
    } else {
      printReport(startedAt, state.baseUrl);
    }
    process.exit(1);
  }

  await checkRedirects();
  await checkRoutes();
  await check404();
  await checkSensitivePaths();
  await checkLanguages();
  await checkAssets();
  await checkCompression();
  await checkCaching();
  await checkSecurityHeaders();
  await checkSeoFiles();
  await checkFonts();

  if (AS_JSON) {
    const flat = results.filter((r) => r.kind === "check");
    console.log(
      JSON.stringify(
        {
          base: state.baseUrl,
          startedAt,
          finishedAt: new Date(),
          summary: {
            total: flat.length,
            passed: flat.filter((r) => r.level === "pass").length,
            failed: flat.filter((r) => r.level === "fail").length,
            warnings: flat.filter((r) => r.level === "warn").length,
          },
          results: flat,
        },
        null,
        2,
      ),
    );
  } else {
    printReport(startedAt, state.baseUrl);
  }

  const anyFail = results.some((r) => r.kind === "check" && r.level === "fail");
  const anyWarn = results.some((r) => r.kind === "check" && r.level === "warn");
  process.exit(anyFail || (STRICT && anyWarn) ? 1 : 0);
}

main().catch((err) => {
  console.error(`verifier crashed: ${err.stack || err.message}`);
  process.exit(1);
});
