const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");

const DIST_DIR = path.join(__dirname, "dist");
const INDEX_PATH = path.join(DIST_DIR, "index.html");
const CSP_NONCE_PLACEHOLDER = "__CSP_NONCE__";
const PORT = Number(process.env.PORT || 8080);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".pdf": "application/pdf",
};

function buildCsp(nonce) {
  const isDev =
    process.env.NODE_ENV === "development" || process.env.ENV === "DEV";
  const connectSrc = [
    "'self'",
    "https://api.speedcubingcanada.org",
    "https://api.staging.speedcubingcanada.org",
  ];

  if (isDev) {
    connectSrc.push(
      "http://localhost:8000",
      "http://127.0.0.1:8000",
      "http://host.docker.internal:8000",
    );
  }

  return [
    "default-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "script-src 'self' 'nonce-" + nonce + "'",
    "script-src-attr 'none'",
    "require-trusted-types-for 'script'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "style-src-attr 'unsafe-inline'",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https:",
    "connect-src " + connectSrc.join(" "),
    "manifest-src 'self'",
    "frame-src 'none'",
  ].join("; ");
}

function isPathSafe(filePath) {
  return filePath.startsWith(DIST_DIR + path.sep) || filePath === DIST_DIR;
}

function sendStaticFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    });
    res.end(data);
  });
}

function sendIndex(res) {
  fs.readFile(INDEX_PATH, "utf8", (error, html) => {
    if (error) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Missing front/dist/index.html. Run npm run build first.");
      return;
    }

    const nonce = crypto.randomBytes(16).toString("base64");
    const patchedHtml = html.split(CSP_NONCE_PLACEHOLDER).join(nonce);

    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      "X-Frame-Options": "DENY",
      "Content-Security-Policy": buildCsp(nonce),
    });
    res.end(patchedHtml);
  });
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }

  const urlPath = decodeURIComponent(req.url.split("?")[0]);

  if (urlPath.startsWith("/assets/") || path.extname(urlPath)) {
    const requestedPath = path.join(DIST_DIR, urlPath.replace(/^\//, ""));
    if (!isPathSafe(requestedPath)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Forbidden");
      return;
    }
    sendStaticFile(res, requestedPath);
    return;
  }

  sendIndex(res);
});

server.listen(PORT, () => {
  console.log("Frontend server listening on port " + PORT);
});
