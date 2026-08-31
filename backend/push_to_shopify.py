import base64
import json
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

from sample_data import SAMPLE_PRODUCTS

load_dotenv(Path(__file__).parent / '.env', override=True)

DOMAIN = os.environ['SHOPIFY_SHOP_DOMAIN'].replace('https://', '').strip('/')
_grant = requests.post(f"https://{DOMAIN}/admin/oauth/access_token", data={
    'grant_type': 'client_credentials',
    'client_id': os.environ['SHOPIFY_CLIENT_ID'],
    'client_secret': os.environ['SHOPIFY_CLIENT_SECRET'],
}, timeout=20)
_grant.raise_for_status()
TOKEN = _grant.json()['access_token']
API = f"https://{DOMAIN}/admin/api/2024-10"
HEADERS = {"X-Shopify-Access-Token": TOKEN, "Content-Type": "application/json"}
PUBLIC = Path('/app/frontend/public')

TYPE_MAP = {"leggings": "Leggings", "shorts": "Shorts", "bras": "Sports Bras", "accessories": "Accessories"}


def shot_name(path):
    stem = Path(path).stem
    for s in ("front", "back", "side", "detail"):
        if stem.endswith(s):
            return s
    return "view"


def req(method, url, payload=None):
    for attempt in range(5):
        r = requests.request(method, url, headers=HEADERS, json=payload, timeout=60)
        if r.status_code == 429:
            time.sleep(float(r.headers.get('Retry-After', 2)))
            continue
        return r
    return r


def existing_handles():
    r = req('GET', f"{API}/products.json?limit=250&fields=id,handle,options,tags")
    r.raise_for_status()
    return {p['handle']: p for p in r.json()['products']}


def push_product(p):
    colours = p.get('colours') or [{"name": "Default", "images": p['images']}]
    sizes = p['sizes']
    variants = []
    for c in colours:
        for s in sizes:
            variants.append({
                "option1": c['name'],
                "option2": s,
                "price": f"{p['price']:.2f}",
                "compare_at_price": f"{p['compare_at']:.2f}" if p.get('compare_at') else None,
                "sku": f"{p['handle']}-{c['name'].lower().replace(' ', '-')}-{s.lower().replace(' ', '-')}",
                "inventory_management": None,
            })
    images = []
    pos = 1
    for c in colours:
        for img_path in c['images']:
            f = PUBLIC / img_path.lstrip('/')
            if not f.exists():
                print(f"  MISSING {f}", flush=True)
                continue
            images.append({
                "attachment": base64.b64encode(f.read_bytes()).decode(),
                "alt": f"{c['name']} — {shot_name(img_path)}",
                "position": pos,
            })
            pos += 1
    tags = ["sculptiva"]
    if p.get('featured'):
        tags.append("featured")
    if p.get('bestseller'):
        tags.append("bestseller")
    payload = {"product": {
        "title": p['title'],
        "handle": p['handle'],
        "body_html": f"<p>{p['description']}</p>",
        "vendor": "Sculptiva",
        "product_type": TYPE_MAP[p['category']],
        "status": "active",
        "tags": ", ".join(tags),
        "options": [{"name": "Colour"}, {"name": "Size"}],
        "variants": variants,
        "images": images,
    }}
    r = req('POST', f"{API}/products.json", payload)
    if r.status_code not in (200, 201):
        print(f"FAIL {p['handle']}: {r.status_code} {r.text[:300]}", flush=True)
        return None
    prod = r.json()['product']
    print(f"OK {prod['handle']} id={prod['id']} variants={len(prod['variants'])} images={len(prod['images'])}", flush=True)
    link_variant_images(prod, colours)
    return prod


def link_variant_images(prod, colours):
    by_colour_front = {}
    for img in prod['images']:
        alt = img.get('alt') or ''
        if ' — front' in alt:
            by_colour_front[alt.split(' — ')[0]] = img['id']
    for cname, img_id in by_colour_front.items():
        vids = [v['id'] for v in prod['variants'] if v.get('option1') == cname]
        if vids:
            r = req('PUT', f"{API}/products/{prod['id']}/images/{img_id}.json",
                    {"image": {"id": img_id, "variant_ids": vids}})
            if r.status_code != 200:
                print(f"  variant-image link fail {cname}: {r.status_code}", flush=True)
        time.sleep(0.6)


def main():
    have = existing_handles()
    print(f"Existing products: {list(have.keys())}", flush=True)
    ours = {p['handle'] for p in SAMPLE_PRODUCTS}
    for handle, prod in list(have.items()):
        if handle in ours and 'sculptiva' not in (prod.get('tags') or ''):
            r = req('DELETE', f"{API}/products/{prod['id']}.json")
            print(f"DELETED stale {handle}: {r.status_code}", flush=True)
            have.pop(handle)
            time.sleep(0.6)
    for p in SAMPLE_PRODUCTS:
        if p['handle'] in have:
            print(f"SKIP {p['handle']} (already in Shopify)", flush=True)
            continue
        push_product(p)
        time.sleep(1)
    r = req('GET', f"{API}/products.json?limit=250&fields=handle,status")
    print("Final catalog:", json.dumps([x['handle'] for x in r.json()['products']]), flush=True)
    print("DONE", flush=True)


if __name__ == '__main__':
    main()
