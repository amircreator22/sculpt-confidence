"""Replace logo-bearing Shopify product images with the corrected (logo-free)
versions. Matches each edited image to the live Shopify image by alt text
("{Colour} — {shot}"), preserves position + variant links, then deletes the old
image and uploads the corrected one."""
import base64
import os
import time

import requests
from dotenv import load_dotenv

load_dotenv()

DOMAIN = os.environ['SHOPIFY_SHOP_DOMAIN'].replace('https://', '').strip('/')
API = f"https://{DOMAIN}/admin/api/2024-10"

DISPLAY_TO_KEY = {
    "Blush Pink": "blush", "Obsidian Black": "black", "Charcoal Grey": "charcoal",
    "Mocha Brown": "mocha", "Deep Navy": "navy",
}

# (handle, colour_key, shot, corrected_image_url)
EDITS = [
    ("glute-sculpt-leggings", "blush", "back", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/43b0ce030461f7167b1c443f6a95afc4da0f50dee42c05ec1c8bd6e32d645bc0.jpeg"),
    ("sculpt-sports-bra", "black", "front", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/f705e8fee6688f4f16eabadbe2e589a72fa66316b2973888bcf7890daeaa59b4.jpeg"),
    ("glute-sculpt-leggings", "black", "back", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/0926c0d15c49d1dfbdf9a8a8f373275d357ae7c004e8c25a7ff5de5385ba2601.jpeg"),
    ("glute-sculpt-leggings", "black", "side", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/83dba03f612a261f6d6ccc7b11ca447c6cbb51eb471c2d2ab7777976cf6f0be7.jpeg"),
    ("glute-sculpt-leggings", "blush", "side", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/a90d9267f399f9d87106d726a75e9550412e9db1254b27c07f84b21c1902e361.jpeg"),
    ("glute-sculpt-leggings", "charcoal", "back", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/d79389c562e56661ce521f2299f53125ff302a66e638920d9032270228a24a82.jpeg"),
    ("seamless-sculpt-leggings", "blush", "back", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/4efdab3c8fb3b657e7850acc5a88f096625831ec1e860cb79770bcf27b51a267.jpeg"),
    ("sculpt-shorts", "black", "side", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/544d8fe2309296ddc4fa19f15ae69f1e69a0f90690b537abeb232abf395cb258.jpeg"),
    ("sculpt-shorts", "navy", "back", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/822d456ba085ae87543aa2bbf59deb187723ce06212db9aedb0b00eaa597d98c.jpeg"),
    ("ribbed-sculpt-shorts", "blush", "side", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/588c47003c19619dcce5b09ac2406f5faf07f95d3582f67638a112e0d0f0e128.jpeg"),
    ("ribbed-sculpt-shorts", "charcoal", "side", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/6197e6416d683b55f383c65727f67d235edb068b6bab15b489e29b773ddaf11c.jpeg"),
    ("ribbed-sculpt-shorts", "mocha", "side", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/96971dd5d4e76705dd49212ed2e8b6c98187f4e619c3f02fe9680c29d1d350fe.jpeg"),
    ("sculpt-sports-bra", "blush", "back", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/aa25ac10321b671be12b1e111d2f8efc4f7c1f1f87580f70eb2cc726dd422645.jpeg"),
    ("sculpt-sports-bra", "black", "back", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/63c188964d50d79208878eb6a3c786a17fdf2092e79bd4935ec1dd87562cb96a.jpeg"),
    ("sculpt-longline-bra", "navy", "back", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/8e3756216def0658a3fdf2e8b3f51a7c5f2a1ff2fcecf62617349ace6e4b177f.jpeg"),
    ("sculptflex-contour-leggings", "charcoal", "back", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/e9e67163a23e696527432425b0141b6427e95f4f888ae006f22ef90fda7b6bf1.jpeg"),
    ("sculptflex-contour-leggings", "charcoal", "side", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/0027672309eef98c3535b963b79e535fb27cffbd4f75157fb5bc34bca9a4dbf7.jpeg"),
    ("sculptflex-contour-leggings", "black", "back", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/56672bdf5113f23bd4165066318d479f732a704c44d91f066767b7a837cbdc94.jpeg"),
    ("sculptflex-contour-leggings", "mocha", "back", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/b7d7f3a43ce0c1c404e86e15f8282b1fd05a67f648b66ebbcfc99afaf68ae8b1.jpeg"),
    ("sculptflex-contour-leggings", "mocha", "side", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/0e057afbc6e61997f16371ac498c6375fe2da360f99e593a5ce492bcdaad0c10.jpeg"),
    ("sculptflex-contour-leggings", "navy", "back", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/57d4cc784990af4a401cd8725605a52add71d51819e0cf1db26d3cd8190b5d1a.jpeg"),
    ("sculptflex-contour-leggings", "navy", "side", "https://static.prod-images.emergentagent.com/jobs/d55eb506-89df-490f-94d1-16e205dc247b/images/55220d35c318e0ba4615fdb0a7b73e01db260fde8c5a6ac9da51206489ec4f7c.jpeg"),
]


def get_token():
    r = requests.post(f"https://{DOMAIN}/admin/oauth/access_token", data={
        'grant_type': 'client_credentials',
        'client_id': os.environ['SHOPIFY_CLIENT_ID'],
        'client_secret': os.environ['SHOPIFY_CLIENT_SECRET'],
    }, timeout=20)
    r.raise_for_status()
    return r.json()['access_token']


def shot_of(alt):
    for s in ("front", "back", "side", "detail"):
        if alt.strip().endswith(s):
            return s
    return None


def key_of(alt):
    name = alt.split(' — ')[0].strip() if ' — ' in alt else ''
    return DISPLAY_TO_KEY.get(name)


def main():
    token = get_token()
    H = {"X-Shopify-Access-Token": token, "Content-Type": "application/json"}

    def req(method, url, payload=None):
        for _ in range(6):
            r = requests.request(method, url, headers=H, json=payload, timeout=90)
            if r.status_code == 429:
                time.sleep(float(r.headers.get('Retry-After', 2)))
                continue
            return r
        return r

    prods = req('GET', f"{API}/products.json?limit=250&fields=id,handle").json()['products']
    handle_to_id = {p['handle']: p['id'] for p in prods}

    # index images per product: (colour_key, shot) -> image
    index = {}
    for handle, pid in handle_to_id.items():
        imgs = req('GET', f"{API}/products/{pid}/images.json").json()['images']
        for im in imgs:
            alt = im.get('alt') or ''
            k, s = key_of(alt), shot_of(alt)
            if k and s:
                index[(handle, k, s)] = im
        time.sleep(0.3)

    ok = fail = 0
    for handle, ckey, shot, url in EDITS:
        pid = handle_to_id.get(handle)
        im = index.get((handle, ckey, shot))
        if not pid or not im:
            print(f"NO MATCH {handle} {ckey} {shot}", flush=True)
            fail += 1
            continue
        old_id = im['id']
        position = im.get('position')
        variant_ids = im.get('variant_ids') or []
        try:
            data = requests.get(url, timeout=90).content
        except Exception as e:
            print(f"DOWNLOAD FAIL {handle} {ckey} {shot}: {e}", flush=True)
            fail += 1
            continue
        payload = {"image": {
            "attachment": base64.b64encode(data).decode(),
            "filename": f"{handle}-{ckey}-{shot}.jpg",
            "alt": im.get('alt'),
            "position": position,
        }}
        if variant_ids:
            payload["image"]["variant_ids"] = variant_ids
        r = req('POST', f"{API}/products/{pid}/images.json", payload)
        if r.status_code not in (200, 201):
            print(f"UPLOAD FAIL {handle} {ckey} {shot}: {r.status_code} {r.text[:160]}", flush=True)
            fail += 1
            continue
        d = req('DELETE', f"{API}/products/{pid}/images/{old_id}.json")
        print(f"OK {handle} {ckey} {shot} (new pos {position}, vlinks {len(variant_ids)}, del {d.status_code})", flush=True)
        ok += 1
        time.sleep(0.8)

    print(f"DONE ok={ok} fail={fail}", flush=True)


if __name__ == '__main__':
    main()
