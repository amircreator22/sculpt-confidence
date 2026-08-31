import React, { useState } from 'react';
import { ArrowRight, Check } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { subscribeNewsletter } from '../../lib/api';
import { Reveal, Overline, LineReveal } from './Reveal';

export const EmailCapture = ({ compact = false, source = 'homepage' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    try {
      const res = await subscribeNewsletter(email, source);
      setDone(true);
      toast.success(`${res.message} — code ${res.discount_code}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Please enter a valid email');
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <form onSubmit={submit} className="flex gap-2" data-testid="footer-newsletter-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email for 10% off"
          data-testid="footer-newsletter-input"
          className="w-full bg-transparent border border-[#F7F3F0]/25 px-4 py-3 text-sm text-[#F7F3F0] placeholder:text-[#F7F3F0]/40 focus:outline-none focus:border-[#E8B4B8] transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          data-testid="footer-newsletter-submit"
          className="shrink-0 bg-[#E8B4B8] text-[#2D2D2D] px-4 flex items-center justify-center hover:bg-[#F7F3F0] transition-colors"
          aria-label="Subscribe"
        >
          {done ? <Check size={16} weight="bold" /> : <ArrowRight size={16} weight="bold" />}
        </button>
      </form>
    );
  }

  return (
    <section className="bg-[#E8B4B8] py-24 md:py-32" data-testid="email-capture-section">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <Overline className="!text-[#2D2D2D]/60">Join the community — 10% off your first order</Overline>
        </Reveal>
        <LineReveal
          className="mt-6"
          lineClassName="font-display uppercase text-4xl md:text-6xl tracking-tight text-[#2D2D2D] leading-[1.02]"
          lines={['Confidence', 'Starts Here.']}
        />
        <Reveal delay={0.3}>
          <p className="mt-6 text-[#2D2D2D]/70 max-w-xl mx-auto">
            Early access to drops, member-only bundles and real encouragement from women on the same journey. No pressure, no spam — just support.
          </p>
        </Reveal>
        <Reveal delay={0.4}>
          {done ? (
            <div
              className="mt-10 inline-flex items-center gap-3 bg-[#2D2D2D] text-[#F7F3F0] px-8 py-4 rounded-full"
              data-testid="newsletter-success"
            >
              <Check size={18} weight="bold" className="text-[#E8B4B8]" />
              <span className="text-sm font-semibold">
                You're in. Use code <span className="text-[#E8B4B8] font-bold">CONFIDENCE10</span> at checkout.
              </span>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="mt-10 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
              data-testid="newsletter-form"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                data-testid="newsletter-email-input"
                className="flex-1 rounded-full bg-[#F7F3F0] border border-transparent px-6 py-4 text-sm text-[#2D2D2D] placeholder:text-[#2D2D2D]/40 focus:outline-none focus:border-[#2D2D2D]/30 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                data-testid="newsletter-submit-button"
                className="rounded-full bg-[#2D2D2D] text-[#F7F3F0] px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#F7F3F0] hover:text-[#2D2D2D] transition-colors duration-300 disabled:opacity-60"
              >
                {loading ? 'Joining…' : 'Claim 10% Off'}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
};
