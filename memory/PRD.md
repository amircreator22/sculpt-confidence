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

## Implemented (2026-08-31, update 6)
- Studio photo sets for ALL SculptFlex™ colourways: Obsidian Black, Mocha Brown and Deep Navy each got 4 AI-generated grey-studio shots (front, back, side lunge, waistband detail) using their angle photos as reference — same model, exact colour match, Gymshark-style seamless light-grey backdrop. All 4 colourways now have complete, consistent studio galleries (7 gallery slides each: 3 videos + 4 studio photos). Script: /app/backend/generate_studio_colours.py.
- Verified: all 4 swatches switch galleries correctly with 7 thumbs each; studio imagery confirmed per colour.

## Implemented (2026-08-31, update 5)
- Product page rebuilt to match the Gymshark PDP the merchant linked (uk.gymshark.com Relay Seamless Legging): clean white page, left large gallery (videos first, then studio photos), right info panel — NEW tag, title, "Regular fit", price, rating link, short description, SQUARE PHOTO colour swatches (each colourway's own photo, black active ring), size boxes with UK ranges (xs (4–6)…), "Customers say this fits true to size", full-width black rectangular Add to Bag, Klarna/PayPal row, delivery strip (Free Standard over £50 / Express by 2pm / free exchanges), trust badges, accordions (Description & Features with icon features, Size & Care, Delivery & Returns, FAQs).
- Below the fold: Gymshark-style feature trio blocks (Glute-Sculpting / High-Stretch Fabric / Stay-Put Waistband) with studio imagery, Reviews with rating snapshot bars (4.9, 86% 5★), Get The Look related products.
- Photography: AI-generated 4 studio shots on seamless light-grey backdrop (Gymshark e-com style) for Charcoal Grey — same model/leggings as merchant's photos (script: /app/backend/generate_studio.py). Charcoal gallery is now studio-only front/back/side/detail; other colourways keep their gym-set photos.
- Verified: layout desktop + mobile, photo swatch switching, size select, add-to-bag (Charcoal Grey · M in drawer), trio distinct images.

## Implemented (2026-08-31, update 4)
- Try-on video slides in the main product gallery (Gymshark-style): 3 video slides sit FIRST in the gallery, autoplay muted on loop, tap-to-unmute, model label chips ("Amelia wears M · Front fit" etc.), play-icon thumbnails, work in desktop stage, mobile swipe gallery, and across all colourways. Clips are locally produced Ken Burns motion videos (ffmpeg, WebM VP9 + H.264 MP4 dual-source for all browsers) — placeholder content until the merchant supplies real try-on footage; ZERO AI credits used. To swap in real videos: replace files in /frontend/public/sculptflex/videos/ (keep names) or edit the videos array in backend/sample_data.py.
- Verified: videos auto-play advancing (desktop + mobile), mute toggle, thumbnails, image slides, lightbox, colourway switching intact. Note: the mandated testing_agent subagent is not available in this environment; verification was done via automated browser playback checks instead.

## Implemented (2026-08-31, update 3)
- Every SculptFlex™ colourway now has a 4-angle big-photo gallery: hero (back pose, merchant photo), front view, side lunge, fabric/scrunch detail close-up. Black/Navy/Mocha angles AI-generated (Gemini Nano Banana via Emergent key) using the merchant's colour photos as reference — same model, same gym, exact colour match. Charcoal Grey uses the merchant's 4 real angle photos (infographic moved out of the gallery, still on campaign page). Generation script saved at /app/backend/generate_colourways.py for future colourways.
- Verified: each colourway shows 4 thumbnails, angle switching, colour switching, sticky bar variant attribution.

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

## Brand Voice Sweep (June 2026)
User supplied official BRAND MISSION doc (mission: help women feel confident in their own skin; promise: confidence>perfection, comfort>compromise, quality>hype, real women>unrealistic standards, trust>sales; tagline: "Confidence Starts Here.").
Applied full copy sweep:
- Home: hero headline now "Confidence Starts Here.", inclusive overline ("for every woman"), mission-led subcopy, marquee items = brand promises, manifesto chapters rewritten (Confidence Over Perfection / Comfort Over Compromise / Real Women Over Unrealistic Standards), benefits headline "Made to feel your best."
- About: fully rewritten brand story page — mission hero, philosophy section, "Our Promise" 5-card grid + never-shame card, "We Believe" / "Who We Serve" dark section, stats.
- Footer: tagline under logo + mission description + bottom strip tagline.
- EmailCapture: headline "Confidence Starts Here.", supportive copy.
- ProductPage: "Waist-Snatching Waistband" -> "Supportive High-Rise Waistband" (no transformation-claim language).
- FAQ: added "What does Confidence Starts Here mean?" entry.
Per user: urgency/offer elements (announcement bar, bundle offers, 10% code) KEPT.
Verified via desktop screenshots (home hero, about hero, about promise/beliefs sections).

## Gallery Everywhere (June 2026)
User approved: full studio sets (3 colours x 4 angles/product), agent-picked on-brand colours, merge charcoal leggings into Glute Sculpt Leggings.
- Generated 84 grey-studio images via Gemini nano banana (generate_catalog_studio.py) using SculptFlex studio shots as pose/model refs; regenerated 13 (all 12 band shots + navy shorts back) to remove leaked Gymshark/VELA branding (fix_catalog_images.py). Assets: /app/frontend/public/catalog/{handle}/{colour}-{front|back|side|detail}.png
- sample_data.py: removed cs-002 (merged as Charcoal Grey colour of glute-sculpt-leggings); all 8 products now have colours arrays (SculptFlex 4, others 3; bands use tone sets Blush/Neutral/Midnight). ProductPage default colour = colours[0] (SculptFlex reordered Charcoal first).
- Testing agent iteration_1.json: 100% pass backend+frontend, 132 image URLs verified, colour switching + size retention + cart colour attribution all working. Fixed 3 cosmetic nits after: cart drawer Close/X overlap (mr-10), shop card title min-height, Size Guide DialogTitle a11y.

## Rebrand to Sculptiva (June 2026)
- Brand renamed Confidence Sculpt -> Sculptiva everywhere (header/footer logo "SCULPTiva", hero overline, About, FAQ, Info/legal, Contact email hello@sculptiva.co.uk, socials @sculptiva/#Sculptiva, server.py API brand, browser title/meta).
- Subheading/tagline: "Move with Confidence" (footer under logo, hero overline, page title). Mission line "Confidence Starts Here." retained as hero headline + footer bottom strip.
- Discount code renamed CONFIDENCE10 -> SCULPTIVA10 (EmailCapture, Info page, backend).
- Verified via screenshots + curl (API brand + page title).
- User purchased a custom domain on WIX — provided them the deploy + Link Domain/Entri + Wix DNS steps. Domain linking happens in Emergent UI after deployment (agent cannot do it from code).

## Shopify Storefront API Connected (June 2026)
- User's app had only Storefront (unauthenticated_*) scopes; Admin read_products remained blocked. Solution: switched integration to Storefront GraphQL API with user's PUBLIC storefront token (SHOPIFY_STOREFRONT_TOKEN in backend/.env).
- server.py rewritten: _storefront_query helper, PRODUCTS_QUERY (products+variants+options+images), _check_connection, live checkout via cartCreate mutation returning real checkoutUrl. CheckoutItem.variant_id now str (gid).
- VERIFIED: /api/shop/status -> connected:true, shop "My Store", 4 live products; POST /api/checkout with real variant gid returns live Shopify checkout URL.
- IMPORTANT: user's Shopify store contains 4 NON-activewear products (AquaPure water filter, Lumora recovery items). SHOPIFY_CATALOG_MODE=sample keeps the Sculptiva sample catalog displayed. Flip to "live" in backend/.env once user adds real Sculptiva products to Shopify.
- Deployment initiated by user (async). NOTE for deploy: backend/.env Shopify vars must exist in production env.

## Live Shopify Catalog + Push + Track Order (June 2026)
- New Shopify Dev Dashboard app flow: static shpat tokens no longer exist; tokens obtained via client-credentials grant (SHOPIFY_CLIENT_ID/SHOPIFY_CLIENT_SECRET in backend/.env, cached 24h in _get_admin_token).
- push_to_shopify.py executed: deleted 4 stale manual drafts, created all 8 Sculptiva products (98 variants, 100 images w/ altText "Colour — shot" convention, variant-image links). Published to Online Store + "My Store Headless" publications via publishablePublish (storefront token reads that channel).
- SHOPIFY_CATALOG_MODE=live: catalog now 100% from Shopify (tag:sculptiva filter hides AquaPure/Lumora), colours rebuilt from image altText, ratings/videos enriched from sample meta, real checkout via cartCreate.
- Track My Order page (/track-order) + POST /api/orders/track using admin client-credentials token; footer link added.
- Testing agent iteration_2.json: 31/31 backend, 100% frontend. Post-test fixes: checkout live failure now 409 (was silent sample fallback), toast moved top-right (was covering checkout CTA), SculptFlex videos re-injected in live mode, EMAIL_RE moved to top, sr-only h1 on About, dialog aria fix.
- Redeploy dispatched after catalog go-live (user-approved order of ops).

## Contact + Socials (June 2026)
- Support email updated everywhere to customercare@sculptivauk.com (Contact, Info/legal x3, TrackOrder x3).
- Instagram connected (links-only per user): @sculptivaofficial — footer icon, homepage UGC overline + all 5 community clips, FAQ mention. Verified 7 links on home via screenshot automation.
- google-site-verification meta tag added to index.html; redeploy queued for it.

## Real Customer Try-On Videos (Sept 2026)
- User uploaded 3 real MP4s; downloaded, compressed (1080x1920 -> 720w h264 crf27 + AAC, ~4MB each), posters generated: /sculptflex/videos/tryreal-{1,2,3}.mp4 + -poster.jpg.
- Replaced the old photo-motion tryon clips in sample_data cs-009 videos (labels: "Customer try-on · Real fit review / Movement test / Everyday wear"); served via _SAMPLE_VIDEOS enrichment in live mode.
- Verified: 3 videos autoplay in SculptFlex gallery, thumb switching works, mute toggle present. Needs redeploy to reach live domain.

## Correction: videos moved out of gallery (Sept 2026)
- User wanted the 3 real clips as a showcase ABOVE reviews, not in the gallery. Gallery now photos-only (videos={[]} passed to ProductGallery).
- New section on ProductPage: "See Them On Real Women" (data-testid video-testimonials-section) with TestimonialVideo component (9:16, autoplay muted, mute toggle, label). Renders for any product with videos.
- Verified via screenshot: 4 photo thumbs in gallery, 3 videos in showcase above Reviews. No AI/credit spend.

## Video 3 replaced (Sept 2026)
- User uploaded replacement clip; compressed and overwrote /sculptflex/videos/tryreal-3.mp4 + poster (same filenames, no data change needed). Added play() nudge on mount in TestimonialVideo.

## Meta Pixel (Sept 2026)
- Base pixel snippet (ID 2576284096124806) added verbatim to frontend/public/index.html head incl. noscript fallback.
- Pixels.js rewritten: exports track() helper; SPA PageView fired on route changes (skips first load, base snippet covers it); TikTok loader remains placeholder (REACT_APP_TIKTOK_PIXEL_ID unset).
- Events wired: ViewContent (ProductPage load), AddToCart (CartContext.addItem — covers quick-add too), InitiateCheckout (CartDrawer.checkout), Lead (EmailCapture success).
- Verified via fbq spy in browser: ViewContent + AddToCart fire; checkout flow navigated to real Shopify checkout. NOTE: Purchase event occurs on Shopify's checkout domain — user must also connect the pixel inside Shopify (Facebook & Instagram channel) to capture Purchase.
