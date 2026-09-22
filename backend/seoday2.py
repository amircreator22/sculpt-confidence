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


# Blog / Journal — mirrored in frontend/src/data/blogPosts.js; keep in sync.
BLOG = {
    "what-makes-leggings-squat-proof": {
        "title_tag": "What Makes Leggings Squat Proof? The Real Answer | Sculptiva",
        "desc": "What actually makes leggings squat-proof — the fabric, the weave, the test. No marketing fluff, just the real answer from a UK activewear brand that tests to full squat depth.",
        "h1": "What Makes Leggings Squat Proof? The Real Answer",
        "date": "2026-06-05",
        "excerpt": "The real answer — fabric density, weave, and the test that actually matters.",
        "image": _LEGGINGS_IMG,
        "body": "\"Squat proof\" gets printed on a lot of leggings that haven't actually been tested for it. Here's what the term should mean, and how to check it yourself before you buy. Opacity under stretch comes down to three things: fabric density (grams per square metre — thin fabric is the single biggest cause of see-through leggings), weave tightness (a dense double-knit holds its structure under load; a loose single-jersey knit doesn't), and compression fit (fabric that's genuinely engineered to stretch four ways without thinning, versus fabric that just happens to be elastic). The test that actually matters isn't a flat lay in a product photo — it's fabric stretched to full squat depth, under bright light, checked from behind. That's the standard every Sculptiva legging is held to before it ships. If you want to check a pair you already own: stretch the fabric tight over your knuckles under a bright light. If you can see your skin tone change through it, it isn't squat-proof, regardless of what the label says.",
        "faqs": [
            ("How do you test if leggings are actually squat proof?", "We test the fabric under stretch, at full squat depth, under bright light — the same conditions a mirror or gym camera would catch, not just a flat lay."),
            ("What fabric makes leggings squat proof?", "A dense double-knit fabric with a tight weave and four-way stretch. Thin, single-layer knits are the ones that go see-through under stretch."),
            ("Are squat-proof leggings also good for everyday wear?", "Yes — the same opacity and compression that hold up in a squat also mean no visible panty lines or sheerness in daily wear."),
        ],
        "primary": ("Shop Squat-Proof Leggings", "/collections/squat-proof-leggings"),
        "links": [
            ("Seamless Gym Leggings", "/collections/seamless-gym-leggings"),
            ("SculptFlex Contour Leggings", "/products/sculptflex-contour-leggings"),
            ("Glute Sculpt Leggings", "/products/glute-sculpt-leggings"),
        ],
    },
    "what-is-a-scrunch-seam": {
        "title_tag": "What Is a Scrunch Seam? The Construction Behind Scrunch Bum Leggings | Sculptiva",
        "desc": "What a scrunch seam actually is, how it lifts and shapes without compromising coverage, and why it's a construction detail — not a push-up trick.",
        "h1": "What Is a Scrunch Seam?",
        "date": "2026-06-08",
        "excerpt": "The construction behind scrunch bum leggings — and why it's not a push-up trick.",
        "image": _LEGGINGS_IMG,
        "body": "A scrunch seam is a curved seam and contour panel sewn into the back of a legging that gathers the fabric to lift and shape — similar in principle to ruching on a dress, but structural rather than decorative, and built to hold that shape under movement rather than just standing still. It works because the seam changes how the fabric sits against the body: instead of one flat panel stretching evenly, the gathered seam creates definition along the natural curve. The most common question is whether this comes at the cost of coverage or opacity — it shouldn't. A well-made scrunch seam sits on top of the same dense, squat-proof base fabric as the rest of the legging; the shaping is additive, not a thinner patch of fabric doing double duty. The seam placement matters too — too high and it sits above the natural curve looking unnatural; too low and it doesn't lift at all. Sculptiva's scrunch styles position the seam based on genuine fit testing across body shapes, not just one sample size.",
        "faqs": [
            ("What is a scrunch seam?", "A curved seam and contour panel sewn into the back of the legging that gathers the fabric to lift and shape the glutes — similar to ruching, but structural rather than decorative."),
            ("Do scrunch bum leggings show cellulite or lines?", "No — the dense double-knit fabric used underneath the scrunch seam is opaque and squat-proof tested, so the shaping effect doesn't come with see-through fabric."),
            ("Are scrunch leggings good for lifting, or just for looks?", "Both — ours are squat-proof tested to full depth, so they're built to perform in a lifting session, not just to photograph well."),
        ],
        "primary": ("Shop Scrunch Bum Leggings", "/collections/scrunch-bum-leggings"),
        "links": [
            ("Squat-Proof Leggings", "/collections/squat-proof-leggings"),
            ("Glute Sculpt Leggings", "/products/glute-sculpt-leggings"),
            ("SculptFlex Contour Leggings", "/products/sculptflex-contour-leggings"),
        ],
    },
    "high-waisted-vs-tummy-control-leggings": {
        "title_tag": "High-Waisted vs Tummy Control Leggings: What's Actually the Difference? | Sculptiva",
        "desc": "High-waisted describes where the waistband sits. Tummy control describes the compression. They're not the same thing — here's how to tell what you're actually buying.",
        "h1": "High-Waisted vs Tummy Control: What's the Difference?",
        "date": "2026-06-11",
        "excerpt": "Two terms, two different things. Here's how to tell what you're actually buying.",
        "image": _DARK_IMG,
        "body": "These two terms get used interchangeably in product listings, but they describe two separate things, and a legging can have one without the other. High-waisted is about rise — where the waistband sits relative to your natural waistline. A true high-rise sits above the belly button, not just \"higher than low-rise.\" Tummy control is about compression — whether the waistband fabric is engineered to hold and smooth, using a graduated-compression construction (firmer through the core, gentler at the edges) rather than just being elastic. You can have a high-waisted legging with a waistband that's no more supportive than a regular hem — it's just tall. And you can, in theory, have genuine compression starting lower on the body, though in practice most tummy-control leggings are also high-waisted because that's where compression is most useful. The way to tell the difference when shopping: look for the brand explicitly describing graduated compression or a \"sculpting\" panel, not just \"high-waisted\" in the title — that's the signal it's engineered for support, not just cut higher.",
        "faqs": [
            ("Do high-waisted leggings actually give tummy control?", "Yes, when the waistband uses real compression fabric rather than just sitting higher — ours use a graduated-compression high-rise band, not just a taller hem."),
            ("Will the waistband dig in or roll down?", "No — it's built to sit flat through movement; this is one of the most-tested claims across our reviews."),
            ("What's the difference between high-waisted and tummy control leggings?", "High-waisted describes the rise (where the waistband sits); tummy control describes the compression level. Ours combine both."),
        ],
        "primary": ("Shop High-Waisted Leggings", "/collections/high-waisted-gym-leggings"),
        "links": [
            ("Black Gym Leggings", "/collections/black-gym-leggings"),
            ("Glute Sculpt Leggings", "/products/glute-sculpt-leggings"),
            ("Seamless Sculpt Leggings", "/products/seamless-sculpt-leggings"),
            ("SculptFlex Contour Leggings", "/products/sculptflex-contour-leggings"),
        ],
    },
    "how-we-test-leggings-for-squat-proofing": {
        "title_tag": "How We Test Our Leggings for Squat-Proofing | Sculptiva",
        "desc": "A look inside our actual squat-proof testing process — the stretch test, the lighting, the angle — before any fabric makes it into a finished pair of leggings.",
        "h1": "How We Test Our Leggings for Squat-Proofing",
        "date": "2026-06-14",
        "excerpt": "Inside our actual squat-proof testing process — the stretch test, the light box, the angle.",
        "image": _LEGGINGS_IMG,
        "body": "Most brands print \"squat-proof\" on a swing tag and never test it. Ours goes through a specific process before a fabric batch is approved. Every roll of fabric is cut, sewn into a sample, and stretched to full squat depth over a light box — the same conditions that expose thinning fabric under a gym mirror or a phone camera. We check from directly behind, at the angle a training partner or a mirror actually sees, not a flat lay on a table. If light passes through and skin tone shows, the batch is rejected before it reaches production, regardless of how the fabric performs in other tests like colour-fastness or stretch recovery. This isn't a one-off pre-launch check either — batches are periodically re-tested through the production run, because fabric mills can drift on density between orders even when the spec sheet stays the same. It's a slower, more expensive way to source fabric than trusting a supplier's spec sheet. It's also the only way we're comfortable putting \"squat-proof\" on a product page.",
        "faqs": [
            ("Do you test every batch of fabric, or just the first sample?", "Every batch. Fabric density can drift between production runs even from the same supplier, so a pass on the first sample doesn't guarantee later batches meet the same standard."),
            ("What exactly fails a squat-proof test?", "Any visible skin tone or colour change through the fabric when stretched to full squat depth under bright light, viewed from behind — that's an automatic rejection regardless of how the fabric performs elsewhere."),
            ("Can I request test results for a specific pair I've bought?", "We don't publish per-batch lab reports publicly, but our customer team can talk through our testing process for any current product — get in touch via our contact page."),
        ],
        "primary": ("Shop Squat-Proof Leggings", "/collections/squat-proof-leggings"),
        "links": [
            ("What Makes Leggings Squat Proof?", "/blog/what-makes-leggings-squat-proof"),
            ("SculptFlex Contour Leggings", "/products/sculptflex-contour-leggings"),
        ],
    },
    "squat-proof-vs-see-through-how-to-tell-before-you-buy": {
        "title_tag": "Squat-Proof vs See-Through: How to Tell Before You Buy | Sculptiva",
        "desc": "How to spot see-through leggings before you buy — without needing to actually squat in the changing room. Five checks you can do from the product photos and fabric description alone.",
        "h1": "Squat-Proof vs See-Through: How to Tell Before You Buy",
        "date": "2026-06-17",
        "excerpt": "Five checks to spot see-through leggings from the listing alone — before you buy.",
        "image": _LEGGINGS_IMG,
        "body": "You can't squat-test leggings before you've bought them, but you can spot the warning signs from the listing alone. First, check the fabric weight if it's listed — anything under roughly 250 grams per square metre is worth being cautious about; denser fabric is harder to see through. Second, look at the product photography itself: if every photo is shot standing straight-on with no movement or stretch shots, that's often because the fabric doesn't hold up under stretch. Third, read the fabric composition — a high spandex/elastane percentage (above roughly 18-22%) paired with a double-knit or brushed construction tends to perform better than a thin single-jersey blend. Fourth, check for language that's specific rather than vague — \"tested to full squat depth\" says more than \"buttery soft, second-skin feel.\" Finally, check reviews specifically for the words \"see-through,\" \"sheer,\" or \"opaque\" rather than just star ratings, since overall ratings often don't reflect this one issue if the fit and comfort are otherwise good.",
        "faqs": [
            ("Does fabric weight alone guarantee leggings won't be see-through?", "No — weight matters, but weave tightness and compression fit matter just as much. A dense double-knit at a moderate weight can outperform a heavier but loosely woven fabric."),
            ("Are darker colours automatically less see-through?", "Not automatically, but darker colours do hide thinning fabric better than light colours or pastels, which show sheerness more readily under the same fabric construction."),
            ("What's the fastest way to check if leggings I already own are see-through?", "Stretch the fabric tight over your knuckles under a bright light — if you can see your skin tone change through it, it isn't squat-proof, regardless of the label."),
        ],
        "primary": ("Shop Squat-Proof Leggings", "/collections/squat-proof-leggings"),
        "links": [
            ("What Makes Leggings Squat Proof?", "/blog/what-makes-leggings-squat-proof"),
            ("How We Test for Squat-Proofing", "/blog/how-we-test-leggings-for-squat-proofing"),
        ],
    },
    "high-waisted-vs-mid-rise-leggings": {
        "title_tag": "High-Waisted vs Mid-Rise Leggings: Which Is Right for You? | Sculptiva",
        "desc": "High-waisted and mid-rise leggings sit differently, support differently, and suit different workouts. Here's how to pick between them.",
        "h1": "High-Waisted vs Mid-Rise Leggings: Which Is Right for You?",
        "date": "2026-06-20",
        "excerpt": "Where the waistband sits changes support and movement. How to pick between them.",
        "image": _DARK_IMG,
        "body": "The difference comes down to where the waistband sits and what that means for support and movement. High-waisted leggings sit above the belly button, giving full core coverage and a wider band of compression — better for weight training, running, and anything where you don't want to think about your waistband. Mid-rise sits at or just below the belly button, offering more freedom through the torso and a lower profile under cropped tops, which suits Pilates, yoga, or lower-intensity training where a wide, high band can feel restrictive during deep bends. Neither is objectively better — it's a question of what you're doing in them. If you're deciding based on tummy coverage alone, high-waisted usually wins, but if you find high-waisted bands digging in during seated or twisting movements, mid-rise is worth trying. Body shape matters too: a longer torso often suits high-waisted better since there's more room for the band to sit naturally above the navel without riding up.",
        "faqs": [
            ("Which is better for weight training, high-waisted or mid-rise?", "High-waisted, generally — the wider band and higher coverage stay in place better during heavy compound lifts like squats and deadlifts."),
            ("Does mid-rise give less tummy support than high-waisted?", "It typically covers less of the torso, but a well-constructed mid-rise band can still use the same graduated-compression fabric — the difference is coverage area, not necessarily compression quality."),
            ("Can I wear high-waisted leggings for yoga?", "Yes, but some people find the taller band restrictive during deep forward folds or twists — it's a personal preference rather than a hard rule."),
        ],
        "primary": ("Shop High-Waisted Leggings", "/collections/high-waisted-gym-leggings"),
        "links": [
            ("High-Waisted vs Tummy Control", "/blog/high-waisted-vs-tummy-control-leggings"),
            ("Seamless Gym Leggings", "/collections/seamless-gym-leggings"),
        ],
    },
    "do-tummy-control-leggings-really-work": {
        "title_tag": "Do Tummy Control Leggings Really Work? | Sculptiva",
        "desc": "What tummy control leggings actually do to your body, what they don't do, and how to tell if a pair is genuinely engineered for compression or just marketed that way.",
        "h1": "Do Tummy Control Leggings Really Work?",
        "date": "2026-06-23",
        "excerpt": "What they actually do, what they don't, and how to spot real compression.",
        "image": _DARK_IMG,
        "body": "They work, but it helps to be precise about what \"work\" means. Tummy control leggings use graduated compression — firmer through the core, easing off toward the edges — to smooth the silhouette and provide light postural support while you move. That's a real, physical effect you can feel and see immediately. What they don't do is change your body shape permanently or replace anything like exercise or diet — the effect lasts as long as you're wearing them, the same as any compression garment. The other thing genuine tummy control depends on is the compression actually being engineered into the waistband, not just implied by a legging being high-waisted. A tall waistband with ordinary stretch fabric will hold you in slightly by virtue of covering more skin, but it isn't the same as a waistband built with a denser, targeted-compression panel. If a product only says \"high-waisted\" and never mentions compression, support, or a sculpting panel specifically, it's worth asking before assuming it does more than a regular pair.",
        "faqs": [
            ("Will tummy control leggings flatten my stomach permanently?", "No — the compression effect lasts while you're wearing them, similar to any compression garment. They don't change body composition."),
            ("Is tummy control the same as shapewear?", "Similar principle, different intensity — tummy control leggings are built for movement and workouts, so the compression is generally lighter and more breathable than dedicated shapewear."),
            ("How do I know if leggings have real tummy control or just a high waistband?", "Look for the brand explicitly mentioning graduated compression or a sculpting/support panel — a plain high-rise cut alone doesn't guarantee compression engineering."),
        ],
        "primary": ("Shop High-Waisted Leggings", "/collections/high-waisted-gym-leggings"),
        "links": [
            ("High-Waisted vs Tummy Control", "/blog/high-waisted-vs-tummy-control-leggings"),
            ("High-Waisted vs Mid-Rise", "/blog/high-waisted-vs-mid-rise-leggings"),
        ],
    },
    "how-to-measure-yourself-for-leggings-at-home": {
        "title_tag": "How to Measure Yourself for Leggings at Home | Sculptiva",
        "desc": "The three measurements that actually matter when buying leggings online, and how to take them accurately with a tape measure and no fitting room.",
        "h1": "How to Measure Yourself for Leggings at Home",
        "date": "2026-06-26",
        "excerpt": "The three measurements that decide fit — waist, hip, inseam — done at home.",
        "image": _LEGGINGS_IMG,
        "body": "Three measurements decide fit more than any other: waist, hip, and inseam. Waist is measured at the narrowest point, usually just above the belly button — not where your trousers currently sit, which can be lower. Hip is measured at the widest point, typically across the widest part of your seat, keeping the tape parallel to the floor rather than angled. Inseam matters most for length: measure from the crotch seam of a well-fitting pair of leggings or trousers you already own, down to where you want the hem to sit, rather than your full outer leg length, which includes the waistband and throws the number off. Take all three in centimetres or inches consistently, without pulling the tape tight enough to compress skin. If you're between two sizes on our chart, sizing up is usually the safer call for compression leggings specifically, since fabric with a strong compression element will always feel tighter than a non-compression legging at the same labelled size.",
        "faqs": [
            ("Should I measure over clothes or against skin?", "Against skin or light clothing — measuring over bulky clothing adds inaccurate inches to every measurement."),
            ("What if my waist and hip measurements fall into two different sizes on the chart?", "Size to your hip measurement for leggings specifically, since waistbands on most of our styles use compression fabric that stretches to accommodate a smaller waist."),
            ("How often should I re-measure?", "Body measurements can shift over months, especially around training changes, so it's worth re-measuring before any purchase if it's been six months or more since your last check."),
        ],
        "primary": ("Shop Leggings", "/collections/leggings"),
        "links": [
            ("High-Waisted Gym Leggings", "/collections/high-waisted-gym-leggings"),
            ("Seamless Gym Leggings", "/collections/seamless-gym-leggings"),
        ],
    },
    "what-are-scrunch-bum-leggings": {
        "title_tag": "What Are Scrunch Bum Leggings? A Full Explainer | Sculptiva",
        "desc": "Scrunch bum leggings explained — what the seam actually does, how they're built, and how they differ from a regular legging. No marketing jargon.",
        "h1": "What Are Scrunch Bum Leggings? A Full Explainer",
        "date": "2026-06-29",
        "excerpt": "The full explainer — construction, fit, and what actually makes a legging \"scrunch bum\".",
        "image": _LEGGINGS_IMG,
        "body": "\"Scrunch bum leggings\" is the everyday name for leggings built with a scrunch seam — a curved seam and gathered fabric panel stitched into the back of the legging specifically to lift and shape the glutes. The name describes what you see: the fabric bunches, or \"scrunches,\" along that seam rather than lying flat, which is the visual signature that separates them from a standard legging with a single back panel. Underneath the styling, a scrunch bum legging is still built the same way as any other quality pair — dense, squat-proof fabric, four-way stretch, and usually a high-rise, compression waistband — the scrunch seam sits on top of that base rather than replacing it. What makes one pair better than another is where the seam is placed and how it's sewn in: a seam positioned along the natural curve, tested across different body shapes, lifts and shapes; a seam bolted on in the wrong spot just looks like a poorly finished garment. The scrunch effect is a construction choice, not a padding trick or an illusion print — there's no foam, no double fabric layer, no printed shading doing the work. It's simply a seam and a panel, sewn to gather fabric exactly where it's wanted.",
        "faqs": [
            ("Are scrunch bum leggings the same as push-up leggings?", "No — push-up styles typically rely on padding or extra fabric layers to add volume, while scrunch bum leggings use a seam and gathered panel to shape the fabric you already have. There's no padding involved."),
            ("Do scrunch bum leggings work for every body shape?", "The seam is designed to follow the natural curve of the glutes, so it works across body shapes, but placement matters — a well-tested seam sits differently than one designed for a single sample size."),
            ("Can I wear scrunch bum leggings for actual training, not just photos?", "Yes — ours use the same squat-proof, four-way-stretch base fabric as our other leggings, so the scrunch seam adds shape without sacrificing performance."),
        ],
        "primary": ("Shop Scrunch Bum Leggings", "/collections/scrunch-bum-leggings"),
        "links": [
            ("What Is a Scrunch Seam?", "/blog/what-is-a-scrunch-seam"),
            ("Squat-Proof Leggings", "/collections/squat-proof-leggings"),
            ("SculptFlex Contour Leggings", "/products/sculptflex-contour-leggings"),
        ],
    },
    "scrunch-bum-vs-ruched-leggings": {
        "title_tag": "Scrunch Bum vs Ruched Leggings: What's the Difference? | Sculptiva",
        "desc": "\"Ruched\" and \"scrunch bum\" get used interchangeably, but they're not always built the same way. Here's the real construction difference.",
        "h1": "Scrunch Bum vs Ruched Leggings: What's the Difference?",
        "date": "2026-07-02",
        "excerpt": "They look similar, but they're not always built the same way — here's the real difference.",
        "image": _LEGGINGS_IMG,
        "body": "\"Ruched\" and \"scrunch bum\" get used to describe the same visual effect, but they're not always built the same way. Ruching, in fashion terms broadly, is fabric deliberately gathered or pleated for a decorative effect — it can appear anywhere on a garment (sleeves, sides, a dress bodice) and its main job is visual. A scrunch seam is a specific application of that idea to the back panel of a legging, engineered structurally to shape the glutes under movement, not just to look gathered while standing still. The practical difference shows up when you move: decorative ruching on a fabric that isn't built for compression can lose its shape, stretch out unevenly, or shift during a workout. A proper scrunch seam is stitched into a compression-grade fabric with a seam placement that's been fit-tested, so the gathered look holds through squats, lunges and everyday movement rather than just the first five minutes. In short: all scrunch bum leggings use a form of ruching, but not everything labelled \"ruched\" is built to hold its shape the way a dedicated scrunch bum legging is.",
        "faqs": [
            ("Is \"ruched\" just a fancier word for \"scrunch bum\"?", "They describe a similar visual effect, but scrunch bum specifically refers to a structural seam built for the back panel of leggings, engineered to hold shape under movement — not just any gathered fabric."),
            ("Do ruched leggings lose their shape over time?", "It depends on the fabric and construction — decorative ruching on non-compression fabric can stretch out, while a properly engineered scrunch seam on compression-grade fabric holds its shape wash after wash."),
            ("Which should I buy if I want the lifting effect for the gym specifically?", "Look for the term \"scrunch seam\" or a brand that describes the construction and testing behind it, rather than just \"ruched\", since that signals it's built for movement, not just appearance."),
        ],
        "primary": ("Shop Scrunch Bum Leggings", "/collections/scrunch-bum-leggings"),
        "links": [
            ("What Is a Scrunch Seam?", "/blog/what-is-a-scrunch-seam"),
            ("Do Scrunch Bum Leggings Actually Work?", "/blog/do-scrunch-bum-leggings-actually-work"),
            ("Glute Sculpt Leggings", "/products/glute-sculpt-leggings"),
        ],
    },
    "do-scrunch-bum-leggings-actually-work": {
        "title_tag": "Do Scrunch Bum Leggings Actually Work? | Sculptiva",
        "desc": "Does the scrunch bum effect actually show, and does it hold up during a workout? A straight answer, without the marketing spin.",
        "h1": "Do Scrunch Bum Leggings Actually Work?",
        "date": "2026-07-05",
        "excerpt": "A straight answer on whether the scrunch effect is real — and whether it holds up mid-workout.",
        "image": _DARK_IMG,
        "body": "\"Work\" here means two different things people usually ask about, so it's worth answering both. Visually, yes — a well-placed scrunch seam does create a lifted, shaped look at the glutes, because gathering fabric along a curved seam changes how the fabric sits and holds tension against the body, similar in principle to how darts and gathers shape any other tailored garment. This is a real, physical effect, not an optical illusion print. What it doesn't do is change the shape of your body permanently, replace strength training, or work identically on every single pair — cheap, poorly placed seams can look bunched or uneven rather than shaped, especially if the seam sits above or below the natural curve. The other part of \"does it work\" is whether it holds up during actual movement, not just standing in front of a mirror. That depends entirely on the base fabric: a scrunch seam sewn into thin, non-compression fabric can shift, twist or lose its line during a squat or lunge. Sewn into a dense, squat-proof, four-way-stretch fabric with a seam placement that's been tested across body shapes, it holds its shape through a full session, which is the standard worth checking for before buying.",
        "faqs": [
            ("Is the scrunch bum look just a photo trick, or does it actually show in person?", "It's a real, physical effect from the seam and gathered fabric — it shows in person, not just in photos, as long as the seam is properly placed and sewn into compression-grade fabric."),
            ("Will a scrunch seam look uneven or bunched instead of shaped?", "It can, if the seam placement hasn't been fit-tested across body shapes or the base fabric is too thin to hold the gather — that's the difference between a well-made pair and a cheap one."),
            ("Does the scrunch effect hold up during a workout, or just when standing still?", "On a properly built pair with dense, squat-proof fabric, yes — the seam is engineered to hold its shape through movement, not just a static pose."),
        ],
        "primary": ("Shop Scrunch Bum Leggings", "/collections/scrunch-bum-leggings"),
        "links": [
            ("What Is a Scrunch Seam?", "/blog/what-is-a-scrunch-seam"),
            ("How We Test for Squat-Proofing", "/blog/how-we-test-leggings-for-squat-proofing"),
            ("SculptFlex Contour Leggings", "/products/sculptflex-contour-leggings"),
        ],
    },
    "best-scrunch-bum-leggings-for-leg-day": {
        "title_tag": "Best Scrunch Bum Leggings for Leg Day | Sculptiva",
        "desc": "What to look for in scrunch bum leggings that can actually survive leg day — squats, lunges and deadlifts included.",
        "h1": "Best Scrunch Bum Leggings for Leg Day",
        "date": "2026-07-08",
        "excerpt": "What a scrunch bum legging needs beyond the styling to survive an actual leg day.",
        "image": _LEGGINGS_IMG,
        "body": "Leg day puts more demand on a legging than almost any other session — squats, lunges, deadlifts and hip thrusts all stretch fabric to its limit and test whether a scrunch seam holds its shape or shifts out of place. The pair worth choosing for leg day needs three things beyond the scrunch styling itself: squat-proof, opaque fabric tested at full depth (thin fabric is the first thing that fails under a heavy set); a high-rise, graduated-compression waistband that won't roll down mid-set; and a seam placement that's been fit-tested to sit along the natural curve rather than shifting during deep movement. Our Glute Sculpt and SculptFlex styles are built specifically around this — the scrunch seam sits on the same dense double-knit base fabric used across our squat-proof range, so the shaping holds through the last rep of the last set, not just the warm-up. If you're shopping leg day leggings on scrunch styling alone without checking the base fabric and waistband construction, you're choosing for the first five minutes of a session rather than the whole thing.",
        "faqs": [
            ("Do scrunch bum leggings actually hold up during squats and deadlifts?", "The scrunch seam itself holds up as well as the base fabric it's sewn into — on dense, squat-proof fabric like ours, yes, through a full leg day session."),
            ("Should I size up for leg day leggings with a scrunch seam?", "Not specifically for the scrunch seam — size based on your usual measurements, since compression fabric is designed to stretch with heavy movement regardless of styling."),
            ("What's more important for leg day: the scrunch seam or the waistband?", "Both matter, but a waistband that rolls down mid-set is the more common leg day complaint — look for graduated compression and a high-rise cut alongside the scrunch styling."),
        ],
        "primary": ("Shop Scrunch Bum Leggings", "/collections/scrunch-bum-leggings"),
        "links": [
            ("Glute Sculpt Leggings", "/products/glute-sculpt-leggings"),
            ("Squat-Proof Leggings", "/collections/squat-proof-leggings"),
            ("How We Test for Squat-Proofing", "/blog/how-we-test-leggings-for-squat-proofing"),
        ],
    },
    "scrunch-bum-leggings-ultimate-buying-guide": {
        "title_tag": "Scrunch Bum Leggings: The Ultimate 2026 Buying Guide | Sculptiva",
        "desc": "Everything to check before buying scrunch bum leggings in 2026 \u2014 seam placement, fabric, sizing, and how to spot a pair built to actually hold its shape.",
        "h1": "Scrunch Bum Leggings: The Ultimate 2026 Buying Guide",
        "date": "2026-09-23",
        "excerpt": "Everything worth checking before you buy \u2014 seam placement, fabric, sizing, and how to tell a well-built pair from a gimmick.",
        "image": _LEGGINGS_IMG,
        "body": "Scrunch bum leggings have gone from a niche gym-wear detail to one of the most searched legging styles in the UK, which also means the market is now full of pairs that copy the look without the construction behind it. This guide covers what actually separates a well-built pair from one that just photographs well on a hanger. Start with the seam itself: a genuine scrunch seam is a curved seam and gathered fabric panel stitched into the back panel specifically to follow the natural curve of the glutes, not a straight seam with extra fabric bunched in. Ask or check product photos for seam placement across a size range \u2014 a seam fit-tested on multiple body shapes holds its shaping line; one designed around a single sample size can sit oddly or flatten out on a different fit. Fabric is the second thing to check, and it matters more than the seam. The scrunch effect sits on top of a base fabric, and if that base is thin or non-compression, the gather will shift, twist, or go see-through under stretch \u2014 especially during a squat. Look for dense, four-way-stretch, squat-proof fabric as the foundation, with the scrunch seam added to it, not replacing it. Waistband construction is the third check: a high-rise, graduated-compression waistband keeps the whole garment in place through a session, which matters more for a scrunch style since a rolling waistband distorts the seam's line as much as it does comfort. On sizing, the general rule with scrunch bum leggings is to size to your usual measurements rather than sizing down for a tighter scrunch effect \u2014 a too-tight fit pulls the fabric flat across the seam and flattens the shaping it's meant to create, while a properly sized pair on compression fabric holds the gather without needing to be uncomfortably tight. Finally, treat marketing claims with the same scepticism you'd apply to any other shapewear category: no scrunch seam changes your body shape permanently, and the visual lift is a real, physical effect of gathered fabric and seam tension, not an illusion print or a padding trick. A pair built the way this guide describes holds that effect through an actual workout, not just a mirror selfie.",
        "faqs": [
            ("What's the single biggest difference between a good and a bad scrunch bum legging?", "Base fabric quality. The scrunch seam itself is a fairly simple construction choice \u2014 what makes or breaks a pair is whether it's built on dense, squat-proof, four-way-stretch fabric or a thin fabric that shifts and loses shape under movement."),
            ("Should I size down to get a tighter scrunch effect?", "No \u2014 sizing down pulls the fabric flat across the seam and flattens the gather rather than enhancing it. Size to your usual measurements on compression-grade fabric for the best shaping."),
            ("Do scrunch bum leggings work on every body shape?", "The seam is designed to follow natural curve, so it can work across body shapes, but only if it's been fit-tested on a size range rather than designed around one sample size."),
            ("How do I know if a listing is just describing a normal legging with marketing language?", "Check for specifics: mentions of seam placement testing, the actual base fabric composition and compression level, and construction detail beyond \"lifting effect\" claims. Vague marketing copy with no construction detail is a red flag."),
        ],
        "primary": ("Shop Scrunch Bum Leggings", "/collections/scrunch-bum-leggings"),
        "links": [
            ("What Is a Scrunch Seam?", "/blog/what-is-a-scrunch-seam"),
            ("Do Scrunch Bum Leggings Actually Work?", "/blog/do-scrunch-bum-leggings-actually-work"),
            ("Best Scrunch Bum Leggings for Leg Day", "/blog/best-scrunch-bum-leggings-for-leg-day"),
        ],
    },
    "scrunch-bum-leggings-for-curvy-women": {
        "title_tag": "Scrunch Bum Leggings for Curvy Women: A Fit Guide | Sculptiva",
        "desc": "A fit guide to scrunch bum leggings for curvier body shapes — seam placement, sizing and what to check before buying.",
        "h1": "Scrunch Bum Leggings for Curvy Women: A Fit Guide",
        "date": "2026-07-11",
        "excerpt": "Seam placement and sizing matter more on a curvier fit, not less — here's what to check.",
        "image": _DARK_IMG,
        "body": "A scrunch seam is designed to follow the natural curve of the glutes, which means fit and seam placement matter more on a curvier body shape, not less — a seam engineered for one narrow sample size can sit oddly or fail to lift properly on a fuller hip and thigh. The things worth checking before buying: whether the brand mentions fit-testing across body shapes rather than just one sample fit, whether the waistband uses graduated compression sized to actually hold through the hip and waist rather than just being cut wider, and whether the fabric is dense enough to stay opaque under the extra stretch a curvier fit puts on it. Sizing matters too — going up a size in a scrunch bum legging generally preserves the seam's shaping line better than staying in a size that pulls the fabric too tight across the curve, which can flatten or distort the gather rather than lift it. Our scrunch styles are fit-tested across a size range specifically so the seam placement holds its shaping line whether you're a UK 8 or a UK 20, rather than being designed and tested on one body type and scaled up by the numbers alone.",
        "faqs": [
            ("Do scrunch bum leggings suit curvier body shapes, or are they better on straighter figures?", "They're designed to follow natural curve, so a curvier shape often shows the lifting effect more clearly — as long as the seam placement has been fit-tested across sizes, not just one sample."),
            ("Should I size up if I'm between two sizes in a scrunch bum legging?", "Generally yes — sizing up preserves the seam's shaping line, while a too-tight fit can pull the fabric flat across the curve and distort the gather."),
            ("Will the waistband dig in on a curvier fit?", "Not if it's genuine graduated compression sized to the hip and waist — a waistband that's just cut wider without proper compression engineering is more likely to dig in or roll."),
        ],
        "primary": ("Shop Scrunch Bum Leggings", "/collections/scrunch-bum-leggings"),
        "links": [
            ("Glute Sculpt Leggings", "/products/glute-sculpt-leggings"),
            ("High-Waisted vs Tummy Control", "/blog/high-waisted-vs-tummy-control-leggings"),
            ("What Is a Scrunch Seam?", "/blog/what-is-a-scrunch-seam"),
        ],
    },
}

