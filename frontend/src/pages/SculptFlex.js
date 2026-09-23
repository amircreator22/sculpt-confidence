import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, ArrowsOutCardinal, CaretLeft, CaretRight, Check, Drop, Eye, Feather, LockSimple,
  Package, ShieldCheck, Star, Truck, ArrowCounterClockwise,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import { formatPrice, getProducts } from '@/lib/api';
import { Overline, Reveal, Stars } from '@/components/site/Reveal';
import { ProductCard } from '@/components/site/ProductCard';
import { ColourSwatches } from '@/components/site/ProductGallery';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const IMG = {
  infographic: '/sculptflex/img1.png',
  portrait: '/sculptflex/img2.png',
  back: '/sculptflex/img3.png',
  front: '/sculptflex/img4.png',
  lunge: '/sculptflex/img5.png',
};

const PRODUCT = {
  handle: 'sculptflex-contour-leggings',
  title: 'SculptFlex™ Contour Leggings',
  price: 39.99,
  compare_at: 54.99,
  images: [IMG.front, IMG.portrait],
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
  variant_id: null,
};

const COLOURS = [
  { name: 'Obsidian Black', hex: '#111111', img: '/sculptflex/colours/black.png' },
  { name: 'Charcoal Grey', hex: '#5A5A5A', img: '/sculptflex/img4.png' },
  { name: 'Mocha Brown', hex: '#6F4E37', img: '/sculptflex/colours/mocha.png' },
  { name: 'Deep Navy', hex: '#1B2951', img: '/sculptflex/colours/navy.png' },
];

const FEATURES = [
  { icon: Eye, label: 'Squat Proof' },
  { icon: Drop, label: 'Sweat Wicking' },
  { icon: Feather, label: 'Seamless Comfort' },
  { icon: ArrowsOutCardinal, label: 'Four-Way Stretch' },
];

const REVIEWS = [
  { name: 'Amelia R.', location: 'Manchester', rating: 5, title: 'Confidence in legging form', text: 'The contour panels genuinely lift. I have never had so many compliments at the gym — and they stay put through every single squat.', img: IMG.front },
  { name: 'Sofia K.', location: 'London', rating: 5, title: 'Better than my £90 pair', text: 'I own Lululemon and Alo and honestly reach for these more. The high waist smooths everything without feeling tight.', img: IMG.portrait },
  { name: 'Priya M.', location: 'Leeds', rating: 5, title: 'Squat-proof is real', text: 'Tested under harsh gym lighting at full depth. Nothing shows. The seamless fabric feels like a second skin.', img: IMG.back },
  { name: 'Chloe T.', location: 'Bristol', rating: 5, title: 'From gym to errands', text: 'Wore them for a morning lift, then brunch, then a long walk. Zero adjusting, zero rolling down. All-day comfort is not a myth.', img: IMG.lunge },
];

const UGC = [
  { before: IMG.back, after: IMG.lunge, name: '@jade.glutes', caption: '8 weeks of glute days in SculptFlex™' },
  { before: IMG.portrait, after: IMG.front, name: '@megan.moves', caption: 'Everyday confidence, zero see-through' },
  { before: IMG.lunge, after: IMG.back, name: '@chloe.strong', caption: '12-week strength journey' },
];

const FAQS = [
  { q: 'Are SculptFlex™ leggings really squat proof?', a: 'Yes. The dense double-knit seamless fabric is tested to full squat depth under bright studio lighting. 100% confidence in every move.' },
  { q: 'How does the sizing run?', a: 'True to size with four-way stretch. Between sizes, size down for a more sculpting compression fit or up for relaxed everyday comfort.' },
  { q: 'What makes the contour design different?', a: 'Strategic contour panels and a glute-lifting scrunch seam are mapped to your natural shape, enhancing your curves without padding or digging in.' },
  { q: 'Can I wear them all day?', a: 'That is exactly what they are built for. Ultra-soft, sweat-wicking, seamless fabric keeps you comfortable from morning workouts to evening errands.' },
  { q: 'What is the returns policy?', a: '30 days, no questions asked. Unworn with tags on for a full refund; size exchanges are always free with prepaid return postage.' },
];

