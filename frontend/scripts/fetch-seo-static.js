// Build-time step (runs BEFORE `craco build`): pulls fresh SEO artefacts
// (seo-data.json, sitemap.xml, robots.txt) from the LIVE backend so SEO
// content is regenerated from the current product catalog on every deploy,
// instead of relying on the old gen_seo_static.py, which only worked against
// a hardcoded localhost URL and had to be run manually whenever the catalog
// changed. Never fails the build: any fetch error is logged and the existing
// checked-in file is left in place, so a backend hiccup never blocks a deploy.
const fs = require("fs");
const path = require("path");

const BACKEND_URL = process.env.SEO_BACKEND_URL || "https://sculpt-confidence-production.up.railway.app";
const HOST = process.env.SEO_HOST || "sculptivauk.com";
const PROTO = "https";

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
}

async function main() {
  const qs = `proto=${PROTO}&host=${HOST}`;

  try {
    const bundle = await fetchText(`${BACKEND_URL}/api/_seo/static-bundle?${qs}`);
    JSON.parse(bundle); // sanity check before writing
    fs.writeFileSync(path.join(__dirname, "seo-data.json"), bundle);
    console.log("fetch-seo-static: updated seo-data.json from live backend");
  } catch (e) {
    console.error("fetch-seo-static: seo-data.json fetch failed, keeping existing file —", e.message);
  }

  try {
    const sitemap = await fetchText(`${BACKEND_URL}/api/_seo/sitemap.xml?${qs}`);
    fs.writeFileSync(path.join(__dirname, "..", "public", "sitemap.xml"), sitemap);
    console.log("fetch-seo-static: updated public/sitemap.xml from live backend");
  } catch (e) {
    console.error("fetch-seo-static: sitemap.xml fetch failed, keeping existing file —", e.message);
  }

  try {
    const robots = await fetchText(`${BACKEND_URL}/api/_seo/robots.txt?${qs}`);
    fs.writeFileSync(path.join(__dirname, "..", "public", "robots.txt"), robots);
    console.log("fetch-seo-static: updated public/robots.txt from live backend");
  } catch (e) {
    console.error("fetch-seo-static: robots.txt fetch failed, keeping existing file —", e.message);
  }
}

main();
