const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.mp4': 'video/mp4'
};

function getCacheControl(filePath, ext) {
  const norm = filePath.replace(/\\/g, '/');
  if (norm.includes('/_next/') || ['.woff', '.woff2', '.ttf', '.otf'].includes(ext)) {
    return 'public, max-age=31536000, immutable';
  }
  if (['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.mp4'].includes(ext)) {
    return 'public, max-age=86400, stale-while-revalidate=604800';
  }
  return 'public, max-age=0, must-revalidate';
}

function serveFile(res, filePath, statusCode = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const cacheControl = getCacheControl(filePath, ext);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      return serve404(res);
    }

    res.writeHead(statusCode, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': cacheControl,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
}

function serve404(res) {
  const notFoundPath = path.join(ROOT_DIR, '404.html');
  fs.stat(notFoundPath, (err, stats) => {
    if (!err && stats.isFile()) {
      serveFile(res, notFoundPath, 404);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
    }
  });
}

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(urlObj.pathname);

  // Normalize path to prevent traversal
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let resolvedPath = path.join(ROOT_DIR, safePath);

  // Verify within ROOT_DIR
  if (!resolvedPath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  fs.stat(resolvedPath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      const indexPath = path.join(resolvedPath, 'index.html');
      fs.stat(indexPath, (idxErr, idxStats) => {
        if (!idxErr && idxStats.isFile()) {
          serveFile(res, indexPath);
        } else {
          serve404(res);
        }
      });
    } else if (!err && stats.isFile()) {
      serveFile(res, resolvedPath);
    } else {
      // Try appending .html
      const htmlPath = resolvedPath + '.html';
      fs.stat(htmlPath, (htmlErr, htmlStats) => {
        if (!htmlErr && htmlStats.isFile()) {
          serveFile(res, htmlPath);
        } else {
          serve404(res);
        }
      });
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`CITICO Aviation website server running at:`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Network: http://127.0.0.1:${PORT}`);
  console.log(`Ready to serve requests.`);
});
