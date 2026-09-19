import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from '@phosphor-icons/react';
import { Overline, Reveal } from '@/components/site/Reveal';
import { BLOG_POSTS } from '@/data/blogPosts';

export default function BlogPost() {
  const { slug } = useParams();
  const post = BLOG_POSTS[slug];

  if (!post) {
    return (
      <div className="px-6 md:px-10 max-w-[800px] mx-auto py-32 text-center" data-testid="blog-post-not-found">
        <p className="font-display text-3xl uppercase tracking-tight text-[#2D2D2D]/60">Article not found</p>
        <Link to="/blog" className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-[#2D2D2D]">
          <ArrowLeft size={14} weight="bold" /> Back to the Journal
        </Link>
      </div>
    );
  }

  const allLinks = [post.primary, ...post.links];

  return (
    <article data-testid={`blog-post-${slug}`}>
      <section className="bg-[#2D2D2D]">
        <div className="mx-auto max-w-[820px] px-6 md:px-10 py-20 md:py-28">
          <Reveal>
            <nav className="mb-5 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#F7F3F0]/60" data-testid="blog-breadcrumb">
              <Link to="/" className="hover:text-[#E8B4B8] transition-colors">Home</Link>
              <span className="text-[#F7F3F0]/30">/</span>
              <Link to="/blog" className="hover:text-[#E8B4B8] transition-colors">Journal</Link>
            </nav>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#E8B4B8]">
              {new Date(post.datePublished).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-4 font-display uppercase tracking-tight text-4xl md:text-6xl text-[#F7F3F0] leading-[0.95]">{post.h1}</h1>
          </Reveal>
        </div>
      </section>

      <section className="px-6 md:px-10 max-w-[760px] mx-auto py-14 md:py-20">
        <Reveal>
          <img src={post.image} alt={post.h1} className="w-full rounded-2xl object-cover" />
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-10 text-[#2D2D2D]/80 text-base md:text-lg leading-relaxed" data-testid="blog-body">{post.body}</p>
        </Reveal>

        <Reveal className="mt-12">
          <Overline>Shop this guide</Overline>
          <div className="mt-4 flex flex-wrap gap-3" data-testid="blog-shop-links">
            {allLinks.map((l, i) => (
              <Link
                key={l.href}
                to={l.href}
                data-testid={`blog-link-${i}`}
                className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-300 ${i === 0 ? 'bg-[#2D2D2D] text-[#F7F3F0] hover:bg-[#E8B4B8] hover:text-[#2D2D2D]' : 'border border-[#2D2D2D]/20 text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-[#F7F3F0]'}`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-14">
          <Overline>Frequently asked questions</Overline>
          <dl className="mt-4 divide-y divide-[#2D2D2D]/10" data-testid="blog-faq">
            {post.faqs.map((f, i) => (
              <div key={i} className="py-5" data-testid={`blog-faq-item-${i}`}>
                <dt className="font-display uppercase tracking-tight text-lg text-[#2D2D2D]">{f.q}</dt>
                <dd className="mt-2 text-sm text-[#2D2D2D]/70 leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal className="mt-14">
          <Link to="/blog" data-testid="blog-back-link" className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-[#2D2D2D]">
            <ArrowLeft size={14} weight="bold" className="transition-transform duration-300 group-hover:-translate-x-1" /> Back to the Journal
          </Link>
        </Reveal>
      </section>
    </article>
  );
}
