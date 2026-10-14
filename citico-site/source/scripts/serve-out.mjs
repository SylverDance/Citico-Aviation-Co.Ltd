/* ──────────────────────────────────────────────────────────────
   serve-out.mjs — preview the exact artifact that ships to Hostinger.

   With `output: "export"` the build no longer produces a Next.js server, so
   `next start` cannot serve it. This is a dependency-free stand-in that
   reproduces how LiteSpeed/Apache serve the same files:

     /about/          → out/about/index.html
     /about           → 301 /about/          (DirectorySlash behaviour)
     /img/logo.png    → out/img/logo.png
     anything missing → out/404.html with HTTP 404 + the ErrorDocument rule

   Usage:  npm start            → http://localhost:4173
           node scripts/serve-out.mjs 5050
   ────────────────────────────────────────────────────────────── */

import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = path.join(process.cwd(), "out");
const port = Number(process.argv[2] ?? process.env.PORT ?? 4173);

if (!fs.existsSync(path.join(root, "index.html"))) {
  console.error("✖ ./out/index.html not found — run `npm run build` first.");
  process.exit(2);
}

const MIME = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

const send = (res, status, filePath, extraHeaders = {}) => {
  const body = fs.readFileSync(filePath);
  res.writeHead(status, {
    "Content-Type": MIME[path.extname(filePath).toLowerCase()] ?? "application/octet-stream",
    "Content-Length": body.length,
    ...extraHeaders,
  });
  res.end(body);
};

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    res.writeHead(400).end("Bad request");
    return;
  }

  // Contain every request inside out/ — no traversal above the web root.
  const resolved = path.resolve(root, `.${pathname}`);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
    send(res, 200, resolved);
    return;
  }

  if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
    // LiteSpeed sends the browser to the canonical trailing-slash directory URL.
    if (!pathname.endsWith("/")) {
      res.writeHead(301, { Location: `${pathname}/` }).end();
      return;
    }
    const index = path.join(resolved, "index.html");
    if (fs.existsSync(index)) {
      send(res, 200, index);
      return;
    }
  }

  const asHtml = `${resolved}.html`;
  if (fs.existsSync(asHtml)) {
    send(res, 200, asHtml);
    return;
  }

  // The .htaccess ErrorDocument 404 /404.html rule.
  send(res, 404, path.join(root, "404.html"));
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Static export served from ./out`);
  console.log(`  http://localhost:${port}/        (English)`);
  console.log(`  http://localhost:${port}/ar/     (Arabic)`);
});
