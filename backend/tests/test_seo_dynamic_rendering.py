"""SEO dynamic rendering tests against the public preview URL.

Tests crawler-facing behaviour: crawler UAs get server-rendered unique HTML,
human UAs get the untouched React SPA, and /robots.txt + /sitemap.xml are real
non-SPA responses.
"""
import os
import re
import json
import pytest
import requests

BASE_URL = os.environ.get("PUBLIC_BASE_URL") or "https://sculpt-confidence-1.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")

GOOGLEBOT_UA = "Googlebot/2.1 (+http://www.google.com/bot.html)"
HUMAN_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)

TIMEOUT = 30


def _get(path, ua):
    return requests.get(BASE_URL + path, headers={"User-Agent": ua}, timeout=TIMEOUT, allow_redirects=False)


def _extract_title(html):
    m = re.search(r"<title>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
    return m.group(1).strip() if m else None


def _extract_meta_desc(html):
    m = re.search(r'<meta[^>]+name=["\']description["\'][^>]*content=["\']([^"\']+)["\']', html, re.IGNORECASE)
    if m:
        return m.group(1)
    m = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]*name=["\']description["\']', html, re.IGNORECASE)
    return m.group(1) if m else None


def _extract_h1(html):
    m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.IGNORECASE | re.DOTALL)
    return re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else None


def _extract_ld_jsons(html):
    blocks = re.findall(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html, re.IGNORECASE | re.DOTALL,
    )
    parsed = []
    for b in blocks:
        try:
            parsed.append(json.loads(b))
        except Exception:
            pass
    return parsed


# -------------------- Crawler: Homepage --------------------
class TestCrawlerHomepage:
    def test_home_returns_rendered_html(self):
        r = _get("/", GOOGLEBOT_UA)
        assert r.status_code == 200, f"status={r.status_code}"
        html = r.text
        assert "You need to enable JavaScript" not in html, "SPA shell leaked to crawler"
        title = _extract_title(html)
        assert title, "missing <title>"
        assert ("Confidence" in title) or ("Move with Confidence" in title), f"unexpected title: {title}"
        assert _extract_meta_desc(html), "missing meta description"
        h1 = _extract_h1(html)
        assert h1 and "Confidence Starts Here" in h1, f"unexpected h1: {h1}"
        lds = _extract_ld_jsons(html)
        assert any(o.get("@type") == "Organization" for o in lds), "missing Organization JSON-LD"


# -------------------- Crawler: Collection --------------------
class TestCrawlerCollection:
    def test_leggings_collection(self):
        r = _get("/collections/leggings", GOOGLEBOT_UA)
        assert r.status_code == 200, f"status={r.status_code}"
        html = r.text
        assert "You need to enable JavaScript" not in html
        title = _extract_title(html)
        assert title == "Leggings | Sculptiva", f"unexpected title: {title}"
        assert _extract_meta_desc(html)
        h1 = _extract_h1(html)
        assert h1 == "Leggings", f"unexpected h1: {h1}"
        lds = _extract_ld_jsons(html)
        col = next((o for o in lds if o.get("@type") == "CollectionPage"), None)
        assert col is not None, "missing CollectionPage JSON-LD"
        main = col.get("mainEntity") or {}
        assert main.get("@type") == "ItemList"
        items = main.get("itemListElement") or []
        assert len(items) >= 1, f"itemList empty: {items}"


