import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from '@phosphor-icons/react';
import { LineReveal, Overline, Reveal } from '@/components/site/Reveal';
import { Marquee } from '@/components/site/Marquee';
import { EmailCapture } from '@/components/site/EmailCapture';

const ABOUT_IMG = 'https://images.unsplash.com/photo-1770026136858-6f12670dd131?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwzfHx3b21hbiUyMHdlYXJpbmclMjBkYXJrJTIwc3BvcnRzJTIwYnJhJTIwZ3ltfGVufDB8fHx8MTc4ODEzMTQ3OXww&ixlib=rb-4.1.0&q=85';
const STUDIO_IMG = 'https://images.unsplash.com/photo-1595770022233-e0612bf561b4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwyfHx3b21hbiUyMGFjdGl2ZXdlYXIlMjBzdHVkaW8lMjBwb3J0cmFpdHxlbnwwfHx8fDE3ODgxMzE0Nzl8MA&ixlib=rb-4.1.0&q=85';

const PROMISE = [
  { title: 'Confidence over perfection', text: 'We design for how you feel, not how a trend says you should look.' },
  { title: 'Comfort over compromise', text: 'If it digs in, rides up or shows through, it never ships.' },
  { title: 'Quality over hype', text: 'Slow, deliberate activewear built to last years, not seasons.' },
  { title: 'Real women over unrealistic standards', text: 'Our community is the campaign — every body, every level, every journey.' },
  { title: 'Long-term trust over short-term sales', text: "We'd rather earn your loyalty than chase a quick conversion." },
];

const BELIEFS = ["Confidence isn't a size.", "Confidence isn't a trend.", "Confidence isn't something you earn.", 'Confidence starts with how you feel.'];

const SERVE = [
  'Want to feel confident in their own skin',
  'Want activewear that flatters naturally',
  'Value comfort and quality',
  'Appreciate authenticity',
  'Are building a healthier, stronger version of themselves',
];

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
          <Reveal><Overline light>Our mission</Overline></Reveal>
          <LineReveal
            className="mt-4 max-w-4xl"
            lineClassName="font-display uppercase tracking-tight text-5xl md:text-7xl text-[#F7F3F0] leading-[1.0]"
            lines={['Confidence', 'Starts Here.']}
          />
          <Reveal delay={0.4}>
            <p className="mt-6 max-w-lg text-[#F7F3F0]/70 leading-relaxed" data-testid="about-mission-statement">
              We exist for one simple reason: to help women feel confident in their own skin. Not just professional athletes or fitness influencers — every woman deserves activewear that makes her feel comfortable, supported and confident from the moment she puts it on.
            </p>
          </Reveal>
        </div>
      </section>

      <Marquee items={['Confidence Over Perfection', 'Comfort Over Compromise', 'Quality Over Hype', 'Real Women Over Unrealistic Standards']} />

      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <Reveal className="relative overflow-hidden aspect-[4/5] order-2 md:order-1">
            <img src={STUDIO_IMG} alt="Woman in Confidence Sculpt studio portrait" loading="lazy" className="absolute inset-0 h-full w-full object-cover hover:scale-105 transition-transform duration-[1400ms]" />
          </Reveal>
          <div className="order-1 md:order-2">
            <Reveal><Overline>Our philosophy</Overline></Reveal>
            <LineReveal className="mt-4" lineClassName="font-display uppercase tracking-tight text-4xl md:text-6xl leading-[1.02]" lines={['The best activewear', "improves how", 'you feel']} />
            <Reveal delay={0.25}>
              <div className="mt-8 space-y-6 text-[#2D2D2D]/70 leading-relaxed">
                <p>
                  We are not trying to create unrealistic beauty standards, and we are not trying to convince you to change who you are. We design products that celebrate and enhance natural confidence through flattering fits, thoughtful design and everyday comfort.
                </p>
                <p>
                  Whether you're training at the gym, walking the dog, running errands or starting your fitness journey, our goal is simple: to create pieces that help you feel your best every day.
                </p>
                <p>
                  Every fabric is tested by our own community — 40,000+ women who squat, sprint, stretch and live in Confidence Sculpt. Their feedback shapes every seam, every scrunch, every drop.
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

      <section className="bg-white border-y border-[#2D2D2D]/10 py-24 md:py-32" data-testid="about-promise-section">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <Reveal><Overline>Our promise</Overline></Reveal>
          <LineReveal className="mt-4 mb-14" lineClassName="font-display uppercase tracking-tight text-4xl md:text-6xl" lines={['What we will', 'always stand for']} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROMISE.map((p, i) => (
              <Reveal key={p.title} delay={0.08 * i}>
                <div className="border border-[#2D2D2D]/10 p-8 h-full hover:border-[#E8B4B8] transition-colors duration-500" data-testid={`promise-${i}`}>
                  <span className="h-9 w-9 rounded-full bg-[#E8B4B8]/25 flex items-center justify-center">
                    <Check size={16} weight="bold" className="text-[#c98d92]" />
                  </span>
                  <h3 className="mt-5 font-display text-xl tracking-tight">{p.title}</h3>
                  <p className="mt-2 text-sm text-[#2D2D2D]/60 leading-relaxed">{p.text}</p>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.4}>
              <div className="bg-[#E8B4B8] p-8 h-full flex flex-col justify-between" data-testid="promise-tagline-card">
                <p className="font-display uppercase tracking-tight text-2xl text-[#2D2D2D] leading-tight">Never aggressive sales. Never unrealistic claims. Never shame.</p>
                <p className="mt-6 text-sm text-[#2D2D2D]/70">Just support for feeling stronger, more comfortable and more confident in everyday life.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-[#2D2D2D] text-[#F7F3F0] py-24 md:py-32" data-testid="about-beliefs-section">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 grid md:grid-cols-2 gap-12 md:gap-20">
          <div>
            <Reveal><Overline light>We believe</Overline></Reveal>
            <div className="mt-8 space-y-5">
              {BELIEFS.map((b, i) => (
                <Reveal key={b} delay={0.1 * i}>
                  <p className={`font-display uppercase tracking-tight text-2xl md:text-4xl leading-tight ${i === BELIEFS.length - 1 ? 'text-[#E8B4B8]' : 'text-[#F7F3F0]/80'}`}>{b}</p>
                </Reveal>
              ))}
            </div>
          </div>
          <div>
            <Reveal><Overline light>Who we serve</Overline></Reveal>
            <Reveal delay={0.15}>
              <p className="mt-8 text-[#F7F3F0]/70 leading-relaxed">We make activewear for women who:</p>
            </Reveal>
            <ul className="mt-6 space-y-4">
              {SERVE.map((s, i) => (
                <Reveal key={s} delay={0.1 + 0.08 * i}>
                  <li className="flex items-start gap-3 text-[#F7F3F0]/80">
                    <Check size={18} weight="bold" className="text-[#E8B4B8] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{s}</span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28" data-testid="about-stats">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={0.1 * i}>
              <div className="text-center">
                <p className="font-display text-5xl md:text-6xl text-[#c98d92]">{s.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#2D2D2D]/50">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <EmailCapture source="about" />
    </div>
  );
}
