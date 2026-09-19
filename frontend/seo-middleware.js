// Dynamic-rendering middleware for crawlers.
//
// Humans get the untouched React SPA. Crawlers (Googlebot, Bingbot, social
// unfurlers, generic bots) are served complete server-rendered HTML fetched
// from the FastAPI backend. Also serves /robots.txt and /sitemap.xml as real
// non-SPA responses. Runs inside the frontend serving layer because the
// platform routes all non-/api traffic here, not to the backend.

const http = require("http");

const BACKEND = { host: "127.0.0.1", port: 8001 };

const CRAWLER_RE =
  /(googlebot|bingbot|slurp|duckduckbot|baiduspider|yandex|sogou|exabot|facebookexternalhit|facebot|twitterbot|linkedinbot|pinterest|slackbot|whatsapp|telegrambot|discordbot|applebot|petalbot|bot|crawler|spider|crawling)/i;

function backendGet(path, headers) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: BACKEND.host, port: BACKEND.port, path, method: "GET", headers },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () =>
          resolve({
            status: res.statusCode || 200,
            body: Buffer.concat(chunks).toString("utf8"),
            contentType: res.headers["content-type"] || "text/plain",
          })
        );
      }
    );
    req.on("error", reject);
    req.setTimeout(8000, () => req.destroy(new Error("backend timeout")));
    req.end();
  });
}

function reqMeta(req) {
  const host = (req.headers["x-forwarded-host"] || req.headers["host"] || "")
    .split(",")[0]
    .trim();
  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0];
  return { host: encodeURIComponent(host), proto: encodeURIComponent(proto) };
}

function looksLikeAsset(pathname) {
  if (
    pathname.startsWith("/static/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/ws") ||
    pathname.startsWith("/sockjs-node") ||
    pathname.startsWith("/__")
  )
    return true;
  const last = pathname.split("/").pop() || "";
  return last.includes("."); // has a file extension
}

module.exports = function seoMiddleware(req, res, next) {
  try {
    const pathname = (req.url || "/").split("?")[0];
    const { host, proto } = reqMeta(req);
    const qs = `proto=${proto}&host=${host}`;

    if (pathname === "/robots.txt") {
      backendGet(`/api/_seo/robots.txt?${qs}`)
        .then((r) => {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.statusCode = r.status;
          res.end(r.body);
        })
        .catch(() => next());
      return;
    }

    if (pathname === "/sitemap.xml") {
      backendGet(`/api/_seo/sitemap.xml?${qs}`)
        .then((r) => {
          res.setHeader("Content-Type", "application/xml; charset=utf-8");
          res.statusCode = r.status;
          res.end(r.body);
        })
        .catch(() => next());
      return;
    }

    const ua = req.headers["user-agent"] || "";
    if (CRAWLER_RE.test(ua) && !looksLikeAsset(pathname)) {
      backendGet(
        `/api/_seo/render?path=${encodeURIComponent(pathname)}&${qs}`,
        { "user-agent": ua }
      )
        .then((r) => {
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.statusCode = r.status;
          res.end(r.body);
        })
        .catch(() => next()); // on any failure, fall back to the SPA
      return;
    }
  } catch (e) {
    return next();
  }
  return next();
};
