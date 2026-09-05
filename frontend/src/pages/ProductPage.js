import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowCounterClockwise, Barbell, Check, Drop, Feather, LockSimple, Package,
  Ruler, ShieldCheck, Sparkle, Star, Truck, Lightning, SpeakerHigh, SpeakerSlash,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { getProduct, getReviews, formatPrice } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { Reveal, Stars } from '@/components/site/Reveal';
import { ProductCard } from '@/components/site/ProductCard';
import { ProductGallery, PhotoSwatches } from '@/components/site/ProductGallery';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const TestimonialVideo = ({ video, index }) => {
  const [muted, setMuted] = useState(true);
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.muted = muted;
  }, [muted]);
  useEffect(() => {
    ref.current?.play().catch(() => {});
  }, []);
  return (
    <div className="relative overflow-hidden aspect-[9/16] bg-[#2D2D2D] group" data-testid={`testimonial-video-${index}`}>
      <video
        ref={ref}
        poster={video.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={video.src} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-[#2D2D2D]/60 via-transparent to-transparent pointer-events-none" />
      <button
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? 'Unmute video' : 'Mute video'}
        data-testid={`testimonial-video-mute-${index}`}
        className="absolute top-3 right-3 h-9 w-9 rounded-full bg-[#2D2D2D]/50 backdrop-blur-md border border-[#F7F3F0]/30 flex items-center justify-center text-[#F7F3F0] hover:bg-[#2D2D2D]/80 transition-colors"
      >
        {muted ? <SpeakerSlash size={15} /> : <SpeakerHigh size={15} />}
      </button>
      <p className="absolute bottom-4 left-4 right-4 text-[#F7F3F0] text-sm font-bold uppercase tracking-[0.12em]">{video.label}</p>
    </div>
  );
};

const SIZE_GUIDE = [
  { size: 'XS', waist: '24–26"', hips: '34–36"' },
  { size: 'S', waist: '26–28"', hips: '36–38"' },
  { size: 'M', waist: '28–30"', hips: '38–40"' },
  { size: 'L', waist: '30–33"', hips: '40–43"' },
  { size: 'XL', waist: '33–36"', hips: '43–46"' },
];

const SIZE_LABELS = { XS: 'xs (4–6)', S: 's (8–10)', M: 'm (10–12)', L: 'l (12–14)', XL: 'xl (14–16)', 'One Size': 'one size' };

const FEATURES = [
  { icon: Feather, title: 'Seamless', text: 'A seamless knit means zero distractions and full focus on your training.' },
  { icon: Sparkle, title: 'Body-Contouring', text: 'Contour panels enhance your natural shape and physique.' },
  { icon: Lightning, title: 'Supportive High-Rise Waistband', text: 'A high-rise waistband that supports you gently and stays put while you move — no digging in.' },
  { icon: Barbell, title: 'Glute Scrunch', text: 'A ruched scrunch seam on the back lifts and enhances your glutes.' },
];

const PRODUCT_FAQS = [
  { q: 'Are they really squat proof?', a: 'Yes. Every fabric batch is tested to full squat depth under studio lighting. If light passes, it never ships.' },
  { q: 'How does sizing run?', a: 'True to size with four-way stretch. Between sizes? Size down for compression, up for comfort.' },
  { q: 'How do I wash them?', a: 'Cold machine wash inside out, no fabric softener, hang dry to protect the sculpt knit.' },
];

const RATING_BARS = [
  { stars: 5, pct: 86 }, { stars: 4, pct: 10 }, { stars: 3, pct: 3 }, { stars: 2, pct: 1 }, { stars: 1, pct: 0 },
];

