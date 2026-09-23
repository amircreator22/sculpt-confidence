"""Stripe integration: PaymentIntents for the embedded checkout, plus
webhook signature verification. Card details never touch our server —
the frontend uses Stripe's Payment Element, which tokenizes everything
client-side (this keeps us in the simplest PCI compliance tier, SAQ A).
"""
import os
import stripe

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "")
WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")


def is_configured() -> bool:
    return bool(stripe.api_key)


def create_payment_intent(amount_minor: int, currency: str, metadata: dict, receipt_email: str = None):
    """amount_minor = amount in pence (or cents), e.g. £24.99 -> 2499."""
    return stripe.PaymentIntent.create(
        amount=amount_minor,
        currency=currency.lower(),
        metadata=metadata,
        receipt_email=receipt_email,
        automatic_payment_methods={"enabled": True},
    )


def retrieve_payment_intent(payment_intent_id: str):
    return stripe.PaymentIntent.retrieve(payment_intent_id)


def verify_webhook_event(payload: bytes, sig_header: str):
    """Raises stripe.error.SignatureVerificationError if invalid."""
    return stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
