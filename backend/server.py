import os
import re
import time
import uuid
import asyncio
import logging
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import Optional, List

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, Response, Request, Depends
from fastapi.responses import HTMLResponse, PlainTextResponse
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from sample_data import SAMPLE_REVIEWS
import seo
import commerce
import stripe_payments
import emailer
import shopify_orders
import admin_auth

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)

EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')


@app.on_event("startup")
async def _seed_products_on_startup():
    seed_path = ROOT_DIR / "products_seed.json"
    if seed_path.exists():
        count = await commerce.seed_products_if_empty(db, str(seed_path))
        logger.info(f"Product catalog ready: {count} product(s) in database")
        fixed = await commerce.sync_image_fixes_from_seed(db, str(seed_path))
        if fixed:
            logger.info(f"Repaired images for {fixed} product(s) from seed file")


@api_router.get("/")
async def root():
    return {"message": "Sculptiva API", "brand": "Sculptiva"}


@api_router.get("/shop/status")
async def shop_status():
    count = await db.products.count_documents({"status": "active"})
    return {
        "mode": "custom",
        "product_count": count,
        "stripe_configured": stripe_payments.is_configured(),
    }


@api_router.get("/products")
async def list_products(category: Optional[str] = None, featured: Optional[bool] = None):
    products = await commerce.list_products(db, category=category)
    out = [commerce.to_frontend_shape(p) for p in products]
    if featured is not None:
        out = [p for p in out if p['featured'] == featured]
    return {"products": out, "mode": "custom"}


@api_router.get("/products/{handle}")
async def get_product(handle: str):
    product = await commerce.get_product(db, handle)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    p = commerce.to_frontend_shape(product)
    all_products = await commerce.list_products(db)
    related = [commerce.to_frontend_shape(r) for r in all_products
               if r['handle'] != handle and commerce._category_for(r.get('product_type', ''), r['handle']) == p['category']][:4]
    if len(related) < 4:
        extra = [commerce.to_frontend_shape(r) for r in all_products if r['handle'] != handle][:4 - len(related)]
        related += [e for e in extra if e['handle'] not in {r['handle'] for r in related}]
    return {"product": p, "related": related, "mode": "custom"}


class TrackOrderRequest(BaseModel):
    order_number: str
    email: str


@api_router.post("/orders/track")
async def track_order(req: TrackOrderRequest):
    email = req.email.strip().lower()
    number = req.order_number.strip().lstrip('#').upper()
    if not number or not EMAIL_RE.match(email):
        raise HTTPException(status_code=422, detail="Please enter your order number and a valid email")
    order = await commerce.find_order_for_tracking(db, number, email)
    if not order:
        return {"available": True, "found": False}
    return {
        "available": True,
        "found": True,
        "order": {
            "name": order["order_id"],
            "created_at": order["created_at"],
            "fulfillment_status": order.get("fulfillment_status", "unfulfilled"),
            "financial_status": order.get("payment_status", "pending"),
            "status_url": None,
            "items": [{"title": i["title"], "quantity": i["quantity"]} for i in order.get("items", [])],
        },
    }


@api_router.get("/reviews")
async def list_reviews(product_handle: Optional[str] = None):
    if product_handle:
        return {"reviews": [r for r in SAMPLE_REVIEWS if r['product_handle'] == product_handle]}
    return {"reviews": SAMPLE_REVIEWS}


FLAT_SHIPPING_GBP = float(os.environ.get('FLAT_SHIPPING_GBP', '3.99'))
FREE_SHIPPING_THRESHOLD_GBP = float(os.environ.get('FREE_SHIPPING_THRESHOLD_GBP', '50'))


class CheckoutItem(BaseModel):
    handle: str
    variant_id: str
    quantity: int = 1


class ShippingAddress(BaseModel):
    name: str
    line1: str
    line2: Optional[str] = None
    city: str
    postal_code: str
    country: str = "GB"


class CheckoutRequest(BaseModel):
    items: List[CheckoutItem]
    email: str
    shipping_address: ShippingAddress


