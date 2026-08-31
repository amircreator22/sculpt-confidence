"""Sculptiva backend regression suite — LIVE Shopify catalog mode.

Covers: /api/shop/status, /api/products (+filters), /api/products/{handle},
/api/checkout (live + sample), /api/orders/track, /api/newsletter, /api/reviews.
"""
import os

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL is missing")
BASE_URL = base_url.rstrip("/")

SHOP_DOMAIN = "uej6f0-ei.myshopify.com"

EXPECTED = {
    "glute-sculpt-leggings": ("leggings", 44.0, 56.0, 3),
    "seamless-sculpt-leggings": ("leggings", 46.0, 58.0, 3),
    "sculpt-shorts": ("shorts", 32.0, 40.0, 3),
    "ribbed-sculpt-shorts": ("shorts", 34.0, None, 3),
    "sculpt-sports-bra": ("bras", 36.0, 44.0, 3),
    "sculpt-longline-bra": ("bras", 38.0, None, 3),
    "sculptflex-contour-leggings": ("leggings", 39.99, 54.99, 4),
    "resistance-band-bundle": ("accessories", 24.0, 32.0, 3),
}


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def products(client):
    r = client.get(f"{BASE_URL}/api/products", timeout=60)
    assert r.status_code == 200, r.text[:300]
    body = r.json()
    assert body["mode"] == "live"
    return body["products"]


# ---------- /api/shop/status ----------
class TestShopStatus:
    def test_live_and_connected(self, client):
        r = client.get(f"{BASE_URL}/api/shop/status", timeout=60)
        assert r.status_code == 200
        d = r.json()
        assert d["mode"] == "live"
        assert d["catalog_mode_setting"] == "live"
        assert d["connected"] is True
        assert d["shop_domain"] == SHOP_DOMAIN
        assert d["live_product_count"] == 8
        assert d["error"] is None


# ---------- /api/products ----------
class TestCatalog:
    def test_eight_sculptiva_products(self, products):
        handles = sorted(p["handle"] for p in products)
        assert len(products) == 8
        assert handles == sorted(EXPECTED)

    def test_no_aquapure_or_lumora(self, products):
        blob = str(products).lower()
        assert "aquapure" not in blob
        assert "lumora" not in blob

    def test_all_source_shopify_and_cdn_images(self, products):
        for p in products:
            assert p["source"] == "shopify", p["handle"]
            assert str(p["id"]).startswith("gid://shopify/Product/")
            assert p["images"], p["handle"]
            for img in p["images"]:
                assert img.startswith("https://cdn.shopify.com/"), (p["handle"], img)

    def test_no_mongo_id_leak(self, products):
        for p in products:
            assert "_id" not in p

    def test_prices_and_categories(self, products):
        by_handle = {p["handle"]: p for p in products}
        for handle, (cat, price, compare, ncol) in EXPECTED.items():
            p = by_handle[handle]
            assert p["category"] == cat, handle
            assert p["price"] == pytest.approx(price), handle
            if compare is None:
                assert p["compare_at"] is None, handle
            else:
                assert p["compare_at"] == pytest.approx(compare), handle
            assert p["currency"] == "GBP"

    def test_colour_sets_four_images_each(self, products):
        by_handle = {p["handle"]: p for p in products}
        for handle, (_, _, _, ncol) in EXPECTED.items():
            colours = by_handle[handle]["colours"]
            assert colours is not None and len(colours) == ncol, handle
            for c in colours:
                assert len(c["images"]) == 4, (handle, c["name"])
                assert c["hex"].startswith("#") and c["hex"] != "#999999", (handle, c["name"])

    def test_variants_have_gid_and_options(self, products):
        for p in products:
            assert p["variants"], p["handle"]
            for v in p["variants"]:
                assert str(v["id"]).startswith("gid://shopify/ProductVariant/")
                assert "colour" in v["options"] and "size" in v["options"]
            n_expected = len(p["colours"]) * len(p["sizes"])
            assert len(p["variants"]) == n_expected, p["handle"]

    def test_band_bundle_one_size(self, products):
        band = next(p for p in products if p["handle"] == "resistance-band-bundle")
        assert band["sizes"] == ["One Size"]
        assert len(band["variants"]) == 3
        assert {v["options"]["colour"] for v in band["variants"]} == {
            "Blush Tones", "Neutral Tones", "Midnight Tones"}

    def test_review_counts_present(self, products):
        by_handle = {p["handle"]: p for p in products}
        assert by_handle["glute-sculpt-leggings"]["reviews_count"] == 231
        for p in products:
            assert p["reviews_count"] > 0, p["handle"]
            assert 4.0 <= p["rating"] <= 5.0

    @pytest.mark.parametrize("category,count", [
        ("leggings", 3), ("shorts", 2), ("bras", 2), ("accessories", 1)])
    def test_category_filter(self, client, category, count):
        r = client.get(f"{BASE_URL}/api/products", params={"category": category}, timeout=60)
        assert r.status_code == 200
        items = r.json()["products"]
        assert len(items) == count
        assert all(i["category"] == category for i in items)

    def test_featured_filter(self, client):
        r = client.get(f"{BASE_URL}/api/products", params={"featured": "true"}, timeout=60)
        assert r.status_code == 200
        assert all(p["featured"] for p in r.json()["products"])


