import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { LineReveal, Overline, Reveal } from '@/components/site/Reveal';
import { BLOG_POSTS, BLOG_ORDER } from '@/data/blogPosts';

export default function BlogIndex() {
  return (
    <div data-testid="blog-index-page">
      <section className="bg-[#2D2D2D]">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-24 md:py-32">
          <Reveal><Overline light>Journal</Overline></Reveal>
          <LineReveal className="mt-4" lineClassName="font-display uppercase tracking-tight text-5xl md:text-7xl text-[#F7F3F0]" lines={['The Sculptiva', 'Journal']} />
          <Reveal delay={0.25}>
            <p className="mt-5 max-w-md text-[#F7F3F0]/70 text-sm md:text-base leading-relaxed">
              Real, no-fluff guides to fabric, fit and construction from the Sculptiva team.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-6 md:px-10 max-w-[1400px] mx-auto py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-3" data-testid="blog-post-list">
          {BLOG_ORDER.map((slug, i) => {
            const post = BLOG_POSTS[slug];
            return (
              <Reveal key={slug} delay={0.08 * i}>
                <Link to={`/blog/${slug}`} data-testid={`blog-card-${slug}`} className="group block">
                  <div className="overflow-hidden rounded-2xl bg-[#EDE6E1]">
                    <img src={post.image} alt={post.h1} className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-[#2D2D2D]/40">
                    {new Date(post.datePublished).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <h2 className="mt-2 font-display uppercase tracking-tight text-2xl text-[#2D2D2D] group-hover:text-[#E8B4B8] transition-colors duration-300">{post.h1}</h2>
                  <p className="mt-2 text-sm text-[#2D2D2D]/70 leading-relaxed">{post.excerpt}</p>
                  <span className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#2D2D2D]">
                    Read more <ArrowRight size={14} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>
    </div>
  );
}