@api_router.post("/checkout")
async def create_checkout(req: CheckoutRequest):
    """Creates a Stripe PaymentIntent for the cart and a pending order
    record. The frontend confirms payment with Stripe's Payment Element
    using the returned client_secret; the Stripe webhook then marks the
    order paid and decrements stock (see /webhooks/stripe below)."""
    if not stripe_payments.is_configured():
        raise HTTPException(status_code=503, detail="Payments are not configured yet")
    if not req.items:
        raise HTTPException(status_code=422, detail="Your cart is empty")
    if not EMAIL_RE.match(req.email.strip().lower()):
        raise HTTPException(status_code=422, detail="Please enter a valid email address")

    line_items = []
    subtotal = 0.0
    for item in req.items:
        if item.quantity < 1:
            continue
        product, variant = await commerce.find_variant_anywhere(db, item.variant_id)
        if not product or not variant:
            raise HTTPException(status_code=409, detail=f"One item in your cart is no longer available")
        if variant["inventory_quantity"] < item.quantity:
            raise HTTPException(status_code=409, detail=f"Only {variant['inventory_quantity']} left of {product['title']} ({variant['title']}) — please adjust your cart")
        line_total = variant["price"] * item.quantity
        subtotal += line_total
        line_items.append({
            "handle": product["handle"],
            "variant_id": variant["variant_id"],
            "title": product["title"],
            "variant_title": variant["title"],
            "price": variant["price"],
            "quantity": item.quantity,
        })

    if not line_items:
        raise HTTPException(status_code=422, detail="Your cart is empty")

    shipping = 0.0 if subtotal >= FREE_SHIPPING_THRESHOLD_GBP else FLAT_SHIPPING_GBP
    total = round(subtotal + shipping, 2)
    amount_minor = round(total * 100)

    intent = stripe_payments.create_payment_intent(
        amount_minor=amount_minor,
        currency="gbp",
        metadata={"email": req.email.strip().lower()},
        receipt_email=req.email.strip(),
    )

    order_id = await commerce.create_pending_order(
        db,
        items=line_items,
        subtotal=round(subtotal, 2),
        shipping=shipping,
        total=total,
        currency="gbp",
        email=req.email,
        shipping_address=req.shipping_address.dict(),
        payment_intent_id=intent.id,
    )

    return {
        "client_secret": intent.client_secret,
        "order_id": order_id,
        "subtotal": round(subtotal, 2),
        "shipping": shipping,
        "total": total,
    }


@api_router.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    try:
        event = stripe_payments.verify_webhook_event(payload, sig_header)
    except Exception as e:
        logger.warning(f"Stripe webhook signature verification failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        order = await commerce.mark_order_paid(db, intent["id"])
        if order:
            await emailer.send_order_confirmation(order)
            await shopify_orders.push_order_to_shopify(order)
        else:
            logger.warning(f"Stripe webhook: no matching order for payment_intent {intent['id']}")

    return {"received": True}


@api_router.get("/orders/{order_id}/status")
async def order_status(order_id: str):
    """Used by the order-confirmation page to poll payment status after
    Stripe redirects back (needed for payment methods that redirect,
    e.g. some bank/wallet methods, rather than confirming instantly)."""
    order = await commerce.get_order(db, order_id.upper())
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {
        "order_id": order["order_id"],
        "payment_status": order["payment_status"],
        "total": order["total"],
        "currency": order["currency"],
    }


# ---------------- Admin ----------------

class AdminLoginRequest(BaseModel):
    password: str


@api_router.post("/admin/login")
async def admin_login(req: AdminLoginRequest):
    if not admin_auth.verify_password(req.password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    return {"token": admin_auth.issue_token()}


@api_router.get("/admin/orders")
async def admin_list_orders(_: None = Depends(admin_auth.require_admin)):
    orders = await commerce.list_orders(db)
    return {"orders": orders}


class FulfillmentUpdate(BaseModel):
    status: str
    tracking_number: Optional[str] = None


@api_router.patch("/admin/orders/{order_id}/fulfillment")
async def admin_update_fulfillment(order_id: str, req: FulfillmentUpdate, _: None = Depends(admin_auth.require_admin)):
    ok = await commerce.update_fulfillment(db, order_id.upper(), req.status, req.tracking_number)
    if not ok:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"ok": True}


@api_router.get("/admin/products")
async def admin_list_products(_: None = Depends(admin_auth.require_admin)):
    products = await commerce.list_products(db)
    return {"products": products}


class StockUpdate(BaseModel):
    quantity: int


@api_router.patch("/admin/products/{handle}/variants/{variant_id}/stock")
async def admin_set_stock(handle: str, variant_id: str, req: StockUpdate, _: None = Depends(admin_auth.require_admin)):
    ok = await commerce.set_stock(db, handle, variant_id, req.quantity)
    if not ok:
        raise HTTPException(status_code=404, detail="Product/variant not found")
    return {"ok": True}


class NewsletterRequest(BaseModel):
    email: str
    source: str = "website"



@api_router.post("/newsletter")
async def subscribe_newsletter(req: NewsletterRequest):
    email = req.email.strip().lower()
    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=422, detail="Please enter a valid email address")
    code = "SCULPTIVA15" if req.source == "popup" else "SCULPTIVA10"
    existing = await db.newsletter_subscribers.find_one({"email": email})
    if existing:
        return {"ok": True, "message": "You're already part of the community", "discount_code": existing.get("discount_code", code)}
    doc = {
        "id": str(uuid.uuid4()),
        "email": email,
        "source": req.source,
        "discount_code": code,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.newsletter_subscribers.insert_one(doc)
    return {"ok": True, "message": "Welcome to the Sculptiva community", "discount_code": code}


class ContactRequest(BaseModel):
    name: str
    email: str
    message: str


class CartTrackItem(BaseModel):
    handle: str
    title: str
    price: float
    qty: int
    image: Optional[str] = None
    size: Optional[str] = None
    colour: Optional[str] = None


class CartTrackRequest(BaseModel):
    email: str
    items: List[CartTrackItem]


class CartEmailRequest(BaseModel):
    email: str


SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', '')
SITE_URL = os.environ.get('SITE_URL', '')
ABANDONED_CART_DELAY_MINUTES = int(os.environ.get('ABANDONED_CART_DELAY_MINUTES', '60'))


@api_router.post("/cart/track")
async def track_cart(req: CartTrackRequest):
    email = req.email.strip().lower()
    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=422, detail="Invalid email")
    await db.abandoned_carts.update_one(
        {"email": email},
        {"$set": {
            "email": email,
            "items": [i.model_dump() for i in req.items],
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "reminder_sent": False,
            "converted": False,
        }},
        upsert=True,
    )
    return {"ok": True}


