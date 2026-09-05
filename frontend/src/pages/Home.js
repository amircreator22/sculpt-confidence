import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Barbell, Cloud, Drop, Eye, Play, Quotes, ShieldCheck, Stack, Truck,
} from '@phosphor-icons/react';
import { getProducts, getReviews } from '@/lib/api';
import { LineReveal, Overline, Reveal, Stars } from '@/components/site/Reveal';
import { Marquee } from '@/components/site/Marquee';
import { ProductCard } from '@/components/site/ProductCard';
import { EmailCapture } from '@/components/site/EmailCapture';

const HERO_IMG = 'https://images.unsplash.com/photo-1606903037631-f09fd0bd74b4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwyfHx3b21hbiUyMHdlYXJpbmclMjBwaW5rJTIwbGVnZ2luZ3MlMjBmaXRuZXNzfGVufDB8fHx8MTc4ODEzMTQ3OXww&ixlib=rb-4.1.0&q=85';
const BENTO_IMG = 'https://images.unsplash.com/photo-1595770022233-e0612bf561b4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwyfHx3b21hbiUyMGFjdGl2ZXdlYXIlMjBzdHVkaW8lMjBwb3J0cmFpdHxlbnwwfHx8fDE3ODgxMzE0Nzl8MA&ixlib=rb-4.1.0&q=85';
const BUNDLE_IMG = 'https://images.unsplash.com/photo-1595909315417-2edd382a56dc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwY2xvdGhpbmclMjBmbGF0JTIwbGF5fGVufDB8fHx8MTc4ODEzMTQ3OXww&ixlib=rb-4.1.0&q=85';

const BENEFITS = [
  { icon: Barbell, title: 'Glute Enhancing Design', text: 'A contour scrunch seam and targeted shading lift and shape your natural curves.' },
  { icon: Eye, title: 'Squat Proof Fabric', text: 'Dense double-knit fabric, tested to full depth. Nothing shows but your form.' },
  { icon: Stack, title: 'High Waist Compression', text: 'A sculpting high-rise waistband that holds you in without digging in.' },
  { icon: Cloud, title: 'Seamless Comfort', text: 'Buttery second-skin knits with no front seam. All-day, every-day comfort.' },
  { icon: Drop, title: 'Sweat Wicking Technology', text: 'Moisture is pulled away fast, keeping you cool through the hardest sets.' },
  { icon: Truck, title: 'Free UK Shipping Over £50', text: 'Fast, tracked delivery across the UK — free when you spend £50 or more.' },
];

const MARQUEE_ITEMS = ['Confidence Starts Here', 'Comfort Over Compromise', 'Quality Over Hype', 'Free UK Shipping Over £50', 'Real Women, Real Confidence'];

const UGC_CLIPS = [
  { img: 'https://images.unsplash.com/photo-1606902965551-dce093cda6e7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHdlYXJpbmclMjBwaW5rJTIwbGVnZ2luZ3MlMjBmaXRuZXNzfGVufDB8fHx8MTc4ODEzMTQ3OXww&ixlib=rb-4.1.0&q=85', handle: '@amelia.lifts', caption: 'Leg day in the Sculpt Leggings', views: '1.2M' },
  { img: 'https://images.unsplash.com/photo-1770026136858-6f12670dd131?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwzfHx3b21hbiUyMHdlYXJpbmclMjBkYXJrJTIwc3BvcnRzJTIwYnJhJTIwZ3ltfGVufDB8fHx8MTc4ODEzMTQ3OXww&ixlib=rb-4.1.0&q=85', handle: '@sofia.trains', caption: 'GRWM: Sculpt Bra + Shorts set', views: '847K' },
  { img: 'https://images.unsplash.com/photo-1617085606193-6b17105cff2a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwzfHx3b21hbiUyMHdlYXJpbmclMjBwaW5rJTIwbGVnZ2luZ3MlMjBmaXRuZXNzfGVufDB8fHx8MTc4ODEzMTQ3OXww&ixlib=rb-4.1.0&q=85', handle: '@priya.moves', caption: 'Squat-proof test: passed', views: '2.1M' },
  { img: 'https://images.unsplash.com/photo-1595770022233-e0612bf561b4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwyfHx3b21hbiUyMGFjdGl2ZXdlYXIlMjBzdHVkaW8lMjBwb3J0cmFpdHxlbnwwfHx8fDE3ODgxMzE0Nzl8MA&ixlib=rb-4.1.0&q=85', handle: '@chloe.strong', caption: '6 months. Same leggings.', views: '693K' },
  { img: 'https://images.unsplash.com/photo-1595909315417-2edd382a56dc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwY2xvdGhpbmclMjBmbGF0JTIwbGF5fGVufDB8fHx8MTc4ODEzMTQ3OXww&ixlib=rb-4.1.0&q=85', handle: '@jade.glutes', caption: 'Band bundle unboxing', views: '412K' },
];

