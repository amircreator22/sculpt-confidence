// Curated (style/attribute-based) collections. These pull from the existing
// catalogue by product handle — they are not separate Shopify collections.
// Copy here is mirrored in backend/seo.py CURATED for the static SEO prerender;
// keep the two in sync.

const LEGGINGS_IMG =
  'https://images.unsplash.com/photo-1606902965551-dce093cda6e7?crop=entropy&cs=srgb&fm=jpg&q=85';
const DARK_IMG =
  'https://images.unsplash.com/photo-1769196716871-39a0712fb037?crop=entropy&cs=srgb&fm=jpg&q=85';

export const CURATED = {
  'seamless-gym-leggings': {
    title: 'Seamless Gym Leggings',
    metaDesc:
      'Seamless gym leggings with buttery-soft, second-skin knit and zero front seam. Squat-proof, high-waisted, sweat-wicking. Free UK shipping over £50.',
    body:
      "Seamless gym leggings are built from a single continuous knit rather than stitched panels, which is why they sit flush against your skin with no front seam to dig in, roll, or show under fitted tops. Our seamless styles use a dense double-knit fabric that stretches four ways without going see-through at full squat depth, paired with a high-rise waistband that holds its shape through a full session — not just the first ten minutes. Whether you're going straight from a lift to the school run or wearing them as your everyday-comfort layer, seamless construction means there's nothing to chafe, dig, or ride up.",
    faqs: [
      { q: 'What makes leggings "seamless"?', a: "They're knitted in one continuous piece rather than cut and sewn from separate fabric panels, so there's no front seam or side stitching to rub or show through leggings." },
      { q: 'Are seamless leggings still squat proof?', a: 'Yes — seam count and squat-proofing are separate things. Our seamless styles use the same dense, opaque double-knit fabric as our other squat-proof leggings.' },
      { q: 'Do seamless leggings run small?', a: "They're designed with four-way stretch to move with you, but we recommend checking the size guide, as seamless knits fit closer to the body than stitched leggings." },
    ],
    breadcrumb: [
      { name: 'Home', href: '/' },
      { name: 'Leggings', href: '/collections/leggings' },
      { name: 'Seamless', href: '/collections/seamless-gym-leggings' },
    ],
    productHandles: ['seamless-sculpt-leggings'],
    image: LEGGINGS_IMG,
  },
  'scrunch-bum-leggings': {
    title: 'Scrunch Bum Leggings',
    metaDesc:
      'Scrunch bum leggings with a contour scrunch seam that lifts and shapes. Squat-proof, high-waisted, worn by 40,000+ women. Free UK shipping over £50.',
    body:
      "Scrunch bum leggings use a contour seam and targeted fabric shading across the back panel to lift and shape your natural curves — it's a construction detail, not a push-up trick, so it holds its shape from the first rep to the last. Ours pair the scrunch seam with squat-proof, dense double-knit fabric and a high-rise waistband, so the lift doesn't come at the cost of coverage. This is the design our community was built on: over 40,000 women wear the scrunch styles at the gym, on dog walks, and everywhere in between.",
    faqs: [
      { q: 'What is a scrunch seam?', a: 'A curved seam and contour panel sewn into the back of the legging that gathers the fabric to lift and shape the glutes — similar to ruching, but structural rather than decorative.' },
      { q: 'Do scrunch bum leggings show cellulite or lines?', a: 'No — the dense double-knit fabric used underneath the scrunch seam is opaque and squat-proof tested, so the shaping effect doesn\'t come with see-through fabric.' },
      { q: 'Are scrunch leggings good for lifting, or just for looks?', a: 'Both — ours are squat-proof tested to full depth, so they\'re built to perform in a lifting session, not just to photograph well.' },
    ],
    breadcrumb: [
      { name: 'Home', href: '/' },
      { name: 'Leggings', href: '/collections/leggings' },
      { name: 'Scrunch Bum', href: '/collections/scrunch-bum-leggings' },
    ],
    productHandles: ['glute-sculpt-leggings', 'sculptflex-contour-leggings'],
    image: LEGGINGS_IMG,
  },
  'high-waisted-gym-leggings': {
    title: 'High Waisted Gym Leggings',
    metaDesc:
      'High-waisted gym leggings with sculpting tummy-control compression that holds without digging in. Squat-proof, seamless options available. Free UK shipping over £50.',
    body:
      "A true high-rise waistband sits above the natural waistline and uses graduated compression — firmer through the core, gentler at the edges — to smooth and support without leaving a mark when you sit down or bend. That's the difference between tummy-control leggings that work and ones that just look high-waisted in product photos. Every pair here uses the same sculpting waistband, tested through squats, deadlifts and full training sessions, so it holds through a 45-minute session, a school run, and everything after.",
    faqs: [
      { q: 'Do high-waisted leggings actually give tummy control?', a: 'Yes, when the waistband uses real compression fabric rather than just sitting higher — ours use a graduated-compression high-rise band, not just a taller hem.' },
      { q: 'Will the waistband dig in or roll down?', a: 'No — it\'s built to sit flat through movement; this is one of the most-tested claims across our reviews.' },
      { q: "What's the difference between high-waisted and tummy control leggings?", a: 'High-waisted describes the rise (where the waistband sits); tummy control describes the compression level. Ours combine both.' },
    ],
    breadcrumb: [
      { name: 'Home', href: '/' },
      { name: 'Leggings', href: '/collections/leggings' },
      { name: 'High Waisted', href: '/collections/high-waisted-gym-leggings' },
    ],
    productHandles: ['glute-sculpt-leggings', 'seamless-sculpt-leggings', 'sculptflex-contour-leggings'],
    image: LEGGINGS_IMG,
  },
  'black-gym-leggings': {
    title: 'Black Gym Leggings',
    metaDesc:
      'Black gym leggings that are squat-proof, high-waisted and seamless-soft. The everyday shade in every Sculptiva style. Free UK shipping over £50.',
    body:
      "Black is the shade that goes with everything in your kit bag, which is why it's the first colourway in every Sculptiva style — Glute Sculpt, Seamless Sculpt and SculptFlex all come in a true, non-fading black. Because black fabric shows compression and seam quality more than any other shade, we hold every black pair to the same squat-proof, four-way-stretch standard as the rest of the range, so what you see in the product photo is what holds up in the mirror after squat 20.",
    faqs: [
      { q: 'Do black leggings go see-through more than other colours?', a: "It's actually the opposite in cheap fabric — lighter shades usually show through first. Our black styles use the same dense, opacity-tested fabric as every other colourway." },
      { q: 'Will these fade or go grey after washing?', a: 'No — follow the wash guide (cold wash, no fabric softener) and the black dye is designed to hold.' },
      { q: 'Which black leggings are the most squat-proof?', a: 'All of them — squat-proof testing is done on the base fabric, not per colour.' },
    ],
    breadcrumb: [
      { name: 'Home', href: '/' },
      { name: 'Leggings', href: '/collections/leggings' },
      { name: 'Black', href: '/collections/black-gym-leggings' },
    ],
    productHandles: ['glute-sculpt-leggings', 'seamless-sculpt-leggings', 'sculptflex-contour-leggings'],
    image: DARK_IMG,
  },
  'squat-proof-leggings': {
    title: 'Squat Proof Leggings',
    metaDesc:
      'Squat-proof leggings tested to full depth — dense double-knit fabric, high-waisted, zero see-through. Worn by 40,000+ women. Free UK shipping over £50.',
    body:
      '"Squat proof" isn\'t a marketing word here — it means fabric tested to full squat depth under gym lighting to confirm it stays fully opaque under stretch, not just when it\'s lying flat. Every pair in this collection is built from the same dense double-knit fabric with four-way stretch, paired with a high-rise waistband that won\'t roll or slip mid-set. If squat depth, deadlifts, or leg day is the reason you\'re shopping, this is the collection built specifically to survive it.',
    faqs: [
      { q: 'How do you test if leggings are actually squat proof?', a: 'We test the fabric under stretch, at full squat depth, under bright light — the same conditions a mirror or gym camera would catch, not just a flat lay.' },
      { q: 'What fabric makes leggings squat proof?', a: 'A dense double-knit fabric with a tight weave and four-way stretch. Thin, single-layer knits are the ones that go see-through under stretch.' },
      { q: 'Are squat-proof leggings also good for everyday wear?', a: 'Yes — the same opacity and compression that hold up in a squat also mean no visible panty lines or sheerness in daily wear.' },
    ],
    breadcrumb: [
      { name: 'Home', href: '/' },
      { name: 'Leggings', href: '/collections/leggings' },
      { name: 'Squat Proof', href: '/collections/squat-proof-leggings' },
    ],
    productHandles: ['glute-sculpt-leggings', 'seamless-sculpt-leggings', 'sculptflex-contour-leggings'],
    image: LEGGINGS_IMG,
  },
};

// Links block ("Shop by Style") shown on every collection page.
export const CURATED_LINKS = Object.keys(CURATED).map((handle) => ({
  handle,
  label: CURATED[handle].title,
}));
