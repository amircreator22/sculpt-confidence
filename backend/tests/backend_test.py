"""Catalog / gallery regression tests (Confidence Sculpt sample catalog mode)."""
import os

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL is missing from env and /app/frontend/.env")
BASE_URL = base_url.rstrip("/")

EXPECTED_COLOUR_COUNTS = {
    "glute-sculpt-leggings": 3,
    "seamless-sculpt-leggings": 3,
    "sculpt-shorts": 3,
    "ribbed-sculpt-shorts": 3,
    "sculpt-sports-bra": 3,
    "sculpt-longline-bra": 3,
    "sculptflex-contour-leggings": 4,
    "resistance-band-bundle": 3,
}


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"User-Agent": "Mozilla/5.0 QA"})
    return s


@pytest.fixture(scope="session")
def products(client):
    r = client.get(f"{BASE_URL}/api/products", timeout=30)
    assert r.status_code == 200, r.text[:300]
    data = r.json()
    assert "products" in data
    return data["products"]


# --- Catalog shape ---
class TestCatalog:
    def test_eight_products_and_handles(self, products):
        assert len(products) == 8
        assert {p["handle"] for p in products} == set(EXPECTED_COLOUR_COUNTS)

    def test_merged_handle_removed(self, client, products):
        assert "glute-sculpt-leggings-charcoal" not in {p["handle"] for p in products}
        r = client.get(f"{BASE_URL}/api/products/glute-sculpt-leggings-charcoal", timeout=30)
        assert r.status_code == 404

    def test_no_mongo_object_id_leak(self, products):
        for p in products:
            assert "_id" not in p

    def test_colour_sets(self, products):
        for p in products:
            cols = p.get("colours") or []
            assert len(cols) == EXPECTED_COLOUR_COUNTS[p["handle"]], p["handle"]
            for c in cols:
                assert c.get("name")
                assert len(c["images"]) == 4, (p["handle"], c["name"])
                for img in c["images"]:
                    assert img.startswith(f"/catalog/{p['handle']}/") or img.startswith("/sculptflex/studio/"), img

    def test_sculptflex_keeps_videos(self, products):
        sf = next(p for p in products if p["handle"] == "sculptflex-contour-leggings")
        assert len(sf.get("videos") or []) == 3

    def test_band_bundle_one_size_tone_colours(self, products):
        b = next(p for p in products if p["handle"] == "resistance-band-bundle")
        assert b["sizes"] == ["One Size"]
        assert [c["name"] for c in b["colours"]] == ["Blush Tones", "Neutral Tones", "Midnight Tones"]


# --- Static image availability ---
class TestGalleryImages:
    def test_all_colour_images_served(self, client, products):
        broken = []
        for p in products:
            urls = [i for c in (p.get("colours") or []) for i in c["images"]] + list(p.get("images") or [])
            for u in set(urls):
                r = client.get(BASE_URL + u, timeout=30)
                if r.status_code != 200 or "image" not in r.headers.get("content-type", ""):
                    broken.append((u, r.status_code, r.headers.get("content-type")))
        assert not broken, broken

    def test_product_detail_endpoint(self, client):
        r = client.get(f"{BASE_URL}/api/products/glute-sculpt-leggings", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["product"]["handle"] == "glute-sculpt-leggings"
        assert [c["name"] for c in d["product"]["colours"]] == ["Blush Pink", "Obsidian Black", "Charcoal Grey"]
        assert isinstance(d.get("related"), list)
