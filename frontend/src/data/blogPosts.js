// Blog / Journal content. Mirrored in backend/seo.py BLOG for the static SEO
// prerender; keep the two in sync.

const LEGGINGS_IMG =
  'https://images.unsplash.com/photo-1606902965551-dce093cda6e7?crop=entropy&cs=srgb&fm=jpg&q=85';
const DARK_IMG =
  'https://images.unsplash.com/photo-1769196716871-39a0712fb037?crop=entropy&cs=srgb&fm=jpg&q=85';

export const BLOG_POSTS = {
  'what-makes-leggings-squat-proof': {
    titleTag: 'What Makes Leggings Squat Proof? The Real Answer | Sculptiva',
    metaDesc:
      'What actually makes leggings squat-proof — the fabric, the weave, the test. No marketing fluff, just the real answer from a UK activewear brand that tests to full squat depth.',
    h1: 'What Makes Leggings Squat Proof? The Real Answer',
    datePublished: '2026-06-05',
    excerpt: 'The real answer — fabric density, weave, and the test that actually matters.',
    image: LEGGINGS_IMG,
    body:
      '"Squat proof" gets printed on a lot of leggings that haven\'t actually been tested for it. Here\'s what the term should mean, and how to check it yourself before you buy. Opacity under stretch comes down to three things: fabric density (grams per square metre — thin fabric is the single biggest cause of see-through leggings), weave tightness (a dense double-knit holds its structure under load; a loose single-jersey knit doesn\'t), and compression fit (fabric that\'s genuinely engineered to stretch four ways without thinning, versus fabric that just happens to be elastic). The test that actually matters isn\'t a flat lay in a product photo — it\'s fabric stretched to full squat depth, under bright light, checked from behind. That\'s the standard every Sculptiva legging is held to before it ships. If you want to check a pair you already own: stretch the fabric tight over your knuckles under a bright light. If you can see your skin tone change through it, it isn\'t squat-proof, regardless of what the label says.',
    faqs: [
      { q: 'How do you test if leggings are actually squat proof?', a: 'We test the fabric under stretch, at full squat depth, under bright light — the same conditions a mirror or gym camera would catch, not just a flat lay.' },
      { q: 'What fabric makes leggings squat proof?', a: 'A dense double-knit fabric with a tight weave and four-way stretch. Thin, single-layer knits are the ones that go see-through under stretch.' },
      { q: 'Are squat-proof leggings also good for everyday wear?', a: 'Yes — the same opacity and compression that hold up in a squat also mean no visible panty lines or sheerness in daily wear.' },
    ],
    primary: { label: 'Shop Squat-Proof Leggings', href: '/collections/squat-proof-leggings' },
    links: [
      { label: 'Seamless Gym Leggings', href: '/collections/seamless-gym-leggings' },
      { label: 'SculptFlex Contour Leggings', href: '/products/sculptflex-contour-leggings' },
      { label: 'Glute Sculpt Leggings', href: '/products/glute-sculpt-leggings' },
    ],
  },
  'what-is-a-scrunch-seam': {
    titleTag: 'What Is a Scrunch Seam? The Construction Behind Scrunch Bum Leggings | Sculptiva',
    metaDesc:
      "What a scrunch seam actually is, how it lifts and shapes without compromising coverage, and why it's a construction detail — not a push-up trick.",
    h1: 'What Is a Scrunch Seam?',
    datePublished: '2026-06-08',
    excerpt: "The construction behind scrunch bum leggings — and why it's not a push-up trick.",
    image: LEGGINGS_IMG,
    body:
      "A scrunch seam is a curved seam and contour panel sewn into the back of a legging that gathers the fabric to lift and shape — similar in principle to ruching on a dress, but structural rather than decorative, and built to hold that shape under movement rather than just standing still. It works because the seam changes how the fabric sits against the body: instead of one flat panel stretching evenly, the gathered seam creates definition along the natural curve. The most common question is whether this comes at the cost of coverage or opacity — it shouldn't. A well-made scrunch seam sits on top of the same dense, squat-proof base fabric as the rest of the legging; the shaping is additive, not a thinner patch of fabric doing double duty. The seam placement matters too — too high and it sits above the natural curve looking unnatural; too low and it doesn't lift at all. Sculptiva's scrunch styles position the seam based on genuine fit testing across body shapes, not just one sample size.",
    faqs: [
      { q: 'What is a scrunch seam?', a: 'A curved seam and contour panel sewn into the back of the legging that gathers the fabric to lift and shape the glutes — similar to ruching, but structural rather than decorative.' },
      { q: 'Do scrunch bum leggings show cellulite or lines?', a: "No — the dense double-knit fabric used underneath the scrunch seam is opaque and squat-proof tested, so the shaping effect doesn't come with see-through fabric." },
      { q: 'Are scrunch leggings good for lifting, or just for looks?', a: "Both — ours are squat-proof tested to full depth, so they're built to perform in a lifting session, not just to photograph well." },
    ],
    primary: { label: 'Shop Scrunch Bum Leggings', href: '/collections/scrunch-bum-leggings' },
    links: [
      { label: 'Squat-Proof Leggings', href: '/collections/squat-proof-leggings' },
      { label: 'Glute Sculpt Leggings', href: '/products/glute-sculpt-leggings' },
      { label: 'SculptFlex Contour Leggings', href: '/products/sculptflex-contour-leggings' },
    ],
  },
  'high-waisted-vs-tummy-control-leggings': {
    titleTag: "High-Waisted vs Tummy Control Leggings: What's Actually the Difference? | Sculptiva",
    metaDesc:
      'High-waisted describes where the waistband sits. Tummy control describes the compression. They\'re not the same thing — here\'s how to tell what you\'re actually buying.',
    h1: "High-Waisted vs Tummy Control: What's the Difference?",
    datePublished: '2026-06-11',
    excerpt: "Two terms, two different things. Here's how to tell what you're actually buying.",
    image: DARK_IMG,
    body:
      'These two terms get used interchangeably in product listings, but they describe two separate things, and a legging can have one without the other. High-waisted is about rise — where the waistband sits relative to your natural waistline. A true high-rise sits above the belly button, not just "higher than low-rise." Tummy control is about compression — whether the waistband fabric is engineered to hold and smooth, using a graduated-compression construction (firmer through the core, gentler at the edges) rather than just being elastic. You can have a high-waisted legging with a waistband that\'s no more supportive than a regular hem — it\'s just tall. And you can, in theory, have genuine compression starting lower on the body, though in practice most tummy-control leggings are also high-waisted because that\'s where compression is most useful. The way to tell the difference when shopping: look for the brand explicitly describing graduated compression or a "sculpting" panel, not just "high-waisted" in the title — that\'s the signal it\'s engineered for support, not just cut higher.',
    faqs: [
      { q: 'Do high-waisted leggings actually give tummy control?', a: 'Yes, when the waistband uses real compression fabric rather than just sitting higher — ours use a graduated-compression high-rise band, not just a taller hem.' },
      { q: 'Will the waistband dig in or roll down?', a: "No — it's built to sit flat through movement; this is one of the most-tested claims across our reviews." },
      { q: "What's the difference between high-waisted and tummy control leggings?", a: 'High-waisted describes the rise (where the waistband sits); tummy control describes the compression level. Ours combine both.' },
    ],
    primary: { label: 'Shop High-Waisted Leggings', href: '/collections/high-waisted-gym-leggings' },
    links: [
      { label: 'Black Gym Leggings', href: '/collections/black-gym-leggings' },
      { label: 'Glute Sculpt Leggings', href: '/products/glute-sculpt-leggings' },
      { label: 'Seamless Sculpt Leggings', href: '/products/seamless-sculpt-leggings' },
      { label: 'SculptFlex Contour Leggings', href: '/products/sculptflex-contour-leggings' },
    ],
  },
};

export const BLOG_ORDER = [
  'high-waisted-vs-tummy-control-leggings',
  'what-is-a-scrunch-seam',
  'what-makes-leggings-squat-proof',
];

// Collection handle -> related article (for the "Learn more" link on collections).
export const COLLECTION_ARTICLE = {
  'squat-proof-leggings': { slug: 'what-makes-leggings-squat-proof', label: 'What makes leggings squat proof?' },
  'scrunch-bum-leggings': { slug: 'what-is-a-scrunch-seam', label: 'What is a scrunch seam?' },
  'high-waisted-gym-leggings': { slug: 'high-waisted-vs-tummy-control-leggings', label: 'High-waisted vs tummy control leggings' },
};
