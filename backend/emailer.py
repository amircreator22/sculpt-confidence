"""Transactional order emails via Resend (https://resend.com).

Resend has a free tier (100 emails/day, 3,000/month at time of writing)
which is plenty for a store this size to start. Requires:
  - RESEND_API_KEY   (from the Resend dashboard)
  - ORDER_EMAIL_FROM (must be an address on a domain verified in Resend,
                       e.g. orders@sculptivauk.com)
"""
import os
import logging
import httpx

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
FROM_EMAIL = os.environ.get("ORDER_EMAIL_FROM", "orders@sculptivauk.com")
RESEND_URL = "https://api.resend.com/emails"


def _money(amount: float, currency: str) -> str:
    symbol = {"gbp": "£", "usd": "$", "eur": "€"}.get(currency.lower(), "")
    return f"{symbol}{amount:.2f}"


async def send_order_confirmation(order: dict) -> bool:
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set — skipping order confirmation email for %s", order.get("order_id"))
        return False

    currency = order.get("currency", "gbp")
    items_html = "".join(
        f"<li>{item['title']} ({item.get('variant_title', '')}) &times; {item['quantity']} "
        f"&mdash; {_money(item['price'] * item['quantity'], currency)}</li>"
        for item in order.get("items", [])
    )
    addr = order.get("shipping_address", {}) or {}
    address_html = ", ".join(
        v for v in [addr.get("line1"), addr.get("line2"), addr.get("city"), addr.get("postal_code"), addr.get("country")] if v
    )

    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>Thanks for your order!</h2>
      <p>Order <strong>{order['order_id']}</strong></p>
      <ul>{items_html}</ul>
      <p>Shipping: {_money(order.get('shipping', 0), currency)}</p>
      <p><strong>Total: {_money(order['total'], currency)}</strong></p>
      <p>Shipping to: {address_html}</p>
      <p>We'll email you again once your order ships.</p>
      <p>&mdash; Sculptiva</p>
    </div>
    """.strip()

    payload = {
        "from": f"Sculptiva <{FROM_EMAIL}>",
        "to": [order["email"]],
        "subject": f"Order Confirmation — {order['order_id']}",
        "html": html,
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(
                RESEND_URL,
                headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
                json=payload,
            )
        if r.status_code >= 300:
            logger.warning("Resend send failed (%s): %s", r.status_code, r.text[:300])
            return False
        return True
    except Exception as e:
        logger.warning("Resend send raised: %s", e)
        return False