const CHAPTERS = [
  { n: '01', title: 'Confidence Over Perfection', text: "Confidence isn't a size, a trend, or something you earn. It starts with how you feel — and that's what every piece we make is here to support." },
  { n: '02', title: 'Comfort Over Compromise', text: 'Flattering fits, thoughtful design and everyday comfort. Activewear should feel as good on the walk home as it does mid-workout.' },
  { n: '03', title: 'Real Women Over Unrealistic Standards', text: '40,000+ women wear Sculptiva at the gym, on dog walks, running errands and on day one of their journey. You are the campaign.' },
];

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const navigate = useNavigate();

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[620px] overflow-hidden bg-[#2D2D2D]" data-testid="hero-section">
      <motion.img
        src={HERO_IMG}
        alt="Confident woman wearing Sculptiva leggings"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ y: imgY, scale: imgScale }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2D2D2D]/80 via-[#2D2D2D]/10 to-transparent" />
      <motion.div style={{ opacity: fade }} className="absolute inset-0 flex flex-col justify-end">
        <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10 pb-10 md:pb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
          >
            <Overline light>Sculptiva — Move with Confidence</Overline>
          </motion.div>
          <LineReveal
            onLoad
            className="mt-5"
            lineClassName="font-display font-medium uppercase leading-[0.95] tracking-tighter text-[#F7F3F0] text-[11vw] sm:text-5xl md:text-[5.2vw]"
            lines={['Confidence', 'Starts Here.']}
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.9 }}
            className="mt-6 max-w-md text-[#F7F3F0]/80 text-sm md:text-base leading-relaxed"
          >
            Activewear that helps you feel comfortable, supported and confident from the moment you put it on — at the gym, on the school run, or day one of your journey.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.9 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <button
              onClick={() => navigate('/shop')}
              data-testid="hero-shop-best-sellers-button"
              className="group rounded-full bg-[#E8B4B8] text-[#2D2D2D] pl-8 pr-6 py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#F7F3F0] transition-colors duration-300 flex items-center gap-3"
            >
              Shop Best Sellers
              <ArrowRight size={16} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <Link
              to="/about"
              data-testid="hero-our-story-link"
              className="text-[#F7F3F0]/80 text-sm font-semibold uppercase tracking-[0.15em] border-b border-[#F7F3F0]/40 pb-1 hover:text-[#E8B4B8] hover:border-[#E8B4B8] transition-colors"
            >
              Our Story
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