BLOG_ORDER = [
    "scrunch-bum-leggings-ultimate-buying-guide",
    "scrunch-bum-leggings-for-curvy-women",
    "best-scrunch-bum-leggings-for-leg-day",
    "do-scrunch-bum-leggings-actually-work",
    "scrunch-bum-vs-ruched-leggings",
    "what-are-scrunch-bum-leggings",
    "how-to-measure-yourself-for-leggings-at-home",
    "do-tummy-control-leggings-really-work",
    "high-waisted-vs-mid-rise-leggings",
    "squat-proof-vs-see-through-how-to-tell-before-you-buy",
    "how-we-test-leggings-for-squat-proofing",
    "high-waisted-vs-tummy-control-leggings",
    "what-is-a-scrunch-seam",
    "what-makes-leggings-squat-proof",
]

# Collection handle -> related articles (slug, label) for internal linking.
COLLECTION_ARTICLE = {
    "squat-proof-leggings": [
        ("what-makes-leggings-squat-proof", "What makes leggings squat proof?"),
        ("how-we-test-leggings-for-squat-proofing", "How we test our leggings for squat-proofing"),
        ("squat-proof-vs-see-through-how-to-tell-before-you-buy", "Squat-proof vs see-through: how to tell before you buy"),
    ],
    "scrunch-bum-leggings": [
        ("scrunch-bum-leggings-ultimate-buying-guide", "Scrunch bum leggings: the ultimate 2026 buying guide"),
        ("what-is-a-scrunch-seam", "What is a scrunch seam?"),
        ("what-are-scrunch-bum-leggings", "What are scrunch bum leggings? A full explainer"),
        ("scrunch-bum-vs-ruched-leggings", "Scrunch bum vs ruched leggings: what's the difference?"),
        ("do-scrunch-bum-leggings-actually-work", "Do scrunch bum leggings actually work?"),
        ("best-scrunch-bum-leggings-for-leg-day", "Best scrunch bum leggings for leg day"),
        ("scrunch-bum-leggings-for-curvy-women", "Scrunch bum leggings for curvy women: a fit guide"),
    ],
    "high-waisted-gym-leggings": [
        ("high-waisted-vs-tummy-control-leggings", "High-waisted vs tummy control leggings"),
        ("high-waisted-vs-mid-rise-leggings", "High-waisted vs mid-rise leggings"),
        ("do-tummy-control-leggings-really-work", "Do tummy control leggings really work?"),
    ],
}


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


