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
  'how-we-test-leggings-for-squat-proofing': {
    titleTag: 'How We Test Our Leggings for Squat-Proofing | Sculptiva',
    metaDesc:
      'A look inside our actual squat-proof testing process — the stretch test, the lighting, the angle — before any fabric makes it into a finished pair of leggings.',
    h1: 'How We Test Our Leggings for Squat-Proofing',
    datePublished: '2026-06-14',
    excerpt: 'Inside our actual squat-proof testing process — the stretch test, the light box, the angle.',
    image: LEGGINGS_IMG,
    body:
      'Most brands print "squat-proof" on a swing tag and never test it. Ours goes through a specific process before a fabric batch is approved. Every roll of fabric is cut, sewn into a sample, and stretched to full squat depth over a light box — the same conditions that expose thinning fabric under a gym mirror or a phone camera. We check from directly behind, at the angle a training partner or a mirror actually sees, not a flat lay on a table. If light passes through and skin tone shows, the batch is rejected before it reaches production, regardless of how the fabric performs in other tests like colour-fastness or stretch recovery. This isn\'t a one-off pre-launch check either — batches are periodically re-tested through the production run, because fabric mills can drift on density between orders even when the spec sheet stays the same. It\'s a slower, more expensive way to source fabric than trusting a supplier\'s spec sheet. It\'s also the only way we\'re comfortable putting "squat-proof" on a product page.',
    faqs: [
      { q: 'Do you test every batch of fabric, or just the first sample?', a: "Every batch. Fabric density can drift between production runs even from the same supplier, so a pass on the first sample doesn't guarantee later batches meet the same standard." },
      { q: 'What exactly fails a squat-proof test?', a: 'Any visible skin tone or colour change through the fabric when stretched to full squat depth under bright light, viewed from behind — that\'s an automatic rejection regardless of how the fabric performs elsewhere.' },
      { q: "Can I request test results for a specific pair I've bought?", a: "We don't publish per-batch lab reports publicly, but our customer team can talk through our testing process for any current product — get in touch via our contact page." },
    ],
    primary: { label: 'Shop Squat-Proof Leggings', href: '/collections/squat-proof-leggings' },
    links: [
      { label: 'What Makes Leggings Squat Proof?', href: '/blog/what-makes-leggings-squat-proof' },
      { label: 'SculptFlex Contour Leggings', href: '/products/sculptflex-contour-leggings' },
    ],
  },
  'squat-proof-vs-see-through-how-to-tell-before-you-buy': {
    titleTag: 'Squat-Proof vs See-Through: How to Tell Before You Buy | Sculptiva',
    metaDesc:
      'How to spot see-through leggings before you buy — without needing to actually squat in the changing room. Five checks you can do from the product photos and fabric description alone.',
    h1: 'Squat-Proof vs See-Through: How to Tell Before You Buy',
    datePublished: '2026-06-17',
    excerpt: 'Five checks to spot see-through leggings from the listing alone — before you buy.',
    image: LEGGINGS_IMG,
    body:
      "You can't squat-test leggings before you've bought them, but you can spot the warning signs from the listing alone. First, check the fabric weight if it's listed — anything under roughly 250 grams per square metre is worth being cautious about; denser fabric is harder to see through. Second, look at the product photography itself: if every photo is shot standing straight-on with no movement or stretch shots, that's often because the fabric doesn't hold up under stretch. Third, read the fabric composition — a high spandex/elastane percentage (above roughly 18-22%) paired with a double-knit or brushed construction tends to perform better than a thin single-jersey blend. Fourth, check for language that's specific rather than vague — \"tested to full squat depth\" says more than \"buttery soft, second-skin feel.\" Finally, check reviews specifically for the words \"see-through,\" \"sheer,\" or \"opaque\" rather than just star ratings, since overall ratings often don't reflect this one issue if the fit and comfort are otherwise good.",
    faqs: [
      { q: "Does fabric weight alone guarantee leggings won't be see-through?", a: 'No — weight matters, but weave tightness and compression fit matter just as much. A dense double-knit at a moderate weight can outperform a heavier but loosely woven fabric.' },
      { q: 'Are darker colours automatically less see-through?', a: 'Not automatically, but darker colours do hide thinning fabric better than light colours or pastels, which show sheerness more readily under the same fabric construction.' },
      { q: "What's the fastest way to check if leggings I already own are see-through?", a: "Stretch the fabric tight over your knuckles under a bright light — if you can see your skin tone change through it, it isn't squat-proof, regardless of the label." },
    ],
    primary: { label: 'Shop Squat-Proof Leggings', href: '/collections/squat-proof-leggings' },
    links: [
      { label: 'What Makes Leggings Squat Proof?', href: '/blog/what-makes-leggings-squat-proof' },
      { label: 'How We Test for Squat-Proofing', href: '/blog/how-we-test-leggings-for-squat-proofing' },
    ],
  },
  'high-waisted-vs-mid-rise-leggings': {
    titleTag: 'High-Waisted vs Mid-Rise Leggings: Which Is Right for You? | Sculptiva',
    metaDesc:
      'High-waisted and mid-rise leggings sit differently, support differently, and suit different workouts. Here\'s how to pick between them.',
    h1: 'High-Waisted vs Mid-Rise Leggings: Which Is Right for You?',
    datePublished: '2026-06-20',
    excerpt: 'Where the waistband sits changes support and movement. How to pick between them.',
    image: DARK_IMG,
    body:
      "The difference comes down to where the waistband sits and what that means for support and movement. High-waisted leggings sit above the belly button, giving full core coverage and a wider band of compression — better for weight training, running, and anything where you don't want to think about your waistband. Mid-rise sits at or just below the belly button, offering more freedom through the torso and a lower profile under cropped tops, which suits Pilates, yoga, or lower-intensity training where a wide, high band can feel restrictive during deep bends. Neither is objectively better — it's a question of what you're doing in them. If you're deciding based on tummy coverage alone, high-waisted usually wins, but if you find high-waisted bands digging in during seated or twisting movements, mid-rise is worth trying. Body shape matters too: a longer torso often suits high-waisted better since there's more room for the band to sit naturally above the navel without riding up.",
    faqs: [
      { q: 'Which is better for weight training, high-waisted or mid-rise?', a: 'High-waisted, generally — the wider band and higher coverage stay in place better during heavy compound lifts like squats and deadlifts.' },
      { q: 'Does mid-rise give less tummy support than high-waisted?', a: 'It typically covers less of the torso, but a well-constructed mid-rise band can still use the same graduated-compression fabric — the difference is coverage area, not necessarily compression quality.' },
      { q: 'Can I wear high-waisted leggings for yoga?', a: 'Yes, but some people find the taller band restrictive during deep forward folds or twists — it\'s a personal preference rather than a hard rule.' },
    ],
    primary: { label: 'Shop High-Waisted Leggings', href: '/collections/high-waisted-gym-leggings' },
    links: [
      { label: 'High-Waisted vs Tummy Control', href: '/blog/high-waisted-vs-tummy-control-leggings' },
      { label: 'Seamless Gym Leggings', href: '/collections/seamless-gym-leggings' },
    ],
  },
  'do-tummy-control-leggings-really-work': {
    titleTag: 'Do Tummy Control Leggings Really Work? | Sculptiva',
    metaDesc:
      "What tummy control leggings actually do to your body, what they don't do, and how to tell if a pair is genuinely engineered for compression or just marketed that way.",
    h1: 'Do Tummy Control Leggings Really Work?',
    datePublished: '2026-06-23',
    excerpt: "What they actually do, what they don't, and how to spot real compression.",
    image: DARK_IMG,
    body:
      'They work, but it helps to be precise about what "work" means. Tummy control leggings use graduated compression — firmer through the core, easing off toward the edges — to smooth the silhouette and provide light postural support while you move. That\'s a real, physical effect you can feel and see immediately. What they don\'t do is change your body shape permanently or replace anything like exercise or diet — the effect lasts as long as you\'re wearing them, the same as any compression garment. The other thing genuine tummy control depends on is the compression actually being engineered into the waistband, not just implied by a legging being high-waisted. A tall waistband with ordinary stretch fabric will hold you in slightly by virtue of covering more skin, but it isn\'t the same as a waistband built with a denser, targeted-compression panel. If a product only says "high-waisted" and never mentions compression, support, or a sculpting panel specifically, it\'s worth asking before assuming it does more than a regular pair.',
    faqs: [
      { q: 'Will tummy control leggings flatten my stomach permanently?', a: "No — the compression effect lasts while you're wearing them, similar to any compression garment. They don't change body composition." },
      { q: 'Is tummy control the same as shapewear?', a: 'Similar principle, different intensity — tummy control leggings are built for movement and workouts, so the compression is generally lighter and more breathable than dedicated shapewear.' },
      { q: 'How do I know if leggings have real tummy control or just a high waistband?', a: 'Look for the brand explicitly mentioning graduated compression or a sculpting/support panel — a plain high-rise cut alone doesn\'t guarantee compression engineering.' },
    ],
    primary: { label: 'Shop High-Waisted Leggings', href: '/collections/high-waisted-gym-leggings' },
    links: [
      { label: 'High-Waisted vs Tummy Control', href: '/blog/high-waisted-vs-tummy-control-leggings' },
      { label: 'High-Waisted vs Mid-Rise', href: '/blog/high-waisted-vs-mid-rise-leggings' },
    ],
  },
  'how-to-measure-yourself-for-leggings-at-home': {
    titleTag: 'How to Measure Yourself for Leggings at Home | Sculptiva',
    metaDesc:
      'The three measurements that actually matter when buying leggings online, and how to take them accurately with a tape measure and no fitting room.',
    h1: 'How to Measure Yourself for Leggings at Home',
    datePublished: '2026-06-26',
    excerpt: 'The three measurements that decide fit — waist, hip, inseam — done at home.',
    image: LEGGINGS_IMG,
    body:
      "Three measurements decide fit more than any other: waist, hip, and inseam. Waist is measured at the narrowest point, usually just above the belly button — not where your trousers currently sit, which can be lower. Hip is measured at the widest point, typically across the widest part of your seat, keeping the tape parallel to the floor rather than angled. Inseam matters most for length: measure from the crotch seam of a well-fitting pair of leggings or trousers you already own, down to where you want the hem to sit, rather than your full outer leg length, which includes the waistband and throws the number off. Take all three in centimetres or inches consistently, without pulling the tape tight enough to compress skin. If you're between two sizes on our chart, sizing up is usually the safer call for compression leggings specifically, since fabric with a strong compression element will always feel tighter than a non-compression legging at the same labelled size.",
    faqs: [
      { q: 'Should I measure over clothes or against skin?', a: 'Against skin or light clothing — measuring over bulky clothing adds inaccurate inches to every measurement.' },
      { q: 'What if my waist and hip measurements fall into two different sizes on the chart?', a: 'Size to your hip measurement for leggings specifically, since waistbands on most of our styles use compression fabric that stretches to accommodate a smaller waist.' },
      { q: 'How often should I re-measure?', a: "Body measurements can shift over months, especially around training changes, so it's worth re-measuring before any purchase if it's been six months or more since your last check." },
    ],
    primary: { label: 'Shop Leggings', href: '/collections/leggings' },
    links: [
      { label: 'High-Waisted Gym Leggings', href: '/collections/high-waisted-gym-leggings' },
      { label: 'Seamless Gym Leggings', href: '/collections/seamless-gym-leggings' },
    ],
  },
};

