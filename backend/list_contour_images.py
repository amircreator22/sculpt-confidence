"""List current live Shopify images for the contour leggings product."""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

DOMAIN = os.environ['SHOPIFY_SHOP_DOMAIN'].replace('https://', '').strip('/')
API = f"https://{DOMAIN}/admin/api/2024-10"


def get_token():
    r = requests.post(f"https://{DOMAIN}/admin/oauth/access_token", data={
        'grant_type': 'client_credentials',
        'client_id': os.environ['SHOPIFY_CLIENT_ID'],
        'client_secret': os.environ['SHOPIFY_CLIENT_SECRET'],
    }, timeout=20)
    r.raise_for_status()
    return r.json()['access_token']


def main():
    token = get_token()
    H = {"X-Shopify-Access-Token": token}
    prods = requests.get(f"{API}/products.json?limit=250&fields=id,handle,title", headers=H, timeout=30).json()['products']
    for p in prods:
        if p['handle'] == 'sculptflex-contour-leggings':
            imgs = requests.get(f"{API}/products/{p['id']}/images.json", headers=H, timeout=30).json()['images']
            print(f"PRODUCT {p['handle']} id={p['id']} title={p['title']} images={len(imgs)}")
            for im in imgs:
                print(f"  pos={im.get('position')} alt={im.get('alt')!r} id={im['id']}")
                print(f"     {im['src']}")


if __name__ == '__main__':
    main()
