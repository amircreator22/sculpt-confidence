import os
import re
import time
import uuid
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, List

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from sample_data import SAMPLE_PRODUCTS, SAMPLE_REVIEWS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

SHOPIFY_DOMAIN = os.environ.get('SHOPIFY_SHOP_DOMAIN', '').replace('https://', '').replace('http://', '').strip('/')
SHOPIFY_TOKEN = os.environ.get('SHOPIFY_ACCESS_TOKEN', '')
SHOPIFY_API_VERSION = '2024-10'

app = FastAPI()
api_router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)

_cache = {"products": None, "ts": 0.0, "mode": "sample", "shop_name": None, "error": None}
CACHE_TTL = 120


def _transform_shopify_product(p: dict) -> dict:
    variants = p.get('variants', [])
    price = float(variants[0]['price']) if variants else 0.0
    compare_at = None
    if variants and variants[0].get('compare_at_price'):
        compare_at = float(variants[0]['compare_at_price'])
    sizes = []
    for opt in p.get('options', []):
        if opt.get('name', '').lower() in ('size', 'sizes'):
            sizes = opt.get('values', [])
    ptype = (p.get('product_type') or '').lower()
    handle = p.get('handle', '')
    if 'bra' in ptype or 'bra' in handle:
        category = 'bras'
    elif 'short' in ptype or 'short' in handle:
        category = 'shorts'
    elif 'band' in ptype or 'accessor' in ptype or 'bundle' in handle:
        category = 'accessories'
    else:
        category = 'leggings'
    tags = [t.strip().lower() for t in (p.get('tags') or '').split(',')]
    return {
        "id": str(p['id']),
        "handle": handle,
        "title": p.get('title', ''),
        "category": category,
        "price": price,
        "compare_at": compare_at,
        "currency": "GBP",
        "description": re.sub(r'<[^>]+>', '', p.get('body_html') or ''),
        "images": [img['src'] for img in p.get('images', [])],
        "sizes": sizes or ["XS", "S", "M", "L", "XL"],
        "rating": 4.9,
        "reviews_count": 0,
        "featured": 'featured' in tags,
        "bestseller": 'bestseller' in tags,
        "variant_id": variants[0]['id'] if variants else None,
        "source": "shopify",
    }


async def _load_products(force: bool = False):
    now = time.time()
    if not force and _cache["products"] is not None and now - _cache["ts"] < CACHE_TTL:
        return _cache["products"]
    if SHOPIFY_DOMAIN and SHOPIFY_TOKEN:
        try:
            url = f"https://{SHOPIFY_DOMAIN}/admin/api/{SHOPIFY_API_VERSION}/products.json?limit=250"
            headers = {"X-Shopify-Access-Token": SHOPIFY_TOKEN}
            async with httpx.AsyncClient(timeout=10) as c:
                r = await c.get(url, headers=headers)
                data = r.json()
            if r.status_code == 200 and 'products' in data and data['products']:
                products = [_transform_shopify_product(p) for p in data['products']]
                _cache.update(products=products, ts=now, mode="live", error=None)
                return products
            err = data.get('errors') if isinstance(data, dict) else r.text
            _cache["error"] = str(err)[:200]
        except Exception as e:
            _cache["error"] = str(e)[:200]
            logger.warning(f"Shopify fetch failed, serving sample catalog: {e}")
    _cache.update(products=SAMPLE_PRODUCTS, ts=now, mode="sample")
    return SAMPLE_PRODUCTS


@api_router.get("/")
async def root():
    return {"message": "Sculptiva API", "brand": "Sculptiva"}


@api_router.get("/shop/status")
async def shop_status():
    await _load_products()
    return {
        "mode": _cache["mode"],
        "shop_domain": SHOPIFY_DOMAIN or None,
        "connected": _cache["mode"] == "live",
        "error": _cache["error"] if _cache["mode"] == "sample" else None,
    }


@api_router.get("/products")
async def list_products(category: Optional[str] = None, featured: Optional[bool] = None):
    products = await _load_products()
    out = products
    if category:
        out = [p for p in out if p['category'] == category]
    if featured is not None:
        out = [p for p in out if p['featured'] == featured]
    return {"products": out, "mode": _cache["mode"]}


@api_router.get("/products/{handle}")
async def get_product(handle: str):
    products = await _load_products()
    for p in products:
        if p['handle'] == handle:
            related = [r for r in products if r['handle'] != handle and r['category'] == p['category']][:4]
            if len(related) < 4:
                related += [r for r in products if r['handle'] != handle and r not in related][:4 - len(related)]
            return {"product": p, "related": related, "mode": _cache["mode"]}
    raise HTTPException(status_code=404, detail="Product not found")


@api_router.get("/reviews")
async def list_reviews(product_handle: Optional[str] = None):
    if product_handle:
        return {"reviews": [r for r in SAMPLE_REVIEWS if r['product_handle'] == product_handle]}
    return {"reviews": SAMPLE_REVIEWS}


class CheckoutItem(BaseModel):
    variant_id: Optional[int] = None
    quantity: int = 1


class CheckoutRequest(BaseModel):
    items: List[CheckoutItem]


@api_router.post("/checkout")
async def create_checkout(req: CheckoutRequest):
    items = [i for i in req.items if i.variant_id and i.quantity > 0]
    if items and len(items) == len(req.items) and SHOPIFY_DOMAIN:
        parts = ",".join(f"{i.variant_id}:{i.quantity}" for i in items)
        return {"url": f"https://{SHOPIFY_DOMAIN}/cart/{parts}", "mode": "live"}
    return {"url": None, "mode": "sample"}


class NewsletterRequest(BaseModel):
    email: str
    source: str = "website"


EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')


@api_router.post("/newsletter")
async def subscribe_newsletter(req: NewsletterRequest):
    email = req.email.strip().lower()
    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=422, detail="Please enter a valid email address")
    existing = await db.newsletter_subscribers.find_one({"email": email})
    if existing:
        return {"ok": True, "message": "You're already part of the community", "discount_code": "SCULPTIVA10"}
    doc = {
        "id": str(uuid.uuid4()),
        "email": email,
        "source": req.source,
        "discount_code": "SCULPTIVA10",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.newsletter_subscribers.insert_one(doc)
    return {"ok": True, "message": "Welcome to the Sculptiva community", "discount_code": "SCULPTIVA10"}


class ContactRequest(BaseModel):
    name: str
    email: str
    message: str


@api_router.post("/contact")
async def send_contact(req: ContactRequest):
    if not req.name.strip() or not EMAIL_RE.match(req.email.strip()) or not req.message.strip():
        raise HTTPException(status_code=422, detail="Please complete all fields with a valid email")
    doc = {
        "id": str(uuid.uuid4()),
        "name": req.name.strip(),
        "email": req.email.strip().lower(),
        "message": req.message.strip(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.contact_messages.insert_one(doc)
    return {"ok": True, "message": "Message received — we reply within 24 hours"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
