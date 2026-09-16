"""Tests for newsletter popup discount and abandoned-cart tracking."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sculpt-confidence-1.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


def _email():
    return f"test_{uuid.uuid4().hex[:10]}@example.com"


# --- Newsletter source-based codes ---
class TestNewsletter:
    def test_popup_returns_sculptiva15(self):
        e = _email()
        r = requests.post(f"{API}/newsletter", json={"email": e, "source": "popup"}, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["ok"] is True
        assert data["discount_code"] == "SCULPTIVA15"

    def test_footer_returns_sculptiva10(self):
        e = _email()
        r = requests.post(f"{API}/newsletter", json={"email": e, "source": "footer"}, timeout=15)
        assert r.status_code == 200
        assert r.json()["discount_code"] == "SCULPTIVA10"

    def test_duplicate_returns_existing_code(self):
        e = _email()
        r1 = requests.post(f"{API}/newsletter", json={"email": e, "source": "popup"}, timeout=15)
        assert r1.status_code == 200
        code1 = r1.json()["discount_code"]
        # second call with footer source -- should return existing (popup) code, not new
        r2 = requests.post(f"{API}/newsletter", json={"email": e, "source": "footer"}, timeout=15)
        assert r2.status_code == 200
        assert r2.json()["discount_code"] == code1 == "SCULPTIVA15"

    def test_invalid_email_422(self):
        r = requests.post(f"{API}/newsletter", json={"email": "not-an-email", "source": "popup"}, timeout=15)
        assert r.status_code == 422


# --- Cart tracking ---
class TestCartTracking:
    def test_track_and_persist(self):
        e = _email()
        items = [{
            "handle": "sculpt-legging",
            "title": "Sculpt Legging",
            "price": 55.0, "qty": 2,
            "image": "/img/x.jpg", "size": "M", "colour": "Blush Pink",
        }]
        r = requests.post(f"{API}/cart/track", json={"email": e, "items": items}, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json()["ok"] is True

    def test_track_invalid_email_422(self):
        r = requests.post(f"{API}/cart/track", json={"email": "bad", "items": []}, timeout=15)
        assert r.status_code == 422

    def test_converted_unknown_ok(self):
        r = requests.post(f"{API}/cart/converted", json={"email": f"unknown_{uuid.uuid4().hex}@example.com"}, timeout=15)
        assert r.status_code == 200
        assert r.json()["ok"] is True

    def test_track_then_converted_flow(self):
        e = _email()
        items = [{"handle": "sculpt-bra", "title": "Sculpt Bra", "price": 40.0, "qty": 1,
                  "image": None, "size": "S", "colour": None}]
        r1 = requests.post(f"{API}/cart/track", json={"email": e, "items": items}, timeout=15)
        assert r1.status_code == 200
        r2 = requests.post(f"{API}/cart/converted", json={"email": e}, timeout=15)
        assert r2.status_code == 200
        assert r2.json()["ok"] is True


# --- Verify persistence via Mongo directly ---
class TestMongoPersistence:
    def test_abandoned_cart_document_shape(self):
        from motor.motor_asyncio import AsyncIOMotorClient
        import asyncio
        e = _email()
        items = [{"handle": "h1", "title": "T1", "price": 30.0, "qty": 3,
                  "image": None, "size": "L", "colour": "Obsidian Black"}]
        requests.post(f"{API}/cart/track", json={"email": e, "items": items}, timeout=15)

        async def fetch():
            c = AsyncIOMotorClient(os.environ['MONGO_URL'])
            doc = await c[os.environ['DB_NAME']].abandoned_carts.find_one({"email": e})
            c.close()
            return doc

        # load backend env
        from pathlib import Path
        from dotenv import load_dotenv
        load_dotenv(Path('/app/backend/.env'))

        doc = asyncio.get_event_loop().run_until_complete(fetch())
        assert doc is not None
        assert doc["email"] == e
        assert doc["reminder_sent"] is False
        assert doc["converted"] is False
        assert len(doc["items"]) == 1
        assert doc["items"][0]["size"] == "L"

        # convert
        requests.post(f"{API}/cart/converted", json={"email": e}, timeout=15)
        doc2 = asyncio.get_event_loop().run_until_complete(fetch())
        assert doc2["converted"] is True
