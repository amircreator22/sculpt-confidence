"""SEO verification for the 5 NEW blog posts + updated collection cross-links.

Covers:
- 5 new /blog/<slug> pages render unique crawler HTML with correct titles/H1 and JSON-LD.
- /blog index lists all 8 slugs.
- /sitemap.xml includes all 5 new slugs.
- /collections/squat-proof-leggings and /collections/high-waisted-gym-leggings link
  to all their curated articles (Related reading).
- Human UA on one new slug still returns SPA shell.
"""
import html as ihtml
import os
import re
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")

GOOGLEBOT = "Googlebot/2.1 (+http://www.google.com/bot.html)"
HUMAN_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)

NEW_POSTS = {
    "how-we-test-leggings-for-squat-proofing": {
        "title": "How We Test Our Leggings for Squat-Proofing | Sculptiva",
        "body_hint": "light box",
        "expect_faq": True,
    },
    "squat-proof-vs-see-through-how-to-tell-before-you-buy": {
        "title": "Squat-Proof vs See-Through: How to Tell Before You Buy | Sculptiva",
        "expect_faq": True,
    },
    "high-waisted-vs-mid-rise-leggings": {
        "title": "High-Waisted vs Mid-Rise Leggings: Which Is Right for You? | Sculptiva",
        "expect_faq": False,
    },
    "do-tummy-control-leggings-really-work": {
        "title": "Do Tummy Control Leggings Really Work? | Sculptiva",
        "expect_faq": False,
    },
    "how-to-measure-yourself-for-leggings-at-home": {
        "title": "How to Measure Yourself for Leggings at Home | Sculptiva",
        "expect_faq": False,
    },
}

ORIGINAL_SLUGS = [
    "what-makes-leggings-squat-proof",
    "what-is-a-scrunch-seam",
    "high-waisted-vs-tummy-control-leggings",
]

ALL_SLUGS = ORIGINAL_SLUGS + list(NEW_POSTS.keys())


def _get(path, ua):
    return requests.get(
        f"{BASE_URL}{path}",
        headers={"User-Agent": ua},
        timeout=30,
        allow_redirects=True,
    )


def _normalize(s):
    # decode HTML entities so &#x27; / &amp; match plain text
    return ihtml.unescape(s)


# ---- Individual new posts ----
def _assert_article(slug, meta):
    r = _get(f"/blog/{slug}", GOOGLEBOT)
    assert r.status_code == 200, f"{slug} -> {r.status_code}"
    html = r.text
    norm = _normalize(html)

    # Title
    title_m = re.search(r"<title[^>]*>(.*?)</title>", norm, re.IGNORECASE | re.DOTALL)
    assert title_m, f"{slug}: <title> missing"
    assert title_m.group(1).strip() == meta["title"], (
        f"{slug}: title mismatch -> {title_m.group(1).strip()!r}"
    )

    # H1 matches (loose - starts with same phrase before ' | Sculptiva')
    h1_m = re.search(r"<h1[^>]*>(.*?)</h1>", norm, re.IGNORECASE | re.DOTALL)
    assert h1_m, f"{slug}: <h1> missing"
    h1_text = re.sub(r"<[^>]+>", "", h1_m.group(1)).strip()
    title_head = meta["title"].split("|")[0].strip()
    # h1 usually is title without ' | Sculptiva'
    assert title_head.lower().startswith(h1_text.lower()[:20]) or h1_text.lower().startswith(
        title_head.lower()[:20]
    ), f"{slug}: h1 {h1_text!r} vs title {title_head!r}"

    # SPA shell must NOT be here
    assert "You need to enable JavaScript" not in html, f"{slug}: got SPA shell instead of SEO html"

    # JSON-LD blocks
    lds = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
    joined = "\n".join(lds)
    assert '"@type": "Article"' in joined or '"@type":"Article"' in joined, f"{slug}: Article JSON-LD missing"
    assert "datePublished" in joined, f"{slug}: datePublished missing"
    assert "author" in joined, f"{slug}: author missing"
    assert "BreadcrumbList" in joined, f"{slug}: BreadcrumbList missing"

    if meta.get("expect_faq"):
        assert "FAQPage" in joined, f"{slug}: FAQPage JSON-LD missing"
        assert re.search(r"Frequently asked questions", norm, re.IGNORECASE), (
            f"{slug}: FAQ section heading missing"
        )

    if meta.get("body_hint"):
        assert meta["body_hint"].lower() in norm.lower(), (
            f"{slug}: expected phrase {meta['body_hint']!r} in body"
        )

    return html, norm


