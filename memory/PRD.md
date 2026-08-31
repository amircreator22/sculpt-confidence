# Confidence Sculpt — PRD

## Original Problem Statement
Premium Shopify ecommerce brand "Confidence Sculpt" selling glute-enhancing activewear for women (18–45, fitness/wellness). Premium editorial aesthetic: blush #E8B4B8, charcoal #2D2D2D, off-white #F7F3F0. Required: kinetic editorial homepage (hero, benefits, featured collection, bundle offers, social proof, "More Than Leggings" manifesto, TikTok-style UGC, 10%-off email capture), product pages (sticky ATC, size guide, bundles, reviews, FAQ, delivery, related, trust badges, BNPL), pages (Home, Shop, Leggings, Sports Bras, Sculpt Shorts, About, Contact, FAQ, Shipping & Returns, Privacy, Terms), Shopify Storefront connection (user-provided key), newsletter stored in DB, Meta/TikTok pixel placeholder hooks. Awwwards-level motion: framer-motion reveals, masked line-by-line hero reveal, lenis smooth scroll, parallax, editorial marquee.

## User Personas
- Women 18–45 into gym/wellness/body confidence, shopping premium activewear on mobile.
- Brand owner (merchant) connecting their own Shopify catalogue and marketing pixels.

## Architecture
- Frontend: React 19 + Tailwind + framer-motion + lenis + @phosphor-icons/react + shadcn ui. Routes via react-router-dom v7. Cart: localStorage context + drawer. Pixels injected only if env IDs set.
- Backend: FastAPI. Shopify Admin API (REST 2024-10) via httpx with 120s cache and automatic fallback to curated sample catalog when scope/token fails. MongoDB (motor): newsletter_subscribers, contact_messages.
- Key endpoints: GET /api/products, /api/products/{handle}, /api/shop/status, /api/reviews; POST /api/newsletter, /api/contact, /api/checkout (Shopify cart permalink when live variant IDs exist).

## Implemented (2026-08-31, update 2)
- Colour-variant system on the standard product page: 4 SculptFlex™ colourways (Obsidian Black #111111, Charcoal Grey #5A5A5A, Mocha Brown #6F4E37, Deep Navy #1B2951) with circular premium swatches (name below, black active ring, hover scale). Selecting a colour instantly swaps the whole gallery with a fade — no reload, scroll preserved, size selection maintained. Cart lines carry colour ("Deep Navy · Size M").
- New shared ProductGallery component used by EVERY product page: desktop large stage with cursor-following zoom-on-hover (1.8x), thumbnail carousel, full-screen lightbox (arrows, keyboard, counter, backdrop close); mobile full-width swipe gallery with snap + dot indicators. Lazy loading on thumbnails.
- SculptFlex campaign page (/sculptflex) swatches upgraded to the same 4 colourways; shop-module image fades per colour.
- Merchant photos mapped: black/navy/mocha hero shots per colourway; Charcoal Grey has the full 5-image set. A 5th sent photo (dusty rose/mauve) is parked at /sculptflex/colours/rose.png — matches no declared variant.
- Verified: desktop swatch switching (size M preserved across colour changes), lightbox, add-to-bag with colour+size attribution, mobile swipe + dots, campaign page image switching.

## Implemented (2026-08-31)
- SculptFlex™ Contour Leggings (£39.99) campaign product page at /sculptflex: full-bleed hero ("Confidence Starts Here"), purchase module (colour swatches, size selector, live same-day-dispatch countdown, Add To Cart / Buy Now, Klarna/Clearpay/PayPal note, trust badges, Save 27% badge), alternating editorial sections (Designed To Flatter split, Move With Confidence full-width, Premium Sculpting Support split, Built For Every Workout infographic full-width), floating glass feature cards (Squat Proof / Sweat Wicking / Seamless Comfort / Four-Way Stretch), before/after UGC gallery, "Loved By Women Everywhere" review carousel with photos, FAQ accordion, related products, final conversion section ("Feel Strong. Look Incredible."), sticky add-to-cart bar (mobile-first). Real product photography supplied by the merchant, hosted in /frontend/public/sculptflex/. All 5 supplied images are in the main product page gallery at /products/sculptflex-contour-leggings (front, side, back, training, infographic) with clickable thumbnails. Added to sample catalog (appears in Shop). Verified desktop + mobile: colour/size select, add-to-bag (£39.99 in drawer), carousel, countdown, gallery switching.

## Implemented (2026-08-30)
- Full homepage: parallax kinetic hero with masked line reveal, blush marquee, benefits bento, featured collection, bundle offer ("Train Smarter. Save More."), dark manifesto with numbered chapters 01–03, reviews with star ratings, TikTok-style UGC strip, email capture with CONFIDENCE10 code.
- Shop page with category filters; collection pages (leggings / sports-bras / sculpt-shorts) with editorial hero banners.
- Product page: gallery, size selector + size guide dialog, sticky add-to-cart bar, bundle offer cards, trust badges, Klarna/Clearpay/PayPal badges, delivery/returns/FAQ accordion, community reviews, related products.
- Cart drawer with free-shipping progress bar (£50 threshold), qty controls, Shopify checkout permalink (activates when live products load).
- About, Contact (stored in DB), FAQ, Shipping & Returns, Privacy Policy, Terms & Conditions pages.
- Shopify integration wired with graceful fallback; pixel placeholder hooks; Lenis smooth scroll; mobile responsive.
- Verified: all backend endpoints via curl; UI flows via screenshots (hero, reveals, filters, add-to-cart, drawer, sticky ATC, newsletter signup, mobile).

## Known Limitations
- Shopify token lacks `read_products` scope → catalog + checkout currently run on SAMPLE data (reviews/UGC/community numbers are MOCKED sample content). Fix scope in Shopify admin to go live.
- TikTok UGC strip is image-based (no real video embeds).
- No real discount logic at checkout (Buy 2 Get 1 Free must be configured as a Shopify automatic discount).

## Backlog
- P0: Merchant grants read_products scope → verify live catalog + live checkout permalink.
- P0: Configure Buy 2 Get 1 Free + 25% bundle automatic discounts in Shopify admin.
- P1: Klaviyo integration for newsletter sync (currently stored in MongoDB).
- P1: Drop Meta/TikTok pixel IDs into frontend env.
- P1: Real UGC video embeds (TikTok oEmbed or self-hosted mp4).
- P2: Search, wishlist, size-specific Shopify variant mapping, multi-currency.
