import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { getProducts } from '@/lib/api';
import { LineReveal, Overline, Reveal } from '@/components/site/Reveal';
import { ProductCard } from '@/components/site/ProductCard';

const COLLECTIONS = {
  leggings: {
    category: 'leggings',
    title: 'Leggings',
    blurb: 'Squat-proof, glute-sculpting, high-waisted. The leggings our community was built on.',
    image: 'https://images.unsplash.com/photo-1606902965551-dce093cda6e7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHdlYXJpbmclMjBwaW5rJTIwbGVnZ2luZ3MlMjBmaXRuZXNzfGVufDB8fHx8MTc4ODEzMTQ3OXww&ixlib=rb-4.1.0&q=85',
  },
  'sports-bras': {
    category: 'bras',
    title: 'Sports Bras',
    blurb: 'Medium-support sculpting bras that hold you in and never hold you back.',
    image: 'https://images.unsplash.com/photo-1769196716871-39a0712fb037?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHw0fHx3b21hbiUyMHdlYXJpbmclMjBkYXJrJTIwc3BvcnRzJTIwYnJhJTIwZ3ltfGVufDB8fHx8MTc4ODEzMTQ3OXww&ixlib=rb-4.1.0&q=85',
  },
  'sculpt-shorts': {
    category: 'shorts',
    title: 'Sculpt Shorts',
    blurb: 'No front seam, no riding up, all sculpt. Built for leg day and beyond.',
    image: 'https://images.unsplash.com/photo-1617085606193-6b17105cff2a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwzfHx3b21hbiUyMHdlYXJpbmclMjBwaW5rJTIwbGVnZ2luZ3MlMjBmaXRuZXNzfGVufDB8fHx8MTc4ODEzMTQ3OXww&ixlib=rb-4.1.0&q=85',
  },
};

export default function Collection() {
  const { handle } = useParams();
  const meta = COLLECTIONS[handle] || COLLECTIONS.leggings;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProducts({ category: meta.category })
      .then((d) => setProducts(d.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [meta.category]);

  return (
    <div data-testid={`collection-page-${handle}`}>
      <section className="relative overflow-hidden bg-[#2D2D2D]">
        <img src={meta.image} alt={meta.title} className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2D2D2D]/90 via-[#2D2D2D]/50 to-transparent" />
        <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 py-24 md:py-36">
          <Reveal><Overline light>Collection</Overline></Reveal>
          <LineReveal className="mt-4" lineClassName="font-display uppercase tracking-tight text-5xl md:text-7xl text-[#F7F3F0]" lines={[meta.title]} />
          <Reveal delay={0.25}>
            <p className="mt-5 max-w-md text-[#F7F3F0]/70 text-sm md:text-base leading-relaxed">{meta.blurb}</p>
          </Reveal>
        </div>
      </section>
      <section className="px-6 md:px-10 max-w-[1400px] mx-auto py-16 md:py-24">
        {loading ? (
          <div className="py-24 text-center text-sm uppercase tracking-[0.2em] text-[#2D2D2D]/40" data-testid="collection-loading">Loading…</div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center" data-testid="collection-empty">
            <p className="font-display text-2xl uppercase tracking-tight text-[#2D2D2D]/60">New drops coming soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" data-testid="collection-product-grid">
            {products.map((p, i) => (
              <Reveal key={p.handle} delay={0.05 * (i % 4)} className={i % 2 === 1 ? 'lg:mt-14' : ''}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
        <Reveal className="mt-20">
          <Link
            to="/shop"
            data-testid="collection-shop-all-link"
            className="group inline-flex items-center gap-3 rounded-full bg-[#2D2D2D] text-[#F7F3F0] px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#E8B4B8] hover:text-[#2D2D2D] transition-colors duration-300"
          >
            Shop Everything
            <ArrowRight size={16} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