def article_ld(base, post, url, image):
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post["h1"],
        "description": post["desc"],
        "datePublished": post["date"],
        "dateModified": post["date"],
        "image": image,
        "author": {"@type": "Organization", "name": BRAND},
        "publisher": {
            "@type": "Organization",
            "name": BRAND,
            "logo": {"@type": "ImageObject", "url": _abs(base, "/logo512.png")},
        },
        "mainEntityOfPage": {"@type": "WebPage", "@id": url},
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

    if path == "/blog":
        title = "The Sculptiva Journal | Activewear Guides & Fit Advice"
        desc = "Guides on squat-proof fabric, scrunch seams, high-waisted fit and more from Sculptiva — a UK activewear brand that tests to full squat depth."
        rows = "".join(
            f'<li><a href="{esc(_abs(base, "/blog/" + s))}">{esc(BLOG[s]["h1"])}</a> — {esc(BLOG[s]["excerpt"])}</li>'
            for s in BLOG_ORDER
        )
        body = (
            "<main><p>Real, no-fluff guides to fabric, fit and construction from the Sculptiva team.</p>"
            f"<ul>{rows}</ul></main>"
        )
        ld = [org, breadcrumb_ld(base, [("Home", "/"), ("Journal", "/blog")])]
        return _doc(base, path, title, desc, "The Sculptiva Journal", body, ld, None, "website"), 200

    if path.startswith("/blog/"):
        slug = path.split("/blog/", 1)[1]
        post = BLOG.get(slug)
        if not post:
            return _not_found(base), 404
        url = base.rstrip("/") + path
        image = _abs(base, post["image"])
        p_label, p_href = post["primary"]
        link_rows = f'<li><a href="{esc(_abs(base, p_href))}">{esc(p_label)}</a></li>'
        link_rows += "".join(
            f'<li><a href="{esc(_abs(base, href))}">{esc(label)}</a></li>'
            for label, href in post["links"]
        )
        faq_html = "".join(f"<h3>{esc(q)}</h3><p>{esc(a)}</p>" for q, a in post["faqs"])
        body = (
            f"<main><p>{esc(post['body'])}</p>"
            f"<h2>Shop this guide</h2><ul>{link_rows}</ul>"
            f"<h2>Frequently asked questions</h2>{faq_html}</main>"
        )
        ld = [
            org,
            article_ld(base, post, url, image),
            _faq_ld(post["faqs"]),
            breadcrumb_ld(base, [("Home", "/"), ("Journal", "/blog"), (post["h1"], path)]),
        ]
        return _doc(base, path, post["title_tag"], post["desc"], post["h1"], body, ld, image, "article"), 200

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
            article = COLLECTION_ARTICLE.get(handle)
            article_html = ""
            if article:
                lis = "".join(
                    f'<li><a href="{esc(_abs(base, "/blog/" + s))}">{esc(l)}</a></li>'
                    for s, l in article
                )
                article_html = f"<h2>Related reading</h2><ul>{lis}</ul>"
            body = (
                f"<main><p>{esc(cur['body'])}</p>"
                f"<h2>Featured styles</h2><ul>{prod_rows}</ul>"
                f"<h2>Frequently asked questions</h2>{faq_html}"
                f"<h2>Shop by style</h2><ul>{related_html}</ul>"
                f"{article_html}</main>"
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
    paths += ["/blog"] + [f"/blog/{s}" for s in BLOG_ORDER]
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
