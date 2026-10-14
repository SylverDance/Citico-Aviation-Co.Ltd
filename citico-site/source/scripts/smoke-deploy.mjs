#!/usr/bin/env node
/* ──────────────────────────────────────────────────────────────
   smoke-deploy.mjs — "did my upload actually land, and is it working?"

   Uploading citico-aviation-hostinger-deployment.zip to public_html is a manual
   step, and the failure it most often produces is silent: the OLD build keeps
   serving.
   Every check in verify-live.mjs passes against the old build, so running the
   verifier straight after a deploy proves nothing about the deploy — it
   cheerfully certifies the site you were already running.

   This script closes that gap. It:

     1. fingerprints the local build (out/index.html) by the set of
        content-hashed /_next/static/... files that page references,
     2. polls the live root until the live HTML references that same set —
        i.e. until the build on your disk is genuinely the build being served,
     3. only then hands over to verify-live.mjs and propagates its exit code.

   Fingerprint choice: Next.js names chunks by content hash, so the set changes
   exactly when the shipped bytes change, and two builds with identical output
   share it. That makes "no change to detect" mean "already live" instead of
   hanging until the timeout, which is what a per-build marker (Next's random
   buildId) would do on a no-change rebuild.

   The target URL comes from the single origin in src/lib/site.ts, so the smoke
   test follows the same one-line domain edit as the build. Override it with
   --url or SMOKE_URL to smoke a staging host instead.

   Usage:
     npm run verify:deploy                     # wait up to 10 min, then verify
     npm run verify:deploy -- --no-wait        # verify immediately (monitoring)
     npm run verify:deploy -- --timeout 1800   # slower uploads
     node scripts/smoke-deploy.mjs --url https://staging.example --strict

   Flags:
     --url <origin>    target origin (default: SITE_ORIGIN from src/lib/site.ts)
     --timeout <sec>   how long to wait for the build to appear (default 600,
                       0 waits indefinitely)
     --interval <sec>  poll interval (default 15)
     --no-wait         skip the wait and verify whatever is live right now
     --strict          passed through to verify-live.mjs (warnings are fatal)
     --no-crawl        passed through to verify-live.mjs (routing checks only)

   Exit status: 0 deployed and verified · 1 verification failed
                2 usage/local-build error · 3 the build never appeared
   ────────────────────────────────────────────────────────────── */

import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { createBrotliDecompress, createGunzip, createInflate } from "node:zlib";

const root = process.cwd();
const argv = process.argv.slice(2);

/* ── arguments ────────────────────────────────────────────── */

const VALUE_FLAGS = new Set(["--url", "--timeout", "--interval"]);

function flagValue(name) {
  const i = argv.indexOf(name);
  if (i === -1) return null;
  const v = argv[i + 1];
  return v && !v.startsWith("--") ? v : null;
}

const positional = [];
for (let i = 0; i < argv.length; i++) {
  if (VALUE_FLAGS.has(argv[i])) {
    i++; // its value is not a positional
    continue;
  }
  if (!argv[i].startsWith("--")) positional.push(argv[i]);
}

const NO_WAIT = argv.includes("--no-wait");
/* Only flags verify-live.mjs understands; anything else stays here. */
const PASSTHROUGH = ["--strict", "--no-crawl"].filter((f) => argv.includes(f));

const timeoutSec = Number(flagValue("--timeout") ?? process.env.SMOKE_TIMEOUT ?? 600);
const intervalSec = Number(flagValue("--interval") ?? process.env.SMOKE_INTERVAL ?? 15);

/* Exit status is this script's whole point, so a closed stdout must not change
   it: piping into `head` raises EPIPE on the next write, and node's default is
   to abort with exit 1 — which reads as "verification failed" when nothing was
   actually verified. Drop the write and keep running. */
process.stdout.on("error", (err) => {
  if (err.code !== "EPIPE") throw err;
});

const log = (msg = "") => console.log(msg);
const die = (msg, code = 2) => {
  console.error(`\n✖ ${msg}`);
  process.exit(code);
};

/* ── target origin ────────────────────────────────────────── */

