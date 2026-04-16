const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const helmet = require("helmet");

const DIST_DIR = path.join(__dirname, "dist");
const INDEX_PATH = path.join(DIST_DIR, "index.html");
const CSP_NONCE_PLACEHOLDER = "__CSP_NONCE__";
const PORT = Number(process.env.PORT || 8080);

function buildConnectSrc() {
  const isDev =
    process.env.NODE_ENV === "development" || process.env.ENV === "DEV";
  const sources = [
    "'self'",
    "https://api.speedcubingcanada.org",
    "https://api.staging.speedcubingcanada.org",
  ];

  if (isDev) {
    sources.push(
      "http://localhost:8000",
      "http://127.0.0.1:8000",
      "http://host.docker.internal:8000",
    );
  }

  return sources;
}

function sendIndex(res) {
  fs.readFile(INDEX_PATH, "utf8", (error, html) => {
    if (error) {
      res
        .status(500)
        .type("text/plain; charset=utf-8")
        .send("Missing front/dist/index.html. Run npm run build first.");
      return;
    }

    const nonce = res.locals.cspNonce;
    const patchedHtml = html.replaceAll(CSP_NONCE_PLACEHOLDER, nonce);

    res
      .status(200)
      .type("text/html; charset=utf-8")
      .set("Cache-Control", "no-store")
      .send(patchedHtml);
  });
}

const app = express();

app.disable("x-powered-by");

app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString("base64");
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        "default-src": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"],
        "frame-ancestors": ["'none'"],
        "object-src": ["'none'"],
        "script-src": [
          "'self'",
          (req, res) => "'nonce-" + res.locals.cspNonce + "'",
        ],
        "script-src-attr": ["'none'"],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        "style-src-attr": ["'unsafe-inline'"],
        "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
        "img-src": ["'self'", "data:"],
        "connect-src": buildConnectSrc(),
        "manifest-src": ["'self'"],
        "frame-src": ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  "/assets",
  express.static(path.join(DIST_DIR, "assets"), {
    immutable: true,
    maxAge: "1y",
    index: false,
  }),
);

app.use(
  express.static(DIST_DIR, {
    maxAge: 0,
    index: false,
  }),
);

app.use((req, res, next) => {
  if (path.extname(req.path)) {
    res.status(404).type("text/plain; charset=utf-8").send("Not found");
    return;
  }
  next();
});

app.use((req, res) => {
  sendIndex(res);
});

const server = app.listen(PORT, () => {
  console.log("Frontend server listening on port " + PORT);
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Process terminated");
  });
});