def test_how_we_test_leggings():
    _assert_article(
        "how-we-test-leggings-for-squat-proofing",
        NEW_POSTS["how-we-test-leggings-for-squat-proofing"],
    )


def test_squat_proof_vs_see_through():
    _assert_article(
        "squat-proof-vs-see-through-how-to-tell-before-you-buy",
        NEW_POSTS["squat-proof-vs-see-through-how-to-tell-before-you-buy"],
    )


def test_high_waisted_vs_mid_rise():
    _assert_article(
        "high-waisted-vs-mid-rise-leggings",
        NEW_POSTS["high-waisted-vs-mid-rise-leggings"],
    )


def test_do_tummy_control_leggings_really_work():
    _assert_article(
        "do-tummy-control-leggings-really-work",
        NEW_POSTS["do-tummy-control-leggings-really-work"],
    )


def test_how_to_measure_yourself_at_home():
    _assert_article(
        "how-to-measure-yourself-for-leggings-at-home",
        NEW_POSTS["how-to-measure-yourself-for-leggings-at-home"],
    )


# ---- All titles/H1s unique across 8 posts ----
def test_all_titles_and_h1s_unique():
    titles, h1s = [], []
    for slug in ALL_SLUGS:
        r = _get(f"/blog/{slug}", GOOGLEBOT)
        assert r.status_code == 200, f"{slug} -> {r.status_code}"
        norm = _normalize(r.text)
        t = re.search(r"<title[^>]*>(.*?)</title>", norm, re.IGNORECASE | re.DOTALL)
        h = re.search(r"<h1[^>]*>(.*?)</h1>", norm, re.IGNORECASE | re.DOTALL)
        assert t and h, f"{slug} missing title/h1"
        titles.append(t.group(1).strip())
        h1s.append(re.sub(r"<[^>]+>", "", h.group(1)).strip())
    assert len(set(titles)) == len(titles), f"duplicate titles: {titles}"
    assert len(set(h1s)) == len(h1s), f"duplicate H1s: {h1s}"


# ---- /blog index lists all 8 ----
def test_blog_index_lists_all_eight():
    r = _get("/blog", GOOGLEBOT)
    assert r.status_code == 200
    html = r.text
    for slug in ALL_SLUGS:
        assert slug in html, f"index missing {slug}"
    assert "You need to enable JavaScript" not in html


# ---- Sitemap includes all 5 new ----
def test_sitemap_includes_new_posts():
    r = requests.get(f"{BASE_URL}/sitemap.xml", timeout=30)
    assert r.status_code == 200
    xml = r.text
    for slug in NEW_POSTS:
        assert f"/blog/{slug}" in xml, f"sitemap missing /blog/{slug}"
    # sanity: existing
    for slug in ORIGINAL_SLUGS:
        assert f"/blog/{slug}" in xml, f"sitemap missing existing /blog/{slug}"


# ---- Collection Related-reading cross-links ----
def test_collection_squat_proof_related_links():
    r = _get("/collections/squat-proof-leggings", GOOGLEBOT)
    assert r.status_code == 200
    html = r.text
    for slug in [
        "what-makes-leggings-squat-proof",
        "how-we-test-leggings-for-squat-proofing",
        "squat-proof-vs-see-through-how-to-tell-before-you-buy",
    ]:
        assert f"/blog/{slug}" in html, f"squat-proof collection missing link {slug}"


def test_collection_high_waisted_related_links():
    r = _get("/collections/high-waisted-gym-leggings", GOOGLEBOT)
    assert r.status_code == 200
    html = r.text
    for slug in [
        "high-waisted-vs-tummy-control-leggings",
        "high-waisted-vs-mid-rise-leggings",
        "do-tummy-control-leggings-really-work",
    ]:
        assert f"/blog/{slug}" in html, f"high-waisted collection missing link {slug}"


# ---- Human still gets SPA shell for a new post ----
def test_human_gets_spa_shell_on_new_post():
    r = _get("/blog/do-tummy-control-leggings-really-work", HUMAN_UA)
    assert r.status_code == 200
    html = r.text
    assert '<div id="root">' in html
    assert "You need to enable JavaScript to run this app." in html
