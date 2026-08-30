import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { LineReveal, Overline, Reveal } from '@/components/site/Reveal';
import { Marquee } from '@/components/site/Marquee';
import { EmailCapture } from '@/components/site/EmailCapture';

const ABOUT_IMG = 'https://images.unsplash.com/photo-1770026136858-6f12670dd131?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwzfHx3b21hbiUyMHdlYXJpbmclMjBkYXJrJTIwc3BvcnRzJTIwYnJhJTIwZ3ltfGVufDB8fHx8MTc4ODEzMTQ3OXww&ixlib=rb-4.1.0&q=85';
const STUDIO_IMG = 'https://images.unsplash.com/photo-1595770022233-e0612bf561b4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwyfHx3b21hbiUyMGFjdGl2ZXdlYXIlMjBzdHVkaW8lMjBwb3J0cmFpdHxlbnwwfHx8fDE3ODgxMzE0Nzl8MA&ixlib=rb-4.1.0&q=85';

const STATS = [
  { value: '40K+', label: 'Women in the community' },
  { value: '4.9', label: 'Average review rating' },
  { value: '1200+', label: 'Verified five-star reviews' },
  { value: '100%', label: 'Squat-proof tested fabric' },
];

export default function About() {
  const navigate = useNavigate();
  return (
    <div data-testid="about-page">
      <section className="relative overflow-hidden bg-[#2D2D2D]">
        <img src={ABOUT_IMG} alt="Confidence Sculpt community member training" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2D2D2D]/90 via-[#2D2D2D]/40 to-transparent" />
        <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 py-28 md:py-44">
          <Reveal><Overline light>Our story</Overline></Reveal>
          <LineReveal
            className="mt-4 max-w-4xl"
            lineClassName="font-display uppercase tracking-tight text-5xl md:text-7xl text-[#F7F3F0] leading-[1.0]"
            lines={['Built by women', 'who were tired of', 'see-through leggings']}
          />
          <Reveal delay={0.4}>
            <p className="mt-6 max-w-lg text-[#F7F3F0]/70 leading-relaxed">
              Confidence Sculpt started in a Manchester gym in 2024 with one frustration: activewear that promised everything and delivered a see-through squat. So we made our own — and built a community around it.
            </p>
          </Reveal>
        </div>
      </section>

      <Marquee items={['Confidence First', 'Community Strong', 'Real Results', 'More Than Leggings']} />

      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <Reveal className="relative overflow-hidden aspect-[4/5] order-2 md:order-1">
            <img src={STUDIO_IMG} alt="Woman in Confidence Sculpt studio portrait" loading="lazy" className="absolute inset-0 h-full w-full object-cover hover:scale-105 transition-transform duration-[1400ms]" />
          </Reveal>
          <div className="order-1 md:order-2">
            <Reveal><Overline>What we believe</Overline></Reveal>
            <LineReveal className="mt-4" lineClassName="font-display uppercase tracking-tight text-4xl md:text-6xl leading-[1.02]" lines={['Confidence is', 'the best outfit']} />
            <Reveal delay={0.25}>
              <div className="mt-8 space-y-6 text-[#2D2D2D]/70 leading-relaxed">
                <p>
                  We design every piece around one question: how will she feel when she catches herself in the mirror? If the answer isn't "powerful", it doesn't ship.
                </p>
                <p>
                  Our fabrics are tested by our own community — 40,000+ women who squat, sprint, stretch and live in Confidence Sculpt. Their feedback shapes every seam, every scrunch, every drop.
                </p>
                <p>
                  This isn't fast fashion. It's slow, deliberate activewear for women building something — strength, health, confidence, themselves.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.35}>
              <button
                onClick={() => navigate('/shop')}
                data-testid="about-shop-button"
                className="group mt-10 rounded-full bg-[#2D2D2D] text-[#F7F3F0] px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#E8B4B8] hover:text-[#2D2D2D] transition-colors duration-300 inline-flex items-center gap-3"
              >
                Shop the Collection
                <ArrowRight size={16} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-[#2D2D2D] text-[#F7F3F0] py-20 md:py-28" data-testid="about-stats">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={0.1 * i}>
              <div className="text-center">
                <p className="font-display text-5xl md:text-6xl text-[#E8B4B8]">{s.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#F7F3F0]/50">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <EmailCapture source="about" />
    </div>
  );
}
