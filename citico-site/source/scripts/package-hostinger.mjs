/* ──────────────────────────────────────────────────────────────
   package-hostinger.mjs — build the upload-ready Hostinger archive.

   `next build` writes the deployable site to ./out. That folder's CONTENTS
   have to land at the root of public_html (public_html/index.html, not
   public_html/out/index.html), so this script builds one archive:

     citico-aviation-hostinger-deployment.zip
     ├── index.html 404.html .htaccess _next/ img/ ar/ …  ← the published site
     ├── README-HOSTINGER.md DEPLOYMENT-REPORT.md         ← how to deploy, what was tested
     └── source/…                                         ← the project, for future rebuilds

   The site files sit at the archive ROOT rather than inside a top-level
   folder, so extracting the archive straight into public_html puts index.html
   exactly where the host looks for it. That removes the single most common way
   to end up with a blank page.

     1. copies deploy/.htaccess to the archive root,
     2. deflates ./out into the archive root,
     3. adds the two documents at the root and the project itself under source/,
     4. reads the finished archive back and CRC-checks every entry against the
        bytes on disk.

   ZIP is written by hand rather than via PowerShell's Compress-Archive, which
   emits backslash entry names — legal-looking but rejected by macOS/Linux
   unzippers and by some Hostinger extraction paths.

   Usage:  npm run package:hostinger        (runs the build first)
           node scripts/package-hostinger.mjs --no-build
   ────────────────────────────────────────────────────────────── */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = process.cwd();
const outDir = path.join(root, "out");
const htaccessSrc = path.join(root, "deploy", ".htaccess");
const zipPath = path.join(root, "citico-aviation-hostinger-deployment.zip");
/* Earlier name for the same artifact. Removed once the new archive verifies, so
   there is never more than one thing to upload. */
const legacyZipPath = path.join(root, "hostinger-public-html.zip");

/* Documents that ship at the archive root, next to index.html. Both are denied
   by the shipped .htaccess, so they stay readable in the archive but cannot be
   fetched from the published site. */
const DOCS = ["README-HOSTINGER.md", "DEPLOYMENT-REPORT.md"];

/* The project itself, copied in under source/ so the site can be rebuilt later
   without hunting for a checkout. An allow-list on purpose: node_modules,
   .next, out, .assets_raw, .freebuff and .git never get in. */
const SOURCE_PREFIX = "source";
const SOURCE_DIRS = ["src", "public", "scripts", "deploy", "docs"];
const SOURCE_FILES = [
  ".gitignore",
  "README.md",
  "DEPLOY.md",
  "eslint.config.mjs",
  "next-env.d.ts",
  "next.config.ts",
  "package-lock.json",
  "package.json",
  "postcss.config.mjs",
  "tsconfig.json",
];

/* Source is reference material, never served. The root .htaccess also blocks
   it, but this folder carries its own deny-all in case an upload skips hidden
   files at the root only. */
const SOURCE_HTACCESS = `# Project source, shipped so this site can be rebuilt later.
# Never served over HTTP — deny everything in this folder.
<IfModule mod_authz_core.c>
  Require all denied
</IfModule>
<IfModule !mod_authz_core.c>
  Order allow,deny
  Deny from all
</IfModule>
`;

const skipBuild = process.argv.includes("--no-build");

/* ---------------- 1. build ---------------- */

/* Run `npm run build` without ever asking the OS to execute a .cmd shim.
   Node 20+ refuses to spawn .cmd/.bat without a shell (Windows: EINVAL), which
   is what `execFileSync("npm.cmd", …)` now does. npm's own JavaScript entry
   point is a plain file, so run it with the node that is already running. */
function runNpmBuild() {
  const cliCandidates = [
    process.env.npm_execpath,
    path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js"),
    path.join(root, "node_modules", "npm", "bin", "npm-cli.js"),
  ].filter((p) => typeof p === "string" && p.endsWith(".js"));

  for (const cli of cliCandidates) {
    if (fs.existsSync(cli)) {
      execFileSync(process.execPath, [cli, "run", "build"], { stdio: "inherit" });
      return;
    }
  }

  /* Last resort: let the shell resolve npm. Safe here because the command and
     its arguments are fixed strings with no user input in them. */
  execFileSync("npm", ["run", "build"], { stdio: "inherit", shell: true });
}

if (!skipBuild) {
  console.log("▶ next build (static export → ./out)");
  runNpmBuild();
}