export default function ProductPage() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [size, setSize] = useState(null);
  const [colour, setColour] = useState(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    setData(null);
    setSize(null);
    setColour(null);
    getProduct(handle)
      .then((d) => {
        setData(d);
        const colours = d.product.colours || [];
        if (colours.length) {
          setColour(colours[0].name);
        }
      })
      .catch(() => navigate('/shop'));
    getReviews(handle).then((d) => setReviews(d.reviews)).catch(() => setReviews([]));
  }, [handle, navigate]);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 550);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!data) {
    return <div className="py-40 text-center text-sm uppercase tracking-[0.2em] text-[#2D2D2D]/40 bg-white" data-testid="product-loading">Loading…</div>;
  }

  const { product, related } = data;
  const colours = product.colours || [];
  const activeColour = colours.find((c) => c.name === colour) || null;
  const galleryImages = activeColour ? activeColour.images : product.images;

  const add = (qty = 1) => {
    const chosen = size || (product.sizes.length === 1 ? product.sizes[0] : null);
    if (!chosen) {
      toast.error('Please choose a size first');
      return;
    }
    const variant = (product.variants || []).find(
      (v) => (!v.options?.colour || v.options.colour === colour) && (!v.options?.size || v.options.size === chosen)
    );
    addItem({ ...product, images: galleryImages, variant_id: variant?.id || product.variant_id }, chosen, qty, colour);
    toast.success(`${product.title} added to bag`);
  };

  const featureBlocks = [
    { img: galleryImages[1] || galleryImages[0], title: 'Glute-Sculpting', text: 'Bum scrunch & contour panels make your glutes pop.' },
    { img: galleryImages[2] || galleryImages[0], title: 'High-Stretch Fabric', text: 'Four-way stretch for full freedom of movement.' },
    { img: galleryImages[3] || galleryImages[galleryImages.length - 1], title: 'Stay-Put Waistband', text: 'No digging in, no riding up or down.' },
  ];

  const bestsellerBadge = product.bestseller ? (
    <span className="absolute left-5 top-5 z-10 bg-[#2D2D2D] text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5">Bestseller</span>
  ) : null;

  return (
    <div className="bg-white" data-testid={`product-page-${handle}`}>
      <section className="mx-auto max-w-[1400px] px-0 md:px-10 pt-0 md:pt-10 pb-16 grid lg:grid-cols-[1fr_460px] gap-8 lg:gap-14">
        <div className="px-0 md:px-0">
          <div className="hidden md:block mb-4 px-0">
            <Link to="/shop" data-testid="product-back-link" className="text-xs text-[#2D2D2D]/50 hover:text-[#2D2D2D] transition-colors">
              Shop / <span className="text-[#2D2D2D]">{product.title}</span>
            </Link>
          </div>
          <ProductGallery
            images={galleryImages}
            videos={[]}
            title={product.title}
            galleryKey={colour || 'default'}
            badge={bestsellerBadge}
          />
        </div>

        {/* RIGHT — Gymshark-style info panel */}
        <div className="px-6 md:px-0 pt-6 md:pt-0">
          <span className="inline-block bg-[#E8B4B8] text-[#2D2D2D] text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1" data-testid="product-tag">New</span>
          <h1 className="mt-3 font-display tracking-tight text-3xl md:text-4xl leading-tight" data-testid="product-title">{product.title}</h1>
          <p className="mt-1 text-sm text-[#2D2D2D]/50">Regular fit</p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-xl font-bold" data-testid="product-price">{formatPrice(product.price)}</span>
            {product.compare_at && <span className="text-sm text-[#2D2D2D]/40 line-through">{formatPrice(product.compare_at)}</span>}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Stars rating={product.rating} size={13} />
            <a href="#reviews" className="text-xs text-[#2D2D2D]/60 underline underline-offset-2">{product.rating} ({product.reviews_count})</a>
          </div>
          <p className="mt-5 text-sm text-[#2D2D2D]/70 leading-relaxed">{product.description}</p>

          {colours.length > 0 && (
            <div className="mt-7">
              <p className="text-xs text-[#2D2D2D]/60 mb-3">Colour: <span className="font-bold text-[#2D2D2D]" data-testid="selected-colour-name">{colour}</span></p>
              <PhotoSwatches colours={colours} value={colour} onChange={setColour} testIdPrefix="colour" />
            </div>
          )}

          <div className="mt-7 flex items-center justify-between">
            <p className="text-xs font-bold">Select a size</p>
            <Dialog>
              <DialogTrigger asChild>
                <button data-testid="size-guide-button" className="inline-flex items-center gap-1.5 text-xs text-[#2D2D2D]/60 hover:text-[#2D2D2D] underline underline-offset-4 transition-colors">
                  <Ruler size={13} /> Size Guide
                </button>
              </DialogTrigger>
              <DialogContent aria-describedby={undefined} className="bg-white border-[#2D2D2D]/10 max-w-md" data-testid="size-guide-dialog">
                <DialogTitle className="font-display uppercase tracking-tight text-2xl font-normal">Size Guide</DialogTitle>
                <p className="text-sm text-[#2D2D2D]/60 mt-1">Measure around your natural waist and fullest hip.</p>
                <table className="mt-4 w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.15em] text-[#2D2D2D]/50 border-b border-[#2D2D2D]/10">
                      <th className="py-2">Size</th><th className="py-2">Waist</th><th className="py-2">Hips</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_GUIDE.map((row) => (
                      <tr key={row.size} className="border-b border-[#2D2D2D]/5">
                        <td className="py-2.5 font-bold">{row.size}</td>
                        <td className="py-2.5">{row.waist}</td>
                        <td className="py-2.5">{row.hips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2" data-testid="size-selector">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                data-testid={`size-option-${s.toLowerCase().replace(/\s+/g, '-')}`}
                className={`py-3 text-sm border transition-colors duration-200 lowercase ${
                  size === s
                    ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] font-bold'
                    : 'bg-white border-[#2D2D2D]/20 hover:border-[#2D2D2D]'
                }`}
              >
                {SIZE_LABELS[s] || s}
              </button>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-[#2D2D2D]/60" data-testid="fit-note">
            <Check size={13} weight="bold" className="text-[#c98d92]" /> Customers say this fits true to size
          </p>

          <button
            onClick={() => add()}
            data-testid="add-to-cart-button"
            className="mt-5 w-full bg-[#2D2D2D] text-white py-4 text-sm font-bold uppercase tracking-[0.12em] hover:bg-[#E8B4B8] hover:text-[#2D2D2D] transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <LockSimple size={15} weight="bold" /> Add to Bag
          </button>
          <div className="mt-3 flex items-center justify-center gap-2" data-testid="bnpl-badges">
            <span className="border border-[#2D2D2D]/15 px-3 py-1.5 text-[11px] font-bold text-[#2D2D2D]/70">Klarna</span>
            <span className="border border-[#2D2D2D]/15 px-3 py-1.5 text-[11px] font-bold text-[#2D2D2D]/70">PayPal</span>
            <span className="text-[11px] text-[#2D2D2D]/45">Pay in 30 days or 3 interest-free payments</span>
          </div>

          <div className="mt-5 divide-y divide-[#2D2D2D]/10 border-y border-[#2D2D2D]/10" data-testid="delivery-strip">
            <div className="flex items-center gap-3 py-3.5 text-sm">
              <Truck size={18} weight="light" className="text-[#c98d92] shrink-0" />
              <span><span className="font-bold">Free Standard Delivery</span> on orders over £50</span>
            </div>
            <div className="flex items-center gap-3 py-3.5 text-sm">
              <Lightning size={18} weight="light" className="text-[#c98d92] shrink-0" />
              <span><span className="font-bold">Express Delivery</span> available — order by 2pm</span>
            </div>
            <div className="flex items-center gap-3 py-3.5 text-sm">
              <ArrowCounterClockwise size={18} weight="light" className="text-[#c98d92] shrink-0" />
              <span><span className="font-bold">Free size exchanges</span> · 30-day returns</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2" data-testid="trust-badges">
            {[
              { icon: ShieldCheck, label: 'Secure checkout' },
              { icon: Package, label: 'UK warehouse' },
              { icon: Drop, label: 'Sweat-wicking' },
            ].map((t) => (
              <div key={t.label} className="flex flex-col items-center gap-1.5 border border-[#2D2D2D]/10 py-3 px-2 text-center">
                <t.icon size={18} weight="light" className="text-[#c98d92]" />
                <span className="text-[10px] font-semibold text-[#2D2D2D]/70">{t.label}</span>
              </div>
            ))}
          </div>

          <Accordion type="single" collapsible className="mt-6" data-testid="product-info-accordion">
            <AccordionItem value="features" className="border-[#2D2D2D]/10">
              <AccordionTrigger className="text-sm font-bold hover:text-[#c98d92]" data-testid="accordion-features">Description & Features</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-5 py-2">
                  {FEATURES.map((f) => (
                    <div key={f.title} className="flex gap-4">
                      <f.icon size={22} weight="light" className="text-[#c98d92] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold">{f.title}</p>
                        <p className="text-sm text-[#2D2D2D]/60 mt-0.5 leading-relaxed">{f.text}</p>
                      </div>
                    </div>
                  ))}
                  <ul className="text-sm text-[#2D2D2D]/60 space-y-1.5 pt-2 border-t border-[#2D2D2D]/10 list-disc pl-5">
                    <li>Squat-proof fabric for every rep</li>
                    <li>Glute-sculpting bum scrunch</li>
                    <li>Sweat-wicking, four-way stretch</li>
                    <li>Stay-put high-rise waistband</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="sizecare" className="border-[#2D2D2D]/10">
              <AccordionTrigger className="text-sm font-bold hover:text-[#c98d92]" data-testid="accordion-sizecare">Size & Care</AccordionTrigger>
              <AccordionContent className="text-sm text-[#2D2D2D]/70 leading-relaxed">
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>High-rise, full length</li>
                  <li>Model is 5'6" and wears size S</li>
                  <li>78% Nylon, 22% Elastane seamless knit</li>
                  <li>Cold machine wash, hang dry</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="delivery" className="border-[#2D2D2D]/10">
              <AccordionTrigger className="text-sm font-bold hover:text-[#c98d92]" data-testid="accordion-delivery">Delivery & Returns</AccordionTrigger>
              <AccordionContent className="text-sm text-[#2D2D2D]/70 leading-relaxed">
                Orders placed before 2pm ship same day from our UK warehouse. Standard tracked delivery (2–3 working days) is £3.95 or free over £50; express next-day is £5.95. 30-day returns on unworn items; size exchanges are always free.
              </AccordionContent>
            </AccordionItem>
            {PRODUCT_FAQS.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-[#2D2D2D]/10">
                <AccordionTrigger className="text-sm font-bold hover:text-[#c98d92]" data-testid={`accordion-faq-${i}`}>{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-[#2D2D2D]/70 leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Feature trio — Gymshark style image blocks */}
      <section className="border-t border-[#2D2D2D]/10" data-testid="feature-trio">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-16 md:py-24 grid md:grid-cols-3 gap-4">
          {featureBlocks.map((b, i) => (
            <Reveal key={b.title} delay={0.08 * i}>
              <div data-testid={`feature-block-${i}`}>
                <div className="relative overflow-hidden aspect-[4/5] bg-[#F7F3F0]">
                  <img src={b.img} alt={b.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover hover:scale-105 transition-transform duration-[1200ms]" />
                </div>
                <h3 className="mt-5 font-display uppercase tracking-tight text-xl md:text-2xl">{b.title}</h3>
                <p className="mt-1.5 text-sm text-[#2D2D2D]/60">{b.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Customer video testimonials */}
      {(product.videos || []).length > 0 && (
        <section className="border-t border-[#2D2D2D]/10 py-16 md:py-24" data-testid="video-testimonials-section">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#c98d92]">Real customers, real confidence</p>
            <h2 className="mt-3 font-display uppercase tracking-tight text-3xl md:text-5xl mb-12">See Them On Real Women</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              {product.videos.map((v, i) => (
                <Reveal key={v.src} delay={0.08 * i}>
                  <TestimonialVideo video={v} index={i} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews with rating snapshot */}
      <section id="reviews" className="bg-[#F7F3F0] border-y border-[#2D2D2D]/10 py-16 md:py-24" data-testid="product-reviews-section">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <h2 className="font-display uppercase tracking-tight text-3xl md:text-5xl mb-12">Reviews</h2>
          <div className="grid md:grid-cols-[280px_1fr] gap-10 mb-12">
            <Reveal>
              <div data-testid="rating-snapshot">
                <p className="font-display text-6xl">{product.rating}</p>
                <Stars rating={product.rating} size={18} className="mt-2" />
                <p className="mt-2 text-sm text-[#2D2D2D]/60">Based on {product.reviews_count} reviews</p>
                <div className="mt-5 space-y-2">
                  {RATING_BARS.map((b) => (
                    <div key={b.stars} className="flex items-center gap-3 text-xs">
                      <span className="w-6 font-bold">{b.stars}★</span>
                      <div className="flex-1 h-2 bg-[#2D2D2D]/10 overflow-hidden">
                        <div className="h-full bg-[#E8B4B8]" style={{ width: `${b.pct}%` }} />
                      </div>
                      <span className="w-8 text-[#2D2D2D]/50">{b.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <div className="grid md:grid-cols-2 gap-4">
              {reviews.slice(0, 4).map((r) => (
                <Reveal key={r.id}>
                  <div className="bg-white border border-[#2D2D2D]/10 p-6 h-full" data-testid={`product-review-${r.id}`}>
                    <div className="flex items-center justify-between">
                      <Stars rating={r.rating} size={13} />
                      {r.verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#c98d92]">
                          <Check size={12} weight="bold" /> Verified buyer
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 font-bold text-sm">{r.title}</h3>
                    <p className="mt-2 text-sm text-[#2D2D2D]/60 leading-relaxed">{r.text}</p>
                    <p className="mt-4 text-xs font-bold">{r.name} <span className="font-normal text-[#2D2D2D]/40">· {r.location}</span></p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-16 md:py-24" data-testid="related-products-section">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <h2 className="font-display uppercase tracking-tight text-3xl md:text-5xl mb-12">Get The Look</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => (
                <ProductCard key={p.handle} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#2D2D2D]/10 shadow-[0_-20px_40px_rgba(45,45,45,0.08)]"
            data-testid="sticky-add-to-cart"
          >
            <div className="mx-auto max-w-[1400px] px-4 md:px-10 py-3 flex items-center gap-3">
              <img src={galleryImages[0]} alt="" className="hidden sm:block h-12 w-10 object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm truncate">{product.title}</p>
                <p className="text-xs text-[#2D2D2D]/50">
                  {formatPrice(product.price)}{colour ? ` · ${colour}` : ''}{size ? ` · ${size}` : ''}
                </p>
              </div>
              <div className="hidden md:flex gap-1.5">
                {product.sizes.slice(0, 5).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    data-testid={`sticky-size-${s.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`px-3 py-2 text-xs border transition-colors lowercase ${size === s ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] font-bold' : 'border-[#2D2D2D]/15 hover:border-[#2D2D2D]'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={() => add()}
                data-testid="sticky-add-to-cart-button"
                className="bg-[#2D2D2D] text-white px-7 py-3.5 text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#E8B4B8] hover:text-[#2D2D2D] transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <LockSimple size={14} weight="bold" /> Add to Bag
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