export const BLOG_ORDER = [
  'how-to-measure-yourself-for-leggings-at-home',
  'do-tummy-control-leggings-really-work',
  'high-waisted-vs-mid-rise-leggings',
  'squat-proof-vs-see-through-how-to-tell-before-you-buy',
  'how-we-test-leggings-for-squat-proofing',
  'high-waisted-vs-tummy-control-leggings',
  'what-is-a-scrunch-seam',
  'what-makes-leggings-squat-proof',
];

// Collection handle -> related articles (for the "Learn more" block on collections).
export const COLLECTION_ARTICLE = {
  'squat-proof-leggings': [
    { slug: 'what-makes-leggings-squat-proof', label: 'What makes leggings squat proof?' },
    { slug: 'how-we-test-leggings-for-squat-proofing', label: 'How we test our leggings for squat-proofing' },
    { slug: 'squat-proof-vs-see-through-how-to-tell-before-you-buy', label: 'Squat-proof vs see-through: how to tell before you buy' },
  ],
  'scrunch-bum-leggings': [
    { slug: 'what-is-a-scrunch-seam', label: 'What is a scrunch seam?' },
  ],
  'high-waisted-gym-leggings': [
    { slug: 'high-waisted-vs-tummy-control-leggings', label: 'High-waisted vs tummy control leggings' },
    { slug: 'high-waisted-vs-mid-rise-leggings', label: 'High-waisted vs mid-rise leggings' },
    { slug: 'do-tummy-control-leggings-really-work', label: 'Do tummy control leggings really work?' },
  ],
};