# ---------- /api/products/{handle} ----------
class TestProductDetail:
    def test_detail_and_related(self, client):
        r = client.get(f"{BASE_URL}/api/products/glute-sculpt-leggings", timeout=60)
        assert r.status_code == 200
        d = r.json()
        assert d["mode"] == "live"
        assert d["product"]["handle"] == "glute-sculpt-leggings"
        assert d["product"]["price"] == pytest.approx(44.0)
        assert len(d["related"]) == 4
        assert all(rp["handle"] != "glute-sculpt-leggings" for rp in d["related"])

    def test_unknown_handle_404(self, client):
        r = client.get(f"{BASE_URL}/api/products/glute-sculpt-leggings-charcoal", timeout=60)
        assert r.status_code == 404

    def test_all_handles_resolve(self, client):
        for handle in EXPECTED:
            r = client.get(f"{BASE_URL}/api/products/{handle}", timeout=60)
            assert r.status_code == 200, handle


# ---------- /api/checkout ----------
class TestCheckout:
    def test_live_variant_returns_shopify_checkout_url(self, client, products):
        glute = next(p for p in products if p["handle"] == "glute-sculpt-leggings")
        variant = next(v for v in glute["variants"]
                       if v["options"]["colour"] == "Obsidian Black" and v["options"]["size"] == "M")
        r = client.post(f"{BASE_URL}/api/checkout",
                        json={"items": [{"variant_id": variant["id"], "quantity": 1}]}, timeout=60)
        assert r.status_code == 200, r.text[:300]
        d = r.json()
        assert d["mode"] == "live", d
        assert d["url"] and d["url"].startswith(f"https://{SHOP_DOMAIN}/cart/c/"), d

    def test_multi_line_checkout(self, client, products):
        band = next(p for p in products if p["handle"] == "resistance-band-bundle")
        bra = next(p for p in products if p["handle"] == "sculpt-sports-bra")
        lines = [
            {"variant_id": band["variants"][0]["id"], "quantity": 2},
            {"variant_id": bra["variants"][0]["id"], "quantity": 1},
        ]
        r = client.post(f"{BASE_URL}/api/checkout", json={"items": lines}, timeout=60)
        assert r.status_code == 200
        d = r.json()
        assert d["mode"] == "live"
        assert f"https://{SHOP_DOMAIN}/cart/c/" in d["url"]

    def test_null_variant_falls_back_to_sample(self, client):
        r = client.post(f"{BASE_URL}/api/checkout",
                        json={"items": [{"variant_id": None, "quantity": 1}]}, timeout=60)
        assert r.status_code == 200
        assert r.json() == {"url": None, "mode": "sample"}

    def test_bogus_variant_falls_back(self, client):
        r = client.post(f"{BASE_URL}/api/checkout",
                        json={"items": [{"variant_id": "gid://shopify/ProductVariant/1", "quantity": 1}]},
                        timeout=60)
        assert r.status_code == 200
        assert r.json()["url"] is None

    def test_empty_items(self, client):
        r = client.post(f"{BASE_URL}/api/checkout", json={"items": []}, timeout=60)
        assert r.status_code == 200
        assert r.json()["url"] is None


# ---------- /api/orders/track ----------
class TestTrackOrder:
    def test_track_unknown_order(self, client):
        r = client.post(f"{BASE_URL}/api/orders/track",
                        json={"order_number": "1001", "email": "qa@example.com"}, timeout=60)
        assert r.status_code == 200, r.text[:300]
        d = r.json()
        assert d.get("available") is True, f"admin token/order API unavailable: {d}"
        assert d.get("found") is False

    def test_track_hash_prefix_accepted(self, client):
        r = client.post(f"{BASE_URL}/api/orders/track",
                        json={"order_number": "#1001", "email": "qa@example.com"}, timeout=60)
        assert r.status_code == 200
        assert r.json().get("available") is True

    def test_track_invalid_email_422(self, client):
        r = client.post(f"{BASE_URL}/api/orders/track",
                        json={"order_number": "1001", "email": "not-an-email"}, timeout=60)
        assert r.status_code == 422

    def test_track_empty_number_422(self, client):
        r = client.post(f"{BASE_URL}/api/orders/track",
                        json={"order_number": "  ", "email": "qa@example.com"}, timeout=60)
        assert r.status_code == 422


# ---------- /api/newsletter, /api/contact, /api/reviews ----------
class TestMisc:
    def test_newsletter_signup_and_idempotency(self, client):
        email = "TEST_qa_live@example.com"
        r = client.post(f"{BASE_URL}/api/newsletter", json={"email": email, "source": "pytest"}, timeout=30)
        assert r.status_code == 200
        assert r.json()["ok"] is True
        assert r.json()["discount_code"] == "SCULPTIVA10"
        r2 = client.post(f"{BASE_URL}/api/newsletter", json={"email": email}, timeout=30)
        assert r2.status_code == 200
        assert "already" in r2.json()["message"].lower()

    def test_newsletter_invalid_email(self, client):
        r = client.post(f"{BASE_URL}/api/newsletter", json={"email": "bad"}, timeout=30)
        assert r.status_code == 422

    def test_contact_validation(self, client):
        r = client.post(f"{BASE_URL}/api/contact",
                        json={"name": "", "email": "a@b.com", "message": "hi"}, timeout=30)
        assert r.status_code == 422

    def test_reviews_by_handle(self, client):
        r = client.get(f"{BASE_URL}/api/reviews", params={"product_handle": "glute-sculpt-leggings"}, timeout=30)
        assert r.status_code == 200
        reviews = r.json()["reviews"]
        assert len(reviews) > 0
        assert all(rv["product_handle"] == "glute-sculpt-leggings" for rv in reviews)
