import React, { useEffect, useState } from 'react';
import { getProducts } from '@/lib/api';
import { LineReveal, Overline, Reveal } from '@/components/site/Reveal';
import { ProductCard } from '@/components/site/ProductCard';

const CATEGORIES = [
  { key: null, label: 'All' },
  { key: 'leggings', label: 'Leggings' },
  { key: 'bras', label: 'Sports Bras' },
  { key: 'shorts', label: 'Sculpt Shorts' },
  { key: 'accessories', label: 'Accessories' },
];

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProducts(category ? { category } : {})
      .then((d) => setProducts(d.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div data-testid="shop-page">
      <section className="pt-20 md:pt-28 pb-12 px-6 md:px-10 max-w-[1400px] mx-auto">
        <Reveal><Overline>The full collection</Overline></Reveal>
        <LineReveal className="mt-4" lineClassName="font-display uppercase tracking-tight text-5xl md:text-7xl" lines={['Shop All']} />
        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-wrap gap-2" data-testid="shop-category-filters">
            {CATEGORIES.map((c) => (
              <button
                key={c.label}
                onClick={() => setCategory(c.key)}
                data-testid={`shop-filter-${c.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-colors duration-300 border ${
                  category === c.key
                    ? 'bg-[#2D2D2D] text-[#F7F3F0] border-[#2D2D2D]'
                    : 'bg-transparent text-[#2D2D2D] border-[#2D2D2D]/20 hover:border-[#E8B4B8] hover:text-[#c98d92]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </Reveal>
      </section>
      <section className="px-6 md:px-10 max-w-[1400px] mx-auto pb-24 md:pb-32">
        {loading ? (
          <div className="py-24 text-center text-sm uppercase tracking-[0.2em] text-[#2D2D2D]/40" data-testid="shop-loading">Loading…</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" data-testid="shop-product-grid">
            {products.map((p, i) => (
              <Reveal key={p.handle} delay={0.05 * (i % 4)} className={i % 2 === 1 ? 'lg:mt-14' : ''}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
