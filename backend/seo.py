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

# Curated (style/attribute) collections — pull from catalogue by product handle.
# Mirrored in frontend/src/data/curatedCollections.js; keep in sync.
_LEGGINGS_IMG = "https://images.unsplash.com/photo-1606902965551-dce093cda6e7?crop=entropy&cs=srgb&fm=jpg&q=85"
_DARK_IMG = "https://images.unsplash.com/photo-1769196716871-39a0712fb037?crop=entropy&cs=srgb&fm=jpg&q=85"

CURATED = {
    "seamless-gym-leggings": {
        "title_tag": "Seamless Gym Leggings | No Front Seam, Buttery Soft — Sculptiva",
        "desc": "Seamless gym leggings with buttery-soft, second-skin knit and zero front seam. Squat-proof, high-waisted, sweat-wicking. Free UK shipping over £50.",
        "h1": "Seamless Gym Leggings",
        "body": "Seamless gym leggings are built from a single continuous knit rather than stitched panels, which is why they sit flush against your skin with no front seam to dig in, roll, or show under fitted tops. Our seamless styles use a dense double-knit fabric that stretches four ways without going see-through at full squat depth, paired with a high-rise waistband that holds its shape through a full session — not just the first ten minutes. Whether you're going straight from a lift to the school run or wearing them as your everyday-comfort layer, seamless construction means there's nothing to chafe, dig, or ride up.",
        "faqs": [
            ("What makes leggings \"seamless\"?", "They're knitted in one continuous piece rather than cut and sewn from separate fabric panels, so there's no front seam or side stitching to rub or show through leggings."),
            ("Are seamless leggings still squat proof?", "Yes — seam count and squat-proofing are separate things. Our seamless styles use the same dense, opaque double-knit fabric as our other squat-proof leggings."),
            ("Do seamless leggings run small?", "They're designed with four-way stretch to move with you, but we recommend checking the size guide, as seamless knits fit closer to the body than stitched leggings."),
        ],
        "crumbs": [("Home", "/"), ("Leggings", "/collections/leggings"), ("Seamless", "/collections/seamless-gym-leggings")],
        "products": ["seamless-sculpt-leggings"],
        "image": _LEGGINGS_IMG,
    },
    "scrunch-bum-leggings": {
        "title_tag": "Scrunch Bum Leggings | Glute-Sculpting Scrunch Seam — Sculptiva",
        "desc": "Scrunch bum leggings with a contour scrunch seam that lifts and shapes. Squat-proof, high-waisted, worn by 40,000+ women. Free UK shipping over £50.",
        "h1": "Scrunch Bum Leggings",
        "body": "Scrunch bum leggings use a contour seam and targeted fabric shading across the back panel to lift and shape your natural curves — it's a construction detail, not a push-up trick, so it holds its shape from the first rep to the last. Ours pair the scrunch seam with squat-proof, dense double-knit fabric and a high-rise waistband, so the lift doesn't come at the cost of coverage. This is the design our community was built on: over 40,000 women wear the scrunch styles at the gym, on dog walks, and everywhere in between.",
        "faqs": [
            ("What is a scrunch seam?", "A curved seam and contour panel sewn into the back of the legging that gathers the fabric to lift and shape the glutes — similar to ruching, but structural rather than decorative."),
            ("Do scrunch bum leggings show cellulite or lines?", "No — the dense double-knit fabric used underneath the scrunch seam is opaque and squat-proof tested, so the shaping effect doesn't come with see-through fabric."),
            ("Are scrunch leggings good for lifting, or just for looks?", "Both — ours are squat-proof tested to full depth, so they're built to perform in a lifting session, not just to photograph well."),
        ],
        "crumbs": [("Home", "/"), ("Leggings", "/collections/leggings"), ("Scrunch Bum", "/collections/scrunch-bum-leggings")],
        "products": ["glute-sculpt-leggings", "sculptflex-contour-leggings"],
        "image": _LEGGINGS_IMG,
    },
    "high-waisted-gym-leggings": {
        "title_tag": "High Waisted Gym Leggings | Tummy Control, No Dig-In — Sculptiva",
        "desc": "High-waisted gym leggings with sculpting tummy-control compression that holds without digging in. Squat-proof, seamless options available. Free UK shipping over £50.",
        "h1": "High Waisted Gym Leggings",
        "body": "A true high-rise waistband sits above the natural waistline and uses graduated compression — firmer through the core, gentler at the edges — to smooth and support without leaving a mark when you sit down or bend. That's the difference between tummy-control leggings that work and ones that just look high-waisted in product photos. Every pair here uses the same sculpting waistband, tested through squats, deadlifts and full training sessions, so it holds through a 45-minute session, a school run, and everything after.",
        "faqs": [
            ("Do high-waisted leggings actually give tummy control?", "Yes, when the waistband uses real compression fabric rather than just sitting higher — ours use a graduated-compression high-rise band, not just a taller hem."),
            ("Will the waistband dig in or roll down?", "No — it's built to sit flat through movement; this is one of the most-tested claims across our reviews."),
            ("What's the difference between high-waisted and tummy control leggings?", "High-waisted describes the rise (where the waistband sits); tummy control describes the compression level. Ours combine both."),
        ],
        "crumbs": [("Home", "/"), ("Leggings", "/collections/leggings"), ("High Waisted", "/collections/high-waisted-gym-leggings")],
        "products": ["glute-sculpt-leggings", "seamless-sculpt-leggings", "sculptflex-contour-leggings"],
        "image": _LEGGINGS_IMG,
    },
    "black-gym-leggings": {
        "title_tag": "Black Gym Leggings | Squat-Proof & Seamless — Sculptiva",
        "desc": "Black gym leggings that are squat-proof, high-waisted and seamless-soft. The everyday shade in every Sculptiva style. Free UK shipping over £50.",
        "h1": "Black Gym Leggings",
        "body": "Black is the shade that goes with everything in your kit bag, which is why it's the first colourway in every Sculptiva style — Glute Sculpt, Seamless Sculpt and SculptFlex all come in a true, non-fading black. Because black fabric shows compression and seam quality more than any other shade, we hold every black pair to the same squat-proof, four-way-stretch standard as the rest of the range, so what you see in the product photo is what holds up in the mirror after squat 20.",
        "faqs": [
            ("Do black leggings go see-through more than other colours?", "It's actually the opposite in cheap fabric — lighter shades usually show through first. Our black styles use the same dense, opacity-tested fabric as every other colourway."),
            ("Will these fade or go grey after washing?", "No — follow the wash guide (cold wash, no fabric softener) and the black dye is designed to hold."),
            ("Which black leggings are the most squat-proof?", "All of them — squat-proof testing is done on the base fabric, not per colour."),
        ],
        "crumbs": [("Home", "/"), ("Leggings", "/collections/leggings"), ("Black", "/collections/black-gym-leggings")],
        "products": ["glute-sculpt-leggings", "seamless-sculpt-leggings", "sculptflex-contour-leggings"],
        "image": _DARK_IMG,
    },
    "squat-proof-leggings": {
        "title_tag": "Squat Proof Leggings | Fully Opaque, No See-Through — Sculptiva",
        "desc": "Squat-proof leggings tested to full depth — dense double-knit fabric, high-waisted, zero see-through. Worn by 40,000+ women. Free UK shipping over £50.",
        "h1": "Squat Proof Leggings",
        "body": "\"Squat proof\" isn't a marketing word here — it means fabric tested to full squat depth under gym lighting to confirm it stays fully opaque under stretch, not just when it's lying flat. Every pair in this collection is built from the same dense double-knit fabric with four-way stretch, paired with a high-rise waistband that won't roll or slip mid-set. If squat depth, deadlifts, or leg day is the reason you're shopping, this is the collection built specifically to survive it.",
        "faqs": [
            ("How do you test if leggings are actually squat proof?", "We test the fabric under stretch, at full squat depth, under bright light — the same conditions a mirror or gym camera would catch, not just a flat lay."),
            ("What fabric makes leggings squat proof?", "A dense double-knit fabric with a tight weave and four-way stretch. Thin, single-layer knits are the ones that go see-through under stretch."),
            ("Are squat-proof leggings also good for everyday wear?", "Yes — the same opacity and compression that hold up in a squat also mean no visible panty lines or sheerness in daily wear."),
        ],
        "crumbs": [("Home", "/"), ("Leggings", "/collections/leggings"), ("Squat Proof", "/collections/squat-proof-leggings")],
        "products": ["glute-sculpt-leggings", "seamless-sculpt-leggings", "sculptflex-contour-leggings"],
        "image": _LEGGINGS_IMG,
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


def _faq_ld(pairs):
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q,
             "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in pairs
        ],
    }


