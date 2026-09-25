"""Custom commerce layer: products, orders, inventory.

Replaces the Shopify Storefront/Admin API calls that used to live in
server.py. Everything here reads/writes MongoDB directly via the same
AsyncIOMotorDatabase instance server.py already creates.
"""
import json
import uuid
from datetime import datetime, timezone
from typing import Optional 
from sample_data import SAMPLE_REVIEWS


def _build_review_stats() -> dict:
    stats: dict = {}
    for r in SAMPLE_REVIEWS:
        handle = r.get("product_handle")
        if handle:
            stats.setdefault(handle, []).append(r.get("rating", 5))
    return {h: (len(v), round(sum(v) / len(v), 1)) for h, v in stats.items()}


REVIEW_STATS = _build_review_stats()

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


PALETTE = {
    "Blush Pink": "#E8B4B8", "Obsidian Black": "#111111", "Charcoal Grey": "#5A5A5A",
    "Mocha Brown": "#6F4E37", "Deep Navy": "#1B2951",
}


def _category_for(product_type: str, handle: str) -> str:
    ptype = (product_type or "").lower()
    if "bra" in ptype or "bra" in handle:
        return "bras"
    if "short" in ptype or "short" in handle:
        return "shorts"
    if "band" in ptype or "accessor" in ptype or "bundle" in handle:
        return "accessories"
    return "leggings"


def to_frontend_shape(p: dict) -> dict:
    """Reshape a stored product doc into exactly what the React frontend
    already expects (same shape the old Shopify transform produced), so
    the frontend needs no changes for product display — only checkout
    changes."""
    variants = p.get("variants", [])
    first = variants[0] if variants else {}
    images = [(img["url"], img.get("alt", "")) for img in p.get("images", [])]
    colour_groups: dict = {}
    colour_names = sorted(PALETTE.keys(), key=len, reverse=True)
    for url, alt in images:
        cname = next((c for c in colour_names if alt.startswith(c)), None)
        if cname is None and " — " in alt:
            cname = alt.split(" — ")[0]
        if cname:
            colour_groups.setdefault(cname, []).append(url)
    colours = None
    if len(colour_groups) > 1:
        colour_order = []
        for v in variants:
            c = v.get("options", {}).get("Colour") or v.get("options", {}).get("Color")
            if c and c not in colour_order:
                colour_order.append(c)
        names = [n for n in colour_order if n in colour_groups] or list(colour_groups)
        colours = [{"name": n, "hex": PALETTE.get(n, "#999999"), "images": colour_groups[n]} for n in names]
    sizes = sorted({v.get("options", {}).get("Size") for v in variants if v.get("options", {}).get("Size")},
                   key=lambda s: ["XS", "S", "M", "L", "XL", "XXL"].index(s) if s in ["XS", "S", "M", "L", "XL", "XXL"] else 99)
    tags = [t.lower() for t in p.get("tags", [])]
    return {
        "id": p["handle"],
        "handle": p["handle"],
        "title": p["title"],
        "category": _category_for(p.get("product_type", ""), p["handle"]),
        "price": first.get("price", 0.0),
        "compare_at": first.get("compare_at_price"),
        "currency": "GBP",
        "description": p.get("description", ""),
        "images": colours[0]["images"] if colours else [u for u, _ in images],
        "colours": colours,
        "sizes": sizes or ["XS", "S", "M", "L", "XL"],
        "rating": REVIEW_STATS[p["handle"]][1] if p["handle"] in REVIEW_STATS else p.get("rating", 4.9),
        "reviews_count": REVIEW_STATS[p["handle"]][0] if p["handle"] in REVIEW_STATS else p.get("reviews_count", 0),
        "featured": "featured" in tags,
        "bestseller": "bestseller" in tags,
        "variant_id": first.get("variant_id"),
        "variants": [
            {
                "id": v["variant_id"],
                "title": v["title"],
                "available": v.get("inventory_quantity", 0) > 0,
                "options": {k.lower(): val for k, val in v.get("options", {}).items()},
            }
            for v in variants
        ],
        "source": "custom",
    }


# ---------------- Products ----------------

async def seed_products_if_empty(db, seed_path: str) -> int:
    """Load products_seed.json into the products collection on first run."""
    count = await db.products.count_documents({})
    if count > 0:
        return count
    with open(seed_path) as f:
        products = json.load(f)
    if products:
        await db.products.insert_many(products)
    return len(products)


async def sync_image_fixes_from_seed(db, seed_path: str) -> int:
    """Repair already-seeded products whose images still point at the wrong
    external CDN (leftover placeholder photos from initial setup, one of
    which carried a visible stock-photo watermark). Safe to run on every
    startup: it only overwrites a product's `images` field, and only when
    the stored images differ from the seed file's version.
    """
    with open(seed_path) as f:
        seed_products = json.load(f)

    fixed = 0
    for seed_p in seed_products:
        handle = seed_p.get("handle")
        seed_images = seed_p.get("images")
        if not handle or not seed_images:
            continue
        current = await db.products.find_one({"handle": handle}, {"images": 1})
        if not current:
            continue
        if current.get("images") != seed_images:
            await db.products.update_one(
                {"handle": handle},
                {"$set": {"images": seed_images, "updated_at": now_iso()}},
            )
            fixed += 1
    return fixed


