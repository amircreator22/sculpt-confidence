import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { getProducts } from '@/lib/api';
import { LineReveal, Overline, Reveal } from '@/components/site/Reveal';
import { ProductCard } from '@/components/site/ProductCard';
import { CURATED, CURATED_LINKS } from '@/data/curatedCollections';
import { COLLECTION_ARTICLE } from '@/data/blogPosts';

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
  const curated = CURATED[handle];
  const meta = curated
    ? { title: curated.title, blurb: curated.metaDesc, image: curated.image }
    : COLLECTIONS[handle] || COLLECTIONS.leggings;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (curated) {
      getProducts({})
        .then((d) => {
          const byHandle = Object.fromEntries((d.products || []).map((p) => [p.handle, p]));
          setProducts(curated.productHandles.map((h) => byHandle[h]).filter(Boolean));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      getProducts({ category: meta.category })
        .then((d) => setProducts(d.products))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);

  return (
    <div data-testid={`collection-page-${handle}`}>
      <section className="relative overflow-hidden bg-[#2D2D2D]">
        <img src={meta.image} alt={meta.title} className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2D2D2D]/90 via-[#2D2D2D]/50 to-transparent" />
        <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 py-24 md:py-36">
          {curated && (
            <Reveal>
              <nav className="mb-4 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#F7F3F0]/60" data-testid="collection-breadcrumb">
                {curated.breadcrumb.map((c, i) => (
                  <React.Fragment key={c.href}>
                    {i > 0 && <span className="text-[#F7F3F0]/30">/</span>}
                    {i < curated.breadcrumb.length - 1 ? (
                      <Link to={c.href} className="hover:text-[#E8B4B8] transition-colors">{c.name}</Link>
                    ) : (
                      <span className="text-[#F7F3F0]/90">{c.name}</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            </Reveal>
          )}
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

        {curated && (
          <div className="mt-20 grid gap-16 lg:grid-cols-[1.2fr_1fr]" data-testid="collection-editorial">
            <Reveal>
              <div>
                <Overline>Why this collection</Overline>
                <p className="mt-5 text-[#2D2D2D]/75 text-base md:text-lg leading-relaxed">{curated.body}</p>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div data-testid="collection-faq">
                <Overline>FAQs</Overline>
                <dl className="mt-5 divide-y divide-[#2D2D2D]/10">
                  {curated.faqs.map((f, i) => (
                    <div key={i} className="py-5" data-testid={`collection-faq-item-${i}`}>
                      <dt className="font-display uppercase tracking-tight text-lg text-[#2D2D2D]">{f.q}</dt>
                      <dd className="mt-2 text-sm text-[#2D2D2D]/70 leading-relaxed">{f.a}</dd>
                    </div>
                  ))}
                </dl>
                {COLLECTION_ARTICLE[handle]?.length > 0 && (
                  <div className="mt-6 flex flex-col items-start gap-3" data-testid="collection-learn-more">
                    {COLLECTION_ARTICLE[handle].map((a) => (
                      <Link
                        key={a.slug}
                        to={`/blog/${a.slug}`}
                        data-testid={`collection-learn-more-${a.slug}`}
                        className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-[#2D2D2D]"
                      >
                        Learn more: {a.label}
                        <ArrowRight size={14} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        )}

        <Reveal className="mt-20">
          <Overline>Shop by style</Overline>
          <div className="mt-5 flex flex-wrap gap-3" data-testid="collection-style-links">
            {CURATED_LINKS.filter((l) => l.handle !== handle).map((l) => (
              <Link
                key={l.handle}
                to={`/collections/${l.handle}`}
                data-testid={`style-link-${l.handle}`}
                className="rounded-full border border-[#2D2D2D]/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-[#F7F3F0] transition-colors duration-300"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-16">
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