if (!fs.existsSync(outDir)) {
  console.error("✖ ./out is missing — run `npm run build` first (or drop --no-build).");
  process.exit(2);
}
if (!fs.existsSync(htaccessSrc)) {
  console.error(`✖ ${path.relative(root, htaccessSrc)} is missing — it must ship at the archive root.`);
  process.exit(2);
}
for (const doc of DOCS) {
  if (!fs.existsSync(path.join(root, doc))) {
    console.error(`✖ ${doc} is missing — write it before packaging; it ships at the archive root.`);
    process.exit(2);
  }
}
for (const rel of [...SOURCE_DIRS, ...SOURCE_FILES]) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error(`✖ ${rel} is missing — the source copy in the archive would be incomplete.`);
    process.exit(2);
  }
}

/* ---------------- 2. collect entries ---------------- */

/** @type {{name: string, isDir: boolean, data?: Buffer, abs?: string, mtime: Date}[]} */
const entries = [];

function walk(dir, rel) {
  const items = fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

  for (const item of items) {
    const abs = path.join(dir, item.name);
    const relPath = rel ? `${rel}/${item.name}` : item.name;
    const stat = fs.statSync(abs);

    if (stat.isSymbolicLink()) {
      console.warn(`  skipped (symlink): ${relPath}`);
      continue;
    }
    if (stat.isDirectory()) {
      entries.push({ name: `${relPath}/`, isDir: true, mtime: stat.mtime });
      walk(abs, relPath);
    } else if (stat.isFile()) {
      entries.push({ name: relPath, isDir: false, abs, mtime: stat.mtime });
    }
  }
}

walk(outDir, "");

/* The server config belongs at the very root of public_html, next to index.html. */
const htaccessData = fs.readFileSync(htaccessSrc);
entries.unshift({
  name: ".htaccess",
  isDir: false,
  data: htaccessData,
  mtime: fs.statSync(htaccessSrc).mtime,
});

/* The two documents, also at the root so they are the first thing you see. */
for (const doc of DOCS) {
  const abs = path.join(root, doc);
  entries.push({ name: doc, isDir: false, abs, mtime: fs.statSync(abs).mtime });
}

/* ── the project, under source/ ──────────────────────────────────────────── */

for (const rel of SOURCE_DIRS) {
  const abs = path.join(root, rel);
  entries.push({ name: `${SOURCE_PREFIX}/${rel}/`, isDir: true, mtime: fs.statSync(abs).mtime });
  walk(abs, `${SOURCE_PREFIX}/${rel}`);
}
for (const rel of SOURCE_FILES) {
  const abs = path.join(root, rel);
  entries.push({ name: `${SOURCE_PREFIX}/${rel}`, isDir: false, abs, mtime: fs.statSync(abs).mtime });
}
entries.push({
  name: `${SOURCE_PREFIX}/.htaccess`,
  isDir: false,
  data: Buffer.from(SOURCE_HTACCESS, "utf8"),
  mtime: fs.statSync(htaccessSrc).mtime,
});

if (!entries.some((e) => e.name === "index.html")) {
  console.error("✖ out/index.html not found — that is not a finished Next.js export.");
  process.exit(2);
}
if (!entries.some((e) => e.name === "ar/index.html")) {
  console.error("✖ out/ar/index.html not found — the Arabic tree did not export.");
  process.exit(2);
}
if (!entries.some((e) => e.name === "404.html")) {
  console.error("✖ out/404.html not found — the .htaccess ErrorDocument would point at nothing.");
  process.exit(2);
}
for (const doc of DOCS) {
  if (!entries.some((e) => e.name === doc)) {
    console.error(`✖ ${doc} is missing from the archive.`);
    process.exit(2);
  }
}
if (!entries.some((e) => e.name === `${SOURCE_PREFIX}/package.json`)) {
  console.error(`✖ ${SOURCE_PREFIX}/package.json is missing — that source copy could not be rebuilt.`);
  process.exit(2);
}
if (!entries.some((e) => e.name === `${SOURCE_PREFIX}/.htaccess`)) {
  console.error(`✖ ${SOURCE_PREFIX}/.htaccess is missing — the source tree would be fetchable.`);
  process.exit(2);
}

/* A source tree is readable; an .env file is not. Nothing rebuildable-by-
   accident, nothing secret, and no stray archive that duplicates the site. */
const FORBIDDEN =
  /(^|\/)(\.env[^/]*|node_modules|\.git|\.next|\.freebuff|\.assets_raw|out)(\/|$)|\.(zip|tar\.gz|tsbuildinfo)$/i;