const Benefits = () => (
  <section className="py-24 md:py-32" data-testid="benefits-section">
    <div className="mx-auto max-w-[1400px] px-6 md:px-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
        <div>
          <Reveal><Overline>Why Sculptiva</Overline></Reveal>
          <LineReveal
            className="mt-4"
            lineClassName="font-display uppercase tracking-tight text-4xl md:text-6xl text-[#2D2D2D]"
            lines={['Made to feel your best.']}
          />
        </div>
        <Reveal delay={0.2}>
          <p className="max-w-sm text-[#2D2D2D]/60 text-sm leading-relaxed">
            Six reasons women switch and never go back. Tested by real women, on real bodies, in real life — not just the gym.
          </p>
        </Reveal>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <Reveal className="md:col-span-4 md:row-span-2">
          <div className="relative h-full min-h-[420px] overflow-hidden group">
            <img src={BENTO_IMG} alt="Woman in Sculptiva activewear" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D2D2D]/60 to-transparent" />
            <p className="absolute bottom-6 left-6 font-display uppercase text-2xl text-[#F7F3F0] tracking-tight max-w-[200px]">
              Worn by 40,000+ women
            </p>
          </div>
        </Reveal>
        {BENEFITS.map((b, i) => (
          <Reveal key={b.title} delay={0.08 * i} className="md:col-span-4">
            <div className="bg-white border border-[#2D2D2D]/10 p-8 h-full group hover:border-[#E8B4B8] transition-colors duration-500" data-testid={`benefit-${b.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <b.icon size={28} weight="light" className="text-[#c98d92] transition-transform duration-500 group-hover:-translate-y-1" />
              <h3 className="mt-5 font-display text-xl tracking-tight">{b.title}</h3>
              <p className="mt-2 text-sm text-[#2D2D2D]/60 leading-relaxed">{b.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const Featured = ({ products }) => (
  <section className="py-24 md:py-32 bg-white border-y border-[#2D2D2D]/10" data-testid="featured-collection-section">
    <div className="mx-auto max-w-[1400px] px-6 md:px-10">
      <div className="flex items-end justify-between mb-14">
        <div>
          <Reveal><Overline>The Edit</Overline></Reveal>
          <LineReveal className="mt-4" lineClassName="font-display uppercase tracking-tight text-4xl md:text-6xl" lines={['Featured Collection']} />
        </div>
        <Reveal delay={0.2}>
          <Link to="/shop" data-testid="featured-shop-all-link" className="hidden md:inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] border-b border-[#2D2D2D]/30 pb-1 hover:text-[#c98d92] hover:border-[#c98d92] transition-colors">
            Shop All <ArrowUpRight size={14} weight="bold" />
          </Link>
        </Reveal>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((p, i) => (
          <Reveal key={p.handle} delay={0.08 * i} className={i % 2 === 1 ? 'lg:mt-14' : ''}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const BundleOffer = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const navigate = useNavigate();
  return (
    <section ref={ref} className="py-24 md:py-32" data-testid="bundle-offer-section">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 grid md:grid-cols-2 gap-8 md:gap-16 items-center">
        <div>
          <Reveal><Overline>Bundle &amp; Save</Overline></Reveal>
          <LineReveal className="mt-4" lineClassName="font-display uppercase tracking-tight text-4xl md:text-6xl leading-[1.0]" lines={['Train Smarter.', 'Save More.']} />
          <div className="mt-10 space-y-4">
            {[
              { title: 'Buy 2 Leggings, Get 1 Free', text: 'Mix any colours. The third pair is on us — automatically applied at checkout.' },
              { title: 'Bundle & Save up to 25%', text: 'Pair leggings with the Sculpt Bra and Band Bundle for the full kit at a better price.' },
            ].map((offer, i) => (
              <Reveal key={offer.title} delay={0.15 + i * 0.1}>
                <div className="flex gap-5 bg-white border border-[#2D2D2D]/10 p-6 hover:border-[#E8B4B8] transition-colors duration-500 group">
                  <span className="font-display text-3xl text-[#E8B4B8]">0{i + 1}</span>
                  <div>
                    <h3 className="font-display text-xl tracking-tight group-hover:text-[#c98d92] transition-colors">{offer.title}</h3>
                    <p className="mt-1 text-sm text-[#2D2D2D]/60">{offer.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.4}>
            <button
              onClick={() => navigate('/collections/leggings')}
              data-testid="bundle-build-button"
              className="mt-10 rounded-full bg-[#2D2D2D] text-[#F7F3F0] px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#E8B4B8] hover:text-[#2D2D2D] transition-colors duration-300"
            >
              Build Your Bundle
            </button>
          </Reveal>
        </div>
        <Reveal className="relative overflow-hidden aspect-[4/5]">
          <motion.img src={BUNDLE_IMG} alt="Sculptiva bundle flat lay" loading="lazy" className="absolute inset-0 h-[116%] w-full object-cover" style={{ y: imgY }} />
        </Reveal>
      </div>
    </section>
  );
};

const Manifesto = () => (
  <section className="bg-[#2D2D2D] text-[#F7F3F0] py-24 md:py-32" data-testid="manifesto-section">
    <div className="mx-auto max-w-[1400px] px-6 md:px-10">
      <Reveal><Overline light>Our promise</Overline></Reveal>
      <LineReveal className="mt-4 mb-16 md:mb-24" lineClassName="font-display uppercase tracking-tight text-4xl md:text-7xl text-[#F7F3F0]" lines={['More Than Leggings']} />
      <div className="grid md:grid-cols-3 gap-px bg-[#F7F3F0]/10 border border-[#F7F3F0]/10">
        {CHAPTERS.map((c, i) => (
          <Reveal key={c.n} delay={0.12 * i}>
            <div className="bg-[#2D2D2D] p-8 md:p-12 h-full group" data-testid={`manifesto-chapter-${c.n}`}>
              <span className="font-display text-6xl md:text-7xl text-[#E8B4B8]/40 group-hover:text-[#E8B4B8] transition-colors duration-700">{c.n}</span>
              <h3 className="mt-6 font-display text-2xl tracking-tight uppercase">{c.title}</h3>
              <p className="mt-4 text-sm text-[#F7F3F0]/60 leading-relaxed">{c.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const SocialProof = ({ reviews }) => (
  <section className="py-24 md:py-32" data-testid="social-proof-section">
    <div className="mx-auto max-w-[1400px] px-6 md:px-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
        <div>
          <Reveal><Overline>Real women, real reviews</Overline></Reveal>
          <LineReveal className="mt-4" lineClassName="font-display uppercase tracking-tight text-4xl md:text-6xl" lines={['Loved by the Community']} />
        </div>
        <Reveal delay={0.2}>
          <div className="flex items-center gap-3">
            <Stars rating={4.9} size={20} />
            <span className="text-sm text-[#2D2D2D]/60 font-semibold">4.9 from 1,200+ reviews</span>
          </div>
        </Reveal>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {reviews.slice(0, 3).map((r, i) => (
          <Reveal key={r.id} delay={0.1 * i}>
            <div className="bg-white border border-[#2D2D2D]/10 p-8 h-full flex flex-col hover:border-[#E8B4B8] transition-colors duration-500" data-testid={`review-card-${r.id}`}>
              <Quotes size={28} weight="fill" className="text-[#E8B4B8]" />
              <Stars rating={r.rating} size={14} className="mt-4" />
              <h3 className="mt-3 font-display text-lg tracking-tight">{r.title}</h3>
              <p className="mt-2 text-sm text-[#2D2D2D]/60 leading-relaxed flex-1">{r.text}</p>
              <div className="mt-6 flex items-center gap-3">
                <img src={r.image} alt={r.name} loading="lazy" className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-bold">{r.name}</p>
                  <p className="text-xs text-[#2D2D2D]/40">Verified buyer · {r.location}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const UGCStrip = () => (
  <section className="py-24 md:py-32 bg-white border-y border-[#2D2D2D]/10" data-testid="ugc-section">
    <div className="mx-auto max-w-[1400px] px-6 md:px-10 mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
      <div>
        <Reveal>
          <a href="https://www.instagram.com/sculptivaofficial" target="_blank" rel="noreferrer" data-testid="ugc-instagram-link" className="inline-block hover:opacity-70 transition-opacity">
            <Overline>@sculptivaofficial</Overline>
          </a>
        </Reveal>
        <LineReveal className="mt-4" lineClassName="font-display uppercase tracking-tight text-4xl md:text-6xl" lines={['As Seen On Your Feed']} />
      </div>
      <Reveal delay={0.2}>
        <p className="max-w-sm text-sm text-[#2D2D2D]/60 leading-relaxed">
          Tag #Sculptiva to be featured. Real clips from the community — no ads, no filters.
        </p>
      </Reveal>
    </div>
    <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 md:px-10 snap-x snap-mandatory" data-testid="ugc-gallery">
      {UGC_CLIPS.map((clip, i) => (
        <Reveal key={clip.handle} delay={0.06 * i} className="snap-start shrink-0">
          <a href="https://www.instagram.com/sculptivaofficial" target="_blank" rel="noreferrer" aria-label={`View ${clip.handle} on Instagram`} data-testid={`ugc-clip-link-${i}`}>
          <div className="relative w-[240px] md:w-[280px] aspect-[9/16] overflow-hidden group cursor-pointer" data-testid={`ugc-clip-${i}`}>
            <img src={clip.img} alt={clip.caption} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D2D2D]/70 via-transparent to-[#2D2D2D]/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="h-14 w-14 rounded-full bg-[#F7F3F0]/20 backdrop-blur-md border border-[#F7F3F0]/40 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                <Play size={20} weight="fill" className="text-[#F7F3F0] ml-0.5" />
              </span>
            </div>
            <div className="absolute bottom-0 inset-x-0 p-4">
              <p className="text-[#E8B4B8] text-xs font-bold">{clip.handle}</p>
              <p className="text-[#F7F3F0] text-sm mt-0.5 leading-snug">{clip.caption}</p>
              <p className="text-[#F7F3F0]/50 text-[11px] mt-1">{clip.views} views</p>
            </div>
          </div>
          </a>
        </Reveal>
      ))}
    </div>
  </section>
);

export default function Home() {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    getProducts({ featured: true }).then((d) => setProducts(d.products)).catch(() => {});
    getReviews().then((d) => setReviews(d.reviews)).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      <Hero />
      <Marquee items={MARQUEE_ITEMS} />
      <Benefits />
      <Featured products={products} />
      <BundleOffer />
      <Manifesto />
      <SocialProof reviews={reviews} />
      <UGCStrip />
      <EmailCapture source="homepage" />
    </div>
  );
}