# -------------------- Crawler: Product --------------------
class TestCrawlerProduct:
    def test_sculpt_shorts_product(self):
        r = _get("/products/sculpt-shorts", GOOGLEBOT_UA)
        assert r.status_code == 200, f"status={r.status_code}"
        html = r.text
        assert "You need to enable JavaScript" not in html
        title = _extract_title(html)
        assert title and "Sculptiva" in title, f"unexpected title: {title}"
        # product name should appear in title
        assert re.search(r"sculpt", title, re.IGNORECASE), f"product name missing in title: {title}"
        desc = _extract_meta_desc(html)
        assert desc
        h1 = _extract_h1(html)
        assert h1, "missing h1"
        lds = _extract_ld_jsons(html)
        prod = next((o for o in lds if o.get("@type") == "Product"), None)
        assert prod is not None, "missing Product JSON-LD"
        offers = prod.get("offers")
        assert offers, "missing offers"
        # offers may be dict or list
        if isinstance(offers, list):
            offers = offers[0]
        assert offers.get("priceCurrency") == "GBP", f"currency={offers.get('priceCurrency')}"
        assert offers.get("price"), "missing price"
        avail = offers.get("availability", "")
        assert "InStock" in avail, f"availability={avail}"
        assert prod.get("aggregateRating"), "missing aggregateRating"


# -------------------- Uniqueness --------------------
class TestUniqueness:
    def test_home_collection_product_distinct(self):
        home = _get("/", GOOGLEBOT_UA).text
        coll = _get("/collections/leggings", GOOGLEBOT_UA).text
        prod = _get("/products/sculpt-shorts", GOOGLEBOT_UA).text
        titles = {_extract_title(home), _extract_title(coll), _extract_title(prod)}
        descs = {_extract_meta_desc(home), _extract_meta_desc(coll), _extract_meta_desc(prod)}
        h1s = {_extract_h1(home), _extract_h1(coll), _extract_h1(prod)}
        assert len(titles) == 3, f"titles not unique: {titles}"
        assert len(descs) == 3, f"descs not unique: {descs}"
        assert len(h1s) == 3, f"h1s not unique: {h1s}"


# -------------------- Robots --------------------
class TestRobots:
    def test_robots_txt(self):
        r = requests.get(BASE_URL + "/robots.txt", timeout=TIMEOUT)
        assert r.status_code == 200, f"status={r.status_code}"
        body = r.text
        assert "<html" not in body.lower(), "robots.txt served SPA HTML"
        assert body.lstrip().startswith("User-agent: *"), f"unexpected body start: {body[:120]}"
        assert "Allow: /" in body
        assert "Sitemap:" in body


# -------------------- Sitemap --------------------
class TestSitemap:
    def test_sitemap_xml(self):
        r = requests.get(BASE_URL + "/sitemap.xml", timeout=TIMEOUT)
        assert r.status_code == 200
        body = r.text
        assert body.lstrip().startswith("<?xml"), f"unexpected start: {body[:80]}"
        assert "<urlset" in body
        locs = re.findall(r"<loc>([^<]+)</loc>", body)
        assert len(locs) >= 3, f"too few locs: {len(locs)}"
        assert any("/products/" in u for u in locs), "no product url in sitemap"
        assert any("/collections/" in u for u in locs), "no collection url in sitemap"


# -------------------- 404 --------------------
class TestNotFound:
    def test_nonexistent_product_returns_404(self):
        r = _get("/products/does-not-exist-xyz", GOOGLEBOT_UA)
        assert r.status_code == 404, f"expected 404, got {r.status_code}"
        title = _extract_title(r.text)
        assert title and "Page not found" in title, f"unexpected title: {title}"


# -------------------- Human user untouched --------------------
class TestHumanUntouched:
    def test_human_gets_spa_shell(self):
        r = _get("/products/sculpt-shorts", HUMAN_UA)
        assert r.status_code == 200
        html = r.text
        assert '<div id="root">' in html, "SPA root div missing for human"
        assert "You need to enable JavaScript to run this app." in html, "SPA noscript missing for human"
        # server-rendered product h1 should NOT be there
        h1 = _extract_h1(html)
        # SPA shell has no h1 in the initial HTML; and if it does it shouldn't be the SEO-rendered one
        assert not h1 or "Sculpt Shorts" not in (h1 or ""), f"SEO h1 leaked to human: {h1}"
