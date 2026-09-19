"""Crawler-facing (dynamic rendering) HTML, robots.txt and sitemap.xml.

Humans get the untouched React SPA. Crawlers (detected in the frontend serving
layer) are proxied here so they receive a complete, unique HTML document per
route with correct title/meta/h1/body and JSON-LD. Data is pulled from the same
product source the SPA uses so it never drifts from what real visitors see.
"""
import html
import json
from datetime import date

BRAND = "Sculptiva"
TAGLINE = "Move with Confidence"
INSTAGRAM = "https://www.instagram.com/sculptivaofficial"

CURRENCY_SYMBOL = {"GBP": "£", "USD": "$", "EUR": "€"}

# Mirror of frontend Collection.js COLLECTIONS (static brand copy).
COLLECTIONS = {
    "leggings": {
        "category": "leggings",
        "title": "Leggings",
        "blurb": "Squat-proof, glute-sculpting, high-waisted. The leggings our community was built on.",
        "image": "https://images.unsplash.com/photo-1606902965551-dce093cda6e7?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
    "sports-bras": {
        "category": "bras",
        "title": "Sports Bras",
        "blurb": "Medium-support sculpting bras that hold you in and never hold you back.",
        "image": "https://images.unsplash.com/photo-1769196716871-39a0712fb037?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
    "sculpt-shorts": {
        "category": "shorts",
        "title": "Sculpt Shorts",
        "blurb": "No front seam, no riding up, all sculpt. Built for leg day and beyond.",
        "image": "https://images.unsplash.com/photo-1617085606193-6b17105cff2a?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
}

# Static routes → unique title / description / h1 / body copy.
STATIC = {
    "/": {
        "title": f"{BRAND} | {TAGLINE} — Premium Women's Activewear",
        "desc": "Sculptiva makes squat-proof, glute-sculpting leggings, sports bras and shorts for women. Confidence Starts Here — premium activewear with free UK delivery over £50.",
        "h1": "Confidence Starts Here",
        "body": "Sculptiva is premium women's activewear built to help you move with confidence. Shop squat-proof sculpting leggings, medium-support sports bras and sculpt shorts, designed to flatter every body and last for years. Free UK delivery over £50, 30-day no-questions returns, and Klarna & Clearpay at checkout.",
    },
    "/shop": {
        "title": f"Shop All Activewear | {BRAND}",
        "desc": "Shop the full Sculptiva collection — sculpting leggings, sports bras and shorts. Squat-proof, high-waisted and built to sculpt. Free UK delivery over £50.",
        "h1": "Shop Everything",
        "body": "Browse the complete Sculptiva range of sculpting leggings, sports bras and sculpt shorts. Every piece is squat-tested, high-waisted and made from premium four-way-stretch sculpt knit. Buy 2 Get 1 Free on leggings.",
    },
    "/about": {
        "title": f"About {BRAND} — Confidence Starts Here",
        "desc": "Sculptiva exists to help women feel confident in their own skin. Learn about our mission, our squat-proof sculpt fabric and why Confidence Starts Here.",
        "h1": "Our Story",
        "body": "Sculptiva was founded on one belief: confidence isn't a size or a trend — it starts with how you feel. We design flattering, comfortable, squat-proof activewear that supports that feeling every single day, for every body, every level and every journey.",
    },
    "/sculptflex": {
        "title": f"SculptFlex™ Contour Leggings | {BRAND}",
        "desc": "Meet SculptFlex™ — Sculptiva's signature contour leggings with a buttery sculpt knit, high-waisted support and a squat-proof finish. Available in four colours.",
        "h1": "SculptFlex™ Contour Leggings",
        "body": "SculptFlex™ is our signature contour legging: a seamless, high-waisted sculpt knit engineered to lift, smooth and support through every rep. Squat-proof, four-way stretch, and available in Charcoal Grey, Obsidian Black, Mocha Brown and Deep Navy.",
    },
    "/contact": {
        "title": f"Contact {BRAND}",
        "desc": "Get in touch with the Sculptiva team. We reply within 24 hours. Email customercare@sculptivauk.com for orders, sizing and returns.",
        "h1": "Contact Us",
        "body": "Questions about your order, sizing or returns? Email customercare@sculptivauk.com or send us a message — the Sculptiva team replies within 24 hours.",
    },
    "/faq": {
        "title": f"FAQ — Sizing, Delivery & Returns | {BRAND}",
        "desc": "Sculptiva FAQs: are the leggings squat-proof, how sizing runs, UK delivery times, returns, Klarna & Clearpay, and how to care for your sculpt pieces.",
        "h1": "Frequently Asked Questions",
        "body": "Everything you need to know about Sculptiva — squat-proof testing, true-to-size fit, same-day UK dispatch, 30-day free returns, Klarna & Clearpay instalments and how to wash your sculpt pieces.",
    },
    "/shipping-returns": {
        "title": f"Shipping & Returns | {BRAND}",
        "desc": "Sculptiva shipping and returns: same-day UK dispatch before 2pm, tracked delivery 2–3 days (free over £50), and 30-day no-questions returns with free size exchanges.",
        "h1": "Shipping & Returns",
        "body": "Orders placed before 2pm ship the same day from our Blackburn warehouse. Standard tracked UK delivery is £3.95 (free over £50), express next-working-day £5.95. Returns are 30 days, no questions asked, with free size exchanges.",
    },
    "/privacy-policy": {
        "title": f"Privacy Policy | {BRAND}",
        "desc": "How Sculptiva collects, uses and protects your personal data when you shop with us.",
        "h1": "Privacy Policy",
        "body": "This policy explains how Sculptiva collects, uses and protects your personal information when you shop with us, in line with UK GDPR.",
    },
    "/track-order": {
        "title": f"Track My Order | {BRAND}",
        "desc": "Track your Sculptiva order. Enter your order number and email to see the latest status, or open your Shopify order status link.",
        "h1": "Track My Order",
        "body": "Enter your order number and the email you used at checkout to see the latest status of your Sculptiva order, including dispatch and tracking details.",
    },
    "/terms-conditions": {
        "title": f"Terms & Conditions | {BRAND}",
        "desc": "The terms and conditions that apply when you shop with Sculptiva.",
        "h1": "Terms & Conditions",
        "body": "These terms and conditions govern your use of the Sculptiva website and your purchases from us.",
    },
}

# Plain-text FAQ mirror for FAQPage JSON-LD.
FAQS = [
    ("Are Sculptiva leggings really squat proof?", "Yes. Every fabric batch is tested to full squat depth under bright studio lighting before it goes into production. If even a hint of light passes through, the batch never ships."),
    ("How does sizing run?", "True to size with high four-way stretch. If you are between sizes, size down for a more compressive sculpt fit or size up for all-day comfort. Check the size guide on any product page for exact measurements."),
    ("What is the Buy 2 Get 1 Free offer?", "Add any three leggings to your bag and the lowest-priced pair is free at checkout. Mix colours and styles freely — the discount applies automatically."),
    ("How long does UK delivery take?", "Orders placed before 2pm ship the same day from our Blackburn warehouse. Standard tracked delivery takes 2–3 working days (£3.95, free over £50). Express next-working-day is £5.95."),
    ("Do you ship internationally?", "We currently ship across the UK. Europe and US shipping opens later this year — join the community list to be first to know."),
    ("What is your returns policy?", "30 days, no questions asked. Items must be unworn with tags attached. Size exchanges are always free — we cover the return postage."),
    ("How do I wash my sculpt pieces?", "Cold machine wash inside out, no fabric softener, hang dry. This protects the sculpt knit and keeps the compression strong for years."),
    ("Can I pay in instalments?", "Yes — Klarna and Clearpay are available at checkout, letting you split your order into interest-free payments."),
    ('What does "Confidence Starts Here" mean?', "It's our whole reason for existing: helping women feel confident in their own skin. Confidence isn't a size, a trend, or something you earn — it starts with how you feel."),
]


def esc(s):
    return html.escape(str(s or ""), quote=True)


def _abs(base, url):
    if not url:
        return ""
    if url.startswith("http://") or url.startswith("https://"):
        return url
    return base.rstrip("/") + "/" + url.lstrip("/")


def _money(price, currency):
    sym = CURRENCY_SYMBOL.get(currency, "")
    return f"{sym}{float(price):.2f}"


def organization_ld(base):
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": BRAND,
        "url": base.rstrip("/") + "/",
        "logo": _abs(base, "/logo512.png"),
        "sameAs": [INSTAGRAM],
    }


def faq_ld():
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q,
             "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in FAQS
        ],
    }