const useCountdown = () => {
  const [time, setTime] = useState('--:--:--');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(14, 0, 0, 0);
      if (now > target) target.setDate(target.getDate() + 1);
      const diff = target - now;
      const h = String(Math.floor(diff / 3.6e6)).padStart(2, '0');
      const m = String(Math.floor((diff % 3.6e6) / 6e4)).padStart(2, '0');
      const s = String(Math.floor((diff % 6e4) / 1000)).padStart(2, '0');
      setTime(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
};

const ParallaxImage = ({ src, alt, className = '', position = 'center' }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-[120%] w-full object-cover"
        style={{ y, objectPosition: position }}
      />
    </div>
  );
};

export default function SculptFlex() {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [size, setSize] = useState(null);
  const [colour, setColour] = useState('Charcoal Grey');
  const [reviewIdx, setReviewIdx] = useState(0);
  const [showSticky, setShowSticky] = useState(false);
  const [related, setRelated] = useState([]);
  const countdown = useCountdown();
  const shopRef = useRef(null);

  useEffect(() => {
    getProducts({ featured: true })
      .then((d) => setRelated(d.products.filter((p) => p.handle !== PRODUCT.handle).slice(0, 4)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 700);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const requireSize = () => {
    if (!size) {
      toast.error('Please choose a size first');
      shopRef.current?.scrollIntoView({ behavior: 'smooth' });
      return false;
    }
    return true;
  };

  const add = () => {
    if (!requireSize()) return;
    addItem({ ...PRODUCT, title: `${PRODUCT.title} — ${colour}` }, size);
    toast.success(`SculptFlex™ (${colour}, ${size}) added to bag`);
  };

  const buyNow = () => {
    if (!requireSize()) return;
    addItem({ ...PRODUCT, title: `${PRODUCT.title} — ${colour}` }, size);
    navigate('/checkout');
  };

  const scrollToShop = () => shopRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div data-testid="sculptflex-page" className="bg-white">

      {/* 1 — HERO */}
      <section className="relative h-[92svh] min-h-[560px] overflow-hidden bg-[#2D2D2D]" data-testid="sf-hero">
        <motion.img
          src={IMG.portrait}
          alt="Woman wearing SculptFlex Contour Leggings"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: 'center 20%' }}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D2D2D]/80 via-transparent to-[#2D2D2D]/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-end text-center pb-16 md:pb-24 px-6">
          <Reveal><Overline light>Sculptiva</Overline></Reveal>
          <Reveal delay={0.15}>
            <h1 className="mt-4 font-display font-medium uppercase tracking-tighter text-[#F7F3F0] text-4xl md:text-7xl leading-[0.95] max-w-5xl" data-testid="sf-hero-title">
              SculptFlex™ Contour Leggings
            </h1>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-4 text-[#E8B4B8] font-display text-xl md:text-3xl tracking-tight">"Confidence Starts Here"</p>
          </Reveal>
          <Reveal delay={0.45}>
            <button
              onClick={scrollToShop}
              data-testid="sf-hero-shop-now"
              className="mt-8 rounded-full bg-[#E8B4B8] text-[#2D2D2D] px-10 py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#F7F3F0] transition-colors duration-300"
            >
              Shop Now
            </button>
          </Reveal>
        </div>
      </section>

      {/* SHOP MODULE */}
      <section ref={shopRef} className="py-16 md:py-24 border-b border-[#2D2D2D]/10" data-testid="sf-shop-module">
        <div className="mx-auto max-w-[1300px] px-6 md:px-10 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <Reveal>
            <div className="relative overflow-hidden aspect-[4/5] bg-[#F7F3F0]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={colour}
                  src={COLOURS.find((c) => c.name === colour)?.img || IMG.front}
                  alt={`SculptFlex Contour Leggings in ${colour}`}
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  data-testid="sf-module-image"
                />
              </AnimatePresence>
              <span className="absolute left-5 top-5 bg-[#E8B4B8] text-[#2D2D2D] text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5">Save 27%</span>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <div className="flex items-center gap-3">
                <Stars rating={4.9} size={15} />
                <span className="text-xs text-[#2D2D2D]/50 font-semibold">4.9 · 312 reviews</span>
              </div>
              <h2 className="mt-3 font-display uppercase tracking-tight text-3xl md:text-4xl">SculptFlex™ Contour Leggings</h2>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-display text-3xl" data-testid="sf-price">{formatPrice(PRODUCT.price)}</span>
                <span className="text-lg text-[#2D2D2D]/40 line-through">{formatPrice(PRODUCT.compare_at)}</span>
              </div>
              <p className="mt-5 text-sm md:text-base text-[#2D2D2D]/70 leading-relaxed">
                Elevate your confidence. Strategic contour panels, high-waisted support and ultra-soft stretch fabric — for a sculpted, confident look in and out of the gym.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em]">Colour — <span className="text-[#c98d92]" data-testid="sf-colour-label">{colour}</span></p>
              <div className="mt-4">
                <ColourSwatches colours={COLOURS} value={colour} onChange={setColour} testIdPrefix="sf-colour" />
              </div>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em]">Size</p>
              <div className="mt-3 flex flex-wrap gap-2" data-testid="sf-size-selector">
                {PRODUCT.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    data-testid={`sf-size-${s.toLowerCase()}`}
                    className={`min-w-[52px] px-4 py-3 text-sm font-bold border transition-colors duration-300 ${size === s ? 'bg-[#2D2D2D] text-[#F7F3F0] border-[#2D2D2D]' : 'bg-white border-[#2D2D2D]/15 hover:border-[#E8B4B8]'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-6 flex items-center gap-3 bg-[#E8B4B8]/25 border border-[#E8B4B8] px-5 py-3.5" data-testid="sf-delivery-countdown">
                <Truck size={18} className="text-[#c98d92] shrink-0" />
                <p className="text-xs font-semibold text-[#2D2D2D]">
                  Order within <span className="font-display text-base text-[#c98d92] tabular-nums" data-testid="sf-countdown-timer">{countdown}</span> for same-day dispatch
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={add}
                  data-testid="sf-add-to-cart"
                  className="rounded-full bg-[#2D2D2D] text-[#F7F3F0] py-4 text-sm font-bold uppercase tracking-[0.12em] hover:bg-[#E8B4B8] hover:text-[#2D2D2D] transition-colors duration-300"
                >
                  Add To Cart
                </button>
                <button
                  onClick={buyNow}
                  data-testid="sf-buy-now"
                  className="rounded-full border-2 border-[#2D2D2D] text-[#2D2D2D] py-4 text-sm font-bold uppercase tracking-[0.12em] hover:bg-[#2D2D2D] hover:text-[#F7F3F0] transition-colors duration-300"
                >
                  Buy Now
                </button>
              </div>
              <p className="mt-3 text-center text-[11px] text-[#2D2D2D]/50" data-testid="sf-klarna-note">
                or 3 interest-free payments of <span className="font-bold">£13.33</span> with <span className="font-bold">Klarna</span> · Clearpay · PayPal
              </p>
              <div className="mt-6 grid grid-cols-3 gap-2" data-testid="sf-trust-badges">
                {[
                  { icon: Truck, label: 'Free UK ship £50+' },
                  { icon: ArrowCounterClockwise, label: '30-day returns' },
                  { icon: ShieldCheck, label: 'Secure checkout' },
                ].map((t) => (
                  <div key={t.label} className="flex flex-col items-center gap-2 bg-[#F7F3F0] border border-[#2D2D2D]/10 py-4 px-2 text-center">
                    <t.icon size={20} weight="light" className="text-[#c98d92]" />
                    <span className="text-[11px] font-semibold text-[#2D2D2D]/70">{t.label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 2 — SPLIT: DESIGNED TO FLATTER */}
      <section className="grid md:grid-cols-2" data-testid="sf-flatter">
        <ParallaxImage src={IMG.front} alt="Front view of SculptFlex leggings" className="aspect-[4/5] md:aspect-auto md:min-h-[90vh]" />
        <div className="flex items-center bg-[#F7F3F0] px-6 md:px-16 py-16 md:py-24">
          <div className="max-w-md">
            <Reveal><Overline>Contour technology</Overline></Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-4 font-display uppercase tracking-tight text-4xl md:text-6xl leading-[1.0]">Designed To Flatter</h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 text-[#2D2D2D]/70 leading-relaxed">
                Strategic contouring and seamless construction enhance your natural curves while providing all-day comfort. Panels are mapped to your shape — lifting, smoothing and sculpting exactly where you want it.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3 — FULL WIDTH: MOVE WITH CONFIDENCE */}
      <section className="relative h-[80svh] min-h-[480px] overflow-hidden" data-testid="sf-move">
        <ParallaxImage src={IMG.lunge} alt="Lunge in SculptFlex leggings" className="absolute inset-0 h-full" position="center 30%" />
        <div className="absolute inset-0 bg-[#2D2D2D]/35" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <Reveal>
            <h2 className="font-display font-medium uppercase tracking-tighter text-[#F7F3F0] text-4xl md:text-7xl" data-testid="sf-move-title">Move With Confidence</h2>
          </Reveal>
        </div>
      </section>

      {/* 4 — SPLIT: PREMIUM SCULPTING SUPPORT */}
      <section className="grid md:grid-cols-2" data-testid="sf-support">
        <div className="flex items-center bg-white px-6 md:px-16 py-16 md:py-24 order-2 md:order-1">
          <div className="max-w-md md:ml-auto">
            <Reveal><Overline>High-waisted hold</Overline></Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-4 font-display uppercase tracking-tight text-4xl md:text-6xl leading-[1.0]">Premium Sculpting Support</h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 text-[#2D2D2D]/70 leading-relaxed">
                High-waisted compression and ultra-soft stretch fabric provide a secure and flattering fit. The wide waistband smooths your midsection and stays exactly where you put it — no rolling, no digging.
              </p>
            </Reveal>
          </div>
        </div>
        <ParallaxImage src={IMG.back} alt="Back view of SculptFlex leggings" className="aspect-[4/5] md:aspect-auto md:min-h-[90vh] order-1 md:order-2" />
      </section>

      {/* 5 — FULL WIDTH: BUILT FOR EVERY WORKOUT */}
      <section className="relative overflow-hidden" data-testid="sf-built">
        <ParallaxImage src={IMG.infographic} alt="Built to Sculpt — feature infographic" className="h-[80svh] min-h-[520px]" position="center 25%" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D2D2D]/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 inset-x-0 px-6 md:px-10 pb-10 md:pb-14">
          <div className="mx-auto max-w-[1300px]">
            <Reveal>
              <h2 className="font-display font-medium uppercase tracking-tighter text-[#F7F3F0] text-4xl md:text-6xl" data-testid="sf-built-title">Built For Every Workout</h2>
              <p className="mt-3 max-w-md text-[#F7F3F0]/80 text-sm md:text-base leading-relaxed">
                From gym sessions to everyday wear, SculptFlex™ keeps you supported and comfortable.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 6 — FLOATING FEATURE CARDS */}
      <section className="relative overflow-hidden bg-[#2D2D2D]" data-testid="sf-features">
        <ParallaxImage src={IMG.lunge} alt="SculptFlex in training" className="h-[85svh] min-h-[560px]" position="center 20%" />
        <div className="absolute inset-0 bg-[#2D2D2D]/50" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
          <div className="mx-auto w-full max-w-[1300px]">
            <Reveal><Overline light>Engineered details</Overline></Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-3 font-display uppercase tracking-tight text-[#F7F3F0] text-3xl md:text-5xl max-w-xl">Every detail earns its place</h2>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {FEATURES.map((f, i) => (
                <Reveal key={f.label} delay={0.15 + i * 0.08}>
                  <div
                    className="backdrop-blur-xl bg-[#F7F3F0]/10 border border-[#F7F3F0]/25 p-6 md:p-8 text-[#F7F3F0] hover:bg-[#E8B4B8] hover:text-[#2D2D2D] hover:border-[#E8B4B8] transition-colors duration-500 group"
                    data-testid={`sf-feature-${f.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <f.icon size={30} weight="light" className="transition-transform duration-500 group-hover:-translate-y-1" />
                    <p className="mt-4 flex items-center gap-2 font-display text-lg md:text-xl tracking-tight">
                      <Check size={14} weight="bold" className="text-[#E8B4B8] group-hover:text-[#2D2D2D] transition-colors" />
                      {f.label}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER UGC */}
      <section className="py-20 md:py-28 bg-[#F7F3F0]" data-testid="sf-ugc">
        <div className="mx-auto max-w-[1300px] px-6 md:px-10">
          <Reveal><Overline>Real women, real progress</Overline></Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-4 font-display uppercase tracking-tight text-4xl md:text-6xl">The SculptFlex™ Effect</h2>
          </Reveal>
          <div className="mt-12 grid md:grid-cols-3 gap-4 md:gap-6">
            {UGC.map((u, i) => (
              <Reveal key={u.name} delay={0.1 * i}>
                <div className="group" data-testid={`sf-ugc-${i}`}>
                  <div className="relative grid grid-cols-2 overflow-hidden aspect-[4/3]">
                    <div className="relative overflow-hidden">
                      <img src={u.before} alt={`${u.name} before`} loading="lazy" className="absolute inset-0 h-full w-full object-cover grayscale-[35%] transition-transform duration-[1200ms] group-hover:scale-105" />
                      <span className="absolute left-3 top-3 bg-[#2D2D2D]/70 backdrop-blur text-[#F7F3F0] text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1">Before</span>
                    </div>
                    <div className="relative overflow-hidden border-l-2 border-[#E8B4B8]">
                      <img src={u.after} alt={`${u.name} after`} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
                      <span className="absolute right-3 top-3 bg-[#E8B4B8] text-[#2D2D2D] text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1">After</span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-bold">{u.name}</p>
                  <p className="text-xs text-[#2D2D2D]/50">{u.caption}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7 — LOVED BY WOMEN EVERYWHERE: REVIEW CAROUSEL */}
      <section className="relative overflow-hidden" data-testid="sf-reviews">
        <ParallaxImage src={IMG.portrait} alt="Woman in SculptFlex leggings" className="h-[90svh] min-h-[640px]" position="center 15%" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2D2D2D]/85 via-[#2D2D2D]/40 to-transparent" />
        <div className="absolute inset-0 flex items-center px-6 md:px-10">
          <div className="mx-auto w-full max-w-[1300px]">
            <Reveal><Overline light>312 five-star reviews</Overline></Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-3 font-display uppercase tracking-tight text-[#F7F3F0] text-3xl md:text-6xl max-w-2xl" data-testid="sf-reviews-title">
                Loved By Women Everywhere
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-10 max-w-xl bg-[#F7F3F0]/95 backdrop-blur p-8 md:p-10" data-testid="sf-review-carousel">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={reviewIdx}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Stars rating={REVIEWS[reviewIdx].rating} size={15} />
                    <h3 className="mt-4 font-display text-2xl tracking-tight">{REVIEWS[reviewIdx].title}</h3>
                    <p className="mt-3 text-sm md:text-base text-[#2D2D2D]/70 leading-relaxed">{REVIEWS[reviewIdx].text}</p>
                    <div className="mt-6 flex items-center gap-3">
                      <img src={REVIEWS[reviewIdx].img} alt={REVIEWS[reviewIdx].name} className="h-11 w-11 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-bold">{REVIEWS[reviewIdx].name}</p>
                        <p className="text-xs text-[#2D2D2D]/45">Verified buyer · {REVIEWS[reviewIdx].location}</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
                <div className="mt-8 flex items-center justify-between">
                  <div className="flex gap-2">
                    {REVIEWS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setReviewIdx(i)}
                        aria-label={`Review ${i + 1}`}
                        data-testid={`sf-review-dot-${i}`}
                        className={`h-2 rounded-full transition-all duration-300 ${i === reviewIdx ? 'w-8 bg-[#2D2D2D]' : 'w-2 bg-[#2D2D2D]/20 hover:bg-[#E8B4B8]'}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setReviewIdx((reviewIdx - 1 + REVIEWS.length) % REVIEWS.length)}
                      aria-label="Previous review"
                      data-testid="sf-review-prev"
                      className="h-10 w-10 rounded-full border border-[#2D2D2D]/20 flex items-center justify-center hover:bg-[#2D2D2D] hover:text-[#F7F3F0] transition-colors"
                    >
                      <CaretLeft size={16} weight="bold" />
                    </button>
                    <button
                      onClick={() => setReviewIdx((reviewIdx + 1) % REVIEWS.length)}
                      aria-label="Next review"
                      data-testid="sf-review-next"
                      className="h-10 w-10 rounded-full border border-[#2D2D2D]/20 flex items-center justify-center hover:bg-[#2D2D2D] hover:text-[#F7F3F0] transition-colors"
                    >
                      <CaretRight size={16} weight="bold" />
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28" data-testid="sf-faq">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal><Overline>Good to know</Overline></Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-4 mb-12 font-display uppercase tracking-tight text-4xl md:text-5xl">Frequently Asked Questions</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <Accordion type="single" collapsible>
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={`sf-faq-${i}`} className="border-[#2D2D2D]/10">
                  <AccordionTrigger className="text-left font-display text-lg tracking-tight hover:text-[#c98d92] py-5" data-testid={`sf-faq-q-${i}`}>
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-[#2D2D2D]/60 leading-relaxed pb-5">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="mt-8 flex items-center gap-3 text-xs text-[#2D2D2D]/50">
              <Package size={16} className="text-[#c98d92]" />
              <span>Standard tracked UK delivery 2–3 working days · £3.95 or free over £50 · Express next-day £5.95</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="py-20 md:py-28 bg-[#F7F3F0] border-t border-[#2D2D2D]/10" data-testid="sf-related">
          <div className="mx-auto max-w-[1300px] px-6 md:px-10">
            <div className="flex items-end justify-between mb-12">
              <h2 className="font-display uppercase tracking-tight text-3xl md:text-5xl">Complete The Look</h2>
              <Link to="/shop" data-testid="sf-related-shop-all" className="hidden md:inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] border-b border-[#2D2D2D]/30 pb-1 hover:text-[#c98d92] hover:border-[#c98d92] transition-colors">
                Shop All <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => (
                <ProductCard key={p.handle} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8 — FINAL CONVERSION */}
      <section className="relative overflow-hidden" data-testid="sf-final">
        <ParallaxImage src={IMG.back} alt="SculptFlex leggings back view" className="h-[85svh] min-h-[560px]" position="center 25%" />
        <div className="absolute inset-0 bg-[#2D2D2D]/55" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <Reveal>
            <h2 className="font-display font-medium uppercase tracking-tighter text-[#F7F3F0] text-4xl md:text-7xl leading-[0.95]" data-testid="sf-final-title">
              Feel Strong.<br />Look Incredible.
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-5 text-[#F7F3F0]/80 text-sm md:text-lg max-w-md">
              Join thousands of women choosing SculptFlex™ every day.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={add}
                data-testid="sf-final-add-to-cart"
                className="rounded-full bg-[#E8B4B8] text-[#2D2D2D] px-10 py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#F7F3F0] transition-colors duration-300"
              >
                Add To Cart — £39.99
              </button>
              <button
                onClick={buyNow}
                data-testid="sf-final-buy-now"
                className="rounded-full border-2 border-[#F7F3F0] text-[#F7F3F0] px-10 py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#F7F3F0] hover:text-[#2D2D2D] transition-colors duration-300"
              >
                Buy Now
              </button>
            </div>
          </Reveal>
          <Reveal delay={0.4}>
            <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-[#F7F3F0]/60 flex items-center gap-2">
              <Star size={12} weight="fill" className="text-[#E8B4B8]" /> 4.9 rated · Free UK shipping over £50 · Klarna available
            </p>
          </Reveal>
        </div>
      </section>

      {/* STICKY ADD TO CART */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-[#2D2D2D]/10 shadow-[0_-20px_40px_rgba(45,45,45,0.08)]"
            data-testid="sf-sticky-atc"
          >
            <div className="mx-auto max-w-[1300px] px-4 md:px-10 py-3 flex items-center gap-3">
              <img src={IMG.front} alt="" className="h-12 w-10 object-cover hidden sm:block" />
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm truncate">SculptFlex™ Contour Leggings</p>
                <p className="text-xs text-[#2D2D2D]/50">
                  £39.99{size ? ` · ${size}` : ''} · {colour}
                </p>
              </div>
              <div className="hidden md:flex gap-1.5">
                {PRODUCT.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    data-testid={`sf-sticky-size-${s.toLowerCase()}`}
                    className={`px-3 py-2 text-xs font-bold border transition-colors ${size === s ? 'bg-[#2D2D2D] text-[#F7F3F0] border-[#2D2D2D]' : 'border-[#2D2D2D]/15 hover:border-[#E8B4B8]'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={add}
                data-testid="sf-sticky-add-button"
                className="rounded-full bg-[#2D2D2D] text-[#F7F3F0] px-6 md:px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#E8B4B8] hover:text-[#2D2D2D] transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <LockSimple size={14} weight="bold" /> Add To Cart
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