async def list_products(db, category: Optional[str] = None) -> list:
    query: dict = {"status": "active"}
    cursor = db.products.find(query, {"_id": 0})
    products = [p async for p in cursor]
    if category:
        products = [p for p in products if _category_for(p.get("product_type", ""), p["handle"]) == category]
    return products


async def get_product(db, handle: str) -> Optional[dict]:
    return await db.products.find_one({"handle": handle}, {"_id": 0})


async def get_variant(db, handle: str, variant_id: str) -> Optional[dict]:
    product = await get_product(db, handle)
    if not product:
        return None
    for v in product["variants"]:
        if v["variant_id"] == variant_id:
            return v
    return None


async def find_variant_anywhere(db, variant_id: str):
    """Find a (product, variant) pair by variant_id alone, for checkout."""
    product = await db.products.find_one({"variants.variant_id": variant_id}, {"_id": 0})
    if not product:
        return None, None
    for v in product["variants"]:
        if v["variant_id"] == variant_id:
            return product, v
    return None, None


async def decrement_stock(db, handle: str, variant_id: str, quantity: int) -> bool:
    """Atomically reduce stock; fails (returns False) if not enough left."""
    result = await db.products.update_one(
        {
            "handle": handle,
            "variants.variant_id": variant_id,
            "variants.inventory_quantity": {"$gte": quantity},
        },
        {
            "$inc": {"variants.$.inventory_quantity": -quantity},
            "$set": {"updated_at": now_iso()},
        },
    )
    return result.modified_count == 1


async def restock(db, handle: str, variant_id: str, quantity: int) -> bool:
    result = await db.products.update_one(
        {"handle": handle, "variants.variant_id": variant_id},
        {"$inc": {"variants.$.inventory_quantity": quantity}, "$set": {"updated_at": now_iso()}},
    )
    return result.modified_count == 1


async def set_stock(db, handle: str, variant_id: str, quantity: int) -> bool:
    result = await db.products.update_one(
        {"handle": handle, "variants.variant_id": variant_id},
        {"$set": {"variants.$.inventory_quantity": quantity, "updated_at": now_iso()}},
    )
    return result.modified_count == 1


# ---------------- Orders ----------------

async def create_pending_order(db, *, items: list, subtotal: float, shipping: float,
                                total: float, currency: str, email: str,
                                shipping_address: dict, payment_intent_id: str) -> str:
    order_id = f"SC-{uuid.uuid4().hex[:8].upper()}"
    doc = {
        "order_id": order_id,
        "items": items,
        "subtotal": subtotal,
        "shipping": shipping,
        "total": total,
        "currency": currency,
        "email": email.strip().lower(),
        "shipping_address": shipping_address,
        "payment_intent_id": payment_intent_id,
        "payment_status": "pending",
        "fulfillment_status": "unfulfilled",
        "created_at": now_iso(),
    }
    await db.orders.insert_one(doc)
    return order_id


async def find_order_by_payment_intent(db, payment_intent_id: str) -> Optional[dict]:
    return await db.orders.find_one({"payment_intent_id": payment_intent_id}, {"_id": 0})


async def mark_order_paid(db, payment_intent_id: str) -> Optional[dict]:
    order = await find_order_by_payment_intent(db, payment_intent_id)
    if not order or order.get("payment_status") == "paid":
        return order  # already processed or unknown — webhook may retry, this makes it idempotent
    await db.orders.update_one(
        {"payment_intent_id": payment_intent_id},
        {"$set": {"payment_status": "paid", "paid_at": now_iso()}},
    )
    for item in order["items"]:
        await decrement_stock(db, item["handle"], item["variant_id"], item["quantity"])
    order["payment_status"] = "paid"
    return order


async def get_order(db, order_id: str) -> Optional[dict]:
    return await db.orders.find_one({"order_id": order_id}, {"_id": 0})


async def find_order_for_tracking(db, order_id: str, email: str) -> Optional[dict]:
    return await db.orders.find_one(
        {"order_id": order_id.upper(), "email": email.strip().lower()}, {"_id": 0}
    )


async def list_orders(db, limit: int = 200) -> list:
    cursor = db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
    return [o async for o in cursor]


async def update_fulfillment(db, order_id: str, status: str, tracking_number: Optional[str] = None) -> bool:
    update: dict = {"fulfillment_status": status, "updated_at": now_iso()}
    if tracking_number:
        update["tracking_number"] = tracking_number
    result = await db.orders.update_one({"order_id": order_id}, {"$set": update})
    return result.modified_count == 1