def _ld_block(obj):
    return f'<script type="application/ld+json">{json.dumps(obj, ensure_ascii=False)}</script>'


def _doc(base, path, title, desc, h1, body_html, ld_list, image, og_type):
    url = base.rstrip("/") + (path if path != "/" else "/")
    img_tag = f'<meta property="og:image" content="{esc(image)}"/>' if image else ""
    ld = "".join(_ld_block(o) for o in ld_list)
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}"/>
<link rel="canonical" href="{esc(url)}"/>
<meta name="robots" content="index, follow"/>
<meta property="og:type" content="{esc(og_type)}"/>
<meta property="og:site_name" content="{BRAND}"/>
<meta property="og:title" content="{esc(title)}"/>
<meta property="og:description" content="{esc(desc)}"/>
<meta property="og:url" content="{esc(url)}"/>
{img_tag}
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="{esc(title)}"/>
<meta name="twitter:description" content="{esc(desc)}"/>
{ld}
</head>
<body>
<h1>{esc(h1)}</h1>
{body_html}
</body>
</html>"""


def _not_found(base):
    return _doc(
        base, "/404", f"Page not found | {BRAND}",
        "The page you are looking for does not exist.",
        "Page not found",
        "<p>Sorry, we couldn't find that page. Browse our full collection instead.</p>",
        [organization_ld(base)], None, "website",
    )


def render_page(path, base, products):
    """Return (html, status_code) for a crawler request to `path`."""
    path = (path or "/").split("?")[0].split("#")[0]
    if path != "/":
        path = path.rstrip("/") or "/"
    org = organization_ld(base)

    if path in STATIC:
        meta = STATIC[path]
        ld = [org]
        if path == "/faq":
            ld.append(faq_ld())
        body = f"<main><p>{esc(meta['body'])}</p></main>"
        return _doc(base, path, meta["title"], meta["desc"], meta["h1"], body, ld, None, "website"), 200

    if path.startswith("/collections/"):
        handle = path.split("/collections/", 1)[1]
        col = COLLECTIONS.get(handle)
        if not col:
            return _not_found(base), 404
        items = [p for p in products if p["category"] == col["category"]]
        title = f"{col['title']} | {BRAND}"
        desc = col["blurb"]
        rows = "".join(
            f'<li><a href="{esc(_abs(base, "/products/" + p["handle"]))}">{esc(p["title"])}</a> — {esc(_money(p["price"], p.get("currency", "GBP")))}</li>'
            for p in items
        )
        body = (
            f"<main><p>{esc(col['blurb'])}</p>"
            f"<p>{len(items)} products in {esc(col['title'])}.</p>"
            f"<ul>{rows}</ul></main>"
        )
        collection_ld = {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": title,
            "description": desc,
            "url": base.rstrip("/") + path,
            "mainEntity": {
                "@type": "ItemList",
                "itemListElement": [
                    {"@type": "ListItem", "position": i + 1,
                     "url": _abs(base, "/products/" + p["handle"]),
                     "name": p["title"]}
                    for i, p in enumerate(items)
                ],
            },
        }
        return _doc(base, path, title, desc, col["title"], body, [org, collection_ld], _abs(base, col.get("image")), "website"), 200

    if path.startswith("/products/"):
        handle = path.split("/products/", 1)[1]
        prod = next((p for p in products if p["handle"] == handle), None)
        if not prod:
            return _not_found(base), 404
        currency = prod.get("currency", "GBP")
        title = f"{prod['title']} | {BRAND}"
        raw_desc = (prod.get("description") or "").strip()
        desc = (raw_desc[:152] + "…") if len(raw_desc) > 155 else (raw_desc or f"{prod['title']} — premium sculpting activewear by {BRAND}.")
        images = prod.get("images") or []
        first_img = _abs(base, images[0]) if images else None
        colours = [c["name"] for c in (prod.get("colours") or [])]
        sizes = prod.get("sizes") or []
        facts = []
        facts.append(f"<li>Price: {esc(_money(prod['price'], currency))}</li>")
        if prod.get("compare_at"):
            facts.append(f"<li>Was: {esc(_money(prod['compare_at'], currency))}</li>")
        if colours:
            facts.append(f"<li>Colours: {esc(', '.join(colours))}</li>")
        if sizes:
            facts.append(f"<li>Sizes: {esc(', '.join(sizes))}</li>")
        if prod.get("reviews_count"):
            facts.append(f"<li>Rating: {esc(prod['rating'])}/5 from {esc(prod['reviews_count'])} reviews</li>")
        body = (
            f"<main><p>{esc(raw_desc or desc)}</p>"
            f"<ul>{''.join(facts)}</ul>"
            "<p>Free UK delivery over £50 · 30-day free returns · Klarna & Clearpay at checkout.</p></main>"
        )
        offer = {
            "@type": "Offer",
            "priceCurrency": currency,
            "price": f"{float(prod['price']):.2f}",
            "availability": "https://schema.org/InStock",
            "url": base.rstrip("/") + path,
        }
        product_ld = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": prod["title"],
            "description": raw_desc or desc,
            "brand": {"@type": "Brand", "name": BRAND},
            "offers": offer,
        }
        if images:
            product_ld["image"] = [_abs(base, u) for u in images[:5]]
        if prod.get("reviews_count"):
            product_ld["aggregateRating"] = {
                "@type": "AggregateRating",
                "ratingValue": str(prod["rating"]),
                "reviewCount": str(prod["reviews_count"]),
            }
        return _doc(base, path, title, desc, prod["title"], body, [org, product_ld], first_img, "product"), 200

    return _not_found(base), 404


def build_robots(base):
    return (
        "User-agent: *\n"
        "Allow: /\n\n"
        f"Sitemap: {base.rstrip('/')}/sitemap.xml\n"
    )


def build_sitemap(base, products):
    today = date.today().isoformat()
    b = base.rstrip("/")
    paths = list(STATIC.keys())
    paths += [f"/collections/{h}" for h in COLLECTIONS]
    paths += [f"/products/{p['handle']}" for p in products]
    urls = []
    for p in paths:
        loc = b + ("/" if p == "/" else p)
        priority = "1.0" if p == "/" else ("0.8" if p.startswith("/products/") or p.startswith("/collections/") else "0.6")
        urls.append(
            f"  <url><loc>{esc(loc)}</loc><lastmod>{today}</lastmod>"
            f"<changefreq>weekly</changefreq><priority>{priority}</priority></url>"
        )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>\n"
    )
