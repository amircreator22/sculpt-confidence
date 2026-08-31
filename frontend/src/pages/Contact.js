import React, { useState } from 'react';
import { Check, EnvelopeSimple, MapPin, Clock } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { sendContact } from '@/lib/api';
import { LineReveal, Overline, Reveal } from '@/components/site/Reveal';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await sendContact(form);
      setDone(true);
      toast.success(res.message);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong — please try again');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-white border border-[#2D2D2D]/15 px-5 py-4 text-sm focus:outline-none focus:border-[#E8B4B8] transition-colors';

  return (
    <div data-testid="contact-page">
      <section className="mx-auto max-w-[1400px] px-6 md:px-10 pt-20 md:pt-28 pb-24 grid lg:grid-cols-2 gap-12 lg:gap-20">
        <div>
          <Reveal><Overline>We're here to help</Overline></Reveal>
          <LineReveal className="mt-4" lineClassName="font-display uppercase tracking-tight text-5xl md:text-7xl leading-[1.0]" lines={['Talk to us']} />
          <Reveal delay={0.25}>
            <p className="mt-6 text-[#2D2D2D]/60 leading-relaxed max-w-md">
              Sizing questions, order help, collab requests or just want to share your progress pics — we read everything and reply within 24 hours.
            </p>
          </Reveal>
          <div className="mt-10 space-y-4">
            {[
              { icon: EnvelopeSimple, title: 'hello@sculptiva.co.uk', text: 'For orders, sizing and everything else' },
              { icon: Clock, title: 'Mon–Fri, 9am–6pm GMT', text: 'Average reply time: under 4 hours' },
              { icon: MapPin, title: 'Blackburn, United Kingdom', text: 'All orders ship from our UK warehouse' },
            ].map((c, i) => (
              <Reveal key={c.title} delay={0.1 * i}>
                <div className="flex gap-4 bg-white border border-[#2D2D2D]/10 p-5">
                  <c.icon size={22} weight="light" className="text-[#c98d92] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">{c.title}</p>
                    <p className="text-xs text-[#2D2D2D]/50 mt-0.5">{c.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={0.2}>
          <div className="bg-white border border-[#2D2D2D]/10 p-8 md:p-10">
            {done ? (
              <div className="py-16 text-center" data-testid="contact-success">
                <span className="mx-auto h-14 w-14 rounded-full bg-[#E8B4B8] flex items-center justify-center">
                  <Check size={24} weight="bold" className="text-[#2D2D2D]" />
                </span>
                <h2 className="mt-6 font-display uppercase tracking-tight text-3xl">Message sent</h2>
                <p className="mt-3 text-sm text-[#2D2D2D]/60">Thanks for reaching out — we'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4" data-testid="contact-form">
                <h2 className="font-display uppercase tracking-tight text-2xl mb-2">Send a message</h2>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} type="text" placeholder="Your name" required data-testid="contact-name-input" className={inputCls} />
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="Your email" required data-testid="contact-email-input" className={inputCls} />
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can we help?"
                  rows={6}
                  required
                  data-testid="contact-message-input"
                  className={`${inputCls} resize-none`}
                />
                <button
                  type="submit"
                  disabled={loading}
                  data-testid="contact-submit-button"
                  className="w-full rounded-full bg-[#2D2D2D] text-[#F7F3F0] py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#E8B4B8] hover:text-[#2D2D2D] transition-colors duration-300 disabled:opacity-60"
                >
                  {loading ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