@api_router.post("/cart/converted")
async def cart_converted(req: CartEmailRequest):
    email = req.email.strip().lower()
    await db.abandoned_carts.update_one({"email": email}, {"$set": {"converted": True}})
    return {"ok": True}


def _cart_email_html(cart: dict) -> str:
    site = SITE_URL.rstrip('/')
    rows = ""
    subtotal = 0.0
    for it in cart.get("items", []):
        subtotal += it["price"] * it["qty"]
        img = it.get("image") or ""
        if img.startswith('/'):
            img = f"{site}{img}"
        meta = " · ".join(x for x in [it.get("colour"), f"Size {it.get('size')}" if it.get("size") else None] if x)
        rows += f"""
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eee;width:72px;"><img src="{img}" width="64" height="80" style="object-fit:cover;border-radius:4px;" alt=""/></td>
          <td style="padding:12px 12px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;">
            <div style="font-weight:700;color:#2D2D2D;">{it['title']}</div>
            <div style="color:#888;font-size:12px;margin-top:4px;">{meta} · Qty {it['qty']}</div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right;font-family:Arial,sans-serif;color:#2D2D2D;font-weight:700;">£{it['price'] * it['qty']:.2f}</td>
        </tr>"""
    return f"""
    <div style="background:#F7F3F0;padding:32px 16px;">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;">
        <div style="background:#2D2D2D;padding:28px 24px;text-align:center;">
          <div style="font-family:Arial,sans-serif;font-weight:800;letter-spacing:2px;font-size:22px;color:#F7F3F0;">SCULPT<span style="color:#E8B4B8;">IVA</span></div>
          <div style="font-family:Arial,sans-serif;color:#E8B4B8;font-size:11px;letter-spacing:3px;margin-top:6px;">MOVE WITH CONFIDENCE</div>
        </div>
        <div style="padding:28px 24px;">
          <h1 style="font-family:Arial,sans-serif;color:#2D2D2D;font-size:22px;margin:0 0 8px;">You left something behind 💗</h1>
          <p style="font-family:Arial,sans-serif;color:#666;font-size:14px;line-height:1.6;margin:0 0 20px;">Your Sculptiva pieces are still in your bag — and they'd love to move with you. Here's what's waiting:</p>
          <table style="width:100%;border-collapse:collapse;">{rows}</table>
          <p style="font-family:Arial,sans-serif;text-align:right;color:#2D2D2D;font-weight:700;font-size:15px;margin:14px 0 22px;">Subtotal: £{subtotal:.2f}</p>
          <div style="background:#FDF1F2;border:1px dashed #E8B4B8;border-radius:8px;padding:16px;text-align:center;margin-bottom:22px;">
            <div style="font-family:Arial,sans-serif;color:#2D2D2D;font-size:13px;">Come back within 24 hours and take <b>15% off</b> with code</div>
            <div style="font-family:Arial,sans-serif;color:#c94f5e;font-weight:800;font-size:20px;letter-spacing:2px;margin-top:6px;">SCULPTIVA15</div>
          </div>
          <div style="text-align:center;">
            <a href="{site}/shop" style="font-family:Arial,sans-serif;background:#2D2D2D;color:#F7F3F0;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:2px;padding:14px 34px;border-radius:999px;display:inline-block;">COMPLETE MY ORDER</a>
          </div>
        </div>
        <div style="padding:18px 24px;background:#fafafa;text-align:center;font-family:Arial,sans-serif;color:#999;font-size:11px;">
          Sculptiva · Confidence Starts Here · <a href="{site}" style="color:#c94f5e;">sculptiva</a><br/>
          You received this because you shopped with us. Questions? customercare@sculptivauk.com
        </div>
      </div>
    </div>"""


