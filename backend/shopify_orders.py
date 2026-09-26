"""Pushes a completed custom-checkout sale into Shopify as a real, paid order.

This runs after our own Stripe webhook has already confirmed and recorded
the payment (see server.py's /webhooks/stripe -> commerce.mark_order_paid).
It is best-effort and non-blocking: if Shopify is unreachable or not yet
configured, we log and move on rather than failing the webhook, since the
order is already safely recorded in our own database either way.

Configuration (Railway service variables):
  SHOPIFY_SHOP_DOMAIN    e.g. "your-store.myshopify.com"
  SHOPIFY_CLIENT_ID      custom app client ID (same pattern as
  SHOPIFY_CLIENT_SECRET  push_to_shopify.py) with the write_orders scope.

We exchange the client id/secret for a short-lived Admin API access token
via Shopify's OAuth client-credentials grant, and cache it in memory until
shortly before it expires (tokens from this grant last ~24h).
"""
import logging
import os
import time

import httpx

logger = logging.getLogger(__name__)

API_VERSION = "2024-10"

_token_cache = {"token": None, "expires_at": 0}


def _config():
    domain = os.environ.get("SHOPIFY_SHOP_DOMAIN", "").replace("https://", "").strip("/")
    client_id = os.environ.get("SHOPIFY_CLIENT_ID", "").strip()
    client_secret = os.environ.get("SHOPIFY_CLIENT_SECRET", "").strip()
    return domain, client_id, client_secret


def is_configured() -> bool:
    domain, client_id, client_secret = _config()
    return bool(domain and client_id and client_secret)


async def _get_access_token(domain: str, client_id: str, client_secret: str):
    now = time.time()
    if _token_cache["token"] and now < _token_cache["expires_at"]:
        return _token_cache["token"]

    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            f"https://{domain}/admin/oauth/access_token",
            data={
                "grant_type": "client_credentials",
                "client_id": client_id,
                "client_secret": client_secret,
            },
        )
    resp.raise_for_status()
    data = resp.json()
    _token_cache["token"] = data["access_token"]
    # Refresh 5 minutes early to avoid racing against expiry.
    _token_cache["expires_at"] = now + data.get("expires_in", 3600) - 300
    return _token_cache["token"]


def _split_name(full_name: str):
    parts = (full_name or "").strip().split(" ", 1)
    if not parts or not parts[0]:
        return "Customer", ""
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], parts[1]

async def push_order_to_shopify(order: dict):
    """Creates a paid order in Shopify mirroring a completed custom-checkout
    sale. Safe to call fire-and-forget: never raises."""
    if not is_configured():
        logger.info(
            "Shopify order sync skipped for %s: SHOPIFY_SHOP_DOMAIN / "
            "SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET not set",
            order.get("order_id"),
        )
        return None

    domain, client_id, client_secret = _config()

    try:
        token = await _get_access_token(domain, client_id, client_secret)
    except Exception as e:
        logger.error("Shopify order sync: failed to get access token for %s: %s", order.get("order_id"), e)
        return None

    api = f"https://{domain}/admin/api/{API_VERSION}"
    headers = {"X-Shopify-Access-Token": token, "Content-Type": "application/json"}

    addr = order.get("shipping_address") or {}
    first_name, last_name = _split_name(addr.get("name", ""))

    line_items = []
    for item in order.get("items", []):
        variant_id = item.get("variant_id")
        try:
            variant_id = int(variant_id)
        except (TypeError, ValueError):
            pass  # leave as-is; Shopify will reject clearly if it's bad
        line_items.append({
            "variant_id": variant_id,
            "quantity": item.get("quantity", 1),
            "price": f"{item.get('price', 0):.2f}",
        })

    shipping_address = {
        "first_name": first_name,
        "last_name": last_name or first_name,
        "address1": addr.get("line1", ""),
        "address2": addr.get("line2") or "",
        "city": addr.get("city", ""),
        "zip": addr.get("postal_code", ""),
        "country_code": addr.get("country", "GB"),
    }

    shipping_cost = order.get("shipping", 0) or 0
    total = order.get("total", 0) or 0
    currency_upper = (order.get("currency") or "gbp").upper()
    payload = {
        "order": {
            "line_items": line_items,
            "shipping_lines": [{
                "title": "Standard Shipping" if shipping_cost else "Free Shipping",
                "price": f"{shipping_cost:.2f}",
            }],
            "email": order.get("email"),
            "financial_status": "paid",
            "currency": currency_upper,
            "shipping_address": shipping_address,
            "billing_address": shipping_address,
            "tags": "custom-checkout, sculptivauk.com",
            "note": f"Synced automatically from sculptivauk.com checkout (order {order.get('order_id')})",
            "send_receipt": False,
            "send_fulfillment_receipt": False,
            "inventory_behaviour": "bypass",
            "transactions": [{
                "kind": "sale",
                "status": "success",
                "amount": f"{total:.2f}",
                "gateway": "Stripe",
            }],
        }
    }

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(f"{api}/orders.json", headers=headers, json=payload)
        if resp.status_code not in (200, 201):
            logger.error(
                "Shopify order sync FAILED for %s: %s %s",
                order.get("order_id"), resp.status_code, resp.text[:500],
            )
            return None
        shop_order = resp.json().get("order", {})
        logger.info(
            "Shopify order sync OK: %s -> Shopify order %s (%s)",
            order.get("order_id"), shop_order.get("id"), shop_order.get("name"),
        )
        return shop_order
    except Exception as e:
        logger.error("Shopify order sync exception for %s: %s", order.get("order_id"), e)
        return None
