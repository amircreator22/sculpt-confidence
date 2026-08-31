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
SHOPIFY_STOREFRONT_TOKEN = os.environ.get('SHOPIFY_STOREFRONT_TOKEN', '')
SHOPIFY_CATALOG_MODE = os.environ.get('SHOPIFY_CATALOG_MODE', 'sample')
SHOPIFY_API_VERSION = '2024-10'
STOREFRONT_URL = f"https://{SHOPIFY_DOMAIN}/api/{SHOPIFY_API_VERSION}/graphql.json"
STOREFRONT_HEADERS = {"X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN, "Content-Type": "application/json"}

app = FastAPI()
api_router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)

_cache = {"products": None, "ts": 0.0, "mode": "sample", "shop_name": None, "error": None, "live_count": None}
CACHE_TTL = 120

PRODUCTS_QUERY = """{
  shop { name }
  products(first: 100, query: "tag:sculptiva") {
    edges { node {
      id handle title description productType tags vendor
      options { name values }
      images(first: 50) { edges { node { url altText } } }
      variants(first: 100) { edges { node {
        id title availableForSale
        price { amount currencyCode }
        compareAtPrice { amount }
        selectedOptions { name value }
      } } }
    } }
  }
}"""

PALETTE = {
    "Blush Pink": "#E8B4B8", "Obsidian Black": "#111111", "Charcoal Grey": "#5A5A5A",
    "Mocha Brown": "#6F4E37", "Deep Navy": "#1B2951",
    "Blush Tones": "#E8B4B8", "Neutral Tones": "#C8B8A6", "Midnight Tones": "#3A3A3A",
}
_SAMPLE_META = {p['handle']: (p['rating'], p['reviews_count']) for p in SAMPLE_PRODUCTS}


async def _storefront_query(query: str, variables: dict | None = None):
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post(STOREFRONT_URL, json={"query": query, "variables": variables or {}}, headers=STOREFRONT_HEADERS)
    data = r.json()
    if r.status_code != 200 or 'errors' in data:
        raise RuntimeError(str(data.get('errors', r.text))[:200])
    return data['data']


def _transform_shopify_product(node: dict) -> dict:
    variants = [e['node'] for e in node['variants']['edges']]
    price = float(variants[0]['price']['amount']) if variants else 0.0
    currency = variants[0]['price']['currencyCode'] if variants else 'GBP'
    compare_at = None
    if variants and variants[0].get('compareAtPrice'):
        compare_at = float(variants[0]['compareAtPrice']['amount'])
    sizes = []
    for opt in node.get('options', []):
        if opt['name'].lower() in ('size', 'sizes'):
            sizes = opt['values']
    ptype = (node.get('productType') or '').lower()
    handle = node['handle']
    if 'bra' in ptype or 'bra' in handle:
        category = 'bras'
    elif 'short' in ptype or 'short' in handle:
        category = 'shorts'
    elif 'band' in ptype or 'accessor' in ptype or 'bundle' in handle:
        category = 'accessories'
    else:
        category = 'leggings'
    tags = [t.lower() for t in (node.get('tags') or [])]
    images = [(e['node']['url'], e['node'].get('altText') or '') for e in node['images']['edges']]
    colour_groups = {}
    for url, alt in images:
        cname = alt.split(' — ')[0] if ' — ' in alt else None
        if cname:
            colour_groups.setdefault(cname, []).append(url)
    colours = None
    if len(colour_groups) > 1:
        order = []
        for opt in node.get('options', []):
            if opt['name'].lower() in ('colour', 'color'):
                order = opt['values']
        names = [n for n in order if n in colour_groups] or list(colour_groups)
        colours = [{"name": n, "hex": PALETTE.get(n, "#999999"), "images": colour_groups[n]} for n in names]
    rating, reviews_count = _SAMPLE_META.get(handle, (4.9, 0))
    return {
        "id": node['id'],
        "handle": handle,
        "title": node['title'],
        "category": category,
        "price": price,
        "compare_at": compare_at,
        "currency": currency,
        "description": node.get('description') or '',
        "images": colours[0]['images'] if colours else [u for u, _ in images],
        "colours": colours,
        "sizes": sizes or ["XS", "S", "M", "L", "XL"],
        "rating": rating,
        "reviews_count": reviews_count,
        "featured": 'featured' in tags,
        "bestseller": 'bestseller' in tags,
        "variant_id": variants[0]['id'] if variants else None,
        "variants": [
            {"id": v['id'], "title": v['title'], "available": v['availableForSale'],
             "options": {o['name'].lower(): o['value'] for o in v['selectedOptions']}}
            for v in variants
        ],
        "source": "shopify",
    }


