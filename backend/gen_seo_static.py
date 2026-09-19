"""Generate static SEO artefacts for the production (static) build:
- frontend/scripts/seo-data.json : per-route <head> SEO tags to bake in at build
- frontend/public/robots.txt
- frontend/public/sitemap.xml
Run manually whenever the catalog changes, then redeploy."""
import json
import re
import sys

import requests

sys.path.insert(0, "/app/backend")
import seo

HOST = "https://sculptivauk.com"
API = "http://localhost:8001"

resp = requests.get(f"{API}/api/products", timeout=30).json()
products = resp if isinstance(resp, list) else resp.get("products", resp)

routes = (
    list(seo.STATIC.keys())
    + [f"/collections/{h}" for h in seo.COLLECTIONS]
    + [f"/collections/{h}" for h in seo.CURATED]
    + [f"/products/{p['handle']}" for p in products]
)

curated_routes = {f"/collections/{h}" for h in seo.CURATED}

data = {}
for r in routes:
    html, status = seo.render_page(r, HOST, products)
    head = re.search(r"<head>(.*?)</head>", html, re.S).group(1)
    lines = [
        ln for ln in head.strip().splitlines()
        if "charset" not in ln and "viewport" not in ln and ln.strip()
    ]
    entry = {"head": "\n".join(lines).strip()}
    if r in curated_routes:
        body = re.search(r"<body>(.*?)</body>", html, re.S).group(1)
        entry["body"] = body.strip()
    data[r] = entry

with open("/app/frontend/scripts/seo-data.json", "w") as f:
    json.dump(data, f, ensure_ascii=False, indent=0)

with open("/app/frontend/public/sitemap.xml", "w") as f:
    f.write(seo.build_sitemap(HOST, products))

with open("/app/frontend/public/robots.txt", "w") as f:
    f.write(seo.build_robots(HOST))

print(f"wrote seo-data.json ({len(data)} routes), sitemap.xml, robots.txt")