def _send_cart_email(cart: dict) -> bool:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail
    message = Mail(
        from_email=SENDER_EMAIL,
        to_emails=cart["email"],
        subject="You left something in your bag — 15% off inside 💗",
        html_content=_cart_email_html(cart),
    )
    sg = SendGridAPIClient(SENDGRID_API_KEY)
    resp = sg.send(message)
    return resp.status_code in (200, 202)


async def abandoned_cart_worker():
    while True:
        try:
            if SENDGRID_API_KEY and SENDER_EMAIL:
                cutoff = (datetime.now(timezone.utc) - timedelta(minutes=ABANDONED_CART_DELAY_MINUTES)).isoformat()
                cursor = db.abandoned_carts.find({
                    "reminder_sent": False,
                    "converted": False,
                    "items.0": {"$exists": True},
                    "updated_at": {"$lt": cutoff},
                })
                async for cart in cursor:
                    try:
                        ok = await asyncio.to_thread(_send_cart_email, cart)
                        await db.abandoned_carts.update_one(
                            {"email": cart["email"]},
                            {"$set": {"reminder_sent": ok, "reminder_sent_at": datetime.now(timezone.utc).isoformat()}},
                        )
                        logger.info(f"Abandoned cart email {'sent' if ok else 'failed'}: {cart['email']}")
                    except Exception as e:
                        logger.warning(f"Cart email failed for {cart.get('email')}: {e}")
                        await db.abandoned_carts.update_one({"email": cart["email"]}, {"$set": {"reminder_sent": True, "reminder_error": str(e)[:200]}})
        except Exception as e:
            logger.warning(f"Abandoned cart worker error: {e}")
        await asyncio.sleep(300)


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


def _seo_base(proto: str, host: str) -> str:
    if host:
        return f"{proto}://{host}"
    return (SITE_URL or "").rstrip("/")


async def _load_products_for_seo():
    products = await commerce.list_products(db)
    return [commerce.to_frontend_shape(p) for p in products]


@api_router.get("/_seo/render")
async def seo_render(path: str = "/", proto: str = "https", host: str = ""):
    products = await _load_products_for_seo()
    body, status = seo.render_page(path, _seo_base(proto, host), products)
    return HTMLResponse(content=body, status_code=status)


@api_router.get("/_seo/robots.txt")
async def seo_robots(proto: str = "https", host: str = ""):
    return PlainTextResponse(seo.build_robots(_seo_base(proto, host)))


@api_router.get("/_seo/sitemap.xml")
async def seo_sitemap(proto: str = "https", host: str = ""):
    products = await _load_products_for_seo()
    return Response(content=seo.build_sitemap(_seo_base(proto, host), products), media_type="application/xml")


@api_router.get("/_seo/static-bundle")
async def seo_static_bundle(proto: str = "https", host: str = ""):
    products = await _load_products_for_seo()
    base = _seo_base(proto, host)
    routes = (
        list(seo.STATIC.keys())
        + ["/blog"]
        + [f"/blog/{s}" for s in seo.BLOG_ORDER]
        + [f"/collections/{h}" for h in seo.COLLECTIONS]
        + [f"/collections/{h}" for h in seo.CURATED]
        + [f"/products/{p['handle']}" for p in products]
    )
    curated_routes = {f"/collections/{h}" for h in seo.CURATED}
    body_routes = set(routes)
    data = {}
    for r in routes:
        html_out, status = seo.render_page(r, base, products)
        head = re.search(r"<head>(.*?)</head>", html_out, re.S).group(1)
        lines = [ln for ln in head.strip().splitlines() if "charset" not in ln and "viewport" not in ln and ln.strip()]
        entry = {"head": "\n".join(lines).strip()}
        if r in body_routes:
            body = re.search(r"<body>(.*?)</body>", html_out, re.S).group(1)
            entry["body"] = body.strip()
        data[r] = entry
    return data


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


@app.on_event("startup")
async def start_cart_worker():
    asyncio.create_task(abandoned_cart_worker())


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