async def _check_connection():
    if not (SHOPIFY_DOMAIN and SHOPIFY_STOREFRONT_TOKEN):
        _cache.update(shop_name=None, live_count=None, error="Storefront token not configured")
        return False
    try:
        data = await _storefront_query('{ shop { name } products(first: 100, query: "tag:sculptiva") { edges { node { id } } } }')
        _cache.update(shop_name=data['shop']['name'], live_count=len(data['products']['edges']), error=None)
        return True
    except Exception as e:
        _cache.update(error=str(e)[:200])
        return False


async def _load_products(force: bool = False):
    now = time.time()
    if not force and _cache["products"] is not None and now - _cache["ts"] < CACHE_TTL:
        return _cache["products"]
    if SHOPIFY_CATALOG_MODE == 'live' and SHOPIFY_DOMAIN and SHOPIFY_STOREFRONT_TOKEN:
        try:
            data = await _storefront_query(PRODUCTS_QUERY)
            nodes = [e['node'] for e in data['products']['edges']]
            if nodes:
                products = [_transform_shopify_product(n) for n in nodes]
                _cache.update(products=products, ts=now, mode="live", shop_name=data['shop']['name'], error=None)
                return products
            _cache["error"] = "Shopify store has no products yet"
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
    connected = await _check_connection()
    await _load_products()
    return {
        "mode": _cache["mode"],
        "catalog_mode_setting": SHOPIFY_CATALOG_MODE,
        "shop_domain": SHOPIFY_DOMAIN or None,
        "shop_name": _cache["shop_name"],
        "connected": connected,
        "live_product_count": _cache["live_count"],
        "error": _cache["error"],
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


SHOPIFY_ADMIN_TOKEN = os.environ.get('SHOPIFY_ACCESS_TOKEN', '')


class TrackOrderRequest(BaseModel):
    order_number: str
    email: str


@api_router.post("/orders/track")
async def track_order(req: TrackOrderRequest):
    email = req.email.strip().lower()
    number = req.order_number.strip().lstrip('#')
    if not number or not EMAIL_RE.match(email):
        raise HTTPException(status_code=422, detail="Please enter your order number and a valid email")
    if not (SHOPIFY_DOMAIN and SHOPIFY_ADMIN_TOKEN):
        return {"available": False}
    url = f"https://{SHOPIFY_DOMAIN}/admin/api/{SHOPIFY_API_VERSION}/orders.json?name=%23{number}&status=any&fields=name,email,created_at,fulfillment_status,financial_status,order_status_url,line_items"
    try:
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.get(url, headers={"X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN})
        if r.status_code in (401, 403):
            return {"available": False}
        orders = r.json().get('orders', [])
    except Exception as e:
        logger.warning(f"Order lookup failed: {e}")
        return {"available": False}
    for o in orders:
        if (o.get('email') or '').lower() == email:
            return {
                "available": True,
                "found": True,
                "order": {
                    "name": o.get('name'),
                    "created_at": o.get('created_at'),
                    "fulfillment_status": o.get('fulfillment_status') or 'processing',
                    "financial_status": o.get('financial_status'),
                    "status_url": o.get('order_status_url'),
                    "items": [{"title": li.get('title'), "quantity": li.get('quantity')} for li in o.get('line_items', [])],
                },
            }
    return {"available": True, "found": False}


@api_router.get("/reviews")
async def list_reviews(product_handle: Optional[str] = None):
    if product_handle:
        return {"reviews": [r for r in SAMPLE_REVIEWS if r['product_handle'] == product_handle]}
    return {"reviews": SAMPLE_REVIEWS}


class CheckoutItem(BaseModel):
    variant_id: Optional[str] = None
    quantity: int = 1


class CheckoutRequest(BaseModel):
    items: List[CheckoutItem]


CART_CREATE = """mutation cartCreate($lines: [CartLineInput!]!) {
  cartCreate(input: { lines: $lines }) {
    cart { checkoutUrl }
    userErrors { message }
  }
}"""


@api_router.post("/checkout")
async def create_checkout(req: CheckoutRequest):
    items = [i for i in req.items if i.variant_id and i.quantity > 0]
    if items and len(items) == len(req.items) and SHOPIFY_DOMAIN and SHOPIFY_STOREFRONT_TOKEN:
        lines = [{"merchandiseId": str(i.variant_id), "quantity": i.quantity} for i in items]
        try:
            data = await _storefront_query(CART_CREATE, {"lines": lines})
            cart = data['cartCreate'].get('cart')
            if cart and cart.get('checkoutUrl'):
                return {"url": cart['checkoutUrl'], "mode": "live"}
            logger.warning(f"cartCreate errors: {data['cartCreate'].get('userErrors')}")
        except Exception as e:
            logger.warning(f"cartCreate failed: {e}")
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