const smuggled = entries.filter((e) => FORBIDDEN.test(e.name));
if (smuggled.length) {
  console.error(`\n✖ refusing to package ${smuggled.length} entry(s) that must not ship:`);
  for (const s of smuggled.slice(0, 25)) console.error(`    ${s.name}`);
  process.exit(2);
}

/* ---------------- 3. write the archive ---------------- */

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

/* Already-compressed payloads: storing beats spending CPU to add 1%. */
const STORE_EXT = new Set([
  ".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".ico",
  ".woff", ".woff2", ".pdf", ".zip", ".gz", ".mp4", ".webm",
]);

const dosDateTime = (d) => ({
  time: ((d.getHours() & 31) << 11) | ((d.getMinutes() & 63) << 5) | ((d.getSeconds() >> 1) & 31),
  date:
    (((d.getFullYear() - 1980) & 127) << 9) |
    (((d.getMonth() + 1) & 15) << 5) |
    (d.getDate() & 31),
});

const localParts = [];
const centralParts = [];
let offset = 0;
let stored = 0;
let deflated = 0;

for (const entry of entries) {
  const nameBuf = Buffer.from(entry.name, "utf8");
  let method;
  let payload;
  let crc;
  let uncompressedSize;

  if (entry.isDir) {
    method = 0;
    payload = Buffer.alloc(0);
    crc = 0;
    uncompressedSize = 0;
  } else {
    const raw = entry.data ?? fs.readFileSync(entry.abs);
    uncompressedSize = raw.length;
    crc = crc32(raw);

    if (STORE_EXT.has(path.extname(entry.name).toLowerCase())) {
      method = 0;
      payload = raw;
    } else {
      const deflatedBytes = zlib.deflateRawSync(raw, { level: 9 });
      if (deflatedBytes.length < raw.length) {
        method = 8;
        payload = deflatedBytes;
      } else {
        method = 0;
        payload = raw;
      }
    }
    method === 0 ? stored++ : deflated++;
  }

  const { time, date } = dosDateTime(entry.mtime);
  const flags = 0x0800; // bit 11 — entry names are UTF-8

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(flags, 6);
  local.writeUInt16LE(method, 8);
  local.writeUInt16LE(time, 10);
  local.writeUInt16LE(date, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(payload.length, 18);
  local.writeUInt32LE(uncompressedSize, 22);
  local.writeUInt16LE(nameBuf.length, 26);
  local.writeUInt16LE(0, 28);
  localParts.push(local, nameBuf, payload);

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(flags, 8);
  central.writeUInt16LE(method, 10);
  central.writeUInt16LE(time, 12);
  central.writeUInt16LE(date, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(payload.length, 20);
  central.writeUInt32LE(uncompressedSize, 24);
  central.writeUInt16LE(nameBuf.length, 28);
  central.writeUInt16LE(0, 30);
  central.writeUInt16LE(0, 32);
  central.writeUInt16LE(0, 34);
  central.writeUInt16LE(0, 36);
  central.writeUInt32LE(entry.isDir ? 0x10 : 0x20, 38);
  central.writeUInt32LE(offset, 42);
  centralParts.push(central, nameBuf);

  offset += local.length + nameBuf.length + payload.length;
}

const centralBuf = Buffer.concat(centralParts);
const eocd = Buffer.alloc(22);
eocd.writeUInt32LE(0x06054b50, 0);
eocd.writeUInt16LE(0, 4);
eocd.writeUInt16LE(0, 6);
eocd.writeUInt16LE(entries.length, 8);
eocd.writeUInt16LE(entries.length, 10);
eocd.writeUInt32LE(centralBuf.length, 12);
eocd.writeUInt32LE(offset, 16);
eocd.writeUInt16LE(0, 20);

fs.writeFileSync(zipPath, Buffer.concat([...localParts, centralBuf, eocd]));

/* ---------------- 4. read it back and verify ---------------- */

const archive = fs.readFileSync(zipPath);

let eocdPos = -1;
for (let i = archive.length - 22; i >= 0 && i >= archive.length - 22 - 65535; i--) {
  if (archive.readUInt32LE(i) === 0x06054b50) {
    eocdPos = i;
    break;
  }
}
if (eocdPos < 0) throw new Error("EOCD record not found in the written archive");

const totalEntries = archive.readUInt16LE(eocdPos + 10);
const cdSize = archive.readUInt32LE(eocdPos + 12);
const cdOffset = archive.readUInt32LE(eocdPos + 16);
if (cdOffset + cdSize !== eocdPos) throw new Error("central directory offset/size mismatch");

const seen = new Map();
let cursor = cdOffset;
for (let i = 0; i < totalEntries; i++) {
  if (archive.readUInt32LE(cursor) !== 0x02014b50) {
    throw new Error(`bad central directory header at byte ${cursor}`);
  }
  const nameLen = archive.readUInt16LE(cursor + 28);
  const extraLen = archive.readUInt16LE(cursor + 30);
  const commentLen = archive.readUInt16LE(cursor + 32);
  seen.set(archive.toString("utf8", cursor + 46, cursor + 46 + nameLen), {
    method: archive.readUInt16LE(cursor + 10),
    crc: archive.readUInt32LE(cursor + 16),
    csize: archive.readUInt32LE(cursor + 20),
    usize: archive.readUInt32LE(cursor + 24),
    localOffset: archive.readUInt32LE(cursor + 42),
  });
  cursor += 46 + nameLen + extraLen + commentLen;
}
if (cursor !== cdOffset + cdSize) throw new Error("central directory walk ended early");

const problems = [];
let verifiedFiles = 0;
let uncompressedTotal = 0;

for (const entry of entries) {
  const meta = seen.get(entry.name);
  if (!meta) {
    problems.push(`missing from archive: ${entry.name}`);
    continue;
  }
  if (archive.readUInt32LE(meta.localOffset) !== 0x04034b50) {
    problems.push(`bad local header: ${entry.name}`);
    continue;
  }

  const dataStart =
    meta.localOffset +
    30 +
    archive.readUInt16LE(meta.localOffset + 26) +
    archive.readUInt16LE(meta.localOffset + 28);
  const payload = archive.subarray(dataStart, dataStart + meta.csize);

  let decoded;
  if (meta.method === 0) decoded = Buffer.from(payload);
  else if (meta.method === 8) decoded = zlib.inflateRawSync(payload);
  else {
    problems.push(`unsupported compression method ${meta.method}: ${entry.name}`);
    continue;
  }

  if (decoded.length !== meta.usize) problems.push(`size mismatch: ${entry.name}`);
  if (crc32(decoded) !== meta.crc) problems.push(`CRC mismatch: ${entry.name}`);

  if (!entry.isDir) {
    const onDisk = entry.data ?? fs.readFileSync(entry.abs);
    if (!decoded.equals(onDisk)) problems.push(`content mismatch vs source: ${entry.name}`);
    else verifiedFiles++;
    uncompressedTotal += decoded.length;
  }
}

for (const name of seen.keys()) {
  if (!entries.some((e) => e.name === name)) problems.push(`unexpected archive entry: ${name}`);
}

if (problems.length) {
  console.error(`\n✖ VERIFY FAILED (${problems.length}):`);
  for (const p of problems.slice(0, 25)) console.error(`    ${p}`);
  process.exit(1);
}

/* ---------------- 5. report ---------------- */

const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;
const dirs = entries.filter((e) => e.isDir).length;
const files = entries.length - dirs;

const sourceFiles = entries.filter((e) => !e.isDir && e.name.startsWith(`${SOURCE_PREFIX}/`)).length;
const siteFiles = files - DOCS.length - sourceFiles;

console.log(`\n✔ VERIFY OK — ${verifiedFiles} files byte-identical to source`);
console.log(`  archive      ${path.basename(zipPath)}  (${mb(archive.length)})`);
console.log(`  contents     ${files} files, ${dirs} folders, ${mb(uncompressedTotal)} uncompressed`);
console.log(`               ${siteFiles} site files · ${DOCS.length} documents · ${sourceFiles} source files`);
console.log(`  compression  ${stored} stored / ${deflated} deflated`);

if (fs.existsSync(legacyZipPath)) {
  fs.rmSync(legacyZipPath);
  console.log(`  removed      ${path.basename(legacyZipPath)} (superseded name)`);
}

console.log(`\n  Upload this ZIP into public_html and extract it there.`);
console.log(`  public_html/index.html  →  English home`);
console.log(`  public_html/ar/         →  Arabic home`);
console.log(`  Read README-HOSTINGER.md first; DEPLOYMENT-REPORT.md records what was tested.`);
console.log(`  source/ is for future rebuilds — denied over HTTP, and safe to delete on the server.`);