/* The domain lives in exactly one place. Reading it back out of the
   TypeScript source keeps that promise for the smoke test too, instead of
   restating the domain here and letting the two drift. */
function originFromSource() {
  const file = path.join(root, "src", "lib", "site.ts");
  if (!fs.existsSync(file)) return null;
  const match = fs.readFileSync(file, "utf8").match(
    /export\s+const\s+SITE_ORIGIN\s*=\s*["']([^"']+)["']/,
  );
  return match ? match[1] : null;
}

const requested =
  flagValue("--url") ?? process.env.SMOKE_URL ?? positional[0] ?? originFromSource();

if (!requested) {
  die(
    "no target origin. Pass --url https://host, set SMOKE_URL, or declare\n  SITE_ORIGIN in src/lib/site.ts.",
  );
}

let target;
try {
  target = new URL(requested);
} catch {
  die(`not a valid URL: ${requested}`);
}
if (!/^https?:$/.test(target.protocol)) die(`only http/https are supported, got ${target.protocol}`);
const origin = target.origin;

/* ── local build fingerprint ──────────────────────────────── */

/* A local build is only needed to know *what* to wait for. Under --no-wait the
   question is just "is the live site healthy?" — the monitoring case, which
   must work on a machine that has never run a build. */
const outIndexPath = path.join(root, "out", "index.html");
const haveLocalBuild = fs.existsSync(outIndexPath);

if (!haveLocalBuild && !NO_WAIT) {
  die("./out/index.html is missing — run `npm run build` first, or pass --no-wait to\n  smoke whatever is live right now.");
}

/* Content-hashed asset URLs referenced by the shipped home page. The pattern
   stops at a quote, a backslash and whitespace because Next also embeds these
   URLs inside the RSC script payload as escaped JSON strings, e.g.
   \"/_next/static/chunks/x.css\" — matching through to the quote would capture
   a trailing backslash and never equal the link tag's clean href. */
