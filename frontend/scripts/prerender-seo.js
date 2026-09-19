// Build-time SEO prerender (runs after `craco build`).
// Bakes unique <title>/meta/canonical/OG/JSON-LD into a static HTML file per
// route so crawlers get distinct, no-JS content on a static (Cloudflare/R2)
// deploy. Each output is the real built index.html (with hashed JS/CSS bundles)
// plus injected head tags — humans still hydrate the full SPA normally.
// Never fails the build: any error is logged and skipped.
const fs = require("fs");
const path = require("path");

try {
  const buildDir = path.join(__dirname, "..", "build");
  const indexPath = path.join(buildDir, "index.html");
  const dataPath = path.join(__dirname, "seo-data.json");

  if (!fs.existsSync(indexPath) || !fs.existsSync(dataPath)) {
    console.error("prerender-seo: build/index.html or seo-data.json missing — skipped");
    process.exit(0);
  }

  const base = fs.readFileSync(indexPath, "utf8");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  let count = 0;

  for (const [route, head] of Object.entries(data)) {
    let html = base
      .replace(/<title>[\s\S]*?<\/title>/i, "")
      .replace(/<meta\s+name="description"[^>]*>/i, "");
    html = html.replace("</head>", `${head}\n</head>`);

    let outPath;
    if (route === "/") {
      outPath = indexPath;
    } else {
      const dir = path.join(buildDir, route.replace(/^\//, ""));
      fs.mkdirSync(dir, { recursive: true });
      outPath = path.join(dir, "index.html");
    }
    fs.writeFileSync(outPath, html);
    count += 1;
  }

  console.log(`prerender-seo: baked SEO into ${count} route(s)`);
} catch (e) {
  console.error("prerender-seo skipped:", e && e.message);
}
process.exit(0);