def faq_ld():
    return _faq_ld(FAQS)


def breadcrumb_ld(base, crumbs):
    b = base.rstrip("/")
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": name, "item": b + href}
            for i, (name, href) in enumerate(crumbs)
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

        cur = CURATED.get(handle)
        if cur:
            items = []
            for h in cur["products"]:
                p = next((x for x in products if x["handle"] == h), None)
                if p:
                    items.append(p)
            title, desc, h1 = cur["title_tag"], cur["desc"], cur["h1"]
            prod_rows = "".join(
                f'<li><a href="{esc(_abs(base, "/products/" + p["handle"]))}">{esc(p["title"])}</a> — {esc(_money(p["price"], p.get("currency", "GBP")))}</li>'
                for p in items
            )
            faq_html = "".join(
                f"<h3>{esc(q)}</h3><p>{esc(a)}</p>" for q, a in cur["faqs"]
            )
            related_html = "".join(
                f'<li><a href="{esc(_abs(base, "/collections/" + h))}">{esc(c["h1"])}</a></li>'
                for h, c in CURATED.items() if h != handle
            )
            related_html += f'<li><a href="{esc(_abs(base, "/collections/leggings"))}">All Leggings</a></li>'
            body = (
                f"<main><p>{esc(cur['body'])}</p>"
                f"<h2>Featured styles</h2><ul>{prod_rows}</ul>"
                f"<h2>Frequently asked questions</h2>{faq_html}"
                f"<h2>Shop by style</h2><ul>{related_html}</ul></main>"
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
            ld = [org, collection_ld, _faq_ld(cur["faqs"]), breadcrumb_ld(base, cur["crumbs"])]
            return _doc(base, path, title, desc, h1, body, ld, _abs(base, cur["image"]), "website"), 200

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
    paths += [f"/collections/{h}" for h in CURATED]
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
