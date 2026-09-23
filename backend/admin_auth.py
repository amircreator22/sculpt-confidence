"""Minimal password-protected admin auth for the orders/stock dashboard.

One admin account, password set via env var (hashed, never stored in
plaintext). Login returns a short-lived signed JWT the frontend stores
and sends back as a Bearer token on admin API calls.
"""
import os
import time
import jwt
from passlib.hash import bcrypt
from fastapi import HTTPException, Header

ADMIN_PASSWORD_HASH = os.environ.get("ADMIN_PASSWORD_HASH", "")
JWT_SECRET = os.environ.get("ADMIN_JWT_SECRET", "")
TOKEN_TTL_SECONDS = 60 * 60 * 12  # 12 hours


def verify_password(plain_password: str) -> bool:
    if not ADMIN_PASSWORD_HASH:
        return False
    try:
        return bcrypt.verify(plain_password, ADMIN_PASSWORD_HASH)
    except ValueError:
        return False


def issue_token() -> str:
    payload = {"role": "admin", "exp": int(time.time()) + TOKEN_TTL_SECONDS}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def require_admin(authorization: str = Header(default="")) -> None:
    """FastAPI dependency: raise 401 unless a valid admin bearer token is present."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing admin token")
    token = authorization.removeprefix("Bearer ").strip()
    try:
        jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired admin session")


def hash_password_for_setup(plain_password: str) -> str:
    """Utility used only by the one-off setup script — not called at runtime."""
    return bcrypt.hash(plain_password)
