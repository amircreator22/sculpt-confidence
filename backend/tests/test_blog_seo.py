"""SEO verification for blog pages via preview base URL."""
import os
import re
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://sculpt-confidence-1.preview.emergentagent.com").rstrip("/")

GOOGLEBOT = "Googlebot/2.1 (+http://www.google.com/bot.html)"
HUMAN_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

SLUGS = [
    "what-makes-leggings-squat-proof",
    "what-is-a-scrunch-seam",
    "high-waisted-vs-tummy-control-leggings",
]


def _get(path, ua):
    return requests.get(f"{BASE_URL}{path}", headers={"User-Agent": ua}, timeout=30, allow_redirects=True)


# --- Blog index for crawler ---
def test_blog_index_crawler():
    r = _get("/blog", GOOGLEBOT)
    assert r.status_code == 200, r.status_code
    html = r.text
    assert "The Sculptiva Journal" in html
    assert "<h1" in html.lower()
    for slug in SLUGS:
        assert slug in html, f"missing slug {slug}"
    assert "You need to enable JavaScript" not in html


# --- Article 1 ---
def test_article_squat_proof():
    r = _get(f"/blog/{SLUGS[0]}", GOOGLEBOT)
    assert r.status_code == 200
    html = r.text
    # Title (may have HTML-escaped chars)
    assert "What Makes Leggings Squat Proof" in html
    assert "Sculptiva" in html
    # H1
    assert re.search(r"<h1[^>]*>.*Squat Proof.*</h1>", html, re.IGNORECASE | re.DOTALL), "H1 missing"
    # Body phrase (case-insensitive), account for possible &#x27; and &amp;
    body_norm = re.sub(r"&#x27;|&apos;|&#39;", "'", html)
    body_norm = body_norm.replace("&amp;", "&")
    # Account for HTML-escaped quotes between "proof" and "gets"
    assert re.search(r"squat proof.{0,20}gets printed on a lot of leggings", body_norm, re.IGNORECASE | re.DOTALL)
    # FAQ section
    assert re.search(r"Frequently asked questions", html, re.IGNORECASE)
    # JSON-LD blocks
    lds = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
    joined = "\n".join(lds)
    assert '"@type": "Article"' in joined or '"@type":"Article"' in joined
    assert "datePublished" in joined
    assert "author" in joined
    assert "FAQPage" in joined
    assert "BreadcrumbList" in joined


# --- Article 2 unique ---
def test_article_scrunch_seam_unique():
    r = _get(f"/blog/{SLUGS[1]}", GOOGLEBOT)
    assert r.status_code == 200
    html = r.text
    assert "What Is a Scrunch Seam" in html
    assert "Scrunch Bum Leggings" in html
    assert "Sculptiva" in html
    lds = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
    joined = " ".join(lds)
    assert "Article" in joined
    # Ensure H1 differs from other articles
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.IGNORECASE | re.DOTALL)
    assert h1 and "Squat Proof" not in h1.group(1) and "Tummy Control" not in h1.group(1)


# --- Article 3 unique ---
def test_article_tummy_control_unique():
    r = _get(f"/blog/{SLUGS[2]}", GOOGLEBOT)
    assert r.status_code == 200
    html = r.text
    assert "High-Waisted" in html or "High Waisted" in html or "high-waisted" in html.lower()
    assert "Tummy Control" in html or "tummy control" in html.lower()
    lds = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
    joined = " ".join(lds)
    assert "Article" in joined
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.IGNORECASE | re.DOTALL)
    assert h1 and "Squat Proof" not in h1.group(1) and "Scrunch Seam" not in h1.group(1)


# --- 404 ---
def test_article_404():
    r = _get("/blog/this-article-does-not-exist", GOOGLEBOT)
    assert r.status_code == 404, f"got {r.status_code}"


# --- Sitemap ---
def test_sitemap_includes_blog():
    r = requests.get(f"{BASE_URL}/sitemap.xml", timeout=30)
    assert r.status_code == 200
    xml = r.text
    assert "<urlset" in xml or "<sitemapindex" in xml
    assert "/blog" in xml
    for slug in SLUGS:
        assert f"/blog/{slug}" in xml, f"sitemap missing {slug}"


# --- Human gets SPA shell ---
def test_human_gets_spa_shell():
    r = _get(f"/blog/{SLUGS[0]}", HUMAN_UA)
    assert r.status_code == 200
    html = r.text
    assert '<div id="root">' in html
    assert "You need to enable JavaScript to run this app." in html


# --- Cross-linking from collection page ---
def test_collection_links_to_blog():
    r = _get("/collections/squat-proof-leggings", GOOGLEBOT)
    assert r.status_code == 200
    assert "/blog/what-makes-leggings-squat-proof" in r.text