const refsOf = (html) =>
  [...new Set([...html.matchAll(/\/_next\/static\/[^"\\\s]+/g)].map((m) => m[0]))].sort();

const localRefs = haveLocalBuild ? refsOf(fs.readFileSync(outIndexPath, "utf8")) : [];

if (!NO_WAIT && localRefs.length === 0) {
  die("./out/index.html references no /_next/static/ files — that is not a finished\n  Next.js export. Delete ./out and rebuild.");
}

/* Next's random per-build id, read off the filesystem rather than the HTML.
   Reported for context only — see the header for why it is not the gate. */
function localBuildId() {
  const dir = path.join(root, "out", "_next", "static");
  if (!fs.existsSync(dir)) return null;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "chunks" || entry.name === "media") continue;
    if (fs.existsSync(path.join(dir, entry.name, "_buildManifest.js"))) return entry.name;
  }
  return null;
}

const buildId = localBuildId();

/* ── HTTP ─────────────────────────────────────────────────── */

const UA =
  "Mozilla/5.0 (compatible; citico-deploy-verifier/1.0; +https://www.citicoaviation.com)";

/* Raw request rather than fetch: no transparent caching layer between us and
   the host, and the DNS error code stays on `code` where it can be classified. */
function get(urlStr, { timeout = 15000, maxBytes = 2 * 1024 * 1024 } = {}) {
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
        method: "GET",
        headers: {
          "user-agent": UA,
          "accept-encoding": "br, gzip, deflate",
          /* Ask every hop not to hand us a cached copy — a CDN or LiteSpeed
             cache still serving the previous index.html is precisely the
             condition this script exists to see through. */
          "cache-control": "no-cache, no-store",
          pragma: "no-cache",
        },
        timeout,
      },
      (res) => {
        const encoding = String(res.headers["content-encoding"] || "").toLowerCase();
        let stream = res;
        if (encoding.includes("br")) stream = res.pipe(createBrotliDecompress());
        else if (encoding.includes("gzip")) stream = res.pipe(createGunzip());
        else if (encoding.includes("deflate")) stream = res.pipe(createInflate());
        stream.on("error", () =>
          resolve({ status: res.statusCode, headers: res.headers, error: "body-decode" }),
        );

        const chunks = [];
        let size = 0;
        stream.on("data", (c) => {
          size += c.length;
          if (size <= maxBytes) chunks.push(c);
        });
        stream.on("end", () =>
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks).toString("utf8"),
          }),
        );
      },
    );
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", (e) => resolve({ error: e.code || e.message }));
    req.end();
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const mmss = (ms) => {
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m${String(s % 60).padStart(2, "0")}s`;
};

/* One probe of the live root, cache-busted so no intermediary can answer for
   the origin. Returns { refs, buildId, status, error }. */
async function probeLive() {
  const res = await get(`${origin}/?__smoke=${Date.now()}`);
  if (res.error) return { error: res.error };
  if (res.status !== 200) return { status: res.status };
  const html = res.body || "";
  const idMatch = html.match(/\\"b\\":\\"([A-Za-z0-9_-]{6,})\\"/);
  return { status: 200, refs: refsOf(html), buildId: idMatch ? idMatch[1] : null };
}

/* ── wait for the build to become live ────────────────────── */

const DNS_CODES = new Set(["ENOTFOUND", "EAI_AGAIN", "ENODATA"]);

/**
 * Poll until the live home page references exactly the asset set this build
 * ships. Resolves { live: true, probes, elapsedMs } or { live: false, reason,
 * detail, probes }.
 */
async function waitForDeploy() {
  const started = Date.now();
  const deadline = timeoutSec > 0 ? started + timeoutSec * 1000 : Infinity;
  let probes = 0;
  let consecutiveDns = 0;
  let lastDetail = "no response yet";
  /* Whether the host is serving a build *newer* than this one (it references
     files we do not ship). The next step for that is different — rebuild and
     upload again, rather than re-upload the archive you already have. */
  let sawNewerBuild = false;

  for (;;) {
    probes++;
    const live = await probeLive();
    const elapsed = Date.now() - started;

    if (live.error) {
      /* A name that does not resolve at all is terminal: waiting will not fix
         DNS, so say so now instead of after the timeout. Connection-level
         errors are not — the upload may be mid-flight. */
      if (DNS_CODES.has(live.error)) {
        if (++consecutiveDns >= 3) {
          return {
            live: false,
            probes,
            elapsedMs: elapsed,
            reason: "unresolvable",
            detail:
              `${origin} does not resolve (${live.error}). The domain is not pointed at\n` +
              `   this host yet — check the DNS records in hPanel, and that SITE_ORIGIN in\n` +
              `   src/lib/site.ts names the domain you actually registered.`,
          };
        }
      } else {
        consecutiveDns = 0;
      }
      lastDetail = `unreachable (${live.error})`;
    } else if (live.status !== 200) {
      consecutiveDns = 0;
      lastDetail = `HTTP ${live.status} at ${origin}/`;
    } else {
      consecutiveDns = 0;
      const liveSet = new Set(live.refs);
      const localSet = new Set(localRefs);
      const missing = localRefs.filter((r) => !liveSet.has(r));
      const extra = live.refs.filter((r) => !localSet.has(r));

      if (missing.length === 0 && extra.length === 0) {
        return { live: true, probes, elapsedMs: elapsed, buildId: live.buildId };
      }

      /* Distinguish the two ways "not our build" happens, because the operator's
         next action is different for each: an older build (or a partial upload)
         means keep waiting and re-upload; a build referencing files ours does
         not know about is a *newer* deployment, which waiting cannot fix. */
      if (missing.length === 0) {
        sawNewerBuild = true;
        lastDetail =
          `a different, newer build is serving — the live page references ${extra.length} file(s) this build does not ship`;
      } else {
        lastDetail =
          `live build differs — ${missing.length} of ${localRefs.length} files not on the server` +
          (extra.length ? `, ${extra.length} not in this build` : "") +
          (missing.length ? `\n         awaiting e.g. ${missing.slice(0, 2).map((r) => r.replace("/_next/static/", "")).join(", ")}` : "");
      }
    }

    if (Date.now() >= deadline) {
      return {
        live: false,
        probes,
        elapsedMs: elapsed,
        reason: "timeout",
        detail: sawNewerBuild
          ? `gave up after ${mmss(elapsed)} (${probes} probes). The host is serving a build that is not\n` +
            `   the one on disk: it references files this build does not ship, so a newer\n` +
            `   deployment is already live. Rebuild from the current source and upload that.`
          : `gave up after ${mmss(elapsed)} (${probes} probes). Last seen: ${lastDetail}\n` +
            `   The archive was probably never uploaded, or was extracted into a subfolder\n` +
            `   instead of public_html. Re-run with a longer --timeout if the upload is slow.`,
      };
    }

    log(`  · ${String(mmss(elapsed)).padStart(5)}  ${lastDetail.split("\n")[0]}`);
    /* The await is never skipped by the loop condition, so no extra check here. */
    await sleep(intervalSec * 1000);
  }
}

/* ── verify ───────────────────────────────────────────────── */

function runVerifier() {
  const script = path.join(root, "scripts", "verify-live.mjs");
  if (!fs.existsSync(script)) {
    die(`scripts/verify-live.mjs is missing — cannot verify ${origin}.`);
  }
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [script, origin, ...PASSTHROUGH], {
      stdio: "inherit",
    });
    child.on("error", (e) => {
      console.error(`✖ could not start the verifier: ${e.message}`);
      resolve(1);
    });
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

/* ── main ─────────────────────────────────────────────────── */

async function main() {
  if (!Number.isFinite(timeoutSec) || timeoutSec < 0) die(`--timeout must be a number of seconds`);
  if (!Number.isFinite(intervalSec) || intervalSec <= 0) die(`--interval must be a positive number of seconds`);

  log(`\nCITICO Aviation — post-deploy smoke test`);
  log(`target  ${origin}`);
  log(
    haveLocalBuild
      ? `local   out/index.html · ${localRefs.length} fingerprinted assets${buildId ? ` · build ${buildId}` : ""}`
      : `local   no local build (nothing to compare against)${buildId ? ` · build ${buildId}` : ""}`,
  );
  log("─".repeat(72));

  if (NO_WAIT) {
    log(`\n▶ --no-wait: skipping the deploy wait, verifying whatever is live now.`);
  } else {
    log(`\n▶ Waiting for this build to be served (timeout ${timeoutSec ? mmss(timeoutSec * 1000) : "none"}, every ${intervalSec}s).`);
    log(`  Upload citico-aviation-hostinger-deployment.zip into public_html now; this detects it and continues by itself.`);

    const result = await waitForDeploy();

    if (!result.live) {
      console.error(`\n✖ the build never appeared at ${origin} — ${result.reason}`);
      console.error(`   ${result.detail}`);
      /* A name that will not resolve has nothing to do with the upload — the
         closing sentence about the old build serving would be wrong there. */
      if (result.reason !== "unresolvable")
        console.error(`\n   Nothing was verified: what is live is not the build on disk, so passing it\n   would only certify a deployment you did not make.`);
      process.exit(3);
    }

    log(
      `\n✔ this build is live — matched ${localRefs.length} fingerprinted assets after ${mmss(result.elapsedMs)} (${result.probes} probe${result.probes === 1 ? "" : "s"})`,
    );
    if (result.probes === 1) log(`  (identical output to the previous build, so there was nothing to wait for)`);
    if (result.buildId && buildId && result.buildId !== buildId)
      log(`  note: live build id ${result.buildId} ≠ local ${buildId} — same assets, rebuilt`);
    log("");
  }

  log("▶ verify-live.mjs");
  const code = await runVerifier();

  log("");
  if (code === 0) log(`✔ SMOKE TEST PASSED — ${origin} is serving this build and it verifies clean.`);
  else log(`✖ SMOKE TEST FAILED — verify-live.mjs exited ${code}. The upload landed but the site has problems; see the report above.`);
  process.exit(code);
}

main().catch((err) => {
  console.error(`✖ smoke test crashed: ${err.stack || err.message}`);
  process.exit(1);
});
