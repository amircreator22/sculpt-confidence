import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, Check, LockSimple, Package, Ruler, ShieldCheck, Star, Truck, ArrowCounterClockwise,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { getProduct, getReviews, formatPrice } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { Reveal, Stars } from '@/components/site/Reveal';
import { ProductCard } from '@/components/site/ProductCard';
import { ProductGallery, ColourSwatches } from '@/components/site/ProductGallery';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const SIZE_GUIDE = [
  { size: 'XS', waist: '24–26"', hips: '34–36"' },
  { size: 'S', waist: '26–28"', hips: '36–38"' },
  { size: 'M', waist: '28–30"', hips: '38–40"' },
  { size: 'L', waist: '30–33"', hips: '40–43"' },
  { size: 'XL', waist: '33–36"', hips: '43–46"' },
];

const PRODUCT_FAQS = [
  { q: 'Are they really squat proof?', a: 'Yes. Every fabric batch is tested to full squat depth under studio lighting. If light passes, it never ships.' },
  { q: 'How does the scrunch sizing run?', a: 'True to size with high stretch. Between sizes? Size down for extra compression, up for all-day comfort.' },
  { q: 'Will the waistband roll down?', a: 'The high-rise waistband has an internal grip knit that stays put through deadlifts, sprints and yoga.' },
  { q: 'How do I wash them?', a: 'Cold machine wash, inside out, no fabric softener. Hang dry to protect the sculpt knit.' },
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
          const preferred = colours.find((c) => c.name === 'Charcoal Grey') || colours[0];
          setColour(preferred.name);
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
    return <div className="py-40 text-center text-sm uppercase tracking-[0.2em] text-[#2D2D2D]/40" data-testid="product-loading">Loading…</div>;
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
    addItem({ ...product, images: galleryImages }, chosen, qty, colour);
    toast.success(`${product.title}${colour ? ` (${colour}` : ''}${colour ? `, ${chosen})` : ` (${chosen})`} added to bag`);
  };

  const bestsellerBadge = product.bestseller ? (
    <span className="absolute left-5 top-5 z-10 bg-[#2D2D2D] text-[#F7F3F0] text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5">Bestseller</span>
  ) : null;

  return (
    <div data-testid={`product-page-${handle}`}>
      <section className="mx-auto max-w-[1400px] px-6 md:px-10 pt-8 md:pt-14 pb-24 grid lg:grid-cols-2 gap-10 lg:gap-16">
        <div>
          <Link to="/shop" data-testid="product-back-link" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#2D2D2D]/50 hover:text-[#c98d92] transition-colors mb-6">
            <ArrowLeft size={14} weight="bold" /> Back to shop
          </Link>
          <Reveal>
            <ProductGallery
              images={galleryImages}
              title={product.title}
              galleryKey={colour || 'default'}
              badge={bestsellerBadge}
            />
          </Reveal>
        </div>

        <div>
          <Reveal>
            <div className="flex items-center gap-3">
              <Stars rating={product.rating} size={15} />
              <span className="text-xs text-[#2D2D2D]/50 font-semibold">{product.rating} · {product.reviews_count} reviews</span>
            </div>
            <h1 className="mt-4 font-display uppercase tracking-tight text-4xl md:text-5xl leading-[1.0]" data-testid="product-title">{product.title}</h1>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-display text-3xl" data-testid="product-price">{formatPrice(product.price)}</span>
              {product.compare_at && (
                <span className="text-lg text-[#2D2D2D]/40 line-through">{formatPrice(product.compare_at)}</span>
              )}
            </div>
            <p className="mt-6 text-[#2D2D2D]/70 leading-relaxed text-sm md:text-base">{product.description}</p>
          </Reveal>

          {colours.length > 0 && (
            <Reveal delay={0.05}>
              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em]">
                  Colour — <span className="text-[#c98d92]" data-testid="selected-colour-name">{colour}</span>
                </p>
                <div className="mt-4">
                  <ColourSwatches colours={colours} value={colour} onChange={setColour} testIdPrefix="colour" />
                </div>
              </div>
            </Reveal>
          )}

          <Reveal delay={0.1}>
            <div className="mt-8 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Select size</p>
              <Dialog>
                <DialogTrigger asChild>
                  <button data-testid="size-guide-button" className="inline-flex items-center gap-2 text-xs font-semibold text-[#2D2D2D]/60 hover:text-[#c98d92] transition-colors underline underline-offset-4">
                    <Ruler size={14} /> Size Guide
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-[#F7F3F0] border-[#2D2D2D]/10 max-w-md" data-testid="size-guide-dialog">
                  <h3 className="font-display uppercase tracking-tight text-2xl">Size Guide</h3>
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
            <div className="mt-3 flex flex-wrap gap-2" data-testid="size-selector">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  data-testid={`size-option-${s.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`min-w-[52px] px-4 py-3 text-sm font-bold border transition-colors duration-300 ${
                    size === s
                      ? 'bg-[#2D2D2D] text-[#F7F3F0] border-[#2D2D2D]'
                      : 'bg-white border-[#2D2D2D]/15 hover:border-[#E8B4B8]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={() => add()}
              data-testid="add-to-cart-button"
              className="mt-6 w-full rounded-full bg-[#2D2D2D] text-[#F7F3F0] py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#E8B4B8] hover:text-[#2D2D2D] transition-colors duration-300 flex items-center justify-center gap-2"
            >
              Add to Bag — {formatPrice(product.price)}
            </button>
            <div className="mt-4 flex items-center justify-center gap-2" data-testid="bnpl-badges">
              {['Klarna', 'Clearpay', 'PayPal'].map((b) => (
                <span key={b} className="border border-[#2D2D2D]/15 bg-white px-3 py-1.5 text-[11px] font-bold tracking-wide text-[#2D2D2D]/70">{b}</span>
              ))}
              <span className="text-[11px] text-[#2D2D2D]/40">Buy now, pay later</span>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-8 grid sm:grid-cols-2 gap-3" data-testid="bundle-offers">
              <button
                onClick={() => add(3)}
                data-testid="bundle-buy2get1-button"
                className="text-left bg-[#E8B4B8]/30 border border-[#E8B4B8] p-5 hover:bg-[#E8B4B8]/50 transition-colors group"
              >
                <p className="font-display text-lg tracking-tight group-hover:text-[#c98d92] transition-colors">Buy 2, Get 1 Free</p>
                <p className="mt-1 text-xs text-[#2D2D2D]/60">Tap to add 3 — third pair free at checkout</p>
              </button>
              <button
                onClick={() => add(1)}
                data-testid="bundle-save25-button"
                className="text-left bg-white border border-[#2D2D2D]/15 p-5 hover:border-[#E8B4B8] transition-colors group"
              >
                <p className="font-display text-lg tracking-tight group-hover:text-[#c98d92] transition-colors">Bundle &amp; Save 25%</p>
                <p className="mt-1 text-xs text-[#2D2D2D]/60">Add the matching bra &amp; bands to unlock</p>
              </button>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-8 grid grid-cols-3 gap-2" data-testid="trust-badges">
              {[
                { icon: Truck, label: 'Free UK ship £50+' },
                { icon: ArrowCounterClockwise, label: '30-day returns' },
                { icon: ShieldCheck, label: 'Secure checkout' },
              ].map((t) => (
                <div key={t.label} className="flex flex-col items-center gap-2 bg-white border border-[#2D2D2D]/10 py-4 px-2 text-center">
                  <t.icon size={20} weight="light" className="text-[#c98d92]" />
                  <span className="text-[11px] font-semibold text-[#2D2D2D]/70">{t.label}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.25}>
            <Accordion type="single" collapsible className="mt-8" data-testid="product-info-accordion">
              <AccordionItem value="delivery" className="border-[#2D2D2D]/10">
                <AccordionTrigger className="text-sm font-bold uppercase tracking-[0.15em] hover:text-[#c98d92]" data-testid="accordion-delivery">
                  <span className="flex items-center gap-2"><Package size={16} /> Delivery Information</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-[#2D2D2D]/70 leading-relaxed">
                  Orders placed before 2pm ship same day from our UK warehouse. Standard tracked delivery (2–3 working days) is £3.95 or free over £50. Express next-day available at checkout for £5.95.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="returns" className="border-[#2D2D2D]/10">
                <AccordionTrigger className="text-sm font-bold uppercase tracking-[0.15em] hover:text-[#c98d92]" data-testid="accordion-returns">
                  <span className="flex items-center gap-2"><ArrowCounterClockwise size={16} /> Returns &amp; Exchanges</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-[#2D2D2D]/70 leading-relaxed">
                  30 days, no questions. Items must be unworn with tags on. Exchanges for a different size are always free — we cover return postage.
                </AccordionContent>
              </AccordionItem>
              {PRODUCT_FAQS.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-[#2D2D2D]/10">
                  <AccordionTrigger className="text-sm font-bold uppercase tracking-[0.15em] hover:text-[#c98d92]" data-testid={`accordion-faq-${i}`}>{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-[#2D2D2D]/70 leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      <section className="bg-white border-y border-[#2D2D2D]/10 py-20 md:py-28" data-testid="product-reviews-section">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="flex items-end justify-between mb-12">
            <h2 className="font-display uppercase tracking-tight text-3xl md:text-5xl">Community Reviews</h2>
            <div className="flex items-center gap-2">
              <Star size={18} weight="fill" className="text-[#E8B4B8]" />
              <span className="font-bold">{product.rating}</span>
            </div>
          </div>
          {reviews.length === 0 ? (
            <p className="text-sm text-[#2D2D2D]/50" data-testid="reviews-empty">Reviews for this style are coming in — check the community feed.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {reviews.map((r) => (
                <Reveal key={r.id}>
                  <div className="bg-[#F7F3F0] border border-[#2D2D2D]/10 p-7" data-testid={`product-review-${r.id}`}>
                    <div className="flex items-center justify-between">
                      <Stars rating={r.rating} size={13} />
                      {r.verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#c98d92]">
                          <Check size={12} weight="bold" /> Verified buyer
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 font-display text-lg tracking-tight">{r.title}</h3>
                    <p className="mt-2 text-sm text-[#2D2D2D]/60 leading-relaxed">{r.text}</p>
                    <p className="mt-4 text-xs font-bold">{r.name} <span className="font-normal text-[#2D2D2D]/40">· {r.location}</span></p>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-20 md:py-28" data-testid="related-products-section">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <h2 className="font-display uppercase tracking-tight text-3xl md:text-5xl mb-12">Complete the Kit</h2>
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
            className="fixed bottom-0 inset-x-0 z-40 bg-[#F7F3F0]/90 backdrop-blur-xl border-t border-[#2D2D2D]/10 shadow-[0_-20px_40px_rgba(45,45,45,0.08)]"
            data-testid="sticky-add-to-cart"
          >
            <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-3.5 flex items-center gap-4">
              <img src={galleryImages[0]} alt="" className="hidden sm:block h-12 w-10 object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm truncate">{product.title}</p>
                <p className="text-xs text-[#2D2D2D]/50">
                  {formatPrice(product.price)}{colour ? ` · ${colour}` : ''}{size ? ` · Size ${size}` : ''}
                </p>
              </div>
              <div className="hidden md:flex gap-1.5">
                {product.sizes.slice(0, 5).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    data-testid={`sticky-size-${s.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`px-3 py-2 text-xs font-bold border transition-colors ${size === s ? 'bg-[#2D2D2D] text-[#F7F3F0] border-[#2D2D2D]' : 'border-[#2D2D2D]/15 hover:border-[#E8B4B8]'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={() => add()}
                data-testid="sticky-add-to-cart-button"
                className="rounded-full bg-[#2D2D2D] text-[#F7F3F0] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#E8B4B8] hover:text-[#2D2D2D] transition-colors flex items-center gap-2"
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
